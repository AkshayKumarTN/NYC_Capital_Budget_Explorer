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
import { destroySession } from "../utils/sessionManager.js";

function logVerificationError(error) {
  console.error("Login Error: ", error.message);
}

function getErrorResponse(res, statusCode, message, forSendingEmail = true) {
  let errorJSON = { isVerificationSent: false };
  if (!forSendingEmail) {
    errorJSON = { isPasswordUpdated: false };
  }

  return res.status(statusCode).json({
    ...errorJSON,
    errorMessage: message,
  });
}

const forgotPassRouter = Router();

forgotPassRouter
  .get("/", authRedirect, (req, res) => {
    res.render("forgotPassword");
  })
  .post("/", authRedirect, async (req, res) => {
    const reqData = req.body;

    if (!reqData || Object.keys(reqData).length === 0)
      return getErrorResponse(res, 400, "Email Field Cannot be empty!");

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

      return getErrorResponse(res, 400, error.message);
    }

    //Handling email verification and sending verification code

    try {
      const emailStatus = await validEmailAndSendVerification(email);

      if (!emailStatus.isVerificationSent) throwError("Verification Not Sent");

      //Storing user email for verification
      req.session.verificationEmail = email;

      return res.status(200).json({ isVerificationSent: true, email });
    } catch (error) {
      logVerificationError(error);

      let statusCode = error.message === "User does not exist!!" ? 400 : 500;

      return getErrorResponse(res, statusCode, error.message);
    }
  });

const verifyResetRouter = Router();

verifyResetRouter.post("/", authRedirect, async (req, res) => {
  const reqData = req.body;

  if (!reqData || Object.keys(reqData).length === 0)
    return getErrorResponse(
      res,
      400,
      "The code and password fields cannot be empty.",
      false
    );

  //User Already logged In
  if (req.session && req.session.user) {
    console.log("User Already Logged In!!");

    return res.redirect("/projects");
  }

  if (!req.session || !req.session.verificationEmail) {
    return getErrorResponse(
      res,
      400,
      "Verification Email not sent, try sending verification again!",
      false
    );
  }

  //Data Validation
  let email, newPassword, code;

  try {
    ({ email, password: newPassword } = getValidatedUserCredentials(
      req.session.verificationEmail,
      reqData.newPassword
    ));

    code = validateAndReturnString(reqData.code);
  } catch (error) {
    logVerificationError(error);

    return getErrorResponse(res, 400, error.message, false);
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

    destroySession(req);

    return res.status(200).json({ isPasswordUpdated: true, email });
  } catch (error) {
    logVerificationError(error);

    let statusCode = [
      "User does not exist!!",
      "No reset initiated for this user!!",
      "Verification code expired!!",
      "Invalid verification code provided!!",
      "Cannot reuse the old password for new password!!",
    ].includes(error.message)
      ? 400
      : 500;

    return getErrorResponse(res, statusCode, error.message, false);
  }
});

export { forgotPassRouter, verifyResetRouter };
