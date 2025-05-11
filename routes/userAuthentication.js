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
    console.log("Login data: ", loginData);

    //make sure there is something present in the req.body
    if (!loginData || Object.keys(loginData).length === 0)
      return badRequest(
        res,
        "The email and password field cannot be empty.",
        "login"
      );

    //User Already logged In
    if (req.session && req.session.user) {
      console.log("User Already Logged In!!");
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
      initSession(req, userData);
      console.log("Session data: ", req.session);

      return res.redirect("/projects");
    } catch (e) {
      logLoginError(e);
      return res
        .status(401)
        .render(
          "login",
          getErrorMessage(
            `Either user email or password is incorrect. Please try again.`
          )
        );
    }
  });

export default router;
