import React from "react";
import data from "../../assets/data/timeline";

import Spiral from "./TimelineSpiral/TimelineSpiral";
// import Demo from "./Demo/Demo";

const Timeline = (props) => {
  const THIS_YEAR = new Date().getFullYear();
  const DEFAULT_TIME_HEAD = data.findIndex((d) => d.name === "西周"); //黄帝"); // timeline "黄帝" index
  const DEFAULT_TIME_BUTT = data.findIndex((d) => d.name === "今年"); // timeline "今年" index
  data[DEFAULT_TIME_BUTT].start = THIS_YEAR;
  const FAR_YEAR = data[DEFAULT_TIME_HEAD].start; // timeline "黄帝" start
  const NEAR_YEAR = THIS_YEAR; // initial starting year in limeline, running backwards to past

  return (
    <div id="timeline" style={{ margin: 10 }}>
      <Spiral {...props} />
    </div>
  );
};

export default Timeline;
