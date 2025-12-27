# 🚀 Setup Guide - Connect React to MySQL Database

## 📋 Overview

This guide will help you connect your React frontend directly to the MySQL database using a simple Node.js API server. **No Spring Boot required!**

---

## ✅ What You'll Get

- ✅ Save inspection calls directly to MySQL database
- ✅ Retrieve data from database in React frontend
- ✅ Auto-generated IC numbers (RM-IC-2025-0001, etc.)
- ✅ Easy to migrate to Azure later
- ✅ Quick development and testing

---

## 🎯 Quick Setup (5 Minutes)

### Step 1: Install Node.js API Server Dependencies

```bash
# Navigate to server folder
cd server

# Install packages
npm install
```

**Expected output:**
```
added 57 packages in 5s
```

---

### Step 2: Configure Database Connection

Open `server/.env` and update your MySQL password:

```env
DB_PASSWORD=your_mysql_password
```

**Example:**
```env
# If your MySQL root password is "admin123"
DB_HOST=localhost
DB_PORT=3306
DB_NAME=rites_erc_inspection
DB_USER=root
DB_PASSWORD=admin123
```

---

### Step 3: Start the API Server

```bash
# Make sure you're in the server folder
cd server

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
✅ Database connected successfully!
========================================
```

✅ **Success!** Your API server is now running.

---

### Step 4: Start React Frontend

Open a **NEW terminal** (keep the API server running):

```bash
# Navigate to project root
cd ..

# Start React app
npm start
```

**Expected output:**
```
Compiled successfully!

You can now view the app in the browser.
  Local:            http://localhost:3000
```

---

## 🧪 Test the Complete Setup

### Test 1: Check API Server Health

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

✅ **API server is working!**

---

### Test 2: Submit an Inspection Call

1. Open React app: `http://localhost:3000`
2. Login as vendor
3. Go to **"Raise Inspection Call"** tab
4. Click **"Raise Inspection Call"** button on any PO item
5. Fill in the form:
   - **Type of Call**: Raw Material
   - **Desired Inspection Date**: Select a date
   - **Company Name**: Select a company
   - **Unit Name**: Select a unit
   - **Raw Material Name**: Select a material
   - **Offered Quantity**: Enter quantity (e.g., 10.5)
   - Add heat quantities if needed
6. Click **"Submit Inspection Request"**

**Expected Result:**
```
✅ Inspection Request saved successfully!

IC Number: RM-IC-2025-0001
Item: ERC MK-III Clips - Type A

Data has been saved to the database.
```

✅ **Data is saved to MySQL!**

---

### Test 3: Verify Data in MySQL Workbench

Open MySQL Workbench and run:

```sql
-- Check inspection calls
SELECT * FROM inspection_calls;

-- Check RM details
SELECT * FROM rm_inspection_details;

-- Check heat quantities
SELECT * FROM rm_heat_quantities;

-- Check IC number sequence
SELECT * FROM ic_number_sequences;
```

**Expected Result:**
- You should see your inspection call data
- IC number should be `RM-IC-2025-0001` (or next sequence)
- All related data should be saved

✅ **Data is in the database!**

---

## 📊 How It Works

```
┌─────────────────────┐
│  React Frontend     │
│  (Port 3000)        │
└──────────┬──────────┘
           │
           │ HTTP POST /api/inspection-calls/raw-material
           │
           ▼
┌─────────────────────┐
│  Node.js API Server │
│  (Port 8080)        │
└──────────┬──────────┘
           │
           │ SQL INSERT
           │
           ▼
┌─────────────────────┐
│  MySQL Database     │
│  (Port 3306)        │
│  rites_erc_inspection
└─────────────────────┘
```

---

## 🔧 Running Both Servers

You need **TWO terminals** running simultaneously:

### Terminal 1: Node.js API Server
```bash
cd server
npm start
# Keep this running!
```

### Terminal 2: React Frontend
```bash
npm start
# Keep this running!
```

**Both must be running for the app to work!**

---

## 📁 What Was Created

### New Files:
```
server/
├── server.js                           # Main API server
├── package.json                        # Dependencies
├── .env                                # Configuration (UPDATE THIS!)
├── config/
│   └── database.js                    # MySQL connection
├── controllers/
│   └── inspectionCallController.js    # Save/fetch logic
├── routes/
│   └── inspectionCallRoutes.js        # API endpoints
└── utils/
    └── icNumberGenerator.js           # IC number generation
```

### Updated Files:
```
src/pages/VendorDashboardPage.js       # Now saves to database
src/services/inspectionCallService.js  # Already had the methods
```

---

## 🚨 Troubleshooting

### Issue 1: "ERR_CONNECTION_REFUSED"

**Problem:** API server is not running

**Solution:**
```bash
cd server
npm start
```

---

### Issue 2: "Access Denied for User 'root'"

**Problem:** Wrong MySQL password

**Solution:** Update `server/.env`:
```env
DB_PASSWORD=your_correct_password
```

---

### Issue 3: "Cannot find module 'express'"

**Problem:** Dependencies not installed

**Solution:**
```bash
cd server
npm install
```

---

### Issue 4: "Port 8080 already in use"

**Problem:** Another app is using port 8080

**Solution:** Change port in `server/.env`:
```env
PORT=8081
```

Then update React `.env`:
```env
REACT_APP_API_BASE_URL=http://localhost:8081/api
```

---

### Issue 5: "Table doesn't exist"

**Problem:** Database not imported

**Solution:** Re-import database:
```bash
# In MySQL Workbench
File → Open SQL Script → Select database/rites_erc_inspection_dump.sql → Execute
```

---

## ✅ Success Checklist

Before testing, verify:

- [ ] MySQL Server is running
- [ ] Database `rites_erc_inspection` exists with 10 tables
- [ ] `server/.env` updated with MySQL password
- [ ] `npm install` completed in `server/` folder
- [ ] API server running on port 8080 (Terminal 1)
- [ ] React app running on port 3000 (Terminal 2)
- [ ] Health check returns success: `http://localhost:8080/api/health`
- [ ] No errors in either terminal

---

## 🌐 Migration to Azure (Later)

When ready to deploy:

### 1. Azure MySQL Database
```bash
# Import database dump to Azure MySQL
mysql -h your-server.mysql.database.azure.com -u your-username@your-server -p < database/rites_erc_inspection_dump.sql
```

### 2. Update Server Configuration
Update `server/.env`:
```env
DB_HOST=your-server.mysql.database.azure.com
DB_USER=your-username@your-server
DB_PASSWORD=your-azure-password
```

### 3. Deploy API Server
- Deploy to Azure App Service
- Or Azure Container Instances
- Or Azure Functions

### 4. Update React Configuration
Update `.env`:
```env
REACT_APP_API_BASE_URL=https://your-api.azurewebsites.net/api
```

---

## 📝 Available API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| POST | `/api/inspection-calls/raw-material` | Create RM inspection call |
| GET | `/api/inspection-calls` | Get all inspection calls |
| GET | `/api/inspection-calls/:icNumber` | Get specific inspection call |
| POST | `/api/initiateWorkflow` | Initiate workflow (mock) |

---

## 🎉 Summary

**What You Have:**
- ✅ Node.js API server connected to MySQL
- ✅ React frontend saving data to database
- ✅ Auto-generated IC numbers
- ✅ Complete CRUD operations
- ✅ Easy to migrate to Azure

**What You Can Do:**
- ✅ Save inspection calls to database
- ✅ View saved data in MySQL Workbench
- ✅ Retrieve data in React frontend
- ✅ Test complete workflow
- ✅ Develop without Spring Boot

---

**Ready? Follow the 4 steps above and start saving data!** 🚀

**Need help? Check the troubleshooting section or `server/README.md`** 📖

