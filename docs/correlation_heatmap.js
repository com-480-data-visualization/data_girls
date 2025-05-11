function labelEncode(array) {
    const map = [...new Set(array)].reduce((acc, val, i) => {
      acc[val] = i;
      return acc;
    }, {});
    return array.map(val => map[val]);
  }
  
  d3.csv("data_science_job_cleaned.csv").then(data => {
    const cleaned = data.filter(d =>
      (d.gender === "Male" || d.gender === "Female") &&
      d.company_type && d.company_type !== "Other" &&
      d.company_size && d.education_level &&
      d.experience && d.relevent_experience &&
      d.training_hours && d.target
    );
  
    const cols = [
      'gender', 'relevent_experience', 'education_level',
      'experience', 'company_size', 'company_type',
      'training_hours', 'target'
    ];
  
    const encodedData = {};
    cols.forEach(col => {
      if (col === 'training_hours' || col === 'target') {
        encodedData[col] = cleaned.map(d => +d[col]);
      } else {
        const values = cleaned.map(d => d[col]);
        encodedData[col] = labelEncode(values);
      }
    });
  
    const numericMatrix = cols.map(c => encodedData[c]);
    const n = numericMatrix[0].length;
    const correlationMatrix = cols.map((col1, i) => {
      return cols.map((col2, j) => {
        const x = numericMatrix[i];
        const y = numericMatrix[j];
        const meanX = d3.mean(x);
        const meanY = d3.mean(y);
        const cov = d3.sum(x.map((_, k) => (x[k] - meanX) * (y[k] - meanY))) / n;
        const stdX = Math.sqrt(d3.mean(x.map(d => (d - meanX) ** 2)));
        const stdY = Math.sqrt(d3.mean(y.map(d => (d - meanY) ** 2)));
        return +(cov / (stdX * stdY)).toFixed(4); // More decimals for contrast
      });
    });
  
    const customColorscale = [
        [0, '#ffccd5'],     // Deep light pink (negative correlations)
        [0.5, '#ffe6ea'],   // Light pink near zero
        [1, '#ff4500']      // Orange-red (positive correlations)
      ];
      
      const heatmapData = [{
        z: correlationMatrix,
        x: cols,
        y: cols,
        type: 'heatmap',
        colorscale: customColorscale,
        zmin: -1,
        zmax: 1,
        zmid: 0,
        showscale: true,
        hoverongaps: false
      }];
  
    const layout = {
      xaxis: { automargin: true },
      yaxis: { automargin: true },
      margin: { t: 60, l: 100, r: 40, b: 100 },
      height: 600,
      width: 600,
    };
  
    Plotly.newPlot('correlationHeatmap', heatmapData, layout);
  }).catch(err => {
    console.error("Error loading or processing heatmap data:", err);
    document.getElementById("correlationHeatmap").innerHTML =
      "<p style='color:red;'>Error loading heatmap data.</p>";
  });
  