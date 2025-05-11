import { Router } from "express";
import { badRequest, getValidatedUserInfo } from "../utils/authHelpers.js";
import { createUser } from "../data/index.js";
import { initSession } from "../utils/sessionManager.js";
import { getErrorMessage } from "../utils/helpers.js";
import { authRedirect } from "../middlewares/auth.js";

const router = Router();

router
  .get("/", authRedirect, (req, res) => {
    res.render("register");
  })
  .post("/", authRedirect, async (req, res) => {
    let registrationData = req.body;
    console.log("Registration data: ", registrationData);

    //make sure there is something present in the req.body
    if (!registrationData || Object.keys(registrationData).length === 0) {
      return badRequest(res, "Provide all the required fields.", "register");
    }

    //User already logged in
    if (req.session && req.session.user) {
      console.log("User Already logged In!!");
      return res.redirect("/projects");
    }

    //Data Validation
    try {
      registrationData = getValidatedUserInfo(registrationData);
    } catch (e) {
      console.log("Error: ", e.message);
      return badRequest(res, e.message, "register");
    }

    //User Creation
    try {
      const userData = await createUser(registrationData);
      console.log("User data: ", userData);

      return res.redirect("/login");
    } catch (e) {
      console.log("Error: ", e);
      return res.status(500).render("register", getErrorMessage(e.message));
    }
  });

export default router;
