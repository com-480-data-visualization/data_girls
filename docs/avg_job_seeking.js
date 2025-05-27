d3.csv("data_science_job_cleaned.csv").then(data => {
  data = data.filter(d => d.training_hours && d.target !== undefined);
  data.forEach(d => {
    d.training_hours = +d.training_hours;
    d.target = +d.target;
  });

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

  new Chart(document.getElementById('trainingHoursChart'), {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Avg Seeking Probability',
        data: values,
        borderColor: 'rgba(255, 105, 180, 0.9)',
        backgroundColor: 'rgba(255, 182, 193, 0.4)',
        fill: true,
        pointBackgroundColor: 'rgba(255, 105, 180, 0.9)',
        pointBorderColor: '#fff',
        pointRadius: 6,
        pointHoverRadius: 8,
        tension: 0.4,
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "rgba(255,182,193,0.9)",
          titleFont: { size: 14, weight: "bold" },
          bodyFont: { size: 13 },
          borderWidth: 1,
          borderColor: "rgba(255,105,180,0.8)"
        },
        title: {
          display: true,
          text: 'Average Job Seeking Probability by Training Hours Group',
          font: { size: 18, weight: "bold" },
          color: '#333'
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 1,
          title: {
            display: true,
            text: 'Average Probability of Seeking Job',
            font: { size: 14, weight: "bold" },
            color: '#333'
          },
          ticks: { font: { size: 12 }, color: '#333' },
          grid: { color: "rgba(255,182,193,0.1)" }
        },
        x: {
          title: {
            display: true,
            text: 'Training Hours Group',
            font: { size: 14, weight: "bold" },
            color: '#333'
          },
          ticks: { font: { size: 12 }, color: '#333' },
          grid: { color: "rgba(255,182,193,0.1)" }
        }
      },
      layout: { padding: { top: 20, bottom: 20 } },
      animation: { duration: 1000, easing: "easeOutQuart" }
    }
  });
}).catch(error => {
  console.error("Error loading training hours data:", error);
  document.getElementById('trainingHoursChart').outerHTML =
    "<p style='color:red;'>Error loading training hours chart data.</p>";
});
