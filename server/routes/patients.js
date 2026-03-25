import { Router } from 'express';
import { query } from '../db.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);

// GET /api/patients/me — patient's own profile
router.get('/me', requireRole('patient'), async (req, res) => {
  try {
    const result = await query(
      `SELECT p.*, u.full_name, u.email, u.phone, u.avatar_url
       FROM patients p JOIN users u ON u.id = p.user_id
       WHERE u.id = $1`, [req.user.id]
    );
    res.json(result.rows[0] || null);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/patients — doctor/admin gets all patients
router.get('/', requireRole('doctor', 'admin'), async (req, res) => {
  try {
    const { search, limit = 50, offset = 0 } = req.query;
    let sql = `SELECT p.id, u.full_name, u.email, u.phone,
                 p.date_of_birth, p.blood_type, p.chronic_conditions, p.allergies
               FROM patients p JOIN users u ON u.id = p.user_id
               WHERE u.is_active = true`;
    const params = [];
    if (search) {
      params.push(`%${search}%`);
      sql += ` AND (u.full_name ILIKE $${params.length} OR u.email ILIKE $${params.length})`;
    }
    params.push(Number(limit), Number(offset));
    sql += ` ORDER BY u.full_name LIMIT $${params.length - 1} OFFSET $${params.length}`;
    const result = await query(sql, params);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/patients/:id — doctor/admin gets patient detail
router.get('/:id', requireRole('doctor', 'admin'), async (req, res) => {
  try {
    const result = await query(
      `SELECT p.*, u.full_name, u.email, u.phone FROM patients p
       JOIN users u ON u.id = p.user_id WHERE p.id = $1`, [req.params.id]
    );
    res.json(result.rows[0] || null);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/patients/:id/vitals — latest vitals
router.get('/:id/vitals', async (req, res) => {
  try {
    const result = await query(
      `SELECT * FROM vitals WHERE patient_id = $1 ORDER BY recorded_at DESC LIMIT 50`,
      [req.params.id]
    );
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/patients/:id/vitals — log new vitals reading
router.post('/:id/vitals', async (req, res) => {
  const { heart_rate, blood_pressure_systolic, blood_pressure_diastolic, spo2, temperature_c, steps, source } = req.body;
  try {
    const result = await query(
      `INSERT INTO vitals (patient_id, heart_rate, blood_pressure_systolic, blood_pressure_diastolic, spo2, temperature_c, steps, source)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [req.params.id, heart_rate, blood_pressure_systolic, blood_pressure_diastolic, spo2, temperature_c, steps, source || 'manual']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/patients/:id/medications
router.get('/:id/medications', async (req, res) => {
  try {
    const result = await query(
      `SELECT m.*, u.full_name AS doctor_name FROM medications m
       LEFT JOIN doctors d ON d.id = m.prescribed_by
       LEFT JOIN users u ON u.id = d.user_id
       WHERE m.patient_id = $1 AND m.is_active = true ORDER BY m.created_at DESC`,
      [req.params.id]
    );
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/patients/:id/medication-log — mark medication taken/missed
router.post('/:id/medication-log', requireRole('patient'), async (req, res) => {
  const { medication_id, status } = req.body;
  try {
    const result = await query(
      `INSERT INTO medication_logs (medication_id, patient_id, status) VALUES ($1, $2, $3) RETURNING *`,
      [medication_id, req.params.id, status || 'taken']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/patients/:id/lab-results
router.get('/:id/lab-results', async (req, res) => {
  try {
    const result = await query(
      `SELECT lr.*, u.full_name AS ordered_by_name FROM lab_results lr
       LEFT JOIN users u ON u.id = lr.ordered_by
       WHERE lr.patient_id = $1 ORDER BY lr.result_date DESC`,
      [req.params.id]
    );
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/patients/:id/nutrition — nutrition logs
router.get('/:id/nutrition', requireRole('patient', 'doctor'), async (req, res) => {
  try {
    const result = await query(
      `SELECT * FROM nutrition_logs WHERE patient_id = $1 ORDER BY logged_at DESC LIMIT 30`,
      [req.params.id]
    );
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/patients/:id/nutrition — log meal
router.post('/:id/nutrition', requireRole('patient'), async (req, res) => {
  const { meal_description, calories, protein_g, carbs_g, fat_g } = req.body;
  try {
    const result = await query(
      `INSERT INTO nutrition_logs (patient_id, meal_description, calories, protein_g, carbs_g, fat_g)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [req.params.id, meal_description, calories, protein_g, carbs_g, fat_g]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;
