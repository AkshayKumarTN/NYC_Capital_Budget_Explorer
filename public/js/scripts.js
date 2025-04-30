document.addEventListener("DOMContentLoaded", () => {
  const tabLinks = document.querySelectorAll(".tab-link");
  const tabContents = document.querySelectorAll(".tab-content");
  

  // console.log("button clicked");
  tabLinks.forEach((btn) => {
    btn.addEventListener("click", (event) => {
      const target = btn.dataset.tab;

      tabLinks.forEach((t) => t.classList.remove("active"));
      tabContents.forEach((t) => (t.style.display = "none"));

      btn.classList.add("active");
      const tab = document.getElementById(target);
      tab.style.display = "block";

      if (target === 'barTab') {
        createBarChart();
      }

      if (target === 'pieTab') {
        createPieChart();
      }

    });
  });

  //Get unique values for Dropdowns
  function getUniqueValues(data, key) {
  const values = new Set();
  data.forEach(item => {
    if (item[key]) {
      values.add(item[key]);
    }
  });
  return Array.from(values).sort(); // return sorted array
}

  // Populate dropdowns with unique values
  function populateFilterDropdowns() {
    const data = extractProjectDataFromTable();

    const districts = getUniqueValues(data, 'councilDistrict');
    // const agencies = getUniqueValues(data, 'sponsor');
    // const categories = getUniqueValues(data, 'description'); // or use 'category' if available
    const years = getUniqueValues(data, 'fiscalYear');

    fillDropdown('filterDistrict', districts, 'All Districts');
    // fillDropdown('filterAgency', agencies, 'All Agencies');
    // fillDropdown('filterCategory', categories, 'All Categories');
    fillDropdown('filterYear', years, 'All Years');
  }

  function fillDropdown(selectId, options, defaultLabel) {
    const select = document.getElementById(selectId);
    select.innerHTML = `<option value="">${defaultLabel}</option>`;
    options.forEach(value => {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
  }


  //EXTRACT PROJECT DATA FROM TABLE
  function extractProjectDataFromTable() {
    const rows = document.querySelectorAll('#budgetTable tbody tr');
    const projects = [];

    rows.forEach(row => {
      const cells = row.querySelectorAll('td');
      projects.push({
        description: cells[0]?.textContent.trim() || '',
        id: cells[1]?.textContent.trim() || '',
        borough: cells[2]?.textContent.trim() || '',
        amount: parseFloat(cells[3]?.textContent.replace(/[$,]/g, '')) || 0,
        sponsor: cells[4]?.textContent.trim() || '',
        reportedYear: cells[5]?.textContent.trim() || '',
        fiscalYear: cells[6]?.textContent.trim() || '',
        councilDistrict: cells[7]?.textContent.trim() || ''
      });
    });

    return projects;
  }

  const budgetData = extractProjectDataFromTable();
  let barChartInstance;

  //FILTER AND GROUPING FUNCTION
  function filterBudgetData(data) {
  const selectedDistrict = document.getElementById('filterDistrict').value;
  // const selectedAgency = document.getElementById('filterAgency').value;
  // const selectedCategory = document.getElementById('filterCategory').value;
  const selectedYear = document.getElementById('filterYear').value;

  return data.filter(project => {
    return (!selectedDistrict || project.councilDistrict === selectedDistrict) &&
          //  (!selectedAgency || project.sponsor === selectedAgency) &&
          //  (!selectedCategory || project.description.includes(selectedCategory)) &&
           (!selectedYear || project.fiscalYear === selectedYear);
  });
}

function groupBudgetByKey(data, key) {
  const grouped = {};

  data.forEach(project => {
    const groupValue = project[key] || "Unknown";
    if (!grouped[groupValue]) {
      grouped[groupValue] = 0;
    }
    grouped[groupValue] += project.amount;
  });

  return grouped;
}

  

  //BAR CHART
  function createBarChart() {
      populateFilterDropdowns()
      const filtered = filterBudgetData(budgetData);
      const grouped = groupBudgetByKey(filtered, 'fiscalYear'); // or 'category'

      const labels = Object.keys(grouped);
      const values = Object.values(grouped);

      const ctx = document.getElementById('barChartCanvas').getContext('2d');

      if (barChartInstance) {
        barChartInstance.destroy(); // remove previous chart
      }

      barChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{
            label: 'Capital Budget by Category ($)',
            data: values,
            backgroundColor: 'steelblue'
          }]
        },
        options: {
          indexAxis: 'y', // horizontal bars
          responsive: true,
          scales: {
            x: { beginAtZero: true }
          }
        }
      });
  }



  //PIE CHART
  function createPieChart(){

  }

});
