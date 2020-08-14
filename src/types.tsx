export type Line = {
  name: string;
  icon: any;
  id: string;
};

export type Station = {
  name: string;
  turnstile_name: string;
  lines: string[];
  id: string;
};

export type Stop = {
  line: string;
  station: string;
  id: string;
  order: number;
};

export type HourlyObservation = {
  hour: number;
  numPeople: number;
};

export enum Direction {
  NORTHBOUND,
  SOUTHBOUND,
}

export type CrowdingObservation = {
  stationID: string;
  lineID: string;
  hour: number;
  numPeople: number;
  direction: Direction;
  weekday: boolean;
};

export type RawCrowding = {
  STATION: string;
  route_id: string;
  hour: number;
  current_crowd: number;
  direction_id: number;
  weekday: number;
};
