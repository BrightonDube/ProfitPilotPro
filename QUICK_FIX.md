# 🔧 Quick Fix for Database Connection Reset Error

## The Problem
Your Render.com database is experiencing connection resets (Error 10054). This typically happens when:
- Free tier database goes to sleep after inactivity
- Connection limits are exceeded
- Network issues between your app and Render

## Immediate Solutions

### Option 1: Switch to Supabase (Recommended - 5 minutes) ✅
1. Go to [https://supabase.com](https://supabase.com)
2. Sign up with GitHub/Google (free)
3. Create new project "BizPilot"
4. Wait 1 minute for setup
5. Go to Settings → Database → Connection string
6. Copy the string and replace line 11 in your `.env`:
```env
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres?pgbouncer=true"
```
7. Save - nodemon will auto-restart

### Option 2: Use Local PostgreSQL 🖥️
If you have PostgreSQL installed locally:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/bizpilot_dev"
```

### Option 3: Try to Fix Render Connection 🔄
The current `.env` already has connection pooling parameters added. If it still fails:
1. Log into [Render Dashboard](https://dashboard.render.com)
2. Check if your database is active
3. Try waking it up by accessing it in the dashboard
4. If it's suspended (free tier after 90 days), you'll need to upgrade or switch

## Why Supabase is Better for Development
- ✅ More generous free tier (500MB vs 100MB)
- ✅ Doesn't sleep after 15 minutes of inactivity
- ✅ Built-in connection pooling
- ✅ Better performance
- ✅ Includes authentication, storage, and realtime features

## After Switching Database
```bash
# 1. Generate Prisma client
pnpm --filter bizpilot-backend exec prisma generate

# 2. Push schema to new database
pnpm --filter bizpilot-backend exec prisma db push

# 3. Your app will auto-restart with nodemon
```

## Current Status
- Backend is running but database keeps disconnecting
- All other features (JWT, OAuth) are configured correctly
- Once you switch databases, everything will work smoothly
