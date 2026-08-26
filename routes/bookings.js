const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { requireAuth } = require('../middleware/auth');

router.get('/marcar', requireAuth, async (req, res) => {
  try {
    const services = await pool.query('SELECT * FROM services WHERE active = TRUE ORDER BY display_order ASC');
    const userResult = await pool.query('SELECT name, email, phone FROM users WHERE id = $1', [req.session.userId]);
    res.render('booking', {
      services: services.rows,
      success: false,
      error: null,
      user: userResult.rows[0] || {}
    });
  } catch (err) {
    console.error('Erro ao carregar tratamentos:', err);
    res.render('booking', { services: [], success: false, error: 'Erro ao carregar tratamentos.', user: {} });
  }
});

router.post('/marcar', requireAuth, async (req, res) => {
  const { service_id, booking_date, booking_time, notes, full_name, email, phone } = req.body;
  try {
    await pool.query(
      `INSERT INTO bookings (user_id, service_id, booking_date, booking_time, notes, status, contact_name, contact_email, contact_phone)
       VALUES ($1,$2,$3,$4,$5,'pending',$6,$7,$8)`,
      [req.session.userId, service_id, booking_date, booking_time, notes || null, full_name || null, email || null, phone || null]
    );
    const services = await pool.query('SELECT * FROM services WHERE active = TRUE ORDER BY display_order ASC');
    const userResult = await pool.query('SELECT name, email, phone FROM users WHERE id = $1', [req.session.userId]);
    res.render('booking', { services: services.rows, success: true, error: null, user: userResult.rows[0] || {} });
  } catch (err) {
    console.error('Erro ao criar marcação:', err);
    const services = await pool.query('SELECT * FROM services WHERE active = TRUE ORDER BY display_order ASC');
    const userResult = await pool.query('SELECT name, email, phone FROM users WHERE id = $1', [req.session.userId]);
    res.render('booking', { services: services.rows, success: false, error: 'Não foi possível criar a marcação.', user: userResult.rows[0] || {} });
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
