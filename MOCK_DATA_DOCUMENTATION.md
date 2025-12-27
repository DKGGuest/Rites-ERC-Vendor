# Mock Data Documentation - Raw Material Inspection Request

## Overview
This document provides comprehensive documentation for the mock data generated for the "Raise Inspection Request" form, specifically for the **Raw Material** type of call with **3 heat numbers**.

## File Location
- **Mock Data File**: `mock-data-raw-material-3-heats.json`
- **Form Component**: `src/components/RaiseInspectionCallForm.js`
- **Related Data**: `src/data/vendorMockData.js`

## Scenario Description
A vendor (ABC Industries Pvt Ltd) is raising an inspection call for raw material stage with the following details:
- **PO Number**: PO-2025-1001
- **PO Serial**: PO-2025-1001/01
- **Product**: ERC MK-III Clips - Type A
- **Total Heat Numbers**: 3 (HT-2025-001, HT-2025-002, HT-2025-003)
- **Total Offered Quantity**: 5.500 MT
- **Approximate ERCs**: 4,786 pieces

## Data Structure

### 1. Main Inspection Request Object
```json
{
  "inspection_request": {
    // PO Data (Auto-fetched from IREPS)
    "po_no": "PO-2025-1001",
    "po_serial_no": "PO-2025-1001/01",
    "po_date": "2025-11-01",
    "po_qty": 5000,
    "po_unit": "Nos",
    
    // Call Details
    "type_of_call": "Raw Material",
    "desired_inspection_date": "2025-12-22",
    
    // Raw Material Specific Fields
    "rm_heat_numbers": "HT-2025-001,HT-2025-002,HT-2025-003",
    "rm_tc_number": "TC-45678",
    "rm_manufacturer": "Steel India Ltd",
    
    // Chemical Analysis
    "rm_chemical_carbon": 0.42,
    "rm_chemical_manganese": 0.75,
    // ... other elements
    
    // Heat-wise Quantities
    "rm_heat_quantities": [
      {"heatNumber": "HT-2025-001", "offeredQty": "1.500"},
      {"heatNumber": "HT-2025-002", "offeredQty": "2.250"},
      {"heatNumber": "HT-2025-003", "offeredQty": "1.750"}
    ],
    
    // Auto-calculated Fields
    "rm_total_offered_qty_mt": 5.500,
    "rm_offered_qty_erc": 4786,
    
    // Place of Inspection
    "company_id": 1,
    "unit_id": 101,
    "unit_name": "Unit 1 - Mumbai"
  }
}
```

### 2. Heat Details Array
Contains detailed information for each of the 3 heat numbers:

#### Heat 1: HT-2025-001
- **Manufacturer**: Steel India Ltd
- **TC Number**: TC-45678
- **Offered Qty**: 1.500 MT
- **Status**: Under Inspection
- **Approx ERCs**: 1,304 pieces

#### Heat 2: HT-2025-002
- **Manufacturer**: XYZ Materials Co.
- **TC Number**: TC-45681
- **Offered Qty**: 2.250 MT
- **Status**: Partially Inspected
- **Approx ERCs**: 1,956 pieces

#### Heat 3: HT-2025-003
- **Manufacturer**: JSW Steel Ltd
- **TC Number**: TC-45690
- **Offered Qty**: 1.750 MT
- **Status**: Fresh
- **Approx ERCs**: 1,521 pieces

### 3. Calculation Details
```
Conversion Factor (ERC MK-III): 1.150 MT per 1000 ERCs
Formula: Total Offered Qty (MT) / Conversion Factor * 1000
Calculation: 5.500 / 1.150 * 1000 = 4,786 ERCs
```

## Form Fields Mapping

### Common Section (Auto-fetched from IREPS)
| Field Name | Data Type | Source | Example Value |
|------------|-----------|--------|---------------|
| po_serial_no | String | User Selection | PO-2025-1001/01 |
| po_no | String | Auto-fetched | PO-2025-1001 |
| po_date | Date | Auto-fetched | 2025-11-01 |
| po_qty | Number | Auto-fetched | 5000 |
| po_unit | String | Auto-fetched | Nos |
| amendment_no | String | Auto-fetched | AMD-001 |
| amendment_date | Date | Auto-fetched | 2025-11-05 |

### Call Details Section
| Field Name | Data Type | Required | Example Value |
|------------|-----------|----------|---------------|
| type_of_call | Enum | Yes | Raw Material |
| desired_inspection_date | Date | Yes | 2025-12-22 |

### Raw Material Section
| Field Name | Data Type | Required | Auto-populated | Example Value |
|------------|-----------|----------|----------------|---------------|
| rm_heat_numbers | String | Yes | No | HT-2025-001,HT-2025-002,HT-2025-003 |
| rm_tc_number | String | Yes | Yes | TC-45678 |
| rm_tc_date | Date | No | Yes | 2025-11-15 |
| rm_manufacturer | String | No | Yes | Steel India Ltd |
| rm_invoice_no | String | No | Yes | INV-2025-1001 |
| rm_invoice_date | Date | No | Yes | 2025-11-14 |
| rm_sub_po_number | String | No | Yes | SPO-2025-101 |
| rm_sub_po_date | Date | No | Yes | 2025-11-10 |
| rm_sub_po_qty | String | No | Yes | 5000 Kg |
| rm_sub_po_total_value | String | No | Yes | ₹504450.00 |
| rm_tc_qty | String | No | Yes | 5000 Kg |
| rm_tc_qty_remaining | String | No | Yes | 2000 Kg |

### Chemical Analysis Section
| Field Name | Data Type | Required | Range | Example Value |
|------------|-----------|----------|-------|---------------|
| rm_chemical_carbon | Number | Yes | 0-100 | 0.42 |
| rm_chemical_manganese | Number | Yes | 0-100 | 0.75 |
| rm_chemical_silicon | Number | Yes | 0-100 | 0.25 |
| rm_chemical_sulphur | Number | Yes | 0-100 | 0.025 |
| rm_chemical_phosphorus | Number | Yes | 0-100 | 0.030 |
| rm_chemical_chromium | Number | Yes | 0-100 | 0.15 |

### Offered Quantity Section
| Field Name | Data Type | Required | Auto-calculated | Example Value |
|------------|-----------|----------|-----------------|---------------|
| rm_heat_quantities | Array | Yes | No | [{heatNumber, offeredQty}] |
| rm_total_offered_qty_mt | Number | Yes | Yes | 5.500 |
| rm_offered_qty_erc | Number | No | Yes | 4786 |

### Place of Inspection Section
| Field Name | Data Type | Required | Auto-populated | Example Value |
|------------|-----------|----------|----------------|---------------|
| company_id | Number | Yes | Yes | 1 |
| company_name | String | No | Yes | ABC Industries Pvt Ltd |
| cin | String | No | Yes | U27100MH2020PTC123456 |
| unit_id | Number | Yes | No | 101 |
| unit_name | String | No | Yes | Unit 1 - Mumbai |
| unit_address | String | No | Yes | Plot 1, MIDC... |
| unit_gstin | String | No | Yes | 27AABCU9603R1ZM |
| unit_contact_person | String | No | Yes | Rajesh Kumar |
| unit_role | String | No | Yes | ERC Manufacturer |

## Validation Rules

### Required Fields Validation
All fields marked as "Required: Yes" must be filled before form submission:
- `po_serial_no`
- `type_of_call`
- `desired_inspection_date`
- `company_id`
- `unit_id`
- `rm_heat_numbers`
- `rm_tc_number`
- All chemical analysis fields (6 elements)

### Date Constraints
```javascript
desired_inspection_date: {
  min: today,
  max: today + 7 days,
  format: "YYYY-MM-DD"
}
```

### Quantity Constraints
```javascript
// Total offered quantity validation
rm_total_offered_qty_mt: {
  min: 0,
  max: remaining_po_qty,
  validation: "Cannot exceed remaining PO quantity"
}

// Heat-wise quantity validation
rm_heat_quantities: {
  validation: "All heat numbers must have offered quantity > 0"
}

// Remaining PO quantity calculation
remaining_po_qty = po_qty - qty_already_inspected_rm
// Example: 5000 - 2000 = 3000 Nos
```

### Chemical Analysis Constraints
```javascript
all_elements: {
  min: 0,
  max: 100,
  step: 0.01,
  unit: "percentage"
}
```

## Backend API Integration

### 1. Submit Inspection Request
**Endpoint**: `POST /api/vendor/inspection-calls/raw-material`

**Request Body**:
```json
{
  "po_no": "PO-2025-1001",
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
  "rm_total_offered_qty_mt": 5.500,
  "rm_offered_qty_erc": 4786,
  "rm_chemical_carbon": 0.42,
  "rm_chemical_manganese": 0.75,
  "rm_chemical_silicon": 0.25,
  "rm_chemical_sulphur": 0.025,
  "rm_chemical_phosphorus": 0.030,
  "rm_chemical_chromium": 0.15,
  "company_id": 1,
  "unit_id": 101,
  "remarks": "All three heat numbers are from the same batch..."
}
```

**Expected Response**:
```json
{
  "success": true,
  "message": "Raw Material Inspection Call created successfully",
  "data": {
    "ic_number": "RM-IC-2025-005",
    "status": "Pending",
    "created_at": "2025-12-18T10:30:00Z",
    "inspection_request_id": 12345
  }
}
```

### 2. Auto-populate Heat Details
**Endpoint**: `GET /api/vendor/inventory/heat/{heatNumber}`

**Example**: `GET /api/vendor/inventory/heat/HT-2025-001`

**Expected Response**:
```json
{
  "success": true,
  "data": {
    "heatNumber": "HT-2025-001",
    "tcNumber": "TC-45678",
    "tcDate": "2025-11-15",
    "manufacturer": "Steel India Ltd",
    "rawMaterial": "Steel Round",
    "gradeSpecification": "IS 2062",
    "invoiceNumber": "INV-2025-1001",
    "invoiceDate": "2025-11-14",
    "subPoNumber": "SPO-2025-101",
    "subPoDate": "2025-11-10",
    "subPoQty": 5000,
    "unitOfMeasurement": "Kg",
    "qtyLeftForInspection": 2000,
    "chemicalAnalysis": {
      "carbon": 0.42,
      "manganese": 0.75,
      "silicon": 0.25,
      "sulphur": 0.025,
      "phosphorus": 0.030,
      "chromium": 0.15
    }
  }
}
```

### 3. Get Available Heat Numbers
**Endpoint**: `GET /api/vendor/inventory/available-heats`

**Query Parameters**:
- `status`: Fresh, Inspection Requested, Partially Inspected

**Expected Response**:
```json
{
  "success": true,
  "data": [
    {
      "heatNumber": "HT-2025-001",
      "tcNumber": "TC-45678",
      "rawMaterial": "Steel Round",
      "supplierName": "Steel India Ltd",
      "qtyLeft": 2000,
      "unit": "Kg"
    },
    {
      "heatNumber": "HT-2025-002",
      "tcNumber": "TC-45681",
      "rawMaterial": "Steel Round",
      "supplierName": "XYZ Materials Co.",
      "qtyLeft": 4000,
      "unit": "Kg"
    }
  ]
}
```

### 4. Get TC Details
**Endpoint**: `GET /api/vendor/inventory/tc/{tcNumber}`

**Example**: `GET /api/vendor/inventory/tc/TC-45678`

**Expected Response**: Similar to heat details response with complete TC information

## Auto-population Logic

### When Heat Number is Selected:
1. **Fetch TC Number** from inventory based on heat number
2. **Auto-populate** the following fields:
   - TC Date
   - Manufacturer Name
   - Invoice Number & Date
   - Sub-PO Number, Date, Qty, Total Value
   - TC Qty & Remaining Qty
3. **Auto-fill Chemical Analysis** (if previously entered for this heat)
   - Carbon, Manganese, Silicon, Sulphur, Phosphorus, Chromium
4. **Create Heat Quantity Entry** in `rm_heat_quantities` array

### When TC Number is Selected:
1. **Fetch all related data** from inventory
2. **Auto-populate** all TC-related fields
3. **Pre-fill** chemical analysis if available in history

### When Heat Quantities Change:
1. **Calculate Total Offered Qty (MT)**: Sum of all heat quantities
2. **Calculate Approx. No. of ERCs**:
   ```
   Total MT / Conversion Factor * 1000
   For MK-III: Total MT / 1.150 * 1000
   For MK-V: Total MT / 1.170 * 1000
   ```

### When Unit is Selected:
1. **Auto-populate** unit details:
   - Unit Name
   - Unit Address
   - GSTIN
   - Contact Person
   - Role of Unit

## Testing Scenarios

### Test Case 1: Single Heat Number
- Select only HT-2025-001
- Verify auto-population of TC details
- Enter offered quantity: 1.500 MT
- Verify ERC calculation: ~1,304 ERCs

### Test Case 2: Multiple Heat Numbers (3)
- Select HT-2025-001, HT-2025-002, HT-2025-003
- Verify each heat has separate quantity input
- Enter quantities: 1.500, 2.250, 1.750 MT
- Verify total: 5.500 MT
- Verify total ERCs: 4,786

### Test Case 3: Validation Errors
- Submit without heat number → Error
- Submit without TC number → Error
- Submit without chemical analysis → Error
- Submit with quantity > remaining PO qty → Error
- Submit with date > 7 days from today → Error

### Test Case 4: Auto-calculation
- Change heat quantities
- Verify total MT auto-updates
- Verify ERC count auto-updates
- Verify calculations are correct

## Database Schema Suggestions

### Table: inspection_calls
```sql
CREATE TABLE inspection_calls (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  ic_number VARCHAR(50) UNIQUE NOT NULL,
  po_no VARCHAR(50) NOT NULL,
  po_serial_no VARCHAR(50) NOT NULL,
  type_of_call ENUM('Raw Material', 'Process', 'Final') NOT NULL,
  desired_inspection_date DATE NOT NULL,
  status ENUM('Pending', 'Scheduled', 'Under Inspection', 'Completed', 'Rejected') DEFAULT 'Pending',
  company_id INT NOT NULL,
  unit_id INT NOT NULL,
  remarks TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Table: rm_inspection_details
```sql
CREATE TABLE rm_inspection_details (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  ic_id BIGINT NOT NULL,
  heat_numbers TEXT NOT NULL,
  tc_number VARCHAR(50) NOT NULL,
  tc_date DATE,
  manufacturer VARCHAR(255),
  invoice_no VARCHAR(50),
  invoice_date DATE,
  sub_po_number VARCHAR(50),
  sub_po_date DATE,
  sub_po_qty VARCHAR(50),
  sub_po_total_value VARCHAR(50),
  tc_qty VARCHAR(50),
  tc_qty_remaining VARCHAR(50),
  total_offered_qty_mt DECIMAL(10,3),
  offered_qty_erc INT,
  FOREIGN KEY (ic_id) REFERENCES inspection_calls(id)
);
```

### Table: rm_heat_quantities
```sql
CREATE TABLE rm_heat_quantities (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  rm_detail_id BIGINT NOT NULL,
  heat_number VARCHAR(50) NOT NULL,
  offered_qty DECIMAL(10,3) NOT NULL,
  FOREIGN KEY (rm_detail_id) REFERENCES rm_inspection_details(id)
);
```

### Table: rm_chemical_analysis
```sql
CREATE TABLE rm_chemical_analysis (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  rm_detail_id BIGINT NOT NULL,
  carbon DECIMAL(5,3),
  manganese DECIMAL(5,3),
  silicon DECIMAL(5,3),
  sulphur DECIMAL(5,3),
  phosphorus DECIMAL(5,3),
  chromium DECIMAL(5,3),
  FOREIGN KEY (rm_detail_id) REFERENCES rm_inspection_details(id)
);
```

## Usage Instructions

### For Backend Developers:
1. Use `mock-data-raw-material-3-heats.json` as reference for API request/response structure
2. Implement the suggested API endpoints
3. Follow the validation rules defined in this document
4. Use the database schema suggestions for data modeling
5. Test with the provided test scenarios

### For Frontend Developers:
1. Reference the form fields mapping table for field names and types
2. Implement auto-population logic as described
3. Use the mock data for testing form submission
4. Implement auto-calculation for total quantities and ERC count
5. Follow validation rules for client-side validation

### For QA/Testing:
1. Use the test scenarios provided
2. Verify all auto-population features work correctly
3. Test validation rules thoroughly
4. Verify calculations are accurate
5. Test with edge cases (boundary values, invalid inputs)

## Notes
- All monetary values are in Indian Rupees (₹)
- Dates are in ISO format (YYYY-MM-DD)
- Quantities can be in different units (Kg, MT, Nos, Bags, etc.)
- Chemical analysis values are in percentages
- ERC conversion factors vary by product type (MK-III: 1.150, MK-V: 1.170)


