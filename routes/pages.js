const express = require('express');
const router = express.Router();
const pool = require('../config/db');

router.get('/', async (req, res) => {
  try {
    const servicesResult = await pool.query('SELECT * FROM services WHERE active = TRUE ORDER BY display_order ASC LIMIT 6');
    const teamResult = await pool.query('SELECT * FROM team_members WHERE active = TRUE ORDER BY display_order ASC');
    const hoursResult = await pool.query('SELECT * FROM business_hours ORDER BY day_of_week ASC');
    res.render('index', {
      services: servicesResult.rows,
      team: teamResult.rows,
      hours: hoursResult.rows
    });
  } catch (err) {
    console.error('Erro ao carregar página inicial:', err);
    res.render('index', { services: [], team: [], hours: [] });
  }
});

router.post('/lang/:lang', (req, res) => {
  const lang = req.params.lang === 'en' ? 'en' : 'pt';
  res.cookie('lang', lang, { maxAge: 1000 * 60 * 60 * 24 * 365, httpOnly: false });
  res.redirect(req.get('Referer') || '/');
});

module.exports = router;
