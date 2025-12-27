# 🎯 READ ME FIRST - RITES ERC Setup Guide

## 📢 Important: Local MySQL Setup

Your Spring Boot backend is configured to use **local MySQL Workbench** for development.

---

## 🚀 Quick Start (3 Simple Steps)

### ✅ Step 1: Setup MySQL Database

1. **Make sure MySQL Server is running**
   - Double-click: `check-mysql-status.bat`
   - If not running: `net start MySQL80`

2. **Open MySQL Workbench**
   - Connect to: `localhost:3306`
   - Username: `root`
   - Password: `root` (or your MySQL root password)

3. **Run the database setup script**
   - In MySQL Workbench: **File → Open SQL Script**
   - Select: `local-mysql-setup.sql`
   - Click: **Execute** (⚡ lightning icon)
   - Wait for: "✅ Database Created: sarthidb"

### ✅ Step 2: Start Spring Boot Backend

**Option A: Automated (Easiest)**
- Right-click: `start-local-development.ps1`
- Select: **"Run with PowerShell"**

**Option B: Manual**
```powershell
cd RITES-SARTHI-BACKEND-main\RITES-SARTHI-BACKEND-main
mvn spring-boot:run
```

**Wait for:** "Started SarthiBackendApplication in X.XXX seconds"

### ✅ Step 3: Start React Frontend

Open a **NEW terminal** (keep Spring Boot running):
```powershell
cd RITES-ERC-main
npm start
```

**React will open at:** http://localhost:3000

---

## 🎉 That's It!

You're now running:
- ✅ Local MySQL on port 3306
- ✅ Spring Boot on port 8080
- ✅ React on port 3000

---

## 🧪 Test Your Setup

1. **Open React app:** http://localhost:3000
2. **Go to Vendor Dashboard**
3. **Create a Raw Material Inspection Call**
4. **You should get IC Number:** `RM-IC-2025-0001`

---

## 📚 Documentation Files

| File | When to Use |
|------|-------------|
| **This file (00_READ_ME_FIRST.md)** | Start here! |
| **README_LOCAL_SETUP.md** | Quick local setup reference |
| **LOCAL_MYSQL_SETUP.md** | Detailed local MySQL guide |
| **SETUP_COMPLETE.md** | What was configured |
| START_HERE.md | General migration guide |
| MIGRATION_TO_SPRING_BOOT.md | Detailed documentation |

---

## 🔧 Helper Scripts

| Script | Purpose |
|--------|---------|
| `check-mysql-status.bat` | Check if MySQL is running |
| `start-local-development.ps1` | Start everything automatically |
| `local-mysql-setup.sql` | Database initialization |

---

## 🐛 Common Issues

### Issue 1: MySQL not running
```powershell
net start MySQL80
```

### Issue 2: Wrong MySQL password
If your MySQL root password is NOT "root", update it here:
- File: `RITES-SARTHI-BACKEND-main/src/main/resources/application.properties`
- Line 14: `spring.datasource.password=YOUR_PASSWORD`

### Issue 3: Port 8080 already in use
```powershell
# Kill Node.js server
taskkill /IM node.exe /F
```

### Issue 4: Database not found
Run `local-mysql-setup.sql` in MySQL Workbench

---

## ✅ Verification Checklist

- [ ] MySQL Server running (check with `check-mysql-status.bat`)
- [ ] Database `sarthidb` created
- [ ] Table `ic_number_sequences` has 3 rows
- [ ] Spring Boot started (shows "Started SarthiBackendApplication")
- [ ] Health check works: http://localhost:8080/actuator/health
- [ ] React app running on http://localhost:3000
- [ ] Can create inspection calls

---

## 📊 Your Setup

```
React (localhost:3000)
    ↓
Spring Boot (localhost:8080)
    ↓
Local MySQL (localhost:3306)
    ↓
Database: sarthidb
```

---

## 🔄 Switch to Azure MySQL Later

When Azure is ready, just update one file:

**File:** `RITES-SARTHI-BACKEND-main/src/main/resources/application.properties`

```properties
# Comment out local MySQL (add # at the start)
#spring.datasource.url=jdbc:mysql://localhost:3306/sarthidb
#spring.datasource.username=root
#spring.datasource.password=root

# Uncomment Azure MySQL (remove # at the start)
spring.datasource.url=jdbc:mysql://sarthibackenddb.mysql.database.azure.com:3306/sarthidb?useSSL=true
spring.datasource.username=DkgSarthi
spring.datasource.password=Test@123
```

Then run `database-init.sql` on Azure MySQL.

---

## 🎯 What's Configured

### Spring Boot Backend
- ✅ Configured for local MySQL
- ✅ IC number generation service ready
- ✅ All inspection call APIs implemented
- ✅ CORS enabled for React frontend
- ✅ Health check endpoint available

### Database
- ✅ Database name: `sarthidb`
- ✅ IC sequences table ready
- ✅ Auto-increment IC numbers
- ✅ Supports RM, Process, and Final inspection calls

### React Frontend
- ✅ API configured to point to Spring Boot
- ✅ All endpoints mapped correctly
- ✅ Ready to create inspection calls

---

## 🎉 Ready to Start!

Follow the 3 steps at the top of this file and you'll be up and running in minutes!

**Need help?** Check the detailed guides:
- `README_LOCAL_SETUP.md` - Quick reference
- `LOCAL_MYSQL_SETUP.md` - Detailed guide
- `SETUP_COMPLETE.md` - Configuration details

**Happy Coding! 🚀**

