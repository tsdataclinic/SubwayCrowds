import React from 'react'
import {CrowdingObservation, Stop} from '../../types'
import {Styles} from './StopsChartStyles'

type Props={
    stops: Stop[] | null,
    stopCount: CrowdingObservation[] | null
}

export const StopsChart = ({stops, stopCount}:Props)=>{
    const maxStopCount = Math.max(...stopCount?.map(sc=>sc.numPeople).filter(a=>a))

    const scoreForStop = (stationID:string) => {
        const count = stopCount?.find(sc=>sc.stationID === stationID)?.numPeople
        return count ? count : 0
    }
    // debugger
    return (
        <Styles.Container>
            {stops && stops.map(stop=>
                <>
                    <Styles.StopName key={`${stop.station}_name`}>{stop.station}</Styles.StopName>
                    <Styles.StopBar key={`${stop.station}_bar`} percent={scoreForStop(stop?.id)*100.0/maxStopCount}>
                        {Math.floor(scoreForStop(stop?.id)).toLocaleString()}
                    </Styles.StopBar>
                </>
            )}
        </Styles.Container>
    )
}