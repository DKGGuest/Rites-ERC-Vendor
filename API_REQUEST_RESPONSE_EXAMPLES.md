# API Request & Response Examples - Raw Material Inspection

## 1. Submit Raw Material Inspection Request

### Endpoint
```
POST /api/vendor/inspection-calls/raw-material
Content-Type: application/json
Authorization: Bearer {token}
```

### Request Body
```json
{
  "po_no": "PO-2025-1001",
  "po_serial_no": "PO-2025-1001/01",
  "po_date": "2025-11-01",
  "po_description": "ERC MK-III Clips - Type A",
  "po_qty": 5000,
  "po_unit": "Nos",
  "amendment_no": "AMD-001",
  "amendment_date": "2025-11-05",
  "vendor_contact_name": "Rajesh Kumar",
  "vendor_contact_phone": "+91-9876543210",
  
  "type_of_call": "Raw Material",
  "desired_inspection_date": "2025-12-22",
  
  "qty_already_inspected_rm": 2000,
  "qty_already_inspected_process": 1500,
  "qty_already_inspected_final": 0,
  
  "rm_heat_numbers": "HT-2025-001,HT-2025-002,HT-2025-003",
  "rm_tc_number": "TC-45678",
  "rm_tc_date": "2025-11-15",
  "rm_manufacturer": "Steel India Ltd",
  "rm_invoice_no": "INV-2025-1001",
  "rm_invoice_date": "2025-11-14",
  "rm_sub_po_number": "SPO-2025-101",
  "rm_sub_po_date": "2025-11-10",
  "rm_sub_po_qty": "5000 Kg",
  "rm_sub_po_total_value": "₹504450.00",
  "rm_tc_qty": "5000 Kg",
  "rm_tc_qty_remaining": "2000 Kg",
  
  "rm_chemical_carbon": 0.42,
  "rm_chemical_manganese": 0.75,
  "rm_chemical_silicon": 0.25,
  "rm_chemical_sulphur": 0.025,
  "rm_chemical_phosphorus": 0.030,
  "rm_chemical_chromium": 0.15,
  
  "rm_heat_quantities": [
    {
      "heatNumber": "HT-2025-001",
      "offeredQty": "1.500"
    },
    {
      "heatNumber": "HT-2025-002",
      "offeredQty": "2.250"
    },
    {
      "heatNumber": "HT-2025-003",
      "offeredQty": "1.750"
    }
  ],
  "rm_total_offered_qty_mt": 5.500,
  "rm_offered_qty_erc": 4786,
  
  "company_id": 1,
  "company_name": "ABC Industries Pvt Ltd",
  "cin": "U27100MH2020PTC123456",
  "unit_id": 101,
  "unit_name": "Unit 1 - Mumbai",
  "unit_address": "Plot 1, MIDC Industrial Area, Andheri East, Mumbai - 400093",
  "unit_gstin": "27AABCU9603R1ZM",
  "unit_contact_person": "Rajesh Kumar",
  "unit_role": "ERC Manufacturer",
  
  "remarks": "All three heat numbers are from the same batch. Material quality verified as per IS 2062 standards. Ready for inspection."
}
```

### Success Response (201 Created)
```json
{
  "success": true,
  "message": "Raw Material Inspection Call created successfully",
  "data": {
    "ic_number": "RM-IC-2025-005",
    "ic_id": 12345,
    "status": "Pending",
    "po_no": "PO-2025-1001",
    "po_serial_no": "PO-2025-1001/01",
    "type_of_call": "Raw Material",
    "desired_inspection_date": "2025-12-22",
    "total_offered_qty_mt": 5.500,
    "approx_erc_count": 4786,
    "heat_count": 3,
    "created_at": "2025-12-18T10:30:00Z",
    "created_by": "vendor_user_123"
  }
}
```

### Error Response (400 Bad Request)
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "rm_total_offered_qty_mt",
      "message": "Total offered quantity (5.500 MT) exceeds remaining PO quantity (3.000 MT)"
    },
    {
      "field": "desired_inspection_date",
      "message": "Inspection date must be within 7 days from today"
    }
  ]
}
```

---

## 2. Get Heat Number Details (Auto-populate)

### Endpoint
```
GET /api/vendor/inventory/heat/{heatNumber}
```

### Example Request
```
GET /api/vendor/inventory/heat/HT-2025-001
Authorization: Bearer {token}
```

### Success Response (200 OK)
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
    "subPoQtyUnit": "Kg",
    "rateOfMaterial": 85.50,
    "rateOfGst": 18,
    "subPoTotalValue": 504450.00,
    "declaredQuantity": 5000,
    "qtyOfferedForInspection": 3000,
    "qtyLeftForInspection": 2000,
    "unitOfMeasurement": "Kg",
    "status": "Under Inspection",
    "chemicalAnalysis": {
      "carbon": 0.42,
      "manganese": 0.75,
      "silicon": 0.25,
      "sulphur": 0.025,
      "phosphorus": 0.030,
      "chromium": 0.15,
      "lastUpdated": "2025-11-15T08:00:00Z"
    },
    "entryDate": "2025-11-16"
  }
}
```

### Error Response (404 Not Found)
```json
{
  "success": false,
  "message": "Heat number not found",
  "error": {
    "code": "HEAT_NOT_FOUND",
    "details": "Heat number HT-2025-999 does not exist in inventory"
  }
}
```

---

## 3. Get Available Heat Numbers

### Endpoint
```
GET /api/vendor/inventory/available-heats
```

### Example Request
```
GET /api/vendor/inventory/available-heats?status=Fresh,Inspection Requested,Partially Inspected
Authorization: Bearer {token}
```

### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| status | String | No | Comma-separated status values |
| rawMaterial | String | No | Filter by raw material type |
| minQty | Number | No | Minimum quantity available |

### Success Response (200 OK)
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "heatNumber": "HT-2025-001",
      "tcNumber": "TC-45678",
      "rawMaterial": "Steel Round",
      "supplierName": "Steel India Ltd",
      "gradeSpecification": "IS 2062",
      "qtyLeft": 2000,
      "unit": "Kg",
      "status": "Under Inspection",
      "entryDate": "2025-11-16"
    },
    {
      "heatNumber": "HT-2025-002",
      "tcNumber": "TC-45681",
      "rawMaterial": "Steel Round",
      "supplierName": "XYZ Materials Co.",
      "gradeSpecification": "IS 1786",
      "qtyLeft": 4000,
      "unit": "Kg",
      "status": "Partially Inspected",
      "entryDate": "2025-11-21"
    },
    {
      "heatNumber": "HT-2025-003",
      "tcNumber": "TC-45690",
      "rawMaterial": "Steel Round",
      "supplierName": "JSW Steel Ltd",
      "gradeSpecification": "IS 2062",
      "qtyLeft": 7500,
      "unit": "Kg",
      "status": "Fresh",
      "entryDate": "2025-11-24"
    }
  ]
}
```

---

## 4. Get TC Details

### Endpoint
```
GET /api/vendor/inventory/tc/{tcNumber}
```

### Example Request
```
GET /api/vendor/inventory/tc/TC-45678
Authorization: Bearer {token}
```

### Success Response (200 OK)
```json
{
  "success": true,
  "data": {
    "tcNumber": "TC-45678",
    "tcDate": "2025-11-15",
    "heatNumbers": ["HT-2025-001"],
    "manufacturer": "Steel India Ltd",
    "rawMaterial": "Steel Round",
    "gradeSpecification": "IS 2062",
    "invoiceNumber": "INV-2025-1001",
    "invoiceDate": "2025-11-14",
    "subPoNumber": "SPO-2025-101",
    "subPoDate": "2025-11-10",
    "subPoQty": 5000,
    "subPoQtyUnit": "Kg",
    "rateOfMaterial": 85.50,
    "rateOfGst": 18,
    "subPoTotalValue": 504450.00,
    "declaredQuantity": 5000,
    "qtyLeftForInspection": 2000,
    "unitOfMeasurement": "Kg",
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

---

## 5. Calculate ERC Quantity

### Endpoint
```
POST /api/vendor/inspection-calls/calculate-erc
```

### Request Body
```json
{
  "totalQtyMt": 5.500,
  "productType": "ERC MK-III"
}
```

### Success Response (200 OK)
```json
{
  "success": true,
  "data": {
    "totalQtyMt": 5.500,
    "productType": "ERC MK-III",
    "conversionFactor": 1.150,
    "approxErcCount": 4786,
    "calculation": "5.500 / 1.150 * 1000 = 4782.61 ≈ 4786",
    "formula": "Total MT / Conversion Factor * 1000"
  }
}
```

---

## Common Error Responses

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Authentication required",
  "error": {
    "code": "UNAUTHORIZED",
    "details": "Invalid or expired token"
  }
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Access denied",
  "error": {
    "code": "FORBIDDEN",
    "details": "You do not have permission to access this resource"
  }
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error",
  "error": {
    "code": "INTERNAL_ERROR",
    "details": "An unexpected error occurred. Please try again later.",
    "requestId": "req_12345_67890"
  }
}
```

---

## Notes

### Date Format
- All dates in request/response use ISO 8601 format: `YYYY-MM-DD` or `YYYY-MM-DDTHH:mm:ssZ`

### Number Precision
- Quantities in MT: 3 decimal places (e.g., 1.500)
- Chemical analysis: 3 decimal places (e.g., 0.025)
- Monetary values: 2 decimal places (e.g., 504450.00)

### Status Values
- **Pending**: Inspection call created, awaiting scheduling
- **Scheduled**: Inspection date confirmed
- **Under Inspection**: Inspector is currently inspecting
- **Completed**: Inspection finished, results available
- **Rejected**: Inspection call rejected

### Authentication
All endpoints require Bearer token authentication:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
