export function logRequest(req, res, next) {
  const timestamp = new Date().toUTCString();
  const method = req.method;
  const path = req.path;
  const isLoggedIn = req.session.user ? "Authenticated" : "Not Authenticated";

  const userRole = req.session.user ? req.session.user.role : "";

  console.log(`[${timestamp}]: ${method} ${path} (${isLoggedIn} ${userRole})`);
  next();
}
