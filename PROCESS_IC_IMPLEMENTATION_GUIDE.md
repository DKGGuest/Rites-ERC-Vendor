# 🔄 Process Inspection Call - Implementation Guide

## 📋 Overview

This guide explains how to set up and test the Process Inspection Call feature with mock approved RM data.

---

## 🎯 What's New

### **1. Multiple Lot & Heat Entry**
- ✅ Users can now add multiple lot numbers and heat numbers in a single Process IC
- ✅ Each lot-heat combination has its own offered quantity
- ✅ Dynamic add/remove buttons for lot-heat entries

### **2. Auto-Population from Approved RM ICs**
- ✅ Dropdown shows only **Approved** RM ICs for the selected PO
- ✅ Heat numbers are fetched from selected RM ICs
- ✅ Only heats with `qty_accepted > 0` are shown
- ✅ Company, Unit details auto-populated from RM IC

### **3. Mock Approved RM Data**
- ✅ 2 sample approved RM ICs added to database
- ✅ Multiple heat numbers with accepted quantities
- ✅ Ready to use for Process IC testing

---

## 🚀 Setup Instructions

### **Step 1: Add Mock Approved RM Data**

Run this SQL script in MySQL Workbench:

```sql
-- File: add_mock_approved_rm_data.sql
```

**What this does:**
- Creates 2 approved RM inspection calls
- RM-IC-2025-0001: 2 heats (BN-2025-045, BN-2025-046)
- RM-IC-2025-0002: 1 heat (BN-2025-047)
- All with accepted quantities

**To run:**
1. Open MySQL Workbench
2. Connect to your database
3. Open `add_mock_approved_rm_data.sql`
4. Click Execute (⚡)

**Verify:**
```sql
SELECT 
    ic.ic_number,
    ic.status,
    rm.heat_numbers,
    SUM(hq.qty_accepted) as total_accepted
FROM inspection_calls ic
LEFT JOIN rm_inspection_details rm ON ic.id = rm.ic_id
LEFT JOIN rm_heat_quantities hq ON rm.id = hq.rm_detail_id
WHERE ic.type_of_call = 'Raw Material' AND ic.status = 'Approved'
GROUP BY ic.id;
```

Expected output:
```
ic_number         | status   | heat_numbers           | total_accepted
RM-IC-2025-0001  | Approved | BN-2025-045, BN-2025-046 | 193.000
RM-IC-2025-0002  | Approved | BN-2025-047             | 145.000
```

---

### **Step 2: Restart API Server**

```bash
cd server
# Press Ctrl+C to stop
npm start
```

---

### **Step 3: Test Process IC Form**

1. **Open React App**: `http://localhost:3000`
2. **Login as Vendor**
3. **Go to Raise Inspection Call**
4. **Select:**
   - PO Number: `PO-2025-1001`
   - PO Serial: `PO-2025-1001/01`
   - Type of Call: `Process`

5. **Fill Process IC Form:**
   - **RM IC Numbers**: Select `RM-IC-2025-0001` (dropdown)
   - **Click "Add Lot & Heat"** to add entries
   - **For each entry:**
     - Lot No: `LOT-2025-001`
     - Manufacturer-Heat: Select from dropdown (e.g., `ABC Suppliers Pvt Ltd - BN-2025-045`)
     - Offered Qty: `50000` (ERCs)

6. **Submit Form**

---

## 📊 Database Schema

### **Process Inspection Tables**

#### **1. process_inspection_details**
```sql
CREATE TABLE process_inspection_details (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  ic_id BIGINT NOT NULL UNIQUE,
  rm_ic_id BIGINT NOT NULL,
  rm_ic_number VARCHAR(50) NOT NULL,
  lot_number VARCHAR(100) NOT NULL,
  heat_number VARCHAR(50) NOT NULL,
  manufacturer VARCHAR(255) NULL,
  manufacturer_heat VARCHAR(255) NOT NULL,
  offered_qty INT NOT NULL,
  total_accepted_qty_rm INT NOT NULL DEFAULT 0,
  qty_accepted INT NULL,
  qty_rejected INT NULL,
  company_id INT NOT NULL,
  company_name VARCHAR(255) NOT NULL,
  unit_id INT NOT NULL,
  unit_name VARCHAR(255) NOT NULL,
  unit_address TEXT NULL,
  FOREIGN KEY (ic_id) REFERENCES inspection_calls(id),
  FOREIGN KEY (rm_ic_id) REFERENCES inspection_calls(id)
);
```

#### **2. process_rm_ic_mapping**
```sql
CREATE TABLE process_rm_ic_mapping (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  process_ic_id BIGINT NOT NULL,
  rm_ic_id BIGINT NOT NULL,
  rm_ic_number VARCHAR(50) NOT NULL,
  heat_number VARCHAR(50) NOT NULL,
  manufacturer VARCHAR(255) NULL,
  book_set_no VARCHAR(50) NULL,
  rm_qty_accepted INT NOT NULL,
  FOREIGN KEY (process_ic_id) REFERENCES inspection_calls(id),
  FOREIGN KEY (rm_ic_id) REFERENCES inspection_calls(id)
);
```

---

## 🔌 API Endpoints

### **1. Get Approved RM ICs**
```
GET /api/inspection-calls/raw-material/approved?po_no=PO-2025-1001&po_serial_no=PO-2025-1001/01
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "ic_number": "RM-IC-2025-0001",
      "po_no": "PO-2025-1001",
      "status": "Approved",
      "heat_numbers": "BN-2025-045, BN-2025-046",
      "company_name": "ABC Industries Pvt Ltd",
      "unit_name": "Unit 2 - Pune"
    }
  ],
  "count": 1
}
```

### **2. Get Heat Numbers from RM IC**
```
GET /api/inspection-calls/heat-numbers/RM-IC-2025-0001
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "heat_number": "BN-2025-045",
      "manufacturer": "ABC Suppliers Pvt Ltd",
      "offered_qty": 100.000,
      "qty_accepted": 95.000,
      "tc_number": "TC-45680"
    },
    {
      "heat_number": "BN-2025-046",
      "manufacturer": "ABC Suppliers Pvt Ltd",
      "offered_qty": 100.000,
      "qty_accepted": 98.000,
      "tc_number": "TC-45681"
    }
  ],
  "count": 2
}
```

### **3. Create Process IC**
```
POST /api/inspection-calls/process
```

**Request Body:**
```json
{
  "po_no": "PO-2025-1001",
  "po_serial_no": "PO-2025-1001/01",
  "type_of_call": "Process",
  "desired_inspection_date": "2025-12-25",
  "process_rm_ic_numbers": ["RM-IC-2025-0001"],
  "process_lot_heat_mapping": [
    {
      "lotNumber": "LOT-2025-001",
      "manufacturerHeat": "ABC Suppliers Pvt Ltd - BN-2025-045",
      "heatNumber": "BN-2025-045",
      "manufacturer": "ABC Suppliers Pvt Ltd",
      "offeredQty": "50000"
    }
  ],
  "company_id": 1,
  "company_name": "ABC Industries Pvt Ltd",
  "unit_id": 102,
  "unit_name": "Unit 2 - Pune",
  "unit_address": "Plot 5, Chakan MIDC, Pune - 410501"
}
```

---

## ✅ Testing Checklist

- [ ] Mock approved RM data added to database
- [ ] API server restarted
- [ ] Process IC form shows approved RM ICs in dropdown
- [ ] Heat numbers dropdown populated from selected RM IC
- [ ] Can add multiple lot-heat entries
- [ ] Can remove lot-heat entries
- [ ] Company/Unit details auto-populated
- [ ] Form validation works
- [ ] Process IC created successfully
- [ ] Data saved to database correctly

---

## 🎉 Expected Flow

1. **Vendor raises RM IC** → Status: Pending
2. **Inspection Engineer approves RM IC** → Status: Approved
3. **Vendor raises Process IC**:
   - Selects approved RM IC from dropdown
   - Adds lot numbers and heat numbers
   - Heat numbers come from approved RM IC
4. **Process IC created** → Status: Pending
5. **Inspection Engineer approves Process IC** → Status: Approved
6. **Vendor can raise Final IC** using approved Process IC

---

## 📝 Notes

- Only **Approved** RM ICs are shown in Process IC dropdown
- Only heats with **qty_accepted > 0** are available
- Multiple lots can be added for same Process IC
- Process IC number auto-generated: `PROC-IC-2025-0001`
- All lot-heat combinations saved to database

---

**Ready to test!** 🚀

