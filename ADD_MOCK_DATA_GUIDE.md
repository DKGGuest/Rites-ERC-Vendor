# 📋 Guide: Add Mock Approved RM Inspection Calls

## 🎯 Purpose
This guide will help you add sample **Approved Raw Material Inspection Calls** to your database so you can test the **Process Inspection Call** flow.

---

## ⚡ Quick Method (MySQL Workbench) - RECOMMENDED

### Step 1: Open MySQL Workbench
1. Launch **MySQL Workbench**
2. Connect to your local MySQL instance
3. Enter your root password

### Step 2: Run the Mock Data Script
1. Click **File** → **Open SQL Script**
2. Navigate to your project folder
3. Select: `add_mock_approved_rm_data.sql`
4. Click **⚡ Execute** button (or press `Ctrl+Shift+Enter`)

### Step 3: Verify Data
Run this query to verify:
```sql
USE rites_erc_inspection;

SELECT 
    ic.ic_number,
    ic.po_no,
    ic.status,
    rm.heat_numbers,
    rm.offered_qty_erc,
    GROUP_CONCAT(DISTINCT hq.heat_number) as heat_list,
    SUM(hq.qty_accepted) as total_accepted_qty
FROM inspection_calls ic
LEFT JOIN rm_inspection_details rm ON ic.id = rm.ic_id
LEFT JOIN rm_heat_quantities hq ON rm.id = hq.rm_detail_id
WHERE ic.type_of_call = 'Raw Material' AND ic.status = 'Approved'
GROUP BY ic.id
ORDER BY ic.created_at DESC;
```

**Expected Result:**
- 2 rows showing approved RM ICs
- `RM-IC-2025-0001` with heats: BN-2025-045, BN-2025-046
- `RM-IC-2025-0002` with heat: BN-2025-047

---

## 🔄 Alternative Method (Command Line)

### Windows PowerShell
```powershell
# Navigate to project directory
cd "C:\Users\hp\OneDrive\Desktop\DKG\ERC RITES\RITES-ERC-main (2)\RITES-ERC-main"

# Run the SQL file
Get-Content add_mock_approved_rm_data.sql | mysql -u root -p
# Enter your MySQL password when prompted
```

### Windows Command Prompt
```cmd
cd "C:\Users\hp\OneDrive\Desktop\DKG\ERC RITES\RITES-ERC-main (2)\RITES-ERC-main"
mysql -u root -p < add_mock_approved_rm_data.sql
```

---

## 📊 What Data Will Be Added?

### RM Inspection Call #1: `RM-IC-2025-0001`
- **PO Number:** PO-2025-1001
- **PO Serial:** PO-2025-1001/01
- **Status:** Approved
- **Heat Numbers:** 
  - BN-2025-045 (Accepted: 95 MT)
  - BN-2025-046 (Accepted: 98 MT)
- **Total Offered:** 200 MT / 173,913 ERCs
- **Manufacturer:** ABC Suppliers Pvt Ltd

### RM Inspection Call #2: `RM-IC-2025-0002`
- **PO Number:** PO-2025-1001
- **PO Serial:** PO-2025-1001/01
- **Status:** Approved
- **Heat Numbers:**
  - BN-2025-047 (Accepted: 145 MT)
- **Total Offered:** 150 MT / 130,435 ERCs
- **Manufacturer:** DEF Steel Works

---

## ✅ Testing the Process IC Flow

After adding the mock data:

1. **Start Backend Server** (if not running)
   ```bash
   cd server
   npm start
   ```

2. **Start Frontend** (if not running)
   ```bash
   npm start
   ```

3. **Navigate to Process IC Form**
   - Go to: http://localhost:3000
   - Login as Vendor
   - Click "Raise Inspection Call"
   - Select "Process" as inspection type
   - Select PO: `PO-2025-1001`
   - Select PO Serial: `PO-2025-1001/01`

4. **Expected Behavior**
   - RM IC dropdown should show 2 approved ICs:
     - `RM-IC-2025-0001 (Heats: BN-2025-045, BN-2025-046, Accepted: 173913 ERCs)`
     - `RM-IC-2025-0002 (Heats: BN-2025-047, Accepted: 130435 ERCs)`
   
5. **Select RM IC**
   - Choose `RM-IC-2025-0001`
   - Heat Number dropdown should populate with:
     - `ABC Suppliers Pvt Ltd - BN-2025-045 (Accepted: 95 ERCs)`
     - `ABC Suppliers Pvt Ltd - BN-2025-046 (Accepted: 98 ERCs)`

6. **Fill Process IC Form**
   - Enter Lot Number: `LOT-2025-001`
   - Select Heat Number: `BN-2025-045`
   - Enter Offered Qty: `50` (max: 95)
   - Select Desired Inspection Date
   - Add remarks (optional)
   - Click Submit

---

## 🐛 Troubleshooting

### Issue: "No approved RM ICs found"
**Solution:** 
- Verify data was inserted: Run verification query above
- Check PO number matches: `PO-2025-1001`
- Restart backend server to clear cache

### Issue: "No heat numbers available"
**Solution:**
- Ensure you selected an RM IC first
- Check browser console for API errors
- Verify backend is running on port 8080

### Issue: SQL script fails
**Solution:**
- Check if data already exists (duplicate IC numbers)
- Clear existing data first:
  ```sql
  DELETE FROM rm_chemical_analysis WHERE rm_detail_id IN (
    SELECT id FROM rm_inspection_details WHERE ic_id IN (
      SELECT id FROM inspection_calls WHERE ic_number IN ('RM-IC-2025-0001', 'RM-IC-2025-0002')
    )
  );
  DELETE FROM rm_heat_quantities WHERE rm_detail_id IN (
    SELECT id FROM rm_inspection_details WHERE ic_id IN (
      SELECT id FROM inspection_calls WHERE ic_number IN ('RM-IC-2025-0001', 'RM-IC-2025-0002')
    )
  );
  DELETE FROM rm_inspection_details WHERE ic_id IN (
    SELECT id FROM inspection_calls WHERE ic_number IN ('RM-IC-2025-0001', 'RM-IC-2025-0002')
  );
  DELETE FROM inspection_calls WHERE ic_number IN ('RM-IC-2025-0001', 'RM-IC-2025-0002');
  ```

---

## 📞 Need Help?

If you encounter any issues:
1. Check backend logs in the terminal
2. Check browser console for errors
3. Verify database connection in backend
4. Ensure all tables exist in database

---

**✨ You're all set! The mock data will enable you to test the complete Process IC workflow.**

