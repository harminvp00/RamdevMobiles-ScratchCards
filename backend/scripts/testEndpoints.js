require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Card = require('../models/Card');
const Otp = require('../models/Otp');
const Campaign = require('../models/Campaign');
const Admin = require('../models/Admin');
const RedemptionLog = require('../models/RedemptionLog');
const seedDatabase = require('./seed');    console.log('Cleared database collections.');

const jwt = require('jsonwebtoken');

// Simple assert helper
const assert = (condition, message) => {
  if (!condition) {
    throw new Error(`Assertion Failed: ${message}`);
  }
  console.log(`  ✓ Pass: ${message}`);
};

const runTests = async () => {
  console.log('==================================================');
  console.log('RUNNING LUCKY SCRATCH BACKEND INTEGRATION TESTS');
  console.log('==================================================\n');

  try {
    // 1. Connect to Database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB for testing.');

    // 2. Clear collections to start fresh
    await User.deleteMany({});
    await Otp.deleteMany({});
    await Card.deleteMany({});
    await RedemptionLog.deleteMany({});
    await Campaign.deleteMany({});
    await Admin.deleteMany({});
    console.log('Cleared database collections.');

    // 3. Run seed script
    await seedDatabase();
    console.log('Seeded initial data.');

    // 4. Test Campaign Settings (should be coming_soon initially)
    const campaign = await Campaign.findOne();
    assert(campaign !== null, 'Campaign settings document exists');
    assert(campaign.status === 'coming_soon', 'Initial campaign status is coming_soon');

    // Activate campaign for testing
    campaign.status = 'active';
    await campaign.save();
    console.log('Activated campaign for registration tests.');

    // 5. Test OTP Generation & Mail Trigger
    const testEmail = 'tester@example.com';
    const { generateAndSendOtp, verifyOtpCode } = require('../services/otpService');
    const mailResult = await generateAndSendOtp(testEmail);
    assert(mailResult.devMode === true, 'Nodemailer fallbacks to console log development mode');

    // Retrieve generated OTP from DB
    const otpDoc = await Otp.findOne({ email: testEmail });
    assert(otpDoc !== null, 'OTP record saved in database');
    assert(otpDoc.otp.length === 6, 'OTP is a 6-digit string');

    // Test incorrect OTP
    const verifyFailed = await verifyOtpCode(testEmail, '000000');
    assert(verifyFailed.success === false, 'Invalid OTP fails validation');
    
    // Check attempt increment
    const otpDocAttempt = await Otp.findOne({ email: testEmail });
    assert(otpDocAttempt.attempts === 1, 'Verification attempts incremented');

    // Test correct OTP
    const verifySuccess = await verifyOtpCode(testEmail, otpDoc.otp);
    assert(verifySuccess.success === true, 'Correct OTP passes validation');

    // 6. Test Registration
    const otpToken = jwt.sign(
      { email: testEmail, verified: true },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    // Mock controller payload
    const registerPayload = {
      name: 'John Tester',
      phone: '9876543210',
      city: 'Rajkot',
      email: testEmail,
      otpToken
    };

    // Import controllers manually to test logic directly without network layer
    const authController = require('../controllers/authController');
    
    // Mock express res/req
    let mockUserToken = '';
    let mockUserId = null;
    let mockCardId = null;

    const mockResRegister = {
      status: (code) => {
        assert(code === 201, 'Registration returns 201 Created status');
        return mockResRegister;
      },
      json: (data) => {
        assert(data.success === true, 'Registration reports success');
        assert(data.token !== undefined, 'Registration issues user JWT');
        assert(data.user.assignedCard !== null, 'User assigned a scratch card');
        mockUserToken = data.token;
        mockUserId = data.user.id;
        mockCardId = data.user.assignedCard._id;
      }
    };

    await authController.registerUser({ body: registerPayload }, mockResRegister);

    // 7. Test Double Claim Protections
    // Create new OTP token for same email
    const duplicateEmailToken = jwt.sign(
      { email: testEmail, verified: true },
      process.env.JWT_SECRET
    );

    // Set OTP to verified in DB to bypass verify check
    await Otp.create({ email: testEmail, otp: '123456', expiry: new Date(Date.now() + 5000), verified: true });

    const mockResDuplicateEmail = {
      status: (code) => {
        assert(code === 400, 'Duplicate email registration returns 400 Bad Request status');
        return mockResDuplicateEmail;
      },
      json: (data) => {
        assert(data.success === false, 'Duplicate email registration reports failure');
        assert(data.message.includes('email'), 'Rejects with email warning');
      }
    };

    await authController.registerUser({ body: { ...registerPayload, otpToken: duplicateEmailToken } }, mockResDuplicateEmail);

    // Test Duplicate Phone Number
    const duplicatePhoneEmail = 'different@example.com';
    const duplicatePhoneToken = jwt.sign(
      { email: duplicatePhoneEmail, verified: true },
      process.env.JWT_SECRET
    );
    await Otp.create({ email: duplicatePhoneEmail, otp: '123456', expiry: new Date(Date.now() + 5000), verified: true });

    const mockResDuplicatePhone = {
      status: (code) => {
        assert(code === 400, 'Duplicate phone registration returns 400 Bad Request status');
        return mockResDuplicatePhone;
      },
      json: (data) => {
        assert(data.success === false, 'Duplicate phone registration reports failure');
        assert(data.message.includes('phone'), 'Rejects with phone warning');
      }
    };

    await authController.registerUser({ 
      body: { 
        name: 'Another Tester', 
        phone: '9876543210', // Same phone
        city: 'Morbi', 
        email: duplicatePhoneEmail, 
        otpToken: duplicatePhoneToken 
      } 
    }, mockResDuplicatePhone);

    // 8. Test Admin Operations
    const adminController = require('../controllers/adminController');

    // Test Admin Stats
    const mockResStats = {
      json: (data) => {
        assert(data.success === true, 'Admin stats loaded successfully');
        assert(data.stats.totalUsers === 1, 'Admin stats counts exactly 1 user');
        assert(data.stats.cardsAssigned === 1, 'Admin stats counts exactly 1 card assigned');
        assert(data.stats.cardsRemaining === 499, 'Admin stats counts exactly 499 cards remaining');
      }
    };
    await adminController.getStats({}, mockResStats);

    // Test Admin Redemption
    const mockAdmin = { username: 'admin' };
    const mockResRedeem = {
      json: (data) => {
        assert(data.success === true, 'Admin successfully redeems the card');
        assert(data.card.redeemed === true, 'Card status updated to redeemed');
      }
    };
    await adminController.redeemCard({ params: { cardId: mockCardId }, admin: mockAdmin }, mockResRedeem);

    // Double check database is updated
    const cardDoc = await Card.findById(mockCardId);
    assert(cardDoc.redeemed === true, 'Card redemption saved in database');

    // Test Redemption cancellation
    const mockResCancel = {
      json: (data) => {
        assert(data.success === true, 'Admin successfully cancels the redemption');
        assert(data.card.redeemed === false, 'Card status updated back to active');
      }
    };
    await adminController.cancelRedemption({ params: { cardId: mockCardId }, admin: mockAdmin }, mockResCancel);

    // Double check database is reverted
    const cardDocReverted = await Card.findById(mockCardId);
    assert(cardDocReverted.redeemed === false, 'Card redemption reversion saved in database');

    console.log('\n==================================================');
    console.log('ALL BACKEND INTEGRATION TESTS COMPLETED SUCCESSFULLY');
    console.log('==================================================\n');
    
    await mongoose.disconnect();
    process.exit(0);

  } catch (error) {
    console.error('\n❌ TEST EXECUTION FAILED:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

runTests();
