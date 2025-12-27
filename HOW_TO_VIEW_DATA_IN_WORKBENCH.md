# 📊 How to View Data in MySQL Workbench

## 🔍 Quick View - Latest Inspection Calls

### **1. View All Inspection Calls**
```sql
USE rites_erc_inspection;

SELECT 
    ic_number,
    po_no,
    type_of_call,
    status,
    desired_inspection_date,
    company_name,
    unit_name,
    created_at
FROM inspection_calls
ORDER BY created_at DESC
LIMIT 10;
```

---

### **2. View Latest RM Inspection Call with All Details**
```sql
SELECT 
    ic.ic_number,
    ic.po_no,
    ic.status,
    ic.company_name,
    ic.unit_name,
    rm.item_description,
    rm.heat_numbers,
    rm.tc_number,
    rm.total_offered_qty_mt,
    rm.offered_qty_erc,
    rm.created_at
FROM inspection_calls ic
LEFT JOIN rm_inspection_details rm ON ic.id = rm.ic_id
WHERE ic.type_of_call = 'Raw Material'
ORDER BY ic.created_at DESC
LIMIT 5;
```

---

### **3. View Heat Quantities for Latest RM IC**
```sql
SELECT 
    ic.ic_number,
    hq.heat_number,
    hq.manufacturer,
    hq.offered_qty,
    hq.tc_number,
    hq.tc_date
FROM inspection_calls ic
JOIN rm_inspection_details rm ON ic.id = rm.ic_id
JOIN rm_heat_quantities hq ON rm.id = hq.rm_detail_id
WHERE ic.type_of_call = 'Raw Material'
ORDER BY ic.created_at DESC, hq.heat_number
LIMIT 10;
```

---

### **4. View Chemical Analysis Data**
```sql
SELECT 
    ic.ic_number,
    ca.heat_number,
    ca.carbon,
    ca.manganese,
    ca.silicon,
    ca.sulphur,
    ca.phosphorus,
    ca.chromium
FROM inspection_calls ic
JOIN rm_inspection_details rm ON ic.id = rm.ic_id
JOIN rm_chemical_analysis ca ON rm.id = ca.rm_detail_id
WHERE ic.type_of_call = 'Raw Material'
ORDER BY ic.created_at DESC
LIMIT 5;
```

---

### **5. Complete View - Everything for One IC**
```sql
-- Replace 'RM-IC-2025-0001' with your actual IC number
SET @ic_num = 'RM-IC-2025-0001';

-- Main IC Info
SELECT 'INSPECTION CALL INFO' as section, ic.*
FROM inspection_calls ic
WHERE ic.ic_number = @ic_num

UNION ALL

-- RM Details
SELECT 'RM DETAILS' as section, rm.*
FROM inspection_calls ic
JOIN rm_inspection_details rm ON ic.id = rm.ic_id
WHERE ic.ic_number = @ic_num

UNION ALL

-- Heat Quantities
SELECT 'HEAT QUANTITIES' as section, hq.*
FROM inspection_calls ic
JOIN rm_inspection_details rm ON ic.id = rm.ic_id
JOIN rm_heat_quantities hq ON rm.id = hq.rm_detail_id
WHERE ic.ic_number = @ic_num

UNION ALL

-- Chemical Analysis
SELECT 'CHEMICAL ANALYSIS' as section, ca.*
FROM inspection_calls ic
JOIN rm_inspection_details rm ON ic.id = rm.ic_id
JOIN rm_chemical_analysis ca ON rm.id = ca.rm_detail_id
WHERE ic.ic_number = @ic_num;
```

---

## 📋 Step-by-Step Guide

### **Step 1: Open MySQL Workbench**
1. Launch MySQL Workbench
2. Connect to your local MySQL server
3. Click on "rites_erc_inspection" database in the left panel

### **Step 2: Open SQL Editor**
1. Click on the SQL editor icon (or press Ctrl+T)
2. Copy one of the queries above
3. Paste into the editor

### **Step 3: Execute Query**
1. Click the lightning bolt icon (⚡) or press Ctrl+Enter
2. View results in the "Result Grid" below

### **Step 4: Export Results (Optional)**
1. Right-click on the result grid
2. Select "Export Recordset to External File"
3. Choose format (CSV, JSON, etc.)

---

## 🔍 Troubleshooting Queries

### **Check if Database Exists**
```sql
SHOW DATABASES LIKE 'rites_erc_inspection';
```

### **Check if Tables Exist**
```sql
USE rites_erc_inspection;
SHOW TABLES;
```

### **Check Table Structure**
```sql
DESCRIBE inspection_calls;
DESCRIBE rm_inspection_details;
DESCRIBE rm_heat_quantities;
DESCRIBE rm_chemical_analysis;
```

### **Count Records in Each Table**
```sql
SELECT 
    'inspection_calls' as table_name, 
    COUNT(*) as record_count 
FROM inspection_calls

UNION ALL

SELECT 
    'rm_inspection_details' as table_name, 
    COUNT(*) as record_count 
FROM rm_inspection_details

UNION ALL

SELECT 
    'rm_heat_quantities' as table_name, 
    COUNT(*) as record_count 
FROM rm_heat_quantities

UNION ALL

SELECT 
    'rm_chemical_analysis' as table_name, 
    COUNT(*) as record_count 
FROM rm_chemical_analysis;
```

---

## 🎯 Quick Reference

| What You Want to See | Query Number |
|---------------------|--------------|
| List of all ICs | Query #1 |
| RM IC details | Query #2 |
| Heat numbers | Query #3 |
| Chemical data | Query #4 |
| Everything for one IC | Query #5 |

---

## 💡 Tips

1. **Always use `ORDER BY created_at DESC`** to see latest records first
2. **Use `LIMIT 10`** to avoid overwhelming results
3. **Replace IC numbers** in queries with your actual IC numbers
4. **Use `WHERE` clause** to filter by status, date, etc.

---

## 🚀 After Submitting Form

After you submit an RM inspection call in the React app:

1. **Check Server Terminal** for the IC number:
   ```
   🔢 Generated IC Number: RM-IC-2025-0003
   ```

2. **Run this query** in MySQL Workbench:
   ```sql
   SELECT * FROM inspection_calls 
   WHERE ic_number = 'RM-IC-2025-0003';
   ```

3. **Verify all data** is saved correctly

---

## ✅ Success Indicators

**If data is saved correctly, you should see:**
- ✅ 1 row in `inspection_calls`
- ✅ 1 row in `rm_inspection_details`
- ✅ N rows in `rm_heat_quantities` (N = number of heat numbers)
- ✅ N rows in `rm_chemical_analysis` (if chemical data provided)

**Example:**
```
inspection_calls: 1 row (IC-2025-0003)
rm_inspection_details: 1 row
rm_heat_quantities: 2 rows (2 heat numbers)
rm_chemical_analysis: 2 rows (chemical data for 2 heats)
```

---

**Happy querying!** 🎉

