const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { requireAuth } = require('../middleware/auth');

router.get('/sugestoes', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM suggestions WHERE user_id = $1 ORDER BY created_at DESC',
      [req.session.userId]
    );
    res.render('suggestions', { suggestions: result.rows, success: false });
  } catch (err) {
    console.error('Erro ao carregar sugestões:', err);
    res.render('suggestions', { suggestions: [], success: false });
  }
});

router.post('/sugestoes', requireAuth, async (req, res) => {
  const { message } = req.body;
  try {
    if (message && message.trim()) {
      await pool.query('INSERT INTO suggestions (user_id, message) VALUES ($1, $2)', [req.session.userId, message.trim()]);
    }
    const result = await pool.query(
      'SELECT * FROM suggestions WHERE user_id = $1 ORDER BY created_at DESC',
      [req.session.userId]
    );
    res.render('suggestions', { suggestions: result.rows, success: true });
  } catch (err) {
    console.error('Erro ao enviar sugestão:', err);
    const result = await pool.query(
      'SELECT * FROM suggestions WHERE user_id = $1 ORDER BY created_at DESC',
      [req.session.userId]
    );
    res.render('suggestions', { suggestions: result.rows, success: false });
  }
});

module.exports = router;
