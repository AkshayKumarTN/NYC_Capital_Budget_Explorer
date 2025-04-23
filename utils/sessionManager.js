function initSession(req, data) {
  if (!req.session || !data) return;

  req.session.user = data;
  req.session.lastActivity = Date.now();
}

function destroySession(req) {
  if (!req.session) return;

  req.session.destroy();
}

export { initSession, destroySession };
