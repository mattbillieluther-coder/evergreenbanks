const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../db/db');
const { v4: uuidv4 } = require('uuid');

// Get session timeout from settings
const getSessionTimeout = async () => {
  try {
    const result = await pool.query('SELECT value FROM settings WHERE key = $1', ['session_timeout']);
    return result.rows.length > 0 ? parseInt(result.rows[0].value) : 15; // Default 15 minutes
  } catch (err) {
    console.error('Error getting session timeout:', err);
    return 15; // Default if error
  }
};

// Login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Find user
    const userResult = await pool.query(
      'SELECT * FROM users WHERE username = $1 OR email = $1',
      [username]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = userResult.rows[0];

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Get session timeout
    const sessionTimeoutMinutes = await getSessionTimeout();
    
    // Create session token
    const token = uuidv4();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + sessionTimeoutMinutes);

    // Store session in database
    await pool.query(
      'INSERT INTO sessions (user_id, token, expires_at) VALUES ($1, $2, $3)',
      [user.id, token, expiresAt]
    );

    // Update last login
    await pool.query(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
      [user.id]
    );

    // Get bank name for response
    const bankNameResult = await pool.query('SELECT value FROM settings WHERE key = $1', ['bank_name']);
    const bankName = bankNameResult.rows.length > 0 ? bankNameResult.rows[0].value : 'Evergreen Bank';

    // Set session cookie
    res.cookie('session_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      expires: expiresAt,
      sameSite: 'strict'
    });

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        firstName: user.first_name,
        lastName: user.last_name
      },
      bankName,
      sessionTimeout: sessionTimeoutMinutes
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Check session status
router.get('/session', async (req, res) => {
  const token = req.cookies.session_token;

  if (!token) {
    return res.status(401).json({ message: 'No session found' });
  }

  try {
    // Check if session exists and is valid
    const sessionResult = await pool.query(
      'SELECT s.*, u.username, u.email, u.role, u.first_name, u.last_name FROM sessions s ' +
      'JOIN users u ON s.user_id = u.id ' +
      'WHERE s.token = $1 AND s.expires_at > CURRENT_TIMESTAMP',
      [token]
    );

    if (sessionResult.rows.length === 0) {
      // Clear invalid session cookie
      res.clearCookie('session_token');
      return res.status(401).json({ message: 'Session expired' });
    }

    const session = sessionResult.rows[0];
    
    // Get session timeout for refresh
    const sessionTimeoutMinutes = await getSessionTimeout();
    
    // Extend session if active
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + sessionTimeoutMinutes);
    
    await pool.query(
      'UPDATE sessions SET expires_at = $1 WHERE token = $2',
      [expiresAt, token]
    );

    // Get bank name for response
    const bankNameResult = await pool.query('SELECT value FROM settings WHERE key = $1', ['bank_name']);
    const bankName = bankNameResult.rows.length > 0 ? bankNameResult.rows[0].value : 'Evergreen Bank';

    // Update cookie expiration
    res.cookie('session_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      expires: expiresAt,
      sameSite: 'strict'
    });

    res.json({
      message: 'Session valid',
      user: {
        id: session.user_id,
        username: session.username,
        email: session.email,
        role: session.role,
        firstName: session.first_name,
        lastName: session.last_name
      },
      bankName,
      sessionTimeout: sessionTimeoutMinutes
    });
  } catch (err) {
    console.error('Session check error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Logout
router.post('/logout', async (req, res) => {
  const token = req.cookies.session_token;

  if (!token) {
    return res.status(200).json({ message: 'Already logged out' });
  }

  try {
    // Remove session from database
    await pool.query('DELETE FROM sessions WHERE token = $1', [token]);
    
    // Clear session cookie
    res.clearCookie('session_token');
    
    res.json({ message: 'Logout successful' });
  } catch (err) {
    console.error('Logout error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;