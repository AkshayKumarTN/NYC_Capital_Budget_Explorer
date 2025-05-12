import { getErrorMessage } from "../utils/helpers.js";
import { destroySession } from "../utils/sessionManager.js";

function requireLogin(req, res, next) {
  const publicPaths = ["/", "/login", "/signup", "/forgot-password", "/verify-reset-code"];
  if (publicPaths.includes(req.path)) return next();
  if (req.session && req.session.user) return next();

  req.session.error = "You must be logged in to view that page.";
  return res.redirect("/login");
}

function idleTime(req, res, next) {
  if (!req.session || !req.session.user) return next();

  const now = Date.now();
  const last = req.session.lastActivity || now;

  const duration = req.session.duration;

  const timeLapse = now - last;

  if (timeLapse > duration) {
    destroySession(req);

    return res.redirect(
      "/login",
      getErrorMessage("You have been logged out due to inactivity.")
    );
  }

  req.session.lastActivity = now;
  next();
}

function authRedirect(req, res, next) {
  if (!req.session.user) return next();
  
  return res.redirect(`/projects`);
}

function signoutAuth(req, res, next) {
  if (!req.session.user) return res.redirect("/login");
  return next();
}

export { requireLogin, idleTime, authRedirect, signoutAuth };
