# STL Unclaimed Collections System

A comprehensive system for managing unclaimed STL winnings, cash deposits, and collections with role-based access control.

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [User Roles](#user-roles)
4. [Quick Start](#quick-start)
5. [Cashier Workflow](#cashier-workflow)
6. [Database Setup](#database-setup)
7. [Security](#security)
8. [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

The STL Unclaimed Collections System is a full-stack web application built to track and manage unclaimed lottery winnings, cash collections, and bank deposits. It features role-based access control, batch deposit functionality, and comprehensive audit trails.

### Technology Stack
- **Frontend**: React + React Router + Tailwind CSS
- **Backend**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage (receipt images)
- **Icons**: Lucide React

---

## ✨ Features

### Core Features
- ✅ **Unclaimed Items Management** - Track all unclaimed winnings
- ✅ **Cash Deposit Tracking** - Record bank deposits with receipts
- ✅ **Batch Deposits** - Deposit multiple items in one transaction
- ✅ **Collections Management** - View all collected items
- ✅ **Role-Based Access** - Different permissions for different roles
- ✅ **Audit Trail** - Complete tracking of all transactions
- ✅ **Receipt Upload** - Photo documentation of deposits
- ✅ **Real-time Dashboard** - Live statistics and summaries

### Cashier-Specific Features
- 💰 **Batch Deposit** - Deposit all pending cash at once
- 📸 **Receipt Upload** - Upload deposit slip photos
- 🏦 **Bank Tracking** - Record bank name and reference numbers
- 📊 **Filtered Views** - See only cash transactions
- 🔒 **Read-Only Access** - View-only for non-deposit pages

---

## 👥 User Roles

| Role | Description | Key Permissions |
|------|-------------|-----------------|
| **Admin** | Full system access | All permissions |
| **Cashier** ⭐ | Manages cash deposits | Deposit cash, view collections (cash only) |
| **Specialist** | Manages collections | Mark as collected, manage items |
| **Checker** | Verifies items | Create/view unclaimed items |
| **Collector** | Collects winnings | Create items, upload receipts |
| **Staff** | View-only access | View dashboard and reports |
| **General Manager** | Executive view | View collections and reports |

---

## 🚀 Quick Start

### For Administrators

#### 1. Database Setup
```sql
-- Run this single file in Supabase SQL Editor:
-- This includes all migrations and security fixes

database/supabase_schema.sql
```

**What's included:**
- ✅ Base schema (tables, indexes)
- ✅ Cash deposit tracking
- ✅ Auto-calculate net amounts
- ✅ Uncollected status handling
- ✅ Sync updates to collections
- ✅ Security fixes (search_path, RLS)
- ✅ Views (Pending, PendingCashDeposits)
- ✅ All triggers and functions

#### 2. Create Storage Bucket
1. Go to Supabase Storage
2. Create bucket: `unclaimed-receipts`
3. Set to **Public**
4. Create folders: `receipts/`, `deposits/`

#### 3. Create Cashier User
1. Login as admin
2. Navigate to **Users** page
3. Click **"Add User"**
4. Fill in details:
   - Username: `cashier1`
   - Password: [secure password]
   - Full Name: [Cashier's name]
   - **Role**: `cashier` ⭐
   - Status: `active`
5. Click **"Create User"**

### For Cashiers

#### Daily Workflow
1. **Login** with your cashier credentials
2. Navigate to **Cash Deposits** page
3. View **Total Pending Deposits** summary
4. Click **"Deposit All Cash"** button
5. Go to bank and deposit the cash
6. Return and fill in deposit form:
   - Deposit Amount (pre-filled)
   - Bank Name
   - Deposit Reference Number
   - Upload deposit slip photo
7. Click **"Confirm Deposit"**
8. All items marked as deposited!

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
│  (Pending deposit list)             │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  Cashier clicks "Deposit All Cash"  │
│  (e.g., ₱22,000 for 15 items)      │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  Cashier goes to bank               │
│  Deposits total amount              │
│  Gets deposit slip                  │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  Cashier fills deposit form:        │
│  - Bank name                        │
│  - Reference number                 │
│  - Upload deposit slip photo        │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  All items marked as deposited      │
│  Appear in Collections (cash only)  │
└─────────────────────────────────────┘
```

### Status Meanings

| Status | Cashier View | Admin View | Description |
|--------|-------------|------------|-------------|
| **Unclaimed** | 🟡 Unclaimed | 🟡 Unclaimed | Not yet collected |
| **Uncollected** | 🟢 Collected | 🟠 Uncollected | Collected by cashier, pending admin verification |
| **Collected** | 🟢 Collected | 🟢 Collected | Verified by admin, final state |

### Batch Deposit Benefits

✅ **Faster Processing** - Deposit multiple items at once  
✅ **Single Bank Transaction** - One deposit slip for all cash  
✅ **Accurate Totals** - System calculates total automatically  
✅ **Time Saving** - No need to enter details for each item  
✅ **Audit Trail** - All items linked to same deposit transaction

### Example: End of Day Deposit

**Scenario**: Cashier has 15 pending cash collections totaling ₱22,000

1. **See**: "Total Pending Deposits: ₱22,000 (15 items)"
2. **Click**: "Deposit All Cash (₱22,000)"
3. **Go to bank**: Deposit ₱22,000
4. **Get**: Deposit slip with reference #123456
5. **Return**: Fill form
   - Amount: ₱22,000
   - Bank: BDO
   - Reference: 123456
   - Upload: Photo of deposit slip
6. **Submit**: All 15 items marked as deposited
7. **View**: Collections page shows all 15 cash items

---

## 🗄️ Database Setup

### Database Schema

#### Unclaimed Table
```sql
id                  BIGINT PRIMARY KEY
teller_name         TEXT
bet_number          TEXT
draw_date           DATE
bet_amount          NUMERIC(15, 2)
win_amount          NUMERIC(15, 2)
net                 NUMERIC(15, 2)
charge_amount       NUMERIC(15, 2)
franchise_name      TEXT
status              TEXT  -- Unclaimed, Uncollected, Collected
return_date         TIMESTAMPTZ
area                TEXT
collector           TEXT
mode                TEXT  -- Cash, Back Transfer, Gcash, etc.
payment_type        TEXT  -- Full Payment, Partial Payment
receipt_image       TEXT
cash_deposited      BOOLEAN
deposit_date        TIMESTAMPTZ
deposit_amount      DECIMAL(10, 2)
deposit_receipt     TEXT
cashier_name        TEXT
bank_name           TEXT
deposit_reference   TEXT
created_at          TIMESTAMPTZ
updated_at          TIMESTAMPTZ
```

#### OverAllCollections Table
```sql
id                  BIGINT PRIMARY KEY
unclaimed_id        BIGINT (references Unclaimed)
teller_name         TEXT
bet_number          TEXT
draw_date           DATE
return_date         TIMESTAMPTZ
bet_amount          NUMERIC(15, 2)
amount              NUMERIC(15, 2)
charge_amount       NUMERIC(15, 2)
net                 NUMERIC(15, 2)
collector           TEXT
franchise_name      TEXT
area                TEXT
mode                TEXT
payment_type        TEXT
receipt_image       TEXT
cash_deposited      BOOLEAN
deposit_date        TIMESTAMPTZ
deposit_amount      DECIMAL(10, 2)
deposit_receipt     TEXT
cashier_name        TEXT
bank_name           TEXT
deposit_reference   TEXT
created_at          TIMESTAMPTZ
```

#### Reports Table
```sql
id                  BIGINT PRIMARY KEY
unclaimed_id        BIGINT (references Unclaimed)
teller_name         TEXT
bet_number          TEXT
draw_date           DATE
return_date         TIMESTAMPTZ
franchise_name      TEXT
amount              NUMERIC(15, 2)
collector           TEXT
area                TEXT
staff_amount        NUMERIC(15, 2)  -- 10%
collector_amount    NUMERIC(15, 2)  -- 10%
agent_amount        NUMERIC(15, 2)  -- 30%
admin_amount        NUMERIC(15, 2)  -- 50%
created_at          TIMESTAMPTZ
```

### Migration Files

Run these in order:

1. **`migration_cash_deposit_tracking.sql`** - Adds cash deposit tracking fields
2. **`migration_auto_calculate_net.sql`** - Auto-calculates net amounts
3. **`migration_handle_uncollected_status.sql`** - Handles uncollected status
4. **`migration_sync_unclaimed_to_collections.sql`** - Syncs updates
5. **`migration_security_fix.sql`** - Fixes security warnings

---

## 🔒 Security

### Security Features Implemented

✅ **Function Search Path Security** - All database functions use `SET search_path = public`  
✅ **Security Definer Views** - Views use `security_invoker = true`  
✅ **Role-Based Access Control** - Permissions enforced at application level  
✅ **Row Level Security** - RLS policies on all tables  
✅ **Audit Trail** - Complete tracking of all actions

### Running Security Migration

```sql
-- Run in Supabase SQL Editor
-- File: database/migration_security_fix.sql
```

This fixes:
- Function search path mutable warnings
- Security definer view warnings
- Ensures proper RLS enforcement

---

## 🛠️ Troubleshooting

### Common Issues

#### Cashier cannot see Cash Deposits page
**Solution**: Verify the user role is set to "cashier" in Users management

#### No items showing in Cash Deposits
**Solution**: Ensure items are:
- Status = "Collected"
- Mode = "Cash"
- cash_deposited = false or null

#### Cannot upload deposit receipt
**Solution**: 
1. Check Supabase Storage bucket "unclaimed-receipts" exists
2. Ensure bucket is public
3. Verify file is an image format (jpg, png, etc.)

#### Wrong amount entered in deposit
**Solution**: Contact admin immediately - deposits cannot be edited once submitted

#### Collections page shows all transactions for cashier
**Solution**: This is a bug - cashiers should only see cash transactions. Check that the role filter is working in Collections.jsx

### Database Errors

#### "column bet_number does not exist"
**Solution**: Run `migration_add_bet_number_to_reports.sql`

#### "function search_path mutable" warnings
**Solution**: Run `migration_security_fix.sql`

#### Trigger errors when marking as collected
**Solution**: Ensure all migrations have been run in order

---

## 📊 Best Practices

### For Cashiers

1. **Daily Deposits** - Deposit cash daily to minimize risk
2. **Batch Deposits** - Group deposits by franchise or area
3. **Receipt Photos** - Always upload deposit receipt photos
4. **Verify Amounts** - Double-check deposit amounts match collection amounts
5. **Reference Numbers** - Always record bank reference numbers
6. **Count Cash First** - Verify total matches system before going to bank
7. **Record Immediately** - Enter deposit details right after banking

### For Administrators

1. **Monitor Pending Deposits** - Check daily for undeposited cash
2. **Review Deposit Receipts** - Verify receipts weekly
3. **Audit Cashier Activity** - Review monthly
4. **Backup Database** - Regular backups
5. **Update Migrations** - Keep database schema current

---

## 📁 Project Structure

```
stl-unclaimed/
├── frontend/
│   └── src/
│       ├── components/
│       │   └── Layout.jsx
│       ├── pages/
│       │   ├── Dashboard.jsx
│       │   ├── Unclaimed.jsx
│       │   ├── Collections.jsx
│       │   ├── CashDeposits.jsx  ⭐
│       │   ├── Reports.jsx
│       │   └── Users.jsx
│       ├── lib/
│       │   └── supabase.js
│       ├── utils/
│       │   └── permissions.js
│       └── App.jsx
├── database/
│   └── supabase_schema.sql  ⭐ (All-in-one schema with migrations)
└── README.md
```

---

## 🎯 Key Features Summary

### Cashier Role
- ✅ Dedicated Cash Deposits page
- ✅ Batch deposit functionality
- ✅ Receipt upload with photo
- ✅ Bank tracking (name, reference)
- ✅ Automatic cashier name recording
- ✅ Collections filtered to cash only
- ✅ Read-only access to other pages

### Admin Features
- ✅ Full system access
- ✅ User management
- ✅ Verification workflow
- ✅ Complete audit trail
- ✅ All transaction types visible

### Security
- ✅ Role-based permissions
- ✅ Database function security
- ✅ View security (RLS)
- ✅ Audit trail
- ✅ Cannot modify deposits once recorded

---

## 📞 Support

For issues or questions:
1. Check this README
2. Review the troubleshooting section
3. Contact your system administrator

---

## 📝 Version History

**Version 1.2** - December 27, 2024
- ✅ Cashier role fully implemented
- ✅ Batch deposit only (no individual deposits)
- ✅ Collections filtered for cashiers (cash only)
- ✅ Complete audit trail
- ✅ Security fixes applied
- ✅ Production ready

**Version 1.1** - December 27, 2024
- Added batch deposit feature
- Added bet_number to Reports table
- Improved error handling

**Version 1.0** - December 25, 2024
- Initial release
- Basic unclaimed items management
- Collections tracking
- User roles and permissions

---

## 📄 License

Proprietary - All rights reserved

---

**Status**: ✅ Production Ready  
**Last Updated**: December 27, 2024