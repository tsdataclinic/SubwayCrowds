import React from "react";
import { Styles } from "./HourSliderStyles";
import Slider from "react-input-slider";

type HourSliderProps = {
  hour: number;
  onSetHour: (hour: number) => void;
};
export function HourSlider({ hour, onSetHour }: HourSliderProps) {
  return (
    <Styles.HourSliderContainer>
      <Slider
        axis="x"
        x={hour}
        onChange={({ x }) => onSetHour(x)}
        xmax={23}
        xmin={0}
        xstep={1}
        styles={{
          track: {
            width: "100%",
          },
          active: {
            backgroundColor: "#27a3aa",
          },
        }}
      />

      <Styles.Caption>
        Use slider to change the start time of the trip
      </Styles.Caption>
    </Styles.HourSliderContainer>
  );
}
