# ⚡ Quick Start - Process IC Testing

## 🎯 3-Step Setup

### Step 1: Add Mock Data (Choose One)

**Option A: MySQL Workbench** ⭐ RECOMMENDED
```
1. Open MySQL Workbench
2. File → Open SQL Script → QUICK_ADD_MOCK_DATA.sql
3. Click Execute (⚡)
```

**Option B: PowerShell**
```powershell
Get-Content QUICK_ADD_MOCK_DATA.sql | mysql -u root -p
```

### Step 2: Start Servers

**Terminal 1 - Backend:**
```bash
cd server
npm start
```

**Terminal 2 - Frontend:**
```bash
npm start
```

### Step 3: Test Process IC

1. Go to: http://localhost:3000
2. Raise Inspection Call → Process
3. PO: `PO-2025-1001`
4. Serial: `PO-2025-1001/01`
5. RM IC: `RM-IC-2025-0001`
6. Heat: `BN-2025-045`
7. Lot: `LOT-2025-001`
8. Qty: `50`
9. Submit ✅

---

## 📊 Mock Data Summary

| IC Number | PO Number | Heat Numbers | Accepted Qty |
|-----------|-----------|--------------|--------------|
| RM-IC-2025-0001 | PO-2025-1001/01 | BN-2025-045, BN-2025-046 | 95 MT, 98 MT |
| RM-IC-2025-0002 | PO-2025-1001/01 | BN-2025-047 | 145 MT |

---

## 🔗 Important URLs

- **Frontend:** http://localhost:3000
- **Backend:** http://localhost:8080
- **Health Check:** http://localhost:8080/api/health
- **Approved RMs:** http://localhost:8080/api/inspection-calls/raw-material/approved?po_no=PO-2025-1001
- **Heat Numbers:** http://localhost:8080/api/heat-numbers/RM-IC-2025-0001

---

## 🐛 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| No approved RMs found | Run QUICK_ADD_MOCK_DATA.sql |
| Backend won't start | Check MySQL, verify .env |
| Frontend won't start | Run `npm install` |
| API returns 500 | Check server logs |
| Dropdown empty | Check browser console |

---

## ✅ Success Checklist

- [ ] MySQL running
- [ ] Mock data added (2 approved RM ICs)
- [ ] Backend running on port 8080
- [ ] Frontend running on port 3000
- [ ] RM IC dropdown shows 2 options
- [ ] Heat dropdown shows heat numbers
- [ ] Process IC submits successfully

---

## 🔍 Verify Mock Data

```sql
USE rites_erc_inspection;

SELECT ic_number, po_no, status 
FROM inspection_calls 
WHERE type_of_call = 'Raw Material' AND status = 'Approved';
```

**Expected:** 2 rows (RM-IC-2025-0001, RM-IC-2025-0002)

---

## 📁 Documentation Files

- `QUICK_ADD_MOCK_DATA.sql` - SQL script to add mock data
- `ADD_MOCK_DATA_GUIDE.md` - Detailed guide with troubleshooting
- `PROCESS_IC_TESTING_SUMMARY.md` - Complete implementation summary
- `PROCESS_IC_QUICK_START.md` - This quick start guide

---

**Need help?** See `ADD_MOCK_DATA_GUIDE.md` for detailed instructions

