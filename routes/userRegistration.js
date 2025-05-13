import { Router } from "express";
import { badRequest, getValidatedUserInfo } from "../utils/authHelpers.js";
import { createUser } from "../data/index.js";
import { getErrorMessage } from "../utils/helpers.js";
import { authRedirect } from "../middlewares/auth.js";

function logRegistrationError(error)
{
    console.log("Error: ", error.message);
}

const router = Router();

router
  .get("/", authRedirect, (req, res) => {
    res.render("register");
  })
  .post("/", authRedirect, async (req, res) => {
    let registrationData = req.body;

    //make sure there is something present in the req.body
    if (!registrationData || Object.keys(registrationData).length === 0) {
      return badRequest(res, "Provide all the required fields.", "register");
    }

    //User already logged in
    if (req.session && req.session.user) {
      return res.redirect("/projects");
    }

    //Data Validation
    try {
      registrationData = getValidatedUserInfo(registrationData);
    } catch (error) {
      logRegistrationError(error);
      return badRequest(res, error.message, "register");
    }

    //User Creation
    try {
      const userData = await createUser(registrationData);

      return res.redirect("/login");
    } catch (error) {
      logRegistrationError(error);

      const errorMessage = error.message.includes("ECONNREFUSED")
        ? "Database is not connected, try again!"
        : error.message;

      return res.status(500).render("register", getErrorMessage(errorMessage));
    }
  });

export default router;
