const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { requireAuth } = require('../middleware/auth');

router.get('/marcar', requireAuth, async (req, res) => {
  try {
    const services = await pool.query('SELECT * FROM services WHERE active = TRUE ORDER BY display_order ASC');
    res.render('booking', { services: services.rows, success: false, error: null });
  } catch (err) {
    console.error('Erro ao carregar tratamentos:', err);
    res.render('booking', { services: [], success: false, error: 'Erro ao carregar tratamentos.' });
  }
});

router.post('/marcar', requireAuth, async (req, res) => {
  const { service_id, booking_date, booking_time, notes } = req.body;
  try {
    await pool.query(
      `INSERT INTO bookings (user_id, service_id, booking_date, booking_time, notes, status)
       VALUES ($1,$2,$3,$4,$5,'pending')`,
      [req.session.userId, service_id, booking_date, booking_time, notes || null]
    );
    const services = await pool.query('SELECT * FROM services WHERE active = TRUE ORDER BY display_order ASC');
    res.render('booking', { services: services.rows, success: true, error: null });
  } catch (err) {
    console.error('Erro ao criar marcação:', err);
    const services = await pool.query('SELECT * FROM services WHERE active = TRUE ORDER BY display_order ASC');
    res.render('booking', { services: services.rows, success: false, error: 'Não foi possível criar a marcação.' });
  }
});

router.get('/as-minhas-marcacoes', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT b.*, s.name_pt, s.name_en, s.price
       FROM bookings b
       JOIN services s ON b.service_id = s.id
       WHERE b.user_id = $1
       ORDER BY b.booking_date DESC, b.booking_time DESC`,
      [req.session.userId]
    );
    res.render('my-bookings', { bookings: result.rows });
  } catch (err) {
    console.error('Erro ao carregar marcações:', err);
    res.render('my-bookings', { bookings: [] });
  }
});

router.post('/marcacoes/:id/cancelar', requireAuth, async (req, res) => {
  try {
    await pool.query(
      `UPDATE bookings SET status = 'cancelled', updated_at = NOW() WHERE id = $1 AND user_id = $2`,
      [req.params.id, req.session.userId]
    );
    res.redirect('/as-minhas-marcacoes');
  } catch (err) {
    console.error('Erro ao cancelar marcação:', err);
    res.redirect('/as-minhas-marcacoes');
  }
});

module.exports = router;
