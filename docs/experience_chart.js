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
  
      // Count samples for each mapped experience level
      const counts = { "Entry-level": 0, "Mid-level": 0, "Senior": 0, "Executive": 0 };
  
      filtered.forEach(d => {
        const raw = d.experience_level?.trim();
        if (raw === "Entry-level") counts["Entry-level"]++;
        else if (raw === "Mid-level") counts["Mid-level"]++;
        else if (raw === "Senior and Executive") counts["Senior"]++;
        else if (raw === "Executive") counts["Executive"]++;
      });
  
      // Add country if it has at least one experience level with ≥ 10 samples
      const hasValidLevel = Object.values(counts).some(c => c >= 10);
      if (hasValidLevel) {
        validCountries.push(country);
      }
    });
  
    // Update dropdown
    const dropdown = document.getElementById("expCountrySelect");
    dropdown.innerHTML = "";
    validCountries.forEach(c => {
      const opt = document.createElement("option");
      opt.value = c;
      opt.textContent = c;
      dropdown.appendChild(opt);
    });
  
    if (validCountries.length > 0) {
      dropdown.value = validCountries[0]; // default to first available
      updateExperienceChartFilter();      // draw the chart
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

  // Normalize to 4 experience levels
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

  // Only keep levels with ≥ 10 samples
  const validLevels = levels.filter(l => countByLevel[l] >= 10);
  const data = validLevels.map(l => Math.round(salaryByLevel[l] / countByLevel[l]));

  // Destroy old chart if exists
  if (experienceChart) experienceChart.destroy();

  const ctx = document.getElementById("experienceChartCanvas").getContext("2d");
  experienceChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: validLevels,
      datasets: [{
        label: "Average Salary (USD)",
        data: data,
        backgroundColor: "rgba(255, 182, 193, 0.5)",
        borderColor: "rgba(255, 182, 193, 1)",
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            afterLabel: function(context) {
              const level = context.label;
              return `Samples: ${countByLevel[level]}`;
            }
          }
        }
      },
      scales: {
        x: { title: { display: true, text: "Experience Level" }},
        y: { title: { display: true, text: "Average Salary in USD" }, beginAtZero: true }
      }
    }
  });
}
