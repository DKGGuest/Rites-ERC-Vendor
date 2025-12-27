# Migration Guide: Node.js to Spring Boot Backend

## 🎯 Overview

This guide will help you migrate from the Node.js backend to the Spring Boot backend for the RITES ERC Inspection System.

## 📋 Prerequisites

- ✅ Azure MySQL database is already configured
- ✅ Spring Boot backend code is ready in `RITES-SARTHI-BACKEND-main`
- ✅ React frontend is in `RITES-ERC-main`

## 🚀 Step-by-Step Migration

### Step 1: Stop the Node.js Server

#### Option A: If running in terminal
1. Find the terminal running the Node.js server
2. Press `Ctrl + C` to stop it

#### Option B: If running as a background process
```powershell
# Find the process using port 8080
netstat -ano | findstr :8080

# Kill the process (replace PID with the actual process ID)
taskkill /PID <PID> /F
```

#### Option C: Kill all Node.js processes (use with caution)
```powershell
taskkill /IM node.exe /F
```

### Step 2: Initialize IC Number Sequences in Azure MySQL

Run the initialization script in your Azure MySQL database:

```sql
-- Connect to your Azure MySQL database
-- Database: sarthidb
-- Server: sarthibackenddb.mysql.database.azure.com

-- Run this script:
USE sarthidb;

-- Create IC number sequences table
CREATE TABLE IF NOT EXISTS ic_number_sequences (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type_of_call VARCHAR(50) NOT NULL UNIQUE,
    prefix VARCHAR(20) NOT NULL,
    current_year INT NOT NULL,
    current_sequence INT NOT NULL DEFAULT 0,
    last_generated_ic VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert initial sequences
INSERT INTO ic_number_sequences (type_of_call, prefix, current_year, current_sequence, last_generated_ic)
VALUES 
    ('Raw Material', 'RM-IC', YEAR(CURDATE()), 0, NULL),
    ('Process', 'PROC-IC', YEAR(CURDATE()), 0, NULL),
    ('Final', 'FINAL-IC', YEAR(CURDATE()), 0, NULL)
ON DUPLICATE KEY UPDATE type_of_call = type_of_call;

-- Create index
CREATE INDEX idx_ic_sequences_type ON ic_number_sequences(type_of_call);

-- Verify
SELECT * FROM ic_number_sequences;
```

### Step 3: Configure Spring Boot Backend

The Spring Boot backend is already configured for Azure MySQL. Verify the configuration:

**File:** `RITES-SARTHI-BACKEND-main/src/main/resources/application.properties`

```properties
# Azure MySQL Connection (Already configured)
spring.datasource.url=jdbc:mysql://sarthibackenddb.mysql.database.azure.com:3306/sarthidb?useSSL=true&requireSSL=true&allowPublicKeyRetrieval=true&serverTimezone=UTC
spring.datasource.username=DkgSarthi
spring.datasource.password=Test@123

# Context path changed to root
server.servlet.context-path=/
```

### Step 4: Update React Frontend API Configuration

Update the React app to point to Spring Boot backend:

**File:** `RITES-ERC-main/src/services/apiConfig.js`

Change line 17:
```javascript
// OLD (Node.js)
[ENV.DEVELOPMENT]: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api',

// NEW (Spring Boot)
[ENV.DEVELOPMENT]: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api/vendor',
```

### Step 5: Update API Endpoints in React

Update the inspection call endpoints:

**File:** `RITES-ERC-main/src/services/apiConfig.js`

```javascript
INSPECTION_CALLS: {
  // Raw Material Inspection
  CREATE_RM: '/inspection-calls/rm',  // Changed from /raw-material
  GET_RM_APPROVED: '/inspection-calls/rm/approved',
  GET_RM_HEAT_NUMBERS: '/inspection-calls/rm/:rmIcNumber/heats',

  // Process Inspection
  CREATE_PROCESS: '/inspection-calls/process',
  GET_PROCESS_APPROVED: '/inspection-calls/process/approved',

  // Final Inspection
  CREATE_FINAL: '/inspection-calls/final',

  // Common
  GET_ALL: '/inspection-calls',
  GET_BY_IC_NUMBER: '/inspection-calls/:icNumber'
}
```

### Step 6: Start Spring Boot Backend

Navigate to the Spring Boot project and start it:

```powershell
cd "RITES-SARTHI-BACKEND-main\RITES-SARTHI-BACKEND-main"

# Option 1: Using Maven
mvn spring-boot:run

# Option 2: Using Maven Wrapper (if available)
.\mvnw spring-boot:run

# Option 3: Build and run JAR
mvn clean package
java -jar target\sarthi-backend-0.0.1-SNAPSHOT.jar
```

**Expected Output:**
```
🚀 RITES SARTHI Backend Started
📡 Server running on: http://localhost:8080
💚 Health Check: http://localhost:8080/actuator/health
📊 Database: sarthidb (Azure MySQL)
```

### Step 7: Verify Spring Boot is Running

Test the health endpoint:

```powershell
# Using curl
curl http://localhost:8080/actuator/health

# Or open in browser
# http://localhost:8080/actuator/health
```

Expected response:
```json
{
  "status": "UP"
}
```

### Step 8: Start React Frontend

In a new terminal:

```powershell
cd RITES-ERC-main
npm start
```

The React app will start on `http://localhost:3000`

### Step 9: Test the Integration

1. **Open React App:** http://localhost:3000
2. **Navigate to Vendor Dashboard**
3. **Try creating an inspection call**
4. **Verify data is saved in Azure MySQL**

## 🔍 Verification Checklist

- [ ] Node.js server is stopped
- [ ] IC sequences table created in Azure MySQL
- [ ] Spring Boot backend is running on port 8080
- [ ] React frontend is running on port 3000
- [ ] Can create RM Inspection Call
- [ ] Can create Process Inspection Call
- [ ] Can create Final Inspection Call
- [ ] Data is saved in Azure MySQL database

## 🐛 Troubleshooting

### Issue 1: Port 8080 already in use
**Solution:** Kill the Node.js process
```powershell
netstat -ano | findstr :8080
taskkill /PID <PID> /F
```

### Issue 2: Spring Boot can't connect to Azure MySQL
**Solution:** Check firewall rules in Azure
- Go to Azure Portal
- Navigate to your MySQL server
- Add your IP address to firewall rules

### Issue 3: CORS errors in browser
**Solution:** Verify CORS configuration in Spring Boot
- Check `application.properties` has CORS settings
- Restart Spring Boot backend

### Issue 4: 404 Not Found errors
**Solution:** Verify API endpoints
- Spring Boot uses `/api/vendor/inspection-calls/*`
- Update React API config accordingly

## 📊 API Endpoint Mapping

| Node.js Endpoint | Spring Boot Endpoint |
|------------------|---------------------|
| `POST /api/inspection-calls/raw-material` | `POST /api/vendor/inspection-calls/rm` |
| `POST /api/inspection-calls/process` | `POST /api/vendor/inspection-calls/process` |
| `POST /api/inspection-calls/final` | `POST /api/vendor/inspection-calls/final` |
| `GET /api/inspection-calls` | `GET /api/vendor/inspection-calls` |
| `GET /api/inspection-calls/:icNumber` | `GET /api/vendor/inspection-calls/:icNumber` |

## 🎉 Success!

Once all steps are complete:
- ✅ Node.js server is stopped
- ✅ Spring Boot backend is running
- ✅ React app connects to Spring Boot
- ✅ All data is stored in Azure MySQL

## 📝 Next Steps

1. **Remove Node.js server folder** (optional, after confirming everything works)
2. **Update deployment scripts** to use Spring Boot
3. **Configure Azure App Service** for Spring Boot deployment
4. **Set up CI/CD pipeline** for automated deployments

## 🔄 Rollback Plan

If you need to go back to Node.js:

1. Stop Spring Boot backend
2. Start Node.js server:
   ```powershell
   cd RITES-ERC-main/server
   npm start
   ```
3. Revert React API config changes
4. Restart React app

