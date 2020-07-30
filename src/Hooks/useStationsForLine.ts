import {useContext} from 'react'
import {DataContext} from '../Contexts/DataContext'

type RawStation={
    station_name: string,
    clean_lines: string,
    turnstile_station_name:string,
    turnstile_lines: string
}


export const useStationsForLine = (line:string | null)=>{
    const {stations} = useContext(DataContext);
    return (stations && line)  ? stations.filter(station => station.lines.includes(line) ) : stations
}