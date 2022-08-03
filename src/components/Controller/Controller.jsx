import React, { useEffect, useState } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";

import database from "../../assets/data/monarch";
import info from "../../assets/data/info";
import refs from "../../assets/data/ref";
import OrgChart from "../GOJS/OrgChart/OrgChart";
import GoGantt from "../GOJS/Gantt/Gantt";
import Gantt from "../Gantt/Gantt";
import Timeline from "../D3/Timeline";
import TimelineChart from "../TimelineChart/TimelineChart";
import SelectCtl from "../Controls/SelectCtl";

// relation type constants
export const SECTION_DEFAULT = "全部";
const LINK_KEY_FATHER = "father";

const transformData = (data, linkBy = LINK_KEY_FATHER) => {
  // linkBy : ["father", "inherit"] - node links
  // console.log(data, "[TF]")
  const darray = [];
  const idmap = {};
  let order = 0; // sequential position in king chain
  data.forEach((d, i) => {
    const { name, pinin, inherit, position, father } = d;
    idmap[name] = i;

    const row = {
      key: i,
      name: pinin ? `${name} [${pinin}]` : name,
      position,
      intro: info[name]?.intro,
    }; // add the sequential key for link reference
    const linkKey = linkBy === LINK_KEY_FATHER ? father : inherit;
    if (idmap[linkKey] !== undefined) row.parent = idmap[linkKey]; // convert parent to sequential key value for link reference
    if (refs[name]) row.url = refs[name];
    if (info[name] === undefined) row.hide_info = "true";
    if (position === "帝") row.order = ++order;
    darray.push(row);
  });
  // console.log(JSON.stringify(darray))
  return darray;
};

const flatterByType = (kname) => {
  // flattern object into array
  if (kname in database) return database[kname];

  const arr = [];

  Object.keys(database).forEach((kname) => {
    database[kname].forEach((d) => arr.push(d));
  });
  return arr;
};

const Controller = () => {
  const [searchString, setSearchString] = useState("");
  const [nodeDataArray, setNodeDataArray] = useState(null);
  //   // const [nodeType, setNodeType] = useState("king");
  const [sections, setSections] = useState([]);
  const [section, setSection] = useState(SECTION_DEFAULT);
  const [displayType, setDisplayType] = useState("Timeline");

  useEffect(() => {
    // console.log("[Controller] reload");
    const list = Object.keys(database).map((sec) => sec);
    list.unshift(SECTION_DEFAULT);
    setSections(list);
  }, []);

  useEffect(() => {
    const flat = flatterByType(section);
    const nodes = transformData(flat);
    setNodeDataArray(nodes);
  }, [section]);

  const handleSectionChange = (e) => {
    setSection(e.target.value);
  };

  const handleGraphTypeChange = (e) => {
    setDisplayType(e.target.value);
  };

  const secSelect =
    sections.length > 0
      ? sections.map((sec) => (
          <MenuItem key={sec} value={sec}>
            {sec}
          </MenuItem>
        ))
      : null;

  const mainControl = (
    <div style={{ display: "flex", alignItems: "center" }}>
      <TextField
        value={searchString}
        label="Enter your search"
        onChange={(e) => {
          setSearchString(e.target.value);
        }}
        variant="outlined"
        size="small"
        style={{ margin: 4 }}
      />

      {secSelect ? (
        <FormControl sx={{ m: 1, minWidth: 120 }}>
          <Select
            value={section}
            onChange={handleSectionChange}
            displayEmpty
            inputProps={{ "aria-label": "Without label" }}
            size="small"
            style={{ marginLeft: 24 }}
          >
            {secSelect}
          </Select>
        </FormControl>
      ) : null}

      <FormControl sx={{ m: 1, minWidth: 120 }}>
        <Select
          value={displayType}
          onChange={handleGraphTypeChange}
          displayEmpty
          inputProps={{ "aria-label": "Without label" }}
          size="small"
          style={{ marginLeft: 24 }}
        >
          {["Tree", "Gantt", "GoGantt", "Timeline"].map((sec) => (
            <MenuItem key={sec} value={sec}>
              {sec}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  );

  const GRAPH_TYPES = ["时间轴", "平行线"];
  const [graph, setGraph] = useState(GRAPH_TYPES[0]);

  const ctlType = "mini";

  if (!nodeDataArray) {
    return <div style={{ margin: 40 }}>Loading ... </div>;
  }
  return (
    <>
      {displayType === "Tree" ? (
        <OrgChart nodeDataArray={nodeDataArray} />
      ) : displayType === "Gantt" ? (
        <Gantt />
      ) : displayType === "GoGantt" ? (
        <GoGantt />
      ) : displayType === "Timeline" ? (
        <Router>
          {/* <TimelineChart /> */}
          {ctlType === "mini" && graph === GRAPH_TYPES[1] ? (
            <TimelineChart
              changePlot={() => setGraph(GRAPH_TYPES[0])}
              changePlotLabel={GRAPH_TYPES[0]}
            />
          ) : (
            <Timeline
              changePlot={() => setGraph(GRAPH_TYPES[1])}
              changePlotLabel={GRAPH_TYPES[1]}
            />
          )}
        </Router>
      ) : null}

      {/* <div style={{ display: "flex", width: "auto", alignItems: "center" }}>
        {ctlType === "main" ? (
          mainControl
        ) : ctlType === "mini" ? (
          <SelectCtl
            value={graph}
            valueArray={GRAPH_TYPES}
            handleChange={(e) => setGraph(e.target.value)}
          />
        ) : null}
      </div> */}
    </>
  );
};

export default Controller;
