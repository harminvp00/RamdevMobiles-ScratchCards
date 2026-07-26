const mongoose = require('mongoose');

const OtpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true,
  },
  otp: {
    type: String,
    required: true,
  },
  expiry: {
    type: Date,
    required: true,
  },
  attempts: {
    type: Number,
    default: 0,
  },
  verified: {
    type: Boolean,
    default: false,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  }
});

// Auto-delete document from DB 10 minutes after updatedAt (cleanup)
OtpSchema.index({ updatedAt: 1 }, { expireAfterSeconds: 600 });

module.exports = mongoose.model('Otp', OtpSchema);
