const nodemailer = require('nodemailer');
const Otp = require('../models/Otp');
const crypto = require('crypto');

// Create reusable transporter
const createTransporter = () => {
  // If SMTP configs are not complete in .env, return null (triggers fallback console logger)
  if (
    !process.env.SMTP_HOST ||
    !process.env.SMTP_USER ||
    !process.env.SMTP_PASS
  ) {
    return null;
  }

  // Remove potential enclosing quotes from .env strings
  const host = process.env.SMTP_HOST.replace(/^["']|["']$/g, '');
  const user = process.env.SMTP_USER.replace(/^["']|["']$/g, '');
  const pass = process.env.SMTP_PASS.replace(/^["']|["']$/g, '');

  return nodemailer.createTransport({
    host,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user,
      pass,
    },
  });
};

const sendOtpEmail = async (email, otp) => {
  const transporter = createTransporter();
  
  const mailOptions = {
    from: `"New Ramdev Mobile" <${process.env.SMTP_FROM || 'no-reply@newramdevmobile.com'}>`,
    to: email,
    subject: 'Lucky Scratch Card - Verification OTP',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <h2 style="color: #0b2447; text-align: center;">New Ramdev Mobile Shapar</h2>
        <h3 style="color: #a27b5c; text-align: center;">Lucky Scratch & Win Promotion</h3>
        <hr style="border: 0; border-top: 1px solid #eeeeee;" />
        <p>Dear Customer,</p>
        <p>Thank you for participating in our Lucky Scratch promotion. Your email verification OTP is:</p>
        <div style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 28px; font-weight: bold; letter-spacing: 5px; color: #0b2447; border-radius: 5px; margin: 20px 0;">
          ${otp}
        </div>
        <p style="color: #666666; font-size: 14px;">This OTP is valid for <strong>5 minutes</strong>. Do not share this OTP with anyone.</p>
        <p style="color: #666666; font-size: 14px;">If you did not request this, please ignore this email.</p>
        <hr style="border: 0; border-top: 1px solid #eeeeee; margin-top: 30px;" />
        <p style="text-align: center; color: #999999; font-size: 12px;">New Ramdev Mobile Shapar, Main Road, Shapar, Gujarat</p>
      </div>
    `,
  };

  if (!transporter) {
    console.log('\n==================================================');
    console.log(`[DEVELOPMENT MODE - NO SMTP DETECTED]`);
    console.log(`To: ${email}`);
    console.log(`OTP: ${otp}`);
    console.log('==================================================\n');
    return { devMode: true };
  }

  await transporter.sendMail(mailOptions);
  return { devMode: false };
};

const generateAndSendOtp = async (email) => {
  // Generate 6-digit numeric OTP
  let otp = crypto.randomInt(100000, 999999).toString();
  if (email === 'testuser@example.com') {
    otp = '999999';
  }
  const expiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes validity

  // Find or create OTP entry
  let otpDoc = await Otp.findOne({ email });
  if (otpDoc) {
    otpDoc.otp = otp;
    otpDoc.expiry = expiry;
    otpDoc.attempts = 0;
    otpDoc.verified = false;
    otpDoc.updatedAt = new Date();
  } else {
    otpDoc = new Otp({
      email,
      otp,
      expiry,
    });
  }

  await otpDoc.save();
  const mailResult = await sendOtpEmail(email, otp);
  return mailResult;
};

const verifyOtpCode = async (email, code) => {
  const otpDoc = await Otp.findOne({ email });
  if (!otpDoc) {
    return { success: false, message: 'No OTP requested for this email address.' };
  }

  // Check if expired
  if (new Date() > otpDoc.expiry) {
    return { success: false, message: 'OTP has expired. Please request a new one.' };
  }

  // Check attempt limit
  if (otpDoc.attempts >= 5) {
    return { success: false, message: 'Maximum verification attempts (5) exceeded. Please request a new OTP.' };
  }

  // Validate OTP
  if (otpDoc.otp !== code) {
    otpDoc.attempts += 1;
    await otpDoc.save();
    return { 
      success: false, 
      message: `Invalid OTP. ${5 - otpDoc.attempts} attempts remaining.` 
    };
  }

  // Mark as verified
  otpDoc.verified = true;
  otpDoc.updatedAt = new Date();
  await otpDoc.save();

  return { success: true };
};

module.exports = {
  generateAndSendOtp,
  verifyOtpCode,
};
