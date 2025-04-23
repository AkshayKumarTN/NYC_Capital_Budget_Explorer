import { destroySession } from "../utils/sessionManager.js";

function requireLogin(req, res, next) {
  if (req.session && req.session.user) return next();
  return res.redirect("/login", {
    error: "You must be logged in to view other pages.",
  });
}

function idleTime(req, res, next) {
  if (!req.session || !req.session.user) return next();

  const now = Date.now();
  const last = req.session.lastActivity || now;

  const sixtyMinutes = 60 * 60 * 1000;

  const timeLapse = now - last;

  if (timeLapse > sixtyMinutes) {
    destroySession(req);

    return res.redirect("/login", {
      error: "Session expired. Please log in again.",
    });
  }

  req.session.lastActivity = now;
  next();
}

export { requireLogin, idleTime };
