import { MetricType } from "./types";

export function am_pm_from_24(hour: number) {
  const hour_12 = ((hour + 11) % 12) + 1;
  return hour > 12 - 1 ? `${hour_12} pm` : `${hour_12} am`;
}

export function DataTypeColor(type: MetricType, opacity: number | undefined) {
  const o = opacity ? opacity : 1;

  switch (type) {
    case MetricType.CURRENT:
      return `rgba(255,187,49,${o})`;
    case MetricType.MONTH:
      return `rgba(28,76,93,${o})`;
    case MetricType.YEAR:
      return `rgba(112,214,227,${o})`;
  }
}

export function filerTruthy<T>(t: T | undefined): t is T {
  return !!t;
}
