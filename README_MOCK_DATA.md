# Mock Data Package - Raw Material Inspection Request (3 Heat Numbers)

## 📦 Package Contents

This package contains comprehensive mock data and documentation for the **Raw Material Inspection Request** form with **3 heat numbers** scenario.

### Files Included

| File | Purpose | Target Audience |
|------|---------|-----------------|
| **mock-data-raw-material-3-heats.json** | Complete mock data with all field values | Backend Developers, QA |
| **MOCK_DATA_DOCUMENTATION.md** | Comprehensive documentation with field mappings, validation rules, database schema | All Developers |
| **QUICK_REFERENCE.md** | Quick reference guide with key information | All Team Members |
| **API_REQUEST_RESPONSE_EXAMPLES.md** | API endpoint examples with request/response formats | Backend Developers, Frontend Developers |
| **README_MOCK_DATA.md** | This file - overview and getting started guide | All Team Members |

---

## 🎯 Scenario Overview

### Business Context
A vendor (ABC Industries Pvt Ltd) is raising an inspection call for raw material (Steel Round) with multiple heat numbers from different suppliers.

### Key Details
- **PO Number**: PO-2025-1001
- **PO Serial**: PO-2025-1001/01
- **Product**: ERC MK-III Clips - Type A
- **Inspection Type**: Raw Material
- **Number of Heat Numbers**: 3
- **Total Offered Quantity**: 5.500 MT
- **Approximate ERC Count**: 4,786 pieces

### Heat Numbers Breakdown
1. **HT-2025-001** (Steel India Ltd) - 1.500 MT → ~1,304 ERCs
2. **HT-2025-002** (XYZ Materials Co.) - 2.250 MT → ~1,956 ERCs
3. **HT-2025-003** (JSW Steel Ltd) - 1.750 MT → ~1,521 ERCs

---

## 🚀 Quick Start

### For Backend Developers

1. **Review the mock data structure**:
   ```bash
   cat mock-data-raw-material-3-heats.json
   ```

2. **Check API endpoint examples**:
   - Open `API_REQUEST_RESPONSE_EXAMPLES.md`
   - Implement the suggested endpoints
   - Use the request/response formats provided

3. **Database setup**:
   - Refer to database schema in `MOCK_DATA_DOCUMENTATION.md`
   - Create tables: `inspection_calls`, `rm_inspection_details`, `rm_heat_quantities`, `rm_chemical_analysis`

4. **Implement validation**:
   - Check validation rules in `MOCK_DATA_DOCUMENTATION.md`
   - Implement server-side validation for all required fields

### For Frontend Developers

1. **Review form fields**:
   - Open `MOCK_DATA_DOCUMENTATION.md`
   - Check "Form Fields Mapping" section
   - Understand which fields are auto-populated

2. **Implement auto-population logic**:
   - When heat number selected → fetch heat details
   - When TC number selected → fetch TC details
   - When unit selected → fetch unit details

3. **Implement auto-calculation**:
   - Total Offered Qty = Sum of all heat quantities
   - Approx ERCs = Total MT / Conversion Factor * 1000

4. **Test with mock data**:
   - Use `mock-data-raw-material-3-heats.json` for testing
   - Verify all auto-population features work

### For QA/Testing

1. **Review test scenarios**:
   - Open `MOCK_DATA_DOCUMENTATION.md`
   - Check "Testing Scenarios" section

2. **Test validation rules**:
   - Required fields validation
   - Date constraints (within 7 days)
   - Quantity constraints (not exceeding remaining PO qty)
   - Chemical analysis constraints (0-100%)

3. **Test auto-population**:
   - Heat number selection
   - TC number selection
   - Unit selection

4. **Test calculations**:
   - Total offered quantity
   - ERC count calculation

---

## 📋 Key Features

### 1. Multiple Heat Numbers Support
- Form supports multiple heat numbers (currently 3 in this scenario)
- Each heat has its own quantity input
- Total quantity auto-calculated

### 2. Auto-population
- **Heat Number → TC Details**: When heat number is selected, TC number, manufacturer, invoice details, sub-PO details are auto-populated
- **TC Number → Chemical Analysis**: Chemical analysis data is auto-filled if available in history
- **Unit Selection → Unit Details**: Unit name, address, GSTIN, contact person are auto-populated

### 3. Auto-calculation
- **Total Offered Qty (MT)**: Sum of all heat quantities
- **Approx. No. of ERCs**: Calculated using conversion factor (1.150 for MK-III, 1.170 for MK-V)

### 4. Validation
- Required fields validation
- Date range validation (within 7 days from today)
- Quantity validation (not exceeding remaining PO quantity)
- Chemical analysis validation (0-100% range)

---

## 🔑 Important Field Mappings

### Auto-populated Fields (Read-only)
- PO Number, PO Date, PO Quantity (from PO Serial selection)
- TC Date, Manufacturer, Invoice details (from Heat Number selection)
- Sub-PO details, TC Qty (from TC Number selection)
- Unit details (from Unit selection)
- Total Offered Qty, Approx ERCs (auto-calculated)

### User Input Fields (Required)
- PO Serial Number
- Type of Call (Raw Material)
- Desired Inspection Date
- Heat Numbers
- TC Number (dropdown based on heat)
- Heat-wise Offered Quantities
- Chemical Analysis (6 elements: C, Mn, Si, S, P, Cr)
- Company ID (auto-filled)
- Unit ID

### User Input Fields (Optional)
- Vendor Contact Name
- Vendor Contact Phone
- Remarks

---

## 🔄 Data Flow

```
1. User selects PO Serial Number
   ↓
2. PO details auto-populate (PO No, Date, Qty, etc.)
   ↓
3. User selects Type of Call: "Raw Material"
   ↓
4. User selects Heat Number (e.g., HT-2025-001)
   ↓
5. TC Number dropdown populates with available TCs
   ↓
6. User selects TC Number
   ↓
7. TC details auto-populate (Date, Manufacturer, Invoice, Sub-PO, etc.)
   ↓
8. Chemical Analysis auto-fills (if available in history)
   ↓
9. User enters Offered Quantity for each heat
   ↓
10. Total Offered Qty and Approx ERCs auto-calculate
   ↓
11. User selects Unit
   ↓
12. Unit details auto-populate
   ↓
13. User submits form
   ↓
14. Backend validates and creates Inspection Call
```

---

## 📊 Calculation Formulas

### ERC Conversion
```
Conversion Factors:
- ERC MK-III: 1.150 MT per 1000 ERCs
- ERC MK-V: 1.170 MT per 1000 ERCs

Formula:
Approx ERCs = (Total Offered Qty in MT / Conversion Factor) * 1000

Example (MK-III):
5.500 MT / 1.150 * 1000 = 4,782.61 ≈ 4,786 ERCs
```

### Remaining PO Quantity
```
Remaining for RM Inspection = PO Qty - Qty Already Inspected (RM)
Example: 5000 - 2000 = 3000 Nos
```

---

## 🗄️ Database Tables

### Main Tables
1. **inspection_calls** - Main inspection call record
2. **rm_inspection_details** - Raw material specific details
3. **rm_heat_quantities** - Heat-wise quantity breakdown
4. **rm_chemical_analysis** - Chemical composition data

Refer to `MOCK_DATA_DOCUMENTATION.md` for complete schema.

---

## 🔌 API Endpoints

### Core Endpoints
1. `POST /api/vendor/inspection-calls/raw-material` - Submit inspection request
2. `GET /api/vendor/inventory/heat/{heatNumber}` - Get heat details
3. `GET /api/vendor/inventory/available-heats` - Get available heat numbers
4. `GET /api/vendor/inventory/tc/{tcNumber}` - Get TC details
5. `POST /api/vendor/inspection-calls/calculate-erc` - Calculate ERC quantity

Refer to `API_REQUEST_RESPONSE_EXAMPLES.md` for complete API documentation.

---

## ✅ Validation Rules Summary

| Field | Validation |
|-------|------------|
| PO Serial Number | Required |
| Type of Call | Required, must be "Raw Material" |
| Desired Inspection Date | Required, must be between today and today+7 days |
| Heat Numbers | Required, at least 1 heat number |
| TC Number | Required |
| Heat Quantities | Required, all heats must have qty > 0 |
| Total Offered Qty | Must not exceed remaining PO qty |
| Chemical Analysis | All 6 elements required, range 0-100% |
| Company ID | Required |
| Unit ID | Required |

---

## 📝 Usage Examples

### Example 1: Submit Inspection Request
```bash
curl -X POST http://localhost:8080/api/vendor/inspection-calls/raw-material \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d @mock-data-raw-material-3-heats.json
```

### Example 2: Get Heat Details
```bash
curl -X GET http://localhost:8080/api/vendor/inventory/heat/HT-2025-001 \
  -H "Authorization: Bearer {token}"
```

---

## 🧪 Testing Checklist

- [ ] Form loads with correct fields
- [ ] PO Serial selection auto-populates PO details
- [ ] Heat Number selection auto-populates TC dropdown
- [ ] TC Number selection auto-populates all TC details
- [ ] Chemical analysis auto-fills if available
- [ ] Heat quantity inputs appear for each heat
- [ ] Total offered quantity auto-calculates correctly
- [ ] ERC count auto-calculates correctly
- [ ] Unit selection auto-populates unit details
- [ ] Validation errors display correctly
- [ ] Form submission works
- [ ] API returns correct response

---

## 📞 Support

For questions or issues:
1. Check `MOCK_DATA_DOCUMENTATION.md` for detailed information
2. Review `QUICK_REFERENCE.md` for quick answers
3. Check `API_REQUEST_RESPONSE_EXAMPLES.md` for API details

---

## 📄 License & Notes

- This is mock data for development and testing purposes only
- All company names, addresses, and contact details are fictional
- Heat numbers, TC numbers, and invoice numbers are sample data
- Adjust validation rules and business logic as per actual requirements


