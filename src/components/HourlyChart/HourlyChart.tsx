import React, {useState,useLayoutEffect, useRef, useEffect} from 'react'
import { Line } from "react-chartjs-2";
import {HourlyObservation} from '../../types'
import { am_pm_from_24 } from "../../utils";

type Props ={
    hourlyData : HourlyObservation[] | null,
    hour: Number | null
}

export  function HourlyChart({hourlyData, hour}:Props){
    const [width,setWidth] = useState<number>(0)
    const [height,setHeight] = useState<number>(0)
    const graphDiv = useRef<HTMLDivElement>(null)

    const onResize = ()=>{
            const dims = graphDiv.current?.getBoundingClientRect()
            setWidth(dims ? dims.width : 0 )
            setHeight(dims ? dims.height : 0 )
    }

    useEffect(()=>{
        window.addEventListener('resize', onResize)
        return ()=> window.removeEventListener('resize',onResize)
    },[])

    return(
        <div className='hourly-chart'>
             {hourlyData ? (
            <>
             
              <h2>
                Estimated maximum number of people you are likely to encounter on this
                trip each hour.
              </h2>
              <div ref={graphDiv} style={{flex:1, overflow:'hidden'}}>
                <Line
                    data={{
                    datasets: [
                        {
                        data: hourlyData.map((c) => ({
                            x: c.hour,
                            y: c.numPeople,
                        })),
                        label: "Number of people per hour",
                        backgroundColor: "rgba(112,214,227,0.4)",
                        borderColor: "rgba(112,214,227,1)",
                        },
                    ],
                    redraw:true,
                    labels: hourlyData.map((c) => c.hour),
                    }}

                    width={width}
                    height={height}

                    options={{
                    maintainAspectRatio: false,
                    
                    responsive:true,
                    legend: {
                        display: false,
                    },
                    scales: {
                        yAxes: [
                        {
                            scaleLabel: {
                            display: true,
                            labelString: "Number of people",
                            },
                        },
                        ],
                        xAxes: [
                        {
                            scaleLabel: {
                            display: true,
                            labelString: "Hour of Day",
                            },
                            ticks: {
                            callback: (hour: number) => am_pm_from_24(hour),
                            },
                        },
                        ],
                    },
                    }}
                />
              </div>
            </>
          ) : (
            <h1>No data available</h1>
          )}
        </div>
    )
}