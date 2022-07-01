import React, { useState, useCallback } from "react";

import classes from "./Timeline.module.css";
import Spiral from "./TimelineSpiral/TimelineSpiral";
// import Demo from "./Demo/Demo";

const data = [
  [10, 30, 40, 20],
  [10, 40, 30, 20, 50, 10],
  [60, 30, 40, 20, 30],
];

// function valuetext(value) {
//   return `${value}°C`;
// }

const Timeline = () => {
  const size = 500;
  const spiralConf = {
    width: size,
    height: size,
    m_top: 0,
    m_bottom: 0,
    m_left: 0,
    m_right: 0,
  };
  const lineConf = {
    width: 800,
    height: 150,
    data,
  };

  const debug = false;
  return (
    <div style={{ paddingLeft: 20 }}>
      <Spiral {...spiralConf} />
    </div>
  );
};

export default Timeline;
