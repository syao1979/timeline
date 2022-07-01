/*
 *  Copyright (C) 1998-2022 by Northwoods Software Corporation. All Rights Reserved.
 */

import { produce } from "immer";
import * as React from "react";

import { DiagramWrapper } from "./DiagramWrapper";
import { convertDaysToUnits } from "./GanttLayout";

const nodeDataArray = [
  { key: 0, text: "Project X" },
  { key: 1, text: "Task 1", color: "darkgreen" },
  {
    key: 11,
    text: "Task 1.1",
    color: "green",
    duration: convertDaysToUnits(10),
  },
  { key: 12, text: "Task 1.2", color: "green" },
  {
    key: 121,
    text: "Task 1.2.1",
    color: "lightgreen",
    duration: convertDaysToUnits(3),
  },
  {
    key: 122,
    text: "Task 1.2.2",
    color: "lightgreen",
    duration: convertDaysToUnits(5),
  },
  {
    key: 123,
    text: "Task 1.2.3",
    color: "lightgreen",
    duration: convertDaysToUnits(4),
  },
  { key: 2, text: "Task 2", color: "darkblue" },
  {
    key: 21,
    text: "Task 2.1",
    color: "blue",
    duration: convertDaysToUnits(15),
    start: convertDaysToUnits(10),
  },
  { key: 22, text: "Task 2.2", color: "goldenrod" },
  {
    key: 221,
    text: "Task 2.2.1",
    color: "yellow",
    duration: convertDaysToUnits(8),
  },
  {
    key: 222,
    text: "Task 2.2.2",
    color: "yellow",
    duration: convertDaysToUnits(6),
  },
  { key: 23, text: "Task 2.3", color: "darkorange" },
  {
    key: 231,
    text: "Task 2.3.1",
    color: "orange",
    duration: convertDaysToUnits(11),
  },
  { key: 3, text: "Task 3", color: "maroon" },
  {
    key: 31,
    text: "Task 3.1",
    color: "brown",
    duration: convertDaysToUnits(10),
  },
  { key: 32, text: "Task 3.2", color: "brown" },
  {
    key: 321,
    text: "Task 3.2.1",
    color: "lightsalmon",
    duration: convertDaysToUnits(8),
  },
  {
    key: 322,
    text: "Task 3.2.2",
    color: "lightsalmon",
    duration: convertDaysToUnits(3),
  },
  {
    key: 323,
    text: "Task 3.2.3",
    color: "lightsalmon",
    duration: convertDaysToUnits(7),
  },
  {
    key: 324,
    text: "Task 3.2.4",
    color: "lightsalmon",
    duration: convertDaysToUnits(5),
    start: convertDaysToUnits(71),
  },
  {
    key: 325,
    text: "Task 3.2.5",
    color: "lightsalmon",
    duration: convertDaysToUnits(4),
  },
  {
    key: 326,
    text: "Task 3.2.6",
    color: "lightsalmon",
    duration: convertDaysToUnits(5),
  },
];
const linkDataArray = [
  { key: -1, from: 0, to: 1 },
  { key: -2, from: 1, to: 11 },
  { key: -3, from: 1, to: 12 },
  { key: -4, from: 12, to: 121 },
  { key: -5, from: 12, to: 122 },
  { key: -6, from: 12, to: 123 },
  { key: -7, from: 0, to: 2 },
  { key: -8, from: 2, to: 21 },
  { key: -9, from: 2, to: 22 },
  { key: -10, from: 22, to: 221 },
  { key: -11, from: 22, to: 222 },
  { key: -12, from: 2, to: 23 },
  { key: -13, from: 23, to: 231 },
  { key: -14, from: 0, to: 3 },
  { key: -15, from: 3, to: 31 },
  { key: -16, from: 3, to: 32 },
  { key: -17, from: 32, to: 321 },
  { key: -18, from: 32, to: 322 },
  { key: -19, from: 32, to: 323 },
  { key: -20, from: 32, to: 324 },
  { key: -21, from: 32, to: 325 },
  { key: -22, from: 32, to: 326 },
  { key: -23, from: 11, to: 2, category: "Dep" },
];

const modelData = {
  origin: 1531540800000, // new Date(2018, 6, 14);
};

export let StartDate = new Date(); // set from Model.modelData.origin

/**
 * Use a linkDataArray since we'll be using a GraphLinksModel,
 * and modelData for demonstration purposes. Note, though, that
 * both are optional props in ReactDiagram.
 */

class App extends React.Component {
  // Maps to store key -> arr index for quick lookups

  constructor(props) {
    super(props);
    this.state = {
      nodeDataArray,
      linkDataArray,
      modelData,
      selectedData: null,
      skipsDiagramUpdate: false,
    };
    StartDate = new Date(this.state.modelData.origin);
    // init maps
    this.mapNodeKeyIdx = new Map();
    this.mapLinkKeyIdx = new Map();
    this.refreshNodeIndex(this.state.nodeDataArray);
    this.refreshLinkIndex(this.state.linkDataArray);
    // bind handler methods
    this.handleModelChange = this.handleModelChange.bind(this);
  }

  /**
   * Update map of node keys to their index in the array.
   */
  refreshNodeIndex = (nodeArr) => {
    this.mapNodeKeyIdx.clear();
    nodeArr.forEach((n, idx) => {
      this.mapNodeKeyIdx.set(n.key, idx);
    });
  };

  /**
   * Update map of link keys to their index in the array.
   */
  refreshLinkIndex = (linkArr) => {
    this.mapLinkKeyIdx.clear();
    linkArr.forEach((l, idx) => {
      this.mapLinkKeyIdx.set(l.key, idx);
    });
  };

  /**
   * Handle GoJS model changes, which output an object of data changes via Model.toIncrementalData.
   * This method iterates over those changes and updates state to keep in sync with the GoJS model.
   * @param obj a JSON-formatted string
   */
  handleModelChange = (obj) => {
    const insertedNodeKeys = obj.insertedNodeKeys;
    const modifiedNodeData = obj.modifiedNodeData;
    const removedNodeKeys = obj.removedNodeKeys;
    const insertedLinkKeys = obj.insertedLinkKeys;
    const modifiedLinkData = obj.modifiedLinkData;
    const removedLinkKeys = obj.removedLinkKeys;
    const modifiedModelData = obj.modelData;

    // maintain maps of modified data so insertions don't need slow lookups
    const modifiedNodeMap = new Map();
    const modifiedLinkMap = new Map();
    this.setState(
      produce((draft) => {
        let narr = draft.nodeDataArray;
        if (modifiedNodeData) {
          modifiedNodeData.forEach((nd) => {
            modifiedNodeMap.set(nd.key, nd);
            const idx = this.mapNodeKeyIdx.get(nd.key);
            if (idx !== undefined && idx >= 0) {
              narr[idx] = nd;
              if (draft.selectedData && draft.selectedData.key === nd.key) {
                draft.selectedData = nd;
              }
            }
          });
        }
        if (insertedNodeKeys) {
          insertedNodeKeys.forEach((key) => {
            const nd = modifiedNodeMap.get(key);
            const idx = this.mapNodeKeyIdx.get(key);
            if (nd && idx === undefined) {
              // nodes won't be added if they already exist
              this.mapNodeKeyIdx.set(nd.key, narr.length);
              narr.push(nd);
            }
          });
        }
        if (removedNodeKeys) {
          narr = narr.filter((nd) => {
            if (removedNodeKeys.includes(nd.key)) {
              return false;
            }
            return true;
          });
          draft.nodeDataArray = narr;
          this.refreshNodeIndex(narr);
        }

        let larr = draft.linkDataArray;
        if (modifiedLinkData) {
          modifiedLinkData.forEach((ld) => {
            modifiedLinkMap.set(ld.key, ld);
            const idx = this.mapLinkKeyIdx.get(ld.key);
            if (idx !== undefined && idx >= 0) {
              larr[idx] = ld;
              if (draft.selectedData && draft.selectedData.key === ld.key) {
                draft.selectedData = ld;
              }
            }
          });
        }
        if (insertedLinkKeys) {
          insertedLinkKeys.forEach((key) => {
            const ld = modifiedLinkMap.get(key);
            const idx = this.mapLinkKeyIdx.get(key);
            if (ld && idx === undefined) {
              // links won't be added if they already exist
              this.mapLinkKeyIdx.set(ld.key, larr.length);
              larr.push(ld);
            }
          });
        }
        if (removedLinkKeys) {
          larr = larr.filter((ld) => {
            if (removedLinkKeys.includes(ld.key)) {
              return false;
            }
            return true;
          });
          draft.linkDataArray = larr;
          this.refreshLinkIndex(larr);
        }
        // handle model data changes, for now just replacing with the supplied object
        if (modifiedModelData) {
          draft.modelData = modifiedModelData;
        }
        draft.skipsDiagramUpdate = true; // the GoJS model already knows about these updates
      })
    );
  };

  render = () => {
    return (
      <DiagramWrapper
        nodeDataArray={this.state.nodeDataArray}
        linkDataArray={this.state.linkDataArray}
        modelData={this.state.modelData}
        skipsDiagramUpdate={this.state.skipsDiagramUpdate}
        onModelChange={this.handleModelChange}
      />
    );
  };
}

export default App;
