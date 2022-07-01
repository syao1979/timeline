import * as go from "gojs";

import { StartDate } from "./Gantt";

export const GridCellHeight = 20; // document units
export const GridCellWidth = 12; // document units per day
export const TimelineHeight = 24; // document units

export const MsPerDay = 24 * 60 * 60 * 1000;

// By default the values for the data properties start and duration are in days,
// and the start value is relative to the StartDate.
// If you want the start and duration properties to be in a unit other than days,
// you only need to change the implementation of convertDaysToUnits and convertUnitsToDays.

export function convertDaysToUnits(n) {
  return n;
}

export function convertUnitsToDays(n) {
  return n;
}

export function convertStartToX(start) {
  return convertUnitsToDays(start) * GridCellWidth;
}

export function convertXToStart(x) {
  return convertDaysToUnits(x / GridCellWidth);
}

export function convertDurationToW(duration) {
  return convertUnitsToDays(duration) * GridCellWidth;
}

export function convertWToDuration(w) {
  return convertDaysToUnits(w / GridCellWidth);
}

export function convertStartToPosition(start, node) {
  return new go.Point(convertStartToX(start), node?.position.y || 0);
}

export function convertPositionToStart(pos) {
  return convertXToStart(pos.x);
}

export function valueToText(n) {
  // N is in days since StartDate
  const startDate = StartDate;
  const startDateMs =
    startDate.getTime() + startDate.getTimezoneOffset() * 60000;
  const date = new Date(startDateMs + (n * MsPerDay) / GridCellWidth);
  return date.toLocaleDateString();
}

export function dateToValue(d) {
  // D is a Date
  const startDate = StartDate;
  const startDateMs =
    startDate.getTime() + startDate.getTimezoneOffset() * 60000;
  const dateInMs = d.getTime() + d.getTimezoneOffset() * 60000;
  const msSinceStart = dateInMs - startDateMs;
  return (msSinceStart / MsPerDay) * GridCellWidth;
}

// Custom Layout for myGantt Diagram
export class GanttLayout extends go.Layout {
  constructor() {
    super();
    this.cellHeight = GridCellHeight;
    this.myTasks = null;
  }

  doLayout(coll) {
    this.collectParts(coll);
    const diagram = this.diagram;
    if (diagram === null) return;
    const myTasks = this.myTasks;
    if (myTasks === null) return;
    diagram.startTransaction("Gantt Layout");
    const bars = [];
    this.assignTimes(diagram, bars);
    this.arrangementOrigin = this.initialOrigin(this.arrangementOrigin);
    let y = this.arrangementOrigin.y;
    bars.forEach(node => {
      const tasknode = myTasks.findNodeForData(node.data);
      node.visible = tasknode?.isVisible() ?? true;
      node.position = new go.Point(convertStartToX(node.data.start), y);
      if (node.visible) y += this.cellHeight;
    });
    diagram.commitTransaction("Gantt Layout");
  }

  // Update node data, to make sure each node has a start and a duration
  assignTimes(diagram, bars) {
    const roots = diagram.findTreeRoots();
    roots.each(root => this.walkTree(root, 0, bars));
  }

  walkTree(node, start, bars) {
    bars.push(node);
    const model = node.diagram?.model;
    if (node.isTreeLeaf) {
      let dur = node.data.duration;
      if (dur === undefined || isNaN(dur)) {
        dur = convertDaysToUnits(1); // default task length?
        model?.set(node.data, "duration", dur);
      }
      let st = node.data.start;
      if (st === undefined || isNaN(st)) {
        st = start; // use given START
        model?.set(node.data, "start", st);
      }
      return st + dur;
    } else {
      // first recurse to fill in any missing data
      node.findTreeChildrenNodes().each(n => {
        start = this.walkTree(n, start, bars);
      });
      // now can calculate this non-leaf node's data
      let min = Infinity;
      let max = -Infinity;
      const colors = new go.Set();
      node.findTreeChildrenNodes().each(n => {
        min = Math.min(min, n.data.start);
        max = Math.max(max, n.data.start + n.data.duration);
        if (n.data.color) colors.add(n.data.color);
      });
      model?.set(node.data, "start", min);
      model?.set(node.data, "duration", max - min);
      return max;
    }
  }
}
// end of GanttLayout
