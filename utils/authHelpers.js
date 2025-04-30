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

export const getValidatedUserCredentials = (email, password) => {
  email = validateAndReturnString(email, "Email");
  password = validateAndReturnString(password, "Password");

  //check if the email is valid
  if (!isValidEmail(email))
    throwError("Please enter a valid email address.");

  if(password.length < 8) throwError("Password must be atleast 8 characters");
  if(!/[a-z]/.test(password)) throwError("Password must have atleast 1 lowercase letter");
  if(!/[A-Z]/.test(password)) throwError("Password must have atleast 1 uppercase letter");
  if(!/\d/.test(password)) throwError("Password must have atleast 1 number");
  if(!/[!@#$%^&*(),.?":{}|<>_\-\\[\]\/]/.test(password)) throwError("Password must have atleast 1 special character");

  return {
    email,
    password,
  };
};

export function getValidatedUserInfo(userData) {
  let {
    firstName,
    lastName,
    email,
    password,
    confirmPassword,
    state = "New York",
    city,
    gender,
    age,
  } = userData;

  firstName = validateAndReturnString(firstName, "firstName");
  lastName = validateAndReturnString(lastName, "lastName");
  
  ({email, password} = getValidatedUserCredentials(
    email,
    password
  ));
  
  confirmPassword = validateAndReturnString(confirmPassword, "confirmPassword");
  city = validateAndReturnString(city, "city");
  state = validateAndReturnString(state, "state");
  gender = validateAndReturnString(gender, "gender");
  age = parseInt(age);
  validateAge(age);

  state = state.toLowerCase();
  if(state !== "new york" && state !== "ny") throwError("Sorry this application is built only for the state of New York");
  
  gender = gender.toLowerCase();
  if(!["male", "female", "other"].includes(gender) && !["m", "f", "o"].includes(gender)) throwError("Provide a valid gender");
  
  

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
