import React from "react";

// import Box from "@mui/material/Box";
import Slider from "@mui/material/Slider";

import { normalizeYear } from "../../utils/Formatter";

const TimelineRange = ({
  limits, // min and max of the range
  value, // current value
  handleChange,
}) => {
  return (
    <Slider
      min={limits[0]}
      max={limits[1]}
      getAriaLabel={() => "range"}
      value={value}
      onChange={handleChange}
      valueLabelDisplay="auto"
      // valueLabelDisplay="on"
      size="small"
      valueLabelFormat={(value) => <div>{normalizeYear(value)}</div>}
      style={{ marginTop: 16, marginLeft: 20 }}
    />
  );
};

export default TimelineRange;
