# MySQL Workbench Execution Guide
## Manual Inventory Entry Insertion with EXHAUSTED Status

---

## 📋 Prerequisites

Before starting, ensure you have:
- ✅ MySQL Workbench installed and running
- ✅ MySQL Server running (check with `services.msc` on Windows)
- ✅ Access credentials for the `rites_erc_inspection` database
- ✅ The file `MANUAL_INVENTORY_INSERT.sql` ready

---

## 🚀 Step-by-Step Execution Instructions

### Step 1: Open MySQL Workbench

1. Launch **MySQL Workbench** from your Start menu or desktop
2. You should see the MySQL Workbench home screen

### Step 2: Connect to Database

1. Click on your local MySQL connection (usually named "Local instance MySQL80" or similar)
2. Enter your MySQL root password when prompted
3. Click **OK** to connect

**Expected Result:** You should see the MySQL Workbench SQL Editor interface

### Step 3: Open the SQL Script

**Option A: Open from File**
1. Click **File** → **Open SQL Script** (or press `Ctrl+Shift+O`)
2. Navigate to: `d:\vendor\Rites-ERC-Vendor\MANUAL_INVENTORY_INSERT.sql`
3. Click **Open**

**Option B: Copy and Paste**
1. Open `MANUAL_INVENTORY_INSERT.sql` in a text editor
2. Copy all contents (`Ctrl+A`, then `Ctrl+C`)
3. Paste into a new SQL tab in MySQL Workbench (`Ctrl+V`)

**Expected Result:** You should see the SQL script in the editor window

### Step 4: Execute the Script Step-by-Step

**IMPORTANT:** Execute the script in sections, not all at once. This allows you to verify each step.

#### 4.1: Select Database
```sql
USE rites_erc_inspection;
```
- **How to execute:** Highlight this line and click the ⚡ (lightning bolt) icon or press `Ctrl+Shift+Enter`
- **Expected Output:** `1 row(s) affected` in the Action Output panel

#### 4.2: Verify Table Structure
```sql
DESCRIBE inventory_entries;
```
- **How to execute:** Highlight this line and click ⚡
- **Expected Output:** A table showing all columns and their data types
- **Look for:** The `status` column should show type `enum('FRESH_PO','UNDER_INSPECTION','ACCEPTED','REJECTED')`

#### 4.3: Add EXHAUSTED to Status Enum
```sql
ALTER TABLE inventory_entries 
MODIFY COLUMN status ENUM('FRESH_PO', 'UNDER_INSPECTION', 'ACCEPTED', 'REJECTED', 'EXHAUSTED') 
NOT NULL DEFAULT 'FRESH_PO';
```
- **How to execute:** Highlight all 3 lines and click ⚡
- **Expected Output:** `Records: X  Duplicates: 0  Warnings: 0` (where X is the number of existing records)
- **⚠️ IMPORTANT:** This modifies the table schema. Make sure you're connected to the correct database!

#### 4.4: Verify Schema Change
```sql
SHOW COLUMNS FROM inventory_entries LIKE 'status';
```
- **How to execute:** Highlight this line and click ⚡
- **Expected Output:** The `Type` column should now show:
  ```
  enum('FRESH_PO','UNDER_INSPECTION','ACCEPTED','REJECTED','EXHAUSTED')
  ```
- **✅ Verification:** Confirm that 'EXHAUSTED' is now in the list

#### 4.5: Execute the INSERT Statement
```sql
INSERT INTO inventory_entries (
    vendor_code,
    vendor_name,
    -- ... (all columns)
) VALUES (
    '13104',
    'Vendor Name',
    -- ... (all values)
);
```
- **How to execute:** Highlight the entire INSERT statement (from `INSERT` to the final `;`) and click ⚡
- **Expected Output:** `1 row(s) affected`
- **✅ Success Indicator:** You should see "1 row(s) affected" in the Action Output panel

#### 4.6: Verify the Insertion
```sql
SELECT 
    id,
    vendor_code,
    raw_material,
    supplier_name,
    grade_specification,
    heat_number,
    tc_number,
    tc_date,
    tc_quantity,
    invoice_number,
    invoice_date,
    unit_of_measurement,
    status,
    created_at
FROM inventory_entries 
WHERE vendor_code = '13104' 
ORDER BY created_at DESC 
LIMIT 1;
```
- **How to execute:** Highlight the entire SELECT statement and click ⚡
- **Expected Output:** A result grid showing your newly inserted record
- **✅ Verify these values:**
  - `raw_material`: Steel Rod
  - `supplier_name`: ABC Supplier
  - `grade_specification`: IS 2062
  - `heat_number`: HN12345
  - `tc_number`: TC789
  - `tc_quantity`: 100.000
  - `unit_of_measurement`: KG
  - `status`: **EXHAUSTED** ← This is the key field!
  - `created_at`: Current timestamp

---

## 🔍 Additional Verification Queries

### Count Total Entries
```sql
SELECT COUNT(*) as total_entries
FROM inventory_entries 
WHERE vendor_code = '13104';
```
**Expected:** Should show at least 1 entry

### View Entries by Status
```sql
SELECT 
    status,
    COUNT(*) as count,
    SUM(tc_quantity) as total_quantity
FROM inventory_entries 
WHERE vendor_code = '13104'
GROUP BY status;
```
**Expected:** Should show a row with `status = EXHAUSTED` and `count = 1`

### View Complete Record
```sql
SELECT *
FROM inventory_entries 
WHERE vendor_code = '13104' 
AND heat_number = 'HN12345';
```
**Expected:** Shows all fields for the newly inserted record

---

## ✅ Success Checklist

After completing all steps, verify:

- [ ] ALTER TABLE executed successfully (no errors)
- [ ] Status enum now includes 'EXHAUSTED'
- [ ] INSERT statement executed successfully (1 row affected)
- [ ] Verification query returns the new record
- [ ] Status field shows 'EXHAUSTED'
- [ ] All required fields have correct values
- [ ] Timestamps (created_at, updated_at) are populated

---

## 🎯 Next Step: Verify in Vendor Dashboard

Now that the data is in the database, test the frontend:

1. **Start the Spring Boot backend** (if not already running):
   ```bash
   cd d:\vendor\RITES-SARTHI-BACKEND
   mvn spring-boot:run
   ```

2. **Start the React frontend** (if not already running):
   ```bash
   cd d:\vendor\Rites-ERC-Vendor
   npm start
   ```

3. **Navigate to Vendor Dashboard:**
   - Open browser: `http://localhost:3000`
   - Click on **Vendor Dashboard**
   - Click on **Inventory Entry** tab
   - Look for the **"Inventory - List of Entries"** section

4. **Verify the entry appears:**
   - Look for Heat Number: `HN12345`
   - TC Details: `TC789 (2025-01-05)`
   - Invoice Details: `INV001 (2025-01-06)`
   - Status: Should show a badge with "EXHAUSTED"

---

## 🚨 Troubleshooting

### Issue: "Unknown column 'status' in 'field list'"
**Solution:** The ALTER TABLE didn't execute. Go back to Step 4.3

### Issue: "Data truncated for column 'status'"
**Solution:** The status value doesn't match the enum. Check that you're using 'EXHAUSTED' exactly

### Issue: "Duplicate entry for key 'PRIMARY'"
**Solution:** The record already exists. Either delete it first or change the heat_number to a unique value

### Issue: Entry doesn't appear in Vendor Dashboard
**Solution:** 
1. Check that backend is running and connected to the correct database
2. Check browser console for API errors
3. Verify vendor_code matches the logged-in vendor

---

**Last Updated:** 2026-01-09  
**Status:** ✅ Ready for Execution

