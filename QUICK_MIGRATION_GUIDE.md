# Quick Migration Guide: Switch to Spring Boot Backend

## 🎯 Goal
Stop using Node.js server and switch to Spring Boot backend with Azure MySQL database.

## ⚡ Quick Start (3 Steps)

### Step 1: Run the Migration Script

Double-click this file:
```
RITES-ERC-main/stop-node-start-springboot.bat
```

This script will:
- ✅ Stop Node.js server automatically
- ✅ Navigate to Spring Boot project
- ✅ Start Spring Boot backend

### Step 2: Initialize Database (One-time only)

Open Azure MySQL Workbench or any MySQL client and run:

```sql
-- Connect to: sarthibackenddb.mysql.database.azure.com
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

-- Verify
SELECT * FROM ic_number_sequences;
```

### Step 3: Start React App

Open a new terminal and run:

```powershell
cd RITES-ERC-main
npm start
```

## ✅ Verification

1. **Spring Boot Backend:** http://localhost:8080/actuator/health
   - Should show: `{"status":"UP"}`

2. **React Frontend:** http://localhost:3000
   - Should load the application

3. **Test API:** Create an inspection call from the UI
   - Data should save to Azure MySQL

## 🔧 Manual Steps (If script doesn't work)

### Stop Node.js Server

```powershell
# Find process on port 8080
netstat -ano | findstr :8080

# Kill the process (replace <PID> with actual number)
taskkill /PID <PID> /F
```

### Start Spring Boot

```powershell
cd RITES-SARTHI-BACKEND-main\RITES-SARTHI-BACKEND-main
mvn spring-boot:run
```

## 📊 What Changed?

| Component | Before (Node.js) | After (Spring Boot) |
|-----------|------------------|---------------------|
| Backend Server | Node.js + Express | Spring Boot + Java |
| Port | 8080 | 8080 (same) |
| Database | Azure MySQL | Azure MySQL (same) |
| API Base URL | `/api` | `/api/vendor` |
| Frontend | React (localhost:3000) | React (localhost:3000) |

## 🎯 API Endpoints

### Spring Boot Endpoints

```
POST   /api/vendor/inspection-calls/rm
POST   /api/vendor/inspection-calls/process
POST   /api/vendor/inspection-calls/final
GET    /api/vendor/inspection-calls
GET    /api/vendor/inspection-calls/{icNumber}
GET    /api/vendor/inspection-calls/rm/approved
GET    /api/vendor/inspection-calls/process/approved
GET    /api/vendor/inspection-calls/rm/{rmIcNumber}/heats
```

## 🐛 Troubleshooting

### Problem: Port 8080 already in use
**Solution:**
```powershell
# Kill all Node.js processes
taskkill /IM node.exe /F

# Or kill specific process
netstat -ano | findstr :8080
taskkill /PID <PID> /F
```

### Problem: Maven not found
**Solution:**
1. Install Maven from https://maven.apache.org/download.cgi
2. Add Maven to PATH
3. Restart terminal

### Problem: Database connection failed
**Solution:**
1. Check Azure MySQL firewall rules
2. Add your IP address to allowed IPs
3. Verify credentials in `application.properties`

### Problem: CORS errors in browser
**Solution:**
- Spring Boot has CORS configured for `http://localhost:3000`
- Clear browser cache and reload

## 📝 Configuration Files

### Spring Boot Configuration
**File:** `RITES-SARTHI-BACKEND-main/src/main/resources/application.properties`

```properties
# Already configured for Azure MySQL
spring.datasource.url=jdbc:mysql://sarthibackenddb.mysql.database.azure.com:3306/sarthidb
spring.datasource.username=DkgSarthi
spring.datasource.password=Test@123
server.servlet.context-path=/
```

### React API Configuration
**File:** `RITES-ERC-main/src/services/apiConfig.js`

```javascript
// API base URL points to Spring Boot
const BASE_URLS = {
  development: 'http://localhost:8080/api/vendor'
};
```

## 🎉 Success Indicators

- ✅ Spring Boot console shows: "Started SarthiBackendApplication"
- ✅ Health check returns: `{"status":"UP"}`
- ✅ React app loads without errors
- ✅ Can create inspection calls
- ✅ Data appears in Azure MySQL database

## 🔄 To Go Back to Node.js (Rollback)

If you need to switch back:

```powershell
# Stop Spring Boot (Ctrl+C in terminal)

# Start Node.js server
cd RITES-ERC-main/server
npm start
```

## 📞 Need Help?

Check these files for detailed information:
- `MIGRATION_TO_SPRING_BOOT.md` - Complete migration guide
- `RITES-SARTHI-BACKEND-main/MIGRATION_SUMMARY.md` - Backend details
- `RITES-SARTHI-BACKEND-main/API_TEST_EXAMPLES.md` - API testing examples

## 🚀 Next Steps

After successful migration:
1. ✅ Test all inspection call types (RM, Process, Final)
2. ✅ Verify data in Azure MySQL
3. ✅ Remove Node.js server folder (optional)
4. ✅ Update deployment scripts for Spring Boot

