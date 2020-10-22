import pandas as pd
import numpy as np
import sys, logging
from datetime import datetime, timedelta
import seaborn as sns
import matplotlib.pyplot as plt
import re
import os
import turnstile
from gcs_utils import gcs_util
gcs = gcs_util()


def get_schedule(lt, days=15):
    '''
    Get daily processed realtime GTFS data
    '''
    dates = [lt - timedelta(days=i) for i in range(1,days+1)]
    keep_dates = [re.sub('-','',str(d.date())) for d in dates]
    date_pattern = re.compile("realtime/daily/vehicle_updates_([0-9]*)")
    loaded_files = []
    df = pd.DataFrame()

    for blob in gcs.list_blobs('realtime/daily/'): 
        name = blob.name
        if bool(re.search("realtime/daily/vehicle_updates_", name)):
            date = date_pattern.match(name)[1]
            if date in keep_dates:
                loaded_files.append(blob.name)
                df_temp = gcs.read_dataframe(name)
                df = df.append(df_temp,sort=False).drop_duplicates()
                
    return df, dates

def keep_latest_info(df):
    '''
    Function to keep latest available information for train arrivals at the station along a trip
    '''
    df = df.sort_values('timestamp')
    df = df.drop_duplicates(subset=['stop_id'],keep='last')
    return df

def process_schedule(df_raw, st, en, stop_order_merged):
    '''
    Processing raw-gtfs data into schedule used for crowding estimation.
    - Removing unused columns
    - Filling in missing start times
    - Imputing missing starting stops
    - Dropping trips which have >75% stops missing compared to a typical trip on that route
    '''
    ## basic cleaning: retaining actual stops, filling nulls, removing duplicates
    cols_to_remove = ['id','alert.header_text.translation','alert.informed_entity','stop_headsign','pickup_type','drop_off_type','shape_dist_traveled','departure_time']
    cols_to_remove = list(set(df_raw.columns).intersection(set(cols_to_remove)))
    if len(cols_to_remove) > 0:
        df_raw = df_raw.drop(columns=cols_to_remove,axis=1)
    df_raw = df_raw.drop_duplicates(subset=['current_status','current_stop_sequence','route_id','start_date','start_time','stop_id','stop_name','timestamp','trip_id'])
    df_raw.timestamp = pd.to_datetime(df_raw.timestamp)
    df_raw = df_raw[df_raw.timestamp.notnull()]
    
    df_raw = df_raw[~df_raw.route_id.isin(['FS','H','GS'])]
    df_raw.route_id = [re.sub('X$','',r) for r in df_raw.route_id]
    
    trimmed_dfs = []
    df_raw.groupby(['start_date','trip_id']).apply(
        lambda g: trimmed_dfs.append(keep_latest_info(g)))
    
    df = pd.concat(trimmed_dfs)
    
    df.timestamp = df.timestamp.dt.tz_localize('UTC').dt.tz_convert('US/Eastern').dt.tz_localize(None)
    df.start_time = pd.to_datetime(df.start_time)
    df.start_time = df.start_time.dt.tz_localize('UTC').dt.tz_convert('US/Eastern').dt.tz_localize(None)

    first_time = df.groupby(['start_date','trip_id']).timestamp.min().to_frame().reset_index().rename(columns={'timestamp':'first_time'})
    df = df.merge(first_time,how='left',on=['start_date','trip_id'])
    df['direction'] = [re.search("(N|S)$",x)[0] if re.search("(N|S)$",x) else None for x in df.stop_id]
    df.loc[df.direction.isnull(),'direction'] = [re.search("(N|S)$",x)[0] if re.search("(N|S)$",x) else None for x in df[df.direction.isnull()].trip_id]
    df['st_time'] = [y if pd.isna(x) else x for x,y in zip(df.start_time,df.first_time)]
    
    ## defining unique ID for a trip, identifying if a trip is truncated or only has a single stop
    df['uid'] = df.groupby(['route_id','direction','start_date','st_time','trip_id']).grouper.group_info[0]
    df = df[df.start_date != (st-timedelta(days=1)).strftime('%Y%m%d')]
    trip_counts = df.groupby(['uid','route_id','direction']).count().reset_index()
    single_stop_trips = trip_counts[trip_counts.timestamp == 1].uid
    df = df[~df.uid.isin(single_stop_trips)]
    end_times = df.groupby('uid').timestamp.max().to_frame().reset_index()
    end_times['legitimate_trunc'] = end_times.timestamp > (en + timedelta(hours=23, minutes=50))
    df = df.merge(end_times[['uid','legitimate_trunc']],how='left',on='uid')
    
    ### Imputation goes here
    imputed_dfs = []
    df.groupby(['start_date','trip_id']).apply(
        lambda g: imputed_dfs.append(add_starting_stations(g,stop_order_merged)))
    
    df = pd.concat(imputed_dfs)
    
    ## getting max trip length and using it to filter the more complete trips
    max_trip_length = df.groupby(['uid','route_id','direction']).current_stop_sequence.max().reset_index().groupby(['route_id','direction']).max().reset_index().rename(columns={'current_stop_sequence':'max_trip_length'})
    df = df.merge(max_trip_length[['route_id','direction','max_trip_length']],how='left',on=['route_id','direction'])
    trip_length = df.groupby(['uid','route_id','direction']).count().reset_index().rename(columns={'timestamp':'trip_length'})
    df = df.merge(trip_length[['uid','trip_length']],how='left',on='uid')
    df['pct_max'] = df.trip_length/df.max_trip_length
    df = df[~((df.pct_max < 0.24) &(df.legitimate_trunc == False))]
    
    df['time'] = pd.to_datetime(df.timestamp)
    df.time = df.time.dt.floor('T')
    df['trimmed_stop_id'] = [re.sub(r'(N|S)$','',x) for x in df.stop_id]
    df['direction_id'] = [1 if x == 'S' else 0 for x in df.direction]
    
    df['hour'] = df.time.dt.hour
    return df


def add_starting_stations(df,stop_order_merged):
    '''
    For each trip, adds the starting stop which is typically missing in the raw realtime GTFS data
    '''
    trip_df = df.copy()
    trip_df = keep_latest_info(trip_df)
    trip_df = trip_df.sort_values('timestamp')
    trip_df = trip_df.reset_index(drop=True)
    stops = trip_df.stop_id
    stop_seq = trip_df.current_stop_sequence
    min_seq = min(stop_seq)
    if np.isnan(min_seq):
        return trip_df
    else:
        first_stop = stops[stop_seq.idxmin()]
    
    if (first_stop[-1] != 'N')&(first_stop[-1] != 'S'):
        first_stop = first_stop + 'S'
    try:
        first_stop_order = get_order_for_stop(re.sub('N$','S',first_stop),list(trip_df.route_id)[0],list(trip_df.direction)[0],stop_order_merged)
    except:
        print("{}-{}-{}".format(first_stop,list(trip_df.route_id)[0],list(trip_df.direction)[0]))
    
    try:  
        correct_first_stop = get_stop(stop_order_merged,list(trip_df.route_id)[0],list(trip_df.direction)[0],order=1)
    except:
        print("{}-{}".format(list(trip_df.route_id)[0],list(trip_df.direction)[0]))
        return trip_df
        
    
    if (min_seq > 4) | (first_stop == correct_first_stop) | (first_stop_order > 4) :
        pass
    else:
        previous_stops = get_previous_stops(stop_order_merged,list(trip_df.route_id)[0],list(trip_df.direction)[0],first_stop)
        row_to_duplicate = trip_df[trip_df.stop_id == first_stop].copy()
        i = 1
        for p in previous_stops:
            new_row = row_to_duplicate.copy()
            new_row['stop_id'] = p
            new_row['timestamp'] = new_row['timestamp'] - timedelta(minutes=2*i)
            new_row['stop_name'] = get_name_for_stop_id(stop_order_merged, p)
            new_row['current_stop_sequence'] = new_row['current_stop_sequence'] - i
            trip_df = trip_df.append(new_row, sort=False)
            i = i+1

    return trip_df

def get_stop(stop_order,route_id, direction, order=1):
    stops = stop_order[stop_order.route_id == route_id]
    max_seq = stops.order.max()
    if direction == 'S':
        stop_id = list(stops[stops.order == order].stop_id)
    else:
        stop_id = list(stops[stops.order == max_seq-order+1].stop_id)
        stop_id = [re.sub('S$','N',x) for x in stop_id]
    
    return stop_id[0]

def get_previous_stops(stop_order,route_id, direction, current_stop):
    stops = stop_order[stop_order.route_id == route_id]
    if re.sub('N$','S',current_stop) not in list(stops.stop_id):
        return []
    max_seq = stops.order.max()
    if (current_stop[-1] != 'N')&(current_stop[-1] != 'S'):
        current_stop = current_stop + 'S'
    if direction == 'S':
        current_order = list(stops[stops.stop_id == current_stop].order)
        previous_stops = stops[stops.order < current_order[0]].sort_values('order', ascending=False)
        previous_stops = list(previous_stops.stop_id)
    else:
        current_order = list(stops[stops.stop_id == re.sub('N$','S',current_stop)].order)
        previous_stops = stops[stops.order > current_order[0]].sort_values('order')
        previous_stops = [re.sub('S$','N',x) for x in previous_stops.stop_id]
    
    return previous_stops

def get_name_for_stop_id(stop_order_merged, stop_id):
    return list(stop_order_merged[stop_order_merged.stop_id == re.sub('N$','S',stop_id)].station)[0]

def get_order_for_stop(stop_id,route_id,direction,stop_order):
    stops = stop_order[stop_order.route_id == route_id]
    if stop_id not in list(stops.stop_id):
        return 99
    else:
        max_seq = stops.order.max()
        if direction == 'S':
            current_order = list(stops[stops.stop_id == stop_id].order)[0]
        else:
            current_order = max_seq - list(stops[stops.stop_id == re.sub('N$','S',stop_id)].order)[0] + 1
    
    return current_order

def fix_weird_times(x,add=1):
    units = x.split(':')
    h = int(units[0])
    m = units[1]
    s = units[2]
    if h >= 24:
        h = h - 24
        
    y = str(h)+':'+m+':'+s
    fixed_time = pd.to_datetime(y,format='%H:%M:%S')
    fixed_time = fixed_time + timedelta(days=add)
    return fixed_time

def process_static_schedule(df, st, en):
    '''
    Function that processes GTFS Static Data used as aproxy for schedule last year
    - Removes unused columns
    - Replicates for each day of time-period of interest and adjusts dates accordingly
    '''
    ## basic cleaning: retaining actual stops, filling nulls, removing duplicates
    cols_to_remove = ['id','alert.header_text.translation','alert.informed_entity','stop_headsign','pickup_type','drop_off_type',
                      'shape_dist_traveled','departure_time','service_id', 'trip_headsign','block_id','shape_id', 'stop_code','stop_desc', 'stop_lat',
                      'stop_lon', 'zone_id', 'stop_url', 'location_type','parent_station']
    cols_to_remove = list(set(static_schedule.columns).intersection(set(cols_to_remove)))
    if len(cols_to_remove) > 0:
        df = df.drop(columns=cols_to_remove,axis=1)
    df = df.drop_duplicates()
    df['time'] = pd.to_datetime(df.arrival_time,format='%H:%M:%S',errors='coerce')
    df.loc[df.time.isnull(),'time'] = df[df.time.isnull()].arrival_time.apply(fix_weird_times)
    df['trimmed_stop_id'] = [re.sub(r'(N|S)$','',x) for x in df.stop_id]
    
    last_year_dates = [st + timedelta(days=i) for i in range(0,DAYS_RANGE-1)]
    clean_static_schedule = []
    for d in last_year_dates:
        days_to_add = (d - datetime(year=1900,month=1,day=1)).days
        if d.weekday() < 5:
            ## weekday
            tmp_df = df[df.trip_id.str.contains('Weekday')] .copy()
            tmp_df['start_date'] = d.strftime(format="%Y%m%d")
        elif d.weekday() == 5:
            ## saturday
            tmp_df = df[df.trip_id.str.contains('Saturday')] .copy()
            tmp_df['start_date'] = d.strftime(format="%Y%m%d")
        else:
            ## sunday
            tmp_df = df[df.trip_id.str.contains('Sunday')] .copy()
            tmp_df['start_date'] = d.strftime(format="%Y%m%d")

        tmp_df.time = tmp_df.time + timedelta(days=days_to_add)
        clean_static_schedule.append(tmp_df)    
    
    clean_static_schedule = pd.concat(clean_static_schedule,ignore_index=True, sort=False)
    first_time = clean_static_schedule.groupby(['start_date','trip_id']).time.min().to_frame().reset_index().rename(columns={'time':'first_time'})
    clean_static_schedule = clean_static_schedule.merge(first_time,how='left',on=['start_date','trip_id'])
       
    ## defining unique ID for a trip
    clean_static_schedule['uid'] = clean_static_schedule.groupby(['route_id','direction_id','start_date','first_time','trip_id']).grouper.group_info[0]
    
    clean_static_schedule.time = clean_static_schedule.time.dt.floor('T')
    clean_static_schedule['hour'] = clean_static_schedule.time.dt.hour
    return clean_static_schedule

