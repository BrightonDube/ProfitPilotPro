# Database Setup Options for BizPilot

## Option 1: Supabase (Recommended - Free & Fast) ✅

### Step 1: Create Supabase Account
1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign up with GitHub/Google

### Step 2: Create New Project
1. Click "New project"
2. Fill in:
   - **Name**: BizPilot
   - **Database Password**: (generate a strong one and save it!)
   - **Region**: Choose closest to you
3. Click "Create new project"
4. Wait ~1 minute for setup

### Step 3: Get Connection String
1. Go to Settings → Database
2. Find "Connection string" → URI
3. Copy the string (looks like: `postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres`)

### Step 4: Update Your .env
```env
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres"
```

---

## Option 2: Neon (Alternative Free Tier) 🚀

1. Go to [https://neon.tech](https://neon.tech)
2. Sign up
3. Create project "BizPilot"
4. Copy connection string
5. Update .env

---

## Option 3: Local PostgreSQL with Docker 🐳

```bash
# Run PostgreSQL in Docker
docker run --name bizpilot-db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=bizpilot \
  -p 5432:5432 \
  -d postgres:15

# Update .env
DATABASE_URL="postgresql://postgres:password@localhost:5432/bizpilot"
```

---

## Option 4: Local PostgreSQL Installation 💻

### Windows:
1. Download PostgreSQL from [postgresql.org](https://www.postgresql.org/download/windows/)
2. Install with default settings
3. Remember the password you set
4. Create database: `createdb bizpilot`
5. Update .env:
```env
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@localhost:5432/bizpilot"
```

---

## Quick Fix Commands After Setting Up:

```bash
# 1. Generate Prisma Client
pnpm --filter bizpilot-backend exec prisma generate

# 2. Push schema to new database
pnpm --filter bizpilot-backend exec prisma db push

# 3. Restart your app
pnpm run dev:all
```
