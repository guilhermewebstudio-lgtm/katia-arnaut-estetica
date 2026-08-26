require('dotenv').config();
const express = require('express');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const path = require('path');

const pool = require('./config/db');
const initDb = require('./config/init-db');
const langMiddleware = require('./middleware/lang');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('trust proxy', 1);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  store: new pgSession({ pool, tableName: 'session' }),
  secret: process.env.SESSION_SECRET || 'katia-arnaut-fallback-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 30,
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax'
  }
}));

app.use(langMiddleware);

// Expose session/user info to all views
app.use((req, res, next) => {
  res.locals.session = req.session;
  res.locals.currentPath = req.path;
  next();
});

app.use('/', require('./routes/pages'));
app.use('/', require('./routes/auth'));
app.use('/', require('./routes/bookings'));
app.use('/', require('./routes/suggestions'));
app.use('/', require('./routes/admin'));
app.use('/', require('./routes/chatbot'));

app.use((req, res) => {
  res.status(404).render('404', {});
});

app.use((err, req, res, next) => {
  console.error('Erro não tratado:', err);
  res.status(500).render('error', { message: 'Ocorreu um erro. Tente novamente.', lang: req.lang || 'pt' });
});

async function start() {
  try {
    await initDb();
    console.log('Base de dados pronta.');
  } catch (err) {
    console.error('Falha ao inicializar base de dados:', err);
  }
  app.listen(PORT, () => {
    console.log(`Servidor a correr na porta ${PORT}`);
  });
}

start();
