const { pool } = require('../db/db');

// Middleware to check if user is authenticated
const checkAuth = async (req, res, next) => {
  const token = req.cookies.session_token;

  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    // Check if session exists and is valid
    const sessionResult = await pool.query(
      'SELECT s.*, u.id as user_id, u.role FROM sessions s ' +
      'JOIN users u ON s.user_id = u.id ' +
      'WHERE s.token = $1 AND s.expires_at > CURRENT_TIMESTAMP',
      [token]
    );

    if (sessionResult.rows.length === 0) {
      return res.status(401).json({ message: 'Session expired' });
    }

    const session = sessionResult.rows[0];
    
    // Attach user info to request
    req.user = {
      id: session.user_id,
      role: session.role
    };
    
    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Middleware to check if user is admin
const checkAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  
  next();
};

module.exports = { checkAuth, checkAdmin };