function createProjectionScatter(targetDiv, options = {}) {

    const {
        width = 600,
        height = 350,
        vitPath = "data_dev/scores_vit_full.json",
        neuronPath = "data_dev/neuron_scores.json",
    } = options;

    // Load JSON files
    Promise.all([
        fetch(vitPath).then(r => r.json()),
        fetch(neuronPath).then(r => r.json())
    ]).then(([scores_vit_full, neuron_scores]) => {

        // Dataset construction
        let data = scores_vit_full.map((x, i) => ({
            x: x,
            y: neuron_scores[i],
            idx: i,
            img: `data_dev/scene_${String(i).padStart(3,'0')}.png`
        }));

        // Sort by neuron response
        let sorted = [...data].sort((a, b) => b.y - a.y);

        // PINK POINTS (0, 1, 2, and 4 in sorted list)
        let pinkIndices = new Set([
            sorted[0].idx,
            sorted[1].idx,
            sorted[2].idx,
            sorted[4].idx
        ]);

        pinkIndices.add(47);

        pinkIndices.add(15);

        // Sunset Bliss palette
        const normalColor = "#9AD1D4"; // light blue
        const topColor = "#EA2B7F";    // pink

        // SVG setup
        const margin = {top: 40, right: 40, bottom: 50, left: 60};
        const svg = d3.select(targetDiv)
            .append("svg")
            .attr("width", width)
            .attr("height", height);

        // Scales
        const xScale = d3.scaleLinear()
            .domain(d3.extent(data, d => d.x)).nice()
            .range([margin.left, width - margin.right]);

        const yScale = d3.scaleLinear()
            .domain(d3.extent(data, d => d.y)).nice()
            .range([height - margin.bottom, margin.top]);

        // Axes
        svg.append("g")
            .attr("transform", `translate(0, ${height - margin.bottom})`)
            .call(d3.axisBottom(xScale));

        svg.append("g")
            .attr("transform", `translate(${margin.left}, 0)`)
            .call(d3.axisLeft(yScale));

        // Axis labels
        svg.append("text")
            .attr("x", width / 2)
            .attr("y", height - 10)
            .attr("text-anchor", "middle")
            .attr("font-size", "14px")
            .text("ViT PC1 Score");

        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("x", -height / 2)
            .attr("y", 20)
            .attr("text-anchor", "middle")
            .attr("font-size", "14px")
            .text("Neuron Response");

        // Tooltip
        const tooltip = d3.select("body")
            .append("div")
            .style("position", "absolute")
            .style("pointer-events", "none")
            .style("background", "white")
            .style("border", "1px solid #ddd")
            .style("padding", "8px")
            .style("border-radius", "6px")
            .style("box-shadow", "0px 4px 10px rgba(0,0,0,0.15)")
            .style("font-size", "12px")
            .style("opacity", 0);

        let hideTimeout = null;
        const jitterScale = 0.6;

        // Scatter points
        svg.selectAll("circle")
            .data(data)
            .enter()
            .append("circle")
            .attr("cx", d => xScale(d.x + (Math.random() - 0.5) * jitterScale))
            .attr("cy", d => yScale(d.y))
            .attr("r", 4)
            .attr("fill", d => pinkIndices.has(d.idx) ? topColor : normalColor)  // ✔ FIXED
            .attr("opacity", 0.85)
            .style("transition", "0.15s")
            .on("mouseover", function(event, d) {

                if (hideTimeout) clearTimeout(hideTimeout);

                d3.select(this)
                    .transition().duration(120)
                    .attr("r", 5)
                    .attr("opacity", 1);

                tooltip.html(`
                    <div><img src="${d.img}" style="width:150px;border-radius:4px;margin-bottom:4px;"></div>
                    <b>Image:</b> ${d.idx}<br>
                    <b>ViT PC1:</b> ${d.x.toFixed(2)}<br>
                    <b>Neuron:</b> ${d.y.toFixed(3)}
                `)
                .style("opacity", 1)
                .style("left", (event.pageX + 15) + "px")
                .style("top", (event.pageY - 20) + "px");
            })
            .on("mousemove", function(event) {
                tooltip.style("left", (event.pageX + 15) + "px")
                       .style("top", (event.pageY - 20) + "px");
            })
            .on("mouseout", function() {

                d3.select(this)
                    .transition().duration(120)
                    .attr("r", 4)
                    .attr("opacity", 0.85);

                hideTimeout = setTimeout(() => {
                    tooltip.transition().duration(150)
                        .style("opacity", 0);
                }, 150);
            });
    });
}
