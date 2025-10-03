const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { pool } = require('../db/db');
const { checkAuth, checkAdmin } = require('../middleware/authMiddleware');

// Get all users (admin only)
router.get('/', checkAuth, checkAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, username, email, first_name, last_name, role, last_login, created_at FROM users ORDER BY created_at DESC'
    );
    
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user by ID (admin or self)
router.get('/:id', checkAuth, async (req, res) => {
  const { id } = req.params;
  
  // Check if user is requesting their own info or is admin
  if (req.user.id !== parseInt(id) && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Not authorized' });
  }
  
  try {
    const result = await pool.query(
      'SELECT id, username, email, first_name, last_name, role, last_login, created_at FROM users WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new user (admin only)
router.post('/', checkAuth, checkAdmin, async (req, res) => {
  const { username, email, password, firstName, lastName, role } = req.body;
  
  // Validate input
  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Username, email and password are required' });
  }
  
  try {
    // Check if username or email already exists
    const checkResult = await pool.query(
      'SELECT * FROM users WHERE username = $1 OR email = $2',
      [username, email]
    );
    
    if (checkResult.rows.length > 0) {
      return res.status(400).json({ message: 'Username or email already exists' });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Insert new user
    const result = await pool.query(
      'INSERT INTO users (username, email, password, first_name, last_name, role) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, username, email, first_name, last_name, role',
      [username, email, hashedPassword, firstName, lastName, role || 'user']
    );
    
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating user:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user (admin or self)
router.put('/:id', checkAuth, async (req, res) => {
  const { id } = req.params;
  const { firstName, lastName, email, role, password } = req.body;
  
  // Check if user is updating their own info or is admin
  if (req.user.id !== parseInt(id) && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Not authorized' });
  }
  
  // Only admin can update role
  if (role && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Not authorized to change role' });
  }
  
  try {
    let query = 'UPDATE users SET ';
    const values = [];
    let valueIndex = 1;
    
    // Build dynamic query based on provided fields
    if (firstName) {
      query += `first_name = $${valueIndex}, `;
      values.push(firstName);
      valueIndex++;
    }
    
    if (lastName) {
      query += `last_name = $${valueIndex}, `;
      values.push(lastName);
      valueIndex++;
    }
    
    if (email) {
      query += `email = $${valueIndex}, `;
      values.push(email);
      valueIndex++;
    }
    
    if (role && req.user.role === 'admin') {
      query += `role = $${valueIndex}, `;
      values.push(role);
      valueIndex++;
    }
    
    if (password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      query += `password = $${valueIndex}, `;
      values.push(hashedPassword);
      valueIndex++;
    }
    
    // Add updated_at timestamp
    query += `updated_at = CURRENT_TIMESTAMP WHERE id = $${valueIndex} RETURNING id, username, email, first_name, last_name, role`;
    values.push(id);
    
    // Execute update if there are fields to update
    if (values.length > 1) {
      const result = await pool.query(query, values);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      res.json(result.rows[0]);
    } else {
      res.status(400).json({ message: 'No fields to update' });
    }
  } catch (err) {
    console.error('Error updating user:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete user (admin only)
router.delete('/:id', checkAuth, checkAdmin, async (req, res) => {
  const { id } = req.params;
  
  try {
    // Check if trying to delete the last admin
    if (req.user.id === parseInt(id)) {
      const adminCount = await pool.query('SELECT COUNT(*) FROM users WHERE role = $1', ['admin']);
      if (adminCount.rows[0].count <= 1) {
        return res.status(400).json({ message: 'Cannot delete the last admin user' });
      }
    }
    
    const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;