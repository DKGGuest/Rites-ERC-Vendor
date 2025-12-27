# RITES ERC - Simple Node.js API Server

## 🎯 Purpose

This is a lightweight Node.js/Express API server that connects directly to your MySQL database. It allows your React frontend to save and retrieve data without needing Spring Boot.

**Perfect for:**
- ✅ Frontend development and testing
- ✅ Direct MySQL database operations
- ✅ Quick prototyping
- ✅ Easy migration to Azure later

---

## 🚀 Quick Start (3 Steps)

### Step 1: Install Dependencies

```bash
# Navigate to server folder
cd server

# Install Node.js packages
npm install
```

**Expected output:**
```
added 57 packages in 5s
```

---

### Step 2: Configure Database

Open `server/.env` and update your MySQL password:

```env
DB_PASSWORD=your_mysql_password
```

**Example:**
```env
# If your MySQL password is "admin123"
DB_PASSWORD=admin123
```

---

### Step 3: Start the Server

```bash
# Start the server
npm start
```

**Expected output:**
```
========================================
🚀 RITES ERC API Server Started
========================================
📡 Server running on: http://localhost:8080
🌐 API Base URL: http://localhost:8080/api
💚 Health Check: http://localhost:8080/api/health
📊 Database: rites_erc_inspection
========================================
```

✅ **Done!** Your API server is now running and connected to MySQL.

---

## 🧪 Test the Server

### Test 1: Health Check

Open browser: `http://localhost:8080/api/health`

**Expected Response:**
```json
{
  "success": true,
  "message": "RITES ERC API Server is running",
  "timestamp": "2025-12-23T10:30:00.000Z",
  "database": "Connected"
}
```

### Test 2: Create Inspection Call

Use Postman or your React app to POST data:

```bash
curl -X POST http://localhost:8080/api/inspection-calls/raw-material \
  -H "Content-Type: application/json" \
  -d '{
    "po_no": "PO-2025-001",
    "desired_inspection_date": "2025-12-25",
    "company_id": 1,
    "unit_id": 1,
    "unit_address": "Test Address",
    "raw_material_name": "Spring Steel Round Bars",
    "rm_offered_qty_mt": 10.5
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Raw Material Inspection Call created successfully",
  "data": {
    "ic_number": "RM-IC-2025-0001",
    "inspection_call_id": 1
  }
}
```

---

## 📁 Project Structure

```
server/
├── server.js                    # Main server file
├── package.json                 # Dependencies
├── .env                         # Configuration (UPDATE THIS)
├── config/
│   └── database.js             # MySQL connection pool
├── controllers/
│   └── inspectionCallController.js  # Business logic
├── routes/
│   └── inspectionCallRoutes.js      # API routes
└── utils/
    └── icNumberGenerator.js         # IC number generation
```

---

## 🔧 Configuration

### Environment Variables (`.env`)

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `8080` |
| `DB_HOST` | MySQL host | `localhost` |
| `DB_PORT` | MySQL port | `3306` |
| `DB_NAME` | Database name | `rites_erc_inspection` |
| `DB_USER` | MySQL username | `root` |
| `DB_PASSWORD` | MySQL password | `your_password` |
| `CORS_ORIGIN` | React app URL | `http://localhost:3000` |

---

## 📋 Available API Endpoints

### 1. Health Check
```
GET /api/health
```

### 2. Create Raw Material Inspection Call
```
POST /api/inspection-calls/raw-material
```

**Request Body:**
```json
{
  "po_no": "PO-2025-001",
  "po_serial_no": "001",
  "desired_inspection_date": "2025-12-25",
  "company_id": 1,
  "unit_id": 1,
  "unit_address": "Plant Address",
  "raw_material_name": "Spring Steel Round Bars",
  "rm_offered_qty_mt": 10.5,
  "rm_tc_number": "TC-001",
  "rm_tc_date": "2025-12-20",
  "heat_quantities": [
    {
      "manufacturer_name": "JSPL",
      "heat_number": "HT-2025-001",
      "quantity_mt": 5.5
    }
  ]
}
```

### 3. Get All Inspection Calls
```
GET /api/inspection-calls
GET /api/inspection-calls?type_of_call=Raw Material
GET /api/inspection-calls?status=Pending
```

### 4. Get Inspection Call by IC Number
```
GET /api/inspection-calls/:icNumber
GET /api/inspection-calls/RM-IC-2025-0001
```

### 5. Initiate Workflow (Mock)
```
POST /api/initiateWorkflow
```

---

## ✅ Verify Data in MySQL

After creating an inspection call, verify in MySQL Workbench:

```sql
-- Check inspection calls
SELECT * FROM inspection_calls;

-- Check RM details
SELECT * FROM rm_inspection_details;

-- Check heat quantities
SELECT * FROM rm_heat_quantities;

-- Check IC number sequences
SELECT * FROM ic_number_sequences;
```

---

## 🚨 Troubleshooting

### Issue 1: "Cannot find module 'express'"
**Solution:** Run `npm install` in the server folder

### Issue 2: "Access Denied for User"
**Solution:** Update `DB_PASSWORD` in `server/.env`

### Issue 3: "Port 8080 already in use"
**Solution:** Change `PORT=8081` in `server/.env`

### Issue 4: "Database connection failed"
**Solution:** 
- Check MySQL is running
- Verify database `rites_erc_inspection` exists
- Check credentials in `.env`

---

## 🌐 Running Both Servers

You need to run **TWO** terminals:

**Terminal 1: React Frontend**
```bash
# In project root
npm start
# Runs on http://localhost:3000
```

**Terminal 2: Node.js API Server**
```bash
# In server folder
cd server
npm start
# Runs on http://localhost:8080
```

---

## 🔄 Migration to Azure

When ready to deploy to Azure:

1. **Azure MySQL**: Import the database dump
2. **Update `.env`**:
```env
DB_HOST=your-server.mysql.database.azure.com
DB_USER=your-username@your-server
DB_PASSWORD=your-azure-password
```
3. **Deploy to Azure App Service** or **Azure Container Instances**

---

## 📝 Development Tips

### Auto-restart on file changes:
```bash
npm run dev
# Uses nodemon for auto-restart
```

### View logs:
```bash
# Server logs are printed to console
# Check for SQL queries and errors
```

---

## ✅ Success Checklist

- [ ] Node.js installed (v14 or higher)
- [ ] `npm install` completed successfully
- [ ] `.env` file updated with MySQL password
- [ ] MySQL server running
- [ ] Database `rites_erc_inspection` exists
- [ ] Server starts without errors
- [ ] Health check returns success
- [ ] React app can connect to API

---

## 🎉 Summary

**What You Have:**
- ✅ Simple Node.js API server
- ✅ Direct MySQL database connection
- ✅ REST API endpoints for inspection calls
- ✅ Auto-generated IC numbers
- ✅ CORS enabled for React frontend
- ✅ Easy to migrate to Azure

**What You Can Do:**
- ✅ Save inspection calls to database
- ✅ Retrieve data from database
- ✅ Test frontend without Spring Boot
- ✅ Develop and iterate quickly

---

**Ready to start? Run `npm install` and `npm start`!** 🚀

