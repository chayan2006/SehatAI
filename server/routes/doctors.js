import { Router } from 'express';
import { query } from '../db.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();
router.use(authenticate, requireRole('doctor', 'admin'));

// GET /api/doctors — list all doctors (for admin)
router.get('/', async (req, res) => {
  try {
    const result = await query(
      `SELECT doc.id, u.full_name, u.email, u.phone, doc.specialization,
              doc.department, doc.shift, doc.is_available, w.name AS ward_name
       FROM doctors doc
       JOIN users u ON u.id = doc.user_id
       LEFT JOIN wards w ON w.id = doc.ward_id
       ORDER BY doc.department, u.full_name`
    );
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/doctors/me — doctor's own profile
router.get('/me', requireRole('doctor'), async (req, res) => {
  try {
    const result = await query(
      `SELECT doc.*, u.full_name, u.email, u.phone, w.name AS ward_name
       FROM doctors doc
       JOIN users u ON u.id = doc.user_id
       LEFT JOIN wards w ON w.id = doc.ward_id
       WHERE doc.user_id = $1`, [req.user.id]
    );
    res.json(result.rows[0] || null);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/doctors/wards — all ward data
router.get('/wards', async (req, res) => {
  try {
    const result = await query('SELECT * FROM wards ORDER BY type, name');
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/doctors/wards/:id/beds — beds for a specific ward
router.get('/wards/:id/beds', async (req, res) => {
  try {
    const result = await query(
      `SELECT b.*, p_user.full_name AS patient_name
       FROM beds b
       LEFT JOIN patients p ON p.id = b.patient_id
       LEFT JOIN users p_user ON p_user.id = p.user_id
       WHERE b.ward_id = $1 ORDER BY b.bed_number`, [req.params.id]
    );
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PATCH /api/doctors/beds/:id — update bed status
router.patch('/beds/:id', async (req, res) => {
  const { status, patient_id } = req.body;
  try {
    const result = await query(
      `UPDATE beds SET status = COALESCE($1, status), patient_id = $2, updated_at = NOW()
       WHERE id = $3 RETURNING *`,
      [status, patient_id || null, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/doctors/triage — all triage cases
router.get('/triage', async (req, res) => {
  try {
    const result = await query(
      `SELECT t.*, p_user.full_name AS patient_name, d_user.full_name AS doctor_name
       FROM triage_cases t
       JOIN patients p ON p.id = t.patient_id
       JOIN users p_user ON p_user.id = p.user_id
       LEFT JOIN doctors d ON d.id = t.assigned_doctor_id
       LEFT JOIN users d_user ON d_user.id = d.user_id
       WHERE t.status != 'discharged'
       ORDER BY CASE t.priority WHEN 'critical' THEN 1 WHEN 'urgent' THEN 2 WHEN 'moderate' THEN 3 ELSE 4 END, t.arrived_at`
    );
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/doctors/triage — add triage case
router.post('/triage', async (req, res) => {
  const { patient_id, chief_complaint, priority } = req.body;
  try {
    // Get doctor id from user
    const docResult = await query('SELECT id FROM doctors WHERE user_id = $1', [req.user.id]);
    const result = await query(
      `INSERT INTO triage_cases (patient_id, assigned_doctor_id, chief_complaint, priority)
       VALUES ($1,$2,$3,$4) RETURNING *`,
      [patient_id, docResult.rows[0]?.id, chief_complaint, priority || 'moderate']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PATCH /api/doctors/triage/:id — update triage status
router.patch('/triage/:id', async (req, res) => {
  const { status } = req.body;
  try {
    const result = await query(
      `UPDATE triage_cases SET status = $1, seen_at = CASE WHEN $1 = 'in-progress' THEN NOW() ELSE seen_at END
       WHERE id = $2 RETURNING *`,
      [status, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/doctors/consultations — save SOAP note
router.post('/consultations', requireRole('doctor'), async (req, res) => {
  const { appointment_id, patient_id, soap_subjective, soap_objective, soap_assessment, soap_plan, transcript_text } = req.body;
  try {
    const docResult = await query('SELECT id FROM doctors WHERE user_id = $1', [req.user.id]);
    const result = await query(
      `INSERT INTO consultations (appointment_id, doctor_id, patient_id, soap_subjective, soap_objective, soap_assessment, soap_plan, transcript_text)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [appointment_id, docResult.rows[0].id, patient_id, soap_subjective, soap_objective, soap_assessment, soap_plan, transcript_text]
    );
    // Mark appointment completed
    if (appointment_id) {
      await query(`UPDATE appointments SET status = 'completed' WHERE id = $1`, [appointment_id]);
    }
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/doctors/prescriptions — prescribe medication
router.post('/prescriptions', requireRole('doctor'), async (req, res) => {
  const { consultation_id, patient_id, name, dosage, frequency, start_date, end_date, notes } = req.body;
  try {
    const docResult = await query('SELECT id FROM doctors WHERE user_id = $1', [req.user.id]);
    const result = await query(
      `INSERT INTO medications (patient_id, prescribed_by, consultation_id, name, dosage, frequency, start_date, end_date, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [patient_id, docResult.rows[0].id, consultation_id, name, dosage, frequency, start_date, end_date, notes]
    );
    // Also create a pharmacy order
    await query(
      `INSERT INTO pharmacy_orders (medication_id, patient_id, medication_name, dosage, quantity)
       VALUES ($1,$2,$3,$4,$5)`,
      [result.rows[0].id, patient_id, name, dosage, 1]
    );
    // Notify patient
    const patResult = await query('SELECT user_id FROM patients WHERE id = $1', [patient_id]);
    if (patResult.rows[0]) {
      await query(
        `INSERT INTO notifications (recipient_id, sender_id, type, title, message)
         VALUES ($1,$2,'medication','New Prescription','Dr. ${req.user.full_name} has prescribed ${name} for you.')`,
        [patResult.rows[0].user_id, req.user.id]
      );
    }
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/doctors/pharmacy — pharmacy orders (for pharmacy tab)
router.get('/pharmacy', async (req, res) => {
  try {
    const result = await query(
      `SELECT po.*, p_user.full_name AS patient_name
       FROM pharmacy_orders po
       JOIN patients p ON p.id = po.patient_id
       JOIN users p_user ON p_user.id = p.user_id
       WHERE po.status != 'dispensed' ORDER BY po.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PATCH /api/doctors/pharmacy/:id — dispense order
router.patch('/pharmacy/:id', async (req, res) => {
  try {
    const result = await query(
      `UPDATE pharmacy_orders SET status = 'dispensed', dispensed_at = NOW()
       WHERE id = $1 RETURNING *`, [req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/doctors/billing — billing records
router.get('/billing', async (req, res) => {
  try {
    const result = await query(
      `SELECT b.*, p_user.full_name AS patient_name, d_user.full_name AS doctor_name
       FROM billing b
       JOIN patients p ON p.id = b.patient_id
       JOIN users p_user ON p_user.id = p.user_id
       LEFT JOIN doctors d ON d.id = b.doctor_id
       LEFT JOIN users d_user ON d_user.id = d.user_id
       ORDER BY b.issued_at DESC LIMIT 100`
    );
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;
