import jwt from 'jsonwebtoken';

export function authMiddleware(handler) {
  return async (req, res) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      
      if (!token) {
        return res.status(401).json({ 
          success: false, 
          message: 'Access denied. No token provided.' 
        });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      req.userId = decoded.id; // For compatibility with your existing code
      
      return handler(req, res);
    } catch (err) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token.' 
      });
    }
  };
}

export function corsMiddleware(handler) {
  return async (req, res) => {
    // Handle CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
    
    return handler(req, res);
  };
}