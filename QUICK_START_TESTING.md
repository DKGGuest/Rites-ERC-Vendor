# 🚀 Quick Start - Testing Complete Workflow

## ⚡ 3-Minute Setup

### **Step 1: Import Mock Data (1 minute)**

Open MySQL Workbench and run:

```sql
-- File: database/mock_data_for_testing.sql
-- This creates sample approved inspection calls for testing
```

**Or manually:**
1. File → Open SQL Script
2. Select `database/mock_data_for_testing.sql`
3. Click Execute (⚡ icon)

**Result:** 5 inspection calls created (2 RM, 2 Process, 1 Final)

---

### **Step 2: Start Servers (1 minute)**

**Terminal 1:**
```bash
cd server
npm start
```

**Terminal 2:**
```bash
npm start
```

---

### **Step 3: Test the Flow (1 minute)**

1. Open `http://localhost:3000`
2. Login as vendor
3. Go to "Raise Inspection Call" tab
4. Click "Raise Inspection Call" on any PO item
5. Select **Type of Call: Process** (to test with mock data)
6. Select **RM IC Number: RM-IC-2025-0001** (from dropdown)
7. Fill remaining fields
8. Submit

**Expected:**
```
✅ Process Inspection Request saved successfully!
IC Number: PROC-IC-2025-0003
```

---

## 🧪 Test Scenarios

### **Scenario 1: Create Raw Material IC**
- Type: Raw Material
- No dependencies
- Creates: RM-IC-2025-XXXX

### **Scenario 2: Create Process IC**
- Type: Process
- Requires: Approved RM IC (use mock data)
- Dropdown shows: RM-IC-2025-0001, RM-IC-2025-0002
- Creates: PROC-IC-2025-XXXX

### **Scenario 3: Create Final IC**
- Type: Final
- Requires: Approved Process IC (use mock data)
- Dropdown shows: PROC-IC-2025-0001, PROC-IC-2025-0002
- Creates: FINAL-IC-2025-XXXX

---

## 🔍 Verify Data

### **Check in MySQL Workbench:**

```sql
-- All inspection calls
SELECT ic_number, type_of_call, status, po_no 
FROM inspection_calls 
ORDER BY created_at DESC;

-- Latest RM IC with heat quantities
SELECT ic.ic_number, rm.raw_material_name, 
       hq.manufacturer_name, hq.heat_number, hq.quantity_mt
FROM inspection_calls ic
JOIN rm_inspection_details rm ON ic.ic_number = rm.ic_number
LEFT JOIN rm_heat_quantities hq ON ic.ic_number = hq.ic_number
WHERE ic.type_of_call = 'Raw Material'
ORDER BY ic.created_at DESC
LIMIT 5;

-- Latest Process IC with RM IC mapping
SELECT ic.ic_number, proc.process_lot_number, 
       prm.rm_ic_number
FROM inspection_calls ic
JOIN process_inspection_details proc ON ic.ic_number = proc.ic_number
LEFT JOIN process_rm_ic_mapping prm ON ic.ic_number = prm.process_ic_number
WHERE ic.type_of_call = 'Process'
ORDER BY ic.created_at DESC
LIMIT 5;

-- Latest Final IC with lot details
SELECT ic.ic_number, final.final_total_erc_qty,
       lot.lot_number, lot.manufacturer_heat, lot.offered_qty_erc
FROM inspection_calls ic
JOIN final_inspection_details final ON ic.ic_number = final.ic_number
LEFT JOIN final_inspection_lot_details lot ON ic.ic_number = lot.ic_number
WHERE ic.type_of_call = 'Final'
ORDER BY ic.created_at DESC
LIMIT 5;
```

---

## 📊 Mock Data Summary

| IC Number | Type | Status | PO Number | Purpose |
|-----------|------|--------|-----------|---------|
| RM-IC-2025-0001 | Raw Material | Approved | PO-2025-1001/01 | Test Process IC creation |
| RM-IC-2025-0002 | Raw Material | Approved | PO-2025-1001/01 | Test Process IC creation |
| PROC-IC-2025-0001 | Process | Approved | PO-2025-1001/01 | Test Final IC creation |
| PROC-IC-2025-0002 | Process | Approved | PO-2025-1001/01 | Test Final IC creation |
| FINAL-IC-2025-0001 | Final | Approved | PO-2025-1001/01 | Display in completed calls |

---

## 🚨 Troubleshooting

### **Issue: Dropdown is empty for RM IC Numbers**

**Cause:** No approved RM ICs in database

**Solution:**
```sql
-- Check if mock data exists
SELECT * FROM inspection_calls WHERE type_of_call = 'Raw Material' AND status = 'Approved';

-- If empty, run mock_data_for_testing.sql again
```

---

### **Issue: "Failed to create inspection call"**

**Cause:** Server not running or database connection issue

**Solution:**
1. Check server terminal for errors
2. Verify database connection in server terminal
3. Check `server/.env` has correct password

---

### **Issue: IC Number not auto-generating**

**Cause:** IC number sequence not initialized

**Solution:**
```sql
-- Check sequences
SELECT * FROM ic_number_sequences;

-- Should show:
-- RM-IC    | Raw Material | 2025 | 2
-- PROC-IC  | Process      | 2025 | 2
-- FINAL-IC | Final        | 2025 | 1
```

---

## ✅ Success Indicators

**API Server Terminal:**
```
✅ Database connected successfully!
📊 Database: rites_erc_inspection
🚀 RITES ERC API Server Started
📡 Server running on: http://localhost:8080
```

**React App:**
```
Compiled successfully!
You can now view the app in the browser.
  Local: http://localhost:3000
```

**Form Submission:**
```
📥 Received Process Inspection Call request
📋 Data: { ... }
🔢 Generated IC Number: PROC-IC-2025-0003
```

**Success Alert:**
```
✅ Process Inspection Request saved successfully!

IC Number: PROC-IC-2025-0003
Item: ERC MK-III Clips - Type A

Data has been saved to the database.
```

---

## 📝 Next Steps

1. ✅ Test all 3 inspection types (RM, Process, Final)
2. ✅ Verify data in MySQL Workbench
3. ✅ Test dropdown cascading (RM IC → Process IC → Final IC)
4. ✅ Test auto-population of fields
5. 🔄 Deploy to Azure when ready

---

## 🎉 You're Ready!

**Complete workflow is now functional:**
- ✅ Save inspection calls to database
- ✅ Auto-generate IC numbers
- ✅ Link RM → Process → Final
- ✅ Retrieve approved ICs for dropdowns
- ✅ Auto-fetch heat numbers and lot numbers
- ✅ Ready for Azure migration

**Start testing now!** 🚀

