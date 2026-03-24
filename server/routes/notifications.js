import { Router } from 'express';
import { query } from '../db.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);

// GET /api/notifications — get current user's notifications
router.get('/', async (req, res) => {
  try {
    const result = await query(
      `SELECT n.*, u.full_name AS sender_name FROM notifications n
       LEFT JOIN users u ON u.id = n.sender_id
       WHERE n.recipient_id = $1
       ORDER BY n.created_at DESC LIMIT 50`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/notifications/unread-count
router.get('/unread-count', async (req, res) => {
  try {
    const result = await query(
      'SELECT COUNT(*) FROM notifications WHERE recipient_id = $1 AND is_read = false',
      [req.user.id]
    );
    res.json({ count: parseInt(result.rows[0].count) });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PATCH /api/notifications/mark-all-read
router.patch('/mark-all-read', async (req, res) => {
  try {
    await query('UPDATE notifications SET is_read = true WHERE recipient_id = $1', [req.user.id]);
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PATCH /api/notifications/:id/read
router.patch('/:id/read', async (req, res) => {
  try {
    await query('UPDATE notifications SET is_read = true WHERE id = $1 AND recipient_id = $2', [req.params.id, req.user.id]);
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;
