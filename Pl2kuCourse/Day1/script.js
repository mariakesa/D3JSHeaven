const svg = d3.select("#canvas");

// First circle
svg.append("circle")
   .attr("cx", 100)
   .attr("cy", 100)
   .attr("r", 40)
   .attr("fill", "steelblue");

// Data
const cxs = [200,210,220,230,240,250,260,270,280,290];
const cys = [150,160,170,180,190,200,210,220,240,250];

// Merge into objects
const points = cxs.map((cx, i) => ({ cx, cy: cys[i] }));

// Render
svg.selectAll("circle.small")
   .data(points)
   .join("circle")
   .attr("class", "small")
   .attr("cx", d => d.cx)
   .attr("cy", d => d.cy)
   .attr("r", 10)
   .attr("fill", "purple");
