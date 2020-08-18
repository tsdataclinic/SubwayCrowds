import {useState,useEffect, useContext} from 'react'
import {DataContext} from '../Contexts/DataContext'
import {Stop, Direction} from '../types'

export const useStopsBetween = (line :string | null , start_station : string | null ,end_station: string | null)=>{
    const [stopsBetween, setStopsBetween] = useState<Stop[] | null>(null)
    const [order, setOrder] = useState<Direction | null>(null)
    const {stops} = useContext(DataContext) 
    
    useEffect(()=>{
        if(start_station && end_station && stops){
            const stops_for_line = stops.filter((stop)=> stop.line===line).sort((a,b)=> a.order > b.order ? 1: -1);
            const start_index = stops_for_line.findIndex(stop=> stop.id === start_station)
            const end_index = stops_for_line.findIndex(stop=> stop.id === end_station)

            const unordered_stops = stops_for_line.slice(Math.min(start_index,end_index), Math.max(start_index,end_index)+1)
            const order = start_index > end_index ? Direction.NORTHBOUND : Direction.SOUTHBOUND 

            if(start_index > end_index){
                unordered_stops.reverse()
            }
            setStopsBetween(unordered_stops);
            setOrder(order)
        }
        else{
            setStopsBetween(null)
            setOrder(null)
        }
    },[start_station,end_station, stops, line])

    return {stops:stopsBetween,order}
}