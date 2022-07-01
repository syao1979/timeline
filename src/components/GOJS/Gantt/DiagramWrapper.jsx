/*
 *  Copyright (C) 1998-2021 by Northwoods Software Corporation. All Rights Reserved.
 */
import PropTypes from "prop-types";
import * as go from "gojs";
import { ReactDiagram } from "gojs-react";
import * as React from "react";

import {
  GanttLayout,
  GridCellWidth,
  GridCellHeight,
  TimelineHeight,
  convertDaysToUnits,
  convertUnitsToDays,
  convertDurationToW,
  convertWToDuration,
  convertStartToPosition,
  convertPositionToStart,
  valueToText,
} from "./GanttLayout";

import "./Diagram.css";

// interface DiagramProps {
//   nodeDataArray: Array<go.ObjectData>;
//   linkDataArray: Array<go.ObjectData>;
//   modelData: go.ObjectData;
//   skipsDiagramUpdate: boolean;
//   onModelChange: (e: go.IncrementalData) => void;
// }

export class DiagramWrapper extends React.Component {
  /**
   * Ref to keep a reference to the Diagram component, which provides access to the GoJS diagram via getDiagram().
   */

  // the timeline

  // a model shared between the diagrams

  /** @internal */
  constructor(props) {
    super(props);
    this.myTasksRef = React.createRef();
    this.myGanttRef = React.createRef();
    this.hangingView = false;

    this.sharedModel = go.GraphObject.make(go.GraphLinksModel, {
      linkKeyProperty: "key",
    });

    this.myTimeline = go.GraphObject.make(
      go.Part,
      "Graduated",
      {
        layerName: "Adornment",
        location: new go.Point(0, 0),
        locationSpot: go.Spot.Left,
        locationObjectName: "MAIN",
        graduatedTickUnit: GridCellWidth,
      },
      go.GraphObject.make(go.Shape, "LineH", {
        name: "MAIN",
        strokeWidth: 0,
        height: TimelineHeight,
        background: "lightgray",
      }),
      go.GraphObject.make(go.Shape, {
        name: "TICKS",
        geometryString: "M0 0 V1000",
        interval: 7,
        stroke: "lightgray",
        strokeWidth: 0.5,
      }),
      go.GraphObject.make(go.TextBlock, {
        alignmentFocus: go.Spot.Left,
        interval: 7, // once per week
        graduatedFunction: valueToText,
      })
    );

    // the custom figure used for task bars that have downward points at their ends
    go.Shape.defineFigureGenerator("RangeBar", (shape, w, h) => {
      const b = Math.min(5, w);
      const d = Math.min(5, h);
      return new go.Geometry().add(
        new go.PathFigure(0, 0, true)
          .add(new go.PathSegment(go.PathSegment.Line, w, 0))
          .add(new go.PathSegment(go.PathSegment.Line, w, h))
          .add(new go.PathSegment(go.PathSegment.Line, w - b, h - d))
          .add(new go.PathSegment(go.PathSegment.Line, b, h - d))
          .add(new go.PathSegment(go.PathSegment.Line, 0, h).close())
      );
    });

    this.onMyTasksVpbChanged = this.onMyTasksVpbChanged.bind(this);
    this.onMyGanttVpbChanged = this.onMyGanttVpbChanged.bind(this);
    this.layoutGantt = this.layoutGantt.bind(this);
    this.initMyTasks = this.initMyTasks.bind(this);
    this.initMyGantt = this.initMyGantt.bind(this);
  }

  onMyTasksVpbChanged = () => {
    const myTasks = this.myTasksRef.current?.getDiagram();
    const myGantt = this.myGanttRef.current?.getDiagram();

    if (myTasks instanceof go.Diagram && myGantt instanceof go.Diagram) {
      if (this.changingView) return;
      this.changingView = true;
      myGantt.scale = myTasks.scale;
      myGantt.position = new go.Point(myGantt.position.x, myTasks.position.y);
      this.myTimeline.position = new go.Point(
        this.myTimeline.position.x,
        myTasks.viewportBounds.position.y
      );
      this.changingView = false;
    }
  };

  onMyGanttVpbChanged = () => {
    const myTasks = this.myTasksRef.current?.getDiagram();
    const myGantt = this.myGanttRef.current?.getDiagram();

    if (myTasks instanceof go.Diagram && myGantt instanceof go.Diagram) {
      if (this.changingView) return;
      this.changingView = true;
      myTasks.scale = myGantt.scale;
      myTasks.position = new go.Point(myTasks.position.x, myGantt.position.y);
      this.myTimeline.position = new go.Point(
        this.myTimeline.position.x,
        myGantt.viewportBounds.position.y
      );
      this.changingView = false;
    }
  };

  /**
   * Get the diagram reference and add any desired diagram listeners.
   * Typically the same function will be used for each listener, with the function using a switch statement to handle the events.
   */
  componentDidMount = () => {
    const myTasks = this.myTasksRef.current?.getDiagram();
    const myGantt = this.myGanttRef.current?.getDiagram();

    if (myTasks instanceof go.Diagram && myGantt instanceof go.Diagram) {
      myGantt.layout.myTasks = myTasks;
      myGantt.layoutDiagram(true);

      myTasks.addDiagramListener(
        "ViewportBoundsChanged",
        this.onMyTasksVpbChanged
      );
      myGantt.addDiagramListener(
        "ViewportBoundsChanged",
        this.onMyGanttVpbChanged
      );
    }
  };

  /**
   * Get the diagram reference and remove listeners that were added during mounting.
   */
  componentWillUnmount = () => {
    const myTasks = this.myTasksRef.current?.getDiagram();
    const myGantt = this.myGanttRef.current?.getDiagram();

    if (myTasks instanceof go.Diagram && myGantt instanceof go.Diagram) {
      myTasks.removeDiagramListener(
        "ViewportBoundsChanged",
        this.onMyTasksVpbChanged
      );
      myGantt.removeDiagramListener(
        "ViewportBoundsChanged",
        this.onMyGanttVpbChanged
      );
    }
  };

  layoutGantt = () => {
    const myGantt = this.myGanttRef.current?.getDiagram();
    if (myGantt instanceof go.Diagram) myGantt.layoutDiagram(true);
  };

  standardContextMenus = () => {
    const $ = go.GraphObject.make;
    return {
      contextMenu: $(
        "ContextMenu",
        $("ContextMenuButton", $(go.TextBlock, "Details..."), {
          click: (e, button) => {
            const task = button.part.adornedPart;
            if (task === null) return;
            console.log(
              "show HTML panel with details about the task " + task.text
            );
          },
        }),
        $("ContextMenuButton", $(go.TextBlock, "New Task"), {
          click: (e, button) => {
            const task = button.part.adornedPart;
            if (task === null) return;
            e.diagram.model.commit(m => {
              const newdata = {
                key: undefined,
                text: "New Task",
                color: task.data.color,
                duration: convertDaysToUnits(5),
              };
              m.addNodeData(newdata);
              m.addLinkData({
                from: task.key,
                to: newdata.key,
              });
              e.diagram.select(e.diagram.findNodeForData(newdata));
            });
          },
        })
      ),
    };
  };

  initMyTasks = () => {
    const $ = go.GraphObject.make;
    // set your license key here before creating the diagram: go.Diagram.licenseKey = "...";
    // the left side of the whole diagram
    const myTasks = new go.Diagram({
      "undoManager.isEnabled": true,
      model: this.sharedModel,
      initialContentAlignment: go.Spot.Right,
      padding: new go.Margin(TimelineHeight, 0, 0, 0),
      hasVerticalScrollbar: false,
      allowMove: false,
      allowCopy: false,
      "commandHandler.deletesTree": true,
      layout: $(go.TreeLayout, {
        alignment: go.TreeLayout.AlignmentStart,
        compaction: go.TreeLayout.CompactionNone,
        layerSpacing: 16,
        layerSpacingParentOverlap: 1,
        nodeIndentPastParent: 1,
        nodeSpacing: 0,
        portSpot: go.Spot.Bottom,
        childPortSpot: go.Spot.Left,
        arrangementSpacing: new go.Size(0, 0),
      }),
      "animationManager.isInitial": false,
      TreeCollapsed: this.layoutGantt,
      TreeExpanded: this.layoutGantt,
    });

    myTasks.nodeTemplate = $(
      go.Node,
      "Horizontal",
      { height: 20 },
      new go.Binding("isTreeExpanded").makeTwoWay(),
      $("TreeExpanderButton", { portId: "", scale: 0.85 }),
      $(go.TextBlock, { editable: true }, new go.Binding("text").makeTwoWay()),
      this.standardContextMenus()
    );

    myTasks.linkTemplate = $(
      go.Link,
      {
        routing: go.Link.Orthogonal,
        fromEndSegmentLength: 1,
        toEndSegmentLength: 1,
      },
      $(go.Shape)
    );

    myTasks.linkTemplateMap.add(
      "Dep",
      $(
        go.Link, // ignore these links in the Tasks diagram
        { visible: false, isTreeLink: false }
      )
    );

    return myTasks;
  };

  initMyGantt = () => {
    const $ = go.GraphObject.make;

    // the right side of the whole diagram
    const myGantt = new go.Diagram({
      "undoManager.isEnabled": true,
      model: this.sharedModel,
      initialPosition: new go.Point(-7, -100), // show labels
      padding: new go.Margin(TimelineHeight, 0, 0, 0),
      scrollMargin: new go.Margin(0, GridCellWidth * 7, 0, 0), // show a week beyond
      allowCopy: false,
      "commandHandler.deletesTree": true,
      "draggingTool.isGridSnapEnabled": true,
      "draggingTool.gridSnapCellSize": new go.Size(
        GridCellWidth,
        GridCellHeight
      ),
      "draggingTool.dragsTree": true,
      "resizingTool.isGridSnapEnabled": true,
      "resizingTool.cellSize": new go.Size(GridCellWidth, GridCellHeight),
      "resizingTool.minSize": new go.Size(GridCellWidth, GridCellHeight),
      layout: $(GanttLayout),
      "animationManager.isInitial": false,
      SelectionMoved: e => e.diagram.layoutDiagram(true),
      DocumentBoundsChanged: e => {
        // the grid extends to only the area needed
        const b = e.diagram.documentBounds;
        const gridpart = e.diagram.parts.first();
        if (gridpart !== null && gridpart.type === go.Panel.Grid) {
          gridpart.desiredSize = new go.Size(
            b.right - gridpart.position.x,
            b.bottom
          );
        }
        // the timeline only covers the needed area
        if (this.myTimeline) {
          const main = this.myTimeline.findObject("MAIN");
          if (main) main.width = b.right;
          const ticks = this.myTimeline.findObject("TICKS");
          if (ticks) ticks.height = e.diagram.viewportBounds.height;
          this.myTimeline.graduatedMax = b.right;
        }
      },
    });

    myGantt.add(
      $(
        go.Part,
        "Grid",
        {
          layerName: "Grid",
          position: new go.Point(-10, 0),
          gridCellSize: new go.Size(3000, GridCellHeight),
        },
        $(go.Shape, "LineH", { strokeWidth: 0.5 })
      )
    );

    myGantt.nodeTemplate = $(
      go.Node,
      "Spot",
      {
        selectionAdorned: false,
        selectionChanged: node => {
          node.diagram?.commit(() => {
            var shp = node.findObject("SHAPE");
            if (shp)
              shp.fill = node.isSelected
                ? "dodgerblue"
                : (node.data && node.data.color) || "gray";
          }, null);
        },
        minLocation: new go.Point(0, NaN),
        maxLocation: new go.Point(Infinity, NaN),
        toolTip: $(
          "ToolTip",
          $(
            go.Panel,
            "Table",
            { defaultAlignment: go.Spot.Left },
            $(go.RowColumnDefinition, { column: 1, separatorPadding: 3 }),
            $(
              go.TextBlock,
              {
                row: 0,
                column: 0,
                columnSpan: 9,
                font: "bold 12pt sans-serif",
              },
              new go.Binding("text")
            ),
            $(go.TextBlock, { row: 1, column: 0 }, "start:"),
            $(
              go.TextBlock,
              { row: 1, column: 1 },
              new go.Binding(
                "text",
                "start",
                d => "day " + convertUnitsToDays(d).toFixed(0)
              )
            ),
            $(go.TextBlock, { row: 2, column: 0 }, "length:"),
            $(
              go.TextBlock,
              { row: 2, column: 1 },
              new go.Binding(
                "text",
                "duration",
                d => convertUnitsToDays(d).toFixed(0) + " days"
              )
            )
          )
        ),
        resizable: true,
        resizeObjectName: "SHAPE",
        resizeAdornmentTemplate: $(
          go.Adornment,
          "Spot",
          $(go.Placeholder),
          $(go.Shape, "Diamond", {
            alignment: go.Spot.Right,
            width: 8,
            height: 8,
            strokeWidth: 0,
            fill: "fuchsia",
            cursor: "e-resize",
          })
        ),
      },
      this.standardContextMenus(),
      new go.Binding("position", "start", convertStartToPosition).makeTwoWay(
        convertPositionToStart
      ),
      new go.Binding("resizable", "isTreeLeaf").ofObject(),
      new go.Binding("isTreeExpanded").makeTwoWay(),
      $(
        go.Shape,
        {
          name: "SHAPE",
          height: 18,
          margin: new go.Margin(1, 0),
          strokeWidth: 0,
          fill: "gray",
        },
        new go.Binding("fill", "color"),
        new go.Binding("width", "duration", convertDurationToW).makeTwoWay(
          convertWToDuration
        ),
        new go.Binding("figure", "isTreeLeaf", leaf =>
          leaf ? "Rectangle" : "RangeBar"
        ).ofObject()
      ),
      // "RangeBar" is defined above as a custom figure
      $(
        go.TextBlock,
        {
          font: "8pt sans-serif",
          alignment: go.Spot.TopLeft,
          alignmentFocus: new go.Spot(0, 0, 0, -2),
        },
        new go.Binding("text"),
        new go.Binding("stroke", "color", c =>
          go.Brush.isDark(c) ? "#DDDDDD" : "#333333"
        )
      )
    );

    myGantt.linkTemplate = $(go.Link, { visible: false });

    myGantt.linkTemplateMap.add(
      "Dep",
      $(
        go.Link,
        {
          routing: go.Link.Orthogonal,
          isTreeLink: false,
          isLayoutPositioned: false,
          fromSpot: new go.Spot(0.999999, 1),
          toSpot: new go.Spot(0.000001, 0),
        },
        $(go.Shape, { stroke: "brown" }),
        $(go.Shape, {
          toArrow: "Standard",
          fill: "brown",
          strokeWidth: 0,
          scale: 0.75,
        })
      )
    );

    myGantt.add(this.myTimeline);

    return myGantt;
  };

  render = () => {
    return (
      <div className="gojs-wrapper-div">
        <ReactDiagram
          ref={this.myTasksRef}
          divClassName="myTasks"
          initDiagram={this.initMyTasks}
          nodeDataArray={this.props.nodeDataArray}
          linkDataArray={this.props.linkDataArray}
          modelData={this.props.modelData}
          onModelChange={this.props.onModelChange}
          skipsDiagramUpdate={this.props.skipsDiagramUpdate}
        />
        <ReactDiagram
          ref={this.myGanttRef}
          divClassName="myGantt"
          initDiagram={this.initMyGantt}
          nodeDataArray={this.props.nodeDataArray}
          linkDataArray={this.props.linkDataArray}
          modelData={this.props.modelData}
          skipsDiagramUpdate={this.props.skipsDiagramUpdate}
        />
      </div>
    );
  };
}

DiagramWrapper.defaultProps = {
  linkDataArray: null,
  nodeDataArray: null,
  modelData: null,
  onModelChange: null,
  skipsDiagramUpdate: false,
};
DiagramWrapper.propTypes = {
  linkDataArray: PropTypes.arrayOf(PropTypes.shape()),
  nodeDataArray: PropTypes.arrayOf(PropTypes.shape()),
  modelData: PropTypes.shape(),
  onModelChange: PropTypes.func,
  skipsDiagramUpdate: PropTypes.bool,
};
