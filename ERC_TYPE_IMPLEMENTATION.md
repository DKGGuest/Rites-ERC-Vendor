# ERC Type Field Implementation

## 📋 Overview
This document describes the implementation of the `erc_type` field in the Raise Inspection Call form, allowing vendors to select the type of ERC (MK-III, MK-V, or J-Type) and save it to the database.

---

## ✅ Changes Made

### 1. **Frontend - Form Component** (`src/components/RaiseInspectionCallForm.js`)

#### Added ERC Type Dropdown Options (Line 194-199):
```javascript
const ERC_TYPES = [
  { value: '', label: 'Select Type of ERC' },
  { value: 'MK-III', label: 'MK-III' },
  { value: 'MK-V', label: 'MK-V' },
  { value: 'J-Type', label: 'J-Type' }
];
```

#### Updated Form State (Line 241):
```javascript
type_of_erc: '',
```

#### Updated Form Submission (Line 1070):
```javascript
let filteredData = {
  // Common fields for all inspection types
  po_no: formData.po_no,
  po_serial_no: formData.po_serial_no,
  // ... other fields
  type_of_call: formData.type_of_call,
  type_of_erc: formData.type_of_erc,  // ✅ ADDED
  desired_inspection_date: formData.desired_inspection_date,
  // ... rest of fields
};
```

#### Form Field UI (Line 1185-1196):
```javascript
<FormField label="Type of ERC" name="type_of_erc" required hint="Select ERC type" errors={errors}>
  <select
    name="type_of_erc"
    className="ric-form-select"
    value={formData.type_of_erc}
    onChange={handleChange}
  >
    {ERC_TYPES.map(opt => (
      <option key={opt.value} value={opt.value}>{opt.label}</option>
    ))}
  </select>
</FormField>
```

---

### 2. **Frontend - Service Layer** (`src/services/inspectionCallService.js`)

#### Updated API Request Payload (Line 42):
```javascript
const transformedData = {
  inspectionCall: {
    icNumber: icNumber,
    poNo: rmInspectionData.po_no,
    poSerialNo: rmInspectionData.po_serial_no,
    typeOfCall: rmInspectionData.type_of_call,
    ercType: rmInspectionData.type_of_erc || '',  // ✅ ADDED
    status: 'PENDING',
    desiredInspectionDate: rmInspectionData.desired_inspection_date,
    // ... rest of fields
  },
  // ... rest of payload
};
```

---

### 3. **Backend - Entity Layer** (`src/main/java/com/sarthi/entity/rawmaterial/InspectionCall.java`)

#### Added Field to Entity (Line 33):
```java
private String typeOfCall;

private String ercType;  // ✅ ADDED

private String status;
```

---

### 4. **Backend - DTO Layer**

#### Updated InspectionCallDto (`src/main/java/com/sarthi/dto/rawmaterial/InspectionCallDto.java`, Line 28):
```java
private String icNumber;
private String poNo;
private String poSerialNo;
private String typeOfCall;
private String ercType;  // ✅ ADDED
private String status;
```

#### Updated InspectionCallRequestDto (`src/main/java/com/sarthi/dto/IcDtos/InspectionCallRequestDto.java`, Line 12):
```java
private String icNumber;
private String poNo;
private String poSerialNo;
private String typeOfCall;
private String ercType;  // ✅ ADDED
private String status;
```

---

### 5. **Backend - Service Layer** (`src/main/java/com/sarthi/service/Impl/InspectionCallServiceImpl.java`)

#### Updated Service Implementation (Line 42):
```java
inspectionCall.setIcNumber(icRequest.getIcNumber());
inspectionCall.setPoNo(icRequest.getPoNo());
inspectionCall.setPoSerialNo(icRequest.getPoSerialNo());
inspectionCall.setTypeOfCall(icRequest.getTypeOfCall());
inspectionCall.setErcType(icRequest.getErcType());  // ✅ ADDED
inspectionCall.setStatus(icRequest.getStatus());
inspectionCall.setVendorId(icRequest.getVendorId());
```

---

## 🗄️ Database Schema

The `erc_type` field already exists in the database:

**Table**: `inspection_calls`
**Column**: `erc_type VARCHAR(20)`

No database migration is required.

---

## 🔄 Data Flow

1. **User selects ERC type** from dropdown (MK-III, MK-V, or J-Type)
2. **Form captures** the value in `formData.type_of_erc`
3. **Form submission** includes `type_of_erc` in the filtered data
4. **Frontend service** transforms it to `ercType` for backend API
5. **Backend DTO** receives `ercType` in `InspectionCallRequestDto`
6. **Backend service** maps it to the entity field
7. **Database** stores the value in `inspection_calls.erc_type` column

---

## ✅ Testing Checklist

- [ ] Dropdown displays all three ERC types (MK-III, MK-V, J-Type)
- [ ] Form validation requires ERC type selection
- [ ] Selected value is included in form submission
- [ ] Backend API receives the ercType field
- [ ] Database stores the value correctly
- [ ] Value persists after page refresh

---

## 📝 Example Usage

**Frontend Form Data:**
```javascript
{
  type_of_call: "Raw Material",
  type_of_erc: "MK-III",
  desired_inspection_date: "2025-01-15",
  // ... other fields
}
```

**Backend API Request:**
```json
{
  "inspectionCall": {
    "typeOfCall": "Raw Material",
    "ercType": "MK-III",
    "desiredInspectionDate": "2025-01-15"
  }
}
```

**Database Record:**
```sql
INSERT INTO inspection_calls (type_of_call, erc_type, ...) 
VALUES ('Raw Material', 'MK-III', ...);
```

---

## 🎯 Summary

All necessary changes have been implemented to support the ERC type field:
- ✅ Frontend form includes dropdown
- ✅ Frontend service sends the data
- ✅ Backend DTOs accept the field
- ✅ Backend entity maps to database
- ✅ Backend service processes the field
- ✅ Database column already exists

The feature is now **fully functional** and ready for testing!

