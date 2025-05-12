import { Router } from "express";
import { destroySession } from "../utils/sessionManager.js";

const router = Router();

router.route("/").get(async (req, res) => {
  res.render("home", { user: req.session.user });
});

router.route("/logout").get(async (req, res) => {
  destroySession(req);
  return res.redirect("/");
});

export default router;
