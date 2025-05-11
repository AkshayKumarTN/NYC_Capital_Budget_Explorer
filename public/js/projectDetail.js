document.addEventListener("DOMContentLoaded", function () {
  const feedbackForm = document.querySelector(".feedback-form form");
  const feedbackText = document.querySelector("textarea[name='feedbackText']");
  const feedbackList = document.querySelector(".feedback-list");

  if (feedbackForm) {
    feedbackForm.addEventListener("submit", function (e) {
      if (feedbackText.value.trim() === "") {
        e.preventDefault();
        alert("Feedback cannot be empty.");
        return;
      }

      const confirmSubmit = confirm("Are you sure you want to submit this feedback?");
      if (!confirmSubmit) {
        e.preventDefault();
      }
    });
  }

  // Optional: Scroll to latest feedback if form was submitted successfully
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get("submitted") === "true") {
    feedbackList.scrollIntoView({ behavior: "smooth" });
  }
});
