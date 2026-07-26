require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Card = require('../models/Card');
const Campaign = require('../models/Campaign');
const Admin = require('../models/Admin');
const RedemptionLog = require('../models/RedemptionLog');
const seedDatabase = require('./seed');
const jwt = require('jsonwebtoken');

// Ensure NODE_ENV is set to test so the mock bypass works
process.env.NODE_ENV = 'test';

// Simple assert helper
const assert = (condition, message) => {
  if (!condition) {
    throw new Error(`Assertion Failed: ${message}`);
  }
  console.log(`  ✓ Pass: ${message}`);
};

const runTests = async () => {
  console.log('==================================================');
  console.log('RUNNING LUCKY SCRATCH GOOGLE OAUTH INTEGRATION TESTS');
  console.log('==================================================\n');

  try {
    // 1. Connect to Database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB for testing.');

    // 2. Clear collections to start fresh
    await User.collection.drop().catch(() => {});
    await Card.deleteMany({});
    await RedemptionLog.deleteMany({});
    await Campaign.deleteMany({});
    await Admin.deleteMany({});
    console.log('Cleared database collections and reset indexes.');

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

    // 5. Test Google OAuth Login (New User - Auto Registration & Card Assignment)
    const testEmail1 = 'tester1@example.com';
    const mockIdToken1 = `mock_google_token_${testEmail1}`;

    const authController = require('../controllers/authController');

    let user1Token = '';
    let user1Id = null;
    let user1CardId = null;

    const mockResRegister = {
      json: (data) => {
        assert(data.success === true, 'Google authentication reports success');
        assert(data.token !== undefined, 'Google authentication issues user JWT');
        assert(data.user.fullName === 'Mock User tester1', 'Correct fullName mapped from Google profile');
        assert(data.user.email === testEmail1, 'Correct email mapped from Google profile');
        assert(data.user.assignedCard !== null, 'New user is automatically assigned a scratch card');
        user1Token = data.token;
        user1Id = data.user.id;
        user1CardId = data.user.assignedCard._id;
      }
    };

    console.log('Attempting Google login for new user...');
    await authController.googleLogin({ body: { idToken: mockIdToken1 } }, mockResRegister);

    // Verify card assignment in DB
    const cardDoc1 = await Card.findById(user1CardId);
    assert(cardDoc1.assigned === true, 'Assigned card is marked assigned in database');
    assert(cardDoc1.assignedUser.toString() === user1Id.toString(), 'Card is linked to correct user ID');

    const userDoc1 = await User.findById(user1Id);
    assert(userDoc1.assignedCard.toString() === user1CardId.toString(), 'User is linked to correct card ID');

    // 6. Test Google OAuth Login (Existing User - Persistent Login & No Duplicate Cards)
    let user1LoginCardId = null;
    const mockResLogin = {
      json: (data) => {
        assert(data.success === true, 'Google login for existing user reports success');
        assert(data.token !== undefined, 'Google login issues user JWT');
        assert(data.user.id.toString() === user1Id.toString(), 'Logs into the same user account');
        assert(data.user.assignedCard !== null, 'Existing user retrieves their assigned card');
        user1LoginCardId = data.user.assignedCard._id;
      }
    };

    console.log('Attempting Google login for existing user...');
    await authController.googleLogin({ body: { idToken: mockIdToken1 } }, mockResLogin);
    assert(user1LoginCardId.toString() === user1CardId.toString(), 'Existing user keeps their original card');

    // 7. Test Google OAuth Login (Second User - Unique Card Assignment)
    const testEmail2 = 'tester2@example.com';
    const mockIdToken2 = `mock_google_token_${testEmail2}`;
    let user2CardId = null;

    const mockResRegister2 = {
      json: (data) => {
        assert(data.success === true, 'Google authentication for user 2 reports success');
        user2CardId = data.user.assignedCard._id;
      }
    };

    console.log('Attempting Google login for second user...');
    await authController.googleLogin({ body: { idToken: mockIdToken2 } }, mockResRegister2);
    assert(user2CardId.toString() !== user1CardId.toString(), 'Second user gets a different unique scratch card');

    // 8. Test Admin Operations
    const adminController = require('../controllers/adminController');

    // Test Admin Stats
    const mockResStats = {
      json: (data) => {
        assert(data.success === true, 'Admin stats loaded successfully');
        assert(data.stats.totalUsers === 2, 'Admin stats counts exactly 2 users');
        assert(data.stats.cardsAssigned === 2, 'Admin stats counts exactly 2 cards assigned');
        assert(data.stats.cardsRemaining === 498, 'Admin stats counts exactly 498 cards remaining');
      }
    };
    console.log('Checking admin stats...');
    await adminController.getStats({}, mockResStats);

    // Test Admin Redemption
    const mockAdmin = { username: 'admin' };
    const mockResRedeem = {
      json: (data) => {
        assert(data.success === true, 'Admin successfully redeems the card');
        assert(data.card.redeemed === true, 'Card status updated to redeemed');
      }
    };
    console.log('Redeeming card 1...');
    await adminController.redeemCard({ params: { cardId: user1CardId }, admin: mockAdmin }, mockResRedeem);

    // Double check database is updated
    const cardDocRedeemed = await Card.findById(user1CardId);
    assert(cardDocRedeemed.redeemed === true, 'Card redemption saved in database');

    // Test Redemption cancellation
    const mockResCancel = {
      json: (data) => {
        assert(data.success === true, 'Admin successfully cancels the redemption');
        assert(data.card.redeemed === false, 'Card status updated back to active');
      }
    };
    console.log('Cancelling redemption of card 1...');
    await adminController.cancelRedemption({ params: { cardId: user1CardId }, admin: mockAdmin }, mockResCancel);

    // Double check database is reverted
    const cardDocReverted = await Card.findById(user1CardId);
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

