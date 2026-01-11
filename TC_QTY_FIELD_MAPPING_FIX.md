# 🔧 TC Qty Field Mapping Fix

## 📋 Issue Summary

**Date:** 2026-01-09  
**Component:** Vendor Dashboard - Raw Material Raising Call  
**Severity:** Medium - Data Display Issue  
**Status:** ✅ Fixed

---

## 🚨 Problem Description

### What Was Wrong?

When a vendor selected a **Heat Number** and **TC Number** from the dropdown in the "Raw Material Raising Call" section, the system auto-populated various fields from the inventory. However, the **"TC Qty"** field was incorrectly displaying the **PO (Purchase Order) quantity** instead of the actual **TC (Test Certificate) quantity**.

### User Impact

- Vendors saw incorrect TC quantity values
- The displayed TC Qty matched the Sub PO Qty (which was wrong)
- This could lead to confusion when raising inspection calls
- The actual TC quantity from the test certificate was not visible

---

## 🔍 Root Cause Analysis

### Investigation Steps

1. **Examined auto-population logic** in `RaiseInspectionCallForm.js`
2. **Identified the field mapping** in `handleTcNumberChange` function (line 949)
3. **Checked database schema** to verify correct field names
4. **Reviewed data transformation** in `VendorDashboardPage.js`

### Root Cause

**File:** `Rites-ERC-Vendor/src/components/RaiseInspectionCallForm.js`  
**Line:** 949  
**Issue:** Incorrect field mapping

**Before (Incorrect):**
```javascript
tcQty: `${inventoryEntry.subPoQty} ${inventoryEntry.unitOfMeasurement}`,
```

**Problem:** Using `subPoQty` (PO quantity) instead of `declaredQuantity` (TC quantity)

---

## ✅ Solution Applied

### Code Change

**File:** `Rites-ERC-Vendor/src/components/RaiseInspectionCallForm.js`  
**Line:** 949  
**Change Type:** Field mapping correction

**After (Correct):**
```javascript
tcQty: `${inventoryEntry.declaredQuantity} ${inventoryEntry.unitOfMeasurement}`,
```

**Explanation:** Changed from `subPoQty` to `declaredQuantity` to display the actual TC quantity

---

## 📊 Field Mapping Reference

### Inventory Entry Fields

| Field Name | Description | Source | Used For |
|------------|-------------|--------|----------|
| `declaredQuantity` | TC Quantity (from test certificate) | `entry.tcQuantity` (backend) | **TC Qty field** ✅ |
| `subPoQty` | Sub PO Quantity (from purchase order) | `entry.subPoQty` (backend) | **Sub PO Qty field** |
| `qtyLeftForInspection` | Remaining quantity available | Calculated | **TC Qty Remaining field** |

### Data Flow

```
Backend (InventoryEntry entity)
  ↓
  tcQuantity (BigDecimal)
  ↓
Backend DTO (InventoryEntryResponseDto)
  ↓
  tcQuantity (BigDecimal)
  ↓
Frontend Transformation (VendorDashboardPage.js)
  ↓
  declaredQuantity: entry.tcQuantity
  ↓
Frontend Component (RaiseInspectionCallForm.js)
  ↓
  tcQty: `${inventoryEntry.declaredQuantity} ${inventoryEntry.unitOfMeasurement}`
  ↓
UI Display: "TC Qty" field
```

---

## 🧪 Testing Instructions

### Prerequisites

1. Backend server running
2. Frontend dev server running
3. At least one inventory entry in the database

---

### Test Scenario 1: Verify TC Qty Shows Correct Value

**Setup:**
- Create an inventory entry with:
  - TC Quantity: 100 KG
  - Sub PO Quantity: 150 KG (different from TC Qty)

**Steps:**
1. Navigate to **Vendor Dashboard** → **Raising Call** tab
2. Scroll to **Raw Material Raising Call** section
3. Click **"Add Heat Number"** button
4. Select a **Heat Number** from dropdown
5. Select a **TC Number** from dropdown
6. Wait for auto-population to complete

**Expected Results:**
- ✅ **TC Qty** field shows: `100 KG` (the TC quantity)
- ✅ **Sub PO Qty** field shows: `150 KG` (the PO quantity)
- ✅ TC Qty and Sub PO Qty are **different** (as they should be)

**Before Fix (Incorrect):**
- ❌ **TC Qty** field showed: `150 KG` (same as Sub PO Qty - WRONG)
- ❌ **Sub PO Qty** field showed: `150 KG`
- ❌ Both fields showed the same value (incorrect)

---

### Test Scenario 2: Verify TC Qty Matches Database

**Steps:**
1. Check database for a specific inventory entry:
   ```sql
   SELECT heat_number, tc_number, tc_quantity, sub_po_qty, unit_of_measurement
   FROM inventory_entries
   WHERE vendor_code = '13104'
   LIMIT 1;
   ```

2. Note the `tc_quantity` value (e.g., 75.500 KG)

3. In the UI, select that Heat Number and TC Number

4. Check the **TC Qty** field

**Expected Result:**
- ✅ TC Qty field displays the exact value from `tc_quantity` column
- ✅ Value matches database (e.g., `75.5 KG`)

---

### Test Scenario 3: Verify Other Fields Not Affected

**Steps:**
1. Select Heat Number and TC Number
2. Verify all auto-populated fields

**Expected Results:**
- ✅ **TC Date** - Correct
- ✅ **Manufacturer** - Correct
- ✅ **Invoice No** - Correct
- ✅ **Invoice Date** - Correct
- ✅ **Sub PO Number** - Correct
- ✅ **Sub PO Date** - Correct
- ✅ **Sub PO Qty** - Correct (unchanged)
- ✅ **Total Value of Sub PO** - Correct (unchanged)
- ✅ **TC Qty** - **FIXED** ✨
- ✅ **TC Qty Remaining** - Correct (unchanged)

---

## 📝 Example Data

### Sample Inventory Entry

**Database Values:**
```
heat_number: HT-2025-001
tc_number: TC-45678
tc_quantity: 100.000 KG
sub_po_qty: 150.000 KG
unit_of_measurement: KG
```

**UI Display (After Fix):**
```
Heat Number: HT-2025-001
TC Number: TC-45678
Sub PO Qty: 150 KG          ← PO quantity
TC Qty: 100 KG              ← TC quantity (FIXED) ✅
TC Qty Remaining: 100 KG    ← Available quantity
```

**UI Display (Before Fix - Incorrect):**
```
Heat Number: HT-2025-001
TC Number: TC-45678
Sub PO Qty: 150 KG          ← PO quantity
TC Qty: 150 KG              ← WRONG! Showing PO qty ❌
TC Qty Remaining: 100 KG    ← Available quantity
```

---

## 🔗 Related Files

### Modified Files
- `Rites-ERC-Vendor/src/components/RaiseInspectionCallForm.js` (Line 949)

### Reference Files (Not Modified)
- `Rites-ERC-Vendor/src/pages/VendorDashboardPage.js` (Data transformation)
- `RITES-SARTHI-BACKEND/src/main/java/com/sarthi/entity/InventoryEntry.java` (Entity definition)
- `RITES-SARTHI-BACKEND/src/main/java/com/sarthi/dto/InventoryEntryResponseDto.java` (DTO definition)

---

## ✅ Verification Checklist

After applying the fix, verify:

- [ ] Frontend compiles without errors
- [ ] No console errors when selecting Heat Number and TC Number
- [ ] TC Qty field shows correct value from database
- [ ] TC Qty is different from Sub PO Qty (when they differ in database)
- [ ] Other auto-populated fields still work correctly
- [ ] No regression in existing functionality

---

## 📊 Impact Assessment

### What Changed?
- ✅ Single line change in auto-population logic
- ✅ Changed field reference from `subPoQty` to `declaredQuantity`

### What Didn't Change?
- ✅ Database schema - No changes
- ✅ Backend API - No changes
- ✅ Data transformation logic - No changes
- ✅ Other auto-populated fields - No changes
- ✅ UI layout - No changes

### Risk Level
- **Low Risk** - Single field mapping correction
- **No Breaking Changes** - Only fixes incorrect display
- **No Database Changes** - Pure frontend fix

---

**Fix Applied:** 2026-01-09  
**Tested:** Pending  
**Status:** Ready for Testing  
**Expected Result:** TC Qty field displays actual TC quantity from test certificate

