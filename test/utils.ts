import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'test_secret';

// genera un token válido para tu middleware isAuthenticated { id, role }
export function tokenFor(payload: { id: number; role: number }) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
}
