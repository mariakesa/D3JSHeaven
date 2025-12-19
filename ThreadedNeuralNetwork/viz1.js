const svg1 = d3.select("#viz1");
console.log("viz1 empty?", svg1.empty());

const squareSize = 50;
const spacing = 20;

// Data: one entry per square
const squares = [0, 1, 2];

const circles = [60,130];

svg1
  .attr("width", 500)
  .attr("height", 500);

svg1.selectAll("rect")
  .data(squares)
  .enter()
  .append("rect")
  .attr("x", 75)                       // center horizontally
  .attr("y", d => d * (squareSize + spacing) + 20)
  .attr("width", squareSize)
  .attr("height", squareSize)
  .attr("fill", "#696ab3ff")
  .attr("stroke", "#333")
  .attr("stroke-width", 2);

svg1.selectAll("circle")
    .data(circles)
    .enter()
    .append("circle")
    .attr("r", squareSize/2)
    .attr("cx", 200)
    .attr("cy", d=>d+20)
    .attr("fill", "#69b3a2")
    .attr("stroke", "#333")
    .attr("stroke-width", 2);

const triSize = 35;

const stackHeight =
  squares.length * squareSize +
  (squares.length - 1) * spacing;
const xCircleCenter = 200;
const yStackCenter = 20 + stackHeight / 2;
const xSquareCenter = 75 + squareSize / 2; // 100
//const xTriangleCenter = (xSquareCenter + xCircleCenter) / 2;
const xTriangleCenter=325;

svg1.append("polygon")
  .attr("points", () => {
    const x = xTriangleCenter;
    const y = yStackCenter;

    return `
      ${x - triSize / 2},${y - triSize / 2}
      ${x - triSize / 2},${y + triSize / 2}
      ${x + triSize / 2},${y}
    `;
  })
  .attr("fill", "#69b3a2")
  .attr("stroke", "#333")
  .attr("stroke-width", 2);
