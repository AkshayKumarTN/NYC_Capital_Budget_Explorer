document.addEventListener("DOMContentLoaded", function () {
  const feedbackForm = document.querySelector(".feedback-form form");
  const feedbackText = document.querySelector("textarea[name='feedbackText']");
  const feedbackList = document.querySelector(".feedback-list");
  const errorMsg = document.getElementById("error");


  // Submit event for double-checking
  if (feedbackForm) {
    feedbackForm.addEventListener("submit", function (e) {
      const text = feedbackText.value.trim();

      // Check again on submit
      if (text.length < 5) {
        e.preventDefault();
        errorMsg.textContent = "Feedback must be at least 5 characters.";
        errorMsg.hidden = false;
        return;
      }

      const confirmSubmit = confirm("Are you sure you want to submit this feedback?");
      if (!confirmSubmit) {
        e.preventDefault();
      }
    });
  }

  // Scroll if feedback was submitted
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get("submitted") === "true") {
    feedbackList.scrollIntoView({ behavior: "smooth" });
  }
});
