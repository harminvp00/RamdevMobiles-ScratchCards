const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const User = require('../models/User');
const Card = require('../models/Card');
const Campaign = require('../models/Campaign');
const RedemptionLog = require('../models/RedemptionLog');
const seedDatabase = require('../scripts/seed');

// Admin Login
const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(401).json({ success: false, message: 'Invalid admin credentials' });
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid admin credentials' });
    }

    const token = jwt.sign(
      { username: admin.username, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      token,
      admin: {
        username: admin.username,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error during admin login' });
  }
};

// Get Dashboard Stats
const getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalCards = await Card.countDocuments();
    const cardsAssigned = await Card.countDocuments({ assigned: true });
    const cardsRemaining = await Card.countDocuments({ assigned: false });
    const cardsRedeemed = await Card.countDocuments({ redeemed: true });

    const campaign = await Campaign.findOne();
    const campaignStatus = campaign ? campaign.status : 'coming_soon';

    // Get Top Rewards count
    // Aggregate reward types and count their occurrences that are assigned
    const topRewards = await Card.aggregate([
      { $match: { assigned: true } },
      { $group: { _id: '$reward', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Latest Registrations
    const latestRegistrations = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('assignedCard');

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalCards,
        cardsAssigned,
        cardsRemaining,
        cardsRedeemed,
        campaignStatus,
      },
      topRewards,
      latestRegistrations,
    });
  } catch (error) {
    console.error('Stats Error:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving statistics' });
  }
};

// Search and List Users (with Pagination)
const getUsers = async (req, res) => {
  const { search, redeemed, page = 1, limit = 10 } = req.query;

  try {
    const query = {};

    // Apply Search Filters
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      
      // We can search by name, email, phone, city
      // Or if search starts with RM-, we can search by card number via populate matching, 
      // but Mongoose makes it easier if we search Card collection first or use aggregate.
      // Alternatively, we can find Card first by number and filter users by that card ID.
      let cardIds = [];
      const cards = await Card.find({
        $or: [
          { cardNumber: searchRegex },
          { token: search }
        ]
      });
      cardIds = cards.map(c => c._id);

      query.$or = [
        { fullName: searchRegex },
        { email: searchRegex },
      ];

      if (cardIds.length > 0) {
        query.$or.push({ assignedCard: { $in: cardIds } });
      }
    }

    // Filter by redemption status
    if (redeemed !== undefined && redeemed !== '') {
      const isRedeemed = redeemed === 'true';
      const cards = await Card.find({ redeemed: isRedeemed });
      const cardIds = cards.map(c => c._id);
      query.assignedCard = { $in: cardIds };
    }

    const skipCount = (parseInt(page) - 1) * parseInt(limit);
    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .populate('assignedCard')
      .sort({ createdAt: -1 })
      .skip(skipCount)
      .limit(parseInt(limit));

    res.json({
      success: true,
      users,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Get Users Error:', error);
    res.status(500).json({ success: false, message: 'Server error searching users' });
  }
};

// Redeem Card
const redeemCard = async (req, res) => {
  const { cardId } = req.params;

  try {
    const card = await Card.findById(cardId);
    if (!card) {
      return res.status(404).json({ success: false, message: 'Card not found' });
    }

    if (!card.assigned) {
      return res.status(400).json({ success: false, message: 'This card has not been assigned to a customer yet' });
    }

    if (card.redeemed) {
      return res.status(400).json({ success: false, message: 'This card has already been redeemed' });
    }

    // Update Card
    card.redeemed = true;
    card.redeemedDate = new Date();
    await card.save();

    // Create redemption log
    const log = new RedemptionLog({
      cardId: card._id,
      userId: card.assignedUser,
      action: 'redeem',
      adminUsername: req.admin.username,
    });
    await log.save();

    res.json({
      success: true,
      message: 'Card successfully redeemed!',
      card,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error redeeming card' });
  }
};

// Cancel Redemption
const cancelRedemption = async (req, res) => {
  const { cardId } = req.params;

  try {
    const card = await Card.findById(cardId);
    if (!card) {
      return res.status(404).json({ success: false, message: 'Card not found' });
    }

    if (!card.redeemed) {
      return res.status(400).json({ success: false, message: 'This card is not redeemed' });
    }

    // Update Card
    card.redeemed = false;
    card.redeemedDate = null;
    await card.save();

    // Create redemption log
    const log = new RedemptionLog({
      cardId: card._id,
      userId: card.assignedUser,
      action: 'cancel',
      adminUsername: req.admin.username,
    });
    await log.save();

    res.json({
      success: true,
      message: 'Redemption cancelled successfully!',
      card,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error cancelling redemption' });
  }
};

// Export CSV of registrations
const exportCsv = async (req, res) => {
  try {
    const users = await User.find().populate('assignedCard').sort({ createdAt: -1 });

    // Build CSV content
    const headers = [
      'Name',
      'Email',
      'Card Number',
      'Reward',
      'Redeemed Status',
      'Redeemed Date',
      'Registration Date'
    ];

    let csvContent = headers.join(',') + '\n';

    users.forEach(user => {
      const cardNum = user.assignedCard ? user.assignedCard.cardNumber : 'N/A';
      const reward = user.assignedCard ? user.assignedCard.reward : 'N/A';
      const redeemed = user.assignedCard ? (user.assignedCard.redeemed ? 'Redeemed' : 'Pending') : 'N/A';
      const redeemedDate = user.assignedCard && user.assignedCard.redeemedDate 
        ? new Date(user.assignedCard.redeemedDate).toISOString() 
        : 'N/A';
      const regDate = new Date(user.createdAt).toISOString();

      // Escape quotes and commas in strings
      const escape = (str) => `"${String(str).replace(/"/g, '""')}"`;

      const row = [
        escape(user.fullName),
        escape(user.email),
        escape(cardNum),
        escape(reward),
        escape(redeemed),
        escape(redeemedDate),
        escape(regDate)
      ];

      csvContent += row.join(',') + '\n';
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=lucky_scratch_campaign_report.csv');
    res.status(200).send(csvContent);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error exporting CSV data' });
  }
};

// Update Campaign Controls
const updateCampaignStatus = async (req, res) => {
  const { status, startDate } = req.body;

  if (!['coming_soon', 'active', 'paused', 'ended'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid campaign status value' });
  }

  try {
    let campaign = await Campaign.findOne();
    if (!campaign) {
      campaign = new Campaign();
    }

    campaign.status = status;
    if (startDate) {
      campaign.startDate = new Date(startDate);
    }
    campaign.updatedAt = new Date();
    await campaign.save();

    res.json({
      success: true,
      message: `Campaign status updated to ${status} successfully.`,
      campaign,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error updating campaign settings' });
  }
};

// Reset Campaign (deletes users, logs, and resets cards)
const resetCampaign = async (req, res) => {
  try {
    console.log('Resetting Campaign initiated by admin...');
    
    // Clear collections
    await User.collection.drop().catch(() => {});
    await RedemptionLog.deleteMany({});
    await Card.deleteMany({});
    
    // Reset campaign setting status
    let campaign = await Campaign.findOne();
    if (campaign) {
      campaign.status = 'coming_soon';
      campaign.startDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000); // 2 days from now
      await campaign.save();
    }

    // Seed default cards & settings
    await seedDatabase();

    res.json({
      success: true,
      message: 'Campaign has been reset successfully. All user entries cleared and 500 fresh cards generated.'
    });
  } catch (error) {
    console.error('Reset Campaign Error:', error);
    res.status(500).json({ success: false, message: 'Server error during campaign reset' });
  }
};

// Reset Card Assignments back (keeps registered users but frees all cards, clears redemption logs)
const resetCardsBack = async (req, res) => {
  try {
    console.log('Resetting card assignments (releasing cards) initiated by admin...');

    // 1. Unset assignedCard on all users to avoid unique constraint issues
    await User.updateMany({}, { $unset: { assignedCard: "" } });

    // 2. Reset all cards to unassigned and active
    await Card.updateMany({}, {
      $set: {
        assigned: false,
        assignedUser: null,
        redeemed: false,
        redeemedDate: null
      }
    });

    // 3. Clear all redemption logs
    await RedemptionLog.deleteMany({});

    res.json({
      success: true,
      message: 'All scratch cards have been reset back to unassigned and active. Customer registrations are preserved.'
    });
  } catch (error) {
    console.error('Reset Cards Back Error:', error);
    res.status(500).json({ success: false, message: 'Server error resetting card assignments' });
  }
};

module.exports = {
  login,
  getStats,
  getUsers,
  redeemCard,
  cancelRedemption,
  exportCsv,
  updateCampaignStatus,
  resetCampaign,
  resetCardsBack,
};
