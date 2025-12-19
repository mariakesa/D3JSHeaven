const svg = d3.select("#viz");

const squareSize = 50;
const spacing = 20;

// Data: one entry per triangle
const triangles = [0, 1, 2];

const circles = [60, 130];

svg
  .attr("width", 500)
  .attr("height", 300);

/* -------------------------
   INPUT LAYER: TRIANGLES
-------------------------- */

const triSize = squareSize;

svg.selectAll("polygon.input")
  .data(triangles)
  .enter()
  .append("polygon")
  .attr("class", "input")
  .attr("points", d => {
    const xCenter = 75 + squareSize / 2;
    const yTop = d * (squareSize + spacing) + 20;
    const yCenter = yTop + squareSize / 2;

    return `
      ${xCenter - triSize / 2},${yCenter - triSize / 2}
      ${xCenter - triSize / 2},${yCenter + triSize / 2}
      ${xCenter + triSize / 2},${yCenter}
    `;
  })
  .attr("fill", "#69b3a2")
  .attr("stroke", "#333")
  .attr("stroke-width", 2);

/* -------------------------
   HIDDEN LAYER: CIRCLES
-------------------------- */

svg.selectAll("circle")
  .data(circles)
  .enter()
  .append("circle")
  .attr("r", squareSize / 2)
  .attr("cx", 200)
  .attr("cy", d => d + 20)
  .attr("fill", "#69b3a2")
  .attr("stroke", "#333")
  .attr("stroke-width", 2);

/* -------------------------
   OUTPUT LAYER: SQUARE
-------------------------- */

const stackHeight =
  triangles.length * squareSize +
  (triangles.length - 1) * spacing;

const yStackCenter = 20 + stackHeight / 2;

const outputSize = 40;
const xOutput = 325 - outputSize / 2;
const yOutput = yStackCenter - outputSize / 2;

svg.append("rect")
  .attr("x", xOutput)
  .attr("y", yOutput)
  .attr("width", outputSize)
  .attr("height", outputSize)
  .attr("fill", "#69b3a2")
  .attr("stroke", "#333")
  .attr("stroke-width", 2);
