import pandas as pd 

station_to_station = pd.read_csv('./station_to_station.csv')
name_id_lookup = pd.read_csv('./cross_walks.csv')
stops = pd.read_csv('./stops.txt')
stop_lookup = dict(zip(stops.stop_id, stops.stop_name))


station_to_station = station_to_station.assign(station = station_to_station['from'].apply(lambda x: stop_lookup[x] if x in stop_lookup else 'none'))

station_to_station = station_to_station.drop_duplicates(subset=['line','station'])[['line','station']]
station_to_station = pd.merge(station_to_station,name_id_lookup, left_on= 'station', right_on='name').drop('name',axis=1)
station_to_station.to_csv('../public/stops.csv', index=False)

# station_to_station = station_to_station[station_to_station['from_station']!="none"]