const nodemailer = require('nodemailer');
const { pool } = require('../db/db');

// Create a reusable transporter object
const createTransporter = async () => {
  // In a production environment, you would configure this with real SMTP settings
  // For development, we'll use a test account or console logging
  
  // For demo purposes, we'll just return a mock transporter
  return {
    sendMail: async (mailOptions) => {
      console.log('Email would be sent with the following options:');
      console.log(mailOptions);
      return { messageId: 'mock-message-id-' + Date.now() };
    }
  };
};

// Get branding settings from database
const getBrandingSettings = async () => {
  try {
    const result = await pool.query(`
      SELECT key, value FROM settings 
      WHERE key IN ('bank_name', 'support_email', 'address', 'phone')
    `);
    
    const settings = {};
    result.rows.forEach(row => {
      settings[row.key] = row.value;
    });
    
    return {
      bankName: settings.bank_name || 'Evergreen Bank',
      supportEmail: settings.support_email || 'support@evergreenbank.com',
      address: settings.address || '123 Evergreen Ave, Finance City, FC 12345',
      phone: settings.phone || '(555) 123-4567'
    };
  } catch (error) {
    console.error('Error fetching branding settings:', error);
    // Return defaults if there's an error
    return {
      bankName: 'Evergreen Bank',
      supportEmail: 'support@evergreenbank.com',
      address: '123 Evergreen Ave, Finance City, FC 12345',
      phone: '(555) 123-4567'
    };
  }
};

// Create HTML email with branding
const createHtmlEmail = (branding, subject, content) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #1e4620; color: white; padding: 20px; text-align: center;">
        <h2>${branding.bankName}</h2>
        <div>${subject}</div>
      </div>
      
      <div style="padding: 20px; background-color: #fff;">
        ${content}
      </div>
      
      <div style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 12px; color: #666;">
        <p>© ${new Date().getFullYear()} ${branding.bankName}</p>
        <p>${branding.address}</p>
        <p>Contact: ${branding.supportEmail} | ${branding.phone}</p>
      </div>
    </div>
  `;
};

// Send email with dynamic branding
const sendEmail = async (to, subject, content) => {
  try {
    const transporter = await createTransporter();
    const branding = await getBrandingSettings();
    
    const mailOptions = {
      from: `"${branding.bankName}" <${branding.supportEmail}>`,
      to,
      subject: `${subject} - ${branding.bankName}`,
      html: createHtmlEmail(branding, subject, content),
      text: `${subject}\n\n${content}\n\n${branding.bankName}\n${branding.address}\nContact: ${branding.supportEmail} | ${branding.phone}`
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendEmail
};