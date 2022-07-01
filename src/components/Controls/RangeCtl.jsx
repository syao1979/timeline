import React from "react";

import Box from "@mui/material/Box";
import Slider from "@mui/material/Slider";

const TimelineRange = ({
  limits, // min and max of the range
  value, // current value
  handleChange,
  width = 300,
  marginTop = 20,
}) => {
  return (
    <Box sx={{ width }} style={{ marginTop }}>
      <Slider
        min={limits[0]}
        max={limits[1]}
        getAriaLabel={() => "range"}
        value={value}
        onChange={handleChange}
        valueLabelDisplay="auto"
      />
    </Box>
  );
};

export default TimelineRange;
