import {useContext} from 'react'
import {DataContext} from '../Contexts/DataContext'
import {filerTruthy} from '../utils'
type RawStation={
    station_name: string,
    clean_lines: string,
    turnstile_station_name:string,
    turnstile_lines: string
}

export const useStationsForLine = (line:string | null)=>{
    const {stations, stops} = useContext(DataContext);
    console.log("stations")
    console.table(stations)
    console.log("stops")
    console.table(stops)
    const stationsInLine =   stops?.filter(stop => stop.line==line ).sort((a,b)=> a.order > b.order ? 1 : -1)
    return stationsInLine?.map(stop => stations?.find(station => station.id === stop.id)).filter(filerTruthy)
}