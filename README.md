# Audit Follow-Up Management System (AFMS)

A custom-built audit follow-up management system for Ghana-based organizations, featuring finding tracking, dashboard analytics, and workflow automation.

## Tech Stack

- **Backend:** Node.js + Express
- **Database:** MySQL (via XAMPP)
- **Frontend:** React + TypeScript + Tailwind CSS + Vite
- **Authentication:** JWT

## Project Structure

```
audit-fup/
├── backend/               # Node.js API
│   ├── src/
│   │   ├── config/       # Database configuration
│   │   ├── controllers/  # API logic
│   │   ├── middleware/   # Auth & logging
│   │   ├── routes/       # API endpoints
│   │   └── index.js      # Entry point
│   ├── package.json
│   └── .env              # Environment variables
│
├── frontend/              # React app
│   ├── src/
│   │   ├── components/   # Layout & UI
│   │   ├── pages/        # Page views
│   │   ├── services/     # API calls
│   │   ├── context/      # Auth context
│   │   └── App.tsx
│   ├── package.json
│   └── vite.config.ts
│
└── README.md
```

## Installation & Setup

### Prerequisites
- XAMPP (MySQL, Apache)
- Node.js 18+

### 1. Start MySQL (XAMPP)
1. Open XAMPP Control Panel
2. Start MySQL service
3. Create database: `audit_fup_db` (or let the app create it)

### 2. Backend Setup
```bash
cd C:\xampp\htdocs\audit-fup\backend
npm install
npm start
```
Backend runs on http://localhost:3000

### 3. Frontend Setup (for development)
```bash
cd C:\xampp\htdocs\audit-fup\frontend
npm install
npm run dev
```
Frontend runs on http://localhost:5173

### 4. Production Build
```bash
cd C:\xampp\htdocs\audit-fup\frontend
npm run build
```

## Default Login

After registration, use your credentials to login.

## Features

- Dashboard with KPIs and charts
- Findings management (CRUD)
- User management (admin only)
- Audit trail logging
- Role-based access control
- Responsive design

## API Endpoints

### Authentication
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - Login
- GET `/api/auth/profile` - Get current user
- GET `/api/auth/users` - List all users

### Findings
- GET `/api/findings` - List all findings
- GET `/api/findings/:id` - Get finding details
- POST `/api/findings` - Create finding
- PUT `/api/findings/:id` - Update finding
- DELETE `/api/findings/:id` - Delete finding
- GET `/api/findings/stats` - Dashboard statistics

## Ghana Compliance

- Bank of Ghana directives support
- SEC Ghana compliance fields
- Data Protection Act 2012 fields
- ISO 27001 control mapping support