import { Router } from 'express';
import bcrypt from 'bcrypt';
import { query } from '../db.js';
import { signToken } from '../middleware/auth.js';

const router = Router();

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { email, password, role, full_name, phone } = req.body;
  if (!email || !password || !role || !full_name) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  if (!['patient', 'doctor', 'admin'].includes(role)) {
    return res.status(400).json({ error: 'Invalid role' });
  }
  try {
    const password_hash = await bcrypt.hash(password, 12);
    const result = await query(
      `INSERT INTO users (email, password_hash, role, full_name, phone)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, email, role, full_name`,
      [email, password_hash, role, full_name, phone]
    );
    const user = result.rows[0];

    // Create role-specific profile row
    if (role === 'patient') {
      await query('INSERT INTO patients (user_id) VALUES ($1)', [user.id]);
    } else if (role === 'doctor') {
      await query('INSERT INTO doctors (user_id) VALUES ($1)', [user.id]);
    }

    const token = signToken(user);
    res.status(201).json({ token, user });
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Email already registered' });
    console.error(err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password, role } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  try {
    const result = await query(
      'SELECT * FROM users WHERE email = $1 AND is_active = true', [email]
    );
    const user = result.rows[0];
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    if (role && user.role !== role) return res.status(403).json({ error: 'Wrong portal for this account' });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    await query('UPDATE users SET last_login = NOW() WHERE id = $1', [user.id]);
    const token = signToken(user);
    res.json({ token, user: { id: user.id, email: user.email, role: user.role, full_name: user.full_name, avatar_url: user.avatar_url } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// GET /api/auth/me  — returns current user profile
import { authenticate } from '../middleware/auth.js';
router.get('/me', authenticate, async (req, res) => {
  try {
    const result = await query(
      'SELECT id, email, role, full_name, phone, avatar_url, last_login FROM users WHERE id = $1',
      [req.user.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

export default router;
