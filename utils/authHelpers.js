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

export const getValidatedUserCredentials = (userEmail, userPassword) => {
  userEmail = validateAndReturnString(userEmail, "Email");
  userPassword = validateAndReturnString(userPassword, "Password");

  //check if the email is valid
  if (!isValidEmail(userEmail))
    throwError("Please enter a valid email address.");

  return {
    userEmail,
    userPassword,
  };
};

export function getValidatedUserInfo(userData) {
  let {
    firstName,
    lastName,
    email,
    password,
    confirmPassword,
    city,
    state,
    gender,
    age,
  } = userData;

  firstName = validateAndReturnString(firstName, "firstName");
  lastName = validateAndReturnString(lastName, "lastName");
  email = validateAndReturnString(email, "email");
  password = validateAndReturnString(password, "password");
  confirmPassword = validateAndReturnString(confirmPassword, "confirmPassword");
  city = validateAndReturnString(city, "city");
  state = validateAndReturnString(state, "state");
  gender = validateAndReturnString(gender, "gender");
  validateAge(age);

  //check if the email is valid
  if (!isValidEmail(email)) throwError("Please enter a valid email address.");

  //check if the password and confirmPassword are same
  if (password !== confirmPassword)
    throwError("Password and confirm password do not match.");

  return {
    firstName,
    lastName,
    email,
    password,
    confirmPassword,
    city,
    state,
    gender,
    age,
  };
}
