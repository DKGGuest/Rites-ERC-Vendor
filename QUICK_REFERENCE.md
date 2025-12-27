# Quick Reference - Raw Material Mock Data (3 Heat Numbers)

## 📁 Files Generated
1. **`mock-data-raw-material-3-heats.json`** - Complete mock data with all details
2. **`MOCK_DATA_DOCUMENTATION.md`** - Comprehensive documentation
3. **`QUICK_REFERENCE.md`** - This file (quick reference)

## 🎯 Scenario Summary
- **Type**: Raw Material Inspection Request
- **Heat Numbers**: 3 (HT-2025-001, HT-2025-002, HT-2025-003)
- **Total Quantity**: 5.500 MT
- **Approximate ERCs**: 4,786 pieces
- **PO**: PO-2025-1001/01 (ERC MK-III Clips - Type A)

## 📊 Heat Numbers Breakdown

| Heat Number | Manufacturer | TC Number | Offered Qty (MT) | Approx ERCs | Status |
|-------------|--------------|-----------|------------------|-------------|---------|
| HT-2025-001 | Steel India Ltd | TC-45678 | 1.500 | 1,304 | Under Inspection |
| HT-2025-002 | XYZ Materials Co. | TC-45681 | 2.250 | 1,956 | Partially Inspected |
| HT-2025-003 | JSW Steel Ltd | TC-45690 | 1.750 | 1,521 | Fresh |
| **TOTAL** | - | - | **5.500** | **4,786** | - |

## 🔑 Key Fields for Backend

### Required Fields
```javascript
{
  "po_serial_no": "PO-2025-1001/01",
  "type_of_call": "Raw Material",
  "desired_inspection_date": "2025-12-22",
  "rm_heat_numbers": "HT-2025-001,HT-2025-002,HT-2025-003",
  "rm_tc_number": "TC-45678",
  "rm_heat_quantities": [
    {"heatNumber": "HT-2025-001", "offeredQty": "1.500"},
    {"heatNumber": "HT-2025-002", "offeredQty": "2.250"},
    {"heatNumber": "HT-2025-003", "offeredQty": "1.750"}
  ],
  "rm_chemical_carbon": 0.42,
  "rm_chemical_manganese": 0.75,
  "rm_chemical_silicon": 0.25,
  "rm_chemical_sulphur": 0.025,
  "rm_chemical_phosphorus": 0.030,
  "rm_chemical_chromium": 0.15,
  "company_id": 1,
  "unit_id": 101
}
```

### Auto-calculated Fields
```javascript
{
  "rm_total_offered_qty_mt": 5.500,  // Sum of all heat quantities
  "rm_offered_qty_erc": 4786         // Total MT / 1.150 * 1000
}
```

## 🔄 Auto-population Flow

### Step 1: Select Heat Number
```
User selects: HT-2025-001
↓
Backend fetches from inventory
↓
Auto-populate:
- TC Number: TC-45678
- TC Date: 2025-11-15
- Manufacturer: Steel India Ltd
- Invoice details
- Sub-PO details
- Chemical analysis (if available)
```

### Step 2: Enter Offered Quantity
```
User enters: 1.500 MT for HT-2025-001
User enters: 2.250 MT for HT-2025-002
User enters: 1.750 MT for HT-2025-003
↓
Auto-calculate:
- Total Offered Qty: 5.500 MT
- Approx ERCs: 4,786
```

### Step 3: Select Unit
```
User selects: Unit 1 - Mumbai
↓
Auto-populate:
- Unit Name: Unit 1 - Mumbai
- Address: Plot 1, MIDC Industrial Area...
- GSTIN: 27AABCU9603R1ZM
- Contact Person: Rajesh Kumar
```

## 🔌 API Endpoints

### 1. Submit Inspection Request
```
POST /api/vendor/inspection-calls/raw-material
Body: inspection_request object from mock data
Response: { ic_number: "RM-IC-2025-005", status: "Pending" }
```

### 2. Get Heat Details (Auto-populate)
```
GET /api/vendor/inventory/heat/{heatNumber}
Example: /api/vendor/inventory/heat/HT-2025-001
Response: Complete heat details with TC and chemical analysis
```

### 3. Get Available Heat Numbers
```
GET /api/vendor/inventory/available-heats?status=Fresh,Inspection Requested
Response: List of available heat numbers with quantities
```

### 4. Get TC Details
```
GET /api/vendor/inventory/tc/{tcNumber}
Example: /api/vendor/inventory/tc/TC-45678
Response: TC details with chemical analysis
```

## ✅ Validation Rules

### Date Validation
- `desired_inspection_date` must be between today and today + 7 days

### Quantity Validation
- Total offered quantity ≤ Remaining PO quantity
- Each heat must have offered quantity > 0
- Remaining PO qty = 5000 - 2000 = 3000 Nos

### Chemical Analysis Validation
- All 6 elements required (C, Mn, Si, S, P, Cr)
- Range: 0 to 100 (percentage)
- Step: 0.01

## 🧮 Calculation Formula

### ERC Conversion
```
For ERC MK-III:
Conversion Factor = 1.150 MT per 1000 ERCs

Formula:
Approx ERCs = (Total Offered Qty in MT / Conversion Factor) * 1000

Example:
5.500 MT / 1.150 * 1000 = 4,782.61 ≈ 4,786 ERCs
```

### Heat-wise Breakdown
```
Heat 1: 1.500 MT → 1,304 ERCs
Heat 2: 2.250 MT → 1,956 ERCs
Heat 3: 1.750 MT → 1,521 ERCs
Total:  5.500 MT → 4,786 ERCs (rounded)
```

## 🗄️ Database Tables

### inspection_calls
- ic_number, po_no, po_serial_no, type_of_call, desired_inspection_date
- status, company_id, unit_id, remarks, created_at

### rm_inspection_details
- ic_id, heat_numbers, tc_number, manufacturer, invoice details
- sub_po details, total_offered_qty_mt, offered_qty_erc

### rm_heat_quantities
- rm_detail_id, heat_number, offered_qty

### rm_chemical_analysis
- rm_detail_id, carbon, manganese, silicon, sulphur, phosphorus, chromium

## 🧪 Quick Test Cases

### Test 1: Happy Path
1. Select PO Serial: PO-2025-1001/01
2. Select Type: Raw Material
3. Select Heat: HT-2025-001
4. Enter Qty: 1.500 MT
5. Add Heat: HT-2025-002, Qty: 2.250 MT
6. Add Heat: HT-2025-003, Qty: 1.750 MT
7. Verify Total: 5.500 MT, 4,786 ERCs
8. Submit → Success

### Test 2: Validation Error
1. Select Heat but don't enter quantity → Error
2. Enter quantity > remaining PO qty → Error
3. Skip chemical analysis → Error
4. Select date > 7 days from today → Error

### Test 3: Auto-population
1. Select Heat Number → TC details auto-populate
2. Change Unit → Unit details auto-populate
3. Change heat quantities → Total auto-recalculates

## 📝 Notes for Backend Developers

1. **Multiple Heat Numbers**: Store as comma-separated string in main table, individual entries in junction table
2. **Chemical Analysis**: Can be auto-filled from history but must be editable
3. **Calculations**: Backend should validate frontend calculations
4. **Status Flow**: Pending → Scheduled → Under Inspection → Completed/Rejected
5. **Inventory Update**: After inspection, update `qtyLeftForInspection` in inventory

## 📝 Notes for Frontend Developers

1. **Heat Selection**: Support multiple heat number selection (currently single select in form)
2. **Auto-calculation**: Implement useEffect hooks for total quantity and ERC calculation
3. **Validation**: Client-side validation before API call
4. **Error Handling**: Display validation errors clearly
5. **Loading States**: Show loading during auto-population API calls

## 🔗 Related Files
- Form Component: `src/components/RaiseInspectionCallForm.js`
- Mock Data: `src/data/vendorMockData.js`
- Styles: `src/styles/raiseInspectionCall.css`


