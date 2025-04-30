document.getElementById("loginForm").addEventListener("submit", function (e) {
  e.preventDefault();
  let valid = true;

  let email = document.getElementById("email");
  let password = document.getElementById("password");
  const emailError = document.getElementById("email-error");
  const passError = document.getElementById("password-error");

  emailError.textContent = "";
  passError.textContent = "";

  email = email.value.trim();
  password = password.value;

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  let emailMessage = "";
  if (!email) {
    emailMessage = "Email is required";
  } else if (!emailPattern.test(email)) {
    emailMessage = "Enter a valid email address";
  }

  if(emailMessage)
  {
    emailError.textContent = emailMessage;
    emailError.style.display = "block";
    valid = false;
  }

  let passMessage = "";
  if (!password) {
    passMessage = "Password is required";
  } else if (password.length < 8) {
    passMessage = "Password must be atleast 8 characters";
  }else if(!/[a-z]/.test(password)) {
    passMessage = "Password must have atleast 1 lowercase letter";
  } else if(!/[A-Z]/.test(password)) {
    passMessage = "Password must have atleast 1 uppercase letter";
  } else if(!/\d/.test(password)) {
    passMessage = "Password must have atleast 1 number";
  } else if(!/[!@#$%^&*(),.?":{}|<>_\-\\[\]\/]/.test(password)) {
    passMessage = "Password must have atleast 1 special character";
  }

  if(passMessage)
  {
    passError.textContent = passMessage;
    passError.style.display = "block";
    valid = false;
  }

  if (valid) {
    this.submit();
  }
});
