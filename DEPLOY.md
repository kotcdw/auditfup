# Deployment Guide - Free Hosting

This guide covers how to deploy your Audit Follow-Up Management System for free.

---

## Option 1: Render (Recommended)

### Prerequisites
- GitHub account
- Your project pushed to GitHub

### Steps

1. **Push code to GitHub**
   ```bash
   cd C:\xampp\htdocs\audit-fup
   git init
   git add .
   git commit -m "Initial commit"
   # Create repo on GitHub and push
   ```

2. **Set up Render**
   - Go to https://render.com and sign up
   - Click "New" → "Web Service"
   - Connect your GitHub and select the `audit-fup` repo

3. **Configure**
   - **Name:** `audit-fup`
   - **Region:** Oregon (or closest to you)
   - **Branch:** main
   - **Build Command:** `cd backend && npm install`
   - **Start Command:** `node backend/src/index.js`

4. **Environment Variables** (in Render dashboard)
   ```
   PORT=3000
   DB_HOST=your-mysql-host.render.com
   DB_USER=your-db-user
   DB_PASSWORD=your-db-password
   DB_NAME=audit_fup_db
   JWT_SECRET=your-secure-random-string
   ```

5. **Database** (Free PostgreSQL on Render)
   - In Render dashboard: New → PostgreSQL
   - Copy the "Internal Database URL" to DB_HOST

6. **Deploy** - Click "Create Web Service"

---

## Option 2: Railway

1. **Go to** https://railway.app and sign up
2. **New Project** → "Empty Project"
3. **Add MySQL** - Click "New" → "MySQL"
4. **Add Node.js** - Click "New" → "GitHub Repo" → select your repo
5. **Configure:**
   - **Root Directory:** backend
   - **Build Command:** `npm install`
   - **Start Command:** `node src/index.js`
6. **Variables** - Add same as Render above
7. **Deploy**

---

## Option 3: Fly.io

1. **Install CLI:** `npm install -g flyctl`
2. **Sign up:** `flyctl auth signup`
3. **Create app:** `flyctl apps create audit-fup`
4. **Add MySQL:** `flyctl postgres create`
5. **Deploy:** `flyctl deploy`
6. **Set variables:** `flyctl secrets set JWT_SECRET=your-secret DB_HOST=...`

---

## Option 4: Oracle Cloud (Always Free)

1. **Sign up** at https://cloud.oracle.com
2. **Create VM** - Compute → Instances
3. **Configure:**
   - Image: Ubuntu 22.04
   - Shape: VM.Standard.E2.1.Micro (Always Free)
4. **Connect via SSH** and run:
   ```bash
   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Install MySQL
   sudo apt install mysql-server
   
   # Clone your repo
   git clone your-repo-url
   cd audit-fup
   cd backend && npm install
   node src/index.js
   ```

---

## Environment Variables Needed

| Variable | Description | Example |
|----------|-------------|---------|
| PORT | Server port | 3000 |
| DB_HOST | Database hostname | mysql.render.com |
| DB_USER | Database username | postgres |
| DB_PASSWORD | Database password | ***** |
| DB_NAME | Database name | audit_fup_db |
| JWT_SECRET | Secret for JWT tokens | random-32-char-string |

---

## Database Setup for Cloud

Since you're using XAMPP MySQL locally, you need to either:

### Option A: Export and Import to Cloud DB

1. **Export from XAMPP:**
   ```bash
   mysqldump -u root audit_fup_db > backup.sql
   ```

2. **Import to cloud (after creating DB):**
   ```bash
   mysql -h cloud-host -u user -p audit_fup_db < backup.sql
   ```

### Option B: Let the App Create Tables

The app already has `initDatabase()` that creates tables on first run - just make sure the DB is empty or new.

---

## Frontend Build

The frontend needs to be built for production. Already done:
- Run `npm run build` in frontend folder
- Output is in `frontend/dist/`

For production serving, the backend can serve the static files or use a CDN.

---

## Quick Start Checklist

- [ ] Push code to GitHub
- [ ] Create free account on Render.com
- [ ] Create PostgreSQL database
- [ ] Create Web Service for backend
- [ ] Set environment variables
- [ ] Deploy
- [ ] Test at your-app-name.onrender.com

---

## Troubleshooting

### Common Issues:
1. **Build fails** - Check build command is `cd backend && npm install`
2. **Database connection** - Verify DB_HOST, DB_USER, DB_PASSWORD
3. **Port error** - Make sure server listens on PORT env variable (already configured)

### Need Help?
The backend code is already configured to use environment variables from `.env` file.