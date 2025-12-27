# 🔄 Complete Inspection Workflow Guide

## 📋 Overview

This guide explains the complete 3-stage inspection workflow for RITES ERC:

```
Raw Material IC → Process IC → Final IC → Completed
```

---

## 🎯 Workflow Stages

### **Stage 1: Raw Material (RM) Inspection Call**
- **Purpose**: Inspect raw materials (Spring Steel Round Bars, etc.)
- **IC Number Format**: `RM-IC-YYYY-XXXX` (e.g., RM-IC-2025-0001)
- **Required**: Before any processing can begin
- **Approval**: By Inspection Engineer

### **Stage 2: Process Inspection Call**
- **Purpose**: Inspect processed items (clips, fasteners, etc.)
- **IC Number Format**: `PROC-IC-YYYY-XXXX` (e.g., PROC-IC-2025-0001)
- **Required**: At least one approved RM IC
- **Links To**: RM IC numbers (can select multiple)
- **Approval**: By Inspection Engineer

### **Stage 3: Final Inspection Call**
- **Purpose**: Final inspection before delivery
- **IC Number Format**: `FINAL-IC-YYYY-XXXX` (e.g., FINAL-IC-2025-0001)
- **Required**: At least one approved Process IC
- **Links To**: Both RM IC and Process IC numbers
- **Approval**: By Inspection Engineer
- **Result**: Marked as "Completed" in vendor dashboard

---

## 🚀 Setup Instructions

### **Step 1: Import Mock Data**

To test the complete workflow, you need sample approved inspection calls.

**In MySQL Workbench:**

1. Open `database/mock_data_for_testing.sql`
2. Execute the script
3. This creates:
   - ✅ 2 Approved RM Inspection Calls
   - ✅ 2 Approved Process Inspection Calls
   - ✅ 1 Completed Final Inspection Call

**Verification:**
```sql
-- Check all inspection calls
SELECT ic_number, type_of_call, status, po_no 
FROM inspection_calls 
ORDER BY created_at;
```

**Expected Result:**
```
RM-IC-2025-0001      | Raw Material | Approved | PO-2025-1001/01
RM-IC-2025-0002      | Raw Material | Approved | PO-2025-1001/01
PROC-IC-2025-0001    | Process      | Approved | PO-2025-1001/01
PROC-IC-2025-0002    | Process      | Approved | PO-2025-1001/01
FINAL-IC-2025-0001   | Final        | Approved | PO-2025-1001/01
```

---

### **Step 2: Start Both Servers**

**Terminal 1: API Server**
```bash
cd server
npm start
```

**Terminal 2: React App**
```bash
npm start
```

---

## 📝 Testing the Complete Workflow

### **Test 1: Create Raw Material Inspection Call**

1. **Login** as vendor
2. **Go to**: "Raise Inspection Call" tab
3. **Click**: "Raise Inspection Call" on any PO item
4. **Fill Form**:
   - Type of Call: **Raw Material**
   - Desired Inspection Date: Select date
   - Unit Name: Select from dropdown
   - Raw Material Name: Select material
   - Offered Quantity (MT): Enter quantity (e.g., 20.5)
   - **Add Heat Quantities**:
     - Manufacturer: JSPL
     - Heat Number: HT-2025-005
     - Quantity: 10.5 MT
     - Click "Add Heat Quantity"
     - Add more if needed
5. **Submit**

**Expected Result:**
```
✅ Raw Material Inspection Request saved successfully!

IC Number: RM-IC-2025-0003
Item: ERC MK-III Clips - Type A

Data has been saved to the database.
```

**Verify in MySQL:**
```sql
SELECT * FROM inspection_calls WHERE ic_number = 'RM-IC-2025-0003';
SELECT * FROM rm_inspection_details WHERE ic_number = 'RM-IC-2025-0003';
SELECT * FROM rm_heat_quantities WHERE ic_number = 'RM-IC-2025-0003';
```

---

### **Test 2: Create Process Inspection Call**

**Prerequisites**: At least one approved RM IC exists (use mock data)

1. **Go to**: "Raise Inspection Call" tab
2. **Click**: "Raise Inspection Call" on same PO item
3. **Fill Form**:
   - Type of Call: **Process**
   - Desired Inspection Date: Select date
   - **RM IC Number**: Select from dropdown (shows approved RM ICs)
     - Options: RM-IC-2025-0001, RM-IC-2025-0002
   - **Lot Number**: Enter lot number (e.g., LOT-2025-003)
   - **Heat Number**: Select from dropdown (auto-fetched from selected RM IC)
     - Shows: JSPL - HT-2025-001, JSPL - HT-2025-002
   - **Offered Quantity**: Enter quantity (e.g., 5000)
   - **Place of Inspection**: Auto-filled from RM IC
4. **Submit**

**Expected Result:**
```
✅ Process Inspection Request saved successfully!

IC Number: PROC-IC-2025-0003
Item: ERC MK-III Clips - Type A

Data has been saved to the database.
```

**Verify in MySQL:**
```sql
SELECT * FROM inspection_calls WHERE ic_number = 'PROC-IC-2025-0003';
SELECT * FROM process_inspection_details WHERE ic_number = 'PROC-IC-2025-0003';
SELECT * FROM process_rm_ic_mapping WHERE process_ic_number = 'PROC-IC-2025-0003';
```

---

### **Test 3: Create Final Inspection Call**

**Prerequisites**: At least one approved Process IC exists (use mock data)

1. **Go to**: "Raise Inspection Call" tab
2. **Click**: "Raise Inspection Call" on same PO item
3. **Fill Form**:
   - Type of Call: **Final**
   - Desired Inspection Date: Select date
   - **RM IC Numbers**: Select from dropdown (can select multiple)
     - Options: RM-IC-2025-0001, RM-IC-2025-0002
   - **Process IC Numbers**: Select from dropdown (can select multiple)
     - Options: PROC-IC-2025-0001, PROC-IC-2025-0002
   - **Lot Numbers**: Auto-fetched from selected Process ICs
   - **For Each Lot**:
     - Lot Number: LOT-2025-001 (auto-filled)
     - Manufacturer - Heat: JSPL - HT-2025-001 (auto-filled)
     - Offered Qty (ERC): Enter quantity (e.g., 5000)
     - Click "Add Lot" for more lots
   - **Total ERC Quantity**: Auto-calculated
   - **HDPE Bags**: Enter number (e.g., 50)
   - **Place of Inspection**: Auto-filled from Process IC
4. **Submit**

**Expected Result:**
```
✅ Final Inspection Request saved successfully!

IC Number: FINAL-IC-2025-0002
Item: ERC MK-III Clips - Type A

Data has been saved to the database.
```

**Verify in MySQL:**
```sql
SELECT * FROM inspection_calls WHERE ic_number = 'FINAL-IC-2025-0002';
SELECT * FROM final_inspection_details WHERE ic_number = 'FINAL-IC-2025-0002';
SELECT * FROM final_inspection_lot_details WHERE ic_number = 'FINAL-IC-2025-0002';
SELECT * FROM final_process_ic_mapping WHERE final_ic_number = 'FINAL-IC-2025-0002';
```

---

## 🔗 Data Flow & Relationships

### **Raw Material IC**
```
inspection_calls (ic_number: RM-IC-2025-0001)
    ↓
rm_inspection_details (raw material info)
    ↓
rm_heat_quantities (heat numbers and quantities)
```

### **Process IC**
```
inspection_calls (ic_number: PROC-IC-2025-0001)
    ↓
process_inspection_details (lot number, quantity)
    ↓
process_rm_ic_mapping (links to RM-IC-2025-0001)
```

### **Final IC**
```
inspection_calls (ic_number: FINAL-IC-2025-0001)
    ↓
final_inspection_details (total qty, HDPE bags)
    ↓
final_inspection_lot_details (lot-wise details)
    ↓
final_process_ic_mapping (links to PROC-IC-2025-0001, PROC-IC-2025-0002)
```

---

## 📊 Database Tables Summary

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `inspection_calls` | Main table for all ICs | ic_number, type_of_call, status, po_no |
| `ic_number_sequences` | Auto-generate IC numbers | prefix, current_year, current_sequence |
| `rm_inspection_details` | RM-specific data | raw_material_name, rm_offered_qty_mt |
| `rm_heat_quantities` | Heat numbers for RM | manufacturer_name, heat_number, quantity_mt |
| `process_inspection_details` | Process-specific data | process_lot_number, process_offered_qty |
| `process_rm_ic_mapping` | Link Process to RM ICs | process_ic_number, rm_ic_number |
| `final_inspection_details` | Final-specific data | final_total_erc_qty, final_hdpe_bags |
| `final_inspection_lot_details` | Lot-wise final data | lot_number, manufacturer_heat, offered_qty_erc |
| `final_process_ic_mapping` | Link Final to Process ICs | final_ic_number, process_ic_number |

---

## ✅ Success Checklist

- [ ] MySQL database imported with all 10 tables
- [ ] Mock data imported (2 RM, 2 Process, 1 Final IC)
- [ ] API server running on port 8080
- [ ] React app running on port 3000
- [ ] Can create Raw Material IC
- [ ] Can create Process IC (with approved RM IC)
- [ ] Can create Final IC (with approved Process IC)
- [ ] Data visible in MySQL Workbench
- [ ] IC numbers auto-generated correctly

---

## 🌐 Migration to Azure

When ready to deploy:

### **1. Export Data from Local MySQL**
```bash
mysqldump -u root -p rites_erc_inspection > backup.sql
```

### **2. Import to Azure MySQL**
```bash
mysql -h your-server.mysql.database.azure.com -u your-username@your-server -p rites_erc_inspection < backup.sql
```

### **3. Update Server Configuration**
Update `server/.env`:
```env
DB_HOST=your-server.mysql.database.azure.com
DB_USER=your-username@your-server
DB_PASSWORD=your-azure-password
DB_NAME=rites_erc_inspection
```

### **4. Update React Configuration**
Update `.env`:
```env
REACT_APP_API_BASE_URL=https://your-api.azurewebsites.net/api
```

---

## 🎉 Summary

**Complete Workflow:**
1. ✅ Vendor raises **Raw Material IC** → Saved to database
2. ✅ Inspection Engineer approves RM IC → Status = 'Approved'
3. ✅ Vendor raises **Process IC** (selects approved RM IC) → Saved to database
4. ✅ Inspection Engineer approves Process IC → Status = 'Approved'
5. ✅ Vendor raises **Final IC** (selects approved Process IC) → Saved to database
6. ✅ Inspection Engineer approves Final IC → Status = 'Approved'
7. ✅ Displayed as **Completed** in vendor dashboard

**All data is saved in MySQL and ready for Azure migration!** 🚀

