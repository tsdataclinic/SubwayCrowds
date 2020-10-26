import pandas as pd
import numpy as np
import sys, logging
from datetime import datetime, timedelta
import matplotlib.pyplot as plt
import re
import os
import bisect
import io
import logging
import re
import requests


def interpolate_for_missing_stations(group):
    '''
    Filling missing entry and exit weights in cases of service change
    '''
    group['estimated_entries'] = group.estimated_entries.interpolate(method='linear')
    group['estimated_exits'] = group.estimated_exits.interpolate(method='linear')
    return group

def turnstile_weighted_entry_weights(ts,stop_order_merged):
    '''
    Creating weights for entry and exit for all combinations of route and direction at a stop based for every hour using turnstile exits. 
    '''
    
    ts['hour'] = ts.datetime.dt.hour
    
    ts = ts.groupby(['STATION','LINENAME','modified_linename','hour']).sum()[['estimated_entries','estimated_exits']].reset_index()
    stop_order = []
    for h in range(0,24):
        tmp = stop_order_merged.copy()
        tmp['hour'] = h
        stop_order.append(tmp)
    stop_order = pd.concat(stop_order,ignore_index=True,sort=False)
    exit_weighted_stop_weights = stop_order.merge(ts,how='left',right_on=['STATION','LINENAME','hour'],left_on=['id','LINENAME','hour'])
    exit_weighted_stop_weights = exit_weighted_stop_weights.sort_values(['route_id','hour','order']).groupby(['route_id','hour']).apply(interpolate_for_missing_stations)
    
    exit_weighted_stop_weights = exit_weighted_stop_weights.sort_values('order')
    exit_weighted_stop_weights['total_exits'] = exit_weighted_stop_weights.groupby(['route_id','hour'])['estimated_exits'].cumsum()
    min_exits = exit_weighted_stop_weights.groupby(['route_id','hour']).total_exits.min().reset_index().rename(columns={'total_exits':'min_exits'})
    max_exits = exit_weighted_stop_weights.groupby(['route_id','hour']).total_exits.max().reset_index().rename(columns={'total_exits':'max_exits'})
    exit_weighted_stop_weights = exit_weighted_stop_weights.merge(min_exits,on=['route_id','hour']).merge(max_exits,on=['route_id','hour']).sort_values(['route_id','hour','order'])
    exit_weighted_stop_weights['exits_before'] = exit_weighted_stop_weights.total_exits - exit_weighted_stop_weights.min_exits 
    exit_weighted_stop_weights['exits_after'] = exit_weighted_stop_weights.max_exits - exit_weighted_stop_weights.total_exits
    exit_weighted_stop_weights['north_bound_entry_weight'] = exit_weighted_stop_weights.exits_before/(exit_weighted_stop_weights.max_exits-exit_weighted_stop_weights.min_exits)
    exit_weighted_stop_weights['south_bound_entry_weight'] = 1 - exit_weighted_stop_weights.exits_before/(exit_weighted_stop_weights.max_exits-exit_weighted_stop_weights.min_exits)
    exit_weighted_stop_weights['direction_id'] = 1
    exit_weighted_stop_weights['trimmed_stop_id'] = [re.sub(r'(N|S)$','',x) for x in exit_weighted_stop_weights.stop_id]
    exit_weighted_stop_weights_north = exit_weighted_stop_weights.copy()
    exit_weighted_stop_weights_north['direction_id'] = 0
    
    stop_weights = pd.concat([exit_weighted_stop_weights,exit_weighted_stop_weights_north],ignore_index=True,sort=False)
    stop_weights['entry_weight'] = [s if d ==1 else n for d,s,n in zip(stop_weights.direction_id,stop_weights.south_bound_entry_weight,stop_weights.north_bound_entry_weight)]
    stop_weights['exit_weight'] = 1- stop_weights.entry_weight
    
    total_weight = stop_weights.groupby(['STATION','modified_linename','direction_id','hour']).sum()[['entry_weight','exit_weight']].reset_index().rename(columns={'entry_weight':'total_entry_weight','exit_weight':'total_exit_weight'})
    stop_weights = stop_weights.merge(total_weight,how='left',on=['STATION','modified_linename','direction_id','hour'])
    stop_weights['normalized_entry_weight'] = [x if x==y else x/y for x,y in zip(stop_weights.entry_weight,stop_weights.total_entry_weight)]
    stop_weights['normalized_exit_weight'] = [x if x==y else x/y for x,y in zip(stop_weights.exit_weight,stop_weights.total_exit_weight)]
    
    stop_weights.drop(columns=['exit_weight','entry_weight','total_entry_weight','total_exit_weight'], inplace=True)
    stop_weights.rename(columns={'normalized_entry_weight':'entry_weight','normalized_exit_weight':'exit_weight'},inplace=True)
    return stop_weights[['trimmed_stop_id','route_id','direction_id','hour','entry_weight','exit_weight']]


def get_schedule_with_weights(turnstile,clean_df,stop_order_merged):
    '''
    Adding entry and exit weights to the cleaned schedule data
    '''
    stop_weights = turnstile_weighted_entry_weights(turnstile, stop_order_merged)
    clean_df = clean_df[~(clean_df.route_id.isin(['SI','GS','FS','H','L']))]
    schedule = clean_df.merge(stop_weights,how='left',on=['hour','trimmed_stop_id','route_id','direction_id'])
    mean_weights_test = stop_weights.groupby(['trimmed_stop_id','hour','direction_id']).mean()[['entry_weight','exit_weight']]
    mean_weights_test.reset_index(inplace=True)
    schedule_missing = schedule[schedule.entry_weight.isna()].copy()
    schedule_not_missing = schedule[~schedule.entry_weight.isna()].copy()
    schedule_missing = schedule_missing.drop(columns=['entry_weight','exit_weight'])
    schedule_missing = schedule_missing.merge(mean_weights_test,how='left',on=['trimmed_stop_id','hour','direction_id'])
    schedule = pd.concat([schedule_not_missing,schedule_missing],ignore_index=True,sort=False)
    schedule.loc[schedule.entry_weight.isna(),['entry_weight','exit_weight']] = [0.5,0.5]
    return schedule


def merge_turnstile_schedule(turnstile_data,crosswalk,schedule):
    '''
    Merging cleaned Turnstile data and processed GTFS schedule data
    '''
    turnstile_data = turnstile_data.merge(crosswalk[['turnstile_station_name','turnstile_lines','gtfs_station_name','gtfs_lines','gtfs_stop_id']],how='left',left_on=['STATION','LINENAME'],right_on=['turnstile_station_name','turnstile_lines'])
    turnstile_data = turnstile_data[turnstile_data.gtfs_station_name.notnull()]
    turnstile_data = turnstile_data[turnstile_data.STATION.notnull()]
    turnstile_data = turnstile_data.drop_duplicates(subset=['datetime','STATION','gtfs_stop_id'])
    crowding = turnstile_data.merge(schedule,how='left',left_on=['gtfs_stop_id','datetime'],right_on=['trimmed_stop_id','time'])
    crowding.drop(['turnstile_station_name', 'turnstile_lines', 'trimmed_stop_id'],axis=1,inplace=True)
    return crowding


def get_people_waiting(df):
    '''
    Iterating through each station over time to get number of people waiting at the station
    '''
    waiting = [0]*len(df)
    train_entries = [0]*len(df)
    idx = 0
    for i,row in df.iterrows():
        if idx > 0:
            if row.time.date != prev_date:
                first_5am = True
                prev_date = row.time.date
            if (first_5am==True) & (row.hour_y >= 4) & (row.hour_y <= 6):
                waiting[idx] = max(0,waiting[idx-1] - train_entries[idx-1] + row.total_entries_since_last_train - row.total_exits_since_last_train)
                first_5am = False
            else:
                waiting[idx] = waiting[idx-1] - train_entries[idx-1] + row.total_entries_since_last_train
        else:
            cur_date = row.time.date
            prev_date = row.time.date
            first_5am = True
        
        train_entries[idx] = np.ceil(waiting[idx] * row.entry_weight)
        idx = idx +1
    df['waiting'] = waiting
    df['train_entries'] = train_entries
    
    return(df)

def get_train_crowd(df, entry_exit_ratio=1.1):
    '''
    Based on number of people waiting at the station, iterates along trip_id to get number of peopl entering and exiting from the train for crowd estimation
    '''
    crowd = [0]*len(df)
    exits = [0]*len(df)
    idx = 0 
    for i,row in df.iterrows():
        if idx > 0:
            exits_per_line = row.exit_weight if len(row.modified_linename) > 1 else 1
            exits[idx] = int(min(row.total_exits_before_next_train*exits_per_line*entry_exit_ratio,crowd[idx-1]))
            crowd[idx] = crowd[idx-1] - exits[idx] + row.train_entries
        else:
            exits[idx] = 0
            crowd[idx] = row.train_entries
        idx = idx +1

    exits[idx-1] = crowd[idx-1] + exits[idx-1]
    df['crowd'] = crowd
    df['train_exits'] = exits
    return(df)

def get_crowd_by_station_line(crowding, entry_exit_ratio=1.1):
    '''
    Function that takes in merged GTFS and turnstile data and returns crowd for each stop along each trip
    '''
    logging.getLogger().info("Starting")
    crowding = crowding[crowding.trip_id.notnull()]
    crowding = crowding.sort_values(['time'])
    
    crowding['total_entries_since_last_train'] = crowding.groupby(['STATION','LINENAME']).total_entries.diff().replace(to_replace=0,value=np.nan)
    crowding['total_exits_since_last_train'] = crowding.groupby(['STATION','LINENAME']).total_exits.diff().replace(to_replace=0,value=np.nan)
    crowding['total_exits_before_next_train'] = crowding.groupby(['STATION','LINENAME']).total_exits.diff(-1).replace(to_replace=0,value=np.nan)

    crowding['total_entries_since_last_train'] = crowding.groupby(['STATION','LINENAME']).total_entries_since_last_train.apply(lambda group: group.interpolate(method='ffill')).fillna(0).round()
    crowding['total_exits_since_last_train'] = crowding.groupby(['STATION','LINENAME']).total_exits_since_last_train.apply(lambda group: group.interpolate(method='ffill')).fillna(0).round()
    crowding['total_exits_before_next_train'] = crowding.groupby(['STATION','LINENAME']).total_exits_before_next_train.apply(lambda group: group.interpolate(method='bfill')).fillna(0).round().abs()
    
    crowding.loc[crowding.total_entries_since_last_train <0,'total_entries_since_last_train'] = 0
    crowding.loc[crowding.total_exits_since_last_train <0,'total_exits_since_last_train'] = 0
    crowding.loc[crowding.total_exits_before_next_train <0,'total_exits_before_next_train'] = 0
    
    crowding.loc[crowding.total_entries_since_last_train >1000,'total_entries_since_last_train'] = 0
    crowding.loc[crowding.total_exits_since_last_train > 1000,'total_exits_since_last_train'] = 0
    crowding.loc[crowding.total_exits_before_next_train > 1000,'total_exits_before_next_train'] = 0
    
    crowding = crowding.drop_duplicates()
    
    logging.getLogger().info("Getting people waiting at stations")
    crowding = crowding.groupby(['STATION','LINENAME']).apply(get_people_waiting)
    
    logging.getLogger().info("Getting crowd per train")
    crowding = crowding.groupby('uid').apply(get_train_crowd, entry_exit_ratio=entry_exit_ratio)

    logging.getLogger().info("Finishing")
    return crowding


def fill_missing_hours(df):
    tmp = df.set_index('hour').reindex(range(0, 24)).reset_index()
    tmp = tmp.fillna(0)
    return tmp


def get_hourly_averages(crowd_by_station_line, clean_stop_routes):
    crowd_by_station_line = crowd_by_station_line.groupby(['STATION','route_id','direction_id','time','gtfs_stop_id']).mean()['crowd'].reset_index()
    crowd_by_station_line['route_stop'] = crowd_by_station_line['route_id'] + '_' + crowd_by_station_line['gtfs_stop_id']

    crowd_by_station_line = crowd_by_station_line[crowd_by_station_line.route_stop.isin(clean_stop_routes.route_stop)]

    avg_estimates = crowd_by_station_line.copy()
    avg_estimates['day_of_week'] = avg_estimates.time.dt.weekday
    avg_estimates['tmp_time'] = avg_estimates.time + timedelta(minutes=30)
    avg_estimates['hour'] = avg_estimates.tmp_time.dt.hour
    avg_estimates.crowd = avg_estimates.crowd.fillna(0)
    avg_estimates.crowd = [np.ceil(x) for x in avg_estimates.crowd]


    weekday_avg_estimates = avg_estimates[avg_estimates.day_of_week < 5].copy()
    weekday_avg_estimates = weekday_avg_estimates.groupby(['STATION','route_id','hour']).mean()['crowd'].reset_index()

    avg_estimates_filled = weekday_avg_estimates.groupby(['STATION','route_id']).apply(fill_missing_hours)
    avg_estimates_filled.drop(columns=['STATION','route_id'],inplace=True)
    avg_estimates_filled.reset_index(inplace=True)
    avg_estimates_filled = avg_estimates_filled.groupby(['STATION','route_id','hour']).mean()['crowd'].reset_index()
    avg_estimates_filled.crowd = np.round(avg_estimates_filled.crowd)

    avg_estimates['weekday'] = [1 if x < 5 else 0 for x in avg_estimates.day_of_week]
    avg_estimates = avg_estimates.groupby(['STATION','route_id','hour','weekday','direction_id']).mean()['crowd'].reset_index()

    avg_estimates_split = avg_estimates.groupby(['STATION','route_id','direction_id','weekday']).apply(fill_missing_hours)
    # avg_estimates_split.head()
    avg_estimates_split.drop(columns=['STATION','route_id','weekday','direction_id'],inplace=True)
    avg_estimates_split.reset_index(inplace=True)
    avg_estimates_split = avg_estimates_split.groupby(['STATION','route_id','hour','direction_id','weekday']).mean()['crowd'].reset_index()
    avg_estimates_split.crowd = np.round(avg_estimates_split.crowd)

    return avg_estimates_filled, avg_estimates_split