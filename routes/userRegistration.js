import { Router } from "express";
import { badRequest, getValidatedUserInfo } from "../utils/authHelpers.js";
import { createUser } from "../data/index.js";


const router = Router();

router.route("/")
.get((req, res) => {
    res.render("register");
})
.post(async (req, res) => {
    let registrationData = req.body;
    console.log("Registration data: ", registrationData);

    //make sure there is something present in the req.body
    if (!registrationData || Object.keys(registrationData).length === 0) {
        return badRequest(res, "Provide all the required fields.", "register");
    }

    //Data Validation
    try {
        registrationData = getValidatedUserInfo(registrationData);
    }catch(e) {
        console.log("Error: ", e);
        return badRequest(res, e.message, "register");
    }
    
    //User Creation
    try {
        const userData = await createUser(registrationData);
        console.log("User data: ", userData);
        return res.render("home", { userData });
    }catch(e) {
        console.log("Error: ", e);
        return res.status(500).render("register", getErrorMessage(e.message));
    }
});


export default router;