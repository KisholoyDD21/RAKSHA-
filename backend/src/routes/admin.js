import { Router } from 'express';
import jwtLike from '../utils/simpleToken.js';

const router = Router();

// Deliberately simple: a single shared passcode from .env, exchanged for a
// short-lived signed token. This is fine for a hackathon demo / single-
// admin deployment. It is NOT a real auth system — see README's
// "Production Roadmap" for what to add (per-user accounts, bcrypt-hashed
// passwords, refresh tokens) before this touches real operations.

router.post('/login', (req, res) => {
  const { passcode } = req.body || {};
  const expected = process.env.ADMIN_PASSCODE || 'raksha-demo';
  if (passcode !== expected) {
    return res.status(401).json({ error: 'Incorrect passcode' });
  }
  const token = jwtLike.sign({ role: 'admin' }, process.env.ADMIN_TOKEN_SECRET || 'dev-secret-change-me', 60 * 60 * 8);
  res.json({ token, expiresInSeconds: 60 * 60 * 8 });
});

export default router;
