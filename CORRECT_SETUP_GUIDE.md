# ✅ CORRECT Setup Guide - Use This!

## 🎯 Important: Use the Correct Database File!

**Use this file:** `RITES-ERC-main\database\rites_erc_inspection_dump.sql`

**Database name:** `rites_erc_inspection` (NOT `sarthidb`)

---

## 📋 Step-by-Step Setup

### STEP 1: Import the CORRECT Database File

1. **Open MySQL Workbench**
2. **Connect to localhost:3306**
   - Username: `root`
   - Password: `root` (or your MySQL password)

3. **Import the database:**
   - Click **File → Open SQL Script**
   - Navigate to: `RITES-ERC-main\database`
   - Select: **`rites_erc_inspection_dump.sql`**
   - Click **Open**
   - Click **⚡ Execute** (lightning icon)

4. **Wait for completion** (creates all tables)

5. **Verify:**
   ```sql
   USE rites_erc_inspection;
   SHOW TABLES;
   ```

   You should see these tables:
   - `inspection_calls`
   - `ic_number_sequences`
   - `rm_inspection_details`
   - `rm_heat_quantities`
   - `rm_chemical_analysis`
   - `process_inspection_details`
   - `process_rm_ic_mapping`
   - `final_inspection_details`
   - `final_inspection_lot_details`

6. **Check sequences:**
   ```sql
   SELECT * FROM ic_number_sequences;
   ```

   Should show 3 rows (Raw Material, Process, Final)

---

### STEP 2: Verify Spring Boot Configuration

**File:** `RITES-SARTHI-BACKEND-main\src\main\resources\application.properties`

**Should have:**
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/rites_erc_inspection?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
spring.datasource.username=root
spring.datasource.password=root
```

✅ **Already updated!**

---

### STEP 3: Start Spring Boot

```powershell
# Stop any Node.js server
taskkill /IM node.exe /F

# Navigate to Spring Boot folder
cd "RITES-SARTHI-BACKEND-main\RITES-SARTHI-BACKEND-main"

# Start Spring Boot
mvn spring-boot:run
```

**Wait for:** "Started SarthiBackendApplication"

---

### STEP 4: Test Backend

Open browser: http://localhost:8080/actuator/health

Should show: `{"status":"UP"}`

---

### STEP 5: Start React

Open a **NEW terminal**:

```powershell
cd RITES-ERC-main
npm start
```

Opens at: http://localhost:3000

---

### STEP 6: Test the System

1. Go to **Vendor Dashboard**
2. Click **Raise Inspection Call**
3. Select **Raw Material**
4. Fill in the form:
   - PO Number: `PO-2025-1001`
   - PO Serial No: `PO-2025-1001/01`
   - PO Date: Select a date
   - Item Description: `ERC MK-III Clips`
   - Quantity: `5000`
   - And other required fields...

5. Click **Submit**

**Expected:** IC Number generated like `RM-IC-2025-0001`

---

## 🔍 Verify in Database

After creating an inspection call, check in MySQL Workbench:

```sql
USE rites_erc_inspection;

-- Check inspection call created
SELECT * FROM inspection_calls ORDER BY id DESC LIMIT 1;

-- Check IC sequence updated
SELECT * FROM ic_number_sequences WHERE type_of_call = 'Raw Material';

-- Check RM details created
SELECT * FROM rm_inspection_details ORDER BY id DESC LIMIT 1;
```

---

## ✅ What's Fixed

| Issue | Status |
|-------|--------|
| Database name | ✅ Changed to `rites_erc_inspection` |
| Database file | ✅ Using correct dump file |
| Spring Boot config | ✅ Updated |
| Entity fields | ✅ All fields added |
| React API URL | ✅ Correct |

---

## 🎯 Summary

**Correct Database File:**
```
RITES-ERC-main\database\rites_erc_inspection_dump.sql
```

**Database Name:**
```
rites_erc_inspection
```

**Spring Boot Config:**
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/rites_erc_inspection
```

---

## 🚀 Quick Commands

### Import Database
```sql
-- In MySQL Workbench, open and execute:
RITES-ERC-main\database\rites_erc_inspection_dump.sql
```

### Start Spring Boot
```powershell
cd RITES-SARTHI-BACKEND-main\RITES-SARTHI-BACKEND-main
mvn spring-boot:run
```

### Start React
```powershell
cd RITES-ERC-main
npm start
```

---

**Now try again! Everything should work! 🎉**

