function initSession(req, data, remember = false) {
  if (!req.session || !data) return;

  req.session.user = data;
  req.session.lastActivity = Date.now();

  const thirtyMinutes = 30 * 60 * 1000;
  const sixtyMinutes = 60 * 60 * 1000;

  req.session.duration = remember ? sixtyMinutes : thirtyMinutes;
}

function destroySession(req) {
  if (!req.session) return;

  req.session.destroy();
}

export { initSession, destroySession };
