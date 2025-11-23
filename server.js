require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const TelegramBot = require('node-telegram-bot-api');

const User = require('./models/User');
const Match = require('./models/Match');
const Transaction = require('./models/Transaction');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// Telegram Bot
const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

// Bot Commands
bot.onText(/\/start(.*)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const telegramId = msg.from.id;
  const referralCode = match[1].trim();

  try {
    let user = await User.findOne({ telegramId });

    if (!user) {
      // Create new user
      user = new User({
        telegramId,
        username: msg.from.username,
        firstName: msg.from.first_name,
        lastName: msg.from.last_name
      });

      // Generate unique referral code
      user.referralCode = user.generateReferralCode();

      // Handle referral
      if (referralCode && referralCode.startsWith('SM')) {
        const referrer = await User.findOne({ referralCode });
        if (referrer) {
          user.referredBy = referrer._id;
          referrer.referralCount += 1;
          referrer.starsBalance += 5; // Bonus stars for referrer
          await referrer.save();

          // Create transaction for referral bonus
          await Transaction.create({
            userId: referrer._id,
            telegramId: referrer.telegramId,
            type: 'referral_bonus',
            amount: 5,
            description: 'Referral bonus',
            status: 'completed',
            metadata: { referralCode }
          });
        }
      }

      await user.save();
    }

    // Check daily login streak
    const today = new Date().setHours(0, 0, 0, 0);
    const lastLogin = user.lastLoginDate ? new Date(user.lastLoginDate).setHours(0, 0, 0, 0) : null;

    if (!lastLogin || lastLogin < today - 86400000) {
      // Reset streak if more than 1 day gap
      if (lastLogin && lastLogin < today - 86400000) {
        user.dailyLoginStreak = 1;
      } else {
        user.dailyLoginStreak += 1;
      }
    }

    // Reward for 3-day streak
    if (user.dailyLoginStreak >= 3 && user.dailyLoginStreak % 3 === 0) {
      user.freeMatchesEarned += 1;
      await Transaction.create({
        userId: user._id,
        telegramId: user.telegramId,
        type: 'streak_bonus',
        amount: 1,
        description: `${user.dailyLoginStreak}-day login streak bonus`,
        status: 'completed',
        metadata: { streakDays: user.dailyLoginStreak }
      });
    }

    user.lastLoginDate = new Date();
    await user.save();

    const webAppUrl = `http://localhost:${PORT}/`;
    
    bot.sendMessage(chatId, 
      `💫 Welcome to StarMatch! ${user.firstName}\n\n` +
      `✨ Your login streak: ${user.dailyLoginStreak} days\n` +
      `⭐ Stars balance: ${user.starsBalance}\n` +
      `🎯 Free matches: ${user.freeMatchesEarned}\n\n` +
      `💝 Find your perfect match today!\n\n` +
      `📱 Tap the button below to open StarMatch:`,
      {
        reply_markup: {
          inline_keyboard: [[
            { text: '🚀 Open StarMatch', web_app: { url: webAppUrl } }
          ]]
        }
      }
    );

  } catch (error) {
    console.error('Error in /start:', error);
    bot.sendMessage(chatId, '❌ An error occurred. Please try again.');
  }
});

bot.onText(/\/profile/, async (msg) => {
  const chatId = msg.chat.id;
  const telegramId = msg.from.id;

  try {
    const user = await User.findOne({ telegramId });
    if (!user) {
      bot.sendMessage(chatId, '❌ User not found. Please use /start first.');
      return;
    }

    bot.sendMessage(chatId,
      `👤 Your Profile:\n\n` +
      `Name: ${user.firstName} ${user.lastName || ''}\n` +
      `Username: @${user.username || 'Not set'}\n` +
      `Age: ${user.age || 'Not set'}\n` +
      `Gender: ${user.gender || 'Not set'}\n` +
      `Location: ${user.location || 'Not set'}\n` +
      `Bio: ${user.bio || 'Not set'}\n\n` +
      `⭐ Stars: ${user.starsBalance}\n` +
      `🎯 Free matches: ${user.freeMatchesEarned}\n` +
      `🔥 Login streak: ${user.dailyLoginStreak} days\n` +
      `🎁 Referrals: ${user.referralCount}\n\n` +
      `📋 Your referral code: ${user.referralCode}\n` +
      `Share with friends to earn bonus stars!`
    );
  } catch (error) {
    console.error('Error in /profile:', error);
    bot.sendMessage(chatId, '❌ An error occurred. Please try again.');
  }
});

bot.onText(/\/stats/, async (msg) => {
  const chatId = msg.chat.id;
  const telegramId = msg.from.id;

  if (telegramId !== parseInt(process.env.ADMIN_ID)) {
    bot.sendMessage(chatId, '❌ Unauthorized. Admin only.');
    return;
  }

  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const totalMatches = await Match.countDocuments();
    const totalTransactions = await Transaction.countDocuments({ status: 'completed' });
    const totalRevenue = await Transaction.aggregate([
      { $match: { status: 'completed', type: 'payment' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    bot.sendMessage(chatId,
      `📊 StarMatch Statistics:\n\n` +
      `👥 Total Users: ${totalUsers}\n` +
      `✅ Active Users: ${activeUsers}\n` +
      `💝 Total Matches: ${totalMatches}\n` +
      `💰 Total Transactions: ${totalTransactions}\n` +
      `⭐ Total Revenue: ${totalRevenue[0]?.total || 0} Stars`
    );
  } catch (error) {
    console.error('Error in /stats:', error);
    bot.sendMessage(chatId, '❌ An error occurred. Please try again.');
  }
});

// API Routes

// Authentication endpoint
app.post('/api/auth', async (req, res) => {
  try {
    const { initData } = req.body;
    
    // In production, verify initData using Telegram's signature
    // For now, we'll parse the data directly
    const params = new URLSearchParams(initData);
    const userParam = params.get('user');
    
    if (!userParam) {
      return res.status(400).json({ error: 'Invalid init data' });
    }

    const userData = JSON.parse(userParam);
    const telegramId = userData.id;

    let user = await User.findOne({ telegramId });
    
    if (!user) {
      user = new User({
        telegramId,
        username: userData.username,
        firstName: userData.first_name,
        lastName: userData.last_name,
        photoUrl: userData.photo_url,
        referralCode: `SM${telegramId}${Math.random().toString(36).substr(2, 6).toUpperCase()}`
      });
      await user.save();
    }

    res.json({ success: true, user });
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

// Get user profile
app.get('/api/user/:telegramId', async (req, res) => {
  try {
    const user = await User.findOne({ telegramId: req.params.telegramId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

// Update user profile
app.put('/api/user/:telegramId', async (req, res) => {
  try {
    const { age, gender, location, interests, bio } = req.body;
    const user = await User.findOneAndUpdate(
      { telegramId: req.params.telegramId },
      { age, gender, location, interests, bio },
      { new: true }
    );
    res.json(user);
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Random matchmaking
app.post('/api/match/random', async (req, res) => {
  try {
    const { telegramId } = req.body;
    const currentUser = await User.findOne({ telegramId });

    if (!currentUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Find potential matches (exclude self and already matched users)
    const existingMatches = await Match.find({
      $or: [{ user1: currentUser._id }, { user2: currentUser._id }]
    });

    const excludedUserIds = existingMatches.flatMap(m => [m.user1, m.user2]);
    excludedUserIds.push(currentUser._id);

    const potentialMatches = await User.find({
      _id: { $nin: excludedUserIds },
      isActive: true
    }).limit(10);

    if (potentialMatches.length === 0) {
      return res.json({ success: false, message: 'No matches available at the moment' });
    }

    // Random selection
    const matchedUser = potentialMatches[Math.floor(Math.random() * potentialMatches.length)];

    // Create match
    const match = await Match.create({
      user1: currentUser._id,
      user2: matchedUser._id,
      matchType: 'random'
    });

    const populatedMatch = await Match.findById(match._id)
      .populate('user1')
      .populate('user2');

    res.json({ success: true, match: populatedMatch });
  } catch (error) {
    console.error('Random match error:', error);
    res.status(500).json({ error: 'Failed to create match' });
  }
});

// Filtered matchmaking
app.post('/api/match/filtered', async (req, res) => {
  try {
    const { telegramId, filters } = req.body;
    const currentUser = await User.findOne({ telegramId });

    if (!currentUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if user has enough stars or free matches
    if (currentUser.freeMatchesEarned > 0) {
      currentUser.freeMatchesEarned -= 1;
      await currentUser.save();
    } else if (currentUser.starsBalance >= 15) {
      currentUser.starsBalance -= 15;
      await currentUser.save();

      // Create transaction
      await Transaction.create({
        userId: currentUser._id,
        telegramId: currentUser.telegramId,
        type: 'payment',
        amount: -15,
        description: 'Filtered match',
        status: 'completed',
        metadata: { matchType: 'filtered' }
      });
    } else {
      return res.status(400).json({ error: 'Insufficient stars. You need 15 stars for filtered matching.' });
    }

    // Build filter query
    const query = { _id: { $ne: currentUser._id }, isActive: true };

    if (filters.gender) query.gender = filters.gender;
    if (filters.location) query.location = new RegExp(filters.location, 'i');
    if (filters.ageRange) {
      query.age = {
        $gte: filters.ageRange.min,
        $lte: filters.ageRange.max
      };
    }
    if (filters.interests && filters.interests.length > 0) {
      query.interests = { $in: filters.interests };
    }

    const potentialMatches = await User.find(query).limit(10);

    if (potentialMatches.length === 0) {
      return res.json({ success: false, message: 'No matches found with these filters' });
    }

    const matchedUser = potentialMatches[Math.floor(Math.random() * potentialMatches.length)];

    // Create match
    const match = await Match.create({
      user1: currentUser._id,
      user2: matchedUser._id,
      matchType: 'filtered',
      filters
    });

    const populatedMatch = await Match.findById(match._id)
      .populate('user1')
      .populate('user2');

    res.json({ success: true, match: populatedMatch });
  } catch (error) {
    console.error('Filtered match error:', error);
    res.status(500).json({ error: 'Failed to create filtered match' });
  }
});

// React to match
app.post('/api/match/:matchId/react', async (req, res) => {
  try {
    const { telegramId, reaction } = req.body; // reaction: 'interested' or 'passed'
    const match = await Match.findById(req.params.matchId).populate('user1 user2');

    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }

    const user = await User.findOne({ telegramId });
    const isUser1 = match.user1.telegramId === telegramId;

    if (isUser1) {
      match.user1Status = reaction;
    } else {
      match.user2Status = reaction;
    }

    // Check if both users are interested
    if (match.user1Status === 'interested' && match.user2Status === 'interested') {
      match.status = 'accepted';
      
      // Notify both users
      bot.sendMessage(match.user1.telegramId, 
        `🎉 It's a match! ${match.user2.firstName} is also interested in you!\n` +
        `Start chatting: @${match.user2.username}`
      );
      
      bot.sendMessage(match.user2.telegramId, 
        `🎉 It's a match! ${match.user1.firstName} is also interested in you!\n` +
        `Start chatting: @${match.user1.username}`
      );
    } else if (match.user1Status === 'passed' || match.user2Status === 'passed') {
      match.status = 'rejected';
    }

    await match.save();
    res.json({ success: true, match });
  } catch (error) {
    console.error('React to match error:', error);
    res.status(500).json({ error: 'Failed to react to match' });
  }
});

// Get user matches
app.get('/api/matches/:telegramId', async (req, res) => {
  try {
    const user = await User.findOne({ telegramId: req.params.telegramId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const matches = await Match.find({
      $or: [{ user1: user._id }, { user2: user._id }]
    })
    .populate('user1')
    .populate('user2')
    .sort({ createdAt: -1 })
    .limit(20);

    res.json(matches);
  } catch (error) {
    console.error('Get matches error:', error);
    res.status(500).json({ error: 'Failed to get matches' });
  }
});

// Payment endpoint (Stars)
app.post('/api/payment/invoice', async (req, res) => {
  try {
    const { telegramId, amount, description } = req.body;
    const user = await User.findOne({ telegramId });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Create invoice for Telegram Stars
    const invoice = await bot.createInvoiceLink(
      `StarMatch ${description}`,
      description,
      `payment_${Date.now()}`,
      '', // provider token (empty for Stars)
      'XTR', // Telegram Stars currency
      [{ label: description, amount }],
      {
        need_name: false,
        need_phone_number: false,
        need_email: false,
        need_shipping_address: false
      }
    );

    res.json({ success: true, invoiceUrl: invoice });
  } catch (error) {
    console.error('Payment error:', error);
    res.status(500).json({ error: 'Failed to create payment' });
  }
});

// Admin endpoints
app.get('/api/admin/users', async (req, res) => {
  try {
    const { telegramId } = req.query;
    
    if (parseInt(telegramId) !== parseInt(process.env.ADMIN_ID)) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const users = await User.find().sort({ createdAt: -1 }).limit(50);
    res.json(users);
  } catch (error) {
    console.error('Admin get users error:', error);
    res.status(500).json({ error: 'Failed to get users' });
  }
});

app.get('/api/admin/transactions', async (req, res) => {
  try {
    const { telegramId } = req.query;
    
    if (parseInt(telegramId) !== parseInt(process.env.ADMIN_ID)) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const transactions = await Transaction.find()
      .populate('userId')
      .sort({ createdAt: -1 })
      .limit(100);
    res.json(transactions);
  } catch (error) {
    console.error('Admin get transactions error:', error);
    res.status(500).json({ error: 'Failed to get transactions' });
  }
});

// Handle payment success (webhook)
bot.on('pre_checkout_query', async (query) => {
  bot.answerPreCheckoutQuery(query.id, true);
});

bot.on('successful_payment', async (msg) => {
  const telegramId = msg.from.id;
  const payment = msg.successful_payment;

  try {
    const user = await User.findOne({ telegramId });
    if (user) {
      // Add stars to user balance
      const stars = payment.total_amount; // Amount in Stars
      user.starsBalance += stars;
      await user.save();

      await Transaction.create({
        userId: user._id,
        telegramId: user.telegramId,
        type: 'payment',
        amount: stars,
        description: payment.invoice_payload,
        paymentId: payment.telegram_payment_charge_id,
        status: 'completed'
      });

      bot.sendMessage(msg.chat.id, 
        `✅ Payment successful!\n` +
        `⭐ ${stars} Stars added to your balance.\n` +
        `Total balance: ${user.starsBalance} Stars`
      );
    }
  } catch (error) {
    console.error('Payment processing error:', error);
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 StarMatch server running on port ${PORT}`);
  console.log(`🤖 Telegram bot active`);
});
