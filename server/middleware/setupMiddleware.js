const { pool } = require('../db/db');

// Middleware to check if the system has been set up
const checkSetupStatus = async (req, res, next) => {
  // Skip setup check for setup routes and static files
  if (req.path.startsWith('/api/setup') || !req.path.startsWith('/api')) {
    return next();
  }

  try {
    const result = await pool.query('SELECT value FROM settings WHERE key = $1', ['setup_complete']);
    
    // If setup is not complete, redirect API requests to setup endpoint
    if (result.rows.length === 0 || result.rows[0].value !== 'true') {
      return res.status(403).json({ 
        message: 'System setup required',
        setupRequired: true
      });
    }
    
    next();
  } catch (err) {
    console.error('Error checking setup status:', err);
    next();
  }
};

module.exports = { checkSetupStatus };