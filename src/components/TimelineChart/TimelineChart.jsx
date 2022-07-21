import React, { useState, useEffect, useRef } from "react";
import TimelinesChart from "timelines-chart";
import { select } from "d3";

import timelineData from "../../assets/data/timeline";
import monarch from "../../assets/data/monarch";
import locals from "../../assets/data/locals";

import { normalizeYear } from "../../utils/Formatter";
import SelectCtl from "../Controls/SelectCtl";

/*
Refs:
    https://www.npmjs.com/package/timelines-chart?activeTab=readme
    https://github.com/vasturiano/timelines-chart/tree/master/src
 */
const TimelineChart = () => {
  const [tData, setTData] = useState(null);
  const [gList, setGList] = useState(null);
  const [gID, setGID] = useState(null);
  const [flatData, setFlatData] = useState(null);
  const ref = useRef();
  const chartRef = useRef();

  const lineData = (dArray, type) => {
    const data = [];

    dArray.forEach((d) => {
      if (d.start) {
        data.push({
          timeRange: [
            d.start,
            d.end && type === "君王" ? d.end : d.start + 0.5,
          ],
          val: d.name,
          info: d.info,
          type,
        });
      }
    });
    return data;
  };

  const toolTip = (d) => {
    const data = flatData[d.group][d.label][d.val];
    // console.log(data, "[toolTip]");

    // return d.val;
    return (
      `<div style="width: 200px; text-align: left; background-color: #999; padding: 4px">` +
      `<pre>${d.val} : ${normalizeYear(d.timeRange[0])}${
        data.type === "君王" ? `-${normalizeYear(d.timeRange[1])}` : ""
      } </pre>` +
      `${data.info ? data.info : ""}` +
      `</div>`
    );
  };

  const flattern = (dlist) => {
    // console.log(dlist, "[flattern]");
    const fdata = {};
    dlist.forEach((d) => {
      fdata[d.group] = {};
      d.data.forEach((d2) => {
        fdata[d.group][d2.label] = {};
        d2.data.forEach((d3) => {
          const { info, type } = d3;
          fdata[d.group][d2.label][d3.val] = { info, type };
        });
      });
    });
    setFlatData(fdata);
  };
  const loadDataSimple = () => {
    const data = [];
    timelineData.forEach((d) => {
      const g = {
        group: d.name,
        data: [],
      };

      const map = {
        君王: monarch[d.name],
        大事: d.events,
      };

      Object.keys(map).forEach((key) => {
        const dlist = map[key];
        if (dlist) {
          const tmp = {
            label: key,
            data: lineData(dlist, key),
          };
          g.data.push(tmp);
        }
      });

      data.push(g);

      setTData(data);
      setGID(5);
      setGList(data.map((d) => d.group));
    });

    const myChart = TimelinesChart()(ref.current);
    chartRef.current = myChart;
  };
  const loadDataExt = () => {
    const raw = {};
    timelineData.forEach((d) => {
      raw[d.name] = {};
      const map = {
        君王: monarch[d.name],
        大事: d.events,
      };
      Object.keys(map).forEach((key) => {
        const dlist = map[key];
        if (dlist) {
          raw[d.name][key] = lineData(dlist, key);
        }
      });
    });

    // reduce the data array
    const fData = [];
    const GROUPS = {
      周: ["西周", "东周"],
      秦汉: ["秦", "西楚", "西汉", "新", "东汉"],
    };
    Object.keys(GROUPS).forEach((key) => {
      const grp = {
        group: key,
        data: [],
      };
      const mlist = grp.data;
      GROUPS[key].forEach((d) => {
        const list = raw[d];
        // console.log(key, mlist, "[debug]");
        if (list) {
          Object.keys(list).forEach((key) => {
            const mid = mlist.findIndex((d) => d.label === key);
            if (mid === -1) {
              mlist.push({ label: key, data: [...list[key]] });
            } else {
              mlist[mid].data = mlist[mid].data.concat([...list[key]]);
            }
          });
        }
      });
      if (locals[key]) {
        Object.keys(locals[key]).forEach((k) => {
          const tmp = lineData(locals[key][k], "君王");
          grp.data.push({ label: k, data: tmp });
        });
      }
      //   console.log(grp.data);
      fData.push(grp);
    });

    flattern(fData);
    setTData(fData);
    setGID(0);
    setGList(fData.map((d) => d.group));

    const myChart = TimelinesChart()(ref.current);
    chartRef.current = myChart;
  };
  useEffect(() => {
    loadDataExt();
    // loadDataSimple();
  }, []);

  const handleLabelClick = (a, b) => {
    console.log(a, b, "[handleLabelClick}");
  };
  useEffect(() => {
    if (gList && gID !== null) {
      //   console.log(JSON.stringify(flatData), "[flatData]");
      chartRef.current
        .xTickFormat((n) => +n)
        .zQualitative(true)
        .dateMarker(new Date() - 365 * 24 * 60 * 60 * 1000) // Add a marker 1y ago
        .data([tData[gID]])
        // .zDataLabel("DEBUG")
        // .enableOverview(false)
        .onLabelClick(handleLabelClick)
        .segmentTooltipContent(toolTip)
        .dateMarker(false);

      //- legend
      select(".legendG").remove(); // top legend, too many

      //- tooltip
      select(".chart-tooltip") //.segment-tooltip")
        .style("padding", "1px")
        .style("background-color", "#900")
        .remove();

      //   myChart.refresh();
      //   .xTickFormat((d, a) => {
      //     console.log(d, a, "[xtick]");
      //   });

      //   console.log(
      //     chartRef.current.getVisibleStructure(),
      //     "[getVisibleStructure]"
      //   );
    }
  }, [gList, gID]);

  return (
    <>
      <div style={{ margin: 10 }} id="chart" ref={ref} />
      {gList && gID !== null ? (
        <div style={{ display: "flex", width: "auto", alignItems: "center" }}>
          <SelectCtl
            value={gList[gID]}
            valueArray={gList}
            handleChange={(e) => setGID(gList.indexOf(e.target.value))}
          />
        </div>
      ) : null}
    </>
  );
};

export default TimelineChart;
