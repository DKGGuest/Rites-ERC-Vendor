# 🧪 Testing Guide: Inventory View/Edit/Delete Feature

## 📋 Test Plan Overview

**Feature:** View/Edit/Delete functionality for Inventory Entries  
**Test Date:** 2026-01-09  
**Tester:** [Your Name]  
**Environment:** Development

---

## 🚀 Pre-Testing Setup

### 1. **Start Backend Server**
```bash
cd RITES-SARTHI-BACKEND
mvn spring-boot:run
```

**Expected:** Server starts on `http://localhost:8080`

---

### 2. **Start Frontend Server**
```bash
cd Rites-ERC-Vendor
npm start
```

**Expected:** React app starts on `http://localhost:3000`

---

### 3. **Verify Database Entries**

Run this SQL query to check available test data:

```sql
SELECT 
    id,
    heat_number,
    tc_number,
    raw_material,
    supplier_name,
    status
FROM inventory_entries
WHERE vendor_code = '13104'
ORDER BY id;
```

**Expected:** At least one entry with each status:
- FRESH_PO
- UNDER_INSPECTION
- ACCEPTED
- REJECTED
- EXHAUSTED

---

## 🧪 Test Cases

### Test Case 1: View Button Visibility ✅

**Objective:** Verify View button appears for all entries

**Steps:**
1. Navigate to Vendor Dashboard
2. Click on "Inventory Entry" tab
3. Scroll to "Inventory - List of Entries" section
4. Check each row in the table

**Expected Results:**
- ✅ Every row has a "👁️ View" button in the Actions column
- ✅ Button is visible for all statuses (FRESH_PO, UNDER_INSPECTION, ACCEPTED, REJECTED, EXHAUSTED)

**Status:** [ ] Pass [ ] Fail

**Notes:**
_______________________________________________________

---

### Test Case 2: View Modal - FRESH_PO Entry ✅

**Objective:** Verify View modal displays correctly for FRESH_PO entries

**Steps:**
1. Find an entry with status = "FRESH_PO"
2. Click the "👁️ View" button
3. Observe the modal that opens

**Expected Results:**
- ✅ Modal opens with title "Inventory Entry Details"
- ✅ All entry details are displayed in organized sections:
  - Vendor & Company Information
  - Supplier Information
  - Material Information
  - Heat/Batch Information
  - Invoice Information
  - Sub PO Information
  - Pricing Information
  - Audit Information
- ✅ Status badge shows "FRESH_PO" in green
- ✅ Footer has 3 buttons: "Modify", "Delete", "Close"
- ✅ No info message about modification restrictions

**Status:** [ ] Pass [ ] Fail

**Notes:**
_______________________________________________________

---

### Test Case 3: View Modal - Non-FRESH_PO Entry ✅

**Objective:** Verify View modal hides Edit/Delete buttons for non-FRESH_PO entries

**Steps:**
1. Find an entry with status = "UNDER_INSPECTION" (or ACCEPTED/REJECTED/EXHAUSTED)
2. Click the "👁️ View" button
3. Observe the modal that opens

**Expected Results:**
- ✅ Modal opens with all entry details
- ✅ Status badge shows correct status with appropriate color
- ✅ Info message appears: "ℹ️ This entry cannot be modified or deleted because its status is not FRESH_PO."
- ✅ Footer has ONLY 1 button: "Close"
- ✅ "Modify" and "Delete" buttons are NOT visible

**Status:** [ ] Pass [ ] Fail

**Notes:**
_______________________________________________________

---

### Test Case 4: Close View Modal ✅

**Objective:** Verify modal closes properly

**Steps:**
1. Open View modal for any entry
2. Click "Close" button

**Expected Results:**
- ✅ Modal closes
- ✅ Returns to inventory table view
- ✅ No errors in console

**Status:** [ ] Pass [ ] Fail

**Notes:**
_______________________________________________________

---

### Test Case 5: Edit Button Click (Placeholder) ✅

**Objective:** Verify Edit button shows placeholder message

**Steps:**
1. Open View modal for a FRESH_PO entry
2. Click "Modify" button

**Expected Results:**
- ✅ Alert appears with message: "Edit functionality for entry [HEAT_NUMBER] will be implemented soon."
- ✅ Modal closes
- ✅ Console shows: "Edit entry: [entry object]"

**Status:** [ ] Pass [ ] Fail

**Notes:**
_______________________________________________________

---

### Test Case 6: Delete Button - Open Confirmation ✅

**Objective:** Verify Delete button opens confirmation modal

**Steps:**
1. Open View modal for a FRESH_PO entry
2. Click "Delete" button

**Expected Results:**
- ✅ View modal closes
- ✅ Delete Confirmation modal opens
- ✅ Modal shows:
  - Title: "Confirm Delete"
  - Warning icon: ⚠️ (pulsing animation)
  - Entry summary card with:
    - Heat Number
    - TC Number
    - Raw Material
    - Supplier Name
  - Warning message: "This action cannot be undone..."
  - Two buttons: "Cancel" and "Delete"

**Status:** [ ] Pass [ ] Fail

**Notes:**
_______________________________________________________

---

### Test Case 7: Delete Confirmation - Cancel ✅

**Objective:** Verify Cancel button closes confirmation modal

**Steps:**
1. Open Delete Confirmation modal
2. Click "Cancel" button

**Expected Results:**
- ✅ Confirmation modal closes
- ✅ Entry is NOT deleted
- ✅ Returns to inventory table view

**Status:** [ ] Pass [ ] Fail

**Notes:**
_______________________________________________________

---

### Test Case 8: Delete Confirmation - Confirm Delete ✅

**Objective:** Verify successful deletion of FRESH_PO entry

**Steps:**
1. Note the Heat Number of a FRESH_PO entry
2. Open Delete Confirmation modal for that entry
3. Click "Delete" button
4. Wait for operation to complete

**Expected Results:**
- ✅ "Delete" button shows loading spinner
- ✅ Success alert appears: "✅ Inventory entry deleted successfully!"
- ✅ Alert shows Heat Number and TC Number
- ✅ Confirmation modal closes
- ✅ Entry is removed from the table
- ✅ Console shows: "✅ Entry deleted successfully"

**Status:** [ ] Pass [ ] Fail

**Notes:**
_______________________________________________________

---

### Test Case 9: Delete - Backend Validation ✅

**Objective:** Verify backend prevents deletion of non-FRESH_PO entries

**Steps:**
1. Use browser DevTools or Postman
2. Send DELETE request to: `/api/vendor/inventory/entries/{id}`
3. Use ID of an entry with status != FRESH_PO

**Expected Results:**
- ✅ Response status: 400 Bad Request
- ✅ Error message: "Only entries with status FRESH_PO can be deleted"

**Status:** [ ] Pass [ ] Fail

**Notes:**
_______________________________________________________

---

### Test Case 10: Delete - Error Handling ✅

**Objective:** Verify error handling when deletion fails

**Steps:**
1. Stop the backend server
2. Try to delete a FRESH_PO entry
3. Observe error handling

**Expected Results:**
- ✅ Error alert appears: "❌ Failed to delete inventory entry"
- ✅ Error message shows reason
- ✅ Modal remains open
- ✅ Entry is NOT removed from table
- ✅ Console shows error details

**Status:** [ ] Pass [ ] Fail

**Notes:**
_______________________________________________________

---

### Test Case 11: View Modal - Loading State ✅

**Objective:** Verify loading state while fetching entry details

**Steps:**
1. Open browser DevTools → Network tab
2. Throttle network to "Slow 3G"
3. Click View button on any entry

**Expected Results:**
- ✅ Modal opens immediately
- ✅ Loading spinner appears
- ✅ Message: "Loading entry details..."
- ✅ After data loads, details appear
- ✅ Loading spinner disappears

**Status:** [ ] Pass [ ] Fail

**Notes:**
_______________________________________________________

---

### Test Case 12: View Modal - Error State ✅

**Objective:** Verify error state when fetching fails

**Steps:**
1. Stop the backend server
2. Click View button on any entry

**Expected Results:**
- ✅ Modal opens
- ✅ Error message appears: "❌ Failed to load entry details"
- ✅ Error details shown
- ✅ "Close" button is available

**Status:** [ ] Pass [ ] Fail

**Notes:**
_______________________________________________________

---

### Test Case 13: Multiple Operations ✅

**Objective:** Verify multiple view/delete operations work correctly

**Steps:**
1. View entry A → Close
2. View entry B → Close
3. View entry C → Delete → Cancel
4. View entry D → Delete → Confirm

**Expected Results:**
- ✅ All operations work smoothly
- ✅ No memory leaks or state issues
- ✅ Correct entry is deleted
- ✅ Other entries remain intact

**Status:** [ ] Pass [ ] Fail

**Notes:**
_______________________________________________________

---

### Test Case 14: Responsive Design ✅

**Objective:** Verify modals work on different screen sizes

**Steps:**
1. Test on desktop (1920x1080)
2. Test on tablet (768x1024)
3. Test on mobile (375x667)

**Expected Results:**
- ✅ Modals are centered and readable on all sizes
- ✅ Buttons are accessible
- ✅ Content doesn't overflow
- ✅ Scrolling works if needed

**Status:** [ ] Pass [ ] Fail

**Notes:**
_______________________________________________________

---

## 📊 Test Summary

**Total Test Cases:** 14  
**Passed:** ___  
**Failed:** ___  
**Blocked:** ___  
**Not Tested:** ___

---

## 🐛 Bugs Found

| Bug ID | Description | Severity | Status |
|--------|-------------|----------|--------|
| 1 | | | |
| 2 | | | |
| 3 | | | |

---

## ✅ Sign-Off

**Tester Name:** _______________________  
**Date:** _______________________  
**Signature:** _______________________

**Approved By:** _______________________  
**Date:** _______________________  
**Signature:** _______________________

---

**Testing Completed:** [ ] Yes [ ] No  
**Ready for Production:** [ ] Yes [ ] No

