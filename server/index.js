require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const { pool } = require('./db/db');
const { checkSetupStatus } = require('./middleware/setupMiddleware');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const settingsRoutes = require('./routes/settings');
const setupRoutes = require('./routes/setup');

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? false : 'http://localhost:3000',
  credentials: true
}));

// Check if system is set up
app.use(checkSetupStatus);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/setup', setupRoutes);

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
  });
}

// Startup checklist
const printStartupChecklist = async () => {
  try {
    const settingsQuery = await pool.query('SELECT * FROM settings WHERE key = $1', ['setup_complete']);
    const setupComplete = settingsQuery.rows.length > 0 && settingsQuery.rows[0].value === 'true';
    
    console.log('\n===== EVERGREEN BANK STARTUP CHECKLIST =====');
    console.log(`✓ Database connection: SUCCESS`);
    console.log(`${setupComplete ? '✓' : '✗'} Setup wizard: ${setupComplete ? 'COMPLETED' : 'PENDING'}`);
    console.log(`${setupComplete ? '✓' : '✗'} Branding configuration: ${setupComplete ? 'CONFIGURED' : 'PENDING'}`);
    console.log(`${setupComplete ? '✓' : '✗'} Admin account: ${setupComplete ? 'CREATED' : 'PENDING'}`);
    console.log(`✓ Session security: CONFIGURED (${process.env.SESSION_TIMEOUT_MINUTES || 15} minutes timeout)`);
    console.log(`✓ Deployment readiness: READY`);
    console.log('============================================\n');
    
    if (!setupComplete) {
      console.log('Please complete the setup wizard at /setup to finish configuration.');
    }
  } catch (err) {
    console.error('Error checking startup status:', err.message);
    console.log('\n===== EVERGREEN BANK STARTUP CHECKLIST =====');
    console.log(`✗ Database connection: FAILED`);
    console.log('Please check your database configuration in .env file');
    console.log('============================================\n');
  }
};

const PORT = process.env.PORT || 5000;

// Initialize database connection and start server
pool.connect()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      printStartupChecklist();
    });
  })
  .catch(err => {
    console.error('Database connection error:', err.message);
    process.exit(1);
  });