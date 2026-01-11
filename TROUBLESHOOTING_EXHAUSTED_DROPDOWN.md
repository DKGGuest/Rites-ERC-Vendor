# 🔍 Troubleshooting: EXHAUSTED Heat Number Appearing in Dropdown

## 🚨 Problem
HN12345 (status=EXHAUSTED) is appearing in the Heat Number dropdown when it should be filtered out.

---

## 📋 Diagnostic Steps

### Step 1: Check Browser Console (MOST IMPORTANT)
**Open DevTools (F12) → Console Tab**

Look for these specific log messages:

#### ✅ Expected (Good):
```
✅ Loaded available heat numbers from database: X
📊 Available heat numbers: [array of heat numbers]
✅ Using availableHeatNumbers from API: X
```

#### ❌ Problem Indicator (Bad):
```
⚠️ Failed to fetch available heat numbers, using empty list
❌ Error fetching available heat numbers: [error message]
⚠️ Falling back to filtering inventoryEntries
```

**What to do:**
- If you see "⚠️ Falling back to filtering inventoryEntries", the API call failed
- If you see "❌ Error fetching available heat numbers", check the error message
- If you see "✅ Using availableHeatNumbers from API", the API is working correctly

---

### Step 2: Check Network Tab
**Open DevTools (F12) → Network Tab**

1. Refresh the page
2. Look for a request to: `/api/vendor/available-heat-numbers/13104`

#### ✅ If Request Exists:
- Check the **Status Code**: Should be `200 OK`
- Check the **Response**: Click on the request → Preview tab
- Expected response format:
  ```json
  {
    "responseStatus": {
      "statusCode": 0,
      "message": null
    },
    "responseData": [
      // Array of available heat numbers
      // HN12345 should NOT be here
    ]
  }
  ```

#### ❌ If Request Does NOT Exist:
- The API call is not being made at all
- Check if the component is mounted correctly
- Check if the useEffect is running

#### ❌ If Request Fails (Status 404, 500, etc.):
- Backend might not be running
- Endpoint might not be registered
- CORS issue

---

### Step 3: Test Backend API Directly
**Open a new browser tab and navigate to:**
```
http://localhost:8080/api/vendor/available-heat-numbers/13104
```

#### ✅ Expected Response:
```json
{
  "responseStatus": {
    "statusCode": 0
  },
  "responseData": [
    // Only FRESH_PO entries
    // HN12345 should NOT be in this list
  ]
}
```

#### ❌ If HN12345 Appears in Response:
**Problem:** Backend filtering is not working
**Solution:** Check if:
1. Backend was restarted after adding EXHAUSTED enum
2. Database entry has correct status='EXHAUSTED'
3. Backend filtering logic is correct

#### ❌ If You Get 404 Error:
**Problem:** Backend endpoint not found
**Solution:**
1. Check if backend is running: `http://localhost:8080/actuator/health`
2. Restart backend:
   ```bash
   cd d:\vendor\RITES-SARTHI-BACKEND
   mvn spring-boot:run
   ```

---

### Step 4: Check Database Entry
**Run this SQL query:**
```sql
USE rites_erc_inspection;

SELECT 
    id, vendor_code, heat_number, tc_number, 
    raw_material, supplier_name, status, created_at
FROM inventory_entries 
WHERE heat_number = 'HN12345' AND vendor_code = '13104';
```

#### ✅ Expected Result:
```
| id | vendor_code | heat_number | tc_number | raw_material | supplier_name | status    | created_at          |
|----|-------------|-------------|-----------|--------------|---------------|-----------|---------------------|
| XX | 13104       | HN12345     | TC789     | Steel Rod    | ABC Supplier  | EXHAUSTED | 2026-01-09 XX:XX:XX |
```

#### ❌ If status is NOT 'EXHAUSTED':
**Problem:** Database entry has wrong status
**Solution:** Update the status:
```sql
UPDATE inventory_entries 
SET status = 'EXHAUSTED' 
WHERE heat_number = 'HN12345' AND vendor_code = '13104';
```

---

## 🔧 Common Issues & Solutions

### Issue 1: Frontend is Falling Back to Old Logic
**Symptoms:**
- Console shows: "⚠️ Falling back to filtering inventoryEntries"
- HN12345 appears in dropdown

**Root Cause:**
- `availableHeatNumbers` prop is empty or undefined
- API call failed or returned empty array

**Solution:**
1. Check Network tab for failed API call
2. Check backend logs for errors
3. Verify backend is running on port 8080
4. Check CORS configuration

---

### Issue 2: Backend Returns EXHAUSTED Entry
**Symptoms:**
- API response includes HN12345
- Backend filtering not working

**Root Cause:**
- Backend not restarted after enum changes
- Filtering logic has a bug
- Database status is not 'EXHAUSTED'

**Solution:**
1. Restart backend
2. Verify database status
3. Check backend logs for filtering logic

---

### Issue 3: API Call Not Being Made
**Symptoms:**
- No network request to `/api/vendor/available-heat-numbers/13104`
- Console shows no logs about fetching heat numbers

**Root Cause:**
- Component not mounted
- useEffect not running
- Code changes not deployed

**Solution:**
1. Hard refresh browser (Ctrl+Shift+R)
2. Clear browser cache
3. Restart frontend dev server:
   ```bash
   cd d:\vendor\Rites-ERC-Vendor
   npm start
   ```

---

## 🎯 Quick Diagnostic Checklist

Run through this checklist in order:

- [ ] **Backend is running** - Test: `http://localhost:8080/actuator/health`
- [ ] **Frontend is running** - Test: `http://localhost:3000`
- [ ] **Database has EXHAUSTED entry** - Run SQL query above
- [ ] **Backend API filters correctly** - Test: `http://localhost:8080/api/vendor/available-heat-numbers/13104`
- [ ] **Frontend makes API call** - Check Network tab
- [ ] **Frontend uses API data** - Check Console for "✅ Using availableHeatNumbers from API"
- [ ] **Dropdown uses filtered data** - Check dropdown options

---

## 📊 Expected vs Actual Behavior

### Expected Behavior:
1. Frontend calls `/api/vendor/available-heat-numbers/13104`
2. Backend returns only FRESH_PO entries (HN12345 excluded)
3. Frontend receives filtered list
4. Console shows: "✅ Using availableHeatNumbers from API: X"
5. Dropdown shows only FRESH_PO entries

### Actual Behavior (Problem):
1. Frontend calls API (or doesn't)
2. API returns data (or fails)
3. Frontend falls back to old logic
4. Console shows: "⚠️ Falling back to filtering inventoryEntries"
5. Dropdown shows ALL entries including EXHAUSTED

---

## 🆘 Next Steps

Based on your findings, choose the appropriate action:

### If Console Shows "Falling Back to Filtering":
→ **API call is failing** - Check Network tab and backend logs

### If API Returns HN12345:
→ **Backend filtering not working** - Restart backend and verify database

### If No API Call in Network Tab:
→ **Frontend not making request** - Hard refresh and check code deployment

### If Everything Looks Correct But Still Broken:
→ **Share the following with me:**
1. Console logs (screenshot)
2. Network tab (screenshot of API request/response)
3. Backend API response (from direct browser test)
4. Database query result

---

**Created:** 2026-01-09  
**Purpose:** Diagnose why EXHAUSTED heat numbers appear in dropdown

