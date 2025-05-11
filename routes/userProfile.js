import { Router } from "express";
import { badRequest, getValidatedUserInfo } from "../utils/authHelpers.js";
import { updateUserDetails } from "../data/users.js";
import { initSession } from "../utils/sessionManager.js";

const router = Router();

router
  .route("/")
  .get((req, res) => {
    res.render("profile", { ...req.session.user });
  })
  .post(async (req, res) => {
    let registrationData = req.body;
    console.log("Profile data: ", registrationData);

    //make sure there is something present in the req.body
    if (!registrationData || Object.keys(registrationData).length === 0) {
      return badRequest(res, "Provide all the required fields.", "profile");
    }

    //Data Validation
    try {
        registrationData = getValidatedUserInfo(registrationData, true);
      } catch (e) {
        console.log("Error: ", e.message);
        return badRequest(res, e.message, "profile");
      }
  
      //User Creation
      try {
        const userData = await updateUserDetails(registrationData, req.session.user.email);
        console.log("User data: ", userData);

        //Re-init Session data after user profile update.
        initSession(req, userData);
  
        return res.render("profile", { ...req.session.user});
      } catch (e) {
        console.log("Error: ", e);
        return res.status(500).render("profile", getErrorMessage(e.message));
      }
  });

export default router;
