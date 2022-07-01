import React, { useEffect, useState } from "react";
import * as d3 from "d3";

const TimelineSpiral = ({
  width,
  height,
  start,
  end,
  numSpirals,
  m_top,
  m_bottom,
  m_left,
  m_right,
}) => {
  useEffect(() => {
    drawGraph();
  }, []);

  // used to assign nodes color by group
  const color = d3.scaleOrdinal(d3.schemeCategory10);

  const drawGraph = () => {
    const margin = {
      top: m_top,
      bottom: m_bottom,
      left: m_left,
      right: m_right,
    };

    const theta = function (r) {
      return numSpirals * Math.PI * r;
    };

    const outerR = d3.min([width, height]) / 2 - 40; // spiral outer radius

    const radius = d3.scaleLinear().domain([start, end]).range([40, outerR]);

    const tailLength = 600;
    const svg = d3
      .select("#timeline")
      .append("svg")
      .attr("width", width + margin.right + margin.left + tailLength)
      .attr("height", height + margin.left + margin.right)
      .append("g")
      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    const points = d3.range(start, end + 0.001, (end - start) / 1000); //- data points for drawing the spiral
    // console.log(points.length, points[points.length - 1], "[points]");

    const spiral = d3
      .radialLine()
      .curve(d3.curveCardinal)
      .angle(theta)
      .radius(radius);

    // draw the spiral line
    const path = svg
      .append("path")
      .datum(points)
      .attr("id", "spiral")
      .attr("d", spiral)
      .style("fill", "none")
      .style("stroke", "steelblue");

    const spiralLength = path.node().getTotalLength(),
      N = 365,
      barWidth = spiralLength / N - 1;
    const someData = [];
    for (let i = 0; i < N; i++) {
      const currentDate = new Date();
      currentDate.setDate(currentDate.getDate() + i);
      someData.push({
        date: currentDate,
        value: Math.random(),
        group: currentDate.getMonth(),
      });
    }

    console.log(`spiralLength=${spiralLength}, hwidth=${width * 0.5}`);
    fillSpiralData(spiralLength, path, barWidth, someData);

    //- add bars
    // drawSpiralBars(svg, outerR, barWidth, someData);

    //- add date labels on spiral; require the bars drawn
    // addSpiralLabel(svg, spiralLength, someData);

    // addSpiralTips(svg, someData);

    drawTail(
      svg,
      someData[N - 1].x,
      someData[N - 1].y,
      tailLength
      // width + margin.left + margin.right
    );
    drawTailBars(svg, someData[N - 1].x + width * 0.5, someData[N - 1].y);
  };

  const fillSpiralData = (spiralLength, path, barWidth, data) => {
    const timeScale = d3
      .scaleTime()
      .domain(
        d3.extent(data, function (d) {
          return d.date;
        })
      )
      .range([0, spiralLength]);

    // add linePer, x, y to data
    data.forEach((d, i) => {
      const linePer = timeScale(d.date),
        posOnLine = path.node().getPointAtLength(linePer),
        angleOnLine = path.node().getPointAtLength(linePer - barWidth);

      d.linePer = linePer; // % distance are on the spiral
      d.x = posOnLine.x; // x postion on the spiral
      d.y = posOnLine.y; // y position on the spiral
      d.a = (Math.atan2(angleOnLine.y, angleOnLine.x) * 180) / Math.PI - 90; //angle at the spiral position
    });
  };

  const drawSpiralBars = (svg, outerR, barWidth, data) => {
    //- yScale for the bar height: scale value to reasonal height
    /*
    const yScale = d3
      .scaleLinear()
      .domain([
        0,
        d3.max(data, function (d) {
          // console.log(d.value, "[data.value]");
          return d.value;
        }),
      ])
      .range([0, outerR / numSpirals - 30]);
    */
    svg
      .selectAll("rect")
      .data(data)
      .enter()
      .append("rect")
      .attr("x", (d) => d.x)
      .attr("y", (d) => d.y)
      // draw the bars on spiral
      .attr("width", (d) => barWidth)
      // .attr("height", (d) => yScale(d.value))  // bar height from data
      .attr("height", (d) => 2) // const bar height height
      .style("fill", (d) => color(d.group))
      .style("stroke", (d) => color(d.group))
      .attr(
        "transform",
        (d) => "rotate(" + d.a + "," + d.x + "," + d.y + ")" // rotate the bar
      );
  };

  const addSpiralLabel = (svg, spiralLength, data) => {
    const tF = d3.timeFormat("%b %Y"),
      firstInMonth = {};

    svg
      .selectAll("text")
      .data(data)
      .enter()
      .append("text")
      .attr("dy", 10)
      .style("text-anchor", "start")
      .style("font", "10px arial")
      .append("textPath")
      // only add for the first of each month
      .filter(function (d) {
        const sd = tF(d.date);
        if (!firstInMonth[sd]) {
          firstInMonth[sd] = 1;
          return true;
        }
        return false;
      })
      .text(function (d) {
        return tF(d.date);
      })
      // place text along spiral
      .attr("xlink:href", "#spiral")
      .style("fill", "grey")
      .attr("startOffset", function (d) {
        return (d.linePer / spiralLength) * 100 + "%";
      });
  };

  const addSpiralTips = (svg) => {
    const tooltip = d3
      .select("#timeline")
      .append("div")
      .attr("class", "tooltip");

    tooltip.append("div").attr("class", "date");
    tooltip.append("div").attr("class", "value");

    svg
      .selectAll("rect")
      .on("mouseover", function (event, d) {
        // console.log(d.date.toDateString(), "[MO]");
        tooltip
          .select(".date")
          .html("Date: <b>" + d.date.toDateString() + "</b>");
        tooltip
          .select(".value")
          .html("Value: <b>" + Math.round(d.value * 100) / 100 + "<b>");

        d3.select(this)
          .style("fill", "#FFFFFF")
          .style("stroke", "#000000")
          .style("stroke-width", "2px");

        tooltip.style("display", "block");
        tooltip.style("opacity", 2);
      })
      .on("mousemove", function (event, d) {
        // console.log(event.layerY, event.layerX, "[layerXY]");
        // console.log(`layerXY=[${event.layerY}, ${event.layerX}]`, "[MM]");
        tooltip
          .style("top", `${event.layerY + 10}px`)
          .style("left", `${event.layerX - 25}px`);
        // .style("top", event.clientY + 10 + "px")
        // .style("left", event.clientX - 25 + "px");
      })
      .on("mouseout", function (event, d) {
        d3.selectAll("rect")
          .style("fill", function (d) {
            return color(d.group);
          })
          .style("stroke", "none");

        tooltip.style("display", "none");
        tooltip.style("opacity", 0);
      });
  };

  const drawTail = (svg, x, y, width) => {
    svg
      .append("line")
      .style("stroke", "steelblue")
      .style("stroke-width", 1)
      .attr("x1", x)
      .attr("y1", y)
      .attr("x2", width)
      .attr("y2", y);
  };

  const drawTailBars = (svg, x, y) => {
    const dataset = [12, 31, 22, 8, 120, 80];
    let startx = x;
    svg
      .selectAll(".tailbar")
      .data(dataset)
      .enter()
      .append("rect")
      .attr("class", "tailbar")
      .attr("fill", "navy")
      .attr("x", (d, i) => {
        const sx = startx + 1;
        startx += d;
        return sx;
      })
      .attr("y", (d, i) => y - 6)
      .attr("width", (d) => d - 1)
      .attr("height", 6)
      .append("title")
      .text((d) => d);
  };

  return <div id="timeline"></div>;
};

export default TimelineSpiral;
