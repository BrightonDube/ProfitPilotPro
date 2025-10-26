# 🚀 Neon Database Setup for BizPilot

## Quick Setup (3 minutes)

### Step 1: Create Neon Account
1. Go to [**https://neon.tech**](https://neon.tech)
2. Click "Start Free"
3. Sign up with GitHub/Google/Email

### Step 2: Create Database
1. Click "Create a project"
2. **Project name**: BizPilot
3. **Database name**: bizpilot (or keep default "neondb")
4. **Region**: Choose closest to you (e.g., US East, EU Central)
5. Click "Create project"

### Step 3: Get Connection String
After creation, you'll see your connection details:

1. **Choose**: "Pooled connection" (better for web apps)
2. **Copy** the connection string that looks like:
```
postgresql://[user]:[password]@[host]/neondb?sslmode=require
```

Example:
```
postgresql://alex:AbC123dEf@ep-cool-darkness-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
```

### Step 4: Update Your .env File
Replace line 11 in `backend/.env` with your Neon connection string:

```env
DATABASE_URL="postgresql://[user]:[password]@[host]/neondb?sslmode=require"
```

### Step 5: Push Your Schema
```bash
# Generate Prisma Client
pnpm --filter bizpilot-backend exec prisma generate

# Push schema to Neon database
pnpm --filter bizpilot-backend exec prisma db push
```

## ✅ That's it! Your app will auto-restart with nodemon

## Why Neon is Perfect for Your Project

| Feature | Neon | Render | Supabase |
|---------|------|--------|----------|
| Free Storage | 0.5 GB | 0.1 GB | 0.5 GB |
| Sleep/Hibernation | Never | After 15 min | Never |
| Connection Pooling | Built-in | Limited | Built-in |
| Branching | Yes | No | No |
| Auto-scaling | Yes | No | Limited |
| Performance | Fast | Slow (free) | Good |

## Neon Features You'll Love

### 🌳 Database Branching
Create branches of your database for testing:
```bash
# Create a branch for testing new features
neon branches create --name feature-test
```

### ⚡ Instant Wake
- No cold starts
- Scales to zero when not in use
- Instantly available when needed

### 🔒 Security
- SSL required by default
- IP allowlisting available
- Role-based access control

## Connection String Options

### For Development (with connection pooling):
```env
DATABASE_URL="postgresql://[user]:[password]@[host]/neondb?sslmode=require&pgbouncer=true"
```

### For Direct Connection (migrations):
```env
DATABASE_URL="postgresql://[user]:[password]@[host]/neondb?sslmode=require"
```

## Troubleshooting

### "SSL required" error
Make sure your connection string includes `?sslmode=require`

### Connection timeouts
Use the pooled connection endpoint (ends with `-pooler`)

### Schema push fails
Make sure you're using the direct connection URL (not pooled) for migrations

## Dashboard
Access your database dashboard at: https://console.neon.tech

## You're Done! 🎉
Your BizPilot app now has a reliable, scalable database that won't sleep or disconnect!
