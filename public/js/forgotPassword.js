const forgotForm = document.getElementById("forgotPassForm");
const verificationForm = document.getElementById("verificationForm");
const clientError = document.getElementsByClassName("client-error")[0];
const errorsArr = document.querySelectorAll(".error-message");

function displayClientError(errorMessage) {
  clientError.style.display = "block";

  clientError.innerHTML = `<p>${errorMessage}</p>`;
}

forgotForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const emailError = document.getElementById("email-error");

  const cardHeading = document.getElementById("card-heading");
  const textAssist = document.getElementById("text-assist");

  errorsArr.forEach((element) => {
    element.style.display = "none";
  });

  emailError.textContent = "";
  emailError.style.display = "none";

  const emailRE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) {
    emailError.textContent = "Email is required";
    emailError.style.display = "block";
    return;
  }
  if (!emailRE.test(email)) {
    emailError.textContent = "Enter a valid email address";
    emailError.style.display = "block";
    return;
  }

  try {
    axios
      .post("/forgot-password", { email })
      .then(({ data }) => {
        if (!data.isVerificationSent) throw new Error(data.errorMessage);

        cardHeading.textContent = "Verification";
        textAssist.textContent = "Enter Verification code and new Password";

        forgotForm.style.display = "none";

        verificationForm.style.display = "block";
      })
      .catch((error) => {
        if (error.response)
          displayClientError(error.response.data.errorMessage);
        else displayClientError(error.message);
      });
  } catch (error) {
    displayClientError(error.message);
  }
});

verificationForm.addEventListener("submit", (e) => {
  e.preventDefault();
  let isValid = true;

  const codeInput = document.getElementById("code");
  const pwdInput = document.getElementById("newPassword");
  const cnfInput = document.getElementById("confirmPassword");

  const codeError = document.getElementById("code-error");
  const pwdError = document.getElementById("password-error");
  const cnfError = document.getElementById("cnfPassword-error");

  errorsArr.forEach((element) => {
    element.style.display = "none";
  });

  [codeError, pwdError, cnfError].forEach((errElement) => {
    errElement.textContent = "";
    errElement.style.display = "none";
  });

  const code = codeInput.value.trim();
  if (!/^\d{6}$/.test(code)) {
    codeError.textContent = "Enter the 6-digit verification code";
    codeError.style.display = "block";
    isValid = false;
  }

  const pwd = pwdInput.value.trim();
  let pwdMsg = "";
  if (!pwd) {
    pwdMsg = "Password is required";
  } else if (pwd.length < 8) {
    pwdMsg = "Password must be at least 8 characters";
  } else if (!/[a-z]/.test(pwd)) {
    pwdMsg = "Must include 1 lowercase letter";
  } else if (!/[A-Z]/.test(pwd)) {
    pwdMsg = "Must include 1 uppercase letter";
  } else if (!/\d/.test(pwd)) {
    pwdMsg = "Must include 1 number";
  } else if (!/[!@#$%^&*(),.?":{}|<>_\-\\[\]\/]/.test(pwd)) {
    pwdMsg = "Must include 1 special character";
  }
  if (pwdMsg) {
    pwdError.textContent = pwdMsg;
    pwdError.style.display = "block";
    isValid = false;
  }

  if (!cnfInput.value) {
    cnfError.textContent = "Confirm your password";
    cnfError.style.display = "block";
    isValid = false;
  } else if (cnfInput.value !== pwd) {
    cnfError.textContent = "Passwords do not match";
    cnfError.style.display = "block";
    isValid = false;
  }

  if (!isValid) return;

  try {
    axios
      .post("/verify-reset-code", {
        newPassword: pwd,
        code,
      })
      .then(({ data }) => {
        if (!data.isPasswordUpdated) throw new Error(data.errorMessage);

        window.location.replace("http://localhost:3000/login");
      })
      .catch((error) => {
        if (error.response)
          displayClientError(error.response.data.errorMessage);
        else displayClientError(error.message);
      });
  } catch (error) {
    displayClientError(error.message);
  }
});
