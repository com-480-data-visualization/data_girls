let experienceChart = null;

function showExperienceChartForCategory(categoryName) {
  const container = document.getElementById("experienceChartContainer");
  container.style.display = "block";
  document.getElementById("experienceTitle").textContent = "Average Salary by Experience Level – " + categoryName;

  const countries = ["All", "United Kingdom", "United States"];
  const validCountries = [];

  countries.forEach(country => {
    const filtered = globalData.filter(d =>
      d.job_category === categoryName &&
      (country === "All" || d.company_location === country)
    );

    const counts = { "Entry-level": 0, "Mid-level": 0, "Senior": 0, "Executive": 0 };

    filtered.forEach(d => {
      const raw = d.experience_level?.trim();
      if (raw === "Entry-level") counts["Entry-level"]++;
      else if (raw === "Mid-level") counts["Mid-level"]++;
      else if (raw === "Senior and Executive") counts["Senior"]++;
      else if (raw === "Executive") counts["Executive"]++;
    });

    const hasValidLevel = Object.values(counts).some(c => c >= 10);
    if (hasValidLevel) validCountries.push(country);
  });

  const dropdown = document.getElementById("expCountrySelect");
  dropdown.innerHTML = "";
  validCountries.forEach(c => {
    const opt = document.createElement("option");
    opt.value = c;
    opt.textContent = c;
    dropdown.appendChild(opt);
  });

  if (validCountries.length > 0) {
    dropdown.value = validCountries[0];
    updateExperienceChartFilter();
  } else {
    document.getElementById("experienceChartCanvas").style.display = "none";
    document.getElementById("experienceTitle").textContent += " (no data available)";
  }
}

function updateExperienceChartFilter() {
  const country = document.getElementById("expCountrySelect").value;

  const filtered = globalData.filter(d =>
    d.job_category === currentCategory &&
    (country === "All" || d.company_location === country)
  );

  const levels = ["Entry-level", "Mid-level", "Senior", "Executive"];
  const salaryByLevel = {};
  const countByLevel = {};

  levels.forEach(level => {
    salaryByLevel[level] = 0;
    countByLevel[level] = 0;
  });

  filtered.forEach(d => {
    const raw = d.experience_level?.trim();
    let mappedLevel = null;

    if (raw === "Entry-level") mappedLevel = "Entry-level";
    else if (raw === "Mid-level") mappedLevel = "Mid-level";
    else if (raw === "Senior") mappedLevel = "Senior";
    else if (raw === "Executive") mappedLevel = "Executive";

    if (mappedLevel) {
      salaryByLevel[mappedLevel] += d.salary_in_usd;
      countByLevel[mappedLevel]++;
    }
  });

  const validLevels = levels.filter(l => countByLevel[l] >= 10);
  const data = validLevels.map(l => Math.round(salaryByLevel[l] / countByLevel[l]));

  if (experienceChart) experienceChart.destroy();

  const ctx = document.getElementById("experienceChartCanvas").getContext("2d");
  experienceChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: validLevels,
      datasets: [{
        label: "Average Salary in USD",
        data: data,
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
          borderColor: "rgba(255,105,180,0.8)",
          callbacks: {
            afterLabel: function(context) {
              const level = context.label;
              return `Samples: ${countByLevel[level]}`;
            }
          }
        },
        title: {
          display: true,
          font: { size: 18, weight: "bold" },
          color: '#333'
        }
      },
      scales: {
        x: {
          title: { display: true, text: "Experience Level", font: { size: 14, weight: "bold" }, color: '#333' },
          ticks: { font: { size: 12 }, color: '#333' },
          grid: { color: "rgba(255,182,193,0.1)" }
        },
        y: {
          beginAtZero: true,
          title: { display: true, text: "Average Salary in USD", font: { size: 14, weight: "bold" }, color: '#333' },
          ticks: { font: { size: 12 }, color: '#333' },
          grid: { color: "rgba(255,182,193,0.1)" }
        }
      },
      layout: { padding: { top: 20, bottom: 20 } },
      animation: { duration: 1000, easing: "easeOutQuart" }
    }
  });
}
