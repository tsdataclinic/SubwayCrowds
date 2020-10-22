%load_ext autoreload
%autoreload 2

import pandas as pd
import numpy as np
import sys, logging
from datetime import datetime, timedelta
import time
import seaborn as sns
import matplotlib.pyplot as plt
import re
import os
import turnstile
import gtfs
import heuristics

root = logging.getLogger()
root.setLevel(logging.INFO)

handler = logging.StreamHandler(sys.stdout)
handler.setLevel(logging.DEBUG)
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
handler.setFormatter(formatter)
root.addHandler(handler)

from gcs_utils import gcs_util
gcs = gcs_util(bucket_path='mta_crowding_data')

## Loading pre-requisite files
stop_order_merged = pd.read_csv('mta-accessibility/analysis/train_crowding/data/stops.csv')
crosswalk = pd.read_csv('mta-accessibility/data/crosswalk/Master_crosswalk.csv')
station_to_station = pd.read_csv('MTACrowdingInteractive/scripts/station_to_station.csv')

## defining date range for estimation
LAST_TURNSTILE_DATE = datetime(year=2020,month=10,day=18)
DAYS_RANGE = 14

dates = [LAST_TURNSTILE_DATE - timedelta(days=i) for i in range(1,DAYS_RANGE +1)]
keep_dates = [re.sub('-','',str(d.date())) for d in dates]

## proceesing real-time GTFS data
df, dates = get_schedule(LAST_TURNSTILE_DATE,DAYS_RANGE)
clean_df = process_schedule(df, min(dates), max(dates), stop_order_merged)

## proceesing static GTFS data
static_schedule = pd.read_csv('mta-accessibility/data/raw/google_transit/stop_times.txt')
trips = pd.read_csv('mta-accessibility/data/raw/google_transit/trips.txt')
stops = pd.read_csv('mta-accessibility/data/raw/google_transit/stops.txt')
static_schedule = static_schedule.merge(trips,on='trip_id').merge(stops,on='stop_id')

last_year_start = min_st - timedelta(weeks=52)
last_year_end = max(dates) - timedelta(weeks=52)

clean_static_schedule = process_static_schedule(static_schedule,last_year_start, last_year_end)

## Processing Turnstile data

## Current
turnstile_data_raw = turnstile._process_raw_data(turnstile.download_turnstile_data(start_date=min(dates), end_date=max(dates)), group_by=['STATION','LINENAME','UNIT'])
turnstile_data_raw_imputed = pre_interpolation_fix(turnstile_data_raw)
turnstile_data_raw_imputed = turnstile_data_raw_imputed.set_index('datetime')
turnstile_data = turnstile._interpolate(turnstile_data_raw_imputed, group_by=['STATION','LINENAME','UNIT'],  frequency='1T')
turnstile_data = turnstile_data[turnstile_data.index.to_series().between(min(dates), max(dates))] .drop(columns=["entry_diffs", "exit_diffs"])
turnstile_data_cleaned = consolidate_turnstile_data(turnstile_data)

## Last Month
last_month_start = min(dates) - timedelta(weeks=4)
last_month_end = max(dates) - timedelta(weeks=4)
turnstile_data_raw = turnstile._process_raw_data(turnstile.download_turnstile_data(start_date=last_month_start, end_date=last_month_end), group_by=['STATION','LINENAME','UNIT'])
turnstile_data_raw_imputed = pre_interpolation_fix(turnstile_data_raw)
turnstile_data_raw_imputed = turnstile_data_raw_imputed.set_index('datetime')
last_month_turnstile_data = turnstile._interpolate(turnstile_data_raw_imputed, group_by=['STATION','LINENAME','UNIT'],  frequency='1T')
last_month_turnstile_data = last_month_turnstile_data[last_month_turnstile_data.index.to_series().between(last_month_start, last_month_end)] .drop(columns=["entry_diffs", "exit_diffs"])
last_month_turnstile_data = last_month_turnstile_data.reset_index()
last_month_turnstile_data['datetime'] = last_month_turnstile_data.datetime + timedelta(weeks=4)
last_month_turnstile_data = last_month_turnstile_data.set_index('datetime')
last_month_turnstile_data_cleaned = consolidate_turnstile_data(last_month_turnstile_data)

## Last Year
last_year_start = min(dates) - timedelta(weeks=52)
last_year_end = max(dates) - timedelta(weeks=52)
turnstile_data_raw = turnstile._process_raw_data(turnstile.download_turnstile_data(start_date=last_year_start, end_date=last_year_end), group_by=['STATION','LINENAME','UNIT'])
turnstile_data_raw_imputed = pre_interpolation_fix(turnstile_data_raw)
turnstile_data_raw_imputed = turnstile_data_raw_imputed.set_index('datetime')
last_year_turnstile_data = turnstile._interpolate(turnstile_data_raw_imputed, group_by=['STATION','LINENAME','UNIT'],  frequency='1T')
last_year_turnstile_data = last_year_turnstile_data[last_year_turnstile_data.index.to_series().between(last_year_start, last_year_end)] .drop(columns=["entry_diffs", "exit_diffs"])
last_year_turnstile_data_cleaned = consolidate_turnstile_data(last_year_turnstile_data)


## Merging GTFS and Turnstile data
crosswalk = crosswalk[~(crosswalk.turnstile_station_name == '14TH STREET')]

schedule = get_schedule_with_weights(turnstile_data_cleaned,clean_df,stop_order_merged)
schedule_last_month = get_schedule_with_weights(last_month_turnstile_data_cleaned,clean_df,stop_order_merged)
schedule_last_year = get_schedule_with_weights(last_year_turnstile_data_cleaned,clean_static_schedule,stop_order_merged)

df_merge = merge_turnstile_schedule(turnstile_data_cleaned,crosswalk, schedule)
last_month_df_merge = merge_turnstile_schedule(last_month_turnstile_data_cleaned,crosswalk, schedule_last_month)
last_year_df_merge = merge_turnstile_schedule(last_year_turnstile_data_cleaned,crosswalk, schedule_last_year)


## Crowd estimation
crowd_by_station_line = get_crowd_by_station_line(df_merge,entry_exit_ratio=1.25)
last_month_crowd_by_station_line = get_crowd_by_station_line(last_month_df_merge,entry_exit_ratio=1.25)
last_year_crowd_by_station_line = get_crowd_by_station_line(last_year_df_merge,entry_exit_ratio=1.25)


## Aggregating estimates by hour and weekday/weekend
station_to_station['from'] = [re.sub(r'N$|S$','',x) for x in station_to_station['from']]
station_to_station['to'] = [re.sub(r'N$|S$','',x) for x in station_to_station['to']]
clean_stop_routes = station_to_station[['from','line']].rename(columns={'from':'stop_id'})
clean_stop_routes = clean_stop_routes.append(station_to_station[['to','line']].rename(columns={'to':'stop_id'}))
clean_stop_routes = clean_stop_routes.drop_duplicates()
clean_stop_routes = clean_stop_routes[~clean_stop_routes.line.isin(['H','SI'])]
clean_stop_routes['route_stop'] = clean_stop_routes['line'] + '_' + clean_stop_routes['stop_id']

current_avg, current_avg_split = get_hourly_averages(crowd_by_station_line, clean_stop_routes)
last_month_avg, last_month_avg_split = get_hourly_averages(last_month_crowd_by_station_line, clean_stop_routes)
last_year_avg, last_year_avg_split = get_hourly_averages(last_year_crowd_by_station_line, clean_stop_routes)

current_avg.rename(columns={'crowd':'current_crowd'}, inplace=True)
last_month_avg.rename(columns={'crowd':'last_month_crowd'}, inplace=True)
last_year_avg.rename(columns={'crowd':'last_year_crowd'}, inplace=True)

hourly_average_estimates = current_avg.merge(last_month_avg,on=['STATION','route_id','hour'])
hourly_average_estimates = hourly_average_estimates.merge(last_year_avg,on=['STATION','route_id','hour'])

current_avg_split.rename(columns={'crowd':'current_crowd'}, inplace=True)
last_month_avg_split.rename(columns={'crowd':'last_month_crowd'}, inplace=True)
last_year_avg_split.rename(columns={'crowd':'last_year_crowd'}, inplace=True)

hourly_average_estimates_split = current_avg_split.merge(last_month_avg_split,on=['STATION','route_id','hour','direction_id','weekday'])
hourly_average_estimates_split = hourly_average_estimates_split.merge(last_year_avg_split,on=['STATION','route_id','hour','direction_id','weekday'])

# hourly_average_estimates.to_csv('MTACrowdingInteractive/public/average_crowding_by_hour.csv',index=False)
hourly_average_estimates_split.to_csv('MTACrowdingInteractive/public/crowding_by_weekday_direction.csv',index=False)


timestr = min_st.strftime("%Y%m%d")
timesen = max(dates).strftime("%Y%m%d")
test_time = open('MTACrowdingInteractive/public/timestamp.txt', 'w')
test_time.write(timestr+'-'+timesen)
test_time.close()