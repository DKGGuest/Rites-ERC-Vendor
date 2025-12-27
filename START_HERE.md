# 🚀 START HERE - Switch to Spring Boot Backend

## 🎯 Choose Your Setup

### Option A: Local MySQL (Recommended for Testing)
**Use this if you want to test locally first**
👉 **Go to:** `LOCAL_MYSQL_SETUP.md`

### Option B: Azure MySQL (Production)
**Use this when Azure is ready**
👉 Continue reading below

---

## What You Need to Do

You currently have a Node.js server running. We need to:
1. ✅ Stop the Node.js server
2. ✅ Start the Spring Boot backend
3. ✅ Initialize the database (one-time)
4. ✅ Keep React running

---

## 🎯 EASIEST METHOD - Use the Script

### Option 1: PowerShell Script (Recommended)

Right-click on this file and select "Run with PowerShell":
```
RITES-ERC-main/stop-node-start-springboot.ps1
```

### Option 2: Batch Script

Double-click this file:
```
RITES-ERC-main/stop-node-start-springboot.bat
```

**That's it!** The script will:
- Stop Node.js automatically
- Start Spring Boot backend
- Show you the server status

---

## 🔧 MANUAL METHOD - Step by Step

### Step 1: Stop Node.js Server

Open PowerShell and run:

```powershell
# Find what's running on port 8080
netstat -ano | findstr :8080

# You'll see something like:
# TCP    0.0.0.0:8080    0.0.0.0:0    LISTENING    12345

# Kill that process (replace 12345 with your PID)
taskkill /PID 12345 /F
```

### Step 2: Start Spring Boot Backend

Open a new terminal and run:

```powershell
# Navigate to Spring Boot project
cd "RITES-SARTHI-BACKEND-main\RITES-SARTHI-BACKEND-main"

# Start Spring Boot
mvn spring-boot:run
```

**Wait for this message:**
```
Started SarthiBackendApplication in X.XXX seconds
```

### Step 3: Verify Spring Boot is Running

Open browser and go to:
```
http://localhost:8080/actuator/health
```

You should see:
```json
{"status":"UP"}
```

### Step 4: Initialize Database (ONE-TIME ONLY)

**You only need to do this ONCE!**

Connect to your Azure MySQL database and run this SQL:

```sql
-- Connection Details:
-- Host: sarthibackenddb.mysql.database.azure.com
-- Port: 3306
-- Database: sarthidb
-- Username: DkgSarthi
-- Password: Test@123

USE sarthidb;

-- Create IC sequences table
CREATE TABLE IF NOT EXISTS ic_number_sequences (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type_of_call VARCHAR(50) NOT NULL UNIQUE,
    prefix VARCHAR(20) NOT NULL,
    current_year INT NOT NULL,
    current_sequence INT NOT NULL DEFAULT 0,
    last_generated_ic VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Initialize sequences
INSERT INTO ic_number_sequences (type_of_call, prefix, current_year, current_sequence)
VALUES 
    ('Raw Material', 'RM-IC', YEAR(CURDATE()), 0),
    ('Process', 'PROC-IC', YEAR(CURDATE()), 0),
    ('Final', 'FINAL-IC', YEAR(CURDATE()), 0)
ON DUPLICATE KEY UPDATE type_of_call = type_of_call;

-- Verify it worked
SELECT * FROM ic_number_sequences;
```

**Expected Result:**
```
+----+---------------+-----------+--------------+------------------+-------------------+
| id | type_of_call  | prefix    | current_year | current_sequence | last_generated_ic |
+----+---------------+-----------+--------------+------------------+-------------------+
|  1 | Raw Material  | RM-IC     | 2025         | 0                | NULL              |
|  2 | Process       | PROC-IC   | 2025         | 0                | NULL              |
|  3 | Final         | FINAL-IC  | 2025         | 0                | NULL              |
+----+---------------+-----------+--------------+------------------+-------------------+
```

### Step 5: Start React App

Open a NEW terminal (keep Spring Boot running) and run:

```powershell
cd RITES-ERC-main
npm start
```

React will start on `http://localhost:3000`

---

## ✅ How to Know Everything is Working

1. **Spring Boot Terminal** shows:
   ```
   Started SarthiBackendApplication in X.XXX seconds
   ```

2. **Health Check** returns:
   ```json
   {"status":"UP"}
   ```

3. **React App** loads at `http://localhost:3000`

4. **Test**: Create an inspection call from the UI
   - Go to Vendor Dashboard
   - Create a Raw Material Inspection Call
   - Should save successfully

---

## 🐛 Common Problems

### Problem 1: "Port 8080 already in use"

**Solution:**
```powershell
# Kill all Node.js processes
taskkill /IM node.exe /F

# Then start Spring Boot again
cd RITES-SARTHI-BACKEND-main\RITES-SARTHI-BACKEND-main
mvn spring-boot:run
```

### Problem 2: "Maven not found"

**Solution:**
1. Install Maven from: https://maven.apache.org/download.cgi
2. Add Maven to PATH
3. Restart terminal
4. Try again

### Problem 3: "Database connection failed"

**Solution:**
1. Go to Azure Portal
2. Find your MySQL server: `sarthibackenddb`
3. Go to "Connection security"
4. Add your IP address to firewall rules
5. Restart Spring Boot

---

## 📊 What's Different Now?

| Before | After |
|--------|-------|
| Node.js server | Spring Boot server |
| Same port (8080) | Same port (8080) |
| Same database | Same database |
| React on 3000 | React on 3000 |

**Everything else stays the same!**

---

## 🎉 You're Done!

Once you see:
- ✅ Spring Boot running on port 8080
- ✅ React running on port 3000
- ✅ Can create inspection calls

**You're all set!** The Node.js server is no longer needed.

---

## 📚 More Information

- **Quick Guide:** `QUICK_MIGRATION_GUIDE.md`
- **Detailed Guide:** `MIGRATION_TO_SPRING_BOOT.md`
- **API Examples:** `RITES-SARTHI-BACKEND-main/API_TEST_EXAMPLES.md`

---

## 🔄 To Go Back to Node.js

If something goes wrong:

```powershell
# Stop Spring Boot (Ctrl+C)

# Start Node.js
cd RITES-ERC-main/server
npm start
```

