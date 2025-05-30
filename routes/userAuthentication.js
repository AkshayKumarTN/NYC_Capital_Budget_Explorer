import { Router } from "express";
import {
  badRequest,
  getValidatedUserCredentials,
} from "../utils/authHelpers.js";
import { userLogin } from "../data/index.js";
import { getErrorMessage } from "../utils/helpers.js";
import { initSession } from "../utils/sessionManager.js";
import { authRedirect } from "../middlewares/auth.js";

const router = Router();

function logLoginError(error) {
  console.error("Login Error: ", error.message);
}

router
  .get("/", authRedirect, (req, res) => {
    res.render("login");
  })
  .post("/", authRedirect, async (req, res) => {
    let loginData = req.body;

    //make sure there is something present in the req.body
    if (!loginData || Object.keys(loginData).length === 0)
      return badRequest(
        res,
        "The email and password field cannot be empty.",
        "login"
      );

    //User Already logged In
    if (req.session && req.session.user) {
      return res.redirect("/projects");
    }

    //Data Validation

    let email, password;
    try {
      ({ email, password } = getValidatedUserCredentials(
        loginData.email,
        loginData.password
      ));
    } catch (error) {
      logLoginError(error);
      return badRequest(res, error.message, "login");
    }

    //call your data layer here
    try {
      const userData = await userLogin(email, password);

      //Set the session
      initSession(req, userData, loginData.remember);

      return res.redirect("/projects");
    } catch (error) {
      logLoginError(error);

      const errorMessage = error.message.includes("ECONNREFUSED")
        ? "Database is not connected, try again!"
        : "Either user email or password is incorrect. Please try again.";
      
        return res.status(401).render("login", getErrorMessage(errorMessage));
    }
  });

export default router;
