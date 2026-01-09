# 🧪 Testing Guide: EXHAUSTED Status Filtering

## 🎯 What We're Testing
Verify that inventory entries with status = "EXHAUSTED" are:
- ❌ **Excluded** from the heat number dropdown in "Raw Material Raising Call"
- ✅ **Visible** in the "Inventory - List of Entries" table

---

## 📋 Prerequisites

Before testing, ensure you have:
- ✅ Executed `MANUAL_INVENTORY_INSERT.sql` (adds EXHAUSTED entry to database)
- ✅ Backend running on `http://localhost:8080`
- ✅ Frontend running on `http://localhost:3000`

---

## 🚀 Step-by-Step Testing

### Step 1: Verify Database Entry (1 minute)

**Open MySQL Workbench and run:**
```sql
USE rites_erc_inspection;

SELECT 
    id, vendor_code, heat_number, tc_number, 
    raw_material, supplier_name, status, created_at
FROM inventory_entries 
WHERE vendor_code = '13104' 
ORDER BY created_at DESC;
```

**✅ Expected Result:**
- You should see at least one entry with `status = 'EXHAUSTED'`
- Heat Number: `HN12345`
- TC Number: `TC789`
- Raw Material: `Steel Rod`

---

### Step 2: Test Backend API Endpoints (2 minutes)

#### A. Test "All Inventory Entries" Endpoint
**Open browser or Postman:**
```
GET http://localhost:8080/api/vendor/inventory/entries/13104
```

**✅ Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": XX,
      "heatNumber": "HN12345",
      "tcNumber": "TC789",
      "status": "EXHAUSTED",
      ...
    },
    // ... other entries
  ]
}
```

**✅ Verify:** EXHAUSTED entry (HN12345) is included in the response

---

#### B. Test "Available Heat Numbers" Endpoint
**Open browser or Postman:**
```
GET http://localhost:8080/api/vendor/available-heat-numbers/13104
```

**✅ Expected Response:**
```json
{
  "success": true,
  "data": [
    // Only FRESH_PO entries
    // HN12345 should NOT be here
  ]
}
```

**✅ Verify:** EXHAUSTED entry (HN12345) is NOT included in the response

---

### Step 3: Test Frontend - Inventory List Table (1 minute)

**Navigate to:**
1. Open `http://localhost:3000`
2. Click **Vendor Dashboard**
3. Click **Inventory Entry** tab
4. Look at the **"Inventory - List of Entries"** table

**✅ Expected Result:**
- Table shows ALL inventory entries
- EXHAUSTED entry (HN12345) is visible
- Status column shows "EXHAUSTED" badge
- TC Details: `TC789 (2025-01-05)`
- Invoice Details: `INV001 (2025-01-06)`

**Screenshot Location:**
```
| Raw Material | Supplier     | Grade/Spec | Heat No. | TC Details         | Invoice Details    | Status    |
|--------------|--------------|------------|----------|--------------------|--------------------|-----------|
| Steel Rod    | ABC Supplier | IS 2062    | HN12345  | TC789 (2025-01-05) | INV001 (2025-01-06)| EXHAUSTED |
```

---

### Step 4: Test Frontend - Heat Number Dropdown (2 minutes)

**Navigate to:**
1. Stay in **Vendor Dashboard**
2. Click **Raising Call** tab
3. Scroll down to **"Raw Material Raising Call"** section
4. Click **"Add Heat Number"** button (if not already visible)
5. Click on the **"Heat Number"** dropdown

**✅ Expected Result:**
- Dropdown shows only FRESH_PO entries
- HN12345 (EXHAUSTED entry) should NOT appear in the dropdown
- Only heat numbers with available inventory should be listed

**Example Dropdown Options:**
```
-- Select Heat Number --
HT-2025-001 - (Steel India Ltd)
HT-2025-002 - (XYZ Steel Corp)
// HN12345 should NOT be here
```

---

### Step 5: Verify Browser Console Logs (1 minute)

**Open Browser DevTools (F12) → Console Tab**

**✅ Expected Console Logs:**
```
✅ Loaded inventory entries from database: X
✅ Loaded available heat numbers from database: Y
✅ Using availableHeatNumbers from API: Y
```

**Where:**
- X = Total inventory entries (including EXHAUSTED)
- Y = Available heat numbers (FRESH_PO only)
- Y should be less than X (because EXHAUSTED entries are filtered out)

---

## 📊 Test Scenarios

### Scenario 1: Fresh Entry
**Setup:** Create an entry with status = 'FRESH_PO'

**Expected:**
- ✅ Appears in Inventory List Table
- ✅ Appears in Heat Number Dropdown

---

### Scenario 2: Exhausted Entry
**Setup:** Entry with status = 'EXHAUSTED' (HN12345)

**Expected:**
- ✅ Appears in Inventory List Table
- ❌ Does NOT appear in Heat Number Dropdown

---

### Scenario 3: Under Inspection Entry
**Setup:** Create an entry with status = 'UNDER_INSPECTION'

**Expected:**
- ✅ Appears in Inventory List Table
- ❌ Does NOT appear in Heat Number Dropdown

---

## ✅ Success Criteria

All of the following must be true:

### Database Level
- [ ] EXHAUSTED entry exists in `inventory_entries` table
- [ ] Status column shows 'EXHAUSTED'

### Backend API Level
- [ ] `/api/vendor/inventory/entries/13104` returns EXHAUSTED entry
- [ ] `/api/vendor/available-heat-numbers/13104` does NOT return EXHAUSTED entry

### Frontend UI Level
- [ ] Inventory List Table shows EXHAUSTED entry
- [ ] Heat Number Dropdown does NOT show EXHAUSTED entry
- [ ] Console logs show correct counts

---

## 🚨 Troubleshooting

### Issue: EXHAUSTED entry appears in dropdown
**Possible Causes:**
1. Backend not restarted after adding EXHAUSTED to enum
2. Frontend using old filtering logic (check console logs)

**Fix:**
```bash
# Restart backend
cd d:\vendor\RITES-SARTHI-BACKEND
mvn spring-boot:run

# Clear browser cache and reload
Ctrl+Shift+R (hard reload)
```

---

### Issue: EXHAUSTED entry doesn't appear in inventory list
**Possible Causes:**
1. Database entry not inserted correctly
2. Frontend not fetching inventory entries

**Fix:**
```sql
-- Verify in database
SELECT * FROM inventory_entries WHERE heat_number = 'HN12345';
```

---

### Issue: Console shows "Falling back to filtering inventoryEntries"
**Possible Causes:**
1. `availableHeatNumbers` prop is empty
2. API endpoint not returning data

**Fix:**
1. Check network tab in DevTools
2. Verify API endpoint is being called
3. Check backend logs for errors

---

## 📸 Expected Screenshots

### 1. Inventory List Table
- Shows EXHAUSTED entry with status badge
- All columns populated correctly

### 2. Heat Number Dropdown
- Does NOT show HN12345
- Only shows FRESH_PO entries

### 3. Browser Console
- Shows correct log messages
- No errors

---

## 🎉 Test Complete!

If all success criteria are met:
- ✅ EXHAUSTED filtering is working correctly
- ✅ Backend API is filtering properly
- ✅ Frontend is using the correct endpoint
- ✅ Audit trail is maintained (EXHAUSTED entries visible in list)

---

**Testing Date:** 2026-01-09  
**Estimated Time:** 7 minutes  
**Difficulty:** Easy

