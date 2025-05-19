// src/middlewares/authMiddleware.mjs
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

export default function jwtAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: '❌ No token provided' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: '❌ Invalid or expired token' });
    }
    req.user = user;
    next();
  });
}
