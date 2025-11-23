const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  telegramId: {
    type: Number,
    required: true,
    unique: true,
    index: true
  },
  username: String,
  firstName: String,
  lastName: String,
  photoUrl: String,
  bio: {
    type: String,
    default: ''
  },
  age: Number,
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    default: 'other'
  },
  location: String,
  interests: [String],
  starsBalance: {
    type: Number,
    default: 0
  },
  referralCode: {
    type: String,
    unique: true,
    sparse: true
  },
  referredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  referralCount: {
    type: Number,
    default: 0
  },
  dailyLoginStreak: {
    type: Number,
    default: 0
  },
  lastLoginDate: Date,
  freeMatchesEarned: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  isPremium: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  }
});

// Generate unique referral code
userSchema.methods.generateReferralCode = function() {
  return `SM${this.telegramId}${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
};

module.exports = mongoose.model('User', userSchema);
