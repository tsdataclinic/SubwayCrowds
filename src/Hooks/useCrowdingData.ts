import {useState,useEffect} from 'react'
import Papa from 'papaparse'

type CrowdingDatum = {
    x:Number,
    y:Number
}

type RawCrowding={
    STATION: string,
    route_id: string,
    hr: Number,
    crowd: Number
}

export const useCrowdingData = (station :any , line:any)=>{
    const [crowdingData,setCrowdingData] = useState<RawCrowding[] | null >(null)
    const [stationcrowd, setStationCrowd] = useState<CrowdingDatum[] | null | undefined >(null)
    console.log(station, line)
    useEffect( ()=> {
        const data = crowdingData?.filter((row)=> row.STATION === station && row.route_id === line)
                                  .map((row) => ({x: row.hr, y: row.crowd} as CrowdingDatum))
        setStationCrowd(data)
    },[station, line, crowdingData])

    useEffect( ()=>{
        Papa.parse('https://raw.githubusercontent.com/tsdataclinic/mta-accessibility/crowding_analysis/analysis/train_crowding/data/Apr_crowd_estimates.csv?token=AC5ZOMVWWASL6UOOGA6YOIS7CGSUS',{
            download:true,
            complete: (data :any)=> setCrowdingData(data.data),
            header:true,
            dynamicTyping: {hr: true, crowd: true}
        })
    },[])
    return stationcrowd
}