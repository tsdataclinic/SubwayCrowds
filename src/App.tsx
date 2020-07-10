import React, {useState} from 'react';
import SentanceDropDown from './components/SentanceDropDown/SentanceDropDown'
import {useStationLines} from './Hooks/useStations'
import {useCrowdingData} from './Hooks/useCrowdingData'
import {Line} from 'react-chartjs-2'

import './App.css';

function App() {

  const {stations,lines} = useStationLines()
  
  const [selectedStation, setSelectedStation] = useState<any>(null)
  const [selectedLine, setSelectedLine] = useState<any | null >(null)

  const filteredStations = (selectedLine && stations) ? stations.filter(station => station.lines.includes(selectedLine?.key) ) : stations
  const filteredLines = (selectedStation && lines) ? lines.filter( (line) => stations.find(s=>s.name === selectedStation.text)?.lines.includes(line.name) ) : lines

  const crowdingData = useCrowdingData(selectedStation?.key, selectedLine?.key)

  const stationOptions: any = filteredStations.map( station => ({
    text:station.name,
    key: station.turnstile_name,
  }))

   const lineOptions: any = filteredLines.map( line => ({
    key: line.name,
    icon: line.icon
  }))

  console.log('data ', crowdingData, lineOptions)
 
  return (
    <div className="App">
      <div style={{display:"flex", alignItems:'center', justifyContent:'normal'}}>
        <span>I take the </span>
        <SentanceDropDown prompt={'select line'} options={lineOptions} selected={selectedLine} onSelected={setSelectedLine}/>
        <span> line. I get on at  </span>
        <SentanceDropDown prompt={'select station name'} options={stationOptions} selected={selectedStation} onSelected={setSelectedStation} />
      </div>
      { crowdingData && (
      crowdingData.length > 0 ?
      <div className='graph'>
        <Line data={ {datasets:[ {data: crowdingData.map(c =>c.y), label:'Number of People per Hour'}],labels:crowdingData.map(c=>c.x) }} />
      </div>
      : <h1>No data available</h1>
      )
        
      }
      
      </div>
  );
}

export default App;
