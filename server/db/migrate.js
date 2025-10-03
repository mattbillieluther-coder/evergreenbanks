require('dotenv').config();
const { pool } = require('./db');

const createTables = async () => {
  try {
    // Create settings table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS settings (
        id SERIAL PRIMARY KEY,
        key VARCHAR(255) NOT NULL UNIQUE,
        value TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) NOT NULL UNIQUE,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        first_name VARCHAR(255),
        last_name VARCHAR(255),
        role VARCHAR(50) NOT NULL DEFAULT 'user',
        last_login TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create sessions table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS sessions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token VARCHAR(255) NOT NULL UNIQUE,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create notifications table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        type VARCHAR(50) NOT NULL,
        read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('All tables created successfully');
    return true;
  } catch (err) {
    console.error('Error creating tables:', err);
    return false;
  }
};

const insertDefaultSettings = async () => {
  try {
    // Check if settings already exist
    const settingsCheck = await pool.query('SELECT * FROM settings WHERE key = $1', ['setup_complete']);
    
    if (settingsCheck.rows.length === 0) {
      // Insert default settings
      await pool.query(`
        INSERT INTO settings (key, value) VALUES
        ('setup_complete', 'false'),
        ('bank_name', 'Evergreen Bank'),
        ('support_email', 'support@evergreenbank.com'),
        ('address', '123 Financial Street, Banking City, BC 12345'),
        ('phone', '(555) 123-4567'),
        ('session_timeout', '15')
      `);
      console.log('Default settings inserted');
    } else {
      console.log('Settings already exist, skipping default insertion');
    }
    return true;
  } catch (err) {
    console.error('Error inserting default settings:', err);
    return false;
  }
};

const runMigration = async () => {
  try {
    console.log('Starting database migration...');
    
    const tablesCreated = await createTables();
    if (!tablesCreated) {
      console.error('Failed to create tables');
      process.exit(1);
    }
    
    const settingsInserted = await insertDefaultSettings();
    if (!settingsInserted) {
      console.error('Failed to insert default settings');
      process.exit(1);
    }
    
    console.log('Migration completed successfully');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
};

// Run migration
runMigration();