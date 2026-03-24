import { Router } from 'express';
import { query } from '../db.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);

// GET /api/appointments — fetch user's appointments
router.get('/', async (req, res) => {
  try {
    let sql, params;
    if (req.user.role === 'patient') {
      sql = `SELECT a.*, d_user.full_name AS doctor_name, doc.specialization, doc.department
             FROM appointments a
             JOIN doctors doc ON doc.id = a.doctor_id
             JOIN users d_user ON d_user.id = doc.user_id
             JOIN patients p ON p.id = a.patient_id
             WHERE p.user_id = $1 ORDER BY a.scheduled_at DESC`;
      params = [req.user.id];
    } else if (req.user.role === 'doctor') {
      sql = `SELECT a.*, p_user.full_name AS patient_name, pat.blood_type, pat.date_of_birth
             FROM appointments a
             JOIN patients pat ON pat.id = a.patient_id
             JOIN users p_user ON p_user.id = pat.user_id
             JOIN doctors doc ON doc.id = a.doctor_id
             WHERE doc.user_id = $1 ORDER BY a.scheduled_at ASC`;
      params = [req.user.id];
    } else {
      // Admin: all appointments
      sql = `SELECT a.*, p_user.full_name AS patient_name, d_user.full_name AS doctor_name
             FROM appointments a
             JOIN patients pat ON pat.id = a.patient_id
             JOIN users p_user ON p_user.id = pat.user_id
             JOIN doctors doc ON doc.id = a.doctor_id
             JOIN users d_user ON d_user.id = doc.user_id
             ORDER BY a.scheduled_at DESC LIMIT 100`;
      params = [];
    }
    const result = await query(sql, params);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/appointments — patient books appointment
router.post('/', async (req, res) => {
  const { doctor_id, scheduled_at, type, location, notes, duration_mins } = req.body;
  if (!doctor_id || !scheduled_at) {
    return res.status(400).json({ error: 'doctor_id and scheduled_at are required' });
  }
  try {
    // Get patient_id from user
    const patResult = await query('SELECT id FROM patients WHERE user_id = $1', [req.user.id]);
    if (!patResult.rows[0]) return res.status(404).json({ error: 'Patient profile not found' });
    const patient_id = patResult.rows[0].id;

    const result = await query(
      `INSERT INTO appointments (patient_id, doctor_id, scheduled_at, type, location, notes, duration_mins)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [patient_id, doctor_id, scheduled_at, type || 'checkup', location, notes, duration_mins || 30]
    );

    // Notify the doctor
    const docResult = await query('SELECT user_id FROM doctors WHERE id = $1', [doctor_id]);
    if (docResult.rows[0]) {
      await query(
        `INSERT INTO notifications (recipient_id, sender_id, type, title, message)
         VALUES ($1, $2, 'appointment', 'New Appointment Booked', 'A patient has booked an appointment with you.')`,
        [docResult.rows[0].user_id, req.user.id]
      );
    }
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PATCH /api/appointments/:id — update status (confirm, cancel, reschedule)
router.patch('/:id', async (req, res) => {
  const { status, scheduled_at, notes } = req.body;
  try {
    const fields = [];
    const params = [];
    if (status)       { params.push(status);       fields.push(`status = $${params.length}`); }
    if (scheduled_at) { params.push(scheduled_at); fields.push(`scheduled_at = $${params.length}`); }
    if (notes)        { params.push(notes);        fields.push(`notes = $${params.length}`); }
    if (!fields.length) return res.status(400).json({ error: 'Nothing to update' });

    params.push(req.params.id);
    const result = await query(
      `UPDATE appointments SET ${fields.join(', ')} WHERE id = $${params.length} RETURNING *`,
      params
    );
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/appointments/available-doctors — get doctors for booking
router.get('/available-doctors', async (req, res) => {
  try {
    const result = await query(
      `SELECT doc.id, u.full_name, doc.specialization, doc.department, doc.is_available
       FROM doctors doc JOIN users u ON u.id = doc.user_id
       WHERE doc.is_available = true ORDER BY doc.specialization`
    );
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;
