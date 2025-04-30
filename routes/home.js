import { Router } from "express";
import { destroySession } from "../utils/sessionManager.js";


const router = Router();


router.route('/').get(async (req, res) => { 
        res.render('home');
    });

router.route("/logout")
.post(async (req, res) => {
    destroySession(req);
    return res.redirect("/");
});

export default router;