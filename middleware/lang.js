const translations = require('../utils/translations');

function langMiddleware(req, res, next) {
  let lang = req.cookies.lang;
  if (!lang || (lang !== 'pt' && lang !== 'en')) {
    lang = 'pt';
  }
  req.lang = lang;
  res.locals.lang = lang;
  res.locals.t = translations[lang];
  next();
}

module.exports = langMiddleware;
