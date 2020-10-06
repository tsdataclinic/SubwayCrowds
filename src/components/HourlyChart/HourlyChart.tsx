import React, {useState, useRef, useEffect} from 'react'
import { Line } from "react-chartjs-2";
import {HourlyObservation, MetricType} from '../../types'
import { am_pm_from_24, DataTypeColor } from "../../utils";
import * as ChartAnnotation from 'chartjs-plugin-annotation'

type Props ={
    hourlyData : HourlyObservation[] | null,
    hour: number 
}

export function HourlyChart({hourlyData, hour}:Props){
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
                    key='graph'
                    data={{
                        datasets: [
                            {
                            data: hourlyData.map((c) => ({
                                x: c.hour,
                                y: c.numPeople,
                            })),
                            label: "Current",
                            backgroundColor:  DataTypeColor(MetricType.CURRENT, 0.4) ,
                            borderColor: DataTypeColor(MetricType.CURRENT, 1) ,
                            },
                            {
                            data: hourlyData.map((c) => ({
                                x: c.hour,
                                y: c.numPeopleLastMonth,
                            })),
                            label: "1 month ago",
                            backgroundColor:'rgba(0,0,0,0)',
                            borderColor: DataTypeColor(MetricType.MONTH, 1.0),
                            },
                            {
                            data: hourlyData.map((c) => ({
                                x: c.hour,
                                y: c.numPeopleLastYear,
                            })),
                            label: "1 year ago",
                            backgroundColor:'rgba(0,0,0,0)',
                            borderColor: DataTypeColor(MetricType.YEAR,1.0),
                            },
                        ],
                    
                        labels: hourlyData.map((c) => c.hour),
                    }}

                    width={width}
                    height={height}
                    redraw={false}

                    options={{
                        maintainAspectRatio: false,
                        responsive:true,
                        legend: {
                            display: true,
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
                        annotation:{
                            annotations:[
                                {
                                    type:'line',
                                    mode:'vertical',
                                    scaleID:'x-axis-0',
                                    value: hour ,
                                    borderColor:'black',
                                    borderWidth: 1,
                                }
                            ]
                        }
                    }}

                    plugins={[ChartAnnotation]}
                />
              </div>
            </>
          ) : (
            <h1>No data available</h1>
          )}
        </div>
    )
}