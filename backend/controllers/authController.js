const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Card = require('../models/Card');
const Campaign = require('../models/Campaign');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Verify Google Token Helper (with test environment mock bypass)
const verifyGoogleToken = async (idToken) => {
  if (process.env.NODE_ENV === 'test' && idToken.startsWith('mock_google_token_')) {
    const parts = idToken.split('_');
    const mockEmail = parts[parts.length - 1];
    return {
      sub: `mock_google_id_${mockEmail}`,
      email: mockEmail,
      name: `Mock User ${mockEmail.split('@')[0]}`,
      picture: 'https://lh3.googleusercontent.com/a/mock',
      email_verified: true,
    };
  }

  const ticket = await client.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  return ticket.getPayload();
};

// Google Authenticate (Login or Auto-Register)
const googleLogin = async (req, res) => {
  const { idToken } = req.body;

  try {
    // 1. Check campaign status
    const campaign = await Campaign.findOne();
    if (campaign && campaign.status === 'coming_soon') {
      return res.status(400).json({ success: false, message: 'Campaign has not started yet.' });
    }
    if (campaign && campaign.status === 'paused') {
      return res.status(400).json({ success: false, message: 'Campaign is temporarily paused.' });
    }
    if (campaign && campaign.status === 'ended') {
      return res.status(400).json({ success: false, message: 'Campaign has ended. All rewards claimed.' });
    }

    // 2. Verify Google Token
    let payload;
    try {
      payload = await verifyGoogleToken(idToken);
    } catch (tokenErr) {
      console.error('Google token verification error:', tokenErr);
      return res.status(401).json({ success: false, message: 'Invalid Google credentials.' });
    }

    const { sub: googleId, email, name: fullName, picture: profilePicture, email_verified: emailVerified } = payload;

    if (!googleId || !email) {
      return res.status(400).json({ success: false, message: 'Google profile is missing required identification info.' });
    }

    // 3. Find or Create User
    let user = await User.findOne({ googleId }).populate('assignedCard');

    if (!user) {
      // Check if user with same email exists
      user = await User.findOne({ email }).populate('assignedCard');
      if (user) {
        // Link googleId to existing user
        user.googleId = googleId;
        user.fullName = fullName;
        if (profilePicture) user.profilePicture = profilePicture;
        user.emailVerified = emailVerified;
        user.loginProvider = 'google';
        await user.save();
      } else {
        // Double check card availability
        const unassignedCount = await Card.countDocuments({ assigned: false });
        if (unassignedCount === 0) {
          return res.status(400).json({
            success: false,
            message: 'All scratch cards have been claimed. Thank you for your interest!'
          });
        }

        // Atomically assign a card
        const assignedCard = await Card.findOneAndUpdate(
          { assigned: false },
          { assigned: true, createdDate: new Date() },
          { new: true }
        );

        if (!assignedCard) {
          return res.status(400).json({
            success: false,
            message: 'All scratch cards have been claimed. Thank you for your interest!'
          });
        }

        // Create new user
        user = new User({
          googleId,
          email,
          fullName,
          profilePicture,
          emailVerified,
          assignedCard: assignedCard._id,
          loginProvider: 'google',
        });

        await user.save();

        assignedCard.assignedUser = user._id;
        await assignedCard.save();

        // Re-populate card on user instance
        user.assignedCard = assignedCard;
      }
    }

    // 4. Generate user JWT session
    const token = jwt.sign(
      { id: user._id, role: 'customer' },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        profilePicture: user.profilePicture,
        assignedCard: user.assignedCard,
      },
    });

  } catch (error) {
    console.error('Google Login Error:', error);
    res.status(500).json({ success: false, message: 'Server error during Google authentication' });
  }
};

// Get current logged-in customer info
const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('assignedCard');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        profilePicture: user.profilePicture,
        assignedCard: user.assignedCard,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error loading profile' });
  }
};

module.exports = {
  googleLogin,
  getCurrentUser,
};

