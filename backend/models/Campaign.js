const mongoose = require('mongoose');

const CampaignSchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ['coming_soon', 'active', 'paused', 'ended'],
    default: 'coming_soon',
  },
  startDate: {
    type: Date,
    default: () => {
      // Default to 3 days from now
      const date = new Date();
      date.setDate(date.getDate() + 3);
      return date;
    },
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Campaign', CampaignSchema);
