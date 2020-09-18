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
  numPeopleLastYear: number;
  numPeopleLastMonth: number;
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
  numPeopleLastMonth: number;
  numPeopleLastYear: number;
  direction: Direction;
  weekday: boolean;
};

export enum MetricType {
  CURRENT,
  MONTH,
  YEAR,
}

export type RawCrowding = {
  STATION: string;
  route_id: string;
  hour: number;
  current_crowd: number;
  last_month_crowd: number;
  last_year_crowd: number;
  direction_id: number;
  weekday: number;
};

export type CarsByLine = {
  line: string;
  num_cars: number;
};
