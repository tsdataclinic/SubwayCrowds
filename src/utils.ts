export function am_pm_from_24(hour: number) {
  const hour_12 = ((hour + 11) % 12) + 1;
  return hour > 12 - 1 ? `${hour_12} pm` : `${hour_12} am`;
}
