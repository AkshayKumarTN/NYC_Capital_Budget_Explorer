document.getElementById("signupForm").addEventListener("submit", function (e) {
  e.preventDefault();
  let valid = true;

  const firstName = document.getElementById("firstName").value.trim();
  const lastName = document.getElementById("lastName").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirmPassword").value;
  const borough = document.getElementById("borough").value;
  const gender = document.getElementById("gender").value;
  const ageVal = document.getElementById("age").value;

  const firstNameError = document.getElementById("firstName-error");
  const lastNameError = document.getElementById("lastName-error");
  const emailError = document.getElementById("email-error");
  const passError = document.getElementById("password-error");
  const cnfError = document.getElementById("cnfPassword-error");
  const boroughError = document.getElementById("borough-error");
  const genderError = document.getElementById("gender-error");
  const ageError = document.getElementById("age-error");

  [
    firstNameError,
    lastNameError,
    emailError,
    passError,
    cnfError,
    boroughError,
    genderError,
    ageError,
  ].forEach((span) => (span.textContent = ""));

  if (!firstName) {
    firstNameError.textContent = "First name is required";
    firstName.style.display = "block";
    valid = false;
  }

  if (!lastName) {
    lastNameError.textContent = "Last name is required";
    lastNameError.style.display = "block";
    valid = false;
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  let emailMessage = "";
  if (!email) {
    emailMessage = "Email is required";
  } else if (!emailPattern.test(email)) {
    emailMessage = "Enter a valid email address";
  }

  if (emailMessage) {
    emailError.textContent = emailMessage;
    emailError.style.display = "block";
    valid = false;
  }

  let passMessage = "";
  if (!password) {
    passMessage = "Password is required";
  } else if (password.length < 8) {
    passMessage = "Password must be atleast 8 characters";
  } else if (!/[a-z]/.test(password)) {
    passMessage = "Password must have atleast 1 lowercase letter";
  } else if (!/[A-Z]/.test(password)) {
    passMessage = "Password must have atleast 1 uppercase letter";
  } else if (!/\d/.test(password)) {
    passMessage = "Password must have atleast 1 number";
  } else if (!/[!@#$%^&*(),.?":{}|<>_\-\\[\]\/]/.test(password)) {
    passMessage = "Password must have atleast 1 special character";
  }

  if (passMessage) {
    passError.textContent = passMessage;
    passError.style.display = "block";
    valid = false;
  }

  let cnfPassMessage = "";
  if (!confirmPassword) {
    cnfPassMessage = "Confirm your password";
  } else if (confirmPassword !== password) {
    cnfPassMessage = "Passwords do not match";
  }

  if (cnfPassMessage) {
    cnfError.textContent = cnfPassMessage;
    cnfError.style.display = "block";
    valid = false;
  }

  if (borough === "Unknown") {
    boroughError.textContent = "Select a Borough";
    boroughError.style.display = "block"
    valid = false;
  }

  if (gender === "Unknown") {
    genderError.textContent = "Select a Gender";
    genderError.style.display = "block";
    valid = false;
  }

  const ageNum = Number(ageVal);
  let ageMessage = "";
  if (!ageVal) {
    ageMessage = "Age is required";
  } else if (isNaN(ageNum) || ageNum < 1 || ageNum > 100) {
    ageMessage = "Enter a valid age";
  } else if (ageNum < 14) {
    ageMessage = "You cannot register due to underage!";
  }

  if (ageMessage) {
    ageError.textContent = ageMessage;
    ageError.style.display = "block";
    valid = false;
  }

  if (valid) {
    this.submit();
  }
});
