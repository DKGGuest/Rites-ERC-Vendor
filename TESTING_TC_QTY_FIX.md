# 🧪 Testing Guide: TC Qty Field Fix

## 🎯 What to Test

Verify that the **"TC Qty"** field now displays the actual **TC (Test Certificate) quantity** instead of the PO (Purchase Order) quantity when selecting Heat Number and TC Number in the Raw Material Raising Call section.

---

## 📋 Prerequisites

### 1. Ensure Backend is Running
```bash
cd d:\vendor\RITES-SARTHI-BACKEND
mvn spring-boot:run
```

Wait for: "Started SarthiApplication in X seconds"

---

### 2. Ensure Frontend is Running
```bash
cd d:\vendor\Rites-ERC-Vendor
npm start
```

Wait for: "Compiled successfully!"

---

### 3. Verify Test Data Exists

Check if you have inventory entries with **different TC Qty and Sub PO Qty** values:

```sql
USE rites_erc_inspection;

SELECT 
    heat_number,
    tc_number,
    tc_quantity AS 'TC Qty',
    sub_po_qty AS 'Sub PO Qty',
    unit_of_measurement AS 'Unit',
    CASE 
        WHEN tc_quantity = sub_po_qty THEN '⚠️ Same (not ideal for testing)'
        ELSE '✅ Different (good for testing)'
    END AS 'Test Suitability'
FROM inventory_entries
WHERE vendor_code = '13104'
ORDER BY created_at DESC
LIMIT 5;
```

**Ideal Test Data:**
- TC Qty and Sub PO Qty should be **different** to clearly see the fix

**If no suitable data exists, create test entry:**
```sql
INSERT INTO inventory_entries (
    vendor_code, vendor_name, company_id, company_name, unit_name,
    supplier_name, supplier_address, raw_material, grade_specification,
    heat_number, tc_number, tc_date, tc_quantity, tc_qty_remaining,
    invoice_number, invoice_date, sub_po_number, sub_po_date, sub_po_qty,
    unit_of_measurement, rate_of_material, rate_of_gst, base_value_po, total_po,
    status, created_at
) VALUES (
    '13104', 'Test Vendor', 1, 'Test Company', 'Test Unit',
    'Test Supplier', 'Test Address', 'Steel Rod', 'IS 2062',
    'TEST-TC-QTY-001', 'TC-TEST-001', '2026-01-09', 
    100.000, -- TC Quantity (what should show in TC Qty field)
    100.000,
    'INV-TEST-001', '2026-01-09', 'SPO-TEST-001', '2026-01-09', 
    150.000, -- Sub PO Quantity (different from TC Qty)
    'KG', 85.50, 18.00, 12825.00, 15133.50,
    'FRESH_PO', NOW()
);

-- Also insert into rm_heat_tc_mapping
INSERT INTO rm_heat_tc_mapping (
    vendor_code, heat_number, tc_number, tc_date, tc_qty, tc_qty_remaining,
    offered_qty, manufacturer, sub_po_number, sub_po_date, sub_po_qty,
    sub_po_total_value, invoice_no, invoice_date, created_at
) VALUES (
    '13104', 'TEST-TC-QTY-001', 'TC-TEST-001', '2026-01-09', 
    '100', '100', '0', 'Test Supplier', 'SPO-TEST-001', '2026-01-09', 
    150.000, 15133.50, 'INV-TEST-001', '2026-01-09', NOW()
);
```

---

## 🧪 Test Procedure

### Step 1: Navigate to Raising Call Section

1. Open browser: `http://localhost:3000`
2. Go to **Vendor Dashboard**
3. Click **Raising Call** tab
4. Scroll to **Raw Material Raising Call** section

---

### Step 2: Select Heat Number and TC Number

1. Click **"Add Heat Number"** button (if not already visible)
2. In the first heat number section:
   - **Heat Number dropdown:** Select `TEST-TC-QTY-001` (or any heat number)
   - **TC Number dropdown:** Select `TC-TEST-001` (or corresponding TC number)
3. Wait for auto-population to complete (loading spinner disappears)

---

### Step 3: Verify Field Values

Check the auto-populated fields:

**✅ Expected Results (After Fix):**

| Field | Expected Value | Explanation |
|-------|---------------|-------------|
| **TC Date** | 2026-01-09 | Auto-fetched from inventory |
| **Manufacturer** | Test Supplier | Auto-fetched from inventory |
| **Invoice No** | INV-TEST-001 | Auto-fetched from inventory |
| **Invoice Date** | 2026-01-09 | Auto-fetched from inventory |
| **Sub PO Number** | SPO-TEST-001 | Auto-fetched from inventory |
| **Sub PO Date** | 2026-01-09 | Auto-fetched from inventory |
| **Sub PO Qty** | **150 KG** | PO quantity (unchanged) |
| **Total Value of Sub PO** | ₹15133.50 | Calculated value |
| **TC Qty** | **100 KG** | ✅ **FIXED** - Shows TC quantity |
| **TC Qty Remaining** | 100 KG | Available quantity |

**Key Verification:**
- ✅ **TC Qty (100 KG)** ≠ **Sub PO Qty (150 KG)** - They should be different!
- ✅ TC Qty shows the value from `tc_quantity` column in database
- ✅ Sub PO Qty shows the value from `sub_po_qty` column in database

---

### Step 4: Cross-Check with Database

Verify the displayed values match the database:

```sql
SELECT 
    heat_number,
    tc_number,
    tc_quantity AS 'TC Qty (should show in UI)',
    sub_po_qty AS 'Sub PO Qty (should show in UI)',
    unit_of_measurement
FROM inventory_entries
WHERE heat_number = 'TEST-TC-QTY-001'
  AND tc_number = 'TC-TEST-001';
```

**Expected Output:**
```
heat_number: TEST-TC-QTY-001
tc_number: TC-TEST-001
TC Qty: 100.000
Sub PO Qty: 150.000
unit_of_measurement: KG
```

**UI Should Match:**
- TC Qty field: `100 KG` ✅
- Sub PO Qty field: `150 KG` ✅

---

## ❌ What Was Wrong Before?

**Before Fix (Incorrect Behavior):**

| Field | Displayed Value | Issue |
|-------|----------------|-------|
| **Sub PO Qty** | 150 KG | Correct |
| **TC Qty** | **150 KG** | ❌ **WRONG** - Showing PO qty instead of TC qty |

**Problem:** Both fields showed the same value (150 KG), which was incorrect.

---

## ✅ Success Criteria

Mark each as complete:

- [ ] Frontend compiles and runs without errors
- [ ] No console errors when selecting Heat Number and TC Number
- [ ] TC Qty field shows **100 KG** (TC quantity from database)
- [ ] Sub PO Qty field shows **150 KG** (PO quantity from database)
- [ ] TC Qty and Sub PO Qty are **different** (when they differ in database)
- [ ] TC Qty value matches `tc_quantity` column in database
- [ ] Other auto-populated fields still work correctly
- [ ] No regression in existing functionality

---

## 🔍 Troubleshooting

### Issue 1: TC Qty still shows PO quantity

**Possible Causes:**
1. Frontend not restarted after code change
2. Browser cache not cleared

**Solution:**
```bash
# Restart frontend
cd d:\vendor\Rites-ERC-Vendor
npm start

# Hard refresh browser
Ctrl+Shift+R
```

---

### Issue 2: TC Qty and Sub PO Qty are the same

**Possible Cause:** Database has same values for both fields

**Solution:**
- Check database values using SQL query above
- If they're the same in database, create test data with different values
- Use the INSERT script provided in Prerequisites section

---

### Issue 3: Fields not auto-populating

**Possible Causes:**
1. Backend not running
2. Inventory entry not found
3. Heat Number or TC Number mismatch

**Solution:**
1. Check backend is running: `http://localhost:8080/actuator/health`
2. Verify inventory entry exists in database
3. Check browser console for error messages

---

## 🧹 Cleanup (Optional)

After testing, remove test data:

```sql
DELETE FROM inventory_entries 
WHERE heat_number = 'TEST-TC-QTY-001';

DELETE FROM rm_heat_tc_mapping 
WHERE heat_number = 'TEST-TC-QTY-001';
```

---

## 📊 Test Results Template

**Test Date:** _____________  
**Tester:** _____________  
**Browser:** _____________

| Test Case | Expected | Actual | Status |
|-----------|----------|--------|--------|
| TC Qty shows 100 KG | 100 KG | _____ | ☐ Pass ☐ Fail |
| Sub PO Qty shows 150 KG | 150 KG | _____ | ☐ Pass ☐ Fail |
| TC Qty ≠ Sub PO Qty | Different | _____ | ☐ Pass ☐ Fail |
| Other fields auto-populate | Correct | _____ | ☐ Pass ☐ Fail |
| No console errors | None | _____ | ☐ Pass ☐ Fail |

**Overall Result:** ☐ Pass ☐ Fail

**Notes:**
_____________________________________________
_____________________________________________

---

**Testing Guide Created:** 2026-01-09  
**Fix Applied:** Line 949 in RaiseInspectionCallForm.js  
**Expected Outcome:** TC Qty field displays actual TC quantity from test certificate

