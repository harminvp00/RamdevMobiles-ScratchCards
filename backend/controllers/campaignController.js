const Campaign = require('../models/Campaign');
const Card = require('../models/Card');
const User = require('../models/User');

// Get public campaign status and configurations
const getCampaignStatus = async (req, res) => {
  try {
    let campaign = await Campaign.findOne();
    if (!campaign) {
      campaign = await Campaign.create({
        status: 'coming_soon',
        startDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Default 2 days from now
      });
    }

    // Count available unassigned cards
    const remainingCards = await Card.countDocuments({ assigned: false });

    // If campaign is active but cards are finished, force show campaign ended (all claimed)
    let currentStatus = campaign.status;
    if (currentStatus === 'active' && remainingCards === 0) {
      currentStatus = 'ended'; // Treat as finished
    }

    res.json({
      success: true,
      status: currentStatus,
      startDate: campaign.startDate,
      remainingCards,
      totalCards: 500
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching campaign status' });
  }
};

// Mask personal information helper
const maskString = (str, type) => {
  if (!str) return '';
  if (type === 'email') {
    const [name, domain] = str.split('@');
    if (name.length <= 2) return `${name[0]}**@${domain}`;
    return `${name.substring(0, 2)}****@${domain}`;
  }
  if (type === 'phone') {
    if (str.length < 6) return '******';
    return `${str.substring(0, 2)}******${str.substring(str.length - 2)}`;
  }
  // Name
  if (str.length <= 2) return `${str[0]}*`;
  return `${str.substring(0, 2)}****`;
};

// Get high reward winners (₹100 & ₹200) with masked data
const getWinners = async (req, res) => {
  try {
    // Find all cards with ₹100 or ₹200 rewards that are assigned
    const winningCards = await Card.find({
      reward: { $in: ['₹100', '₹200'] },
      assigned: true,
    }).populate('assignedUser');

    const winnersList = winningCards
      .filter(card => card.assignedUser)
      .map(card => ({
        id: card._id,
        reward: card.reward,
        name: maskString(card.assignedUser.name, 'name'),
        email: maskString(card.assignedUser.email, 'email'),
        phone: maskString(card.assignedUser.phone, 'phone'),
        date: card.createdDate || card.redeemedDate || new Date(),
      }))
      .sort((a, b) => b.date - a.date);

    res.json({
      success: true,
      winners: winnersList,
    });
  } catch (error) {
    console.error('Winners Error:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving winners' });
  }
};

module.exports = {
  getCampaignStatus,
  getWinners,
};

