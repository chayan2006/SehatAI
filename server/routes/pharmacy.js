import { Router } from 'express';
import { query } from '../db.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);

// GET /api/pharmacy — pharmacy orders (doctors only)
router.get('/', requireRole('doctor', 'admin'), async (req, res) => {
  try {
    const result = await query(
      `SELECT po.*, p_user.full_name AS patient_name
       FROM pharmacy_orders po
       JOIN patients p ON p.id = po.patient_id
       JOIN users p_user ON p_user.id = p.user_id
       ORDER BY po.created_at DESC LIMIT 100`
    );
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PATCH /api/pharmacy/:id — dispense
router.patch('/:id', requireRole('doctor', 'admin'), async (req, res) => {
  try {
    const result = await query(
      `UPDATE pharmacy_orders SET status = 'dispensed', dispensed_at = NOW()
       WHERE id = $1 RETURNING *`,
      [req.params.id]
    );
    // Notify patient
    const order = result.rows[0];
    if (order) {
      const patUserResult = await query('SELECT user_id FROM patients WHERE id = $1', [order.patient_id]);
      if (patUserResult.rows[0]) {
        await query(
          `INSERT INTO notifications (recipient_id, sender_id, type, title, message)
           VALUES ($1,$2,'medication','Prescription Ready','Your prescription for ${order.medication_name} is ready for pickup.')`,
          [patUserResult.rows[0].user_id, req.user.id]
        );
      }
    }
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;
