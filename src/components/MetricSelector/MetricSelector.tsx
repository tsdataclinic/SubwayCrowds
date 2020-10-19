import React from "react";
import { Styles } from "./MetricSelectorStyles";

export enum MetricType {
  Hour = "hour",
  Stops = "stops",
}
type MetricSelectorProps = {
  metric: MetricType;
  onSetMetric: (metric: MetricType) => void;
};

export function MetricSelector({ metric, onSetMetric }: MetricSelectorProps) {
  return (
    <Styles.MetricSelectorContainer>
      <Styles.MetricTab
        selected={metric === MetricType.Hour}
        onClick={() => onSetMetric(MetricType.Hour)}
      >
        By Hour
      </Styles.MetricTab>
      <Styles.MetricTab
        selected={metric === MetricType.Stops}
        onClick={() => onSetMetric(MetricType.Stops)}
      >
        By Stop
      </Styles.MetricTab>
    </Styles.MetricSelectorContainer>
  );
}
