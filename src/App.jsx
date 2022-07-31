import React from "react";
import { isMobile } from "react-device-detect";
import Alert from "@mui/material/Alert";
import Stack from "@mui/material/Stack";

// import Gantt from "./components/GOJS/Gantt/Gantt";
import Controller from "./components/Controller/Controller";

import "./App.css";

const App = () => {
  return (
    <>
      <div id="app-container" style={{ border: "solid 1px" }}>
        <Controller />
      </div>
      {isMobile && (
        <Stack sx={{ width: "100%" }} spacing={2} style={{ marginLeft: 4 }}>
          <Alert severity="warning">友情提示：用电脑观看效果更佳。</Alert>
        </Stack>
      )}
    </>
  );
};

export default App;
