import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { isMobile } from "react-device-detect";

import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";

import Spiral, { TAIL_GAP } from "./TimelineSpiral/TimelineSpiral";
import RangeCtl from "../Controls/RangeCtl";
import SelectCtl from "../Controls/SelectCtl";
import MoreMenu from "../Controls/MoreMenu";
import AvertaCtl, {
  TYPE_SPIRAL,
  TYPE_MARK,
  TYPE_SCALE,
  TYPE_RESET,
} from "../Controls/AvertarCtl";
import timeline from "../../assets/data/timeline";
import { notNull, normalizeYear } from "../../utils/Formatter";
import { Typography } from "@mui/material";

const BODY_PADDING = 9; // document has this padding that affects the topmost div
const THIS_YEAR = new Date().getFullYear();
const DEFAULT_TIME_HEAD = timeline.findIndex((d) => d.name === "西周"); //黄帝"); // timeline "黄帝" index
const DEFAULT_TIME_BUTT = timeline.findIndex((d) => d.name === "今年"); // timeline "今年" index
const FAR_YEAR = timeline[DEFAULT_TIME_HEAD].start; // timeline "黄帝" start
const NEAR_YEAR = THIS_YEAR; // initial starting year in limeline, running backwards to past
const SPIRAL_LOOP_ARRAY = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];

const Timeline = (props) => {
  const { changePlot, changePlotLabel } = props;
  const [portrait, setPortrait] = useState(false);
  const [timeHeadArray, setTimeHeadArray] = useState({});
  const [timeHead, setTimeHead] = useState(DEFAULT_TIME_HEAD);
  const [timeButtArray, setTimeButtArray] = useState({});
  const [timeButt, setTimeButt] = useState(DEFAULT_TIME_BUTT);

  const [yearLimits, setYearLimits] = useState([FAR_YEAR, NEAR_YEAR]); // year min and max
  const [yearWindow, setYearWindow] = useState([FAR_YEAR, NEAR_YEAR]); // current view year range
  const [spiralLoop, setSpiralLoops] = useState(SPIRAL_LOOP_ARRAY[1]);
  const [tailOnly, setTailOnly] = useState(false);
  const [timeMark, setTimeMark] = useState(false);
  const [timeUnit, setTimeUnit] = useState(false);
  const [sliderObj, _setSliderObj] = useState(null);

  const [searchParams, _setSearchParams] = useSearchParams();

  const [dataReady, setDataReady] = useState(false);
  const [winSize, setWinSize] = useState({
    width: 500,
    height: 500,
    x0: 220,
    y0: 300,
  });

  const navigate = useNavigate();
  const urlToIntRange = (value) => {
    return value.split(",").map((d) => parseInt(d));
  };
  useEffect(() => {
    const ordered = [];
    const lookup = {}; // from name str to order index
    const rlookup = {}; // from order index to name str
    timeline.forEach((d, idx) => {
      ordered.push([d.start, d.name]);
      lookup[d.name] = { start: d.start, index: idx };
      rlookup[idx] = d.name;
    });
    const buttArray = ordered.slice(timeHead + 1);
    setTimeHeadArray({ ordered, lookup, rlookup });
    setTimeButtArray({ ordered: buttArray });

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

  const searchParamData = () => {
    const dict = {};
    for (const entry of searchParams.entries()) {
      const [param, value] = entry;
      dict[param] = value;
    }
    return Object.keys(dict).length > 0 ? dict : null;
  };

  const refresh = (param) => {
    navigate({
      pathname: window.location.pathname,
      search: param ? param : "",
    });
  };
  const setSliderObj = (val) => {
    setYearWindow(val);
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
  const handleYearRangeChange = (_, val) => {
    updateURL("yw", val);
  };

  const handleTimeHeadChange = (e) => {
    updateTimeHead(e.target.value);
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

  const debugFn = () => {
    console.info(
      yearWindow,
      // plotData.tailEventList,
      // plotData.tailEventBlocks,
      // plotData.spiralEventBlocks,
      "debugFn"
    );
  };

  const resetBtn = dataReady ? (
    <AvertaCtl
      type={TYPE_RESET}
      key="reset-ctl"
      label="复原"
      callback={handleReset}
      checked={true}
    />
  ) : null;
  const spiralCtl = dataReady ? (
    <AvertaCtl
      key="spiral-ctl"
      type={TYPE_SPIRAL}
      label="螺线"
      callback={() => updateURL("tail", !tailOnly)}
      checked={!tailOnly}
    />
  ) : null;
  const markCtl = dataReady ? (
    <AvertaCtl
      key="mark-ctl"
      type={TYPE_MARK}
      label="时标"
      callback={() => updateURL("mark", !timeMark)}
      checked={timeMark}
    />
  ) : null;
  const scaleCtl = dataReady ? (
    <AvertaCtl
      type={TYPE_SCALE}
      key="scale-ctl"
      label="单位"
      callback={() => updateURL("unit", !timeUnit)}
      checked={timeUnit}
    />
  ) : null;
  const loopCtl = dataReady ? (
    <SelectCtl
      key="select-ctl-loop"
      label="圈数"
      value={spiralLoop}
      valueArray={SPIRAL_LOOP_ARRAY}
      handleChange={(e) => updateURL("loops", e.target.value)}
    />
  ) : null;
  const loopCmp = tailOnly ? null : dataReady ? (
    <Grid item xs={1}>
      {loopCtl}
    </Grid>
  ) : null;

  const yRangeCtl = dataReady ? (
    <RangeCtl
      key="range-ctl"
      limits={yearLimits}
      value={yearWindow}
      setRange={setSliderObj}
      handleChange={handleYearRangeChange}
      width={150}
    />
  ) : null;

  const yStartCtl = dataReady ? (
    <SelectCtl
      key="select-ctl-start"
      label="起始"
      value={notNull(timeHead) ? timeHeadArray.rlookup[timeHead] : ""}
      valueArray={timeHeadArray.ordered?.map((d) => d[1])}
      handleChange={handleTimeHeadChange}
      width={80}
    />
  ) : null;

  const yEndCtl = dataReady ? (
    <SelectCtl
      key="select-ctl-end"
      label="终结"
      value={timeHeadArray.rlookup[timeButt]}
      valueArray={timeButtArray.ordered?.map((d) => d[1])}
      handleChange={handleTimeButtChange}
      width={80}
    />
  ) : null;
  const showControls = dataReady && Object.keys(timeHeadArray).length > 0;
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
            <Typography
              style={{
                position: "relative",
                top: -10,
                fontSize: 12,
                fontStyle: "italic",
                color: "#aaa",
                textAlign: "center",
              }}
            >
              时间区 - {normalizeYear(yearWindow[1] - yearWindow[0])}
            </Typography>
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
      <div id="timeline">
        <Spiral
          {...props}
          timeline={timeline}
          winSize={winSize}
          portrait={portrait}
          setDataReady={setDataReady}
          tailOnly={tailOnly}
          timeMark={timeMark}
          timeUnit={timeUnit}
          yearWindow={yearWindow}
          spiralLoop={spiralLoop}
        />
      </div>
      <div style={{ display: "flex", width: "auto", alignItems: "center" }}>
        {controls}
      </div>
    </>
  );
};

export default Timeline;
