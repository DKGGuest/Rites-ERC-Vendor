# 🧪 Testing Guide: New Filtering Logic

## 🎯 What to Test

Verify that the heat number dropdown now shows:
- ✅ FRESH_PO entries
- ✅ UNDER_INSPECTION entries (NEW)
- ✅ ACCEPTED entries (NEW)
- ✅ REJECTED entries (NEW)
- ❌ EXHAUSTED entries (excluded)

---

## 📋 Prerequisites

### 1. Create Test Data in Database

Run these SQL commands to create test entries with different statuses:

```sql
USE rites_erc_inspection;

-- Insert test entries with different statuses
INSERT INTO inventory_entries (
    vendor_code, vendor_name, company_id, company_name, unit_name,
    supplier_name, supplier_address, raw_material, grade_specification,
    heat_number, tc_number, tc_date, tc_quantity, tc_qty_remaining,
    invoice_number, invoice_date, sub_po_number, sub_po_date, sub_po_qty,
    unit_of_measurement, rate_of_material, rate_of_gst, base_value_po, total_po,
    status, created_at
) VALUES
-- Test 1: FRESH_PO (should appear)
('13104', 'Test Vendor', 1, 'Test Company', 'Test Unit',
 'Supplier A', 'Address A', 'Steel Rod', 'IS 2062',
 'TEST-FRESH-001', 'TC-FRESH-001', '2026-01-09', 100.00, 100.00,
 'INV-FRESH-001', '2026-01-09', 'SPO-FRESH-001', '2026-01-09', 100.00,
 'KG', 85.50, 18.00, 8550.00, 10089.00,
 'FRESH_PO', NOW()),

-- Test 2: UNDER_INSPECTION (should appear - NEW)
('13104', 'Test Vendor', 1, 'Test Company', 'Test Unit',
 'Supplier B', 'Address B', 'Steel Round', 'IS 1786',
 'TEST-UNDER-002', 'TC-UNDER-002', '2026-01-09', 50.00, 50.00,
 'INV-UNDER-002', '2026-01-09', 'SPO-UNDER-002', '2026-01-09', 50.00,
 'KG', 90.00, 18.00, 4500.00, 5310.00,
 'UNDER_INSPECTION', NOW()),

-- Test 3: ACCEPTED (should appear - NEW)
('13104', 'Test Vendor', 1, 'Test Company', 'Test Unit',
 'Supplier C', 'Address C', 'Steel Plate', 'IS 2062',
 'TEST-ACCEPT-003', 'TC-ACCEPT-003', '2026-01-09', 75.00, 75.00,
 'INV-ACCEPT-003', '2026-01-09', 'SPO-ACCEPT-003', '2026-01-09', 75.00,
 'KG', 95.00, 18.00, 7125.00, 8407.50,
 'ACCEPTED', NOW()),

-- Test 4: REJECTED (should appear - NEW)
('13104', 'Test Vendor', 1, 'Test Company', 'Test Unit',
 'Supplier D', 'Address D', 'Steel Bar', 'IS 1786',
 'TEST-REJECT-004', 'TC-REJECT-004', '2026-01-09', 25.00, 25.00,
 'INV-REJECT-004', '2026-01-09', 'SPO-REJECT-004', '2026-01-09', 25.00,
 'KG', 88.00, 18.00, 2200.00, 2596.00,
 'REJECTED', NOW()),

-- Test 5: EXHAUSTED (should NOT appear)
('13104', 'Test Vendor', 1, 'Test Company', 'Test Unit',
 'Supplier E', 'Address E', 'Steel Wire', 'IS 2062',
 'TEST-EXHAUST-005', 'TC-EXHAUST-005', '2026-01-09', 0.00, 0.00,
 'INV-EXHAUST-005', '2026-01-09', 'SPO-EXHAUST-005', '2026-01-09', 100.00,
 'KG', 92.00, 18.00, 9200.00, 10856.00,
 'EXHAUSTED', NOW());

-- Also insert corresponding entries in rm_heat_tc_mapping table
INSERT INTO rm_heat_tc_mapping (
    vendor_code, heat_number, tc_number, tc_date, tc_qty, tc_qty_remaining,
    offered_qty, manufacturer, sub_po_number, sub_po_date, sub_po_qty,
    sub_po_total_value, invoice_no, invoice_date, created_at
) VALUES
('13104', 'TEST-FRESH-001', 'TC-FRESH-001', '2026-01-09', '100', '100', '0', 'Supplier A', 'SPO-FRESH-001', '2026-01-09', 100.00, 10089.00, 'INV-FRESH-001', '2026-01-09', NOW()),
('13104', 'TEST-UNDER-002', 'TC-UNDER-002', '2026-01-09', '50', '50', '0', 'Supplier B', 'SPO-UNDER-002', '2026-01-09', 50.00, 5310.00, 'INV-UNDER-002', '2026-01-09', NOW()),
('13104', 'TEST-ACCEPT-003', 'TC-ACCEPT-003', '2026-01-09', '75', '75', '0', 'Supplier C', 'SPO-ACCEPT-003', '2026-01-09', 75.00, 8407.50, 'INV-ACCEPT-003', '2026-01-09', NOW()),
('13104', 'TEST-REJECT-004', 'TC-REJECT-004', '2026-01-09', '25', '25', '0', 'Supplier D', 'SPO-REJECT-004', '2026-01-09', 25.00, 2596.00, 'INV-REJECT-004', '2026-01-09', NOW()),
('13104', 'TEST-EXHAUST-005', 'TC-EXHAUST-005', '2026-01-09', '100', '0', '100', 'Supplier E', 'SPO-EXHAUST-005', '2026-01-09', 100.00, 10856.00, 'INV-EXHAUST-005', '2026-01-09', NOW());
```

---

## 🚀 Step-by-Step Testing

### Step 1: Restart Backend
```bash
cd d:\vendor\RITES-SARTHI-BACKEND
mvn spring-boot:run
```

**Wait for:** "Started SarthiApplication in X seconds"

---

### Step 2: Test Backend API Directly

**Open browser and navigate to:**
```
http://localhost:8080/api/vendor/available-heat-numbers/13104
```

**✅ Expected Response:**
```json
{
  "responseStatus": {
    "statusCode": 0,
    "message": null
  },
  "responseData": [
    {
      "heatNumber": "TEST-FRESH-001",
      "status": "FRESH_PO",
      "isAvailable": true
    },
    {
      "heatNumber": "TEST-UNDER-002",
      "status": "UNDER_INSPECTION",
      "isAvailable": true
    },
    {
      "heatNumber": "TEST-ACCEPT-003",
      "status": "ACCEPTED",
      "isAvailable": true
    },
    {
      "heatNumber": "TEST-REJECT-004",
      "status": "REJECTED",
      "isAvailable": true
    }
    // TEST-EXHAUST-005 should NOT be here
  ]
}
```

**❌ If TEST-EXHAUST-005 appears:** Backend filtering is not working correctly

---

### Step 3: Restart Frontend
```bash
cd d:\vendor\Rites-ERC-Vendor
npm start
```

**Wait for:** "Compiled successfully!"

---

### Step 4: Test in Browser

1. **Open:** `http://localhost:3000`
2. **Navigate to:** Vendor Dashboard → Raising Call tab
3. **Scroll to:** Raw Material Raising Call section
4. **Click:** "Add Heat Number" button
5. **Open:** Heat Number dropdown

---

### Step 5: Verify Dropdown Contents

**✅ Should See (5 entries total):**
- TEST-FRESH-001 - (Supplier A)
- TEST-UNDER-002 - (Supplier B) ← NEW
- TEST-ACCEPT-003 - (Supplier C) ← NEW
- TEST-REJECT-004 - (Supplier D) ← NEW
- Plus any existing heat numbers

**❌ Should NOT See:**
- TEST-EXHAUST-005 - (Supplier E)

---

### Step 6: Check Console Logs

**Open DevTools (F12) → Console Tab**

**✅ Expected Logs:**
```
🔄 Fetching available heat numbers for vendor: 13104
📥 Raw API response: {success: true, data: [...]}
✅ Loaded available heat numbers from database: X
📊 Available heat numbers: [...]
  - TEST-FRESH-001 (Supplier A) - Status: FRESH_PO, Available: true
  - TEST-UNDER-002 (Supplier B) - Status: UNDER_INSPECTION, Available: true
  - TEST-ACCEPT-003 (Supplier C) - Status: ACCEPTED, Available: true
  - TEST-REJECT-004 (Supplier D) - Status: REJECTED, Available: true
✅ Confirmed: TEST-EXHAUST-005 is NOT in the available list
✅ Using availableHeatNumbers from API: X
```

---

## ✅ Success Criteria

Mark each as complete:

- [ ] Backend API returns 4 test entries (excludes EXHAUSTED)
- [ ] Frontend dropdown shows 4 test entries
- [ ] TEST-FRESH-001 appears in dropdown
- [ ] TEST-UNDER-002 appears in dropdown (NEW)
- [ ] TEST-ACCEPT-003 appears in dropdown (NEW)
- [ ] TEST-REJECT-004 appears in dropdown (NEW)
- [ ] TEST-EXHAUST-005 does NOT appear in dropdown
- [ ] Console logs show correct filtering behavior
- [ ] No errors in browser console
- [ ] No errors in backend logs

---

## 🧹 Cleanup (Optional)

After testing, you can remove the test data:

```sql
USE rites_erc_inspection;

DELETE FROM inventory_entries 
WHERE heat_number IN (
    'TEST-FRESH-001', 
    'TEST-UNDER-002', 
    'TEST-ACCEPT-003', 
    'TEST-REJECT-004', 
    'TEST-EXHAUST-005'
);

DELETE FROM rm_heat_tc_mapping 
WHERE heat_number IN (
    'TEST-FRESH-001', 
    'TEST-UNDER-002', 
    'TEST-ACCEPT-003', 
    'TEST-REJECT-004', 
    'TEST-EXHAUST-005'
);
```

---

**Testing Date:** 2026-01-09  
**Estimated Time:** 10 minutes  
**Difficulty:** Easy

