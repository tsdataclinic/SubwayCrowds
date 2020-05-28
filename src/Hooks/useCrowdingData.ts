import {useState,useEffect} from 'react'

type CrowdingDatum = {
    x:Number,
    y:Number
}

export const useCrowdingData = (station :any , line:any)=>{
    const [crowdingData,setCrowdingData] = useState<CrowdingDatum[] | null >(null)
    useEffect(()=>{
        if(station && line){
            const data = [...Array(24)].map((_:any, i:Number) => ({x:i, y: Math.random()*30}) )
            setCrowdingData(data)
        }
    },[station,line])
    return crowdingData
}