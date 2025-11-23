const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  user1: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  user2: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  matchType: {
    type: String,
    enum: ['random', 'filtered'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'expired'],
    default: 'pending'
  },
  user1Status: {
    type: String,
    enum: ['pending', 'interested', 'passed'],
    default: 'pending'
  },
  user2Status: {
    type: String,
    enum: ['pending', 'interested', 'passed'],
    default: 'pending'
  },
  filters: {
    ageRange: {
      min: Number,
      max: Number
    },
    gender: String,
    location: String,
    interests: [String]
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
  }
});

// Index for efficient matching queries
matchSchema.index({ user1: 1, user2: 1 });
matchSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Match', matchSchema);
