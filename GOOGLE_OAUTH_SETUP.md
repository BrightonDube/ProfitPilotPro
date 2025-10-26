# Google OAuth Setup Guide for BizPilot

## 📋 Prerequisites
- Google account
- Access to Google Cloud Console

## 🚀 Step-by-Step Setup

### Step 1: Access Google Cloud Console
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Sign in with your Google account

### Step 2: Create a New Project (or Select Existing)
1. Click the project dropdown at the top
2. Click "NEW PROJECT"
3. Name it: `BizPilot` (or your preferred name)
4. Click "CREATE"
5. Wait for project creation (takes about 30 seconds)

### Step 3: Enable Google+ API
1. In the sidebar, go to **APIs & Services** → **Library**
2. Search for "Google+ API"
3. Click on "Google+ API"
4. Click **ENABLE** button
5. Wait for it to enable

### Step 4: Configure OAuth Consent Screen
1. Go to **APIs & Services** → **OAuth consent screen**
2. Choose **External** (unless you have a Google Workspace account)
3. Click **CREATE**

Fill in the required fields:
- **App name**: BizPilot
- **User support email**: Your email
- **Developer contact information**: Your email

Optional but recommended:
- **App logo**: Upload your BizPilot logo
- **App domain**: Leave blank for now (for local development)

4. Click **SAVE AND CONTINUE**

### Step 5: Add Scopes
1. Click **ADD OR REMOVE SCOPES**
2. Select these scopes:
   - `.../auth/userinfo.email`
   - `.../auth/userinfo.profile`
   - `openid`
3. Click **UPDATE**
4. Click **SAVE AND CONTINUE**

### Step 6: Add Test Users (For Development)
1. Click **ADD USERS**
2. Add your email and any test emails
3. Click **ADD**
4. Click **SAVE AND CONTINUE**

### Step 7: Create OAuth 2.0 Credentials
1. Go to **APIs & Services** → **Credentials**
2. Click **CREATE CREDENTIALS** → **OAuth client ID**
3. Choose **Application type**: Web application
4. Name: `BizPilot Web Client`

### Step 8: Configure Authorized URLs
Add these exact URLs:

**Authorized JavaScript origins:**
```
http://localhost:3000
http://localhost:5000
http://localhost:8081
```

**Authorized redirect URIs:**
```
http://localhost:5000/api/v1/auth/google/callback
http://localhost:3000/auth/callback
```

5. Click **CREATE**

### Step 9: Copy Your Credentials
A popup will show your credentials:
- **Client ID**: Copy this (looks like: 123456789-xxxxx.apps.googleusercontent.com)
- **Client Secret**: Copy this (looks like: GOCSPX-xxxxxxxxxxxxx)

⚠️ **IMPORTANT**: Save these somewhere safe temporarily!

### Step 10: Update Your .env File
Update your `backend/.env` file:
```env
GOOGLE_CLIENT_ID="YOUR_CLIENT_ID_HERE"
GOOGLE_CLIENT_SECRET="YOUR_CLIENT_SECRET_HERE"
```

## 🧪 Testing Your Setup

### Test OAuth Flow:
1. Visit: http://localhost:5000/api/v1/auth/google
2. You should be redirected to Google login
3. After login, you'll be redirected back to your app

### Test Endpoints:
```bash
# Health check
curl http://localhost:5000/health

# Google OAuth initiation
curl http://localhost:5000/api/v1/auth/google
```

## 🚨 Common Issues & Solutions

### "Error 400: redirect_uri_mismatch"
- Double-check your redirect URIs in Google Console
- Make sure they match EXACTLY (including http:// and trailing slashes)

### "This app isn't verified"
- This is normal for development
- Click "Advanced" → "Go to BizPilot (unsafe)"
- This won't appear once you verify your app for production

### "Access blocked: Authorization Error"
- Make sure Google+ API is enabled
- Check that your test email is added to test users

## 🚀 Production Setup (Later)

When deploying to production:
1. Add your production domain to authorized origins
2. Add production callback URLs
3. Verify your app with Google (for public use)
4. Update your production `.env` file

## 📝 Environment Variables Summary

Your `backend/.env` should have:
```env
# OAuth2 Configuration
GOOGLE_CLIENT_ID="123456789-xxxxx.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-xxxxxxxxxxxxx"
```

## ✅ You're Done!
Your Google OAuth is now configured for local development!
