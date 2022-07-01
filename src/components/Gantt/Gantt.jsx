import React from "react";
import TreeFolders from "../TreeFolders/TreeFolders";

import classes from "./Gantt.module.css";

const Gantt = () => {
  return (
    <div className={classes.TopContainer}>
      <div className={classes.TreeColumn}>
        <TreeFolders />
      </div>
      <div
        style={{
          height: "auto",
          width: "auto",
          flex: 1,
          border: "solid 1px #f00",
        }}
      >
        Test
      </div>
    </div>
  );
};

export default Gantt;
