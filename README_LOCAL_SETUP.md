# 🚀 Quick Start - Local MySQL Setup

## 📌 You're Using Local MySQL!

The Spring Boot backend is now configured to use **local MySQL Workbench** instead of Azure MySQL.

---

## ⚡ Super Quick Start (3 Steps)

### Step 1: Setup MySQL Database

1. **Open MySQL Workbench**
2. **Connect to localhost** (user: `root`, password: `root`)
3. **Run this file:** `local-mysql-setup.sql`
   - Click **File → Open SQL Script**
   - Select `local-mysql-setup.sql`
   - Click **Execute** (⚡ lightning icon)

**Expected:** You'll see "✅ Database Created: sarthidb"

### Step 2: Start Spring Boot

**Double-click this file:**
```
start-local-development.ps1
```

Or run manually:
```powershell
cd RITES-SARTHI-BACKEND-main\RITES-SARTHI-BACKEND-main
mvn spring-boot:run
```

**Wait for:** "Started SarthiBackendApplication"

### Step 3: Start React

Open a **new terminal**:
```powershell
cd RITES-ERC-main
npm start
```

**Done! ✅** Open http://localhost:3000

---

## 🔍 Quick Checks

### Is MySQL Running?

Double-click: `check-mysql-status.bat`

Or check manually:
```powershell
sc query MySQL80
```

### Is Spring Boot Running?

Open: http://localhost:8080/actuator/health

Should show: `{"status":"UP"}`

### Is Database Setup?

In MySQL Workbench, run:
```sql
USE sarthidb;
SELECT * FROM ic_number_sequences;
```

Should show 3 rows (Raw Material, Process, Final)

---

## 📊 Current Configuration

| Component | Location |
|-----------|----------|
| MySQL Server | localhost:3306 |
| Database | sarthidb |
| Username | root |
| Password | root |
| Spring Boot | localhost:8080 |
| React App | localhost:3000 |

---

## 🐛 Common Issues

### MySQL not running?
```powershell
net start MySQL80
```

### Wrong MySQL password?
Update in: `RITES-SARTHI-BACKEND-main/src/main/resources/application.properties`
```properties
spring.datasource.password=YOUR_PASSWORD
```

### Port 8080 busy?
```powershell
taskkill /IM node.exe /F
```

### Database not found?
Run `local-mysql-setup.sql` in MySQL Workbench

---

## 📚 Detailed Guides

- **`LOCAL_MYSQL_SETUP.md`** - Complete local setup guide
- **`START_HERE.md`** - General migration guide
- **`MIGRATION_TO_SPRING_BOOT.md`** - Detailed documentation

---

## 🔄 Switch to Azure Later

When Azure is ready, update `application.properties`:

```properties
# Comment out local MySQL
#spring.datasource.url=jdbc:mysql://localhost:3306/sarthidb
#spring.datasource.username=root
#spring.datasource.password=root

# Uncomment Azure MySQL
spring.datasource.url=jdbc:mysql://sarthibackenddb.mysql.database.azure.com:3306/sarthidb?useSSL=true
spring.datasource.username=DkgSarthi
spring.datasource.password=Test@123
```

---

## ✅ Success Checklist

- [ ] MySQL Server running
- [ ] Database `sarthidb` created
- [ ] Table `ic_number_sequences` has 3 rows
- [ ] Spring Boot started (port 8080)
- [ ] Health check works
- [ ] React app running (port 3000)
- [ ] Can create inspection calls

---

## 🎯 Test It!

1. Open React app: http://localhost:3000
2. Go to Vendor Dashboard
3. Create a Raw Material Inspection Call
4. Should get IC Number: `RM-IC-2025-0001`
5. Check in MySQL Workbench:
   ```sql
   SELECT * FROM ic_number_sequences;
   ```
   Should show `current_sequence = 1`

---

## 🎉 You're All Set!

Everything is configured for local development. Start building! 🚀

