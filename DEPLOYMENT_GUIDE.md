# 🚀 Deployment Guide - Get Your Permanent URL

## Quick Deployment Options

### Option 1: Railway (Recommended - 5 minutes) ⚡

**Steps:**

1. **Sign up at Railway.app**
   - Go to https://railway.app
   - Sign up with GitHub

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Connect your GitHub account
   - Select your StarMatch repository

3. **Add MongoDB**
   - In your project, click "+ New"
   - Select "Database" → "MongoDB"
   - Railway will automatically create a MongoDB instance

4. **Set Environment Variables**
   - Click on your service
   - Go to "Variables" tab
   - Add these variables:
     ```
     BOT_TOKEN=8555973237:AAH3f-vCLfCG6d4jF6GNmcU3odBIONhRMKQ
     ADMIN_ID=7806240300
     MONGODB_URI=mongodb://mongo:27017/starmatch
     PORT=3000
     NODE_ENV=production
     ```
   - Note: Railway will auto-provide MONGODB_URI from the MongoDB service

5. **Deploy**
   - Railway will automatically deploy
   - Wait 2-3 minutes for deployment
   - You'll get a URL like: `https://starmatch-production.up.railway.app`

6. **Get Your Permanent URL**
   - Click "Settings" tab
   - Under "Domains" you'll see your Railway URL
   - Copy this URL (e.g., `https://starmatch-production.up.railway.app`)

7. **Update Your Code**
   - Update `server.js` line 103:
   ```javascript
   const webAppUrl = `https://starmatch-production.up.railway.app/`;
   ```
   - Push changes to GitHub
   - Railway will auto-redeploy

8. **Configure Telegram Bot**
   - Go to @BotFather on Telegram
   - Send `/newapp`
   - Set your Railway URL as the WebApp URL
   - Done! ✅

---

### Option 2: Render.com (Free Tier Available) 🆓

**Steps:**

1. **Sign up at Render.com**
   - Go to https://render.com
   - Sign up with GitHub

2. **Create Web Service**
   - Click "New +"
   - Select "Web Service"
   - Connect your repository

3. **Configure Service**
   - Name: starmatch
   - Environment: Node
   - Build Command: `npm install`
   - Start Command: `npm start`

4. **Add MongoDB**
   - Use MongoDB Atlas (free): https://www.mongodb.com/cloud/atlas
   - Create free cluster
   - Get connection string
   - Add to environment variables

5. **Set Environment Variables**
   - Add all variables from `.env`
   - Use MongoDB Atlas connection string

6. **Deploy**
   - Click "Create Web Service"
   - Get your URL: `https://starmatch.onrender.com`

7. **Update Bot Configuration**
   - Update `server.js` with your Render URL
   - Configure @BotFather with your URL

---

### Option 3: Vercel (Frontend) + MongoDB Atlas 🌐

**For Frontend Only (Static):**

1. **Deploy to Vercel**
   ```bash
   npm install -g vercel
   cd StarMatch
   vercel
   ```

2. **For Backend**
   - Use Vercel Serverless Functions OR
   - Keep backend on Railway/Render

3. **Get URL**
   - Vercel provides: `https://starmatch.vercel.app`

---

### Option 4: Heroku 🟣

**Steps:**

1. **Install Heroku CLI**
   ```bash
   # Download from: https://devcenter.heroku.com/articles/heroku-cli
   ```

2. **Login and Create App**
   ```bash
   heroku login
   cd StarMatch
   heroku create starmatch-dating-app
   ```

3. **Add MongoDB**
   ```bash
   heroku addons:create mongolab:sandbox
   ```

4. **Set Environment Variables**
   ```bash
   heroku config:set BOT_TOKEN=8555973237:AAH3f-vCLfCG6d4jF6GNmcU3odBIONhRMKQ
   heroku config:set ADMIN_ID=7806240300
   heroku config:set NODE_ENV=production
   ```

5. **Deploy**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git push heroku main
   ```

6. **Get Your URL**
   - Heroku provides: `https://starmatch-dating-app.herokuapp.com`

---

## 🔧 After Getting Your Permanent URL

### 1. Update Your Code

**File: `server.js` (Line 103)**
```javascript
// BEFORE (localhost):
const webAppUrl = `http://localhost:${PORT}/`;

// AFTER (your permanent URL):
const webAppUrl = `https://your-permanent-url.com/`;
```

**File: `public/app.js` (Line 386)**
```javascript
// Replace 'YOUR_BOT_USERNAME' with your actual bot username
const botUsername = 'StarMatchBot'; // Your bot username from @BotFather
```

### 2. Configure Telegram Bot

**A. Set WebApp URL:**
1. Open Telegram
2. Search for @BotFather
3. Send `/newapp`
4. Select your bot
5. Follow prompts and enter your permanent URL
6. Example: `https://starmatch-production.up.railway.app`

**B. Alternative - Set Menu Button:**
```
/setmenubutton
Select your bot
Send your WebApp URL
```

### 3. Test Your Deployment

1. Open your bot on Telegram
2. Send `/start`
3. Click "Open StarMatch" button
4. App should load from your permanent URL
5. Test matching and payment features

---

## 💰 Cost Comparison

| Service | Free Tier | Paid | MongoDB | Best For |
|---------|-----------|------|---------|----------|
| **Railway** | $5 credit (500 hours) | $5/month | Included | Quick deploy |
| **Render** | ✅ Free (750 hours) | $7/month | Use Atlas | Budget option |
| **Vercel** | ✅ Free | $20/month | Need separate | Frontend |
| **Heroku** | ❌ No free tier | $7/month | Add-on $0-15 | Enterprise |

**Recommendation:** Start with **Railway** (easiest) or **Render** (free tier)

---

## 🐛 Troubleshooting

### Bot shows "WebApp not available"
- ✅ Check URL is correct in @BotFather
- ✅ Ensure app is deployed and running
- ✅ URL must be HTTPS (not HTTP)

### App loads but shows errors
- ✅ Check environment variables are set
- ✅ Verify MongoDB connection
- ✅ Check server logs on hosting platform

### Payments not working
- ✅ Ensure bot has Telegram Stars enabled
- ✅ Check BOT_TOKEN is correct
- ✅ Verify payment webhook is accessible

---

## 📱 Quick Start with Railway (Fastest)

1. Go to https://railway.app/new
2. Connect GitHub repo
3. Add MongoDB database
4. Set environment variables
5. Deploy (takes 2 minutes)
6. Copy your Railway URL
7. Update `server.js` with the URL
8. Push changes
9. Configure bot in @BotFather
10. Done! 🎉

Your permanent URL will be: `https://starmatch-production-xxxx.up.railway.app`

---

## Need Help?

- Railway Docs: https://docs.railway.app
- Render Docs: https://render.com/docs
- Telegram Bot API: https://core.telegram.org/bots/webapps
