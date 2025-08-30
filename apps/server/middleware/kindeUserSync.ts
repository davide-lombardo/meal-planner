import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { getDb } from '../services/dbHelpers';

// Middleware to sync Kinde user to DB on authenticated request
export async function kindeUserSync(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(); // Not authenticated, skip
    }
    const token = authHeader.split(' ')[1];
    // Decode JWT (do not verify signature here, just extract payload)
    const decoded: any = jwt.decode(token);
    if (!decoded || !decoded.sub || !decoded.email) {
      return next();
    }
    const userId = decoded.sub;
    const email = decoded.email;
    const name = decoded.given_name || decoded.name || null;

    const { db } = await getDb();
    // Check if user exists
    const userRes = db.exec('SELECT * FROM users WHERE id = ?', [userId]);
    if (!userRes[0] || userRes[0].values.length === 0) {
      // Insert new user
      db.run('INSERT INTO users (id, email, name) VALUES (?, ?, ?)', [userId, email, name]);
    }
    // else: user already exists, do nothing
    next();
  } catch (err) {
    // On error, just continue
    next();
  }
}
