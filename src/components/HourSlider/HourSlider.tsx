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
  markLabel: {
    fontFamily: 'lato',
    fontSize: '12px',
    color: 'grey'
  }
})(Slider);

type HourSliderProps = {
  hour: number;
  onSetHour: (hour: number) => void;
};

const marks = [
  {
    value: 2,
    label: '2 am',
  },
  {
    value: 6,
    label: '6 am',
  },
  {
    value: 10,
    label: '10 am',
  },
  {
    value: 14,
    label: '2 pm',
  },
  {
    value: 18,
    label: '6 pm',
  },
  {
    value: 22,
    label: '10 pm',
  },
];

export function HourSlider({ hour, onSetHour }: HourSliderProps) {
  const formatValue = (hour: number) => am_pm_from_24(hour);
  return (
    <Styles.HourSliderContainer>
      <HSlider
        step={1}
        min={0}
        max={24}
        marks={marks}
        getAriaValueText={formatValue}
        valueLabelFormat={formatValue}
        value={hour}
        onChange={(e: React.ChangeEvent<any>, hour: number | number[]) =>
          onSetHour(hour as number)
        }
      />
      <Styles.Caption>
        Use slider to change the start time of the trip
      </Styles.Caption>
    </Styles.HourSliderContainer>
  );
}
