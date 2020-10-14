import React, {useState} from 'react'
import {CrowdingObservation, Stop, MetricType} from '../../types'
import {Styles} from './StopsChartStyles'
import {ToggleButton} from '../ToggleButton/ToggleButton'


type MaxCounts={
    current:number,
    month: number,
    year: number
}

export enum StopChartType{
    Continuous,
    Discrete
}

type Props={
    stops: Stop[] | null,
    stopCount: CrowdingObservation[] | null,
    maxCounts?: MaxCounts | null
    variant : StopChartType 
}


export const StopsChart = ({stops, stopCount, maxCounts, variant=StopChartType.Continuous}:Props)=>{
    const [showMonth, setShowMonth] = useState<boolean>(false)
    const [showYear, setShowYear] = useState<boolean>(false)

    const maxStopCount = maxCounts ? Math.max(maxCounts.current, showMonth ? maxCounts.month : 0, showYear ? maxCounts.year : 0) : 0

    const scoreForStop = (stationID:string, metric: MetricType) => {
        const stop = stopCount?.find(sc=>sc.stationID === stationID)
        if(stop){
            switch(metric){
                case MetricType.CURRENT:
                    return stop.numPeople
                case MetricType.MONTH:
                    return stop.numPeopleLastMonth
                case MetricType.YEAR:
                    return stop.numPeopleLastYear
            } 
        }
        return 0
    }

    const scoreForStopMonth = (stationID:string) => {
        const count = stopCount?.find(sc=>sc.stationID === stationID)?.numPeopleLastMonth
        return count ? count : 0
    }

    const scoreForStopYear = (stationID:string) => {
        const count = stopCount?.find(sc=>sc.stationID === stationID)?.numPeopleLastYear
        return count ? count : 0
    }
    const squareBuckets = [5,10,15,20,25,30,35,40,45,50]
    const bucketColors  = ['#eff5d9', '#dde5c2', '#ccd5ab', '#bac595', '#a9b67f', '#97a76a', '#869755', '#758940', '#647a2a', '#536c12']

    const makeStopSquares = (occupancy:number)=>{
        let bin : number | null = null;
        squareBuckets.forEach ((bucket,i)=> {if(bucket > occupancy && bin===null){ bin = i}} )
        if(bin === null){
            bin = squareBuckets.length
        }

        const binEdges = (bin:number)=>{
            if(bin ===0 ){
                return `< ${squareBuckets[bin]}` 
            } 
            else if (bin < squareBuckets.length ){
                return `${squareBuckets[bin-1]} - ${squareBuckets[bin]}`
            }
            else{
                return `> ${squareBuckets[bin-1]}`
            }
        }

        return <>
             { [...Array(bin+1)].map((_,i)=>
            <Styles.StopSquare key={i} order={i}  color={bucketColors[i]} />    
             )
             }
             <span> {binEdges(bin)} </span>
             </>
    }

    return (
        <Styles.Container>
            {variant === StopChartType.Continuous &&
                <Styles.Metric>
                    <span>Compare to: </span>
                    <ToggleButton set={showMonth} metric={MetricType.MONTH} onClick={()=>setShowMonth(!showMonth)}>1 month ago</ToggleButton>
                    <ToggleButton set={showYear} metric={MetricType.YEAR} onClick={()=>setShowYear(!showYear)}>1 year ago</ToggleButton> 
                </Styles.Metric>
            }

            <Styles.BarsContainer>
                {stops && stops.map(stop=>
                    <>
                        {variant === StopChartType.Continuous &&
                            <>
                                <Styles.StopName key={`${stop.station}_name`}><span>{stop.station}</span></Styles.StopName>
                                <Styles.StopBars  key={`${stop.station}_bar`}>
                                    <Styles.StopBar key='current' metric={MetricType.CURRENT} percent={scoreForStop(stop?.id, MetricType.CURRENT)*100.0/maxStopCount}>
                                        <span>{Math.floor(scoreForStop(stop?.id, MetricType.CURRENT)).toLocaleString()}</span>
                                    </Styles.StopBar>
                                    {showMonth && 
                                        <Styles.StopBar 
                                            key='month' 
                                            metric={MetricType.MONTH} 
                                            percent={scoreForStop(stop?.id, MetricType.MONTH)*100.0/maxStopCount}
                                        />
                                    }

                                    {showYear &&
                                        <Styles.StopBar 
                                            key='year' 
                                            metric={MetricType.YEAR} 
                                            percent={scoreForStop(stop?.id, MetricType.YEAR)*100.0/maxStopCount}
                                        />
                                    }
                                </Styles.StopBars>
                            </>
                        }
                        {variant === StopChartType.Discrete && 
                            <>
                            <Styles.StopName key ={`${stop.station}_name`}><span>{stop.station}</span></Styles.StopName>
                            <Styles.StopSquares key={`${stop.station}`}>
                                {makeStopSquares(scoreForStop(stop?.id, MetricType.CURRENT))}
                            </Styles.StopSquares>
                            </>
                        }
                    </>
                )}
            </Styles.BarsContainer>
        </Styles.Container>
    )
}   
