let globalData = [];
let histogramChart = null;
let currentCategory = null;

function showHistogramForCategory(categoryName) {
  currentCategory = categoryName;
  document.getElementById("histogramContainer").style.display = "block";
  document.getElementById("histTitle").textContent = "Salary Distribution – " + categoryName;

  const filtered = globalData.filter(row => row.job_category === currentCategory);
  const countryCounts = {};
  filtered.forEach(d => {
    const loc = d.company_location;
    countryCounts[loc] = (countryCounts[loc] || 0) + 1;
  });

  const allowedCountries = Object.entries(countryCounts)
    .filter(([_, count]) => count >= 50)
    .map(([country]) => country)
    .sort();

  const countrySelect = document.getElementById("countrySelect");
  countrySelect.innerHTML = '<option value="All">All</option>';
  allowedCountries.forEach(c => {
    const opt = document.createElement("option");
    opt.value = c;
    opt.textContent = c;
    countrySelect.appendChild(opt);
  });

  updateHistogramFilter();
}

function updateHistogramFilter() {
  const country = document.getElementById("countrySelect").value;
  let filtered = globalData.filter(row => row.job_category === currentCategory);
  if (country !== "All") filtered = filtered.filter(row => row.company_location === country);

  const salaries = filtered.map(d => d.salary_in_usd)
    .filter(s => typeof s === "number" && !isNaN(s));
  if (!salaries.length) return;

  const min = Math.min(...salaries);
  const max = Math.max(...salaries);
  const binCount = 10;
  const step = (max - min) / binCount;
  const bins = Array(binCount).fill(0);
  const labels = [];

  for (let i = 0; i < binCount; i++) {
    const binMin = min + i * step;
    const binMax = binMin + step;
    labels.push(`$${Math.round(binMin)}–$${Math.round(binMax)}`);
  }

  salaries.forEach(s => {
    let bin = Math.floor((s - min) / step);
    if (bin === binCount) bin--;
    bins[bin]++;
  });

  if (histogramChart) histogramChart.destroy();

  const ctx = document.getElementById("salaryHistogram").getContext("2d");
  histogramChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [{
        label: "Frequency",
        data: bins,
        backgroundColor: "rgba(255, 182, 193, 0.5)",
        borderColor: "rgba(255, 105, 180, 0.9)",
        borderWidth: 2,
        borderRadius: 10,
        barPercentage: 0.8,
        categoryPercentage: 0.8
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
        }
      },
      scales: {
        x: {
          title: { display: true, text: "Salary in USD", font: { size: 14, weight: "bold" }, color: '#333' },
          ticks: { font: { size: 12 }, color: '#333' },
          grid: { color: "rgba(255,182,193,0.1)" }
        },
        y: {
          beginAtZero: true,
          title: { display: true, text: "Frequency", font: { size: 14, weight: "bold" }, color: '#333' },
          ticks: { font: { size: 12 }, color: '#333' },
          grid: { color: "rgba(255,182,193,0.1)" }
        }
      },
      layout: { padding: { top: 20, bottom: 20 } },
      animation: { duration: 800, easing: "easeOutQuart" }
    }
  });
}
