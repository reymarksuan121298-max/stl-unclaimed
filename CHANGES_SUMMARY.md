# Summary of Changes - Bet Amount Feature

## Date: 2025-12-25

### Overview
Added `bet_amount` field to track the original bet amount across the application.

---

## Database Changes

### 1. Schema Updates (`database/supabase_schema.sql`)

#### Unclaimed Table
- **Added Column**: `bet_amount NUMERIC(15, 2) NOT NULL DEFAULT 0`
- Position: After `draw_date`, before `win_amount`
- Purpose: Store the original bet amount

#### OverAllCollections Table
- **Added Column**: `bet_amount NUMERIC(15, 2) NOT NULL DEFAULT 0`
- Position: After `return_date`, before `amount`
- **Added Column**: `area TEXT` (if not exists)
- Purpose: Store bet amount and area from collected items

#### Trigger Function Update
- Updated `handle_unclaimed_collection()` to copy `bet_amount` and `area` fields
- Now includes both fields when moving items from Unclaimed to OverAllCollections

### 2. Migration File (`database/migration_add_bet_amount.sql`)
- Created migration script for existing databases
- Safely adds columns using `IF NOT EXISTS`
- Updates trigger function to handle new fields

### 3. Migration Guide (`database/MIGRATION_GUIDE.md`)
- Comprehensive guide for applying the migration
- Includes verification steps
- Provides rollback instructions if needed

---

## Frontend Changes

### 1. Unclaimed Page (`frontend/src/pages/Unclaimed.jsx`)

#### Form State
- Added `bet_amount: ''` to formData state

#### Table Display
- **Removed**: "Net" column from table
- **Added**: "Bet Amt" column after "Return Timestamp"
- Updated colspan from 13 to 12 (due to removing Net column)

#### Modal Form
- Added "Bet Amount" input field after "Draw Date"
- Field type: number with step="0.01"
- Required field with placeholder "0.00"

#### Data Flow
- Form now captures bet_amount on create/edit
- Displays bet_amount in table with blue color styling
- Properly initializes bet_amount when editing existing items

### 2. Collections Page (`frontend/src/pages/Collections.jsx`)

#### Table Display
- **Added**: "Bet Amt" column after "Return Timestamp"
- **Kept**: "Net" column (as requested)
- Updated colspan from 12 to 13 (due to adding Bet Amt column)

#### Styling
- Bet Amount displayed with purple color (`text-purple-600`)
- Maintains consistent formatting with other monetary values

---

## File Structure

```
stl-unclaimed/
├── database/
│   ├── supabase_schema.sql (updated)
│   ├── migration_add_bet_amount.sql (new)
│   ├── migration_receipt_upload.sql (existing)
│   └── MIGRATION_GUIDE.md (new)
├── frontend/
│   └── src/
│       └── pages/
│           ├── Unclaimed.jsx (updated)
│           └── Collections.jsx (updated)
```

---

## Testing Checklist

### Database
- [ ] Run migration on Supabase
- [ ] Verify `bet_amount` column exists in Unclaimed table
- [ ] Verify `bet_amount` column exists in OverAllCollections table
- [ ] Verify `area` column exists in OverAllCollections table
- [ ] Test trigger function by marking an item as collected

### Frontend - Unclaimed Page
- [ ] Verify "Bet Amt" column appears after "Return Timestamp"
- [ ] Verify "Net" column is removed
- [ ] Verify "Bet Amount" input field in add/edit modal
- [ ] Test creating new unclaimed item with bet_amount
- [ ] Test editing existing unclaimed item
- [ ] Verify bet_amount displays correctly in table

### Frontend - Collections Page
- [ ] Verify "Bet Amt" column appears after "Return Timestamp"
- [ ] Verify "Net" column is still present
- [ ] Verify bet_amount displays correctly for collected items
- [ ] Test that bet_amount is copied when item is marked as collected

---

## Deployment Steps

1. **Database Migration**
   ```sql
   -- In Supabase SQL Editor, run:
   -- database/migration_add_bet_amount.sql
   ```

2. **Frontend Deployment**
   ```bash
   cd frontend
   npm run build
   # Deploy to Vercel or your hosting platform
   ```

3. **Verification**
   - Test creating new unclaimed items
   - Test marking items as collected
   - Verify data appears correctly in Collections page

---

## Notes

- `bet_amount` is a required field with default value of 0
- Existing records will have bet_amount = 0 until manually updated
- The trigger automatically copies bet_amount when items are collected
- Frontend validation ensures bet_amount is provided for new entries
- Color coding: Bet Amount (blue in Unclaimed, purple in Collections)

---

## Rollback Plan

If issues arise, refer to the rollback section in `MIGRATION_GUIDE.md` to:
1. Remove bet_amount columns from both tables
2. Restore the previous trigger function
3. Revert frontend changes via git

---

**Status**: ✅ All changes completed and ready for deployment
