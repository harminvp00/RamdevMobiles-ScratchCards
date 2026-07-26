const express = require('express');
const router = express.Router();

// Controllers
const { getCampaignStatus, getWinners } = require('../controllers/campaignController');
const { requestOtp, verifyOtp, registerUser, getCurrentUser } = require('../controllers/authController');
const adminController = require('../controllers/adminController');

// Middlewares
const { authenticateUser, authenticateAdmin } = require('../middlewares/auth');
const { otpLimiter, authLimiter, globalAuthLimiter } = require('../middlewares/rateLimiter');

// Validators
const {
  validate,
  otpRequestSchema,
  otpVerifySchema,
  registerSchema,
  adminLoginSchema,
} = require('../validators/schemas');

// ==========================================
// PUBLIC / CAMPAIGN ROUTES
// ==========================================
router.get('/campaign/status', getCampaignStatus);
router.get('/campaign/winners', getWinners);

// ==========================================
// CUSTOMER AUTHENTICATION & REGISTRATION
// ==========================================
// Request OTP (Rate limited globally and by IP, validated email)
router.post('/auth/otp/request', globalAuthLimiter, otpLimiter, validate(otpRequestSchema), requestOtp);

// Verify OTP (Validated OTP and email)
router.post('/auth/otp/verify', validate(otpVerifySchema), verifyOtp);

// Complete Registration (Rate limited globally and by IP, validated details, requires otp session token)
router.post('/auth/register', globalAuthLimiter, authLimiter, validate(registerSchema), registerUser);

// Load customer profile (Requires customer JWT)
router.get('/auth/me', authenticateUser, getCurrentUser);

// ==========================================
// ADMIN DASHBOARD & CONTROLS
// ==========================================
// Admin Login (Rate limited globally and by IP, validated username & password)
router.post('/admin/login', globalAuthLimiter, authLimiter, validate(adminLoginSchema), adminController.login);

// Get Admin Stats (Requires admin JWT)
router.get('/admin/stats', authenticateAdmin, adminController.getStats);

// List/Search customers (Requires admin JWT)
router.get('/admin/users', authenticateAdmin, adminController.getUsers);

// Redeem a card (Requires admin JWT)
router.post('/admin/cards/:cardId/redeem', authenticateAdmin, adminController.redeemCard);

// Cancel redemption of a card (Requires admin JWT)
router.post('/admin/cards/:cardId/cancel', authenticateAdmin, adminController.cancelRedemption);

// Export CSV log (Requires admin JWT)
router.get('/admin/export', authenticateAdmin, adminController.exportCsv);

// Update campaign settings/status (Requires admin JWT)
router.put('/admin/campaign', authenticateAdmin, adminController.updateCampaignStatus);

// Reset Campaign (Requires admin JWT)
router.post('/admin/campaign/reset', authenticateAdmin, adminController.resetCampaign);

// Reset Card Assignments only (Requires admin JWT)
router.post('/admin/cards/reset-back', authenticateAdmin, adminController.resetCardsBack);

module.exports = router;
