let lineChart = null;

function updateLineChartFilter() {
  const country = document.getElementById("lineCountrySelect").value;
  const filtered = globalData.filter(d => 
    d.job_category === currentCategory &&
    (!country || country === "All" || d.company_location === country) &&
    [2020, 2021, 2022, 2023].includes(d.work_year)
  );

  const yearSalaryMap = {};
  filtered.forEach(d => {
    const year = d.work_year;
    if (!yearSalaryMap[year]) yearSalaryMap[year] = [];
    yearSalaryMap[year].push(d.salary_in_usd);
  });

  const years = [2020, 2021, 2022, 2023];
  const avgSalaries = years.map(y => {
    const salaries = yearSalaryMap[y] || [];
    if (!salaries.length) return null;
    const avg = salaries.reduce((a, b) => a + b, 0) / salaries.length;
    return Math.round(avg);
  });

  const ctx = document.getElementById("lineChartCanvas").getContext("2d");
  if (lineChart) lineChart.destroy();

  lineChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: years,
      datasets: [{
        label: 'Average Salary (USD)',
        data: avgSalaries,
        fill: false,
        borderColor: 'rgba(54, 162, 235, 1)',
        backgroundColor: 'rgba(54, 162, 235, 0.3)',
        tension: 0.2
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: true }
      },
      scales: {
        x: { title: { display: true, text: 'Year' }},
        y: { title: { display: true, text: 'Average Salary (USD)' }, beginAtZero: false }
      }
    }
  });
}


function showLineChartForCategory(categoryName) {
    const container = document.getElementById("lineChartContainer");
    container.style.display = "block";
    document.getElementById("lineTitle").textContent = "Average Salary Over Years – " + categoryName;
  
    const filtered = globalData.filter(d => 
      d.job_category === categoryName &&
      [2020, 2021, 2022, 2023].includes(d.work_year)
    );
  
    
    const countryYearCounts = {};
  
    filtered.forEach(d => {
      const country = d.company_location;
      const year = d.work_year;
      if (!countryYearCounts[country]) countryYearCounts[country] = {};
      if (!countryYearCounts[country][year]) countryYearCounts[country][year] = 0;
      countryYearCounts[country][year]++;
    });
  
    
    const validCountries = Object.entries(countryYearCounts)
      .filter(([country, yearMap]) => {
        return [2020, 2021, 2022, 2023].every(year => (yearMap[year] || 0) >= 10);
      })
      .map(([country]) => country)
      .filter(c => c === "United States" || c === "United Kingdom")  
      .sort();
  
    
    const dropdown = document.getElementById("lineCountrySelect");
    dropdown.innerHTML = '<option value="All">All</option>';
    validCountries.forEach(c => {
      const opt = document.createElement("option");
      opt.value = c;
      opt.textContent = c;
      dropdown.appendChild(opt);
    });
  
    updateLineChartFilter();
  }
  
  
