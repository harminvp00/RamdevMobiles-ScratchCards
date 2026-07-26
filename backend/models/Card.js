const mongoose = require('mongoose');
const { REWARD_VALUES } = require('../scripts/rewardConfig'); // adjust path to wherever rewardConfig.js lives

const CardSchema = new mongoose.Schema({
  cardNumber: {
    type: String,
    required: true,
    unique: true,
    index: true,
    trim: true,
  },
  reward: {
    type: String,
    required: true,
    trim: true,
    enum: REWARD_VALUES, // restricts reward to exactly the values seed.js generates
  },
  // Random, unguessable identifier encoded into each card's QR code.
  // Redemption endpoints should look cards up by `token`, never by
  // `cardNumber`, so prize positions can't be enumerated or predicted.
  token: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  assigned: {
    type: Boolean,
    default: false,
    index: true,
  },
  assignedUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
    index: true,
  },
  redeemed: {
    type: Boolean,
    default: false,
    index: true,
  },
  redeemedDate: {
    type: Date,
    default: null,
  },
  createdDate: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Card', CardSchema);