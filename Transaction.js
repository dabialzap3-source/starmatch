const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  telegramId: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    enum: ['payment', 'referral_bonus', 'streak_bonus', 'refund'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  description: String,
  paymentId: String,
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  metadata: {
    matchType: String,
    referralCode: String,
    streakDays: Number
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for admin queries
transactionSchema.index({ status: 1, createdAt: -1 });
transactionSchema.index({ telegramId: 1, createdAt: -1 });

module.exports = mongoose.model('Transaction', transactionSchema);
