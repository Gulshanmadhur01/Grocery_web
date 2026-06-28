import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'grocery-secret-key-123456';

export function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.userId = decoded.id;
    req.userRole = decoded.role;
    next();
  });
}

export function isAdmin(req, res, next) {
  if (req.userRole !== 'admin') {
    return res.status(403).json({ message: 'Access denied: Requires administrator privileges' });
  }
  next();
}
