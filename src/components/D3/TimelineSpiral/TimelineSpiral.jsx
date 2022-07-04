import React, { useEffect, useState, useRef } from "react";
import { useHistory, useParams } from "react-router-dom";

import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";

import * as d3 from "d3";
import { select } from "d3";

import timelineData from "../../../assets/data/timeline";
import RangeCtl from "../../Controls/RangeCtl";
import SelectCtl from "../../Controls/SelectCtl";
import CheckCtl from "../../Controls/CheckCtl";

const TAIL_LEN_IN_PIXEL = 1000;
const YEAR_RANGE_DEFAULT = 5000;
const RECT_OPACITY = 0.6;
const BLOCK_MIN_GAP = 28;
const GROUP_LEAD_WIDTH = 6;
const SPIRAL_START = 0;
const SPIRAL_END = 2; // need to be even number to end at top
const CIRCLE_R = 6;
const groupColor = d3.scaleOrdinal(d3.schemeCategory10); // used to assign nodes color by group
const SPIRAL_LOOP_ARRAY = [2, 3, 4, 5, 6];
const THIS_YEAR = new Date().getFullYear();

const TimelineSpiral = ({
  width,
  height,
  m_top,
  m_bottom,
  m_left,
  m_right,
}) => {
  const start_year = THIS_YEAR; // initial starting year in limeline, running backwards to past
  const end_year = THIS_YEAR - YEAR_RANGE_DEFAULT;

  const [spiralConfig, setSpiralConfig] = useState(null);
  const [plotConfig, setPlotConfig] = useState(null);
  const [plotData, setPlotData] = useState(null);
  const [tipPosition, setTipPositioin] = useState(null);

  const [yearLimits, setYearLimits] = useState([end_year, start_year]); // year min and max
  const [yearWindow, setYearWindow] = useState([end_year, start_year]); // current view year range
  const [spiralLoop, setSpiralLoops] = useState(SPIRAL_LOOP_ARRAY[1]);
  const [timeHeadArray, setTimeHeadArray] = useState({});
  const [timeHead, setTimeHead] = useState("");
  const [timeButtArray, setTimeButtArray] = useState({});
  const [timeButt, setTimeButt] = useState("");
  const [tailOnly, _setTailOnly] = useState(false);
  const [timeMark, _setTimeMark] = useState(false);
  const [timeUnit, _setTimeUnit] = useState(false);

  const containerRef = useRef(null);

  const setTailOnly = () => {
    _setTailOnly(!tailOnly);
  };
  const setTimeMark = () => {
    _setTimeMark(!timeMark);
  };
  const setTimeUnit = () => {
    _setTimeUnit(!timeUnit);
  };
  // const history = useHistory();

  // useEffect(() => {
  //   return history.listen((loc) => {
  //     console.log(loc, "[useHistory]");
  //   });
  // }, [history]);

  useEffect(() => {
    const ordered = [];
    const lookup = {};
    timelineData.forEach((d, idx) => {
      ordered.push([d.start, d.name]);
      lookup[d.name] = { start: d.start, index: idx };
    });
    setTimeHeadArray({ ordered, lookup });
    setTimeButtArray({ ordered: ordered.slice(1), lookup });
  }, []);

  useEffect(() => {
    const theta = (r) => spiralLoop * Math.PI * r;
    const outerR = d3.min([width, height]) / 2 - 40; // spiral outer radius
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
  }, [spiralConfig, yearWindow, tailOnly]);

  useEffect(() => {
    if (plotData) {
    }
  }, [yearWindow, tailOnly]);

  const updatePlotConfig = () => {
    if (!spiralConfig) return;

    select("g").selectAll("*").remove(); // clear all elements - for redraw

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

    const tailLen = tailOnly
      ? width * 0.5 + 50 + TAIL_LEN_IN_PIXEL
      : TAIL_LEN_IN_PIXEL;
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
  const yearMarkUnit = () => {
    if (!plotConfig) return null;

    const pixDist = plotConfig.spiralLen + plotConfig.tailLen;
    const yearDist = yearLimits[1] - yearLimits[2];

    const MinPixelInMark = 80; // scale markBy to achieve >= this many pixels per mark
    let markBy = 10; // 10 years
    const yearJump = 10;
    // start from markBy year, increment by yearJump, until markBy years represents ~MinPixelInMark pixels
    while (true) {
      const len = Math.ceil(plotConfig.pixPerYear * markBy);
      if (len >= MinPixelInMark) break;
      markBy += yearJump;
    }

    return markBy;
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

  const buildData = () => {
    const spiralLen = plotConfig.spiralLen;
    const path = plotConfig.path;

    const sYearMax = yearWindow[0] + plotConfig.spiralYearTotal;
    const zeroYearPos = zeroYearPixel();
    const { y: tailY, x: tailX } = spiralEndPoint();

    const spiralBlocks = []; // the spiral block data
    const tailBlocks = [];
    const tailTimeScale = d3
      .scaleLinear()
      .domain([0, yearWindow[1]]) // zero year to current year range max
      .range([
        !tailOnly ? zeroYearPos - spiralLen : zeroYearPos,
        plotConfig.tailLen,
      ]);

    const oneSpiralBlock = (d, event = false) => {
      let block = null;
      if (!tailOnly && d.start <= sYearMax) {
        // data on spiral
        const pos = year2pixelPositionOnSpiral(
          d.start,
          yearWindow[0],
          sYearMax,
          spiralLen,
          path
        );
        block = {
          spiral: true,
          event,
          ...pos,
          group: d.name,
          group_start_year: d.start,
          group_end_year: d.end,
          linePer: pos.linePer, // for group leader labelling - use the prevous block's coordinate
        };
      }
      return block;
    };

    const oneTailBlockLeader = (d, event = false) => {
      const spixel = tailTimeScale(d.start); // pixel == 0 is the spiral / tail joint point
      let epixel = null;
      if (!event) {
        epixel = tailTimeScale(d.end);
        if (!epixel || epixel > plotConfig.tailLen)
          epixel = tailTimeScale(yearWindow[1]);
      }

      const anchor = spixel + GROUP_LEAD_WIDTH; // group leading block width
      const block = {
        x: spixel,
        y: tailY,
        start: spixel,
        end: anchor,
        event,
        group: d.name,
        group_leader: true,
        group_start_year: d.start,
        group_end_year: d.end,
      };
      return { block, anchor, epixel };
    };

    const spiralEventList = (list) => {
      const collected = [];
      const omited = [];
      list.forEach((d) => {
        if (d.start >= yearWindow[0]) {
          const block = oneSpiralBlock(d, true);
          if (block) {
            collected.push(block);
          } else {
            omited.push(d);
          }
        }
      });
      return { collected, omited };
    };

    const oneTailBlock = (d, psBlock = null, outRange = false) => {
      const { block, anchor, epixel } = oneTailBlockLeader(d);
      if (!outRange) tailBlocks.push(block);
      if (psBlock) {
        const anchor = 0; // tail leftend at x=0 when showing spiral
        tailBlocks.push({
          x: anchor,
          y: tailY,
          group: psBlock.group,
          start: anchor,
          end: epixel,
          psBlock,
        });
        // if (psBlock.events) {
        //   const elist = tailEventList(psBlock.events);
        //   console.log(elist, "[psBlock events]");
        //   tailBlocks.push(...elist);
        // }
      }
      tailBlocks.push({
        x: anchor,
        y: tailY,
        group: d.name,
        start: anchor,
        end: epixel,
      });
      if (d.events) {
        const elist = tailEventList(d.events);
        tailBlocks.push(...elist);
      }
    };

    const tailEventList = (list) => {
      const events = [];
      list.forEach((d) => {
        const { block } = oneTailBlockLeader(d, true);
        if (block) events.push(block);
      });
      return events;
    };

    let preSpiralBlock = null;
    let leftOutRangeData = null; // the previous data < spiral min
    for (let i = 0; i < timelineData.length; i++) {
      const d = timelineData[i];
      if (d.start >= yearWindow[0] && d.start <= yearWindow[1]) {
        if (!tailOnly && d.start <= sYearMax) {
          // spiral blocks
          const block = oneSpiralBlock(d);
          spiralBlocks.push(block);
          preSpiralBlock = { ...block };

          if (leftOutRangeData) {
            if (leftOutRangeData.events) {
              const { collected, omited } = spiralEventList(
                leftOutRangeData.events
              );
              spiralBlocks.push(...collected);
            }
            leftOutRangeData = null;
          }

          if (d.events) {
            const { collected, omited } = spiralEventList(d.events);
            spiralBlocks.push(...collected);
            preSpiralBlock.events = omited;
          }
        } else {
          // data on tail
          if (leftOutRangeData) {
            //
            oneTailBlock({ ...leftOutRangeData, end: d.end }, null, true);
            leftOutRangeData = null;
          }
          oneTailBlock(d, preSpiralBlock);
          if (preSpiralBlock) preSpiralBlock = null;
        }
      } else if (d.start < yearWindow[0]) {
        leftOutRangeData = d;
      }
    }

    if (preSpiralBlock && tailBlocks.length === 0) {
      const anchor = tailTimeScale(yearWindow[1] - plotConfig.tailYearTotal);
      tailBlocks.push({
        x: anchor,
        y: tailY,
        group: preSpiralBlock.group,
        start: anchor,
        end: tailTimeScale(yearWindow[1]),
        preSpiralBlock,
      });

      preSpiralBlock = null;
    }

    // console.log(tailBlocks, preSpiralBlock, "[tailBlocks]");
    return {
      spiralBlocks,
      tailBlocks,
      tailX,
      tailY,
      yearMarks: buildYearMarks(),
      sYearMax,
      sYearMin: yearWindow[0],
      xShift: tailOnly ? -(width * 0.5 - 20) : 0,
      yShift: tailOnly ? 50 : 0,
    };
  };

  const buildYearMarks = () => {
    // console.log(plotConfig, "[BM]");
    const spiralLen = plotConfig.spiralLen;
    const sYearMax = yearWindow[0] + plotConfig.spiralYearTotal;
    const yearMarks = []; // the spiral time mark data
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
        yearMarks.push({
          spiral,
          ...pos,
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

  const formatYearValue = (year) => (year < 0 ? `前${-year}` : year);

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

    // draw bar and label
    if (data.spiralBlocks.length > 0) {
      select("g")
        .selectAll("rect")
        .remove()
        .data(data.spiralBlocks.filter((d) => d.group && !d.event))
        .enter()
        .append("rect")
        .attr("x", (d) => d.x)
        .attr("y", (d) => d.y)
        // draw the bars on spiral
        .attr("width", (d) => 4) //barWidth)
        .attr("class", "leader")
        .attr("height", (d) => 8) // const bar height
        .style("fill", (d) => groupColor(d.group))
        .style("stroke", "stroke", "none")
        .style("opacity", RECT_OPACITY)
        .attr(
          "transform",
          (d) => "rotate(" + d.a + "," + d.x + "," + d.y + ")" // rotate the bar
        );

      // draw spiral event circle
      select("g")
        .selectAll(".spiral-event-circle")
        .remove()
        .data(data.spiralBlocks.filter((d) => d.event))
        .enter()
        .append("circle")
        .style("class", "spiral-event-circle")
        .attr("class", "leader")
        .attr("cx", (d) => d.x)
        .attr("cy", (d) => d.y)
        .attr("r", (_, i) => CIRCLE_R)
        .style("fill", (d) => groupColor(d.group))
        .attr("stroke", (d) => "#000")
        .style("opacity", 0.5);

      // draw spiral label
      let lastBlock = null;
      let lastEvent = null;
      select("g")
        .selectAll(".spiral-block-label")
        .remove()
        .data(data.spiralBlocks.filter((d) => d.group))
        .enter()
        .append("text")
        .attr("dy", (d) => {
          let dy = 10;
          if (d.event) {
            dy = -10;
            if (lastEvent) {
              const delta = Math.abs(d.linePer - lastEvent.linePer);
              // console.log(lastEvent.group, d.group, delta, "[diff]");
              if (delta < 60) {
                dy = 16;
              }
            }
          }
          lastEvent = d;
          return dy;
        }) // move down by 10 pixel
        .style("text-anchor", "start")
        .style("font", "10px arial")
        .style("class", "spiral-block-label")
        .append("textPath")
        .text((d) => {
          let label =
            d.group +
            (d.event ? "" : `(${formatYearValue(d.group_start_year)})`);

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
        .style("fill", (d) => (d.event ? groupColor(d.group) : "grey"))
        .attr("startOffset", (d) => {
          return (d.linePer / spiralLen) * 100 + "%";
        });
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
        .text((d) => d.year.toFixed(0))
        // place text along spiral
        .attr("xlink:href", "#spiral")
        .style("fill", "grey")
        .attr("startOffset", function (d) {
          return (d.linePer / spiralLen) * 100 + "%";
        });
    }

    const tailMarks = data.yearMarks.filter((d) => !d.spiral);

    if (tailMarks.length > 0) {
      let flap = false;
      const labelHeight = 20;
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
        .attr("y1", (d) => d.y + data.yShift)
        .attr("x2", (d) => d.x + data.xShift)
        .attr("y2", (d) => {
          const dy = d.y + (flap ? barTallHeight : barShortHeight);
          flap = !flap;
          return dy + data.yShift;
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
            return y + data.yShift;
          }) //magic number here
          .attr("text-anchor", "middle")
          .style("font", "10px arial")
          // .style("color", () => (d.year === 0 ? "red" : "black"))
          .attr("class", "tail-year-mark-label") //easy to style with CSS
          .text(d.year.toFixed(0));
      });
    }
    // select("g").selectAll(".zero-year").style("color", "red");
  };

  const drawTailLine = () => {
    const tailLen = plotConfig.tailLen;
    const data = plotData;
    select("g").selectAll(".tail-line").remove();
    select("g")
      .append("line")
      .style("class", "tail-line")
      .style("stroke", "steelblue")
      .style("stroke-width", 1)
      .attr("x1", data.tailX + +data.xShift)
      .attr("y1", data.tailY + data.yShift)
      .attr("x2", tailLen + +data.xShift)
      .attr("y2", data.tailY + data.yShift);
  };

  const cleanNameForId = (name) => name.replace("/", "");
  const drawTailGroup = () => {
    const data = plotData;
    // console.log(data, "[drawTailGroup]");
    let lastX = null;
    let lastGroup = null;
    let lastY = null;
    const avoidGroupOverlap = false;

    // draw the rect on tail line
    const RECT_HEIGHT = 4;
    if (data.tailBlocks.length > 0) {
      select("g").selectAll(".tailgroup").remove();
      select("g")
        .selectAll(".tailgroup")
        .data(data.tailBlocks.filter((d) => d.group && !d.event))
        .enter()
        .append("rect")
        .attr("class", "tailgroup")
        .attr("gid", (d, i) => `${cleanNameForId(d.group)}-${i + 1}`)
        .attr("id", (d, i) => `${cleanNameForId(d.group)}-${i}`)
        .attr("fill", "navy")
        .attr("class", (d) => (d.group_leader ? "leader" : "noleader"))
        .attr("x", (d) => d.start + data.xShift)
        .attr("y", (d) => {
          let y = d.y + data.yShift;
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

          return d.group_leader ? y - RECT_HEIGHT * 2 : y - RECT_HEIGHT;
        })
        .attr("width", (d) => {
          const w = d.end - d.start;
          return w > 0 ? w : 2;
        })
        .attr("height", (d) => (d.group_leader ? 8 : 4))
        .style("fill", (d) => groupColor(d.group))
        .style("stroke", (d) => groupColor(d.group))
        .style("opacity", RECT_OPACITY);
      // .on("mouseover", (_, d) => {
      //   if (d.group_leader) addTooltip(d);
      // })
      // .on("mouseout", (_, d) => {
      //   if (d.group_leader) rmTooltip();
      // });
    }

    // tail event circle
    select("g")
      .selectAll(".tail-event-circle")
      .remove()
      .data(data.tailBlocks.filter((d) => d.event))
      .enter()
      .append("circle")
      .style("class", "tail-event-circle")
      .attr("class", "leader")
      .attr("cx", (d) => d.x + data.xShift)
      .attr("cy", (d) => d.y + data.yShift - RECT_HEIGHT * 0.5)
      .attr("r", (_, i) => CIRCLE_R)
      .style("fill", (d) => groupColor(d.group))
      .attr("stroke", (d) => "#000")
      .style("opacity", 0.5);
    // .on("mouseover", (_, d) => addTooltip(d))
    // .on("mouseout", () => rmTooltip());

    // draw leader label on tail line
    if (data.tailBlocks.length > 0) {
      let flip = false; //alternatively show label on top / down of line to avoid overlapping
      const aheadPos = { true: [-1000], false: [-1000] };
      let lastBlock = null;
      select("g")
        .selectAll(".taillabel")
        .data(data.tailBlocks.filter((d) => d.group_start_year))
        .enter()
        .append("text")
        .attr("class", "tailgroup")
        .attr("x", (d) => (d.event ? 0 : d.x + data.xShift))
        .attr("y", (d) => {
          if (d.event) return 0;
          const y = d.y + (flip ? 12 : -12);
          const lastx = aheadPos[flip].sort().reverse()[0];
          // console.log(Math.abs(d.x - lastx), flip, d.group);
          flip = !flip;
          if (Math.abs(d.x - lastx) < 50) {
            flip = !flip;
          }
          aheadPos[flip].push(d.x);
          return y + data.yShift;
        })
        .style("text-anchor", "start")
        .style("font", "10px arial")
        .text((d) => {
          let label =
            d.group +
            (d.event ? "" : `(${formatYearValue(d.group_start_year)})`);
          if (lastBlock) {
            const dx = Math.abs(d.x - lastBlock.x);
            // console.log(dx.toFixed(2), d.group, "[label]");
            if (!d.event && dx < BLOCK_MIN_GAP) {
              label = "";
            }
          }
          lastBlock = d;
          return label;
        })
        .attr(
          "transform",
          (d) => {
            if (d.event) {
              return `translate(${d.x + data.xShift + 4},${
                d.y + data.yShift - 10
              })rotate(-90)`;
            }
          } // rotate the text
        );
    }
  };

  const drawScale = () => {
    if (!timeUnit) return;
    const x0 = -220;
    const y0 = -230;
    const h = -4;
    const len = plotConfig.pixPerYear * yearMarkUnit();
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
    const label = [
      {
        x: x0 + len * 0.5 - 14,
        y: y0 - 4,
        text: `${yearMarkUnit()}年`,
      },
      {
        x: x0 + 4,
        y: y0 + 12,
        text: `${formatYearValue(ymin)} - ${formatYearValue(ymax)}`,
      },
      {
        x: x0 + 4,
        y: y0 + 24,
        text: `[total ${ymax - ymin}]`,
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

    // tryout
    // const cdata = [
    //   { r: 10, x: x0, y: y0 },
    //   { r: 16, x: x0 + len, y: y0 },
    // ];
    // select("g")
    //   .selectAll(".scale-ref-circle")
    //   .remove()
    //   .data(cdata)
    //   .enter()
    //   .append("circle")
    //   .style("class", "scale-ref-circle")
    //   .attr("cx", (d) => 0)
    //   .attr("cy", (d) => 0)
    //   .attr("r", (d) => d.r)
    //   .style("fill", "green")
    //   .attr("stroke", "#000")
    //   .attr("fill", "#fff")
    //   .style("opacity", 0.5);
  };

  const addInfo = (x, y, d) => {
    let text = d.event
      ? `${d.group} : ${formatYearValue(d.group_start_year)}`
      : `朝代: ${d.group}`;
    if (!d.event) {
      text +=
        `[${formatYearValue(d.group_start_year)} - ${
          d.group_end_year !== undefined
            ? ` ${formatYearValue(d.group_end_year)}`
            : ""
        }]` +
        `${
          d.group_end_year !== undefined
            ? ` [${d.group_end_year - d.group_start_year}]`
            : ""
        }`;
    }

    setTipPositioin([x, y, text, d.event ? groupColor(d.group) : "#000"]);
  };
  const drawTips = () => {
    select("g")
      .selectAll(".leader")
      .on("mouseover", (event, d) => {
        addInfo(event.pageY, event.pageX, d);
      })
      .on("mouseout", () => {
        // console.log("out");
        setTipPositioin(null);
      });
  };

  const minDist = () => {
    const dist = yearLimits[1] - yearLimits[0];
    if (dist <= 1000) {
      return 50;
    } else if (dist <= 10000) {
      return 500;
    } else {
      return 1000;
    }
  };

  //-- event handlers
  const handleYearRangeChange = (_event, newValue, activeThumb) => {
    // activeThumb: 0->left; 1->right
    if (!Array.isArray(newValue)) {
      return;
    }
    const dist = newValue[1] - newValue[0];

    const minDistance = minDist(dist);
    if (dist < minDistance) {
      if (activeThumb === 0 && newValue[0] + minDistance <= yearWindow[1]) {
        setYearWindow([newValue[0], newValue[0] + minDistance]);
      } else if (newValue[1] - minDistance >= yearWindow[0]) {
        setYearWindow([newValue[1] - minDistance, newValue[1]]);
      }
    } else {
      setYearWindow(newValue);
    }
  };

  const handleSpiralLoopChange = (e) => {
    setSpiralLoops(e.target.value);
  };

  const handleTimeHeadChange = (e) => {
    const value = e.target.value;
    const order = timeHeadArray.lookup[value];
    // console.log(
    //   value,
    //   timeButt,
    //   timeHeadArray.lookup,
    //   "[handleTimeHeadChange]"
    // );
    if (timeButt && order.index >= timeHeadArray.lookup[timeButt].index) return; // range zero or crossed

    const range = [
      order.start,
      timeButt ? timeHeadArray.lookup[timeButt].start : yearWindow[1],
    ];
    setTimeHead(value);

    setTimeButtArray({
      ordered: timeHeadArray.ordered.slice(order.index + 1),
      lookup: timeHeadArray.lookup,
    });
    setYearLimits(range);
    setYearWindow(range);
  };

  const handleTimeButtChange = (e) => {
    const value = e.target.value;
    const order = timeHeadArray.lookup[value];
    const range = [
      timeHead ? timeHeadArray.lookup[timeHead].start : yearWindow[0],
      order.start,
    ];
    setTimeButt(value);
    setYearLimits(range);
    setYearWindow(range);
  };
  // console.log(timeHead, timeButt, yearLimits, yearWindow, "[time head/butt]");
  const control = spiralConfig && Object.keys(timeHeadArray).length > 0;

  // console.log(tipPosition, "[tipPosition]");
  return (
    <>
      <div id="timeline" style={{ border: "solid 1px #666" }}>
        {spiralConfig ? null : "Loading..."}
        <svg
          width={width + m_right + m_left + TAIL_LEN_IN_PIXEL}
          height={height + m_top + m_bottom}
          ref={containerRef}
        >
          <g transform={`translate(${width / 2}, ${height / 2})`} />
        </svg>
      </div>
      {control ? (
        <div style={{ display: "flex", width: "auto", alignItems: "center" }}>
          <RangeCtl
            limits={yearLimits}
            value={yearWindow}
            handleChange={handleYearRangeChange}
          />

          <SelectCtl
            label="头"
            value={timeHead}
            valueArray={timeHeadArray.ordered?.map((d) => d[1])}
            handleChange={handleTimeHeadChange}
            width={80}
          />
          <SelectCtl
            label="尾"
            value={timeButt}
            valueArray={timeButtArray.ordered?.map((d) => d[1])}
            handleChange={handleTimeButtChange}
            width={80}
          />

          <CheckCtl label="直线" callback={setTailOnly} checked={tailOnly} />
          <CheckCtl label="时标" callback={setTimeMark} checked={timeMark} />
          <CheckCtl label="单位" callback={setTimeUnit} checked={timeUnit} />

          <SelectCtl
            label="Loops"
            value={spiralLoop}
            valueArray={SPIRAL_LOOP_ARRAY}
            handleChange={handleSpiralLoopChange}
          />
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
              }}
            >
              {tipPosition[2]}
            </div>
          ) : null}
        </div>
      ) : null}
    </>
  );
};

export default TimelineSpiral;
