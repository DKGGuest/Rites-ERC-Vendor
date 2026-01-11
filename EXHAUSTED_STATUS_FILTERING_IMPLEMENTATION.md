# ✅ EXHAUSTED Status Filtering Implementation

## 🎯 Objective
Ensure that inventory entries with status = "EXHAUSTED" are:
- ❌ **Excluded** from the heat number dropdown in "Raw Material Raising Call" section
- ✅ **Visible** in the "Inventory - List of Entries" table for audit purposes

---

## 📋 What Was Implemented

### 1. **Backend API Endpoint** ✅ (Already Existed)
**Endpoint:** `GET /api/vendor/available-heat-numbers/{vendorCode}`

**Location:** `RITES-SARTHI-BACKEND/src/main/java/com/sarthi/controller/VendorController.java`

**Filtering Logic:**
```java
// In VendorHeatNumberServiceImpl.java (Line 207)
if (inventory.getStatus() != InventoryEntry.InventoryStatus.FRESH_PO) {
    dto.setAvailable(false);
}
```

**Behavior:**
- Fetches ALL heat numbers from database
- Marks each as available/unavailable based on:
  - Remaining quantity > 0
  - Status = FRESH_PO
- Returns only available heat numbers (isAvailable = true)

**Status Filtering:**
| Status | Available in Dropdown? |
|--------|------------------------|
| FRESH_PO | ✅ Yes |
| UNDER_INSPECTION | ❌ No |
| ACCEPTED | ❌ No |
| REJECTED | ❌ No |
| **EXHAUSTED** | ❌ No |

---

### 2. **Frontend Service Method** ✅ (NEW)
**File:** `Rites-ERC-Vendor/src/services/inventoryService.js`

**New Method:** `getAvailableHeatNumbers(vendorCode)`

```javascript
getAvailableHeatNumbers: async (vendorCode) => {
  const response = await httpClient.get(`/vendor/available-heat-numbers/${vendorCode}`);
  return {
    success: true,
    data: response.data || []
  };
}
```

**Purpose:** Fetch only available heat numbers from the backend API

---

### 3. **Vendor Dashboard Page** ✅ (UPDATED)
**File:** `Rites-ERC-Vendor/src/pages/VendorDashboardPage.js`

**Changes:**

#### A. Added State for Available Heat Numbers
```javascript
const [availableHeatNumbers, setAvailableHeatNumbers] = useState([]);
```

#### B. Added useEffect to Fetch Available Heat Numbers
```javascript
useEffect(() => {
  const fetchAvailableHeatNumbers = async () => {
    const response = await inventoryService.getAvailableHeatNumbers('13104');
    if (response.success && response.data) {
      const transformedHeatNumbers = response.data.map(heat => ({
        heatNumber: heat.heatNumber,
        tcNumber: heat.tcNumber,
        rawMaterial: heat.rawMaterial,
        supplierName: heat.supplierName || 'Unknown Supplier',
        gradeSpecification: heat.gradeSpecification,
        qtyLeft: heat.tcQtyRemaining,
        unit: heat.unitOfMeasurement || 'KG',
        status: heat.status,
        isAvailable: heat.isAvailable
      }));
      setAvailableHeatNumbers(transformedHeatNumbers);
    }
  };
  fetchAvailableHeatNumbers();
}, []);
```

#### C. Passed availableHeatNumbers to RaiseInspectionCallForm
```javascript
<RaiseInspectionCallForm
  inventoryEntries={inventoryEntries}
  availableHeatNumbers={availableHeatNumbers}  // ← NEW PROP
  onSubmit={handleSubmit}
  isLoading={isLoading}
/>
```

---

### 4. **Raise Inspection Call Form** ✅ (UPDATED)
**File:** `Rites-ERC-Vendor/src/components/RaiseInspectionCallForm.js`

**Changes:**

#### A. Added availableHeatNumbers Prop
```javascript
export const RaiseInspectionCallForm = ({
  inventoryEntries = [],
  availableHeatNumbers = [],  // ← NEW PROP
  selectedPO = null,
  onSubmit,
  isLoading = false
}) => {
```

#### B. Updated useMemo to Use availableHeatNumbers
```javascript
const heatNumbersForDropdown = useMemo(() => {
  if (availableHeatNumbers && availableHeatNumbers.length > 0) {
    console.log('✅ Using availableHeatNumbers from API:', availableHeatNumbers.length);
    return availableHeatNumbers;
  }
  
  // Fallback: filter from inventoryEntries (for backward compatibility)
  console.log('⚠️ Falling back to filtering inventoryEntries');
  return inventoryEntries.filter(entry =>
    entry.status === 'Fresh' ||
    entry.status === 'Inspection Requested' ||
    entry.qtyLeftForInspection > 0
  );
}, [availableHeatNumbers, inventoryEntries]);
```

#### C. Updated Dropdown to Use heatNumbersForDropdown
```javascript
<select>
  <option value="">-- Select Heat Number --</option>
  {heatNumbersForDropdown.map(heat => (
    <option key={heat.heatNumber} value={heat.heatNumber}>
      {heat.heatNumber} - ({heat.supplierName})
    </option>
  ))}
</select>
```

---

## 🔄 Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│ DATABASE (inventory_entries table)                          │
│ - Contains ALL entries (FRESH_PO, EXHAUSTED, etc.)         │
└─────────────────────────────────────────────────────────────┘
                          │
                          ├──────────────────────────────────┐
                          │                                  │
                          ▼                                  ▼
┌──────────────────────────────────────┐  ┌──────────────────────────────────────┐
│ GET /api/vendor/inventory/entries/   │  │ GET /api/vendor/available-heat-      │
│ {vendorCode}                         │  │ numbers/{vendorCode}                 │
│                                      │  │                                      │
│ Returns: ALL entries                 │  │ Returns: Only FRESH_PO entries       │
│ (including EXHAUSTED)                │  │ (EXHAUSTED filtered out)             │
└──────────────────────────────────────┘  └──────────────────────────────────────┘
                          │                                  │
                          ▼                                  ▼
┌──────────────────────────────────────┐  ┌──────────────────────────────────────┐
│ inventoryEntries state               │  │ availableHeatNumbers state           │
│ Used for: Inventory List Table       │  │ Used for: Heat Number Dropdown       │
└──────────────────────────────────────┘  └──────────────────────────────────────┘
```

---

## ✅ Expected Behavior

### Scenario 1: Fresh Inventory Entry
- **Status:** FRESH_PO
- **Appears in Dropdown:** ✅ Yes
- **Appears in Inventory List:** ✅ Yes

### Scenario 2: Exhausted Inventory Entry
- **Status:** EXHAUSTED
- **Appears in Dropdown:** ❌ No (filtered out by backend)
- **Appears in Inventory List:** ✅ Yes (for audit trail)

### Scenario 3: Under Inspection Entry
- **Status:** UNDER_INSPECTION
- **Appears in Dropdown:** ❌ No (filtered out by backend)
- **Appears in Inventory List:** ✅ Yes

---

## 🧪 Testing Steps

### 1. Insert EXHAUSTED Entry (Already Done)
Execute `MANUAL_INVENTORY_INSERT.sql` to add an entry with status='EXHAUSTED'

### 2. Restart Backend
```bash
cd d:\vendor\RITES-SARTHI-BACKEND
mvn spring-boot:run
```

### 3. Start Frontend
```bash
cd d:\vendor\Rites-ERC-Vendor
npm start
```

### 4. Verify in UI

#### A. Check Inventory List Table
1. Navigate to: **Vendor Dashboard** → **Inventory Entry** tab
2. Look for the EXHAUSTED entry (Heat Number: HN12345)
3. **Expected:** Entry should be visible with status badge "EXHAUSTED"

#### B. Check Heat Number Dropdown
1. Navigate to: **Vendor Dashboard** → **Raising Call** tab
2. Scroll to "Raw Material Raising Call" section
3. Click "Add Heat Number" button
4. Open the "Heat Number" dropdown
5. **Expected:** HN12345 should NOT appear in the dropdown
6. **Expected:** Only FRESH_PO entries should appear

---

## 📊 Files Modified

### Backend (No Changes - Already Correct)
- ✅ `VendorController.java` - Endpoint already exists
- ✅ `VendorHeatNumberServiceImpl.java` - Filtering logic already correct
- ✅ `InventoryEntry.java` - EXHAUSTED enum already added

### Frontend (3 Files Modified)
1. ✅ `src/services/inventoryService.js` - Added `getAvailableHeatNumbers()` method
2. ✅ `src/pages/VendorDashboardPage.js` - Added state and fetch logic
3. ✅ `src/components/RaiseInspectionCallForm.js` - Updated to use new prop

---

**Implementation Date:** 2026-01-09  
**Status:** ✅ COMPLETE - Ready for Testing  
**Risk Level:** LOW (Uses existing backend API, backward compatible)

