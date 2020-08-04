import {useState,useEffect, useContext} from 'react'
import {CrowdingObservation,HourlyObservation, Stop} from '../types'
import {DataContext} from '../Contexts/DataContext'

export const useCrowdingData = (stationID :string |null, lineID:string | null)=>{
    const {crowdingData} = useContext(DataContext)
    const [stationData, setStationData] = useState<CrowdingObservation[] | null | undefined >(null)
    
    useEffect( ()=> {
        if(crowdingData && lineID && stationID){
            const data = crowdingData?.filter((observation)=> observation.stationID === stationID && observation.lineID === lineID)
            setStationData(data)
        }
        else{
            setStationData(null)
        }
    },[crowdingData, lineID, stationID])

    return stationData
}

export const useMaxCrowdingByHourForTrip = (stops:Stop[] |null)=>{
    const {crowdingData} = useContext(DataContext)
    const [data,setData] = useState<HourlyObservation[] | null>(null)
    useEffect(()=>{
        if(stops && crowdingData){
            const lines = stops.map(s=>s.line)
            const stations = stops.map(s=> s.id)

            const hourlyStopData = crowdingData.filter(cd => lines.includes(cd.lineID) && stations.includes(cd.stationID))
            const maxByHour: HourlyObservation[] = [];
            for(let hour =0; hour< 24; hour++){
                const counts = hourlyStopData?.filter(obs=>obs.hour===hour).filter(filerTruthy).map(obs=>obs.numPeople)
                maxByHour.push({hour:hour, numPeople: counts.length > 0 ?  Math.max(...counts) : 0})
            }
            setData(maxByHour)
        }
    },[stops, crowdingData])

    return data
}

function filerTruthy<T>(t: T | undefined): t is T {
  return !!t;
}

export const useCrowdingDataByStops = (stops:Stop[] | null, hour:number | null)=>{
    const {crowdingData} = useContext(DataContext)
    const [data,setData] = useState<CrowdingObservation[] | null | undefined>(null)

    useEffect(()=>{
        if(stops && hour && crowdingData ){
            const stopCounts = stops.map(stop=> crowdingData.find(s=>s.hour=== hour && stop.id === s.stationID && stop.line === s.lineID))            
            setData(stopCounts.filter(filerTruthy))
        }
    },[stops,hour, crowdingData])

    return data
}
                                   
