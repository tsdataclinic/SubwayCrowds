
export type Line = {
    name: string,
    icon: any,
    id:string
}

export type Station ={
    name: string,
    turnstile_name: string,
    lines:string[],
    id:string
}

export type Stop= {
    line:string,
    station:string,
    id: string
}

export type HourlyObservation={
    hour: number,
    numPeople:number
}

export type CrowdingObservation ={
    stationID: string,
    lineID: string,
    hour: number,
    numPeople:number
}

export type RawCrowding ={
    STATION: string,
    route_id: string,
    hr: number,
    crowd:number
}
