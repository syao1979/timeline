import React, { useEffect } from "react";

// import Box from "@mui/material/Box";
import Slider from "@mui/material/Slider";

import { normalizeYear } from "../../utils/Formatter";

const TimelineRange = ({
  limits, // min and max of the range
  value, // current value
  setRange,
  handleChange,
}) => {
  const [currentVal, setCurrentValue] = React.useState(value);
  useEffect(() => {
    setCurrentValue(value);
  }, [value]);

  const minDistance = parseInt((limits[1] - limits[0]) * 0.2); //minDist();
  // console.log(minDistance, value, limits, "[minDistance]");
  const onChange = (_event, newValue, activeThumb) => {
    if (!Array.isArray(newValue)) {
      return;
    }

    let newRange = newValue;
    if (newValue[1] - newValue[0] < minDistance) {
      return;
      //-- the flowing code moves the min range move within the max range
      // if (activeThumb === 0) {
      //   const clamped = Math.min(newValue[0], limits[1] - minDistance);
      //   newRange = [clamped, clamped + minDistance];
      // } else {
      //   const clamped = Math.max(newValue[1], limits[0] + minDistance);
      //   newRange = [clamped - minDistance, clamped];
      // }
    }
    setCurrentValue(newRange);
    setRange(newRange, activeThumb);
  };

  return (
    <Slider
      min={limits[0]}
      max={limits[1]}
      getAriaLabel={() => "range"}
      value={currentVal}
      onChange={onChange}
      onChangeCommitted={handleChange}
      valueLabelDisplay="auto"
      // valueLabelDisplay="on"
      size="small"
      valueLabelFormat={(value) => <div>{normalizeYear(value)}</div>}
      style={{ marginTop: 16, marginLeft: 20 }}
    />
  );
};

export default TimelineRange;
