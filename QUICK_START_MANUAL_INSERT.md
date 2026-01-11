# 🚀 Quick Start: Manual Inventory Insert with EXHAUSTED Status

## ⚡ 5-Minute Setup

### Prerequisites
- ✅ MySQL Workbench installed
- ✅ MySQL Server running
- ✅ Access to `rites_erc_inspection` database

---

## 📝 Step-by-Step Execution

### 1️⃣ Open MySQL Workbench (30 seconds)
```
1. Launch MySQL Workbench
2. Connect to your local MySQL instance
3. Enter password when prompted
```

### 2️⃣ Open SQL Script (30 seconds)
```
File → Open SQL Script
Navigate to: d:\vendor\Rites-ERC-Vendor\MANUAL_INVENTORY_INSERT.sql
Click Open
```

### 3️⃣ Execute Schema Update (1 minute)

**Select and execute these lines:**
```sql
USE rites_erc_inspection;

ALTER TABLE inventory_entries 
MODIFY COLUMN status ENUM('FRESH_PO', 'UNDER_INSPECTION', 'ACCEPTED', 'REJECTED', 'EXHAUSTED') 
NOT NULL DEFAULT 'FRESH_PO';

SHOW COLUMNS FROM inventory_entries LIKE 'status';
```

**✅ Expected:** Status column now includes 'EXHAUSTED'

### 4️⃣ Insert Data (1 minute)

**Select and execute the entire INSERT statement** (lines 39-95):
```sql
INSERT INTO inventory_entries (
    vendor_code,
    vendor_name,
    -- ... all fields ...
) VALUES (
    '13104',
    'Vendor Name',
    -- ... all values ...
    'EXHAUSTED',  -- ← Key field
    NOW(),
    NOW()
);
```

**✅ Expected:** "1 row(s) affected"

### 5️⃣ Verify Insertion (30 seconds)

**Execute verification query:**
```sql
SELECT 
    id, vendor_code, raw_material, heat_number, 
    tc_number, status, created_at
FROM inventory_entries 
WHERE vendor_code = '13104' 
ORDER BY created_at DESC 
LIMIT 1;
```

**✅ Expected:** See your new record with status = 'EXHAUSTED'

### 6️⃣ Restart Backend (1 minute)

**In terminal/command prompt:**
```bash
cd d:\vendor\RITES-SARTHI-BACKEND
# Stop current process (Ctrl+C)
mvn spring-boot:run
```

**✅ Expected:** Backend starts without errors

### 7️⃣ Verify in UI (1 minute)

```
1. Open browser: http://localhost:3000
2. Go to Vendor Dashboard
3. Click "Inventory Entry" tab
4. Look for Heat Number: HN12345
```

**✅ Expected:** Entry appears in the list with EXHAUSTED status

---

## 🎯 Quick Verification Checklist

- [ ] MySQL Workbench connected
- [ ] ALTER TABLE executed (status enum updated)
- [ ] INSERT executed (1 row affected)
- [ ] Verification query shows new record
- [ ] Backend restarted successfully
- [ ] Entry visible in Vendor Dashboard
- [ ] Status shows as "EXHAUSTED"
- [ ] TC Details: `TC789 (2025-01-05)`
- [ ] Invoice Details: `INV001 (2025-01-06)`

---

## 📊 What You Should See

### In MySQL Workbench
```
| id | vendor_code | raw_material | heat_number | tc_number | status    | created_at          |
|----|-------------|--------------|-------------|-----------|-----------|---------------------|
| XX | 13104       | Steel Rod    | HN12345     | TC789     | EXHAUSTED | 2026-01-09 XX:XX:XX |
```

### In Vendor Dashboard
```
Inventory - List of Entries

| Raw Material | Supplier     | Grade/Spec | Heat No. | TC Details         | Invoice Details    | ... | Status    |
|--------------|--------------|------------|----------|--------------------|--------------------|-----|-----------|
| Steel Rod    | ABC Supplier | IS 2062    | HN12345  | TC789 (2025-01-05) | INV001 (2025-01-06)| ... | EXHAUSTED |
```

---

## 🚨 Common Issues & Quick Fixes

### Issue: "Unknown database 'rites_erc_inspection'"
**Fix:** Check database name, might be `sarthi_db` instead
```sql
SHOW DATABASES;
USE sarthi_db;  -- or whatever the correct name is
```

### Issue: "Data truncated for column 'status'"
**Fix:** ALTER TABLE didn't execute. Go back to Step 3

### Issue: Backend won't start
**Fix:** Check if port 8080 is already in use
```bash
# Windows
netstat -ano | findstr :8080
# Kill the process if needed
```

### Issue: Entry doesn't appear in UI
**Fix:** 
1. Check browser console for errors (F12)
2. Verify backend is running on port 8080
3. Check vendor_code matches (should be '13104')

---

## 📚 Detailed Documentation

For more detailed information, see:
- `MYSQL_WORKBENCH_EXECUTION_GUIDE.md` - Detailed step-by-step guide
- `EXHAUSTED_STATUS_IMPLEMENTATION_SUMMARY.md` - Complete technical summary
- `MANUAL_INVENTORY_INSERT.sql` - The SQL script with comments

---

## 🎉 Success Indicators

You've successfully completed the task when:
1. ✅ ALTER TABLE executed without errors
2. ✅ INSERT statement added 1 row
3. ✅ Verification query returns the new record
4. ✅ Backend restarted and running
5. ✅ Entry appears in Vendor Dashboard
6. ✅ Status badge shows "EXHAUSTED"
7. ✅ Combined columns display correctly

---

## ⏱️ Total Time: ~5 minutes

**Breakdown:**
- MySQL Workbench setup: 1 min
- Schema update: 1 min
- Data insertion: 1 min
- Backend restart: 1 min
- UI verification: 1 min

---

**Last Updated:** 2026-01-09  
**Difficulty:** Easy  
**Risk:** Low (additive change only)

