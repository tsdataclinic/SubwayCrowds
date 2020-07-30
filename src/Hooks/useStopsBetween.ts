import {useState,useEffect, useContext} from 'react'
import {DataContext} from '../Contexts/DataContext'
import Papa from 'papaparse'
import {Stop} from '../types'
import { start } from 'repl'

export const useStopsBetween = (line :string | null , start_station : string | null ,end_station: string | null)=>{
    const [stopsBetween, setStopsBetween] = useState<Stop[] | null>(null)
    const {stops} = useContext(DataContext) 
    
    useEffect(()=>{
        if(start_station && end_station && stops){
            console.log("running")
            let stops_for_line = stops.filter((stop)=> stop.line===line);
            let start_index = stops_for_line.findIndex(stop=> stop.id === start_station)
            let end_index = stops_for_line.findIndex(stop=> stop.id === end_station)

            let unordered_stops = stops_for_line.slice(Math.min(start_index,end_index), Math.max(start_index,end_index)+1)
            if(start_index > end_index){
                unordered_stops.reverse()
            }
            setStopsBetween(unordered_stops);
        }
        else{
            setStopsBetween(null)
        }
    },[start_station,end_station, stops, line])

    return stopsBetween
}