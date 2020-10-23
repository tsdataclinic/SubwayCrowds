import React from "react";
import { Styles } from "./HourSliderStyles";
import Slider from "@material-ui/core/Slider";
import { withStyles } from "@material-ui/core/styles";
import { am_pm_from_24 } from "../../utils";

const HSlider = withStyles({
  root: {
    color: "#27a3aa",
    height: 8,
  },
})(Slider);

type HourSliderProps = {
  hour: number;
  onSetHour: (hour: number) => void;
};
export function HourSlider({ hour, onSetHour }: HourSliderProps) {
  const formatValue = (hour: number) => am_pm_from_24(hour);
  return (
    <Styles.HourSliderContainer>
      <HSlider
        step={1}
        min={0}
        max={24}
        marks={true}
        getAriaValueText={formatValue}
        valueLabelFormat={formatValue}
        value={hour}
        onChange={(e: React.ChangeEvent<{}>, hour: number | number[]) =>
          onSetHour(hour as number)
        }
      />
      <Styles.Caption>
        Use slider to change the start time of the trip
      </Styles.Caption>
    </Styles.HourSliderContainer>
  );
}
