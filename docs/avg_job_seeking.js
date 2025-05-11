d3.csv("data_science_job_cleaned.csv").then(data => {
    // Clean data
    data = data.filter(d => d.training_hours && d.target !== undefined);
  
    data.forEach(d => {
      d.training_hours = +d.training_hours;
      d.target = +d.target;
    });
  
    // Create bins (step size: 20)
    const binSize = 50;
    const maxHours = 340;
  
    const bins = Array.from({ length: Math.ceil(maxHours / binSize) }, (_, i) => ({
      range: `${i * binSize + 1}-${(i + 1) * binSize}`,
      total: 0,
      seekers: 0
    }));
  
    data.forEach(d => {
      const binIndex = Math.min(Math.floor((d.training_hours - 1) / binSize), bins.length - 1);
      bins[binIndex].total += 1;
      if (d.target === 1) bins[binIndex].seekers += 1;
    });
  
    const labels = bins.map(b => b.range);
    const values = bins.map(b => b.total ? (b.seekers / b.total).toFixed(2) : 0);
  
    // Draw chart
    new Chart(document.getElementById('trainingHoursChart'), {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Avg Seeking Probability',
          data: values,
          borderColor: 'red',
          fill: true,
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          pointBackgroundColor: 'orange',
          pointBorderColor: 'orange',
          pointRadius: 5,
          tension: 0.3
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            max: 1,
            title: { display: true, text: 'Average Probability of Seeking Job' }
          },
          x: {
            title: { display: true, text: 'Training Hours Group' }
          }
        },
        plugins: {
          title: {
            display: true,
          }
        }
      }
    });
  }).catch(error => {
    console.error("Error loading training hours data:", error);
    document.getElementById('trainingHoursChart').outerHTML =
      "<p style='color:red;'>Error loading training hours chart data.</p>";
  });
  