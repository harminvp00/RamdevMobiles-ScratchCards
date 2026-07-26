const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Card = require('../models/Card');
const Otp = require('../models/Otp');
const Campaign = require('../models/Campaign');
const { generateAndSendOtp, verifyOtpCode } = require('../services/otpService');

// Request OTP
const requestOtp = async (req, res) => {
  const { email } = req.body;

  try {
    // Check if campaign is coming_soon or paused or ended
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

    // Check card availability
    const unassignedCount = await Card.countDocuments({ assigned: false });
    if (unassignedCount === 0) {
      return res.status(400).json({ success: false, message: 'All scratch cards have been claimed. Thank You.' });
    }

    // Generate and send OTP
    const mailResult = await generateAndSendOtp(email);

    res.json({
      success: true,
      message: mailResult.devMode 
        ? 'OTP sent successfully (Development: check server logs).' 
        : 'OTP sent successfully to your email.',
    });
  } catch (error) {
    console.error('Request OTP Error:', error);
    res.status(500).json({ success: false, message: 'Server error requesting OTP' });
  }
};

// Verify OTP
const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const verification = await verifyOtpCode(email, otp);
    if (!verification.success) {
      return res.status(400).json({ success: false, message: verification.message });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email }).populate('assignedCard');

    if (existingUser) {
      // User is already registered! Log them in directly
      const token = jwt.sign(
        { id: existingUser._id, role: 'customer' },
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
      );

      return res.json({
        success: true,
        isRegistered: true,
        token,
        user: {
          id: existingUser._id,
          name: existingUser.name,
          email: existingUser.email,
          phone: existingUser.phone,
          city: existingUser.city,
          assignedCard: existingUser.assignedCard,
        },
      });
    }

    // User is new! Issue a temporary verification token to permit registration
    const otpToken = jwt.sign(
      { email, verified: true },
      process.env.JWT_SECRET,
      { expiresIn: '15m' } // 15 mins to fill details
    );

    res.json({
      success: true,
      isRegistered: false,
      otpToken,
      message: 'OTP verified. Please proceed to complete your registration.',
    });
  } catch (error) {
    console.error('Verify OTP Error:', error);
    res.status(500).json({ success: false, message: 'Server error verifying OTP' });
  }
};

// Register New User and Assign Scratch Card (Atomic)
const registerUser = async (req, res) => {
  const { name, phone, city, otpToken } = req.body;

  try {
    // 1. Verify otpToken
    let decoded;
    try {
      decoded = jwt.verify(otpToken, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(400).json({ success: false, message: 'Session expired. Please verify OTP again.' });
    }

    const { email, verified } = decoded;
    if (!verified) {
      return res.status(400).json({ success: false, message: 'Invalid registration session.' });
    }

    // Double check OTP collection to make sure it was marked verified (prevents replay attacks)
    const otpDoc = await Otp.findOne({ email });
    if (!otpDoc || !otpDoc.verified) {
      return res.status(400).json({ success: false, message: 'Email verification required.' });
    }

    // 2. Uniqueness Checks
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ success: false, message: 'This email is already registered.' });
    }

    const phoneExists = await User.findOne({ phone });
    if (phoneExists) {
      return res.status(400).json({ success: false, message: 'This phone number is already registered. One card per phone.' });
    }

    // 3. Atomically assign a card
    // findOneAndUpdate is atomic on MongoDB and guarantees that no concurrent request gets the same card.
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

    // 4. Create User
    const user = new User({
      name,
      email,
      phone,
      city,
      assignedCard: assignedCard._id,
    });

    await user.save();

    // 5. Link Card to User
    assignedCard.assignedUser = user._id;
    await assignedCard.save();

    // 6. Delete OTP entry so it cannot be reused
    await Otp.deleteOne({ email });

    // 7. Issue user JWT Token
    const token = jwt.sign(
      { id: user._id, role: 'customer' },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        city: user.city,
        assignedCard,
      },
    });
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ success: false, message: 'Server error during registration' });
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
        name: user.name,
        email: user.email,
        phone: user.phone,
        city: user.city,
        assignedCard: user.assignedCard,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error loading profile' });
  }
};

module.exports = {
  requestOtp,
  verifyOtp,
  registerUser,
  getCurrentUser,
};
