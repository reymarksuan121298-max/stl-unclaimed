# Cashier Athea - Pending Items Setup Guide

## Overview
This document explains how the pending items filtering works for **cashier-athea** and the 3 collectors assigned to them.

## How It Works

### 1. Data Flow
```
Google Sheets (code.gs) 
    ↓
Frontend (googleSheets.js) - Filters by assigned_collectors
    ↓
Pending.jsx - Displays filtered items
```

### 2. Filtering Logic

#### In `googleSheets.js` (Lines 99-125)
```javascript
// For cashiers, filter by assigned collectors
if (user?.role?.toLowerCase() === 'cashier') {
    let assignedCollectors = user?.assigned_collectors
    
    // Handle string vs array
    if (typeof assignedCollectors === 'string') {
        assignedCollectors = JSON.parse(assignedCollectors)
    }
    
    // Filter items where collector name matches assigned list
    transformedData = transformedData.filter(item =>
        assignedCollectors.includes(item.collector)
    )
}
```

#### In `Pending.jsx` (Lines 220-263)
- Additional filtering for cashiers
- Debug logs to help troubleshoot
- Shows warnings if no items found

## Setup Checklist for cashier-athea

### Step 1: Verify Supabase User Data
1. Open Supabase dashboard
2. Go to `users` table
3. Find user with username `cashier-athea`
4. Check the `assigned_collectors` field

**Expected format:**
```json
["Collector Name 1", "Collector Name 2", "Collector Name 3"]
```

**Important:** Must be an array, not a string!

### Step 2: Verify Google Sheets Collector Names
1. Open your Google Sheets
2. Check Column H (Collector) in all sheets:
   - FREDELYN_PARANG
   - MONTILLA_PARANG/LANDASAN
   - POTS_AWANG
   - NORTH KABUNTALAN
   - TAYTEN_SOUTH UPI
   - NORTH UPI_
   - MAG-SUR

3. Note the **exact** collector names (case-sensitive, spaces matter!)

### Step 3: Ensure Names Match Exactly
The collector names in Google Sheets Column H must **exactly match** the names in the `assigned_collectors` array.

**Example:**
- ✅ Correct: `"John Doe"` in both places
- ❌ Wrong: `"John Doe"` in Supabase, `"john doe"` in Sheets
- ❌ Wrong: `"John Doe"` in Supabase, `"John  Doe"` in Sheets (extra space)

### Step 4: Test the Setup
1. Log in as `cashier-athea`
2. Navigate to the Pending page
3. Open browser console (F12)
4. Look for these debug messages:

```
=== CASHIER FILTERING DEBUG ===
User: {username: "cashier-athea", role: "cashier", ...}
Assigned Collectors: ["Name1", "Name2", "Name3"]
All items before filter: X
Items after filter: Y
```

Also check:
```
📋 Unique collectors in Google Sheets: [...]
🎯 Assigned collectors for cashier: [...]
🔍 Filtered Google Sheets data for cashier: X items
```

### Step 5: Troubleshooting

#### No items showing?
Check console for these warnings:

**Warning 1:**
```
⚠️ No pending items found for assigned collectors. This could mean:
1. No pending items exist for these collectors
2. Collector names in database don't match exactly
3. You need to log out and log back in to refresh your user data
```

**Solution:**
- Verify collector names match exactly (Step 3)
- Log out and log back in
- Check if items actually exist in Google Sheets for those collectors

**Warning 2:**
```
❌ No assigned collectors found for cashier
Please contact admin to assign collectors to your account
```

**Solution:**
- Admin needs to edit cashier-athea's user record
- Add the 3 collector names to `assigned_collectors` field
- Cashier must log out and log back in

## Example Configuration

### Supabase `users` table for cashier-athea:
```json
{
  "username": "cashier-athea",
  "fullname": "Athea Cashier",
  "role": "cashier",
  "assigned_collectors": [
    "Maria Santos",
    "Juan dela Cruz", 
    "Pedro Reyes"
  ]
}
```

### Google Sheets Column H (Collector):
```
Row 2: Maria Santos
Row 3: Juan dela Cruz
Row 4: Pedro Reyes
Row 5: Maria Santos
...
```

## Code Files Involved

1. **`code.gs`** - Google Apps Script
   - Fetches data from all sheets
   - Returns data with collector names in Column H

2. **`frontend/src/lib/googleSheets.js`**
   - Fetches from Google Apps Script
   - Filters by `assigned_collectors` for cashiers
   - Lines 99-125 contain the filtering logic

3. **`frontend/src/pages/Pending.jsx`**
   - Displays pending items
   - Additional filtering for cashiers
   - Lines 220-263 contain debug logs

## Quick Commands

### To check console logs:
1. Press F12 in browser
2. Go to Console tab
3. Click "Refresh Data" button on Pending page
4. Review the debug output

### To force refresh user data:
1. Log out
2. Log back in
3. Navigate to Pending page

## Notes

- Collector name matching is **case-sensitive**
- Extra spaces will cause mismatches
- The `assigned_collectors` field must be a JSON array, not a string
- Changes to `assigned_collectors` require logout/login to take effect
- The system fetches from multiple Google Sheets sources simultaneously
