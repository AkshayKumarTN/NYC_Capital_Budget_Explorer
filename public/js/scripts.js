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

      if (target === "barTab") {
        createBarChart();
      }

      if (target === "pieTab") {
        createPieChart();
      }
    });
  });

  //Get unique values for Dropdowns
  function getUniqueValues(data, key) {
    const values = new Set();
    data.forEach((item) => {
      if (item[key]) {
        values.add(item[key]);
      }
    });
    return Array.from(values).sort(); // return sorted array
  }

  // Populate dropdowns with unique values
  function populateFilterDropdowns() {
    const data = extractProjectDataFromTable();

    const districts = getUniqueValues(data, "councilDistrict");
    // const agencies = getUniqueValues(data, 'sponsor');
    // const categories = getUniqueValues(data, 'description'); // or use 'category' if available
    const years = getUniqueValues(data, "fiscalYear");

    fillDropdown("filterDistrict", districts, "All Districts");
    // fillDropdown('filterAgency', agencies, 'All Agencies');
    // fillDropdown('filterCategory', categories, 'All Categories');
    fillDropdown("filterYear", years, "All Years");
  }

  function fillDropdown(selectId, options, defaultLabel) {
    const select = document.getElementById(selectId);
    select.innerHTML = `<option value="">${defaultLabel}</option>`;
    options.forEach((value) => {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
  }

  //EXTRACT PROJECT DATA FROM TABLE
  function extractProjectDataFromTable() {
    const rows = document.querySelectorAll("#budgetTable tbody tr");
    const projects = [];

    rows.forEach((row) => {
      const cells = row.querySelectorAll("td");
      projects.push({
        description: cells[0]?.textContent.trim() || "",
        id: cells[1]?.textContent.trim() || "",
        borough: cells[2]?.textContent.trim() || "",
        amount: parseFloat(cells[3]?.textContent.replace(/[$,]/g, "")) || 0,
        sponsor: cells[4]?.textContent.trim() || "",
        reportedYear: cells[5]?.textContent.trim() || "",
        fiscalYear: cells[6]?.textContent.trim() || "",
        councilDistrict: cells[7]?.textContent.trim() || "",
      });
    });

    return projects;
  }

  const budgetData = extractProjectDataFromTable();
  let barChartInstance;
  let pieChartInstance;

  //FILTER AND GROUPING FUNCTION
  function filterBudgetData(data) {
    const selectedDistrict = document.getElementById("filterDistrict").value;
    // const selectedAgency = document.getElementById('filterAgency').value;
    // const selectedCategory = document.getElementById('filterCategory').value;
    const selectedYear = document.getElementById("filterYear").value;

    return data.filter((project) => {
      return (
        (!selectedDistrict || project.councilDistrict === selectedDistrict) &&
        //  (!selectedAgency || project.sponsor === selectedAgency) &&
        //  (!selectedCategory || project.description.includes(selectedCategory)) &&
        (!selectedYear || project.fiscalYear === selectedYear)
      );
    });
  }

  function groupBudgetByKey(data, key) {
    const grouped = {};

    data.forEach((project) => {
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
    populateFilterDropdowns();
    const filtered = filterBudgetData(budgetData);
    const grouped = groupBudgetByKey(filtered, "fiscalYear"); // or 'category'

    const labels = Object.keys(grouped);
    const values = Object.values(grouped);

    const ctx = document.getElementById("barChartCanvas").getContext("2d");

    if (barChartInstance) {
      barChartInstance.destroy(); // remove previous chart
    }

    barChartInstance = new Chart(ctx, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Capital Budget by Category ($)",
            data: values,
            backgroundColor: "steelblue",
          },
        ],
      },
      options: {
        indexAxis: "y", // horizontal bars
        responsive: true,
        scales: {
          x: { beginAtZero: true },
        },
      },
    });
  }

  document
    .getElementById("groupByDropdown")
    .addEventListener("change", createPieChart);

  //PIE CHART
  function createPieChart() {
    // populateFilterDropdowns();
    const filtered = filterPieChartData(
      budgetData,
      "pieSearchBorough",
      "pieSearchFy",
      "pieSearchDistrict",
      "pieSearchSponsor"
    );

    const selectedKey = document.getElementById("groupByDropdown").value;
    const grouped = groupBudgetByKey(filtered, selectedKey);

    const labels = Object.keys(grouped);
    const values = Object.values(grouped);

    const ctx = document.getElementById("pieChartCanvas").getContext("2d");
    const message = document.getElementById("noPieDataMessage");

    if (pieChartInstance) {
      pieChartInstance.destroy();
    }

    if (values.length === 0) {
      message.style.display = "block";
      return;
    } else {
      message.style.display = "none";
    }

    pieChartInstance = new Chart(ctx, {
      type: "pie",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Capital Budget Distribution",
            data: values,
            backgroundColor: [
              "#4e79a7",
              "#f28e2c",
              "#e15759",
              "#76b7b2",
              "#59a14f",
              "#edc949",
              "#af7aa1",
              "#ff9da7",
            ],
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: "right",
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                const total = context.chart._metasets[0].total;
                const value = context.parsed;
                const percentage = ((value / total) * 100).toFixed(2) + "%";
                return `${context.label}: ${value} (${percentage})`;
              },
            },
          },
        },
      },
    });
  }

  //Table Filters and Search
  function filterTableData(data) {
    const selectedBorough = document
      .getElementById("searchBorough")
      .value.trim();
    const selectedYear = document.getElementById("searchFy").value.trim();
    const selectedDistrict = document
      .getElementById("searchDistrict")
      .value.trim();
    const sponsorInput = document
      .getElementById("searchSponsor")
      .value.trim()
      .toLowerCase();

    return data.filter((project) => {
      return (
        (!selectedBorough || project.borough === selectedBorough) &&
        (!selectedYear || project.fiscalYear === selectedYear) &&
        (!selectedDistrict || project.councilDistrict === selectedDistrict) &&
        (!sponsorInput || project.sponsor.toLowerCase().includes(sponsorInput))
      );
    });
  }

  function updateProjectTable(data) {
    const tbody = document.querySelector("#budgetTable tbody");
    tbody.innerHTML = "";

    data.forEach((project) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${project.description}</td>
        <td>${project.id}</td>
        <td>${project.borough}</td>
        <td>$${project.amount.toLocaleString()}</td>
        <td>${project.sponsor}</td>
        <td>${project.reportedYear}</td>
        <td>${project.fiscalYear}</td>
        <td>${project.councilDistrict}</td>
      `;
      tbody.appendChild(row);
    });
  }

  document.getElementById("searchFilters").addEventListener("click", () => {
    const filtered = filterTableData(budgetData);
    updateProjectTable(filtered);
  });

  document.getElementById("resetFilters").addEventListener("click", () => {
    document.getElementById("searchBorough").value = "";
    document.getElementById("searchFy").value = "";
    document.getElementById("searchDistrict").value = "";
    document.getElementById("searchSponsor").value = "";
    updateProjectTable(budgetData);
  });

  //PIE CHART FILTERS AND SEARCH
  function filterPieChartData(data) {
    const borough = document.getElementById("pieSearchBorough").value.trim();
    const year = document.getElementById("pieSearchFy").value.trim();
    const district = document.getElementById("pieSearchDistrict").value.trim();
    const sponsor = document
      .getElementById("pieSearchSponsor")
      .value.trim()
      .toLowerCase();

    return data.filter((project) => {
      return (
        (!borough || project.borough === borough) &&
        (!year || project.fiscalYear === year) &&
        (!district || project.councilDistrict.includes(district)) &&
        (!sponsor || project.sponsor.toLowerCase().includes(sponsor))
      );
    });
  }

  document.getElementById("pieSearchFilters").addEventListener("click", () => {
    createPieChart();
  });

  document.getElementById("pieResetFilters").addEventListener("click", () => {
    document.getElementById("pieSearchBorough").value = "";
    document.getElementById("pieSearchFy").value = "";
    document.getElementById("pieSearchDistrict").value = "";
    document.getElementById("pieSearchSponsor").value = "";
    createPieChart();
  });
});
