import { getErrorMessage } from "./helpers.js";
import { validateAndReturnString, validateAge, throwError } from "./helpers.js";

export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const result = emailRegex.test(email);

  return Boolean(result);
}

export const badRequest = (res, message, redirectPage) => {
  return res.status(400).render(redirectPage, getErrorMessage(message));
};

export const getValidatedUserCredentials = (
  email,
  password,
  skipPasswordIfEmpty = false
) => {
  email = validateAndReturnString(email, "Email");
  email = email.toLowerCase();

  password = password.trim();
  if (!skipPasswordIfEmpty || password.length)
    password = validateAndReturnString(password, "Password");

  
  //check if the email is valid
  if (!isValidEmail(email)) throwError("Please enter a valid email address.");

  if (!skipPasswordIfEmpty || password.length) {
    if (password.length < 8)
      throwError("Password must be atleast 8 characters");
    if (!/[a-z]/.test(password))
      throwError("Password must have atleast 1 lowercase letter");
    if (!/[A-Z]/.test(password))
      throwError("Password must have atleast 1 uppercase letter");
    if (!/\d/.test(password)) throwError("Password must have atleast 1 number");
    if (!/[!@#$%^&*(),.?":{}|<>_\-\\[\]\/]/.test(password))
      throwError("Password must have atleast 1 special character");
  }

  return {
    email,
    password,
  };
};

export function getValidatedUserInfo(userData, skipPasswordIfEmpty = false) {
  let {
    firstName,
    lastName,
    email,
    password,
    confirmPassword,
    state = "New York",
    borough,
    gender,
    age,
  } = userData;

  firstName = validateAndReturnString(firstName, "firstName");
  lastName = validateAndReturnString(lastName, "lastName");

  ({ email, password } = getValidatedUserCredentials(
    email,
    password,
    skipPasswordIfEmpty
  ));

  if(!skipPasswordIfEmpty || password.length)
    confirmPassword = validateAndReturnString(confirmPassword, "confirmPassword");
  borough = validateAndReturnString(borough, "Borough");
  state = validateAndReturnString(state, "state");
  gender = validateAndReturnString(gender, "gender");
  age = parseInt(age);
  validateAge(age);

  if(firstName.length < 3) throwError("Min 3 characters required for First name");

  if(lastName.length < 3) throwError("Min 3 characters required for Last name");

  state = state.toLowerCase();
  if (state !== "new york" && state !== "ny")
    throwError(
      "Sorry this application is built only for the state of New York"
    );
  state = state.toUpperCase();

  gender = gender.toLowerCase();
  if (
    !["male", "female", "other"].includes(gender) &&
    !["m", "f", "o"].includes(gender)
  )
    throwError("Provide a valid gender");

  if (
    !["Manhattan", "Bronx", "Brooklyn", "Staten Island", "Queens"].includes(
      borough
    )
  )
    throwError("Provide valid Borough as input");

  //check if the password and confirmPassword are same
  if ((!skipPasswordIfEmpty || password.length) && password !== confirmPassword)
    throwError("Password and confirm password do not match.");

  return {
    firstName,
    lastName,
    email,
    password,
    confirmPassword,
    borough,
    state,
    gender,
    age,
  };
}
