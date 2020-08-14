import React from 'react'
import {CrowdingObservation, Stop} from '../../types'
import {Styles} from './StopsChartStyles'

type Props={
    stops: Stop[] | null,
    stopCount: CrowdingObservation[] | null,
    maxCount: number | null
}

export const StopsChart = ({stops, stopCount, maxCount}:Props)=>{
    const maxStopCount =  maxCount ? maxCount :  Math.max(...stopCount?.map(sc=>Math.max(sc.numPeople, sc.numPeopleLastMonth, sc.numPeopleLastYear)).filter(a=>a))

    const scoreForStop = (stationID:string, type: 'current' | 'month' | 'year') => {
        const stop = stopCount?.find(sc=>sc.stationID === stationID)
        if(stop){
            switch(type){
                case 'current':
                    return stop.numPeople
                case 'month':
                    return stop.numPeopleLastMonth
                case 'year':
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
            {stops && stops.map(stop=>
                <>
                    <Styles.StopName key={`${stop.station}_name`}>{stop.station}</Styles.StopName>
                    <Styles.StopBars  key={`${stop.station}_bar`}>
                        <Styles.StopBar key='current' type={'current'} percent={scoreForStop(stop?.id, 'current')*100.0/maxStopCount}>
                            <span>{Math.floor(scoreForStop(stop?.id, 'current')).toLocaleString()}</span>
                        </Styles.StopBar>

                         <Styles.StopBar 
                            key='month' 
                            type={'month'} 
                            percent={scoreForStop(stop?.id, 'month')*100.0/maxStopCount}
                        />

                        <Styles.StopBar 
                            key='year' 
                            type={'year'} 
                            percent={scoreForStop(stop?.id, 'year')*100.0/maxStopCount}
                        />
                    </Styles.StopBars>
                </>
            )}
        </Styles.Container>
    )
}   