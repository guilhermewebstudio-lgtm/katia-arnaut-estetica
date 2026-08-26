const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { requireAdmin } = require('../middleware/auth');

router.use(requireAdmin);

router.get('/gestao', async (req, res) => {
  res.redirect('/gestao/marcacoes');
});

router.get('/gestao/marcacoes', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT b.*, s.name_pt, s.name_en,
              COALESCE(b.contact_name, u.name) AS user_name,
              COALESCE(b.contact_email, u.email) AS user_email,
              COALESCE(b.contact_phone, u.phone) AS user_phone
       FROM bookings b
       JOIN services s ON b.service_id = s.id
       JOIN users u ON b.user_id = u.id
       ORDER BY
         CASE b.status WHEN 'pending' THEN 0 ELSE 1 END,
         b.booking_date ASC, b.booking_time ASC`
    );
    res.render('admin/bookings', { bookings: result.rows, active: 'bookings' });
  } catch (err) {
    console.error('Erro ao carregar marcações (admin):', err);
    res.render('admin/bookings', { bookings: [], active: 'bookings' });
  }
});

router.post('/gestao/marcacoes/:id/status', async (req, res) => {
  const { status } = req.body;
  const allowed = ['pending', 'confirmed', 'declined', 'completed', 'cancelled'];
  if (!allowed.includes(status)) {
    return res.redirect('/gestao/marcacoes');
  }
  try {
    await pool.query('UPDATE bookings SET status = $1, updated_at = NOW() WHERE id = $2', [status, req.params.id]);
    res.redirect('/gestao/marcacoes');
  } catch (err) {
    console.error('Erro ao atualizar status:', err);
    res.redirect('/gestao/marcacoes');
  }
});

router.get('/gestao/tratamentos', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM services ORDER BY display_order ASC');
    res.render('admin/services', { services: result.rows, active: 'services' });
  } catch (err) {
    console.error('Erro ao carregar tratamentos (admin):', err);
    res.render('admin/services', { services: [], active: 'services' });
  }
});

router.post('/gestao/tratamentos', async (req, res) => {
  const { name_pt, name_en, description_pt, description_en, duration_minutes, price } = req.body;
  try {
    const maxOrder = await pool.query('SELECT COALESCE(MAX(display_order), -1) + 1 AS next FROM services');
    await pool.query(
      `INSERT INTO services (name_pt, name_en, description_pt, description_en, duration_minutes, price, display_order)
       VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [name_pt, name_en, description_pt, description_en, duration_minutes || 60, price || null, maxOrder.rows[0].next]
    );
    res.redirect('/gestao/tratamentos');
  } catch (err) {
    console.error('Erro ao criar tratamento:', err);
    res.redirect('/gestao/tratamentos');
  }
});

router.post('/gestao/tratamentos/:id', async (req, res) => {
  const { name_pt, name_en, description_pt, description_en, duration_minutes, price, active } = req.body;
  try {
    await pool.query(
      `UPDATE services SET name_pt=$1, name_en=$2, description_pt=$3, description_en=$4,
       duration_minutes=$5, price=$6, active=$7 WHERE id=$8`,
      [name_pt, name_en, description_pt, description_en, duration_minutes || 60, price || null, active === 'on', req.params.id]
    );
    res.redirect('/gestao/tratamentos');
  } catch (err) {
    console.error('Erro ao atualizar tratamento:', err);
    res.redirect('/gestao/tratamentos');
  }
});

router.post('/gestao/tratamentos/:id/eliminar', async (req, res) => {
  try {
    await pool.query('DELETE FROM services WHERE id = $1', [req.params.id]);
    res.redirect('/gestao/tratamentos');
  } catch (err) {
    console.error('Erro ao eliminar tratamento:', err);
    res.redirect('/gestao/tratamentos');
  }
});

router.get('/gestao/horario', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM business_hours ORDER BY day_of_week ASC');
    res.render('admin/hours', { hours: result.rows, active: 'hours' });
  } catch (err) {
    console.error('Erro ao carregar horário (admin):', err);
    res.render('admin/hours', { hours: [], active: 'hours' });
  }
});

router.post('/gestao/horario/:day', async (req, res) => {
  const { open_time, close_time, is_closed } = req.body;
  try {
    await pool.query(
      `UPDATE business_hours SET open_time=$1, close_time=$2, is_closed=$3 WHERE day_of_week=$4`,
      [is_closed === 'on' ? null : open_time, is_closed === 'on' ? null : close_time, is_closed === 'on', req.params.day]
    );
    res.redirect('/gestao/horario');
  } catch (err) {
    console.error('Erro ao atualizar horário:', err);
    res.redirect('/gestao/horario');
  }
});

router.get('/gestao/equipa', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM team_members ORDER BY display_order ASC');
    res.render('admin/team', { team: result.rows, active: 'team' });
  } catch (err) {
    console.error('Erro ao carregar equipa (admin):', err);
    res.render('admin/team', { team: [], active: 'team' });
  }
});

router.post('/gestao/equipa', async (req, res) => {
  const { name, role_pt, role_en, bio_pt, bio_en, photo_url } = req.body;
  try {
    const maxOrder = await pool.query('SELECT COALESCE(MAX(display_order), -1) + 1 AS next FROM team_members');
    await pool.query(
      `INSERT INTO team_members (name, role_pt, role_en, bio_pt, bio_en, photo_url, display_order)
       VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [name, role_pt, role_en, bio_pt, bio_en, photo_url || null, maxOrder.rows[0].next]
    );
    res.redirect('/gestao/equipa');
  } catch (err) {
    console.error('Erro ao adicionar membro da equipa:', err);
    res.redirect('/gestao/equipa');
  }
});

router.post('/gestao/equipa/:id', async (req, res) => {
  const { name, role_pt, role_en, bio_pt, bio_en, photo_url, active } = req.body;
  try {
    await pool.query(
      `UPDATE team_members SET name=$1, role_pt=$2, role_en=$3, bio_pt=$4, bio_en=$5, photo_url=$6, active=$7 WHERE id=$8`,
      [name, role_pt, role_en, bio_pt, bio_en, photo_url || null, active === 'on', req.params.id]
    );
    res.redirect('/gestao/equipa');
  } catch (err) {
    console.error('Erro ao atualizar membro da equipa:', err);
    res.redirect('/gestao/equipa');
  }
});

router.post('/gestao/equipa/:id/eliminar', async (req, res) => {
  try {
    await pool.query('DELETE FROM team_members WHERE id = $1', [req.params.id]);
    res.redirect('/gestao/equipa');
  } catch (err) {
    console.error('Erro ao eliminar membro da equipa:', err);
    res.redirect('/gestao/equipa');
  }
});

router.get('/gestao/sugestoes', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT s.*, u.name AS user_name, u.email AS user_email
       FROM suggestions s JOIN users u ON s.user_id = u.id
       ORDER BY s.created_at DESC`
    );
    res.render('admin/suggestions', { suggestions: result.rows, active: 'suggestions' });
  } catch (err) {
    console.error('Erro ao carregar sugestões:', err);
    res.render('admin/suggestions', { suggestions: [], active: 'suggestions' });
  }
});

router.post('/gestao/sugestoes/:id/responder', async (req, res) => {
  const { admin_response } = req.body;
  try {
    await pool.query(
      `UPDATE suggestions SET admin_response = $1, responded_at = NOW() WHERE id = $2`,
      [admin_response, req.params.id]
    );
    res.redirect('/gestao/sugestoes');
  } catch (err) {
    console.error('Erro ao responder sugestão:', err);
    res.redirect('/gestao/sugestoes');
  }
});

module.exports = router;
