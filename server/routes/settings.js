const express = require('express');
const router = express.Router();
const { pool } = require('../db/db');
const { checkAuth, checkAdmin } = require('../middleware/authMiddleware');

// Get all settings (public)
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT key, value FROM settings');
    
    // Convert to object format
    const settings = {};
    result.rows.forEach(row => {
      settings[row.key] = row.value;
    });
    
    res.json(settings);
  } catch (err) {
    console.error('Error fetching settings:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get specific setting by key (public)
router.get('/:key', async (req, res) => {
  const { key } = req.params;
  
  try {
    const result = await pool.query('SELECT value FROM settings WHERE key = $1', [key]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Setting not found' });
    }
    
    res.json({ key, value: result.rows[0].value });
  } catch (err) {
    console.error('Error fetching setting:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update setting (admin only)
router.put('/:key', checkAuth, checkAdmin, async (req, res) => {
  const { key } = req.params;
  const { value } = req.body;
  
  if (value === undefined) {
    return res.status(400).json({ message: 'Value is required' });
  }
  
  try {
    const result = await pool.query(
      'UPDATE settings SET value = $1, updated_at = CURRENT_TIMESTAMP WHERE key = $2 RETURNING key, value',
      [value, key]
    );
    
    if (result.rows.length === 0) {
      // Setting doesn't exist, create it
      const insertResult = await pool.query(
        'INSERT INTO settings (key, value) VALUES ($1, $2) RETURNING key, value',
        [key, value]
      );
      
      res.status(201).json(insertResult.rows[0]);
    } else {
      res.json(result.rows[0]);
    }
  } catch (err) {
    console.error('Error updating setting:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update multiple settings (admin only)
router.post('/batch', checkAuth, checkAdmin, async (req, res) => {
  const { settings } = req.body;
  
  if (!settings || !Array.isArray(settings)) {
    return res.status(400).json({ message: 'Settings array is required' });
  }
  
  try {
    // Start transaction
    await pool.query('BEGIN');
    
    const results = [];
    
    // Update each setting
    for (const setting of settings) {
      if (!setting.key || setting.value === undefined) {
        await pool.query('ROLLBACK');
        return res.status(400).json({ message: 'Each setting must have key and value' });
      }
      
      const result = await pool.query(
        'INSERT INTO settings (key, value) VALUES ($1, $2) ' +
        'ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = CURRENT_TIMESTAMP ' +
        'RETURNING key, value',
        [setting.key, setting.value]
      );
      
      results.push(result.rows[0]);
    }
    
    // Commit transaction
    await pool.query('COMMIT');
    
    res.json(results);
  } catch (err) {
    await pool.query('ROLLBACK');
    console.error('Error updating settings:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;