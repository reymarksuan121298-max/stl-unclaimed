# 5A Royal Gaming OPC - 28 Collectors Summary

## Overview
Updated the collector list for **5A Royal Gaming OPC** franchise to include exactly **28 collectors**.

## Files Updated

### 1. `database/add_5a_collectors.sql`
- **Purpose**: Primary SQL script to add the 28 collectors
- **Password**: collector123
- **Features**: 
  - Uses `ON CONFLICT` to update existing records
  - Includes completion message with statistics

### 2. `database/add_all_5a_collectors.sql`
- **Purpose**: Alternative SQL script (same 28 collectors)
- **Password**: collector123
- **Features**:
  - Includes verification queries
  - Groups collectors by area

### 3. `5A_COLLECTORS_UPDATE.md`
- **Purpose**: Comprehensive documentation
- **Updated**: Password reference changed to collector123

## The 28 Collectors

| # | Collector Name | Area |
|---|----------------|------|
| 1 | AMPATUAN-SPVR-BAI | Ampatuan |
| 2 | AMPATUAN-SPVR-UTTO | Ampatuan |
| 3 | AMPATUAN-SPVR-KAURAN | Ampatuan |
| 4 | AMPATUAN-SPVR-TEDDY | Ampatuan |
| 5 | AMPATUAN-SPVR-KAPINPILAN | Ampatuan |
| 6 | AMPATUAN-SPVR-JERAO-2 | Ampatuan |
| 7 | DAS-SPVR-JERAO | DAS |
| 8 | DAS-SPVR-JERAO-2 | DAS |
| 9 | DAS-SPVR-UTTO | DAS |
| 10 | RAJAHBUAYAN-SPVR-BAI | Rajah Buayan |
| 11 | BULUAN-SPVR-BAI | Buluan |
| 12 | DATUPIANG-SPVR-POTS3 | Datu Piang |
| 13 | DATUPIANG-SPVR-POTS | Datu Piang |
| 14 | DATUPIANG-SPVR-PADJERO | Datu Piang |
| 15 | DATUSAUDI-SPVR-LAKIM | Datu Saudi |
| 16 | DOS-SPVR-ALBASER | Datu Saudi |
| 17 | DATUSAUDI-SPVR-LAKIM-2 | Datu Saudi |
| 18 | MAMASAPANO-SPVR-PASANDALAN | Mamasapano |
| 19 | MAMASAPANO-SPVR-BAI | Mamasapano |
| 20 | SAIDONA-SPVR-DALI | Saidona |
| 21 | PAGLAS-SPVR-CASTAÑOS | Paglas |
| 22 | PAGLAS-SPVR-MADIDIS | Paglas |
| 23 | PAGLAS-SPVR-SUIT | Paglas |
| 24 | PAGLAS-SPVR-SALBO | Paglas |
| 25 | DATUHOFFER-SPVR-LIMPONGO | Datu Hoffer |
| 26 | MONTAWAL-SPVR-POTS | Montawal |
| 27 | PAGALUNGAN-SPVR-POTS | Pagalungan |
| 28 | DALICAN-SPVR-GUIAMAN | Dalican |

## Breakdown by Area

- **Ampatuan**: 6 collectors
- **DAS**: 3 collectors
- **Datu Piang**: 3 collectors
- **Datu Saudi**: 3 collectors
- **Paglas**: 4 collectors
- **Mamasapano**: 2 collectors
- **Rajah Buayan**: 1 collector
- **Buluan**: 1 collector
- **Saidona**: 1 collector
- **Datu Hoffer**: 1 collector
- **Montawal**: 1 collector
- **Pagalungan**: 1 collector
- **Dalican**: 1 collector

**Total**: 28 collectors

## Login Credentials

All collectors can log in with:
- **Username**: Their collector name (e.g., "AMPATUAN-SPVR-BAI")
- **Password**: collector123

## How to Apply

### Option 1: Using Supabase Dashboard
1. Log in to Supabase
2. Go to SQL Editor
3. Copy content from `database/add_5a_collectors.sql`
4. Paste and run

### Option 2: Using the alternative script
1. Use `database/add_all_5a_collectors.sql`
2. Includes verification queries to check results

## Important Notes

1. **Username = Fullname**: Both fields use the same value (e.g., "AMPATUAN-SPVR-BAI")
2. **Case Sensitive**: Collector names are case-sensitive
3. **Google Sheets**: Ensure Column H in Google Sheets uses exact same names
4. **Cashier Assignment**: When assigning to cashiers, use exact collector names
5. **ON CONFLICT**: Script updates existing records if username already exists

## For Cashier-Athea

To assign collectors to cashier-athea, update their `assigned_collectors` field:

```sql
UPDATE users
SET assigned_collectors = ARRAY[
    'AMPATUAN-SPVR-BAI',
    'AMPATUAN-SPVR-UTTO',
    'DAS-SPVR-JERAO'
    -- Add more as needed
]
WHERE username = 'cashier-athea';
```

Then cashier-athea must log out and log back in to see the changes.

---

**Created**: 2026-01-12  
**Password**: collector123  
**Total Collectors**: 28
