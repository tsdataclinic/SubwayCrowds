export function am_pm_from_24(hour: number) {
  const hour_12 = ((hour + 11) % 12) + 1;
  return hour > 12 - 1 ? `${hour_12} pm` : `${hour_12} am`;
}

export function DataTypeColor(
  type: "current" | "month" | "year",
  opacity: number
) {
  switch (type) {
    case "current":
      return `rgba(22,150,210,${opacity})`;
    case "month":
      return `rgba(236,0,139,${opacity})`;
    case "year":
      return `rgba(253,191,17,${opacity})`;
  }
}

export function filerTruthy<T>(t: T | undefined): t is T {
  return !!t;
}
