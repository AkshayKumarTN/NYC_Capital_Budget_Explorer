document.addEventListener("DOMContentLoaded", function () {
    const feedbackForm = document.querySelector(".feedback-form form");
    const feedbackText = document.querySelector("textarea[name='feedbackText']");
    const feedbackList = document.querySelector(".feedback-list");
    const errorMsg = document.getElementById("error");
    const loadMoreBtn = document.getElementById("load-more-btn");


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
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener("click", async () => {
            const projectId = window.location.pathname.split("/").pop();
            try {
                const response = await fetch(`/projects/${projectId}/all-feedbacks`);
                const feedbacks = await response.json();
                feedbackList.innerHTML = ""; // Clear current list
                feedbacks.forEach(fb => {
                    const li = document.createElement("li");
                    li.innerHTML = `${fb.text} <small>(${new Date(fb.created_at).toLocaleString()})</small>`;
                    feedbackList.appendChild(li);
                });
                loadMoreBtn.remove(); // Remove the Load More button
            } catch (err) {
                console.error("Failed to load more feedbacks:", err);
            }
        });
    }

    // Scroll if feedback was submitted
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("submitted") === "true") {
        feedbackList.scrollIntoView({ behavior: "smooth" });
    }
});
