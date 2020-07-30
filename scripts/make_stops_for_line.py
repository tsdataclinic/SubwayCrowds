import pandas as pd 
import networkx as nx

graph =  nx.Graph()

station_to_station = pd.read_csv('./station_to_station.csv')

def generate_order(group,stop_lookup):
    graph =  nx.DiGraph()
    for index, row in group.iterrows():
        graph.add_edge(row['from'],row['to'])
    ordered_stops= pd.DataFrame([ (node,stop_lookup[node], index) for index,node in enumerate(graph.nodes())], columns=['stop_id','stop_name', 'order'])
    return ordered_stops
    

south_bound = station_to_station[station_to_station['from'].str[-1]=='S']

stops = pd.read_csv('./stops.txt')
stop_lookup = dict(zip(stops.stop_id, stops.stop_name))


all_ordered = pd.DataFrame()
for line, data in south_bound.groupby('line'):
    ordered = generate_order(data, stop_lookup)
    ordered = ordered.assign(line = line)
    all_ordered = all_ordered.append(ordered)


name_id_lookup = pd.read_csv('./cross_walks.csv')



final_ordered_stations = pd.merge(all_ordered,name_id_lookup, left_on= 'stop_name', right_on='name').drop('name',axis=1)
final_ordered_stations.rename(columns={'stop_name':'station'}).to_csv('../public/stops.csv', index=False)
# station_to_station.to_csv('../public/stops.csv', index=False)

# station_to_station = station_to_station[station_to_station['from_station']!="none"]