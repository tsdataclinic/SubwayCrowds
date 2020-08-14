import React from 'react'
import {CrowdingObservation, Stop} from '../../types'
import {Styles} from './StopsChartStyles'

type Props={
    stops: Stop[] | null,
    stopCount: CrowdingObservation[] | null,
    maxCount: number | null
}

export const StopsChart = ({stops, stopCount, maxCount}:Props)=>{
    const maxStopCount =  maxCount ? maxCount :  Math.max(...stopCount?.map(sc=>sc.numPeople).filter(a=>a))

    const scoreForStop = (stationID:string) => {
        const count = stopCount?.find(sc=>sc.stationID === stationID)?.numPeople
        return count ? count : 0
    }

    return (
        <Styles.Container>
            {stops && stops.map(stop=>
                <>
                    <Styles.StopName key={`${stop.station}_name`}>{stop.station}</Styles.StopName>
                    <Styles.StopBar key={`${stop.station}_bar`} percent={scoreForStop(stop?.id)*100.0/maxStopCount}>
                        <span>{Math.floor(scoreForStop(stop?.id)).toLocaleString()}</span>
                    </Styles.StopBar>
                </>
            )}
        </Styles.Container>
    )
}   