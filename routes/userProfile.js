import { Router } from "express";
import { badRequest, getValidatedUserInfo } from "../utils/authHelpers.js";
import { updateUserDetails } from "../data/users.js";
import { initSession } from "../utils/sessionManager.js";

function logProfileError(error)
{
    console.log("Error: ", error.message);
}

const router = Router();

router
  .route("/")
  .get((req, res) => {
    res.render("profile", { ...req.session.user });
  })
  .post(async (req, res) => {
    let registrationData = req.body;

    //make sure there is something present in the req.body
    if (!registrationData || Object.keys(registrationData).length === 0) {
      return badRequest(res, "Provide all the required fields.", "profile");
    }

    //Data Validation
    try {
        registrationData = getValidatedUserInfo(registrationData, true);
      } catch (error) {
        logProfileError(error);
        return badRequest(res, error.message, "profile");
      }
  
      //User Creation
      try {
        const userData = await updateUserDetails(registrationData, req.session.user.email);

        //Re-init Session data after user profile update.
        initSession(req, userData);
  
        return res.render("profile", { ...req.session.user});
      } catch (error) {
        logProfileError(error);
        return res.status(500).render("profile", getErrorMessage(error.message));
      }
  });

export default router;
