function createProjectionScatter(targetDiv, options = {}) {

    const {
        width = 700,
        height = 450,
        vitPath = "data_dev/scores_vit_full.json",
        neuronPath = "data_dev/neuron_scores.json",
    } = options;

    Promise.all([
        fetch(vitPath).then(r => r.json()),
        fetch(neuronPath).then(r => r.json())
    ]).then(([scores_vit_full, neuron_scores]) => {

        let data = scores_vit_full.map((x, i) => ({
            x: x,
            y: neuron_scores[i],
            idx: i,
            img: `data_dev/scene_${String(i).padStart(3,'0')}.png`
        }));

        // Top 3 max response
        let sorted = [...data].sort((a, b) => b.y - a.y);
        let top3 = new Set(sorted.slice(0, 3).map(d => d.idx));

        const margin = {top: 40, right: 40, bottom: 50, left: 60};
        const svg = d3.select(targetDiv)
            .append("svg")
            .attr("width", width)
            .attr("height", height);

        const xScale = d3.scaleLinear()
            .domain(d3.extent(data, d => d.x)).nice()
            .range([margin.left, width - margin.right]);

        const yScale = d3.scaleLinear()
            .domain(d3.extent(data, d => d.y)).nice()
            .range([height - margin.bottom, margin.top]);


        svg.append("g")
            .attr("transform", `translate(0, ${height - margin.bottom})`)
            .call(d3.axisBottom(xScale));

        svg.append("g")
            .attr("transform", `translate(${margin.left}, 0)`)
            .call(d3.axisLeft(yScale));

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

        // ==== SUNSET BLISS PALETTE ====
        const normalColor = "#9AD1D4";  // light blue
        const topColor = "#EA2B7F";     // pink

        svg.selectAll("circle")
            .data(data)
            .enter()
            .append("circle")
            .attr("cx", d => xScale(d.x))
            .attr("cy", d => yScale(d.y))
            .attr("r", 5)
            .attr("fill", d => top3.has(d.idx) ? topColor : normalColor)
            .attr("opacity", 0.85)
            .style("transition", "0.15s")
            .on("mouseover", function(event, d) {

                d3.select(this)
                    .transition().duration(120)
                    .attr("r", 8)
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
                    .attr("r", 5)
                    .attr("opacity", 0.85);

                tooltip.transition().duration(120)
                    .style("opacity", 0);
            });

    });
}

