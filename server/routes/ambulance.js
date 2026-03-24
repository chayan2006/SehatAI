import { Router } from 'express';
import { query } from '../db.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);

// GET /api/ambulance — get requests visible to current user
router.get('/', async (req, res) => {
  try {
    let sql, params = [];
    if (req.user.role === 'patient') {
      sql = `SELECT ar.*, d_user.full_name AS doctor_name
             FROM ambulance_requests ar
             JOIN patients p ON p.id = ar.patient_id
             LEFT JOIN doctors d ON d.id = ar.requested_by_doctor
             LEFT JOIN users d_user ON d_user.id = d.user_id
             WHERE p.user_id = $1 ORDER BY ar.created_at DESC`;
      params = [req.user.id];
    } else {
      // Doctor / Admin sees all
      sql = `SELECT ar.*, p_user.full_name AS patient_name, d_user.full_name AS dispatched_by
             FROM ambulance_requests ar
             JOIN patients p ON p.id = ar.patient_id
             JOIN users p_user ON p_user.id = p.user_id
             LEFT JOIN doctors d ON d.id = ar.requested_by_doctor
             LEFT JOIN users d_user ON d_user.id = d.user_id
             ORDER BY CASE ar.priority WHEN 'critical' THEN 1 WHEN 'high' THEN 2 ELSE 3 END, ar.created_at DESC`;
    }
    const result = await query(sql, params);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/ambulance — book ambulance (patient or doctor)
router.post('/', async (req, res) => {
  const { pickup_address, destination, priority, patient_condition } = req.body;
  try {
    let patient_id;
    if (req.user.role === 'patient') {
      const pr = await query('SELECT id FROM patients WHERE user_id = $1', [req.user.id]);
      patient_id = pr.rows[0]?.id;
    } else {
      patient_id = req.body.patient_id;
    }
    if (!patient_id) return res.status(400).json({ error: 'patient_id required' });

    let doctor_id = null;
    if (req.user.role === 'doctor') {
      const dr = await query('SELECT id FROM doctors WHERE user_id = $1', [req.user.id]);
      doctor_id = dr.rows[0]?.id;
    }

    const result = await query(
      `INSERT INTO ambulance_requests (patient_id, requested_by_doctor, pickup_address, destination, priority, patient_condition, status)
       VALUES ($1,$2,$3,$4,$5,$6,'dispatched') RETURNING *`,
      [patient_id, doctor_id, pickup_address, destination, priority || 'standard', patient_condition]
    );

    // Notify admin
    const adminResult = await query("SELECT id FROM users WHERE role = 'admin' LIMIT 1");
    if (adminResult.rows[0]) {
      await query(
        `INSERT INTO notifications (recipient_id, sender_id, type, title, message)
         VALUES ($1,$2,'emergency','Ambulance Dispatched','A new ambulance has been dispatched. Priority: ${priority || 'standard'}.')`,
        [adminResult.rows[0].id, req.user.id]
      );
    }
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PATCH /api/ambulance/:id — update dispatch status
router.patch('/:id', async (req, res) => {
  const { status, eta_minutes, unit_id } = req.body;
  try {
    const result = await query(
      `UPDATE ambulance_requests
       SET status = COALESCE($1, status),
           eta_minutes = COALESCE($2, eta_minutes),
           unit_id = COALESCE($3, unit_id),
           resolved_at = CASE WHEN $1 = 'completed' THEN NOW() ELSE resolved_at END
       WHERE id = $4 RETURNING *`,
      [status, eta_minutes, unit_id, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;
