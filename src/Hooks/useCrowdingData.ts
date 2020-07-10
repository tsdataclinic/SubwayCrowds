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
    const [crowdingData,setCrowdingData] = useState<CrowdingDatum[] | null >(null)

    const standardizeCrowding = (data:any)=>{
        console.log(data)
    }


    useEffect(()=>{
        if(station && line){
            const data = [...Array(24)].map((_:any, i:Number) => ({x:i, y: Math.random()*30}) )
            setCrowdingData(data)
        }
    },[station,line])
    useEffect( ()=>{
        Papa.parse('https://raw.githubusercontent.com/tsdataclinic/mta-accessibility/crowding_analysis/analysis/train_crowding/data/Apr_crowd_estimates.csv?token=AC5ZOMVWWASL6UOOGA6YOIS7CGSUS',{
            download:true,
            complete: (data :any)=> standardizeCrowding(data.data),
            header:true
        })
    },[])
    return crowdingData
}