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
    });
  });
});
