// D3.js script for an Interactive Grouped Bar Chart

d3.csv("data_science_job_cleaned.csv").then(data => {
    if (!data || data.length === 0) {
        d3.select("#chart").append("p").text("Error: No data loaded.").style("color", "red");
        return;
    }

    // Clean and preprocess the data
    data = data.filter(d => d.training_hours_range && d.training_hours_range.trim() !== "");
    data.forEach(d => {
        d.target = +d.target;
        d.training_hours_range = d.training_hours_range.trim();
    });

    // Group the data
    const groupedData = d3.rollup(
        data,
        v => v.length,
        d => d.training_hours_range,
        d => d.target === 1 ? "Seekers" : "Non-Seekers"
    );

    // Format data for visualization
    const formattedData = Array.from(groupedData, ([range, values]) => ({
        range: range,
        seekers: values.get("Seekers") || 0,
        nonSeekers: values.get("Non-Seekers") || 0
    }));

    const margin = { top: 40, right: 20, bottom: 60, left: 50 };
    const width = 600 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const svg = d3.select("#chart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const x0 = d3.scaleBand()
        .domain(formattedData.map(d => d.range))
        .range([0, width])
        .padding(0.2);

    const x1 = d3.scaleBand()
        .domain(["seekers", "nonSeekers"])
        .range([0, x0.bandwidth()])
        .padding(0.05);

    const y = d3.scaleLinear()
        .domain([0, d3.max(formattedData, d => Math.max(d.seekers, d.nonSeekers))])
        .nice()
        .range([height, 0]);

    const color = d3.scaleOrdinal()
        .domain(["seekers", "nonSeekers"])
        .range(["#ffa500", "#ff4500"]);

    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x0));

    svg.append("g")
        .call(d3.axisLeft(y));

    // Add bars
    svg.selectAll("g.bar-group")
        .data(formattedData)
        .enter()
        .append("g")
        .attr("class", "bar-group")
        .attr("transform", d => `translate(${x0(d.range)},0)`)
        .selectAll("rect")
        .data(d => [
            { key: "seekers", value: d.seekers },
            { key: "nonSeekers", value: d.nonSeekers }
        ])
        .enter()
        .append("rect")
        .attr("x", d => x1(d.key))
        .attr("y", d => y(d.value))
        .attr("width", x1.bandwidth())
        .attr("height", d => height - y(d.value))
        .attr("fill", d => color(d.key));

    // Add chart title
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", -10)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .text("Interactive Job Seeking by Training Hours");

}).catch(error => {
    console.error("Data load error:", error);
    d3.select("#chart").append("p").text("Error loading data.").style("color", "red");
});
