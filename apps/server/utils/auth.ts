import jwt from 'jsonwebtoken';

export function getUserIdFromRequest(req: any): string | null {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.decode(token);
      if (decoded && (decoded as any).sub) return (decoded as any).sub;
    } catch {}
  }
  return null;
}
