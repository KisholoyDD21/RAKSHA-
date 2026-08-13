import jwtLike from '../utils/simpleToken.js';

export function requireAdmin(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  const payload = token ? jwtLike.verify(token, process.env.ADMIN_TOKEN_SECRET || 'dev-secret-change-me') : null;

  if (!payload || payload.role !== 'admin') {
    return res.status(401).json({ error: 'Admin authentication required. POST /api/admin/login first.' });
  }
  req.admin = payload;
  next();
}
