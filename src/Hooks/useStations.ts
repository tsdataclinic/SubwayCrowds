import {useState,useEffect} from 'react'
import Pappa from 'papaparse'

type Line = {
    name: string,
    icon: any
}

type Station ={
    name: string,
    lines:string[]
}

type RawStation={
    station_name: string,
    clean_lines: string,
    station_lines: string,
    el_station_name: string,
    el_lines: string,
    equipments:string
}

export const useStationLines = ()=>{    


    const [stations,setStations] = useState<Station[]>([])
    const [lines,setLines] = useState<Line[]>([])

    const standardizeData = (data:RawStation[])=>{
        const stationList = Array.from(new Set(data.map( station=>(station.station_name))))

        const stations: (Station | null)[] = stationList.map( (stationName: string) =>{
            const station = data.find( s=>s.station_name === stationName)
            if(station){
              return {
                 name: station?.station_name,
                 lines: station?.clean_lines ? station.clean_lines.split("") : []
                } as Station
            }
            else{
                return null
            }
        })

        const lineList:any[] = Array.from(stations.reduce((list: Set<string>,station:Station | null)=>{
            station?.lines.forEach( (l:string)=> list.add(l))
            return list
        }, new Set()))

        setStations(stations.filter(s=>s!==undefined) as Station[])

        setLines(lineList.map((line:string)=>({
            name:line,
            icon:`https://raw.githubusercontent.com/louh/mta-subway-bullets/master/svg/${line.toLocaleLowerCase()}.svg`
        })))
    }
    useEffect( ()=>{
        Pappa.parse('https://raw.githubusercontent.com/tsdataclinic/mta-accessibility/master/data/crosswalk/Master_crosswalk.csv?token=AABTHLQQ7DF4Y2VDZYJ62PK63EZFA',{
            download:true,
            complete: (data :any)=> standardizeData(data.data),
            header:true
        })
    },[])

    return {stations,lines}
}