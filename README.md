# StarMatch - Telegram Mini App Dating Platform 💝

A modern, feature-rich dating application integrated with Telegram Stars payment system.

## Features ✨

- **Two Matchmaking Modes:**
  - 🎲 Random Match (Free)
  - 🎯 Filtered Match (15 Stars or free match reward)

- **Telegram Stars Integration:**
  - Secure payment system
  - Direct transfer to admin account
  - Multiple purchase options

- **Viral Features:**
  - 🎁 Referral system (earn 5 Stars per referral)
  - 🔥 Daily login streaks (free matches every 3 days)

- **User Features:**
  - Profile customization (age, gender, location, interests, bio)
  - Match history
  - Real-time notifications

- **Admin Panel:**
  - User management
  - Transaction tracking
  - Revenue analytics
  - Activity monitoring

## Tech Stack 🛠️

- **Frontend:** HTML, CSS, JavaScript
- **Backend:** Node.js, Express
- **Database:** MongoDB
- **Bot API:** node-telegram-bot-api
- **Payment:** Telegram Stars (XTR)

## Prerequisites 📋

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- Telegram Bot Token (from @BotFather)
- Telegram Bot with WebApp support

## Installation 🚀

### 1. Clone or Download the Project

```bash
cd StarMatch
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Edit the `.env` file with your credentials:

```env
# Telegram Bot Configuration
BOT_TOKEN=8555973237:AAH3f-vCLfCG6d4jF6GNmcU3odBIONhRMKQ
ADMIN_ID=7806240300

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/starmatch

# Server Configuration
PORT=3000
NODE_ENV=development
```

### 4. Start MongoDB

Make sure MongoDB is running:

```bash
# For local MongoDB
mongod
```

Or use MongoDB Atlas (cloud) and update the `MONGODB_URI` accordingly.

### 5. Start the Server

```bash
npm start
```

The server will start on `http://localhost:3000`

## Bot Setup 🤖

### 1. Create Your Bot with BotFather

1. Open Telegram and search for [@BotFather](https://t.me/BotFather)
2. Send `/newbot` and follow the instructions
3. Save your bot token
4. Send `/setdomain` and set your domain (for production) or ngrok URL (for testing)

### 2. Configure WebApp

1. Send `/newapp` to @BotFather
2. Select your bot
3. Provide app details:
   - Title: StarMatch
   - Description: Find your perfect match
   - Photo: Upload app icon
   - Demo GIF: Optional
   - WebApp URL: `http://localhost:3000` (or your production URL)

### 3. Set Bot Commands

Send these commands to @BotFather using `/setcommands`:

```
start - Start StarMatch and open the app
profile - View your profile
stats - Admin statistics (admin only)
```

### 4. Enable Payments

For Telegram Stars:
1. Send `/mybots` to @BotFather
2. Select your bot
3. Choose "Payments"
4. Select "Telegram Stars" as payment provider
5. No additional configuration needed for Stars

## Development Testing 🧪

### Using ngrok for Local Testing

1. Install ngrok: https://ngrok.com/download

2. Start your server:
```bash
npm start
```

3. In another terminal, start ngrok:
```bash
ngrok http 3000
```

4. Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`)

5. Update your bot's WebApp URL with this ngrok URL in @BotFather

6. Update `server.js` line 103 to use your ngrok URL:
```javascript
const webAppUrl = `https://YOUR_NGROK_URL.ngrok.io/`;
```

## Deployment 🌐

### Option 1: Railway

1. Create account at https://railway.app
2. Create new project from GitHub
3. Add MongoDB service
4. Set environment variables
5. Deploy

### Option 2: Heroku

1. Create Heroku account
2. Install Heroku CLI
3. Create new app:
```bash
heroku create starmatch-app
```

4. Add MongoDB addon:
```bash
heroku addons:create mongolab
```

5. Set environment variables:
```bash
heroku config:set BOT_TOKEN=your_token
heroku config:set ADMIN_ID=7806240300
```

6. Deploy:
```bash
git push heroku main
```

### Option 3: VPS (DigitalOcean, AWS, etc.)

1. Set up Ubuntu server
2. Install Node.js and MongoDB
3. Clone repository
4. Install dependencies
5. Use PM2 for process management:
```bash
npm install -g pm2
pm2 start server.js --name starmatch
pm2 save
pm2 startup
```

6. Set up Nginx as reverse proxy
7. Configure SSL with Let's Encrypt

## Environment Configuration 🔧

### Production Settings

For production, update `.env`:

```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/starmatch
PORT=3000
```

And update `server.js` line 103 with your production URL:
```javascript
const webAppUrl = `https://yourdomain.com/`;
```

## Bot Commands 📱

Users can interact with the bot using:

- `/start` - Initialize bot and open StarMatch WebApp
- `/start REFERRAL_CODE` - Join using referral link
- `/profile` - View profile statistics
- `/stats` - Admin only - View platform statistics

## Admin Features 🔐

Admin user (ID: 7806240300) has access to:

- Admin Panel in WebApp
- View all users
- Monitor transactions
- Track revenue
- View activity statistics

Access admin panel by clicking the Admin button in the app (only visible to admin).

## Payment Flow 💰

1. User clicks "Buy Stars" in app
2. Selects amount (15, 50, or 100 Stars)
3. Telegram payment window opens
4. User completes payment with Telegram Stars
5. Stars added to user balance
6. Revenue automatically tracked for admin

**Note:** All Stars revenue goes to the admin account (ID: 7806240300)

## Referral System 🎁

1. Users get unique referral code
2. Share code with friends
3. When friend joins, referrer gets 5 Stars
4. Friend also tracked in referral count

## Daily Streak Rewards 🔥

- Users earn streak by logging in daily
- Every 3-day streak = 1 free filtered match
- Streak resets if user misses a day
- Free matches can be used instead of 15 Stars

## Security Notes 🔒

- Bot token should be kept secret
- Use environment variables for sensitive data
- Implement rate limiting in production
- Validate all user inputs
- Use HTTPS in production
- Implement proper authentication

## Troubleshooting 🔧

### Bot not responding
- Check bot token is correct
- Ensure server is running
- Verify MongoDB connection

### WebApp not loading
- Check WebApp URL is correct
- Ensure HTTPS in production
- Verify CORS settings

### Payments not working
- Ensure bot has Stars payment enabled
- Check payment events are being caught
- Verify admin ID is correct

## Customization 🎨

### Changing Costs

Edit in `.env`:
```env
FILTERED_MATCH_COST=15  # Change to desired amount
```

And update UI text in `public/index.html`.

### Changing Colors/Theme

Edit CSS variables in `public/styles.css`:
```css
:root {
    --primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    --secondary-gradient: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    /* ... */
}
```

### Adding More Interests

Users can add custom interests in their profile.
To suggest default interests, modify the frontend form.

## Support 📧

For issues or questions:
- Check the troubleshooting section
- Review bot logs
- Check MongoDB connection
- Verify environment variables

## License 📄

This project is for educational purposes. Modify as needed for your use case.

---

Built with ❤️ for Telegram Mini Apps
