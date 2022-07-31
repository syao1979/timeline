import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";

import * as d3 from "d3";
import { select } from "d3";

import { isMobile } from "react-device-detect";

import timelineData from "../../../assets/data/timeline";
import monarch from "../../../assets/data/monarch";
import science from "../../../assets/data/science";

import RangeCtl from "../../Controls/RangeCtl";
import SelectCtl from "../../Controls/SelectCtl";
import MoreMenu from "../../Controls/MoreMenu";
import AvertaCtl, {
  TYPE_SPIRAL,
  TYPE_MARK,
  TYPE_SCALE,
  TYPE_RESET,
} from "../../Controls/AvertarCtl";

import {
  normalizeYear,
  cleanNameString,
  notNull,
} from "../../../utils/Formatter";
import timeline from "../../../assets/data/timeline";

const BODY_PADDING = 9; // document has this padding that affects the topmost div
const SPIRAL_R = 250;
const SPIRAL_START = 0;
const SPIRAL_END = 2; // need to be even number to end at top
const SPIRAL_LOOP_ARRAY = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];

const TAIL_GAP = 20; //tail left/right gap to svg rect
const RECT_OPACITY = 0.6;
const BLOCK_MIN_GAP = 28;
const GROUP_LEAD_WIDTH = 6;
const CIRCLE_R = 4.5;
const groupColor = d3.scaleOrdinal(d3.schemeCategory10); // used to assign nodes color by group
const ROTATE = false;
const LINE_SIZE = 1;

const THIS_YEAR = new Date().getFullYear();
const DEFAULT_TIME_HEAD = timeline.findIndex((d) => d.name === "西周"); //黄帝"); // timeline "黄帝" index
const DEFAULT_TIME_BUTT = timeline.findIndex((d) => d.name === "今年"); // timeline "今年" index
timeline[DEFAULT_TIME_BUTT].start = THIS_YEAR;
const FAR_YEAR = timeline[DEFAULT_TIME_HEAD].start; // timeline "黄帝" start
const NEAR_YEAR = THIS_YEAR; // initial starting year in limeline, running backwards to past

const TimelineSpiral = ({ changePlot, changePlotLabel }) => {
  const [spiralConfig, setSpiralConfig] = useState(null);
  const [plotConfig, setPlotConfig] = useState(null);
  const [plotData, setPlotData] = useState(null);
  const [tipPosition, setTipPositioin] = useState(null);
  const [timeHeadArray, setTimeHeadArray] = useState({});
  const [timeHead, setTimeHead] = useState(DEFAULT_TIME_HEAD);
  const [timeButtArray, setTimeButtArray] = useState({});
  const [timeButt, setTimeButt] = useState(DEFAULT_TIME_BUTT);

  const [winSize, setWinSize] = useState({
    width: 500,
    height: 500,
    x0: 220,
    y0: 300,
  });
  const [yearLimits, setYearLimits] = useState([FAR_YEAR, NEAR_YEAR]); // year min and max
  const [yearWindow, setYearWindow] = useState([FAR_YEAR, NEAR_YEAR]); // current view year range
  const [spiralLoop, setSpiralLoops] = useState(SPIRAL_LOOP_ARRAY[1]);
  const [tailOnly, setTailOnly] = useState(false);
  const [timeMark, setTimeMark] = useState(false);
  const [timeUnit, setTimeUnit] = useState(false);
  const [zoomer, setZoomer] = useState(null);
  const [sliderObj, _setSliderObj] = useState(null);

  const [searchParams, _setSearchParams] = useSearchParams();
  const [portrait, setPortrait] = useState(false);
  const containerRef = useRef(null);

  const tailLength = () =>
    winSize.width - TAIL_GAP - (tailOnly ? TAIL_GAP : winSize.x0);

  const searchParamData = () => {
    const dict = {};
    for (const entry of searchParams.entries()) {
      const [param, value] = entry;
      dict[param] = value;
    }
    return Object.keys(dict).length > 0 ? dict : null;
  };

  const urlToIntRange = (value) => {
    return value.split(",").map((d) => parseInt(d));
  };

  const refresh = (param) => {
    navigate({
      pathname: window.location.pathname,
      search: param ? param : "",
    });
  };
  const updateURL = (key = null, value = null) => {
    if (!key) return;

    // console.log(key, value, "[updateURL]");
    const param = searchParams.get(key);
    if (param) {
      searchParams.delete(key);
    }

    if (notNull(value) && value !== false) {
      // not Null and not false
      searchParams.append(key, value);
    }

    const dict = searchParamData();
    const kwstr = dict
      ? `?${Object.keys(dict)
          .map((key) => `${key}=${dict[key]}`)
          .join("&")}`
      : "";
    refresh(kwstr);
  };

  const navigate = useNavigate();

  useEffect(() => {
    const boolMap = {
      tail: setTailOnly,
      mark: setTimeMark,
      unit: setTimeUnit,
    };
    const singleStrValMap = {
      loops: { fn: setSpiralLoops, default: 3 },
    };

    const singleIntValMap = {
      th: { fn: setTimeHead, default: DEFAULT_TIME_HEAD, current: timeHead },
      tb: { fn: setTimeButt, default: DEFAULT_TIME_BUTT, current: timeButt },
    };

    const rangeMap = {
      yl: { fn: setYearLimits, default: [FAR_YEAR, NEAR_YEAR] },
      yw: { fn: setYearWindow, default: [FAR_YEAR, NEAR_YEAR] },
    };

    const dict = searchParamData();

    Object.keys(boolMap).forEach((kname) => {
      const fn = boolMap[kname];
      // if (dict) console.log(kname, dict[kname], "[bM]");
      const value = dict ? dict[kname] !== undefined : false;
      fn(value);
    });

    Object.keys(singleStrValMap).forEach((kname) => {
      const fn = singleStrValMap[kname].fn;
      const urlVal = dict ? dict[kname] : null;
      const value = urlVal ? urlVal : singleStrValMap[kname].default;
      fn(value);
    });

    Object.keys(singleIntValMap).forEach((kname) => {
      const fn = singleIntValMap[kname].fn;
      const current = singleIntValMap[kname].current;
      const value = dict
        ? parseInt(dict[kname])
        : singleIntValMap[kname].default;

      if (value !== current) fn(isNaN(value) ? current : value);
    });

    Object.keys(rangeMap).forEach((kname) => {
      const fn = rangeMap[kname].fn;
      const vstr = dict ? dict[kname] : null;
      const value = vstr ? urlToIntRange(vstr) : rangeMap[kname].default;
      fn(value);
    });
  }, [searchParams]);

  const initZoom = () => {
    // install zoom/pan handler: ref https://www.d3indepth.com/zoom-and-pan/
    const zoom = d3
      .zoom()
      .scaleExtent([0.5, 4]) // do not zoom too small or too large
      .on("zoom", zoomHandler)
      .on("start", function (e) {
        // buttons === 1 when 3 finger down (for zooming)
        select("svg").style(
          "cursor",
          e.sourceEvent.buttons === 1 ? "move" : "nesw-resize"
        );
      })
      .on("end", function (e) {
        select("svg").style("cursor", "default");
      });

    // console.log(zoom, "[init zoom]");
    select("svg").call(zoom);
    setZoomer({ zoom });
  };

  useEffect(() => {
    const ordered = [];
    const lookup = {}; // from name str to order index
    const rlookup = {}; // from order index to name str
    timelineData.forEach((d, idx) => {
      ordered.push([d.start, d.name]);
      lookup[d.name] = { start: d.start, index: idx };
      rlookup[idx] = d.name;
    });
    const buttArray = ordered.slice(timeHead + 1);
    setTimeHeadArray({ ordered, lookup, rlookup });
    setTimeButtArray({ ordered: buttArray });

    initZoom();

    // window resize listener
    const handleResize = () => {
      const width = window.innerWidth - BODY_PADDING * 2; // offset the doc padding
      const height = window.innerHeight;
      setWinSize({ ...winSize, width, height });
      setPortrait(width / height < 0.8);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const theta = (r) => spiralLoop * Math.PI * r;
    const outerR = SPIRAL_R - 40; //d3.min([width, height]) / 2 - 40; // spiral outer radius
    const radius = d3
      .scaleLinear()
      .domain([SPIRAL_START, SPIRAL_END])
      .range([40, outerR]);

    const points = d3.range(
      SPIRAL_START,
      SPIRAL_END + 0.001,
      (SPIRAL_END - SPIRAL_START) / 1000
    ); //- data points for drawing the spiral

    const spiral = d3
      .radialLine()
      .curve(d3.curveCardinal)
      .angle(theta)
      .radius(radius);
    setSpiralConfig({ theta, radius, points, spiral });
  }, [spiralLoop]);

  useEffect(() => {
    updatePlotConfig();
  }, [spiralConfig, yearWindow, tailOnly, winSize]);

  useEffect(() => {
    if (plotData) {
    }
  }, [yearWindow, tailOnly]);

  const updatePlotConfig = () => {
    if (!spiralConfig) return;

    select("g").selectAll("*").remove(); // clear all elements - for redraw
    select("g").attr(
      "transform",
      `rotate(${ROTATE && portrait ? 90 : 0}) translate(${winSize.x0}, ${
        ROTATE && portrait ? -winSize.y0 : winSize.y0
      })`
    );
    select("svg")
      .style("width", winSize.width)
      .style("height", SPIRAL_R * 2);

    let spiralLen = 0;
    let path = null;
    if (!tailOnly) {
      // draw the spiral wire
      path = select("g")
        .append("path")
        .datum(spiralConfig.points)
        .attr("id", "spiral")
        .attr("d", spiralConfig.spiral)
        .style("fill", "none")
        .style("stroke", "steelblue");
      spiralLen = path.node().getTotalLength();
    }

    const tailLen = tailLength(); //tailOnly ? SPIRAL_R + tailLength() : tailLength();
    const partition = partitionYear(
      yearWindow[1] - yearWindow[0],
      spiralLen,
      tailLen
    );

    const pixPerYear = (spiralLen + tailLen) / (yearWindow[1] - yearWindow[0]);

    // now we have all we need to generate the plot data

    // all needed data for plot
    setPlotConfig({
      path,
      spiralLen,
      tailLen,
      pixPerYear,
      ...partition,
    });
  };

  useEffect(() => {
    if (plotConfig) {
      setPlotData(buildData());
    }
  }, [plotConfig]);

  useEffect(() => {
    if (plotData) {
      repaint();
    }
  }, [plotData, timeMark]);

  useEffect(() => {
    if (plotData) {
      repaint();
    }
  }, [timeUnit, timeMark]);

  // useEffect(() => {
  //   if (containerRef.current) {
  //     const { current } = containerRef;
  //     const boundingRect = current.getBoundingClientRect();
  //     const { width, height } = boundingRect;
  //   }
  // }, [containerRef]);

  const repaint = () => {
    select("g").selectAll("*").remove(); // clear all elements - for redraw
    // Define the div for the tooltip
    d3.select("body")
      .append("div")
      .attr("id", "tooltip")
      .style("opacity", 0)
      .style("font", "10px arial");

    if (!tailOnly) {
      // draw the spiral wire
      select("g")
        .append("path")
        .datum(spiralConfig.points)
        .attr("id", "spiral")
        .attr("d", spiralConfig.spiral)
        .style("fill", "none")
        .attr("stroke-width", LINE_SIZE)
        .style("stroke", "steelblue");
    }
    drawSpiralGroup();
    drawTailLine();
    drawTailGroup();
    drawTimeMarks();
    drawTips();
    drawScale();
    // drawReference(100);
    // testLabel();
  };

  const testLabel = (text = "Test Label") => {
    const x0 = -220;
    const y0 = 230;
    const len = 100;
    const label = [
      {
        x: x0 + len * 0.5 - 14,
        y: y0 - 4,
        text,
      },
    ];

    select("g")
      .selectAll(".text-label")
      .remove()
      .data(label)
      .enter()
      .append("text")
      .attr("class", "text-label")
      .attr("x", x0)
      .attr("y", y0)
      .style("text-anchor", "start")
      .style("font", "10px arial")
      .text(text);
  };

  //-- util functions
  const yearRoundNumber = (yearDist) => {
    return yearDist > 10000 ? 10000 : 5;
  };
  const yearMarkUnit = () => {
    if (!plotConfig) return null;

    const targetPixDist = 100; // the target pix distance for year mark spacing

    const pixDist = plotConfig.spiralLen + plotConfig.tailLen;
    const yearDist = yearWindow[1] - yearWindow[0];
    const pixPerYear = pixDist / yearDist;
    const yearNumInTargetPixDist = targetPixDist / pixPerYear; // # years in targetPixDist
    const roundVal = yearRoundNumber(yearDist);
    const minYearDist = Math.ceil(yearNumInTargetPixDist / roundVal) * roundVal; // round to yearDist multiples

    const MinPixelInMark = 100; // scale markYearDist to achieve >= this many pixels per mark
    let markYearDist = minYearDist; //
    // start from markYearDist year, increment by stepSize, until markYearDist years represents ~MinPixelInMark pixels
    while (true) {
      const len = Math.ceil(plotConfig.pixPerYear * markYearDist);
      if (len >= MinPixelInMark) break;
      markYearDist += markYearDist;
    }

    // console.log(markYearDist, yearNumInTargetPixDist, yearDist, "[mark Y D]");
    return markYearDist;
  };

  const zeroYearPixel = () => {
    return !tailOnly
      ? spiralTimeScale(
          0,
          yearWindow[0],
          yearWindow[0] + plotConfig.spiralYearTotal,
          plotConfig.spiralLen
        ) // a (-) value from tail-left to 0 year pos
      : d3
          .scaleLinear()
          .domain([yearWindow[0], yearWindow[1]])
          // TODO !!
          .range([tailOnly ? 0 : 0, plotConfig.tailLen])(0); // current year range fit entirely in tail
  };

  const spiralEndPoint = () => {
    const spiralLen = plotConfig.spiralLen;
    const path = plotConfig.path;

    const sYearMax = yearWindow[0] + plotConfig.spiralYearTotal;

    return !tailOnly
      ? year2pixelPositionOnSpiral(
          sYearMax,
          yearWindow[0],
          sYearMax,
          spiralLen,
          path
        )
      : { x: 0, y: -200 };
  };

  const tailYearToPixelScaler = () => {
    return d3
      .scaleLinear()
      .domain([yearWindow[1] - plotConfig.tailYearTotal, yearWindow[1]]) // tail year range
      .range([0, plotConfig.tailLen]); // tail pixel range
  };

  const buildData = (verbose = false) => {
    const spiralLen = plotConfig.spiralLen;
    const path = plotConfig.path;

    const sYearMax = yearWindow[0] + plotConfig.spiralYearTotal;
    const { y: tailY, x: tailX } = spiralEndPoint();

    const spiralBlocks = []; // the spiral block data
    const tailBlocks = [];
    const tailTimeScale = tailYearToPixelScaler();

    let spiralEventList = [];
    let tailEventList = [];
    let tailMonarchList = [];
    let spiralEventBlocks = [];
    let tailEventBlocks = [];
    let tailMonarchBlocks = [];

    const getOneTailBlock = (d, range = true) => {
      if (!(d.start >= sYearMax && d.start <= yearWindow[1])) return null;

      //- start and end pixel
      const spixel = tailTimeScale(d.start); // pixel == 0 is the spiral / tail joint point
      let epixel = null;
      if (range) {
        const end = d.end === d.start ? d.start + 0.1 : d.end; // same start and end causes wrong epixel
        epixel = tailTimeScale(end);
        if (!epixel || epixel > plotConfig.tailLen) {
          epixel = tailTimeScale(yearWindow[1]);
        }
      }

      const anchor = range ? epixel : spixel + GROUP_LEAD_WIDTH; // group leading block width
      const block = {
        x: spixel,
        y: tailY,
        group: d.name,
        group_leader: true,
        group_start_year: d.start,
        info: d.info,
      };
      if (d.label) block.label = d.label;
      if (d.data_type) block.data_type = d.data_type;
      if (range) {
        block.end = anchor;
        if (!d.label) {
          block.group_end_year = d.end;
          block.group_leader = true;
        }
      }
      return block;
    };
    const getOneSpiralBlock = (d, range = true) => {
      if (!tailOnly && d.start >= yearWindow[0] && d.start <= sYearMax) {
        // data on spiral
        const { x, y, linePer, a } = year2pixelPositionOnSpiral(
          d.start,
          yearWindow[0],
          sYearMax,
          spiralLen,
          path
        );

        const block = {
          x,
          y,
          linePer,
          a,
          info: d.info,
          group: d.name,
          group_start_year: d.start,
        };

        if (d.data_type) block.data_type = d.data_type;
        if (range) {
          if (!d.data_type) {
            block.group_end_year = d.end;
            // block.group_leader = true;
          }
        }
        // list.push(block);
        return block;
      }
      return null; // out range, not collected
    };

    // main loop of raw data
    let lastLeftoverRawData = null;
    timelineData.forEach((d) => {
      if (d.start >= yearWindow[0] && d.start <= yearWindow[1]) {
        if (!tailOnly && d.start <= sYearMax) {
          if (d.events) spiralEventList = spiralEventList.concat(d.events);
          const blkData = getOneSpiralBlock(d);
          if (blkData) spiralBlocks.push(blkData);
          lastLeftoverRawData = null; // erase last spiral outrange data, no need the whole plot
        } else {
          if (d.events) tailEventList = tailEventList.concat(d.events);
          const label = d.name;
          // console.log(label, monarch[d.name], "[M]");
          if (monarch[label]) {
            // console.log(label, "[M]");
            tailMonarchList = tailMonarchList.concat(
              monarch[label]
                .filter((d) => d.start)
                .map((d) => {
                  d.label = label;
                  return d;
                })
            );
          }

          const blkData = getOneTailBlock(d);
          if (blkData) {
            const x = blkData.x + GROUP_LEAD_WIDTH;
            const { end, group, y } = blkData;
            const endData = { end, group, x, y };
            blkData.end = x;

            tailBlocks.push(blkData);
            tailBlocks.push(endData);
          }
        }
      } else if (d.start < yearWindow[1]) {
        lastLeftoverRawData = d;
      }
    });

    if (lastLeftoverRawData) {
      // console.log(lastLeftoverRawData, "[lastLeftoverRawData.events]");
      if (lastLeftoverRawData.events) {
        tailEventList = lastLeftoverRawData.events.concat(tailEventList);
      }
      const label = lastLeftoverRawData.name;
      if (monarch[label]) {
        tailMonarchList = monarch[label]
          .filter((d) => d.start)
          .map((d) => {
            d.label = label;
            return d;
          })
          .concat(tailMonarchList);
      }
    }

    // collect scince data
    const tailScienceBlocks = [];
    science.forEach((d) => {
      d.data_type = "science";
      const blkData = getOneTailBlock(d, false);
      if (blkData) tailScienceBlocks.push(blkData);
    });

    //--
    const leftoverEventList = [];
    let lastLinePer = null;
    spiralEventList.forEach((d) => {
      d.data_type = "event";
      const blkData = getOneSpiralBlock(d, false);
      // console.log(blkData, "[s Events]");
      if (blkData === null) {
        leftoverEventList.push(d);
      } else {
        let keep = true;
        if (lastLinePer) {
          const delta = Math.abs(blkData.linePer - lastLinePer);
          if (delta > 0 && delta < BLOCK_MIN_GAP) keep = false;
        }
        if (keep) {
          spiralEventBlocks.push(blkData);
          lastLinePer = blkData.linePer;
        }
      }
    });

    if (leftoverEventList.length > 0) {
      tailEventList = leftoverEventList.concat(tailEventList);
    }

    let lastTailEventX = null;
    const MIN_EVENT_DIST = 8; // skip next event if it is closer than 4 pixels from previous collected one
    tailEventList.forEach((d) => {
      d.data_type = "event";
      const blkData = getOneTailBlock(d, false);

      if (blkData) {
        let keep = true;
        if (lastTailEventX) {
          const delta = Math.abs(blkData.x - lastTailEventX);
          if (delta > 0 && delta < MIN_EVENT_DIST) keep = false;
        }
        if (keep) {
          tailEventBlocks.push(blkData);
          lastTailEventX = blkData.x;
        }
      }
    });
    tailMonarchList.forEach((d) => {
      d.data_type = "monarch";
      const blkData = getOneTailBlock(d);
      if (blkData) tailMonarchBlocks.push(blkData);
    });

    return {
      spiralBlocks,
      tailBlocks,
      tailX,
      tailY,
      yearMarks: buildYearMarks(),
      sYearMax,
      sYearMin: yearWindow[0],
      xShift: tailOnly ? -(winSize.x0 - TAIL_GAP) : 0, // tail abs x shift: ontop of global shift to leave 20 gap for tailOnly
      yShift: tailOnly ? 50 : 0, // abs y shift
      spiralEventBlocks,
      tailEventBlocks,
      tailMonarchBlocks,
      tailScienceBlocks,
    };
  };

  const buildYearMarks = () => {
    // console.log(plotConfig, "[BM]");
    const spiralLen = plotConfig.spiralLen;
    const sYearMax = yearWindow[0] + plotConfig.spiralYearTotal;
    const yearMarks = []; // the time mark data
    const path = plotConfig.path;
    const markUnit = yearMarkUnit();
    const zeroYearPos = zeroYearPixel();
    const { y: tailY } = spiralEndPoint();
    const pixInOneUnit = markUnit * plotConfig.pixPerYear;

    const yBlocks = Math.abs(Math.floor(yearWindow[0] / markUnit)); // # of year blocks in 0 to yMin
    let year = -(yBlocks - 1) * markUnit; // smallest year on mark in yearWindow
    let mpix = zeroYearPos - (yBlocks - 1) * pixInOneUnit; // pixel of "year"

    let inTail = tailOnly ? true : year > sYearMax;

    while (year <= yearWindow[1]) {
      // collect year mark in the entire yearWindow
      const spiral = !tailOnly && year <= sYearMax ? true : false;
      if (!spiral && !inTail) {
        // mpix is on mark and extended over spiral end; the extra pixels is in tail coordinate.
        mpix = mpix - spiralLen;
        inTail = true;
      }

      if (spiral) {
        const pos = yearOfPixPositionOnSpiral(
          mpix,
          yearWindow[0],
          sYearMax,
          spiralLen,
          path
        );
        // console.log(year, pos, "[spiralM]");
        yearMarks.push({
          spiral,
          ...pos,
          year,
        });
      } else {
        yearMarks.push({ x: mpix, y: tailY, year, spiral, linePer: mpix });
      }

      year += markUnit;
      mpix += pixInOneUnit;
    }

    return yearMarks;
  };

  /*
   return the pixel position (start from spiral 0 point) on spiral for the given year
   year: the year in question;
   min: year at spiral left end (spiral center);
   max: year at spiral outer end
   years are in westen calendar year
  */
  const spiralTimeScale = (year, min, max, pixlen) =>
    d3.scaleLinear().domain([min, max]).range([0, pixlen])(year);

  const yearOfPixPositionOnSpiral = (linePer, min, max, pixlen, path) => {
    const year = d3.scaleLinear().domain([0, pixlen]).range([min, max])(
      linePer
    );
    const posOnLine = path.node().getPointAtLength(linePer);
    const angleOnLine = path
      .node()
      .getPointAtLength(linePer - GROUP_LEAD_WIDTH);
    const angle =
      (Math.atan2(angleOnLine.y, angleOnLine.x) * 180) / Math.PI - 90; //angle at the spiral position

    const pos = { x: posOnLine.x, y: posOnLine.y, linePer, year };
    if (angle) pos.a = angle;
    return pos;
  };

  /*
    in western calendar years
    min : spiral year mininum 
    max : spiral year max
    pixlen : spiral length in pixel
  */
  const year2pixelPositionOnSpiral = (year, min, max, pixlen, path) => {
    const linePer = spiralTimeScale(year, min, max, pixlen);
    const posOnLine = path.node().getPointAtLength(linePer);
    const angleOnLine = path
      .node()
      .getPointAtLength(linePer - GROUP_LEAD_WIDTH);
    const angle =
      (Math.atan2(angleOnLine.y, angleOnLine.x) * 180) / Math.PI - 90; //angle at the spiral position

    const pos = { x: posOnLine.x, y: posOnLine.y, linePer, year };
    if (angle) pos.a = angle;
    return pos;
  };

  const partitionYear = (totalYears, spiralLen, tailLen) => {
    const totalLen = spiralLen + tailLen;
    const spiralPer = spiralLen / totalLen;
    const tailPer = tailLen / totalLen;
    const spiralYearTotal = parseInt(totalYears * spiralPer);
    const tailYearTotal = parseInt(totalYears * tailPer);
    return { spiralYearTotal, tailYearTotal };
  };

  //-- plotting functions
  const drawSpiralGroup = () => {
    if (tailOnly) return;
    const spiralLen = plotConfig.spiralLen;
    const data = plotData;

    if (data.spiralBlocks.length > 0) {
      // draw spiral group bar
      select("g")
        .selectAll(".spiral-block")
        .remove()
        .data(data.spiralBlocks)
        .enter()
        .append("rect")
        .attr("x", (d) => d.x)
        .attr("y", (d) => d.y - 8) // bar under line
        // draw the bars on spiral
        .attr("width", (d) => 4) //barWidth)
        .attr("class", "spiral-block")
        .attr("height", (d) => 8) // const bar height
        .style("fill", (d) => groupColor(d.group))
        .style("stroke", "none")
        .style("opacity", RECT_OPACITY)
        .attr(
          "transform",
          (d) => `rotate(${d.a}, ${d.x}, ${d.y})` // rotate the bar
        );

      // draw spiral event circle
      select("g")
        .selectAll(".spiral-event-circle")
        .remove()
        .data(data.spiralEventBlocks)
        .enter()
        .append("circle")
        .attr("class", "spiral-event-circle")
        .attr("cx", (d) => d.x)
        .attr("cy", (d) => d.y)
        .attr("r", (_, i) => CIRCLE_R)
        .style("fill", (d) => groupColor(d.group))
        .attr("stroke", "#000")
        .style("opacity", 0.5);

      //-- draw spiral group leader label: omit label if it is too close to previous label
      let lastBlock = null;
      let lastEvent = null;
      select("g")
        .selectAll(".spiral-block-label")
        .remove()
        .data(data.spiralBlocks)
        .enter()
        .append("text")
        .attr("dx", -6) // align label with group leader mark
        .attr("dy", (d) => {
          const dy = 22; // move below by 22 pixel, under the block bar
          lastEvent = d;
          return dy;
        })
        .style("text-anchor", "start")
        .style("font", "10px arial")
        .attr("class", "spiral-block-label")
        .append("textPath")
        .text((d) => {
          let label = d.group; // + `(${normalizeYear(d.group_start_year)})`;

          if (lastBlock) {
            const delta = Math.abs(d.linePer - lastBlock.linePer);
            if (delta > 0 && delta < BLOCK_MIN_GAP) {
              label = "";
            }
          }
          lastBlock = d;
          return label;
        })
        // place text along spiral
        .attr("xlink:href", "#spiral")
        .attr("startOffset", (d) => {
          return (d.linePer / spiralLen) * 100 + "%";
        });

      //-- draw spiral event label
      let up = false;
      select("g")
        .selectAll(".spiral-event-label")
        .remove()
        .data(data.spiralEventBlocks)
        .enter()
        .append("text")
        .style("text-anchor", "start")
        .style("font", "10px arial")
        .attr("class", "spiral-event-label")
        .attr("dx", -6)
        .attr("dy", (d) => {
          let dy = up ? 16 : -10; // move above by 10 pixel
          up = !up;
          return dy;
        })
        .append("textPath")
        .text((d) => d.group)
        // place text along spiral
        .attr("xlink:href", "#spiral")
        .style("fill", (d) => groupColor(d.group))
        .attr("startOffset", (d) => {
          return (d.linePer / spiralLen) * 100 + "%";
        });
    }
  };

  const drawTailGroup = () => {
    const data = plotData;
    // console.log(data, "[drawTailGroup]");
    let lastX = null;
    let lastGroup = null;
    let lastY = null;
    const avoidGroupOverlap = false;
    const tailTimeScale = tailYearToPixelScaler();
    const yearMaxPos = tailTimeScale(yearWindow[1]); // max pixel

    const RECT_HEIGHT = 4;
    const GAP_SIZE = 10;

    // main tail data
    if (data.tailBlocks.length > 0) {
      // for each raw range data point, draw the leading rect and the trailing bold line on tail line
      select("g")
        .selectAll(".tail-block")
        .remove()
        .data(data.tailBlocks)
        .enter()
        .append("rect")
        .attr("gid", (d, i) => `${cleanNameString(d.group)}-${i + 1}`)
        .attr("id", (d, i) => `${cleanNameString(d.group)}-${i}`)
        .attr("fill", "navy")
        .attr("class", "tail-block")
        .attr("x", (d) => d.x + data.xShift)
        .attr("y", (d) => {
          let y = d.y + data.yShift + RECT_HEIGHT * 0.5; // middle align with tail line
          if (avoidGroupOverlap) {
            if (lastX && lastGroup) {
              if (d.x < lastX && d.group !== lastGroup) {
                y -= 10;
              } else if (d.group === lastGroup) {
                y = lastY;
              }
            }
            lastX = d.x;
            lastY = y;
            lastGroup = d.group;
          }
          return y - RECT_HEIGHT;
          // return d.group_leader ? y - RECT_HEIGHT * 2 : y - RECT_HEIGHT; // leader extend upwards
        })
        .attr("width", (d) => {
          const w = d.end - d.x;
          return w > 0 ? w : 2;
        })
        .attr("height", (d) => (d.group_leader ? 8 : 4))
        .style("fill", (d) => groupColor(d.group))
        .style("stroke", (d) => groupColor(d.group))
        .style("opacity", RECT_OPACITY);

      // leader label
      let lastLeader = null;
      select("g")
        .selectAll(".tail-leader-label")
        .data(data.tailBlocks.filter((d) => d.group_leader))
        .enter()
        .append("text")
        .attr("class", "tail-leader-label")
        .style("text-anchor", "end")
        .style("font", "12px arial")
        .attr("font-weight", "bold")
        .text((d) => {
          const delta = lastLeader
            ? Math.abs(d.x - lastLeader.x)
            : GAP_SIZE + 1;
          const label = delta > GAP_SIZE ? d.group : "";

          lastLeader = d;
          return label;
        })
        .attr(
          "transform",
          (d) =>
            `translate(${d.x + data.xShift + 8},${
              d.y + data.yShift + 10 // shift downwards
            }) rotate(-90)`
          // rotate the text
        );
    }

    // event data on tail
    if (data.tailEventBlocks.length > 0) {
      // event circle
      select("g")
        .selectAll(".tail-event-circle")
        .remove()
        .data(data.tailEventBlocks)
        .enter()
        .append("circle")
        .attr("class", "tail-event-circle")
        .attr("cx", (d) => d.x + data.xShift)
        .attr("cy", (d) => d.y + data.yShift) // + RECT_HEIGHT * 0.5) // move down to align with tail bar
        .attr("r", CIRCLE_R)
        .style("fill", (d) => groupColor(d.group))
        .attr("stroke", "#000")
        .style("opacity", 0.5);

      // event label
      let lastEvent = null;
      select("g")
        .selectAll(".tail-event-label")
        .data(data.tailEventBlocks)
        .enter()
        .append("text")
        .attr("class", "tail-event-label")
        .attr("x", 4)
        .attr("y", 0)
        .style("text-anchor", "start")
        .style("font", "10px arial")
        .text((d) => {
          const delta = lastEvent ? Math.abs(d.x - lastEvent.x) : null;
          const label = !delta || delta > GAP_SIZE ? d.group : "";
          if (label) lastEvent = d;
          return label;
        })
        .attr(
          "transform",
          (d) =>
            `translate(${d.x + data.xShift + 4},${
              d.y + data.yShift - 4
            }) rotate(-90)`
          // rotate the text
        );
    }

    //-- tail monarch label and connect time
    if (data.tailMonarchBlocks.length > 0) {
      const VG = (data.lastY ? data.lastY : data.yShift) + 80; // Y- gap
      const HG = data.xShift; // X-shift
      data.lastY = VG; // will be used by next row data

      const monData = data.tailMonarchBlocks;

      //-- monarch connect lines
      const connData = [];
      monData.forEach((d) => {
        const label = d.label;
        let x1 = d.x + HG;
        let x2 = d.end + HG;
        let y1 = d.y + VG;
        connData.push({ ...d, x1, y1, x2, y2: y1, label }); // from d.x to d.end line
        connData.push({
          ...d,
          x1,
          y1,
          x2: x1,
          y2: y1 - 10,
          type: "bar",
          label,
        }); // from d.start upwards of 10 pixel
      });

      select("g")
        .selectAll(".monarch-connect, .monarch-bar")
        .data(connData)
        .enter()
        .append("line")
        .attr("class", (d) =>
          d.type === "bar" ? "monarch-bar" : "monarch-connect"
        )
        .style("stroke", (d) => groupColor(d.label))
        .style("stroke-width", 2)
        .attr("x1", (d) => d.x1)
        .attr("y1", (d) => d.y1)
        .attr("x2", (d) => d.x2)
        .attr("y2", (d) => d.y2);

      //-- monarch name label
      let lastLeader = null;
      select("g")
        .selectAll(".monarch-label")
        .data(monData)
        .enter()
        .append("text")
        .attr("class", "monarch-label")
        .style("text-anchor", "end")
        .style("font", "10px arial")
        .attr("font-weight", "bold")
        .text((d) => {
          const delta = lastLeader ? Math.abs(d.x - lastLeader.x) : null;
          const label = !delta || delta > GAP_SIZE + 4 ? d.group : "";
          // console.log(d, d.start.toFixed(0), d.end.toFixed(0), "[monarch]");
          if (label) lastLeader = d;
          return label;
        })
        .attr(
          "transform",
          (d) => `translate(${d.x + HG + 4},${d.y + VG + 2}) rotate(-90)`
          // rotate the text
        );
    }

    //-- tail scinece vertical line and label
    if (data.tailScienceBlocks.length > 0) {
      const sData = data.tailScienceBlocks;
      const yPos0 = data.yShift + 2; // vertical line Y- gap to main timeline
      const HG = data.xShift; // X-shift
      const labelY = (data.lastY ? data.lastY : data.yShift) + 80; // label shifted down 100px from last line
      let lastLeader = null;
      const stagerShift = 40;
      const doShift = (xval) => {
        const delta = lastLeader ? Math.abs(xval - lastLeader.x) : null;
        return !delta || delta > GAP_SIZE;
      };

      //--  connect lines
      select("g")
        .selectAll(".science-line")
        .data(sData)
        .enter()
        .append("line")
        .attr("class", "science-line")
        .style("stroke", "#ccc")
        .style("stroke-dasharray", "3, 3")
        .style("stroke-width", 1)
        .attr("x1", (d) => d.x + HG)
        .attr("y1", (d) => d.y + yPos0)
        .attr("x2", (d) => d.x + HG)
        .attr("y2", (d) => {
          const shift = doShift(d.x);
          if (shift) lastLeader = d;
          return d.y + labelY - 2 + (!shift ? stagerShift : 0);
        });

      //-- scinece  label
      // let preLastLeader = null;
      lastLeader = null;
      select("g")
        .selectAll(".tail-science-label")
        .data(sData)
        .enter()
        .append("text")
        .attr("class", "tail-science-label")
        .style("text-anchor", "end")
        .style("font", "10px arial")
        .attr("font-weight", "bold")
        .text((d) => {
          return d.group;
        })
        .attr(
          "transform",
          (d) => {
            const x0 = d.x + HG + 4; // so text aligns with time mark
            // const delta = lastLeader ? Math.abs(d.x - lastLeader.x) : null;
            const shift = doShift(d.x);
            const y0 = shift ? d.y + labelY : d.y + labelY + stagerShift;
            if (shift) {
              // preLastLeader = lastLeader;
              lastLeader = d;
            }
            return `translate(${x0},${y0}) rotate(-90)`;
          }
          // rotate the text
        );
    }
  };

  const drawTimeMarks = () => {
    if (!timeMark) return;
    const spiralLen = plotConfig.spiralLen;
    const data = plotData;
    const spiralMarks = data.yearMarks.filter((d) => d.spiral);

    const barShortHeight = 8;
    const barTallHeight = 14;
    const barWidth = 2;
    const markColor = (year) => (Math.abs(year) < 1 ? "red" : "#999999");
    if (!tailOnly && spiralMarks.length > 0) {
      // draw spiral year marks
      select("g")
        .selectAll(".spiral-year-mark")
        .remove()
        .data(spiralMarks)
        .enter()
        .append("line")
        .attr("class", "spiral-year-mark")
        .style("stroke", (d) => markColor(d.year))
        .style("stroke-width", barWidth)
        .attr("x1", (d) => d.x)
        .attr("y1", (d) => d.y)
        .attr("x2", (d) => d.x)
        .attr("y2", (d) => d.y - barShortHeight)
        .attr("startOffset", function (d) {
          return (d.linePer / spiralLen) * 100 + "%";
        })
        .attr(
          "transform",
          (d) => "rotate(" + d.a + "," + d.x + "," + d.y + ")"
        );

      // label spiral year mark
      select("g")
        .selectAll(".spiral-year-mark-label")
        .remove()
        .data(spiralMarks)
        .enter()
        .append("text")
        .attr("dy", (d) => 20)
        .style("text-anchor", "middle")
        .style("font", "10px arial")
        .style("class", "spiral-year-mark-label")
        .append("textPath")
        .text(
          (d) => normalizeYear(d.year)
          // d.year < -9999 ? normalizeYear(d.year) : formatYearValue(d.year)
        )
        // place text along spiral
        .attr("xlink:href", "#spiral")
        .style("fill", "grey")
        .attr("startOffset", function (d) {
          return (d.linePer / spiralLen) * 100 + "%";
        });
    }

    const tailMarks = data.yearMarks.filter(
      (d) => !d.spiral && d.year > yearWindow[0]
    );

    if (tailMarks.length > 0) {
      let flap = false;
      const labelHeight = 20;
      const y0 = tailOnly ? -50 : data.yShift;
      if (tailOnly) {
        drawTailLine(y0);
      }
      // console.log(y0, data.yShift, "[y0]");

      // draw tail year marks
      select("g")
        .selectAll(".tail-year-mark")
        .remove()
        .data(tailMarks)
        .enter()
        .append("line")
        .attr("class", "tail-year-mark")
        .style("stroke", (d) => markColor(d.year))
        .style("stroke-width", barWidth)
        .attr("x1", (d) => d.x + data.xShift)
        .attr("y1", (d) => d.y + y0)
        .attr("x2", (d) => d.x + data.xShift)
        .attr("y2", (d) => {
          const dy = d.y + (flap ? barTallHeight : barShortHeight);
          flap = !flap;
          return dy + y0;
        })
        .attr("startOffset", function (d) {
          return (d.linePer / spiralLen) * 100 + "%";
        });

      flap = false;
      select("g").selectAll(".tail-year-mark-label").remove();
      tailMarks.forEach((d) => {
        // console.log(d);
        select("g")
          .append("text")
          .attr("x", d.x + data.xShift)
          .attr("y", () => {
            const y = d.y + 6 + (flap ? labelHeight : barTallHeight);
            flap = !flap;
            return y + y0;
          }) //magic number here
          .attr("text-anchor", "middle")
          .style("font", "10px arial")
          // .style("color", () => (d.year === 0 ? "red" : "black"))
          .attr("class", "tail-year-mark-label") //easy to style with CSS
          .text(normalizeYear(d.year));
      });
    }
    // select("g").selectAll(".zero-year").style("color", "red");
  };

  const drawTailLine = (y = null) => {
    const tailLen = plotConfig.tailLen;
    const data = plotData;
    const y0 = y !== null ? y : data.yShift;
    // console.log(y0, "[drawTailLine]");
    select("g").selectAll(".tail-line").remove();
    select("g")
      .append("line")
      .style("class", "tail-line")
      .style("stroke", "steelblue")
      .attr("stroke-width", LINE_SIZE)
      .attr("x1", data.tailX + data.xShift)
      .attr("y1", data.tailY + y0)
      .attr("x2", tailLen + data.xShift)
      .attr("y2", data.tailY + y0);
  };

  const drawScale = () => {
    if (!timeUnit) return;

    const x0 = -220;
    const y0 = 200; // // -230; // top-left corner
    const h = -4;
    const yunit = yearMarkUnit();
    const len = plotConfig.pixPerYear * yunit;
    const data = [
      { x1: x0, y1: y0 - h, x2: x0, y2: y0 + h },
      { x1: x0, y1: y0, x2: x0 + len, y2: y0 },
      { x1: x0 + len, y1: y0 - h, x2: x0 + len, y2: y0 + h },
    ];

    select("g").selectAll(".scale-bar").remove();
    select("g").selectAll(".scale-label").remove();

    select("g")
      .selectAll(".scale-bar")
      .data(data)
      .enter()
      .append("line")
      .style("class", "scale-bar")
      .style("stroke", "steelblue")
      .style("stroke-width", 2)
      .attr("x1", (d) => d.x1)
      .attr("y1", (d) => d.y1)
      .attr("x2", (d) => d.x2)
      .attr("y2", (d) => d.y2);

    const ymin = yearWindow[0]; // current year range
    const ymax = yearWindow[1];
    // console.log(ymin, normalizeYear(-100000, true), "[drawScale.ymin]");
    const label = [
      {
        x: x0 + len * 0.5 - 14,
        y: y0 - 4,
        text: `${normalizeYear(yunit)}`,
      },
      {
        x: x0 + 4,
        y: y0 + 12,
        text: `${normalizeYear(ymin)} - ${normalizeYear(ymax)}`,
      },
      {
        x: x0 + 4,
        y: y0 + 24,
        text: `[total ${normalizeYear(ymax - ymin)}]`,
      },
    ];

    select("g")
      .selectAll(".scale-label")
      .data(label)
      .enter()
      .append("text")
      .attr("class", "scale-label")
      .attr("x", (d) => d.x)
      .attr("y", (d) => d.y)
      .style("text-anchor", "start")
      .style("font", "10px arial")
      .text((d) => d.text)
      .attr("xlink:href", "#tail");
  };

  const drawReference = (pixLen) => {
    const x0 = -220;
    const y0 = 230;
    const h = -4;
    const len = pixLen;
    const data = [
      { x1: x0, y1: y0 - h, x2: x0, y2: y0 + h },
      { x1: x0, y1: y0, x2: x0 + len, y2: y0 },
      { x1: x0 + len, y1: y0 - h, x2: x0 + len, y2: y0 + h },
    ];

    select("g").selectAll(".scale-ref-bar").remove();
    select("g").selectAll(".scale-ref-label").remove();

    select("g")
      .selectAll(".scale-ref-bar")
      .data(data)
      .enter()
      .append("line")
      .style("class", "scale-ref-bar")
      .style("stroke", "steelblue")
      .style("stroke-width", 2)
      .attr("x1", (d) => d.x1)
      .attr("y1", (d) => d.y1)
      .attr("x2", (d) => d.x2)
      .attr("y2", (d) => d.y2);

    const label = [
      {
        x: x0 + len * 0.5 - 14,
        y: y0 - 4,
        text: `${len}pixel`,
      },
    ];

    select("g")
      .selectAll(".scale-ref-label")
      .remove()
      .data(label)
      .enter()
      .append("text")
      .attr("class", "scale-ref-label")
      .attr("x", (d) => d.x)
      .attr("y", (d) => d.y)
      .style("text-anchor", "start")
      .style("font", "10px arial")
      .text((d) => d.text);
  };

  const addInfo = (x, y, d) => {
    let text = d.data_type
      ? `${d.group} : ${normalizeYear(d.group_start_year)}. ${
          d.info ? d.info : ""
        }`
      : `${d.group}`;

    if (!d.data_type) {
      text +=
        `[${normalizeYear(d.group_start_year)}${
          d.group_end_year !== undefined
            ? ` - ${normalizeYear(d.group_end_year)}`
            : ""
        }]` +
        `${
          d.group_end_year !== undefined
            ? ` [${d.group_end_year - d.group_start_year}]`
            : ""
        }`;

      if (d.info) {
        text += `\n${d.info}`;
      }
    }

    setTipPositioin([
      x,
      y,
      text,
      d.data_type === "event" ? groupColor(d.group) : "#000",
    ]);
  };

  const drawTips = () => {
    select("g")
      .selectAll(
        `.spiral-block,
        .spiral-event-circle, 
        .spiral-block-label, 
        .spiral-event-label, 
        .tail-block,
        .tail-leader-label, 
        .tail-event-label, 
        .tail-event-circle,
        .monarch-label,
        .monarch-bar,
        .monarch-connect,
        .tail-science-label,
        .tail-science-circle`
      )
      .on("mouseover", function (event, d) {
        select(this).style("cursor", "help"); // "context-menu");
        addInfo(event.pageY, event.pageX, d);
      })
      .on("mouseout", function () {
        select(this).style("cursor", "default");
        setTipPositioin(null);
      });
  };

  const updateTimeHead = (value) => {
    const order = timeHeadArray.lookup[value];
    const buttObj = timeHeadArray.lookup[timeHeadArray.rlookup[timeButt]];

    // console.log(value, buttObj, order, "[THead]");
    if (buttObj && order.index >= buttObj.index) return; // range zero or crossed

    const range = [order.start, buttObj ? buttObj.start : yearWindow[1]];
    updateURL("th", order.index);

    const buttArray = timeHeadArray.ordered.slice(order.index + 1);
    setTimeButtArray({
      ordered: buttArray,
    });
    updateURL("yl", range);
    updateURL("yw", range);
  };
  //-- event handlers
  const zoomHandler = (e) => {
    select("svg g").attr(
      "transform",
      // `${e.transform} translate(${SPIRAL_R}, ${SPIRAL_R})`
      `${e.transform} rotate(${
        ROTATE && portrait ? 90 : 0
      }) translate(${SPIRAL_R}, ${ROTATE && portrait ? -SPIRAL_R : SPIRAL_R})`
    );
  };

  // the year range slider change handlers
  const DELAYED_SLIDE_UPDATE = false;
  const setSliderObj = (val, idx) => {
    _setSliderObj({ val, idx });
    if (!DELAYED_SLIDE_UPDATE) updateURL("yw", val);
  };
  const handleYearRangeChange = (e, val) => {
    if (DELAYED_SLIDE_UPDATE) updateURL("yw", [...sliderObj.val]);
  };

  const handleTimeHeadChange = (e) => {
    updateTimeHead(e.target.value);
    // const value = e.target.value;
    // const order = timeHeadArray.lookup[value];
    // const buttObj = timeHeadArray.lookup[timeHeadArray.rlookup[timeButt]];

    // // console.log(value, buttObj, order, "[THead]");
    // if (buttObj && order.index >= buttObj.index) return; // range zero or crossed

    // const range = [order.start, buttObj ? buttObj.start : yearWindow[1]];
    // updateURL("th", order.index);

    // const buttArray = timeHeadArray.ordered.slice(order.index + 1);
    // setTimeButtArray({
    //   ordered: buttArray,
    // });
    // updateURL("yl", range);
    // updateURL("yw", range);
  };

  const handleTimeButtChange = (e) => {
    const value = e.target.value;
    const order = timeHeadArray.lookup[value];
    const headObj = timeHeadArray.lookup[timeHeadArray.rlookup[timeHead]];
    const buttObj = timeHeadArray.lookup[value];

    const range = [headObj.start, buttObj.start];
    updateURL("tb", order ? order.index : null);
    updateURL("yl", range);
    updateURL("yw", range);
  };

  const handleReset = () => {
    updateTimeHead(timeHeadArray.rlookup[DEFAULT_TIME_HEAD]);
    refresh("");
  };

  const showControls = spiralConfig && Object.keys(timeHeadArray).length > 0;

  const debugFn = () => {
    console.info(
      plotData.tailBlocks,
      plotData.spiralBlocks,
      // plotData.tailEventList,
      // plotData.tailEventBlocks,
      // plotData.spiralEventBlocks,
      "debugFn"
    );
  };
  // console.info(ZOOMER, "[DEBUG] render");

  //-- before rendering

  const spiralCtl = plotData ? (
    <AvertaCtl
      key="spiral-ctl"
      type={TYPE_SPIRAL}
      label="螺线"
      callback={() => updateURL("tail", !tailOnly)}
      checked={!tailOnly}
    />
  ) : null;
  const markCtl = plotData ? (
    <AvertaCtl
      key="mark-ctl"
      type={TYPE_MARK}
      label="时标"
      callback={() => updateURL("mark", !timeMark)}
      checked={timeMark}
    />
  ) : null;
  const scaleCtl = plotData ? (
    <AvertaCtl
      type={TYPE_SCALE}
      key="scale-ctl"
      label="单位"
      callback={() => updateURL("unit", !timeUnit)}
      checked={timeUnit}
    />
  ) : null;
  const loopCtl = plotData ? (
    <SelectCtl
      key="select-ctl-loop"
      label="圈数"
      value={spiralLoop}
      valueArray={SPIRAL_LOOP_ARRAY}
      handleChange={(e) => updateURL("loops", e.target.value)}
    />
  ) : null;
  const loopCmp = tailOnly ? null : plotData ? (
    <Grid item xs={1}>
      {loopCtl}
    </Grid>
  ) : null;
  const resetBtn = plotData ? (
    <AvertaCtl
      type={TYPE_RESET}
      key="reset-ctl"
      label="复原"
      callback={handleReset}
      checked={true}
    />
  ) : null;

  const yRangeCtl = plotData ? (
    <RangeCtl
      key="range-ctl"
      limits={yearLimits}
      value={yearWindow}
      setRange={setSliderObj}
      handleChange={handleYearRangeChange}
      width={150}
    />
  ) : null;

  const yStartCtl = plotData ? (
    <SelectCtl
      key="select-ctl-start"
      label="起始"
      value={notNull(timeHead) ? timeHeadArray.rlookup[timeHead] : ""}
      valueArray={timeHeadArray.ordered?.map((d) => d[1])}
      handleChange={handleTimeHeadChange}
      width={80}
    />
  ) : null;

  const yEndCtl = plotData ? (
    <SelectCtl
      key="select-ctl-end"
      label="终结"
      value={timeHeadArray.rlookup[timeButt]}
      valueArray={timeButtArray.ordered?.map((d) => d[1])}
      handleChange={handleTimeButtChange}
      width={80}
    />
  ) : null;

  const controls = showControls ? (
    portrait || isMobile ? (
      <MoreMenu
        children={[
          yRangeCtl,
          yStartCtl,
          yEndCtl,
          tailOnly ? null : loopCtl,
          [spiralCtl, markCtl, scaleCtl, resetBtn],
        ].filter((d) => d !== null)}
      />
    ) : (
      <Box sx={{ flexGrow: 1 }}>
        <Grid container spacing={2} justify="flex-end">
          <Grid item xs={2}>
            <Grid container spacing={1}>
              <Grid item xs={3}>
                {spiralCtl}
              </Grid>
              <Grid item xs={3}>
                {markCtl}
              </Grid>
              <Grid item xs={3}>
                {scaleCtl}
              </Grid>
              <Grid item xs={3}>
                {resetBtn}
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={2}>
            {yRangeCtl}
          </Grid>
          <Grid item xs={1}>
            {yStartCtl}
          </Grid>
          <Grid item xs={1}>
            {yEndCtl}
          </Grid>
          {loopCmp}

          <Grid item xs={1}></Grid>
          <Grid item xs={1}>
            {process.env.NODE_ENV === "development" ? (
              <Button
                variant="outlined"
                color="error"
                size="small"
                onClick={debugFn}
                style={{ marginLeft: 40 }}
              >
                Debug
              </Button>
            ) : null}
          </Grid>
          <Grid
            item
            xs={4}
            style={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
            }}
          >
            <Button
              // variant="outlined"
              // color="error"
              size="small"
              onClick={changePlot}
              style={{ marginLeft: 40 }}
            >
              {changePlotLabel}
            </Button>
          </Grid>
        </Grid>
      </Box>
    )
  ) : null;
  return (
    <>
      <div id="timeline-plot" style={{ borderBottom: "solid 1px #eee" }}>
        {spiralConfig ? null : "Loading..."}
        <svg id="gcontainer" ref={containerRef}>
          <g />
        </svg>
      </div>
      <div style={{ display: "flex", width: "auto", alignItems: "center" }}>
        {controls}
      </div>

      {tipPosition ? (
        <div
          style={{
            position: "absolute",
            border: "solid 1px #000",
            font: "10px arial",
            padding: 10,
            backgroundColor: "#eee",
            color: tipPosition[3],
            borderRadius: 4,
            zIndex: 100,
            top: tipPosition[0],
            left: tipPosition[1],
            maxWidth: 200,
          }}
        >
          {tipPosition[2]}
        </div>
      ) : null}
    </>
  );
};

export default TimelineSpiral;
