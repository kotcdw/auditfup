# Deployment Guide - Free Hosting

This guide covers how to deploy your Audit Follow-Up Management System for free.

---

## Option 1: Render (Recommended)

### Prerequisites
- GitHub account
- Your project pushed to GitHub (https://github.com/kotcdw/auditfup.git)

### Steps

1. **Go to** https://dashboard.render.com
2. **Create new Blueprint** - Click "New" → "Blueprint"
3. **Connect your repo** - Select `kotcdw/auditfup` from GitHub
4. **Review render.yaml** - It will create both the PostgreSQL database and backend service
5. **Click "Apply"** - Render will create:
   - `audit-fup-db` - PostgreSQL 16 (free)
   - `audit-fup-backend` - Node.js web service
6. **Done!** - Auto-deploys when complete

### Environment Variables (Auto-configured)
The render.yaml automatically configures:
- `DB_TYPE=postgresql`
- `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` from the PostgreSQL service

You only need to set in Render dashboard:
```
JWT_SECRET=your-secure-random-string-min-32-chars
JWT_EXPIRES_IN=24h
```

### Manual Setup (if not using Blueprint)
1. Create PostgreSQL: New → PostgreSQL
2. Create Web Service: New → Web Service
3. Configure:
   - Name: `audit-fup-backend`
   - Region: Oregon
   - Build Command: `cd backend && npm install`
   - Start Command: `node backend/src/index.js`
4. Add Environment Variables:
   ```
   DB_TYPE=postgresql
   DB_HOST=<from PostgreSQL internal URL>
   DB_USER=<from PostgreSQL>
   DB_PASSWORD=<from PostgreSQL>
   DB_NAME=<from PostgreSQL>
   JWT_SECRET=your-secure-random-string
   ```

---

## Option 2: Railway

1. **Go to** https://railway.app and sign up
2. **New Project** → "Empty Project"
3. **Add PostgreSQL** - Click "New" → "PostgreSQL"
4. **Add Node.js** - Click "New" → "GitHub Repo" → select your repo
5. **Configure:**
   - **Root Directory:** backend
   - **Build Command:** `npm install`
   - **Start Command:** `node src/index.js`
6. **Variables** - Add:
   ```
   DB_TYPE=postgresql
   JWT_SECRET=your-secure-string
   ```
7. **Deploy**

---

## Option 3: Fly.io

1. **Install CLI:** `npm install -g flyctl`
2. **Sign up:** `flyctl auth signup`
3. **Create app:** `flyctl apps create audit-fup`
4. **Add PostgreSQL:** `flyctl postgres create`
5. **Deploy:** `flyctl deploy`
6. **Set variables:** `flyctl secrets set DB_TYPE=postgresql JWT_SECRET=your-secret`

---

## Local Development (XAMPP)

1. Start XAMPP MySQL
2. Navigate to backend folder:
   ```bash
   cd C:\xampp\htdocs\audit-fup\backend
   npm install
   node src/index.js
   ```
3. Server runs at http://localhost:3000

---

## Environment Variables

| Variable | Description | Local (XAMPP) | Render |
|----------|-------------|---------------|--------|
| PORT | Server port | 3000 | 3000 |
| DB_TYPE | Database type | mysql | postgresql |
| DB_HOST | Database hostname | localhost | (auto) |
| DB_USER | Database username | root | (auto) |
| DB_PASSWORD | Database password | (empty) | (auto) |
| DB_NAME | Database name | audit_fup_db | (auto) |
| JWT_SECRET | Secret for JWT tokens | your-secret | your-secret |
| JWT_EXPIRES_IN | Token expiration | 24h | 24h |

---

## Database Setup

### On First Deploy
The app's `initDatabase()` creates all tables automatically.

### Frontend Build
The frontend is already built. For production:
```bash
cd frontend
npm run build
```
Output: `frontend/dist/`

---

## Quick Start Checklist

- [x] Push code to GitHub
- [ ] Create Render account
- [ ] Create Blueprint from render.yaml
- [ ] Apply and wait for deployment
- [ ] Test at https://audit-fup-backend.onrender.com/api/health

---

## Troubleshooting

### Common Issues:
1. **Build fails** - Check build command is `cd backend && npm install`
2. **Database connection** - Verify PostgreSQL service is running
3. **Port error** - Server listens on PORT env variable

### Check Logs:
In Render dashboard → your service → "Logs"

### Need Help?
The backend code supports both MySQL (local) and PostgreSQL (cloud).
Set `DB_TYPE=mysql` for local XAMPP, `DB_TYPE=postgresql` for cloud.