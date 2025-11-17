/**
 * Email Service
 * Handles sending emails using nodemailer (Gmail SMTP)
 */

const nodemailer = require('nodemailer');

// Email configuration
const EMAIL_CONFIG = {
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER, // Gmail address
    pass: process.env.EMAIL_PASSWORD, // Gmail app password
  },
  tls: {
    rejectUnauthorized: false // Allow self-signed certificates for development
  }
};

// Create transporter
let transporter;

try {
  transporter = nodemailer.createTransport(EMAIL_CONFIG);
  console.log('✅ Email service initialized');
} catch (error) {
  console.error('❌ Email service initialization failed:', error.message);
  console.warn('⚠️  Email features will not work without proper configuration');
  console.warn('📝 Please set EMAIL_USER and EMAIL_PASSWORD in your .env file');
}

/**
 * Send email verification OTP
 * @param {string} email - Recipient email
 * @param {string} name - Recipient name
 * @param {string} otp - 6-digit OTP
 * @returns {Promise<boolean>} - Success status
 */
const sendVerificationOTP = async (email, name, otp) => {
  try {
    if (!transporter) {
      throw new Error('Email service not configured');
    }

    const mailOptions = {
      from: {
        name: 'CultureKart',
        address: process.env.EMAIL_USER,
      },
      to: email,
      subject: 'Verify Your Email - CultureKart',
      html: generateOTPEmailTemplate(name, otp),
      text: `Hi ${name},\n\nYour email verification code is: ${otp}\n\nThis code will expire in 10 minutes.\n\nBest regards,\nCultureKart Team`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('📧 OTP email sent successfully:', info.messageId);
    return true;
  } catch (error) {
    console.error('❌ Failed to send OTP email:', error.message);
    return false;
  }
};

/**
 * Generate HTML email template for OTP
 * @param {string} name - User name
 * @param {string} otp - OTP code
 * @returns {string} - HTML template
 */
const generateOTPEmailTemplate = (name, otp) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Verification - CultureKart</title>
        <style>
            body { 
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                line-height: 1.6; 
                color: #333; 
                background-color: #f4f4f4; 
                margin: 0; 
                padding: 0; 
            }
            .container { 
                max-width: 600px; 
                margin: 0 auto; 
                background: white; 
                border-radius: 10px; 
                overflow: hidden; 
                box-shadow: 0 0 20px rgba(0,0,0,0.1); 
            }
            .header { 
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                color: white; 
                padding: 30px; 
                text-align: center; 
            }
            .header h1 { 
                margin: 0; 
                font-size: 28px; 
            }
            .content { 
                padding: 40px 30px; 
            }
            .otp-box { 
                background: #f8f9fa; 
                border: 2px dashed #667eea; 
                border-radius: 10px; 
                padding: 30px; 
                text-align: center; 
                margin: 30px 0; 
            }
            .otp-code { 
                font-size: 36px; 
                font-weight: bold; 
                color: #667eea; 
                letter-spacing: 8px; 
                margin: 10px 0; 
                font-family: 'Courier New', monospace; 
            }
            .warning { 
                background: #fff3cd; 
                border-left: 4px solid #ffc107; 
                padding: 15px; 
                margin: 20px 0; 
                border-radius: 0 5px 5px 0; 
            }
            .footer { 
                background: #f8f9fa; 
                padding: 20px 30px; 
                text-align: center; 
                font-size: 14px; 
                color: #6c757d; 
            }
            .button { 
                display: inline-block; 
                background: #667eea; 
                color: white; 
                padding: 12px 30px; 
                text-decoration: none; 
                border-radius: 5px; 
                margin: 20px 0; 
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🎨 CultureKart</h1>
                <p>Email Verification Required</p>
            </div>
            
            <div class="content">
                <h2>Hello ${name}! 👋</h2>
                <p>Thank you for registering with CultureKart! To complete your account setup and start exploring authentic cultural products, please verify your email address.</p>
                
                <div class="otp-box">
                    <p><strong>Your Verification Code:</strong></p>
                    <div class="otp-code">${otp}</div>
                    <p><small>Enter this code in the verification form</small></p>
                </div>
                
                <div class="warning">
                    <strong>⚠️ Important:</strong>
                    <ul style="margin: 10px 0; padding-left: 20px;">
                        <li>This code will expire in <strong>10 minutes</strong></li>
                        <li>Don't share this code with anyone</li>
                        <li>If you didn't request this, please ignore this email</li>
                    </ul>
                </div>
                
                <p>Once verified, you'll be able to:</p>
                <ul>
                    <li>🛒 Browse and purchase authentic cultural products</li>
                    <li>👨‍🎨 Connect with talented artisans</li>
                    <li>📦 Track your orders and manage your account</li>
                    <li>❤️ Save your favorite items</li>
                </ul>
                
                <p>Need help? Reply to this email or contact our support team.</p>
            </div>
            
            <div class="footer">
                <p>This is an automated message from CultureKart.<br>
                Please do not reply to this email.</p>
                <p>&copy; ${new Date().getFullYear()} CultureKart. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
  `;
};

/**
 * Test email configuration
 * @returns {Promise<boolean>} - Configuration status
 */
const testEmailConfig = async () => {
  try {
    if (!transporter) {
      return false;
    }
    
    await transporter.verify();
    console.log('✅ Email configuration is valid');
    return true;
  } catch (error) {
    console.error('❌ Email configuration test failed:', error.message);
    return false;
  }
};

/**
 * Send welcome email after verification
 * @param {string} email - User email
 * @param {string} name - User name
 * @returns {Promise<boolean>} - Success status
 */
const sendWelcomeEmail = async (email, name) => {
  try {
    if (!transporter) {
      throw new Error('Email service not configured');
    }

    const mailOptions = {
      from: {
        name: 'CultureKart',
        address: process.env.EMAIL_USER,
      },
      to: email,
      subject: 'Welcome to CultureKart! 🎨',
      html: generateWelcomeEmailTemplate(name),
      text: `Welcome to CultureKart, ${name}!\n\nYour account has been successfully verified. Start exploring authentic cultural products from talented artisans around the world.\n\nHappy shopping!\nCultureKart Team`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('📧 Welcome email sent successfully:', info.messageId);
    return true;
  } catch (error) {
    console.error('❌ Failed to send welcome email:', error.message);
    return false;
  }
};

/**
 * Generate welcome email template
 * @param {string} name - User name
 * @returns {string} - HTML template
 */
const generateWelcomeEmailTemplate = (name) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
            .content { padding: 40px 30px; }
            .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 14px; color: #6c757d; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🎨 Welcome to CultureKart!</h1>
            </div>
            
            <div class="content">
                <h2>Hello ${name}! 🎉</h2>
                <p>Congratulations! Your email has been successfully verified and your CultureKart account is now active.</p>
                
                <p>You can now:</p>
                <ul>
                    <li>🛒 Browse our collection of authentic cultural products</li>
                    <li>👨‍🎨 Discover talented artisans</li>
                    <li>📦 Place orders and track deliveries</li>
                    <li>❤️ Create wishlists and save favorites</li>
                </ul>
                
                <p>Start your cultural journey today and support artisans from around the world!</p>
            </div>
            
            <div class="footer">
                <p>&copy; ${new Date().getFullYear()} CultureKart. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
  `;
};

/**
 * Generic send email function
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML content
 * @param {string} options.text - Plain text content (optional)
 * @returns {Promise<boolean>} - Success status
 */
const sendEmail = async ({ to, subject, html, text }) => {
  try {
    if (!transporter) {
      throw new Error('Email service not configured');
    }

    const mailOptions = {
      from: {
        name: 'CultureKart',
        address: process.env.EMAIL_USER || 'ccngroupb5@gmail.com',
      },
      to,
      subject,
      html,
      text: text || '',
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('📧 Email sent successfully to', to, '- Message ID:', info.messageId);
    return true;
  } catch (error) {
    console.error('❌ Failed to send email to', to, ':', error.message);
    return false;
  }
};

module.exports = {
  sendVerificationOTP,
  sendWelcomeEmail,
  testEmailConfig,
  sendEmail,
};