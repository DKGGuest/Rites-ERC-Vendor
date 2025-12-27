# 📋 Step-by-Step Setup Guide

Follow these steps exactly in order.

---

## ✅ STEP 1: Import Database in MySQL Workbench

### 1.1 Start MySQL Server
- Press `Windows + R`
- Type: `services.msc` and press Enter
- Find **MySQL80** in the list
- Right-click → **Start** (if not already running)

### 1.2 Open MySQL Workbench
- Open **MySQL Workbench** application
- Click on your local connection (usually shows `localhost:3306`)
- Enter password: `root` (or your MySQL root password)
- Click **OK**

### 1.3 Import the Database Dump
1. In MySQL Workbench, click **File** → **Open SQL Script**
2. Navigate to: `RITES-ERC-main\database` folder
3. Select file: **`rites_erc_inspection_dump.sql`**
4. Click **Open**
5. Click the **⚡ Execute** button (lightning icon) in the toolbar
6. Wait for execution to complete (this will create all tables)

### 1.4 Verify Database Created
In the left panel (SCHEMAS), you should see:
- Database: `rites_erc_inspection`
- Tables: `inspection_calls`, `ic_number_sequences`, `rm_inspection_details`, etc.

Run this query to verify:
```sql
USE rites_erc_inspection;
SELECT * FROM ic_number_sequences;
```

You should see:
```
id | type_of_call  | prefix    | current_year | current_sequence
1  | Raw Material  | RM-IC     | 2025         | 0
2  | Process       | PROC-IC   | 2025         | 0
3  | Final         | FINAL-IC  | 2025         | 0
```

✅ **Database setup is complete!**

---

## ✅ STEP 2: Verify Spring Boot Configuration

The Spring Boot backend is already configured to connect to your local MySQL.

**File:** `RITES-SARTHI-BACKEND-main\RITES-SARTHI-BACKEND-main\src\main\resources\application.properties`

**Current settings:**
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/sarthidb
spring.datasource.username=root
spring.datasource.password=root
```

**⚠️ IMPORTANT:** If your MySQL root password is NOT "root", you need to update it:
1. Open: `RITES-SARTHI-BACKEND-main\RITES-SARTHI-BACKEND-main\src\main\resources\application.properties`
2. Find line 13: `spring.datasource.password=root`
3. Change `root` to your actual MySQL password
4. Save the file

✅ **Configuration is ready!**

---

## ✅ STEP 3: Start Spring Boot Backend

### 3.1 Stop Node.js Server (if running)

Open **PowerShell** and run:
```powershell
# Find what's running on port 8080
netstat -ano | findstr :8080
```

If you see a result like:
```
TCP    0.0.0.0:8080    0.0.0.0:0    LISTENING    12345
```

Kill that process (replace 12345 with your actual PID):
```powershell
taskkill /PID 12345 /F
```

Or simply kill all Node.js processes:
```powershell
taskkill /IM node.exe /F
```

### 3.2 Navigate to Spring Boot Project

In PowerShell:
```powershell
cd "C:\Users\hp\OneDrive\Desktop\DKG\ERC RITES\RITES-ERC-main (2)\RITES-SARTHI-BACKEND-main\RITES-SARTHI-BACKEND-main"
```

### 3.3 Start Spring Boot

Run:
```powershell
mvn spring-boot:run
```

### 3.4 Wait for Startup

You'll see lots of logs. Wait for this message:
```
Started SarthiBackendApplication in X.XXX seconds
```

✅ **Spring Boot is running!**

**Keep this terminal open!** Don't close it.

---

## ✅ STEP 4: Verify Spring Boot Connection

### 4.1 Test Health Endpoint

Open your browser and go to:
```
http://localhost:8080/actuator/health
```

You should see:
```json
{"status":"UP"}
```

✅ **Backend is connected to database!**

---

## ✅ STEP 5: Start React Frontend

### 5.1 Open a NEW Terminal

**Important:** Keep the Spring Boot terminal running. Open a **NEW** PowerShell window.

### 5.2 Navigate to React Project

```powershell
cd "C:\Users\hp\OneDrive\Desktop\DKG\ERC RITES\RITES-ERC-main (2)\RITES-ERC-main"
```

### 5.3 Start React

```powershell
npm start
```

### 5.4 Wait for React to Start

React will automatically open in your browser at:
```
http://localhost:3000
```

✅ **React is running!**

---

## ✅ STEP 6: Test the Complete System

### 6.1 Create an Inspection Call

1. In your browser (http://localhost:3000)
2. Navigate to **Vendor Dashboard**
3. Click **Create Raw Material Inspection Call**
4. Fill in the form:
   - Vendor Code: `V001`
   - Item Description: `Steel Bars`
   - Quantity: `1000`
   - UOM: `MT`
5. Click **Submit**

### 6.2 Verify IC Number Generated

You should see a success message with IC Number:
```
RM-IC-2025-0001
```

### 6.3 Verify in Database

Go back to **MySQL Workbench** and run:
```sql
USE sarthidb;
SELECT * FROM ic_number_sequences;
```

You should see:
```
id | type_of_call  | current_sequence | last_generated_ic
1  | Raw Material  | 1                | RM-IC-2025-0001
```

✅ **Everything is working!**

---

## 🎉 Setup Complete!

You now have:
- ✅ MySQL database running with `sarthidb`
- ✅ Spring Boot backend running on port 8080
- ✅ React frontend running on port 3000
- ✅ All systems connected and working

---

## 📊 System Overview

```
┌─────────────────────┐
│   React Frontend    │
│   localhost:3000    │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Spring Boot API    │
│   localhost:8080    │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   MySQL Database    │
│   localhost:3306    │
│   Database: sarthidb│
└─────────────────────┘
```

---

## 🔄 Daily Workflow

Every time you want to work on the project:

1. **Start MySQL** (if not running):
   ```powershell
   net start MySQL80
   ```

2. **Start Spring Boot** (Terminal 1):
   ```powershell
   cd "RITES-SARTHI-BACKEND-main\RITES-SARTHI-BACKEND-main"
   mvn spring-boot:run
   ```

3. **Start React** (Terminal 2):
   ```powershell
   cd RITES-ERC-main
   npm start
   ```

---

## 🐛 Troubleshooting

### Problem: MySQL won't start
**Solution:**
```powershell
net start MySQL80
```

### Problem: Port 8080 already in use
**Solution:**
```powershell
taskkill /IM node.exe /F
```

### Problem: Spring Boot can't connect to database
**Solution:**
- Check MySQL is running
- Verify password in `application.properties` is correct
- Make sure database `sarthidb` exists

### Problem: React shows CORS error
**Solution:**
- Make sure Spring Boot is running
- Clear browser cache
- Restart Spring Boot

---

## ✅ Success Checklist

- [ ] MySQL Server running
- [ ] Database `sarthidb` created
- [ ] Table `ic_number_sequences` has 3 rows
- [ ] Spring Boot started (shows "Started SarthiBackendApplication")
- [ ] Health check returns `{"status":"UP"}`
- [ ] React app opens at localhost:3000
- [ ] Can create inspection call
- [ ] IC number generated successfully

---

**You're all set! Happy coding! 🚀**

