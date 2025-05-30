d3.csv("data_science_job_cleaned.csv").then(data => {
    // Filter out invalid or unwanted values
    data = data.filter(d => {
      const ct = d.company_type?.trim().toLowerCase();
      return ct && ct !== "nan" && ct !== "null" && ct !== "undefined" && ct !== "other";
    });
  
    data.forEach(d => {
      d.target = +d.target;
      d.company_type = d.company_type.trim();
    });
  
    // Group by company_type 
    const grouped = d3.rollup(
      data,
      v => {
        const seekers = v.filter(d => d.target === 1).length;
        return (seekers / v.length) * 100;
      },
      d => d.company_type
    );
  
    const labels = Array.from(grouped.keys());
    const values = labels.map(label => +grouped.get(label).toFixed(1));
  
    new Chart(document.getElementById('companyTypeChart'), {
      type: 'pie',
      data: {
        labels: labels,
        datasets: [{
          data: values,
          backgroundColor: [
            '#ffccd5', 
            '#ffa6b8', 
            '#ff4500', 
            '#ff9966', 
            '#ffb380', 
            '#ff6347', 
            '#ff4500', 
            '#cc3333'  
          ],
          borderColor: '#fff',
          borderWidth: 2,
          hoverOffset: 20
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            font: {
              size: 24,
              weight: 'bold'
            },
            padding: {
              top: 20,
              bottom: 30
            }
          },
          tooltip: {
            callbacks: {
              label: ctx => `${ctx.label}: ${ctx.parsed}%`
            },
            backgroundColor: '#444',
            titleColor: '#fff',
            bodyColor: '#fff',
            borderColor: '#ccc',
            borderWidth: 1
          },
          legend: {
            position: 'bottom',
            labels: {
              font: {
                size: 16
              },
              padding: 20,
              usePointStyle: true,
              boxWidth: 14
            }
          }
        },
        layout: {
          padding: 30
        }
      }
    });
  }).catch(error => {
    console.error("Error loading company type chart data:", error);
    document.getElementById('companyTypeChart').outerHTML =
      "<p style='color:red;'>Error loading company type data.</p>";
  });
  