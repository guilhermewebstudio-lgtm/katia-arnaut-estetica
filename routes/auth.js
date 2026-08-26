const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const pool = require('../config/db');
const { redirectIfAuth } = require('../middleware/auth');

router.get('/login', redirectIfAuth, (req, res) => {
  res.render('login', { error: null });
});

router.post('/login', redirectIfAuth, async (req, res) => {
  const { email, password } = req.body;
  const t = res.locals.t;
  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [(email || '').toLowerCase().trim()]);
    const user = result.rows[0];
    if (!user) {
      return res.render('login', { error: t.login_error });
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.render('login', { error: t.login_error });
    }

    // Admin promotion pattern
    const adminEmail = (process.env.ADMIN_EMAIL || '').toLowerCase().trim();
    if (adminEmail && user.email === adminEmail && !user.is_admin) {
      await pool.query('UPDATE users SET is_admin = TRUE WHERE id = $1', [user.id]);
      user.is_admin = true;
    }

    req.session.userId = user.id;
    req.session.userName = user.name;
    req.session.isAdmin = user.is_admin;
    res.redirect('/');
  } catch (err) {
    console.error('Erro no login:', err);
    res.render('login', { error: t.login_error });
  }
});

router.get('/register', redirectIfAuth, (req, res) => {
  res.render('register', { error: null });
});

router.post('/register', redirectIfAuth, async (req, res) => {
  const { name, email, phone, password } = req.body;
  const t = res.locals.t;
  try {
    const normalizedEmail = (email || '').toLowerCase().trim();
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [normalizedEmail]);
    if (existing.rows.length > 0) {
      return res.render('register', { error: t.register_error_exists });
    }
    const hash = await bcrypt.hash(password, 10);
    const adminEmail = (process.env.ADMIN_EMAIL || '').toLowerCase().trim();
    const isAdmin = adminEmail && normalizedEmail === adminEmail;

    const result = await pool.query(
      'INSERT INTO users (name, email, phone, password, is_admin) VALUES ($1,$2,$3,$4,$5) RETURNING id, name, is_admin',
      [name.trim(), normalizedEmail, phone ? phone.trim() : null, hash, isAdmin]
    );
    const user = result.rows[0];
    req.session.userId = user.id;
    req.session.userName = user.name;
    req.session.isAdmin = user.is_admin;
    res.redirect('/');
  } catch (err) {
    console.error('Erro no registo:', err);
    res.render('register', { error: t.register_error_generic });
  }
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

module.exports = router;
