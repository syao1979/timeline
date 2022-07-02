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

const TAIL_LEN_IN_PIXEL = 1000;
const YEAR_RANGE_DEFAULT = 5000;
const RECT_OPACITY = 0.6;
const BLOCK_MIN_GAP = 28;
const GROUP_LEAD_WIDTH = 6;
const SPIRAL_START = 0;
const SPIRAL_END = 2; // need to be even number to end at top
const color = d3.scaleOrdinal(d3.schemeCategory10); // used to assign nodes color by group
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

  const [yearLimits, setYearLimits] = useState([end_year, start_year]); // year min and max
  const [yearWindow, setYearWindow] = useState([end_year, start_year]); // current view year range
  const [spiralLoop, setSpiralLoops] = useState(SPIRAL_LOOP_ARRAY[1]);
  const [timeHeadArray, setTimeHeadArray] = useState({});
  const [timeHead, setTimeHead] = useState("");
  const [timeButtArray, setTimeButtArray] = useState({});
  const [timeButt, setTimeButt] = useState("");
  const [tailOnly, setTailOnly] = useState(false);
  const [showTimeMark, setShowTimeMark] = useState(false);
  const [showTimeUnitBar, setShowTimeUnitBar] = useState(false);

  const containerRef = useRef(null);
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
  }, [plotData, showTimeMark]);

  useEffect(() => {
    if (plotData) {
      repaint();
    }
  }, [showTimeUnitBar, showTimeMark]);

  const repaint = () => {
    select("g").selectAll("*").remove(); // clear all elements - for redraw
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
    addTips();
    drawScale();
    // drawReference(100);
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
    const tailTimeScale = d3
      .scaleLinear()
      .domain([0, yearWindow[1]]) // zero year to current year range max
      .range([
        !tailOnly ? zeroYearPos - spiralLen : zeroYearPos,
        plotConfig.tailLen,
      ]);

    const spiralBlocks = []; // the spiral block data
    const tailBlocks = [];

    for (let i = 0; i < timelineData.length; i++) {
      const d = timelineData[i];
      if (d.start >= yearWindow[0] && d.start <= yearWindow[1]) {
        if (!tailOnly && d.start <= sYearMax) {
          const pos = year2pixelPositionOnSpiral(
            d.start,
            yearWindow[0],
            sYearMax,
            spiralLen,
            path
          );
          const data = {
            spiral: true,
            ...pos,
            group: d.name,
            group_start_year: d.start,
            group_end_year: d.end,
            linePer: pos.linePer, // for group leader labelling - use the prevous block's coordinate
          };
          spiralBlocks.push(data);
        } else {
          // if (d.start > yearWindow[1]) break;
          const spixel = tailTimeScale(d.start); // pixel == 0 is the spiral / tail joint point
          let epixel = tailTimeScale(d.end);
          if (!epixel || epixel > plotConfig.tailLen)
            epixel = tailTimeScale(yearWindow[1]);

          const anchor = spixel + GROUP_LEAD_WIDTH; // group leading block width

          tailBlocks.push({
            x: spixel,
            y: tailY,
            group: d.name,
            group_leader: true,
            start: spixel,
            end: anchor,
            group_start_year: d.start,
            group_end_year: d.end,
          });
          tailBlocks.push({
            x: anchor,
            y: tailY,
            group: d.name,
            start: anchor,
            end: epixel,
          });
        }
      }
    }

    // console.log(tailY, "[tailY]");
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
        .data(data.spiralBlocks)
        .enter()
        .filter((d) => d.group)
        .append("rect")
        .attr("x", (d) => d.x)
        .attr("y", (d) => d.y)
        // draw the bars on spiral
        .attr("width", (d) => 4) //barWidth)
        .attr("class", (d) => "leader")
        .attr("height", (d) => 8) // const bar height
        .style("fill", (d) => color(d.group))
        .style("stroke", "stroke", "none")
        .style("opacity", RECT_OPACITY)
        .attr(
          "transform",
          (d) => "rotate(" + d.a + "," + d.x + "," + d.y + ")" // rotate the bar
        );

      // draw label
      let lastBlock = null;

      select("g")
        .selectAll(".spiral-block-label")
        .remove()
        .data(data.spiralBlocks)
        .enter()
        .filter((d) => d.group)
        .append("text")
        .attr("dy", 10)
        .style("text-anchor", "start")
        .style("font", "10px arial")
        .style("class", "spiral-block-label")
        .append("textPath")
        .text((d) => {
          let label = `${d.group} (${formatYearValue(d.group_start_year)})`;
          if (lastBlock) {
            const dx = Math.abs(d.x - lastBlock.x);
            const dy = Math.abs(d.y - lastBlock.y);
            // console.log(dx.toFixed(2), dy.toFixed(2), d.group, "[label]");
            if (dx < BLOCK_MIN_GAP && dy < BLOCK_MIN_GAP) {
              label = "";
            }
          }
          lastBlock = d;
          return label;
        })
        // place text along spiral
        .attr("xlink:href", "#spiral")
        .style("fill", "grey")
        .attr("startOffset", function (d) {
          return (d.linePer / spiralLen) * 100 + "%";
        });
    }
  };

  const drawTimeMarks = () => {
    if (!showTimeMark) return;
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
    if (data.tailBlocks.length > 0) {
      select("g").selectAll(".tailgroup").remove();
      select("g")
        .selectAll(".tailgroup")
        .data(data.tailBlocks)
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

          return d.group_leader ? y - 8 : y - 4;
        })
        .attr("width", (d) => {
          const w = d.end - d.start;
          return w > 0 ? w : 2;
        })
        .attr("height", (d) => (d.group_leader ? 8 : 4))
        .style("fill", (d) => color(d.group))
        .style("stroke", (d) => color(d.group))
        .style("opacity", RECT_OPACITY);
    }

    // draw text rect label on tail line
    if (data.tailBlocks.length > 0) {
      let flip = false; //alternatively show label on top / down of line to avoid overlapping
      const aheadPos = { true: [-1000], false: [-1000] };
      let lastBlock = null;
      select("g")
        .selectAll(".taillabel")
        .data(data.tailBlocks)
        .enter()
        .append("text")
        .attr("class", "tailgroup")
        .filter((d) => d.group_start_year)
        .attr("x", (d) => d.x + data.xShift)
        .attr("y", (d) => {
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
          let label = `${d.group} (${formatYearValue(d.group_start_year)})`;
          if (lastBlock) {
            const dx = Math.abs(d.x - lastBlock.x);
            // console.log(dx.toFixed(2), d.group, "[label]");
            if (dx < BLOCK_MIN_GAP) {
              label = "";
            }
          }
          lastBlock = d;
          return label;
        })
        .attr("xlink:href", "#tail");
    }
  };

  const drawScale = () => {
    if (!showTimeUnitBar) return;
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
      .data(label)
      .enter()
      .append("text")
      .attr("class", "scale-ref-label")
      .attr("x", (d) => d.x)
      .attr("y", (d) => d.y)
      .style("text-anchor", "start")
      .style("font", "10px arial")
      .text((d) => d.text)
      .attr("xlink:href", "#tail");
  };

  const addTips = () => {
    const addInfo = (d) => {
      // const fromY =
      //   d.group_start_year >= 0
      //     ? d.group_start_year
      //     : `前${-d.group_start_year}`;
      // const toY =
      //   d.group_end_year !== undefined && d.group_end_year >= 0
      //     ? d.group_end_year
      //     : `前${-d.group_end_year}`;
      // const rangeY = d.group_end_year - d.group_start_year;

      tooltip.select(".group-leader-tip");
      d3.select("#info").html(
        `朝代: ${d.group} [${
          d.group_start_year >= 0
            ? d.group_start_year
            : `前${-d.group_start_year}`
        } - ${
          d.group_end_year !== undefined
            ? ` ${
                d.group_end_year < 0
                  ? `前${-d.group_end_year}`
                  : d.group_end_year
              }`
            : ""
        }]` +
          `${
            d.group_end_year !== undefined
              ? ` [${d.group_end_year - d.group_start_year}]`
              : ""
          }`
        // +
        // ` [x=${d.x.toFixed(1)}, y=${d.y.toFixed(1)}; g_start_y=${
        //   d.group_start_year
        // }; g_end_year=${d.group_end_year}]`
      );
    };
    const tooltip = d3
      .select("#timeline")
      .append("div")
      .attr("class", "tooltip");

    tooltip
      .append("div")
      .attr("class", "group-leader-tip")
      .style("font", "10px arial")
      .style("position", "absolute");
    // tooltip.append("div").attr("class", "value").style("font", "10px arial");

    select("g")
      .selectAll(".leader")
      .on("mouseover", function (_event, d) {
        addInfo(d);

        d3.select(this)
          .style("fill", "#FFFFFF")
          .style("stroke", "#000000")
          .style("stroke-width", "1px");

        const gid = `#${d3.select(this).attr("gid")}`;
        select("g").select(gid).style("opacity", 1);
        // tooltip.style("display", "block");
        // tooltip.style("opacity", 2);
      })
      .on("mousemove", function (event, d) {
        tooltip
          .style("top", `${event.clientY + 10}px`)
          .style("left", `${event.clientX - 25}px`);
        // tooltip
        //   .style("top", `${event.layerY + 10}px`)
        //   .style("left", `${event.layerX - 25}px`);
      })
      .on("mouseout", function (event, d) {
        d3.select("#info").html("");
        d3.selectAll("rect")
          .style("fill", (d) => color(d.group))
          .style("stroke", "none");

        tooltip.style("display", "none");
        tooltip.style("opacity", 0);

        const gid = `#${d3.select(this).attr("gid")}`;
        select("g").select(gid).style("opacity", RECT_OPACITY);
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

  return (
    <>
      <div
        id="info"
        style={{
          width: "100%",
          height: 12,
          font: "10px arial",
          margin: "4px 0px",
        }}
      ></div>
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
            label="From"
            value={timeHead}
            valueArray={timeHeadArray.ordered?.map((d) => d[1])}
            handleChange={handleTimeHeadChange}
            width={80}
          />
          <SelectCtl
            label="To"
            value={timeButt}
            valueArray={timeButtArray.ordered?.map((d) => d[1])}
            handleChange={handleTimeButtChange}
            width={80}
          />

          <FormGroup style={{ marginLeft: 40 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={tailOnly}
                  onClick={() => setTailOnly(!tailOnly)}
                />
              }
              label="On tail"
            />
          </FormGroup>

          <FormGroup style={{ marginLeft: 40 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={showTimeMark}
                  onClick={() => setShowTimeMark(!showTimeMark)}
                />
              }
              label="Time Mark"
            />
          </FormGroup>

          <FormGroup style={{ marginLeft: 40 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={showTimeUnitBar}
                  onClick={() => setShowTimeUnitBar(!showTimeUnitBar)}
                />
              }
              label="Time Unit"
            />
          </FormGroup>

          <SelectCtl
            label="Loops"
            value={spiralLoop}
            valueArray={SPIRAL_LOOP_ARRAY}
            handleChange={handleSpiralLoopChange}
          />
        </div>
      ) : null}
    </>
  );
};

export default TimelineSpiral;
