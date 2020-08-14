import React, {useState, useEffect} from 'react'
import Papa from 'papaparse'
import {Station,Line, Stop, CrowdingObservation, RawCrowding, Direction} from '../types'

type Data={
    stations: Station[] | null,
    lines: Line[] | null,
    stops: Stop[] | null,
    crowdingData:CrowdingObservation[] | null,
    dataLoaded : boolean
}
export const DataContext = React.createContext<Data>({stations:null, lines:null,stops:null, crowdingData:null,dataLoaded:false});

export const DataProvider :React.FC = ({children})=>{
    const [stations, setStations] = useState<Station[] |null>(null)
    const [lines, setLines] = useState<Line[] |null>(null)
    const [stops, setStops] = useState<Stop[] | null>(null)
    const [dataLoaded,setDataLoaded] = useState<boolean>(false)
    const [crowdingData,setCrowdingData] = useState<CrowdingObservation[] | null>(null);

    useEffect( ()=>{
        loadCrowdingData().then( (data:any)=>{
            setCrowdingData(data)
        })
    },[])

    useEffect(()=>{
        loadStops().then( (data : any) =>{
            setStations(data.stations)
            setLines(data.lines)
            setStops(data.stops)
            setDataLoaded(true)
        })
    },[])

    return(
        <DataContext.Provider value={{stations,lines,stops,crowdingData,dataLoaded}}>
            {children}
        </DataContext.Provider>
    )
}

const  iconForLine = (line:string)=>(
    `https://raw.githubusercontent.com/louh/mta-subway-bullets/master/svg/${line.toLocaleLowerCase()}.svg`
)

function parseStops(stops : Stop[]){
    const lineNames = Array.from(new Set(stops.map(stop=>stop.line))).filter(l=>l)
    const stationNames = Array.from(new Set(stops.map(stop=>stop.station))).filter(l=>l)
    const lines = lineNames.map(line=> ({
        name:line,
        id: line,
        icon:iconForLine(line)
    }))

    const stations : Station[] =stationNames.map(stationName=>{
        const station = stops.find(stop=>stop.station === stationName)
        if(!station){
            throw("Something weird happend")
        }
        return {
            name: stationName,
            turnstile_name: stationName,
            id: station.id,
            lines: stops.filter(stop=>stop.station === stationName).map(stop => stop.line)
        }
    })

    return {stations,lines, stops}
}

function parseCrowding(rawObservations: RawCrowding[]) : CrowdingObservation[]{
    return rawObservations.map((observation: RawCrowding)=>({
        stationID: observation.STATION,
        lineID: observation.route_id,
        hour:observation.hour,
        numPeople:observation.current_crowd,
        direction: observation.direction_id === 0 ? Direction.NORTHBOUND : Direction.SOUTHBOUND,
        weekday: observation.weekday === 1,
    }))
}

function loadStops (){
    return new Promise((resolve,reject)=>{
        Papa.parse('/stops.csv',{
            download:true,
            complete: (result :any)=> resolve(parseStops(result.data)),
            header:true
        })
    })
}

function loadCrowdingData(){
    return new Promise((resolve,reject)=>{
        Papa.parse('crowding_by_weekday_direction_june.csv',{
            download:true,
            complete: (data :any)=> resolve(parseCrowding(data.data)),
            header:true,
            dynamicTyping: {hour: true, crowd: true,weekday:true, direction_id:true}
        })
    })
}