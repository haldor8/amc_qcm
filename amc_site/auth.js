function ensureAuthenticated(req, res, next) {
    if (req.session && req.session.user) {
      return next();
    }
    console.log("Utilisateur non connecté. Session =", req.session);
    res.status(401).send("Non authentifié");
  }
  
  module.exports = { ensureAuthenticated };
  