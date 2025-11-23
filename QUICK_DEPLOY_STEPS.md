# 🚀 Quick Deploy to Railway - Get Your Permanent URL

## ✅ MongoDB Atlas is Ready!
Your database is configured: `starmatch.h6mookx.mongodb.net`

---

## 📋 Deploy Steps (5-10 minutes):

### Step 1: Push Code to GitHub

1. **Create GitHub Repository:**
   - Go to https://github.com/new
   - Name: `StarMatch`
   - Make it Public or Private
   - Don't initialize with README
   - Click "Create repository"

2. **Push Your Code:**
   ```bash
   cd StarMatch
   git init
   git add .
   git commit -m "Initial commit - StarMatch Dating App"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/StarMatch.git
   git push -u origin main
   ```

   Replace `YOUR_USERNAME` with your GitHub username

---

### Step 2: Deploy to Railway

1. **Go to Railway:**
   - Open: https://railway.app
   - Click "Login" → "Login with GitHub"
   - Authorize Railway

2. **Create New Project:**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Find and select your "StarMatch" repository
   - Click "Deploy Now"

3. **Configure Environment Variables:**
   - Click on your deployed service
   - Go to "Variables" tab
   - Click "+ New Variable"
   - Add these one by one:

   ```
   BOT_TOKEN=8555973237:AAH3f-vCLfCG6d4jF6GNmcU3odBIONhRMKQ
   ADMIN_ID=7806240300
   MONGODB_URI=mongodb+srv://Dabialzap:Bhai9595@starmatch.h6mookx.mongodb.net/?appName=Starmatch
   NODE_ENV=production
   PORT=3000
   ```

4. **Wait for Deployment:**
   - Railway will automatically build and deploy
   - Wait 2-3 minutes
   - Look for "✅ Success" message

5. **Get Your Permanent URL:**
   - Click "Settings" tab
   - Under "Networking" or "Domains" section
   - Click "Generate Domain"
   - You'll get a URL like: `https://starmatch-production-xxxx.up.railway.app`
   - **COPY THIS URL** - This is your permanent URL!

---

### Step 3: Update Your Code with Permanent URL

1. **Update server.js:**
   - Open `server.js`
   - Find line 103
   - Replace with your Railway URL:
   ```javascript
   const webAppUrl = `https://starmatch-production-xxxx.up.railway.app/`;
   ```

2. **Update app.js:**
   - Open `public/app.js`
   - Find line 386
   - Replace with your bot username:
   ```javascript
   const botUsername = 'YOUR_BOT_USERNAME'; // Get from @BotFather
   ```

3. **Push Changes:**
   ```bash
   git add .
   git commit -m "Update with Railway URL"
   git push
   ```
   - Railway will automatically redeploy (takes 1-2 minutes)

---

### Step 4: Configure Telegram Bot

1. **Open Telegram** and search for `@BotFather`

2. **Create/Configure WebApp:**
   ```
   Send: /newapp
   Select your bot
   Provide app details:
   - Title: StarMatch
   - Description: Find your perfect match with StarMatch! 💝
   - Photo: (upload app icon if you have one)
   - WebApp URL: https://starmatch-production-xxxx.up.railway.app
   ```
   (Replace with YOUR Railway URL)

3. **Or Update Existing Bot:**
   ```
   Send: /mybots
   Select your bot
   Click "Edit Bot"
   Click "Edit Web App"
   Enter your Railway URL
   ```

4. **Set Bot Commands:**
   ```
   Send: /setcommands
   Select your bot
   Send:
   start - Start StarMatch and open the app
   profile - View your profile
   ```

---

### Step 5: Test Your Deployed App! 🎉

1. **Open Your Bot** in Telegram
2. **Send** `/start`
3. **Click** "🚀 Open StarMatch" button
4. **App should load** from your Railway URL
5. **Test features:**
   - Create profile
   - Try random match
   - Test filtered match
   - Check payments work

---

## 🎯 Your Permanent URLs:

After deployment, you'll have:

- **Web App URL:** `https://starmatch-production-xxxx.up.railway.app`
- **Bot Username:** `@YourBotUsername`
- **Share Link:** `https://t.me/YourBotUsername`

---

## 💰 Railway Pricing:

- **Free:** $5 credit (good for ~500 hours)
- **Paid:** $5/month after credit runs out
- **Database:** Your MongoDB Atlas is separate (free tier = 512MB)

---

## ⚠️ IMPORTANT Security Note:

Your credentials are now in the file. After deployment:

1. **Create .env file on Railway** (already done with variables)
2. **Don't commit .env to GitHub**
3. **.gitignore is already set up** to exclude .env

---

## 🐛 Troubleshooting:

### Railway deployment fails:
- Check all environment variables are set correctly
- Check build logs in Railway dashboard
- Ensure `package.json` has correct `start` script

### Bot doesn't open app:
- Verify WebApp URL in @BotFather is correct
- Must be HTTPS, not HTTP
- Check URL has no trailing issues

### Database connection error:
- Verify MongoDB Atlas allows connections from anywhere (0.0.0.0/0)
- Check connection string has no typos
- Ensure database user has read/write permissions

### App loads but errors:
- Check Railway logs for errors
- Verify all environment variables are set
- Test MongoDB connection in Railway logs

---

## 🎉 Alternative: Render.com (Free Tier)

If Railway doesn't work, try Render:

1. Go to https://render.com
2. New Web Service from GitHub
3. Build Command: `npm install`
4. Start Command: `npm start`
5. Add environment variables
6. Deploy (takes 5-10 minutes)
7. Get URL: `https://starmatch.onrender.com`

---

## Need Help?

- Railway Support: https://help.railway.app
- Check deployment status on Railway dashboard
- View logs for errors
