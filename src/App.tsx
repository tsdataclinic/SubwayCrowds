import React, {useState, useEffect} from 'react';
import SentanceDropDown from './components/SentanceDropDown/SentanceDropDown'
import {useStationLines} from './Hooks/useStations'
import {useCrowdingData} from './Hooks/useCrowdingData'
import {Line} from 'react-chartjs-2'
import  queryString from 'query-string';
import {
  EmailShareButton,
  FacebookShareButton,
  TwitterShareButton,
  EmailIcon,
  FacebookIcon,
  TwitterIcon,
} from 'react-share';

import './App.css';

function App() {

  const [loadedParams, setLoadedParams] = useState(false)

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

  const reset = () => {
    setSelectedStation(null)
    setSelectedLine(null)
    window.history.replaceState({}, '', `${window.location.origin}`)
  }

  useEffect(()=>{
    if(stations && stations.length > 0 && lines && lines.length > 0){
      const parsed = queryString.parse(window.location.search)
      const station:any = stations.find(s=> s.turnstile_name === parsed.station)
      const line:any    = lines.find(l => l.name === parsed.line)
      if(station && line){
        setSelectedStation({
          key: station.turnstile_name,
          name: station.name,
          text: station.name
        })

        setSelectedLine({
          key: line.name,
          icon: line.icon
        })
      }
       setLoadedParams(true)
    }
  },[stations,lines])
  
  useEffect(()=>{
    if(selectedStation && selectedLine && loadedParams){
      const state = {line: selectedLine.key, station: selectedStation.key}
      const params = queryString.stringify(state)
      window.history.replaceState(state, '', `${window.location.origin}?${params}`)
    }
   
  },[selectedStation, selectedLine])


  return (
    <div className="App">
      <div style={{display:"flex", alignItems:'center', justifyContent:'normal'}}>
        <span>I take the </span>
        <SentanceDropDown prompt={'select line'} options={lineOptions} selected={selectedLine} onSelected={setSelectedLine}/>
        <span> line. I get on at </span>
        <SentanceDropDown prompt={'select station name'} options={stationOptions} selected={selectedStation} onSelected={setSelectedStation}/>
      
      </div>
      { selectedLine && selectedStation &&(
        (crowdingData && 
      crowdingData.length > 0) ?
      <div className='graph'>
        <Line 
            data={ 
              {
                datasets:[ {
                  data: crowdingData.map(c =>c.y), 
                  label:'Number of People per Hour',
                  backgroundColor:'rgba(112,214,227,0.4)',
                  borderColor: 'rgba(112,214,227,1)',
                }]
                ,
                labels:crowdingData.map(c=>c.x) 
                
              }} />
        <button onClick={reset}>
          Find out about another trip.
        </button>
        <p>Share this graph</p>
        <p className="share-icons">
            <FacebookShareButton quote={`Checkout this graph of overcrowding on the ${selectedLine.name} line at ${selectedStation.text}`} url={window.location.href}>
              <FacebookIcon size={36} />
            </FacebookShareButton>{' '}
            <TwitterShareButton title={`Checkout this graph of overcrowding on the ${selectedLine.key} line at ${selectedStation.text}`} url={window.location.href}>
              <TwitterIcon size={36} />
            </TwitterShareButton>
            <EmailShareButton 
              subject={`Checkout this graph of overcrowding on the ${selectedLine.key} line at ${selectedStation.text}`}
              body={`Checkout this graph of overcrowding on the ${selectedLine.key} line at ${selectedStation.text}`}
              url={window.location.href}>
              <EmailIcon size={36} />
            </EmailShareButton>
          </p>
      </div>
      : <>
        <h1>No data available</h1>
          <button onClick={reset}>
              Find out about another trip.
            </button>
        </>
      )

      }

      </div>
  );
}

export default App;
