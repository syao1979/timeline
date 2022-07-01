import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { select } from "d3";
import debounce from "lodash/debounce";

const Circles = ({ data }) => {
  const [width, setWidth] = useState(0);
  const containerRef = useRef(null);

  useEffect(() => {
    function updateWidth() {
      setWidth(containerRef.current.clientWidth / (data.length + 1));
    }
    const handleResize = debounce(updateWidth, 500);
    updateWidth();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [data.length]);

  useLayoutEffect(() => {
    if (Array.isArray(data)) {
      const update = select("g").selectAll("circle").data(data);

      update
        .enter()
        .append("circle")
        .merge(update)
        .attr("r", (d) => d)
        .attr("cx", (_, i) => width * (i + 1))
        .attr("cy", () => Math.random() * 100)
        .attr("stroke", (_, i) => (i % 2 === 0 ? "#f80" : "#aaf"))
        .attr("fill", (_, i) => (i % 2 === 0 ? "orange" : "#44f"));

      update.exit().remove();
    }
  }, [data, width]);

  return (
    <svg width="100%" height="350" ref={containerRef}>
      <g transform="translate(0, 100)" />
    </svg>
  );
};

export default Circles;
