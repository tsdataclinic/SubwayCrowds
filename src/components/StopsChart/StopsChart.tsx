import React, {useState} from 'react'
import {CrowdingObservation, Stop, MetricType} from '../../types'
import {Styles} from './StopsChartStyles'

type Props={
    stops: Stop[] | null,
    stopCount: CrowdingObservation[] | null,
    maxCount: number | null
}

export const StopsChart = ({stops, stopCount, maxCount}:Props)=>{
    const [showMonth, setShowMonth] = useState<boolean>(false)
    const [showYear, setShowYear] = useState<boolean>(false)
    const maxStopCount = Math.max(...stopCount?.map(sc=>(
        Math.max(sc.numPeople, showMonth ? sc.numPeopleLastMonth : 0, showYear ? sc.numPeopleLastYear : 0)
    )).filter(a=>a)
    )

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

    return (
        <Styles.Container>
            <Styles.Metric>
                <span>Compare to: </span>
                <Styles.MetricToggle set={showMonth} onClick={()=>setShowMonth(!showMonth)}>Last Month</Styles.MetricToggle>
                <Styles.MetricToggle set={showYear} onClick={()=>setShowYear(!showYear)}>Last Year</Styles.MetricToggle> 
            </Styles.Metric>

            <Styles.BarsContainer>
                {stops && stops.map(stop=>
                    <>
                        <Styles.StopName key={`${stop.station}_name`}>{stop.station}</Styles.StopName>
                        <Styles.StopBars  key={`${stop.station}_bar`}>
                            <Styles.StopBar key='current' type={'current'} percent={scoreForStop(stop?.id, MetricType.CURRENT)*100.0/maxStopCount}>
                                <span>{Math.floor(scoreForStop(stop?.id, MetricType.CURRENT)).toLocaleString()}</span>
                            </Styles.StopBar>
                            {showMonth && 
                                <Styles.StopBar 
                                    key='month' 
                                    type={'month'} 
                                    percent={scoreForStop(stop?.id, MetricType.MONTH)*100.0/maxStopCount}
                                />
                            }

                            {showYear &&
                                <Styles.StopBar 
                                    key='year' 
                                    type={'year'} 
                                    percent={scoreForStop(stop?.id, MetricType.YEAR)*100.0/maxStopCount}
                                />
                            }
                        </Styles.StopBars>
                    </>
                )}
            </Styles.BarsContainer>
        </Styles.Container>
    )
}   