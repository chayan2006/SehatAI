import { Router } from 'express';
import { query } from '../db.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();
router.use(authenticate, requireRole('admin'));

// GET /api/admin/stats — real system dashboard metrics
router.get('/stats', async (req, res) => {
  try {
    const [patients, emergencies, activeEscalations, criticalEscalations, bedsAvailable, totalDocs] = await Promise.all([
      query('SELECT COUNT(*) FROM patients'),
      query("SELECT COUNT(*) FROM triage_cases WHERE status = 'in-progress'"),
      query("SELECT COUNT(*) FROM escalations WHERE status = 'active'"),
      query("SELECT COUNT(*) FROM escalations WHERE status = 'active' AND severity = 'critical'"),
      query("SELECT SUM(available_beds) FROM wards"),
      query("SELECT COUNT(*) FROM doctors WHERE is_available = true"),
    ]);
    res.json({
      totalPatients:        parseInt(patients.rows[0].count),
      activeEmergencies:    parseInt(emergencies.rows[0].count),
      activeEscalations:    parseInt(activeEscalations.rows[0].count),
      criticalEscalations:  parseInt(criticalEscalations.rows[0].count),
      availableBeds:        parseInt(bedsAvailable.rows[0].sum || 0),
      availableDoctors:     parseInt(totalDocs.rows[0].count),
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/admin/escalations
router.get('/escalations', async (req, res) => {
  try {
    const result = await query(
      `SELECT e.*, p_user.full_name AS patient_name, r_user.full_name AS resolved_by_name
       FROM escalations e
       LEFT JOIN patients p ON p.id = e.patient_id
       LEFT JOIN users p_user ON p_user.id = p.user_id
       LEFT JOIN users r_user ON r_user.id = e.resolved_by
       ORDER BY CASE e.severity WHEN 'critical' THEN 1 WHEN 'warning' THEN 2 ELSE 3 END, e.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/admin/escalations — create (from AI agent)
router.post('/escalations', async (req, res) => {
  const { patient_id, detected_by_agent, risk_description, severity } = req.body;
  try {
    const result = await query(
      `INSERT INTO escalations (patient_id, detected_by_agent, risk_description, severity)
       VALUES ($1,$2,$3,$4) RETURNING *`,
      [patient_id, detected_by_agent, risk_description, severity || 'warning']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PATCH /api/admin/escalations/:id — resolve or override
router.patch('/escalations/:id', async (req, res) => {
  const { status } = req.body;
  try {
    const result = await query(
      `UPDATE escalations SET status = $1, resolved_by = $2, resolved_at = NOW()
       WHERE id = $3 RETURNING *`,
      [status, req.user.id, req.params.id]
    );
    // Audit
    await query(
      `INSERT INTO audit_logs (actor_id, actor_role, action, details)
       VALUES ($1, 'admin', $2, $3)`,
      [req.user.id, `ESCALATION_${status.toUpperCase()}`, JSON.stringify({ escalation_id: req.params.id })]
    );
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/admin/inventory
router.get('/inventory', async (req, res) => {
  try {
    const result = await query('SELECT * FROM inventory ORDER BY category, item_name');
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PATCH /api/admin/inventory/:id — update stock
router.patch('/inventory/:id', async (req, res) => {
  const { current_stock } = req.body;
  try {
    const result = await query(
      `UPDATE inventory SET current_stock = $1, last_restocked = NOW(), updated_at = NOW()
       WHERE id = $2 RETURNING *`,
      [current_stock, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/admin/audit-logs
router.get('/audit-logs', async (req, res) => {
  try {
    const result = await query(
      `SELECT al.*, u.full_name, u.role FROM audit_logs al
       LEFT JOIN users u ON u.id = al.actor_id
       ORDER BY al.created_at DESC LIMIT 200`
    );
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/admin/all-patients — full patient list for admin monitoring
router.get('/all-patients', async (req, res) => {
  try {
    const result = await query(
      `SELECT p.id, u.full_name, u.email, p.blood_type, p.chronic_conditions,
              p.date_of_birth,
              (SELECT recorded_at FROM vitals WHERE patient_id = p.id ORDER BY recorded_at DESC LIMIT 1) AS last_vital_at,
              (SELECT heart_rate FROM vitals WHERE patient_id = p.id ORDER BY recorded_at DESC LIMIT 1) AS last_heart_rate,
              (SELECT spo2 FROM vitals WHERE patient_id = p.id ORDER BY recorded_at DESC LIMIT 1) AS last_spo2
       FROM patients p JOIN users u ON u.id = p.user_id ORDER BY u.full_name`
    );
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/admin/system-metrics
router.get('/system-metrics', async (req, res) => {
  try {
    const result = await query(
      `SELECT DISTINCT ON (metric_key) metric_key, metric_value, recorded_at
       FROM system_metrics ORDER BY metric_key, recorded_at DESC`
    );
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/admin/system-metrics — log metric (from AI agent)
router.post('/system-metrics', async (req, res) => {
  const { metric_key, metric_value } = req.body;
  try {
    await query('INSERT INTO system_metrics (metric_key, metric_value) VALUES ($1,$2)', [metric_key, metric_value]);
    res.status(201).json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/admin/ai-agent-logs
router.get('/ai-agent-logs', async (req, res) => {
  try {
    const { portal } = req.query;
    let sql = 'SELECT * FROM ai_agent_logs';
    const params = [];
    if (portal) { params.push(portal); sql += ` WHERE portal = $1`; }
    sql += ' ORDER BY created_at DESC LIMIT 100';
    const result = await query(sql, params);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;
