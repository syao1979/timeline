// OrgChart.jsx
// ...............................
import React from "react";
import PropTypes from "prop-types";

import * as go from "gojs";
import { ReactDiagram } from "gojs-react";

import classes from "./OrgChart.module.css";
import imgDi from "../../../assets/images/di.png";

// relation type constants

const IMG_MAP = {
  帝: imgDi,
};

const OrgChart = ({ nodeDataArray }) => {
  // const [graphics, setGraphics] = useState(null);
  // const [searchString, setSearchString] = useState("");
  // const searchString = "";

  /**
   * Diagram initialization method, which is passed to the ReactDiagram component.
   * This method is responsible for making the diagram and initializing the model and any templates.
   * The model's data should not be set here, as the ReactDiagram component handles that via the other props.
   */
  const initDiagram = () => {
    const $ = go.GraphObject.make;
    // set your license key here before creating the diagram: go.Diagram.licenseKey = "...";

    const config = {
      // Put the diagram contents at the top center of the viewport
      initialDocumentSpot: go.Spot.Top,
      initialViewportSpot: go.Spot.Top,
      // OR: Scroll to show a particular node, once the layout has determined where that node is
      // "InitialLayoutCompleted": e => {
      //  var node = e.diagram.findNodeForKey(28);
      //  if (node !== null) e.diagram.commandHandler.scrollToPart(node);
      // },
      model: $(go.TreeModel),
      layout: $(
        go.TreeLayout, // use a TreeLayout to position all of the nodes
        {
          isOngoing: false, // don't relayout when expanding/collapsing panels
          treeStyle: go.TreeLayout.StyleLastParents,
          // properties for most of the tree:
          angle: 90,
          layerSpacing: 80,
          // properties for the "last parents":
          alternateAngle: 0,
          alternateAlignment: go.TreeLayout.AlignmentStart,
          alternateNodeIndent: 15,
          alternateNodeIndentPastParent: 1,
          alternateNodeSpacing: 15,
          alternateLayerSpacing: 40,
          alternateLayerSpacingParentOverlap: 1,
          alternatePortSpot: new go.Spot(0.001, 1, 20, 0),
          alternateChildPortSpot: go.Spot.Left,
        }
      ),
    };
    const diagram = $(go.Diagram, config);

    // when the document is modified, add a "*" to the office abbr and enable the "Save" button
    diagram.addDiagramListener("Modified", () => {
      var button = document.getElementById("SaveButton");
      if (button) button.disabled = !diagram.isModified;
      try {
        var idx = document.abbr.indexOf("*");
        if (diagram.isModified) {
          if (idx < 0) document.abbr += "*";
        } else {
          if (idx >= 0) document.abbr = document.abbr.substr(0, idx);
        }
      } catch {
        console.log("exception in OrgChart diagram.addDiagramListener");
      }
    });

    // manage parent info manually when a node or link is deleted from the diagram
    diagram.addDiagramListener("SelectionDeleting", function (e) {
      var part = e.subject.first(); // e.subject is the diagram.selection collection,
      // so we'll get the first since we know we only have one selection
      diagram.startTransaction("clear parent");
      var child, parentText;
      if (part instanceof go.Node) {
        var it = part.findTreeChildrenNodes(); // find all child nodes
        while (it.next()) {
          // now iterate through them and clear out the parent information
          child = it.value;
          parentText = child.findObject("parent"); // since the parent TextBlock is named, we can access it by name
          if (parentText === null) return;
          parentText.text = "";
        }
      } else if (part instanceof go.Link) {
        child = part.toNode;
        parentText = child.findObject("parent"); // since the parent TextBlock is named, we can access it by name
        if (parentText === null) return;
        parentText.text = "";
      }
      diagram.commitTransaction("clear parent");
    });

    // override TreeLayout.commitNodes to also modify the background brush based on the tree depth level
    diagram.layout.commitNodes = () => {
      go.TreeLayout.prototype.commitNodes.call(diagram.layout); // do the standard behavior
      // then go through all of the vertexes and set their corresponding node's Shape.fill
      // to a brush dependent on the TreeVertex.level value
      diagram.layout.network.vertexes.each(function (v) {
        if (v.node) {
          // const level = v.level % levelColors.length;
          const color = "#bbbbbb"; //levelColors[level];
          const shape = v.node.findObject("SHAPE");
          if (shape)
            shape.fill = $(go.Brush, "Linear", {
              0: color,
              1: go.Brush.lightenBy(color, 0.05),
              start: go.Spot.Left,
              end: go.Spot.Right,
            });
        }
      });
    };

    // This function provides a common style for most of the TextBlocks.
    // Some of these values may be overridden in a particular TextBlock.
    const textStyle = () => {
      return { font: "9pt  Segoe UI,sans-serif", stroke: "white" };
    };

    // This converter is used by the Picture in line 262 to load the ICONs for each node.
    // const findHeadShot = key => {
    //   if (key === 0 || key > 7) key = 0; // we just have 8 icons

    //   var filename = "../../assets/icons/" + ("000" + key).substr(-3) + ".svg";
    //   console.log("findHeadShot-> " + filename);

    //   return filename;
    // };

    // define the Node template
    // some constants that will be reused within templates
    // const mt8 = new go.Margin(8, 0, 0, 0);
    const mr8 = new go.Margin(0, 8, 0, 0);
    const ml8 = new go.Margin(0, 0, 0, 8);
    const roundedRectangleParams = {
      parameter1: 2, // set the rounded corner
      spot1: go.Spot.TopLeft,
      spot2: go.Spot.BottomRight, // make content go all the way to inside edges of rounded corners
    };
    const getImage = position => {
      return IMG_MAP[position];
    };

    const INFO_DEFAULT_OPEN = false;
    diagram.nodeTemplate = $(
      go.Node,
      "Auto",
      {
        locationSpot: go.Spot.Top,
        isShadowed: true,
        shadowBlur: 1,
        shadowOffset: new go.Point(0, 1),
        shadowColor: "rgba(0, 0, 0, .14)",
        // selection adornment to match shape of nodes
        selectionAdornmentTemplate: $(
          go.Adornment,
          "Auto",
          $(go.Shape, "RoundedRectangle", roundedRectangleParams, {
            fill: null,
            stroke: "#7986cb",
            strokeWidth: 3,
          }),
          $(go.Placeholder)
        ), // end Adornment
      },
      $(
        go.Shape,
        "RoundedRectangle",
        roundedRectangleParams,
        { name: "SHAPE", fill: "#ffffff", strokeWidth: 0 },
        // gold if highlighted, white otherwise
        new go.Binding("fill", "isHighlighted", h =>
          h ? "gold" : "#ffffff"
        ).ofObject()
      ),
      $(
        go.Panel,
        "Vertical",
        { minSize: new go.Size(100, NaN) }, // node rect width
        $(
          go.Panel,
          "Horizontal",
          { margin: 8, width: "auto", height: "auto" }, // node rect width
          $(
            go.Picture, // image, only visible if a position is specified
            { margin: mr8, visible: false, desiredSize: new go.Size(50, 50) },
            new go.Binding("source", "position", getImage),
            new go.Binding("visible", "position", val => val !== undefined)
          ),
          $(
            go.Panel,
            "Table",
            $(
              go.TextBlock,
              {
                row: 0,
                alignment: go.Spot.Left,
                font: "16px Roboto, sans-serif",
                stroke: "rgba(0, 0, 0, .87)",
                maxSize: new go.Size(160, NaN),
                name: "NAME", // so can be found by findObject()
              },
              new go.Binding(
                "text",
                "",
                data => `${data.name}` + (data.order ? ` (${data.order})` : "")
              ), // "" so fn will receive whole data
              {
                // mouse event on Panel
                click: (e, obj) => {
                  // handle click event
                  if (obj.part.data.url) {
                    window.open(obj.part.data.url);
                  }
                },
                mouseEnter: (e, obj) => {
                  // the PORT argument will be this Shape
                  if (obj.part.data.url) {
                    const itm = obj.part.findObject("NAME");
                    itm.stroke = "blue";
                    itm.isUnderline = "underline";
                    itm.cursor = "pointer";
                  }
                },
                mouseLeave: (e, obj) => {
                  if (obj.part.data.url) {
                    const itm = obj.part.findObject("NAME");
                    itm.stroke = "black";
                    itm.isUnderline = undefined;
                  }
                },
              }
            ),
            $(
              "PanelExpanderButton",
              "INFO",
              {
                row: 0,
                column: 1,
                rowSpan: 2,
                margin: ml8,
                alignment: go.Spot.Right,
              },
              new go.Binding("visible", "hide_info") // no show for nodes without info
            )
          )
        ),
        $(
          go.Panel,
          "Vertical",
          {
            name: "INFO", // identify to the PanelExpanderButton
            stretch: go.GraphObject.Horizontal, // take up whole available width
            defaultAlignment: go.Spot.Left, // thus no need to specify alignment on each element
            visible: INFO_DEFAULT_OPEN, // default
          },
          $(
            go.Shape,
            "LineH",
            {
              stroke: "rgba(0, 0, 0, .60)",
              strokeWidth: 1,
              height: 1,
              stretch: go.GraphObject.Horizontal,
            },
            INFO_DEFAULT_OPEN
              ? new go.Binding("visible").ofObject("INFO")
              : new go.Binding("visible", "hide_info", value => !value)
          ),
          $(
            go.TextBlock,
            textStyle("intro"),
            { margin: 6 },
            new go.Binding("text", "intro", intro => intro)
          ),
          new go.Binding("visible", "hide_info") //info panel - visible only if hide_info == "true";
        )
      )
    );

    // define the Link template, a simple orthogonal line
    diagram.linkTemplate = $(
      go.Link,
      go.Link.Orthogonal,
      { corner: 5, selectable: false },
      $(go.Shape, { strokeWidth: 3, stroke: "#424242" })
    ); // dark gray, rounded corner links

    // Overview
    // const overview =
    $(
      go.Overview,
      "myOverviewDiv", // the HTML DIV element for the Overview
      { observed: diagram, contentAlignment: go.Spot.Center }
    ); // tell it which Diagram to show and pan

    // setGraphics(diagram);
    return diagram;
  }; // end init

  // the Search functionality highlights all of the nodes that have at least one data property match a RegExp
  // const searchDiagram = () => {
  //   // called by button
  //   graphics.focus();

  //   graphics.startTransaction("highlight search");

  //   if (searchString) {
  //     // search four different data properties for the string, any of which may match for success
  //     // create a case insensitive RegExp from what the user typed
  //     const safe = searchString.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  //     const regex = new RegExp(safe, "i");
  //     const results = graphics.findNodesByExample(
  //       { name: regex },
  //       { title: regex },
  //       { headOf: regex }
  //     );
  //     graphics.highlightCollection(results);
  //     // try to center the diagram at the first node that was found
  //     if (results.count > 0) graphics.centerRect(results.first().actualBounds);
  //   } else {
  //     // empty string only clears highlighteds collection
  //     graphics.clearHighlighteds();
  //   }

  //   graphics.commitTransaction("highlight search");
  // };

  if (!nodeDataArray) {
    return <div style={{ margin: 40 }}>Loading ... </div>;
  }

  return (
    <>
      <div>
        <ReactDiagram
          initDiagram={initDiagram}
          divClassName={classes.MainGraph}
          nodeDataArray={nodeDataArray}
        />
      </div>
      <div id="myOverviewDiv" className={classes.Overview}></div>
    </>
  );
};

export default OrgChart;

OrgChart.defaultProps = {
  nodeDataArray: null,
};
OrgChart.propTypes = {
  nodeDataArray: PropTypes.arrayOf(PropTypes.shape()),
};
