import { Router } from "express";
import { validateAndReturnString } from "../utils/helpers.js";
import { isValidEmail, badRequest, getValidatedUserCredentials } from "../utils/authHelpers.js";
import { userLogin } from "../data/index.js";
import { getErrorMessage } from "../utils/helpers.js";

const router = Router();

router
  .route("/")
  .get((req, res) => {
    res.render("login");
  })
  .post(async (req, res) => {
    let loginData = req.body;
    console.log("Login data: ", loginData);
    
    //make sure there is something present in the req.body
    if (!loginData || Object.keys(loginData).length === 0) 
        return badRequest(res, "The email and password field cannot be empty.", "login");

    const { userEmail, userPassword } = getValidatedUserCredentials(
      loginData.email,
      loginData.password
    );

    //check if the email is valid
    if (!isValidEmail(userEmail)) 
        return badRequest(res, "Please enter a valid email.", "login");

    //call your data layer here
    try {
      const userData = await userLogin(userEmail, userPassword);
      return res.render("projects", { userData });
    } catch (e) {
      return res.status(401).render("login", getErrorMessage(`Either user email or password is incorrect. Please try again.`));
    }
  });

export default router;
