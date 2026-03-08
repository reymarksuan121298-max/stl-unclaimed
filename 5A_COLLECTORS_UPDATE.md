# 5A Royal Gaming OPC - Collectors Update

## Overview
This document describes the update to add 28 collector accounts for the **5A Royal Gaming OPC** franchise.

## Collectors Added

The following 28 collectors have been added to the system:

### Ampatuan Area (6 collectors)
1. AMPATUAN-SPVR-BAI
2. AMPATUAN-SPVR-UTTO
3. AMPATUAN-SPVR-KAURAN
4. AMPATUAN-SPVR-TEDDY
5. AMPATUAN-SPVR-KAPINPILAN
6. AMPATUAN-SPVR-JERAO-2

### DAS Area (3 collectors)
7. DAS-SPVR-JERAO
8. DAS-SPVR-JERAO-2
9. DAS-SPVR-UTTO

### Rajah Buayan & Buluan (2 collectors)
10. RAJAHBUAYAN-SPVR-BAI
11. BULUAN-SPVR-BAI

### Datu Piang (3 collectors)
12. DATUPIANG-SPVR-POTS3
13. DATUPIANG-SPVR-POTS
14. DATUPIANG-SPVR-PADJERO

### Datu Saudi (3 collectors)
15. DATUSAUDI-SPVR-LAKIM
16. DATUSAUDI-SPVR-LAKIM-2
17. DOS-SPVR-ALBASER

### Mamasapano (2 collectors)
18. MAMASAPANO-SPVR-PASANDALAN
19. MAMASAPANO-SPVR-BAI

### Saidona (1 collector)
20. SAIDONA-SPVR-DALI

### Paglas (4 collectors)
21. PAGLAS-SPVR-CASTAÑOS
22. PAGLAS-SPVR-MADIDIS
23. PAGLAS-SPVR-SUIT
24. PAGLAS-SPVR-SALBO

### Datu Hoffer (1 collector)
25. DATUHOFFER-SPVR-LIMPONGO

### Montawal (1 collector)
26. MONTAWAL-SPVR-POTS

### Pagalungan (1 collector)
27. PAGALUNGAN-SPVR-POTS

### Dalican (1 collector)
28. DALICAN-SPVR-GUIAMAN

## Collector Details

### Common Properties
- **Franchise**: 5A Royal Gaming OPC
- **Role**: collector
- **Default Password**: collector123
- **Status**: active
- **Username**: Same as fullname (e.g., "AMPATUAN-SPVR-BAI")
- **Fullname**: Same as username

## How to Apply the Update

### Method 1: Using Supabase Dashboard (Recommended)
1. Log in to your Supabase dashboard
2. Go to the SQL Editor
3. Open the file: `database/add_5a_collectors.sql`
4. Copy the entire SQL content
5. Paste it into the SQL Editor
6. Click "Run" to execute
7. Check the output for success messages

### Method 2: Using Supabase CLI
```bash
# Navigate to the project directory
cd c:\Users\HP\stl-unclaimed

# Run the SQL file
supabase db execute -f database/add_5a_collectors.sql
```

### Method 3: Manual Entry via Frontend
1. Log in as admin
2. Go to User Management page
3. Click "Add User" for each collector
4. Fill in the details:
   - Username: (collector name)
   - Password: stl123
   - Full Name: (collector name)
   - Role: collector
   - Franchise Name: 5A Royal Gaming OPC
   - Status: active

## Verification Steps

After running the SQL script, verify the update:

### 1. Check Total Count
```sql
SELECT COUNT(*) as total_collectors
FROM users
WHERE role = 'collector'
AND franchising_name = '5A Royal Gaming OPC';
```
**Expected Result**: 28 (or more if there were existing collectors)

### 2. List All Collectors
```sql
SELECT username, fullname, status, created_at
FROM users
WHERE role = 'collector'
AND franchising_name = '5A Royal Gaming OPC'
ORDER BY username;
```

### 3. Verify via Frontend
1. Log in as admin
2. Go to User Management
3. Filter by:
   - Role: collector
   - Franchise: 5A Royal Gaming OPC
4. Verify all 28 collectors appear in the list

## Using Collectors with Cashiers

### Assigning Collectors to Cashiers

To assign these collectors to a cashier (e.g., cashier-athea):

1. **Via Frontend**:
   - Go to User Management
   - Find and edit the cashier user
   - In the "Assigned Collectors" section, check the collectors you want to assign
   - Save the user

2. **Via SQL**:
```sql
UPDATE users
SET assigned_collectors = ARRAY[
    'AMPATUAN-SPVR-BAI',
    'AMPATUAN-SPVR-UTTO',
    'AMPATUAN-SPVR-KAURAN'
    -- Add more collector names as needed
]
WHERE username = 'cashier-athea';
```

### Important Notes for Cashier Assignment

1. **Exact Name Matching**: The collector names in `assigned_collectors` must **exactly match** the `fullname` field in the users table
2. **Array Format**: The `assigned_collectors` field must be a JSON array
3. **Logout Required**: After assigning collectors, the cashier must log out and log back in to see the changes
4. **Google Sheets Matching**: Ensure collector names in Google Sheets Column H match exactly with these fullnames

## Google Sheets Integration

### Updating Google Sheets

For these collectors to appear in the pending items:

1. **Update Column H (Collector)** in your Google Sheets with the exact collector names
2. **Example**:
   ```
   Row 2: AMPATUAN-SPVR-BAI
   Row 3: PAGLAS-SPVR-SUIT
   Row 4: DATUPIANG-SPVR-POTS
   ```

3. **Important**: Names must match exactly (case-sensitive, no extra spaces)

## Troubleshooting

### Issue: Collectors not showing in cashier's pending items

**Solution**:
1. Verify collector names match exactly between:
   - Users table `fullname` field
   - Cashier's `assigned_collectors` array
   - Google Sheets Column H
2. Ensure cashier has logged out and logged back in
3. Check browser console for debug messages

### Issue: Duplicate username error

**Solution**:
The SQL script uses `ON CONFLICT` to handle duplicates. It will update existing records instead of creating duplicates.

### Issue: Cannot log in as collector

**Solution**:
1. Verify the password is `stl123`
2. Check the user status is `active`
3. Verify the username matches exactly

## Login Credentials

All collectors can log in with:
- **Username**: Their collector name (e.g., "AMPATUAN-SPVR-BAI")
- **Password**: stl123

**Security Note**: It's recommended to change passwords after first login.

## Next Steps

After adding these collectors:

1. ✅ Run the SQL migration script
2. ✅ Verify all 28 collectors were created
3. ✅ Assign collectors to cashiers as needed
4. ✅ Update Google Sheets with correct collector names
5. ✅ Test login for a few collectors
6. ✅ Test cashier pending items filtering
7. ✅ Advise collectors to change their default passwords

## Summary

- **Total Collectors**: 28
- **Franchise**: 5A Royal Gaming OPC
- **Default Password**: stl123
- **Status**: All active
- **SQL File**: `database/add_5a_collectors.sql`

---

**Created**: 2026-01-12
**Last Updated**: 2026-01-12
