import { Router } from "express";
import {
  getErrorMessage,
  throwError,
  validateAndReturnString,
} from "../utils/helpers.js";
import { authRedirect } from "../middlewares/auth.js";
import {
  badRequest,
  getValidatedUserCredentials,
  isValidEmail,
} from "../utils/authHelpers.js";
import {
  validEmailAndSendVerification,
  verifyResetAndUpdatePassword,
} from "../data/users.js";

function logVerificationError(error) {
  console.error("Login Error: ", error.message);
}

const forgotPassRouter = Router();

forgotPassRouter
  .get("/", authRedirect, (req, res) => {
    res.render("forgotPassword");
  })
  .post("/", authRedirect, async (req, res) => {
    const reqData = req.body;

    if (!reqData || Object.keys(reqData).length === 0)
      return badRequest(
        res,
        "The email field cannot be empty.",
        "forgotPassword"
      );

    //User Already logged In
    if (req.session && req.session.user) {
      console.log("User Already Logged In!!");
      return res.redirect("/projects");
    }

    //Data Validation
    let email;
    try {
      email = validateAndReturnString(reqData.email, "Email");
      if (!isValidEmail(email)) throwError("Enter valid email ID!!");
    } catch (error) {
      logVerificationError(error);
      
      return badRequest(res, error.message, "forgotPassword");
    }

    //Handling email verification and sending verification code

    try {
      const emailStatus = await validEmailAndSendVerification(email);

      if (!emailStatus.isVerificationSent) throwError("Verification Not Sent");

      return res
        .status(200)
        .json({ isVerificationSent: emailStatus.isVerificationSent, email });
    } catch (error) {
      logVerificationError(error);

      let statusCode = error.message === "User does not exist!!" ? 400 : 500;

      return res
        .status(statusCode)
        .render("forgotPassword", getErrorMessage(error.message));
    }
  });

const verifyResetRouter = Router();

verifyResetRouter.post("/", authRedirect, async (req, res) => {
  const reqData = req.body;

  if (!reqData || Object.keys(reqData).length === 0)
    return badRequest(
      res,
      "The email, code and password fields cannot be empty.",
      "forgotPassword"
    );

  //User Already logged In
  if (req.session && req.session.user) {
    console.log("User Already Logged In!!");

    return res.redirect("/projects");
  }

  //Data Validation
  let email, newPassword, code;

  try {
    ({ email, password: newPassword } = getValidatedUserCredentials(
      reqData.email,
      reqData.newPassword
    ));

    code = validateAndReturnString(reqData.code);
  } catch (error) {
    logVerificationError(error);

    return badRequest(res, error.message, "forgotPassword");
  }

  //Handling Code Verification and User Password Update
  try {
    const verificationStatus = await verifyResetAndUpdatePassword(
      email,
      code,
      newPassword
    );

    if (!verificationStatus.isPasswordUpdated)
      throwError("Some Error Occurred!!!");

    return res.redirect("/login");
  } catch (error) {
    logVerificationError(error);

    let statusCode = [
      "User does not exist!!",
      "No reset initiated for this user!!",
      "Verification code expired!!",
      "Invalid verification code provided!!",
    ].includes(error.message)
      ? 400
      : 500;

    return res
      .status(statusCode)
      .render("forgotPassword", getErrorMessage(error.message));
  }
});

export { forgotPassRouter, verifyResetRouter };
