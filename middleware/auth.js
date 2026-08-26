function requireAuth(req, res, next) {
  if (!req.session.userId) {
    return res.redirect('/login');
  }
  next();
}

function requireAdmin(req, res, next) {
  if (!req.session.userId || !req.session.isAdmin) {
    return res.status(403).render('error', {
      message: req.lang === 'en' ? 'Access denied.' : 'Acesso negado.',
      lang: req.lang || 'pt'
    });
  }
  next();
}

function redirectIfAuth(req, res, next) {
  if (req.session.userId) {
    return res.redirect('/');
  }
  next();
}

module.exports = { requireAuth, requireAdmin, redirectIfAuth };
