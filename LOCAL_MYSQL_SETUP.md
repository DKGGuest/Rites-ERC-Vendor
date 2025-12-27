# 🚀 Local MySQL Setup Guide

## Overview

This guide will help you set up the RITES ERC Inspection System with **local MySQL Workbench** instead of Azure MySQL.

---

## 📋 Prerequisites

- ✅ MySQL Workbench installed
- ✅ MySQL Server running on localhost:3306
- ✅ MySQL root password (default: `root`)

---

## ⚡ Quick Setup (3 Steps)

### Step 1: Setup Local MySQL Database

1. **Open MySQL Workbench**
2. **Connect to Local MySQL Server**
   - Host: `localhost`
   - Port: `3306`
   - Username: `root`
   - Password: `root` (or your MySQL root password)

3. **Run the Setup Script**
   - Open file: `local-mysql-setup.sql`
   - Click **Execute** (⚡ lightning icon)
   - Wait for "✅ Database Created" message

**Expected Output:**
```
✅ Database Created: sarthidb
✅ IC Sequences Table Created with 3 sequences

Type          | Prefix    | Year | Sequence | Last IC Number
Raw Material  | RM-IC     | 2025 | 0        | NULL
Process       | PROC-IC   | 2025 | 0        | NULL
Final         | FINAL-IC  | 2025 | 0        | NULL
```

### Step 2: Verify Spring Boot Configuration

The Spring Boot backend is already configured for local MySQL!

**File:** `RITES-SARTHI-BACKEND-main/src/main/resources/application.properties`

```properties
# LOCAL MySQL (ACTIVE)
spring.datasource.url=jdbc:mysql://localhost:3306/sarthidb
spring.datasource.username=root
spring.datasource.password=root
```

**Note:** If your MySQL root password is different, update it in `application.properties`

### Step 3: Start Everything

#### A. Stop Node.js Server (if running)

```powershell
# Find process on port 8080
netstat -ano | findstr :8080

# Kill it (replace <PID> with actual number)
taskkill /PID <PID> /F
```

#### B. Start Spring Boot Backend

```powershell
cd RITES-SARTHI-BACKEND-main\RITES-SARTHI-BACKEND-main
mvn spring-boot:run
```

**Wait for:**
```
Started SarthiBackendApplication in X.XXX seconds
```

#### C. Verify Backend is Running

Open browser: http://localhost:8080/actuator/health

**Expected:**
```json
{"status":"UP"}
```

#### D. Start React Frontend

Open a **new terminal**:

```powershell
cd RITES-ERC-main
npm start
```

React will open at: http://localhost:3000

---

## ✅ Verification Checklist

- [ ] MySQL Server running on localhost:3306
- [ ] Database `sarthidb` created
- [ ] Table `ic_number_sequences` created with 3 rows
- [ ] Spring Boot running on port 8080
- [ ] Health check returns `{"status":"UP"}`
- [ ] React app running on port 3000
- [ ] Can create inspection calls from UI

---

## 🧪 Test the System

### Test 1: Create Raw Material Inspection Call

1. Open React app: http://localhost:3000
2. Navigate to **Vendor Dashboard**
3. Click **Create RM Inspection Call**
4. Fill in the form:
   - Vendor Code: `V001`
   - Item Description: `Steel Bars`
   - Quantity: `1000`
   - UOM: `MT`
5. Click **Submit**

**Expected:**
- ✅ IC Number generated: `RM-IC-2025-0001`
- ✅ Success message displayed
- ✅ Data saved to local MySQL

### Test 2: Verify in MySQL Workbench

Run this query in MySQL Workbench:

```sql
USE sarthidb;

-- Check IC sequences
SELECT * FROM ic_number_sequences;

-- Check inspection calls (if table exists)
SELECT * FROM inspection_calls ORDER BY created_at DESC LIMIT 5;
```

**Expected:**
- ✅ `current_sequence` incremented to 1
- ✅ `last_generated_ic` shows `RM-IC-2025-0001`

---

## 🔧 Configuration Details

### Local MySQL Connection

| Parameter | Value |
|-----------|-------|
| Host | localhost |
| Port | 3306 |
| Database | sarthidb |
| Username | root |
| Password | root |
| URL | jdbc:mysql://localhost:3306/sarthidb |

### Spring Boot Settings

```properties
# Database
spring.datasource.url=jdbc:mysql://localhost:3306/sarthidb?useSSL=false&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=root
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# JPA/Hibernate
spring.jpa.hibernate.ddl-auto=validate
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQLDialect

# Server
server.port=8080
server.servlet.context-path=/
```

---

## 🐛 Troubleshooting

### Problem 1: MySQL Server not running

**Error:**
```
Communications link failure
```

**Solution:**
1. Open **Services** (Windows + R → `services.msc`)
2. Find **MySQL** service
3. Right-click → **Start**

Or start from command line:
```powershell
net start MySQL80
```

### Problem 2: Access denied for user 'root'

**Error:**
```
Access denied for user 'root'@'localhost'
```

**Solution:**
Update password in `application.properties`:
```properties
spring.datasource.password=YOUR_ACTUAL_PASSWORD
```

### Problem 3: Database 'sarthidb' doesn't exist

**Solution:**
Run `local-mysql-setup.sql` in MySQL Workbench

### Problem 4: Port 8080 already in use

**Solution:**
```powershell
# Kill Node.js
taskkill /IM node.exe /F

# Or kill specific process
netstat -ano | findstr :8080
taskkill /PID <PID> /F
```

### Problem 5: Table 'ic_number_sequences' doesn't exist

**Solution:**
Run this in MySQL Workbench:
```sql
USE sarthidb;
SOURCE local-mysql-setup.sql;
```

---

## 🔄 Switch to Azure MySQL Later

When Azure is ready, just update `application.properties`:

```properties
# Comment out local MySQL
#spring.datasource.url=jdbc:mysql://localhost:3306/sarthidb
#spring.datasource.username=root
#spring.datasource.password=root

# Uncomment Azure MySQL
spring.datasource.url=jdbc:mysql://sarthibackenddb.mysql.database.azure.com:3306/sarthidb?useSSL=true&requireSSL=true
spring.datasource.username=DkgSarthi
spring.datasource.password=Test@123
```

Then run `database-init.sql` on Azure MySQL.

---

## 📊 System Architecture (Local)

```
┌─────────────────┐
│  React Frontend │
│  localhost:3000 │
└────────┬────────┘
         │ HTTP
         ▼
┌─────────────────────┐
│  Spring Boot API    │
│  localhost:8080     │
└────────┬────────────┘
         │ JDBC
         ▼
┌─────────────────────┐
│  Local MySQL        │
│  localhost:3306     │
│  Database: sarthidb │
└─────────────────────┘
```

---

## 🎯 Quick Commands Reference

### Start MySQL Server
```powershell
net start MySQL80
```

### Stop MySQL Server
```powershell
net stop MySQL80
```

### Connect to MySQL
```powershell
mysql -u root -p
```

### Start Spring Boot
```powershell
cd RITES-SARTHI-BACKEND-main\RITES-SARTHI-BACKEND-main
mvn spring-boot:run
```

### Start React
```powershell
cd RITES-ERC-main
npm start
```

---

## ✨ Benefits of Local MySQL

- ✅ No internet required
- ✅ Faster development
- ✅ Easy to reset/test
- ✅ No Azure costs during development
- ✅ Full control over database

---

## 🎉 You're Ready!

Once you see:
- ✅ MySQL Server running
- ✅ Database `sarthidb` created
- ✅ Spring Boot started successfully
- ✅ React app loaded

**Start testing your inspection calls!** 🚀

