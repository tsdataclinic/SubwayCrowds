import {useState,useEffect, useContext} from 'react'
import {CrowdingObservation,HourlyObservation, Stop, Direction, CarsByLine} from '../types'
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
    const {crowdingData, carsByLine} = useContext(DataContext)
    if(stops && crowdingData && carsByLine){

        const stationIDS = stops.map(s=>s.id)
        const lines = stops.map(s=>s.line)

        // const stopCounts  = crowdingData.filter(cd=> stationIDS.includes(cd.stationID) && lines.includes(cd.lineID))
        // const stopCounts = stops.map(stop=> crowdingData.find(s=> stop.id === s.stationID && stop.line === s.lineID))
        const median = (arr: number[]) => {
            const mid = Math.floor(arr.length / 2), nums = [...arr].sort((a, b) => a - b);
            return arr.length % 2 !== 0 ? nums[mid] : (nums[mid - 1] + nums[mid]) / 2;
        }
        const stopCounts  = crowdingData.filter(cd => stationIDS.includes(cd.stationID) && lines.includes(cd.lineID))
        // Use median number of cars instead of min or max to get the most reasonable absolute max per car
        const medianNumCars = median([...carsByLine.map(x => x ? x.num_cars : 1)])
        const absoluteMaxCurentPerCar = (stopCounts ? Math.max(...stopCounts.map(cd=> cd ? cd.numPeople : 0)) : 0) / medianNumCars;
        const absoluteMaxMonthPerCar = (stopCounts ? Math.max(...stopCounts.map(cd=>cd ? cd.numPeopleLastMonth : 0)) : 0) / medianNumCars;
        const absoluteMaxYearPerCar = (stopCounts ? Math.max(...stopCounts.map(cd=>cd ? cd.numPeopleLastYear :0 )) : 0) / medianNumCars;
        return {
            current: absoluteMaxCurentPerCar,
            month: absoluteMaxMonthPerCar,
            year: absoluteMaxYearPerCar
        }
    }
    else{
        return null
    }
}

    const getCarsForLine = (carsByLine : CarsByLine[] | null, lineID:string | null | undefined):number => {
        if(carsByLine && lineID){
            const val = carsByLine?.find(x => lineID === x.line)
            if(val){
                return val.num_cars
            }
            else{
                return 0
            }
        } 
        else{
            return 0
        }
    }

export const useMaxCrowdingByHourForTrip = (stops:Stop[] |null, order: Direction|null , weekday:boolean)=>{
    const {crowdingData, carsByLine} = useContext(DataContext)
    const [data,setData] = useState<HourlyObservation[] | null>(null)
    useEffect(()=>{
        if(stops && crowdingData && (order!==null)){
            const lines = stops.map(s=>s.line)
            const stations = stops.map(s=> s.id)
            const hourlyStopData = crowdingData.filter(cd => lines.includes(cd.lineID) && stations.includes(cd.stationID) &&  (cd.direction===order) && (cd.weekday === weekday ))
            const maxByHour: HourlyObservation[] = [];
            for(let hour =0; hour< 24; hour++){
                const counts = hourlyStopData?.filter(obs=>(obs.hour===hour)).filter(filerTruthy)
                const countsCurrent = counts.map(obs => Math.round(obs.numPeople / getCarsForLine(carsByLine, obs.lineID) ))
                const countsLastMonth = counts.map(obs => Math.round(obs.numPeopleLastMonth / getCarsForLine(carsByLine, obs.lineID)))
                const countsLastYear = counts.map(obs => Math.round(obs.numPeopleLastYear / getCarsForLine(carsByLine, obs.lineID)))

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

export const useCrowdingDataByStops = (stops:Stop[] | null, hour:number | null, order: Direction|null, weekday:boolean)=>{
    const {crowdingData, carsByLine} = useContext(DataContext)
    const [data, setData] = useState<CrowdingObservation[] | null | undefined>(null)

    useEffect(()=>{
                if(stops && hour && crowdingData && carsByLine){
            const stopCounts = stops.map(stop=> crowdingData.find(s=>s.hour=== hour && stop.id === s.stationID && stop.line === s.lineID && s.direction===order && s.weekday===weekday)).filter(filerTruthy)
            const stopCountsPerCar = stopCounts.map(stop => {
                const currentCountPerCar = Math.round( (stop?.numPeople ? stop.numPeople : 0 ) / getCarsForLine(carsByLine,stop?.lineID ))                
                const lastMonthCountPerCar = Math.round( (stop?.numPeopleLastMonth ? stop.numPeopleLastMonth :0) / getCarsForLine(carsByLine,stop?.lineID ))
                const lastYearCountPerCar = Math.round( ( stop?.numPeopleLastYear ? stop?.numPeopleLastYear : 0 ) / getCarsForLine(carsByLine,stop?.lineID ))
                return {
                    direction: stop?.direction,
                    hour: stop?.hour,
                    lineID: stop?.lineID,
                    numPeople: currentCountPerCar,
                    numPeopleLastMonth: lastMonthCountPerCar,
                    numPeopleLastYear: lastYearCountPerCar,
                    stationID: stop?.stationID,
                    weekday: stop?.weekday
                }
            })         
            setData(stopCountsPerCar.filter(filerTruthy))
            }
    },[stops,hour, crowdingData, weekday,order])

    return data
}
                                   
