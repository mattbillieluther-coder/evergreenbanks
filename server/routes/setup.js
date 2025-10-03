const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { pool } = require('../db/db');

// Check setup status
router.get('/status', async (req, res) => {
  try {
    const result = await pool.query('SELECT value FROM settings WHERE key = $1', ['setup_complete']);
    const setupComplete = result.rows.length > 0 && result.rows[0].value === 'true';
    
    res.json({ setupComplete });
  } catch (err) {
    console.error('Error checking setup status:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Complete setup wizard
router.post('/complete', async (req, res) => {
  const { 
    dbHost, dbPort, dbName, dbUser, dbPassword,
    backendUrl, 
    adminUsername, adminPassword, adminEmail,
    bankName, supportEmail, address, phone
  } = req.body;

  // Validate required fields
  if (!adminUsername || !adminPassword || !adminEmail) {
    return res.status(400).json({ message: 'Admin credentials are required' });
  }

  try {
    // Start a transaction
    await pool.query('BEGIN');

    // Check if setup is already complete
    const setupCheck = await pool.query('SELECT value FROM settings WHERE key = $1', ['setup_complete']);
    if (setupCheck.rows.length > 0 && setupCheck.rows[0].value === 'true') {
      await pool.query('ROLLBACK');
      return res.status(400).json({ message: 'Setup is already complete' });
    }

    // Hash admin password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminPassword, salt);

    // Create admin user
    const userResult = await pool.query(
      'INSERT INTO users (username, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id',
      [adminUsername, adminEmail, hashedPassword, 'admin']
    );

    // Update settings
    const settingsToUpdate = [
      { key: 'setup_complete', value: 'true' },
      { key: 'bank_name', value: bankName || 'Evergreen Bank' },
      { key: 'support_email', value: supportEmail || 'support@evergreenbank.com' },
      { key: 'address', value: address || '123 Financial Street, Banking City, BC 12345' },
      { key: 'phone', value: phone || '(555) 123-4567' },
      { key: 'backend_url', value: backendUrl || 'http://localhost:5000' }
    ];

    // Update or insert settings
    for (const setting of settingsToUpdate) {
      await pool.query(
        'INSERT INTO settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = $2',
        [setting.key, setting.value]
      );
    }

    // Commit transaction
    await pool.query('COMMIT');

    res.json({ 
      message: 'Setup completed successfully',
      adminId: userResult.rows[0].id
    });
  } catch (err) {
    await pool.query('ROLLBACK');
    console.error('Error completing setup:', err);
    res.status(500).json({ message: 'Server error during setup' });
  }
});

module.exports = router;