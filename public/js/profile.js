function clearErrors() {
  document
    .querySelectorAll(".error")
    .forEach((element) => (element.textContent = ""));
}

document.getElementById("profileForm").addEventListener("submit", function (e) {
  e.preventDefault();
  clearErrors();

  let isValid = true;

  const first = document.getElementById("firstName").value.trim();
  const last = document.getElementById("lastName").value.trim();
  const borough = document.getElementById("borough").value;
  const gender = document.getElementById("gender").value;
  const age = document.getElementById("age").value.trim();
  const pass = document.getElementById("password").value;
  const cnf = document.getElementById("confirmPassword").value;

  const ageError = document.getElementById("age-error");
  const cnfPassError = document.getElementById("confirmPassword-error");

  if (!first) {
    document.getElementById("firstName-error").textContent =
      "First name required";
    isValid = false;
  }
  if (!last) {
    document.getElementById("lastName-error").textContent =
      "Last name required";
    isValid = false;
  }
  if (!borough || borough === "Unknown") {
    document.getElementById("borough-error").textContent = "Select a Borough";
    isValid = false;
  }
  if (!gender || gender === "Unknown") {
    document.getElementById("gender-error").textContent = "Select a gender";
    isValid = false;
  }

  const ageNum = Number(age);
  if (!age) {
    ageError.textContent = "Age is required";
    isValid = false;
  } else if (isNaN(ageNum) || ageNum < 1 || ageNum > 100) {
    ageError.textContent = "Enter a valid age";
    isValid = false;
  } else if (ageNum < 14) {
    ageError.textContent = "Age must be 14+";
    isValid = false;
  }

  if (pass || cnf) {
    let msg = "";
    if (pass.length < 8) msg = "Password must be atleast 8 characters";
    else if (!/[a-z]/.test(pass))
      msg = "Password must have atleast 1 lowercase letter";
    else if (!/[A-Z]/.test(pass))
      msg = "Password must have atleast 1 uppercase letter";
    else if (!/\d/.test(pass)) msg = "Password must have atleast 1 number";
    else if (!/[!@#$%^&*]/.test(pass))
      msg = "Password must have atleast 1 special character";

    if (msg) {
      document.getElementById("password-error").textContent = msg;
      isValid = false;
    }

    if (!cnf) {
      cnfPassError.textContent = "Confirm Password is required";
      isValid = false;
    } else if (pass !== cnf) {
      cnfPassError.textContent = "Passwords do not match";
      isValid = false;
    }
  }

  if (isValid) {
    this.submit();
  }
});

document.getElementById("cancelBtn").addEventListener("click", () => {
  document.getElementById("profileForm").reset();
  clearErrors();
});
