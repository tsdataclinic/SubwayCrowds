import React, {useState, useEffect} from 'react'
import Papa from 'papaparse'
import {Station,Line, Stop, CrowdingObservation, RawCrowding, Direction, CarsByLine} from '../types'

type Data={
    stations: Station[] | null,
    lines: Line[] | null,
    stops: Stop[] | null,
    crowdingData:CrowdingObservation[] | null,
    dataLoaded : boolean,
    carsByLine: CarsByLine[] | null,
    dateRange: string | null,
}
export const DataContext = React.createContext<Data>({stations:null, lines:null,stops:null, crowdingData:null,dataLoaded:false, carsByLine:null, dateRange:null});

export const DataProvider :React.FC = ({children})=>{
    const [stations, setStations] = useState<Station[] |null>(null)
    const [lines, setLines] = useState<Line[] |null>(null)
    const [stops, setStops] = useState<Stop[] | null>(null)
    const [dataLoaded,setDataLoaded] = useState<boolean>(false)
    const [crowdingData,setCrowdingData] = useState<CrowdingObservation[] | null>(null);
    const [carsByLine, setCarsByLine] = useState<CarsByLine[] | null>(null);
    const [dateRange, setDateRange] = useState<string | null>(null);
    
    useEffect( ()=>{
        loadCrowdingData().then( (data:any)=>{
            setCrowdingData(data)
        })
    },[])
    
    useEffect(() => {
        loadCarsByLine().then((data:any) => {
            setCarsByLine(data)
        })
    }, [])
    
    useEffect(()=>{
        loadStops().then( (data : any) =>{
            setStations(data.stations)
            setLines(data.lines)
            setStops(data.stops)
            setDataLoaded(true)
        })
    },[])
    
    useEffect(() => {
        fetch("timestamp.txt")
            .then(response => response.text())
            .then(data => {
                const dates = data.split("-", 2);
                const beginDate = new Date(parseInt(dates[0].slice(0, 4)), parseInt(dates[0].slice(4, 6)), parseInt(dates[0].slice(6, 8)));
                const beginDateString = `${beginDate.getMonth()}-${beginDate.getDate()}-${beginDate.getFullYear()}`;
                const endDate = new Date(parseInt(dates[1].slice(0, 4)), parseInt(dates[1].slice(4, 6)), parseInt(dates[1].slice(6, 8)));
                const endDateString = `${endDate.getMonth()}-${endDate.getDate()}-${endDate.getFullYear()}`;
                const dateRangeString = `${beginDateString} - ${endDateString}`;
                setDateRange(dateRangeString);
        })
    })

    return(
        <DataContext.Provider value={{stations, lines, stops, crowdingData, dataLoaded, carsByLine, dateRange}}>
            {children}
        </DataContext.Provider>
    )
}

const  iconForLine = (line:string)=>(
    `https://raw.githubusercontent.com/louh/mta-subway-bullets/master/svg/${line.toLocaleLowerCase()}.svg`
)

function parseStops(stops : Stop[]){
    const lineNames = Array.from(new Set(stops.map(stop=>stop.line))).filter(l=>l)
    const stationIds = Array.from(new Set(stops.map(stop=>stop.id))).filter(l=>l)
    const lines = lineNames.map(line=> ({
        name:line,
        id: line,
        icon:iconForLine(line)
    }))

    const stations : Station[] =stationIds.map(stationId=>{
        const station = stops.find(stop=>stop.id === stationId)
        if(!station){
            throw("Something weird happened")
        }
        return {
            name: station.station,
            turnstile_name: station.station,
            id: stationId,
            lines: stops.filter(stop=>stop.id === stationId).map(stop => stop.line)
        }
    })
    
    return {stations, lines, stops}
}

function parseCrowding(rawObservations: RawCrowding[]) : CrowdingObservation[]{
    return rawObservations.map((observation: RawCrowding)=>({
        stationID: observation.STATION,
        lineID: observation.route_id,
        hour:observation.hour,
        numPeople:observation.current_crowd,
        numPeopleLastMonth: observation.last_month_crowd,
        numPeopleLastYear: observation.last_year_crowd,
        direction: observation.direction_id === 0 ? Direction.NORTHBOUND : Direction.SOUTHBOUND,
        weekday: observation.weekday === 1,
    }))
}

function loadStops (){
    return new Promise((resolve,reject)=>{
        Papa.parse('/stops.csv',{
            download:true,
            complete: (result :any)=> resolve(parseStops(result.data)),
            header:true,
            dynamicTyping: {order: true}

        })
    })
}

function loadCrowdingData(){
    return new Promise((resolve,reject)=>{
        Papa.parse('crowding_by_weekday_direction.csv',{
            download:true,
            complete: (data :any)=> resolve(parseCrowding(data.data)),
            header:true,
            dynamicTyping: {hour: true, current_crowd: true,last_month_crowd:true, last_year_crowd:true, weekday:true, direction_id:true, }
        })
    })
}

function loadCarsByLine() {
    return new Promise((resolve, reject) => {
        Papa.parse('cars_by_line.csv', {
            download: true,
            complete: (result: any) => resolve(result.data),
            header: true,
            dynamicTyping: {num_cars: true}
        })
    })
}
