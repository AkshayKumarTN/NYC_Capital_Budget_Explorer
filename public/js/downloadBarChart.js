async function downloadBarChart() {
    document.getElementById("downloadBarChart").addEventListener("click", async () => {
  const container = document.getElementById("chartExportContainer");

  // Optional: Scroll to top before render
  window.scrollTo(0, 0);

 container.classList.add("exporting");

  const opt = {
    margin: 0.3,
    filename: 'barchart_with_table.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, scrollY: 0 },
    jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
    pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
  };

  html2pdf().set(opt).from(container).save().then(() => {
    container.classList.remove("exporting"); // Restore scroll limit
  });
});

}