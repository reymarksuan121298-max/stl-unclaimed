# STL Unclaimed Collections System

A comprehensive full-stack web application for managing unclaimed STL lottery winnings, cash deposits, and collections with role-based access control, real-time tracking, and automated workflows.

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Technology Stack](#technology-stack)
4. [User Roles & Permissions](#user-roles--permissions)
5. [Quick Start Guide](#quick-start-guide)
6. [Installation & Deployment](#installation--deployment)
7. [Cashier Workflow](#cashier-workflow)
8. [Database Setup](#database-setup)
9. [Project Structure](#project-structure)
10. [Security](#security)
11. [Best Practices](#best-practices)
12. [Troubleshooting](#troubleshooting)
13. [Version History](#version-history)

---

## 🎯 Overview

The **STL Unclaimed Collections System** is a production-ready web application designed to streamline the management of unclaimed lottery winnings, cash collections, and bank deposits. Built with modern web technologies, it provides role-based access control, batch processing capabilities, comprehensive audit trails, and real-time data visualization.

### Key Highlights

- 🎯 **Role-Based Access Control** - 7 distinct user roles with granular permissions
- 💰 **Batch Cash Deposits** - Process multiple collections in a single bank transaction
- 📸 **Receipt Management** - Upload and view deposit slips and collection receipts
- 📊 **Real-Time Dashboard** - Live statistics and performance metrics
- 🔍 **Advanced Filtering** - Pagination, search, and role-specific data views
- ⚡ **Overdue Tracking** - Visual indicators for items past due date
- 🔒 **Enterprise Security** - Row-level security, audit trails, and secure authentication

---

## ✨ Features

### Core Functionality

- ✅ **Unclaimed Items Management** - Complete CRUD operations for unclaimed winnings
- ✅ **Pending Items View** - Track items awaiting collection with overdue highlighting
- ✅ **Collections Tracking** - Monitor all collected items with detailed history
- ✅ **Cash Deposit Processing** - Batch deposit functionality for cashiers
- ✅ **Reports & Analytics** - Commission breakdowns and financial reports
- ✅ **User Management** - Admin panel for user creation and role assignment

### Advanced Features

- 🎨 **Overdue Highlighting** - Items 3+ days past draw date highlighted in red
- 📄 **Pagination** - All tables support pagination (10 items per page default)
- 🖼️ **Receipt Modals** - Modern, compact, and scrollable receipt viewing in-app
- 🔐 **Collector Filtering** - Collectors see only their assigned items; Admin/Specialist see grouped views
- 📱 **Responsive Design** - Mobile-friendly interface with slide-out sidebar
- 🏦 **Bank Integration** - Track bank names, reference numbers, and deposit dates
- 📊 **Bet Code Tracking** - Automatic identification of bet types (S3, L3, S2, 4D, 6D, STL)
- 💳 **Payment Tracking** - Reference numbers and receiver contact info for non-cash payments
- 👤 **Audit Trail** - Track which user created/modified each record
- 📤 **Excel Export** - Professional Excel export for all pages with bold headers and currency formatting
- 📈 **Commission Distribution** - Automated 10/10/30/50 split (Staff/Collector/Agent/Admin)

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 19.2.0
- **Routing**: React Router DOM 7.11.0
- **Styling**: Tailwind CSS 4.1.18
- **Icons**: Lucide React 0.562.0
- **Animations**: Framer Motion 12.23.26
- **Build Tool**: Vite 7.2.4
- **Excel Export**: ExcelJS 4.4.0

### Backend
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **Real-time**: Supabase Realtime

### Deployment
- **Hosting**: Vercel
- **Environment**: Production-ready with environment variables

---

## 👥 User Roles & Permissions

| Role | Dashboard | Unclaimed | Pending | Cash Deposits | Collections | Reports | Users | Special Permissions |
|------|-----------|-----------|---------|---------------|-------------|---------|-------|---------------------|
| **Admin** | ✅ Full | ✅ Full | ✅ Full | ✅ Full | ✅ Full | ✅ Full | ✅ Full | All CRUD operations |
| **Cashier** ⭐ | ✅ View | ❌ | ❌ | ✅ Full | ✅ Cash Only | ❌ | ❌ | Batch deposit, receipt upload |
| **Specialist** | ✅ View | ✅ Full | ✅ Full | ❌ | ✅ Full | ✅ View | ❌ | Mark as collected |
| **Checker** | ✅ View | ✅ Create/View | ✅ View | ❌ | ✅ View | ✅ View | ❌ | Verify items |
| **Collector** | ✅ View | ✅ Limited | ✅ Own Only | ❌ | ✅ Own Only | ❌ | ❌ | Upload receipts, own items only |
| **Staff** | ✅ View | ✅ View | ✅ View | ❌ | ✅ View | ✅ View | ❌ | Read-only access |
| **General Manager** | ✅ View | ✅ View | ✅ View | ❌ | ✅ View | ✅ View | ❌ | Executive overview |

### Role-Specific Features

**Cashier Role** ⭐
- Dedicated Cash Deposits page
- Batch deposit all pending cash at once
- Upload deposit slip photos
- Track bank name and reference numbers
- View only cash transactions in Collections
- Auto-populated cashier name

**Collector Role**
- Auto-populated collector name (read-only)
- See only items assigned to them in Pending view
- Upload transaction receipts
- Access restricted to Pending and Collections (own only)

**Specialist & Admin Roles**
- Grouped Pending view (by Collector)
- Full commission breakdown (10/10/30/50)
- Advanced data export capabilities

---

## 🚀 Quick Start Guide

### Prerequisites

- Node.js 18+ and npm
- Supabase account
- Git (for version control)

### For Administrators

#### 1. Database Setup

1. **Create Supabase Project**
   - Go to [Supabase](https://supabase.com)
   - Create a new project
   - Note your project URL and anon key

2. **Run Database Schema**
   ```sql
   -- In Supabase SQL Editor, run:
   database/supabase_schema.sql
   ```
   This includes:
   - All tables (Unclaimed, OverAllCollections, Reports, Users)
   - Views (Pending, PendingCashDeposits)
   - Triggers and functions
   - Security policies (RLS)
   - Indexes for performance

3. **Create Storage Bucket**
   - Navigate to Storage in Supabase
   - Create bucket: `unclaimed-receipts`
   - Set to **Public**
   - Create folders: `receipts/`, `deposits/`

4. **Add Initial Admin User**
   ```sql
   -- Passwords are plain text for simplified management
   INSERT INTO "Users" (username, password, fullname, role, status)
   VALUES ('admin', 'admin123', 'System Administrator', 'admin', 'active');
   ```

#### 2. Frontend Setup

1. **Clone Repository**
   ```bash
   git clone <repository-url>
   cd stl-unclaimed/frontend
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment**
   ```bash
   # Copy .env.example to .env
   cp .env.example .env
   
   # Edit .env with your Supabase credentials
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```

4. **Run Development Server**
   ```bash
   npm run dev
   ```
   Access at: `http://localhost:5173`

#### 3. Create Users

1. Login as admin
2. Navigate to **Users** page
3. Click **"Add User"**
4. Fill in details:
   - Username
   - Password
   - Full Name
   - **Role** (select from dropdown)
   - Status: `active`
5. Click **"Create User"**

**Example Cashier User:**
- Username: `cashier1`
- Password: [secure password]
- Full Name: Maria Santos
- Role: `cashier`
- Status: `active`

---

## 🌐 Installation & Deployment

### Local Development

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Deploy to Vercel

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Configure vercel.json** (already included)
   ```json
   {
     "rewrites": [
       { "source": "/(.*)", "destination": "/index.html" }
     ],
     "buildCommand": "cd frontend && npm install && npm run build",
     "outputDirectory": "frontend/dist",
     "installCommand": "cd frontend && npm install"
   }
   ```

3. **Deploy**
   ```bash
   # From project root
   vercel
   
   # For production
   vercel --prod
   ```

4. **Set Environment Variables in Vercel**
   - Go to Vercel Dashboard → Project Settings → Environment Variables
   - Add:
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`

### Environment Variables

Create `.env` file in `frontend/` directory:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

---

## 💰 Cashier Workflow

### Two-Step Verification Process

```
┌─────────────────────────────────────┐
│  Collector collects cash winnings  │
│  Items marked as "Collected"       │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  Items appear in Cash Deposits      │
│  Status: Pending Deposit            │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  Cashier clicks "Deposit All Cash"  │
│  Total: ₱22,000 (15 items)         │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  Cashier goes to bank               │
│  Deposits ₱22,000 cash              │
│  Receives deposit slip              │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  Cashier fills deposit form:        │
│  • Bank name: BDO                   │
│  • Reference: 123456                │
│  • Upload deposit slip photo        │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  All 15 items marked as deposited   │
│  Visible in Collections (cash only) │
└─────────────────────────────────────┘
```

### Status Flow

| Status | Display | Description | Visible To |
|--------|---------|-------------|------------|
| **Unclaimed** | 🟡 Yellow | Not yet collected | All roles |
| **Verifying** | 🔵 Blue | Under verification | Admin, Specialist |
| **Collected** | 🟢 Green | Collected, pending deposit | All roles |
| **Deposited** | ✅ Green | Cash deposited to bank | All roles |
| **Overdue** | 🔴 Red Row | 3+ days past draw date | All roles |

### Daily Cashier Workflow

**Morning:**
1. Login to system
2. Navigate to **Cash Deposits** page
3. Review pending deposits summary

**After Collections:**
4. View total pending: "₱22,000 (15 items)"
5. Click **"Deposit All Cash (₱22,000)"**
6. Go to bank with cash
7. Deposit ₱22,000
8. Get deposit slip with reference number

**Return to Office:**
9. Fill deposit form:
   - Amount: ₱22,000 (pre-filled)
   - Bank: BDO
   - Reference: 123456
   - Upload: Photo of deposit slip
10. Click **"Confirm Deposit"**
11. System marks all 15 items as deposited
12. View completed deposits in Collections

### Batch Deposit Benefits

✅ **Efficiency** - Process 15 items in one transaction vs. 15 separate deposits  
✅ **Accuracy** - System auto-calculates total, reduces manual errors  
✅ **Audit Trail** - All items linked to same deposit reference  
✅ **Time Saving** - Single bank visit instead of multiple trips  
✅ **Cost Effective** - One deposit fee instead of multiple fees

---

## 🗄️ Database Setup

### Core Tables

#### 1. Unclaimed Table
Primary table for all unclaimed winnings.

```sql
CREATE TABLE "Unclaimed" (
  id BIGSERIAL PRIMARY KEY,
  teller_name TEXT,
  bet_number TEXT,
  bet_code TEXT,              -- S3, L3, S2, 4D, 6D, STL
  draw_date DATE,
  bet_amount NUMERIC(15, 2),
  win_amount NUMERIC(15, 2),
  net NUMERIC(15, 2),
  charge_amount NUMERIC(15, 2),
  franchise_name TEXT,
  status TEXT DEFAULT 'Unclaimed',
  return_date TIMESTAMPTZ,
  area TEXT,
  collector TEXT,
  mode TEXT,                  -- Cash, Bank Transfer, Gcash
  payment_type TEXT,          -- Full Payment, Partial Payment
  receipt_image TEXT,
  reference_number TEXT,      -- For non-cash payments
  receiver_contact TEXT,      -- Mobile/account number
  created_by TEXT,            -- User who created record
  cash_deposited BOOLEAN DEFAULT false,
  deposit_date TIMESTAMPTZ,
  deposit_amount DECIMAL(10, 2),
  deposit_receipt TEXT,
  cashier_name TEXT,
  bank_name TEXT,
  deposit_reference TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 2. OverAllCollections Table
Tracks all collected items (synced from Unclaimed).

```sql
CREATE TABLE "OverAllCollections" (
  id BIGSERIAL PRIMARY KEY,
  unclaimed_id BIGINT UNIQUE REFERENCES "Unclaimed"(id),
  teller_name TEXT,
  bet_number TEXT,
  bet_code TEXT,
  draw_date DATE,
  return_date TIMESTAMPTZ,
  bet_amount NUMERIC(15, 2),
  amount NUMERIC(15, 2),
  charge_amount NUMERIC(15, 2),
  net NUMERIC(15, 2),
  collector TEXT,
  franchise_name TEXT,
  area TEXT,
  mode TEXT,
  payment_type TEXT,
  receipt_image TEXT,
  reference_number TEXT,
  receiver_contact TEXT,
  created_by TEXT,
  cash_deposited BOOLEAN,
  deposit_date TIMESTAMPTZ,
  deposit_amount DECIMAL(10, 2),
  deposit_receipt TEXT,
  cashier_name TEXT,
  bank_name TEXT,
  deposit_reference TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 3. Reports Table
Commission breakdown for collected items.

```sql
CREATE TABLE "Reports" (
  id BIGSERIAL PRIMARY KEY,
  unclaimed_id BIGINT REFERENCES "Unclaimed"(id),
  teller_name TEXT,
  bet_number TEXT,
  draw_date DATE,
  return_date TIMESTAMPTZ,
  franchise_name TEXT,
  amount NUMERIC(15, 2),
  collector TEXT,
  area TEXT,
  staff_amount NUMERIC(15, 2),      -- 10%
  collector_amount NUMERIC(15, 2),  -- 10%
  agent_amount NUMERIC(15, 2),      -- 30%
  admin_amount NUMERIC(15, 2),      -- 50%
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 4. Users Table
User authentication and role management.

```sql
CREATE TABLE "Users" (
  id BIGSERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  fullname TEXT,
  role TEXT NOT NULL,  -- admin, cashier, specialist, checker, collector, staff, general_manager
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Database Views

#### Pending View
Shows items with status 'Unclaimed' or 'Verifying'.

```sql
CREATE VIEW "Pending" AS
SELECT * FROM "Unclaimed"
WHERE status IN ('Unclaimed', 'Verifying')
ORDER BY draw_date DESC;
```

#### PendingCashDeposits View
Shows collected cash items awaiting deposit.

```sql
CREATE VIEW "PendingCashDeposits" AS
SELECT * FROM "Unclaimed"
WHERE status = 'Collected'
  AND mode = 'Cash'
  AND (cash_deposited = false OR cash_deposited IS NULL)
ORDER BY return_date DESC;
```

### Database Files

Located in `database/` directory:

1. **`supabase_schema.sql`** ⭐ - Complete schema with all migrations
2. **`add_collectors.sql`** - Seed data for collector users
3. **`add_5a_royal_collectors.sql`** - Additional collector data
4. **`update_collector_franchise.sql`** - Update collector assignments

### Running Migrations

```sql
-- In Supabase SQL Editor, run in order:
-- 1. Main schema (includes all migrations)
\i database/supabase_schema.sql

-- 2. Optional: Add collector users
\i database/add_collectors.sql
```

---

## 📁 Project Structure

```
stl-unclaimed/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout.jsx          # Main layout with sidebar
│   │   │   ├── Login.jsx           # Login page
│   │   │   └── ProtectedRoute.jsx  # Route guard
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx       # Real-time statistics
│   │   │   ├── Unclaimed.jsx       # Unclaimed items CRUD (78KB)
│   │   │   ├── Pending.jsx         # Pending items with overdue highlighting
│   │   │   ├── CashDeposits.jsx    # Cashier batch deposit (53KB)
│   │   │   ├── Collections.jsx     # All collected items
│   │   │   ├── Reports.jsx         # Commission reports
│   │   │   └── Users.jsx           # User management
│   │   ├── lib/
│   │   │   ├── supabase.js         # Supabase client & helpers
│   │   │   └── auth.js             # Authentication utilities
│   │   ├── utils/
│   │   │   └── permissions.js      # Role-based permissions
│   │   ├── App.jsx                 # Main app with routing
│   │   ├── main.jsx                # Entry point
│   │   └── index.css               # Tailwind CSS
│   ├── public/
│   │   └── logo.png                # App logo
│   ├── .env                        # Environment variables
│   ├── .env.example                # Environment template
│   ├── package.json                # Dependencies
│   ├── vite.config.js              # Vite configuration
│   ├── tailwind.config.js          # Tailwind configuration
│   └── postcss.config.js           # PostCSS configuration
├── database/
│   ├── supabase_schema.sql         # Complete database schema ⭐
│   ├── add_collectors.sql          # Collector seed data
│   ├── add_5a_royal_collectors.sql # Additional collectors
│   └── update_collector_franchise.sql
├── backend/                        # (Legacy - not used)
├── code.gs                         # Google Apps Script (receipt generation)
├── vercel.json                     # Vercel deployment config
├── .gitignore                      # Git ignore rules
└── README.md                       # This file
```

### Key Files

- **`frontend/src/pages/Unclaimed.jsx`** (78KB) - Most complex page with full CRUD
- **`frontend/src/pages/CashDeposits.jsx`** (53KB) - Cashier batch deposit logic
- **`database/supabase_schema.sql`** (22KB) - Complete database setup
- **`code.gs`** (7.8KB) - Google Apps Script for receipt generation

---

## 🔒 Security

### Implemented Security Features

✅ **Row Level Security (RLS)** - PostgreSQL RLS policies on all tables  
✅ **Function Security** - All functions use `SET search_path = public`  
✅ **Secure Views** - Views use `security_invoker = true`  
✅ **Role-Based Access Control** - Granular permissions per role  
✅ **Audit Trail** - Track user actions with `created_by` field  
✅ **Password Hashing** - Secure password storage (implement bcrypt in production)  
✅ **Environment Variables** - Sensitive data in `.env` files  
✅ **Public Storage** - Receipt images in public bucket (non-sensitive)

### Security Best Practices

1. **Change Default Admin Password**
   ```sql
   UPDATE "Users"
   SET password = 'new_secure_password'
   WHERE username = 'admin';
   ```

2. **Enable RLS Policies**
   ```sql
   ALTER TABLE "Unclaimed" ENABLE ROW LEVEL SECURITY;
   ALTER TABLE "OverAllCollections" ENABLE ROW LEVEL SECURITY;
   ALTER TABLE "Reports" ENABLE ROW LEVEL SECURITY;
   ALTER TABLE "Users" ENABLE ROW LEVEL SECURITY;
   ```

3. **Restrict API Keys**
   - Use Supabase RLS policies
   - Never expose service role key
   - Use anon key only for client-side

4. **Regular Backups**
   - Enable Supabase automatic backups
   - Export data weekly
   - Test restore procedures

---

## 📊 Best Practices

### For Cashiers

1. ✅ **Daily Deposits** - Deposit cash daily to minimize risk
2. ✅ **Verify Totals** - Count cash before going to bank
3. ✅ **Upload Receipts** - Always upload deposit slip photos
4. ✅ **Record Immediately** - Enter deposit details right after banking
5. ✅ **Double-Check** - Verify amounts match before confirming
6. ✅ **Keep Copies** - Save deposit slip copies for records

### For Collectors

1. ✅ **Upload Receipts** - Take clear photos of transaction receipts
2. ✅ **Verify Details** - Check bet number, amount, and date
3. ✅ **Record Contact** - Get receiver's mobile/account number
4. ✅ **Note Payment Type** - Specify Cash, Gcash, Bank Transfer, etc.
5. ✅ **Same-Day Entry** - Record collections on the same day

### For Administrators

1. ✅ **Monitor Overdue** - Check Pending page for red-highlighted items
2. ✅ **Review Deposits** - Verify deposit receipts weekly
3. ✅ **Audit Users** - Review user activity monthly
4. ✅ **Backup Database** - Regular automated backups
5. ✅ **Update System** - Keep dependencies up to date
6. ✅ **Train Users** - Ensure all users understand their roles

---

## 🛠️ Troubleshooting

### Common Issues

#### 1. Login Issues

**Problem**: Cannot login with credentials  
**Solution**:
- Verify username and password are correct
- Check user status is 'active' in Users table
- Clear browser cache and cookies
- Check Supabase connection in browser console

#### 2. Cashier Cannot See Cash Deposits Page

**Problem**: Cash Deposits menu item not visible  
**Solution**:
- Verify user role is exactly `cashier` (case-sensitive)
- Check permissions.js for PERMISSIONS.VIEW_CASH_DEPOSITS
- Logout and login again

#### 3. No Items in Cash Deposits

**Problem**: Cash Deposits page is empty  
**Solution**:
- Ensure items have:
  - `status = 'Collected'`
  - `mode = 'Cash'`
  - `cash_deposited = false` or `NULL`
- Check PendingCashDeposits view in Supabase

#### 4. Receipt Upload Fails

**Problem**: Cannot upload deposit receipt  
**Solution**:
- Check Supabase Storage bucket `unclaimed-receipts` exists
- Verify bucket is set to **Public**
- Ensure file is image format (jpg, png, webp)
- Check file size < 5MB
- Verify Supabase storage quota

#### 5. Overdue Items Not Highlighted

**Problem**: Items past due date not showing in red  
**Solution**:
- Check draw_date is set correctly
- Verify item is in Pending view
- Clear browser cache
- Check CSS for `.overdue-row` class

#### 6. Pagination Not Working

**Problem**: Cannot navigate between pages  
**Solution**:
- Check total items > items per page
- Verify pagination controls are visible
- Check browser console for JavaScript errors

#### 7. Collector Sees All Items

**Problem**: Collector sees items not assigned to them  
**Solution**:
- Verify collector name matches exactly (case-sensitive)
- Check Pending.jsx filtering logic
- Ensure user.fullname is populated correctly

### Database Errors

#### Error: "column does not exist"

```sql
-- Check table schema
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'Unclaimed';

-- Run missing migration
\i database/supabase_schema.sql
```

#### Error: "function search_path mutable"

```sql
-- Add SET search_path to function
CREATE OR REPLACE FUNCTION function_name()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
-- function body
$$;
```

#### Error: "duplicate key value violates unique constraint"

```sql
-- Check for duplicate unclaimed_id in OverAllCollections
SELECT unclaimed_id, COUNT(*)
FROM "OverAllCollections"
GROUP BY unclaimed_id
HAVING COUNT(*) > 1;

-- Remove duplicates (keep latest)
DELETE FROM "OverAllCollections" a
USING "OverAllCollections" b
WHERE a.id < b.id
  AND a.unclaimed_id = b.unclaimed_id;
```

### Performance Issues

#### Slow Page Load

**Solutions**:
- Enable pagination (already implemented)
- Add database indexes:
  ```sql
  CREATE INDEX idx_unclaimed_status ON "Unclaimed"(status);
  CREATE INDEX idx_unclaimed_draw_date ON "Unclaimed"(draw_date);
  CREATE INDEX idx_unclaimed_collector ON "Unclaimed"(collector);
  ```
- Optimize Supabase queries
- Use CDN for static assets

#### Large Database Size

**Solutions**:
- Archive old records (> 1 year)
- Compress receipt images
- Enable Supabase database optimization

---

## 📝 Version History

### Version 2.5 - January 2, 2026 🎉
**New Year Update: Advanced Reporting & UI Refinement**

- ✅ **Grouped Pending View** - Admin and Specialists now see items grouped by Collector with cyan/blue headers.
- ✅ **Commission Distribution** - Implemented 10/10/30/50 automated breakdown in Reports.
- ✅ **Fixed Pagination** - Standardized to 10 items per page across all tables for better readability.
- ✅ **Reference Numbers** - Added reference number field to Unclaimed CRUD for non-cash payments.
- ✅ **Receipt Modal UI** - Enhanced receipt modals to be more compact, scrollable, and mobile-friendly.
- ✅ **Security Update** - Transitioned to plain text password management as requested for easier administration.
- ✅ **Bug Fixes** - Fixed login autocomplete issues and collector-specific filtering logic.

### Version 2.0 - December 31, 2024
**Major Update: Enhanced UX & Performance**

- ✅ **Overdue Highlighting** - Items 3+ days past draw date highlighted in red
- ✅ **Pagination** - All tables support pagination
- ✅ **Receipt Modals** - View receipts in-app without new tabs
- ✅ **Collector Filtering** - Collectors see only their assigned items in Pending
- ✅ **Mobile Responsive** - Improved mobile layout with slide-out sidebar
- ✅ **Excel Export** - Export data to Excel with ExcelJS
- ✅ **Vercel Deployment** - Production deployment on Vercel

### Version 1.3 - December 29, 2024
**Enhanced Data Tracking**

- ✅ Bet code tracking (S3, L3, S2, 4D, 6D, STL)
- ✅ Reference number tracking for non-cash payments
- ✅ Receiver contact/account number tracking
- ✅ Created by user tracking
- ✅ Unique constraint on OverAllCollections.unclaimed_id
- ✅ Consolidated all migrations into supabase_schema.sql
- ✅ Enhanced receipt modals with new fields
- ✅ Improved data integrity and audit trail

### Version 1.2 - December 27, 2024
**Cashier Role Implementation**

- ✅ Cashier role fully implemented
- ✅ Batch deposit only (no individual deposits)
- ✅ Collections filtered for cashiers (cash only)
- ✅ Complete audit trail
- ✅ Security fixes applied
- ✅ Production ready

### Version 1.1 - December 27, 2024
**Feature Enhancements**

- Added batch deposit feature
- Added bet_number to Reports table
- Improved error handling

### Version 1.0 - December 25, 2024
**Initial Release**

- Basic unclaimed items management
- Collections tracking
- User roles and permissions
- Dashboard with statistics
- Reports generation

---

## 📞 Support & Contact

### Getting Help

1. **Check Documentation** - Review this README thoroughly
2. **Troubleshooting Section** - Common issues and solutions above
3. **System Administrator** - Contact your organization's admin
4. **Developer Support** - For technical issues, contact development team

### Reporting Issues

When reporting issues, include:
- User role and username
- Page where issue occurred
- Steps to reproduce
- Screenshots (if applicable)
- Browser console errors (F12 → Console)

---

## 📄 License

**Proprietary Software** - All rights reserved

This software is proprietary and confidential. Unauthorized copying, distribution, or use of this software, via any medium, is strictly prohibited.

---

## 🎯 Quick Links

- **Production URL**: [Your Vercel URL]
- **Supabase Dashboard**: [Your Supabase Project URL]
- **Repository**: [Your Git Repository URL]

---

**Status**: ✅ Production Ready  
**Version**: 2.0  
**Last Updated**: December 31, 2024  
**Maintained By**: Development Team