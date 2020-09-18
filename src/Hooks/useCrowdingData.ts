import {useState,useEffect, useContext} from 'react'
import {CrowdingObservation,HourlyObservation, Stop, Direction} from '../types'
import {filerTruthy} from '../utils'
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


export const useAbsoluteMaxForStops = (stops:Stop[] | null)=>{
    const {crowdingData} = useContext(DataContext)
    if(stops && crowdingData ){

        const stationIDS = stops.map(s=>s.id)
        const lines = stops.map(s=>s.line)

        const stopCounts  = crowdingData.filter(cd=> stationIDS.includes(cd.stationID) && lines.includes(cd.lineID))
        // const stopCounts = stops.map(stop=> crowdingData.find(s=> stop.id === s.stationID && stop.line === s.lineID))

        const absoluteMaxCurent = stopCounts ? Math.max(...stopCounts.map(cd=> cd ? cd.numPeople : 0  )) : 0;
        const absoluteMaxMonth = stopCounts ? Math.max(...stopCounts.map(cd=>cd ? cd.numPeopleLastMonth : 0)) : 0;
        const absoluteMaxYear = stopCounts ? Math.max(...stopCounts.map(cd=>cd ? cd.numPeopleLastYear :0 )) : 0;
        return {
            current: absoluteMaxCurent,
            month: absoluteMaxMonth,
            year: absoluteMaxYear
        }
    }
    else{
        return null
    }
}

export const useMaxCrowdingByHourForTrip = (stops:Stop[] |null, order: Direction|null , weekday:boolean)=>{
    const {crowdingData} = useContext(DataContext)
    const [data,setData] = useState<HourlyObservation[] | null>(null)
    useEffect(()=>{
        if(stops && crowdingData && (order!==null)){
            const lines = stops.map(s=>s.line)
            const stations = stops.map(s=> s.id)
            const hourlyStopData = crowdingData.filter(cd => lines.includes(cd.lineID) && stations.includes(cd.stationID) &&  (cd.direction===order) && (cd.weekday === weekday ))
            const maxByHour: HourlyObservation[] = [];
            for(let hour =0; hour< 24; hour++){
                const counts = hourlyStopData?.filter(obs=>(obs.hour===hour)).filter(filerTruthy)
                const countsCurrent = counts.map(obs=>obs.numPeople)
                const countsLastMonth = counts.map(obs=>obs.numPeopleLastMonth)
                const countsLastYear = counts.map(obs=>obs.numPeopleLastYear)

                maxByHour.push({
                    hour:hour, 
                    numPeople: countsCurrent.length > 0 ?  Math.max(...countsCurrent) : 0,
                    numPeopleLastMonth: countsLastMonth.length > 0 ?  Math.max(...countsLastMonth) : 0,
                    numPeopleLastYear: countsLastYear.length > 0 ?  Math.max(...countsLastYear) : 0
                })
            }
            setData(maxByHour)
        }
    },[stops, crowdingData,weekday,order])

    return data
}

export const useCrowdingDataByStops = (stops:Stop[] | null, hour:number | null,order: Direction|null , weekday:boolean)=>{
    const {crowdingData} = useContext(DataContext)
    const [data,setData] = useState<CrowdingObservation[] | null | undefined>(null)

    useEffect(()=>{
        if(stops && hour && crowdingData ){
            const stopCounts = stops.map(stop=> crowdingData.find(s=>s.hour=== hour && stop.id === s.stationID && stop.line === s.lineID && s.direction===order && s.weekday===weekday))            
            setData(stopCounts.filter(filerTruthy))
        }
    },[stops,hour, crowdingData, weekday,order])

    return data
}
                                   
