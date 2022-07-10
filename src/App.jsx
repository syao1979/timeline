import React from "react";

// import Gantt from "./components/GOJS/Gantt/Gantt";
import Controller from "./components/Controller/Controller";

import "./App.css";

const App = () => {
  return (
    <div id="app-container" style={{ border: "solid 1px", margin: 10 }}>
      <Controller />
    </div>
  );
};

export default App;
