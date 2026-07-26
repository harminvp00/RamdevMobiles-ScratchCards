const express = require('express');
const router = express.Router();

// Controllers
const { getCampaignStatus, getWinners } = require('../controllers/campaignController');
const { googleLogin, getCurrentUser } = require('../controllers/authController');
const adminController = require('../controllers/adminController');

// Middlewares
const { authenticateUser, authenticateAdmin } = require('../middlewares/auth');
const { authLimiter, globalAuthLimiter } = require('../middlewares/rateLimiter');

// Validators
const {
  validate,
  googleAuthSchema,
  adminLoginSchema,
} = require('../validators/schemas');

// ==========================================
// PUBLIC / CAMPAIGN ROUTES
// ==========================================
// Get public campaign status and configurations
router.get('/campaign/status', getCampaignStatus);

// Get winners board
router.get('/campaign/winners', getWinners);

// ==========================================
// CUSTOMER AUTHENTICATION
// ==========================================
// Google Login / Auto-Registration (Rate limited globally and by IP)
router.post('/auth/google', globalAuthLimiter, authLimiter, validate(googleAuthSchema), googleLogin);

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
