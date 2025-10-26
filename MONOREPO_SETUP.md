# BizPilot Monorepo Setup with pnpm

## 🚀 Quick Start

This monorepo uses **pnpm workspaces** to manage multiple packages efficiently.

### Prerequisites
- Node.js >= 18.0.0
- pnpm (install with `npm install -g pnpm`)

### Project Structure
```
BizPilot/
├── backend/        # Express.js API server (port 5000)
├── web/           # Next.js web application (port 3000)
├── mobile/        # React Native mobile app
├── shared/        # Shared utilities and types
└── pnpm-workspace.yaml  # Workspace configuration
```

## 📦 Installation

Install all dependencies for all packages:
```bash
pnpm install
```

## 🏃 Running the Monorepo

### Option 1: Start Everything (Recommended)
**Windows PowerShell:**
```powershell
./start.ps1
```

**Windows Command Prompt:**
```cmd
start.bat
```

**Or use pnpm directly:**
```bash
pnpm run dev:all
```

This will start:
- ✅ Backend API on http://localhost:5000
- ✅ Web Frontend on http://localhost:3000

### Option 2: Start Services Individually
```bash
# Start only backend
pnpm run dev:backend

# Start only web
pnpm run dev:web
```

### Option 3: Parallel Mode (All services)
```bash
pnpm run dev
```

## 📝 Available Commands

| Command | Description |
|---------|------------|
| `pnpm run dev` | Start all services in parallel |
| `pnpm run dev:all` | Start backend and web with colored output |
| `pnpm run dev:backend` | Start only backend server |
| `pnpm run dev:web` | Start only web application |
| `pnpm run build` | Build all packages |
| `pnpm run test` | Run tests for all packages |
| `pnpm run lint` | Lint all packages |
| `pnpm run db:migrate` | Run database migrations |
| `pnpm run db:studio` | Open Prisma Studio |
| `pnpm run clean` | Clean all build artifacts |

## 🗄️ Database Commands

```bash
# Generate Prisma client
pnpm run db:generate

# Run migrations
pnpm run db:migrate

# Push schema changes (development)
pnpm run db:push

# Open Prisma Studio
pnpm run db:studio
```

## 🧪 Testing & Linting

```bash
# Run all tests
pnpm run test

# Run tests for specific package
pnpm run test:backend
pnpm run test:web

# Run linting
pnpm run lint
```

## 🐳 Docker Support

```bash
# Start services with Docker
pnpm run docker:up

# Stop Docker services
pnpm run docker:down

# Build Docker images
pnpm run docker:build
```

## 🔧 Workspace Management

### Add a dependency to a specific workspace
```bash
# Add to backend
pnpm --filter bizpilot-backend add express

# Add to web
pnpm --filter bizpilot-web add react

# Add dev dependency
pnpm --filter bizpilot-backend add -D @types/express
```

### Run command in specific workspace
```bash
# Run any command in backend
pnpm --filter bizpilot-backend exec <command>

# Run script in web
pnpm --filter bizpilot-web run <script>
```

### Update all dependencies
```bash
pnpm update --recursive
```

## 🚨 Troubleshooting

### Port already in use
If you get a port conflict error:
- Backend (5000): Check if another process is using port 5000
- Web (3000): Check if another Next.js app is running

**Kill processes on Windows:**
```powershell
# Find process using port
netstat -ano | findstr :5000
netstat -ano | findstr :3000

# Kill process by PID
taskkill /PID <PID> /F
```

### Prisma Generation Errors
If you see Prisma errors during install:
```bash
# Manually generate Prisma client
pnpm run db:generate
```

### Clean Install
If you encounter issues, try a clean install:
```bash
pnpm run clean
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

## 📚 Learn More

- [pnpm Workspaces Documentation](https://pnpm.io/workspaces)
- [Next.js Documentation](https://nextjs.org/docs)
- [Express.js Documentation](https://expressjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs)

## 🎯 Benefits of pnpm Workspaces

1. **Shared Dependencies**: Common packages are installed once and linked
2. **Fast Installations**: pnpm uses hard links, saving disk space
3. **Consistent Versions**: Ensures all packages use same dependency versions
4. **Parallel Execution**: Run commands across all packages simultaneously
5. **Better Monorepo Support**: Native workspace protocol for internal dependencies

---

✨ Happy coding with your BizPilot monorepo!
