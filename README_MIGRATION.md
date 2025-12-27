# 🚀 RITES ERC Inspection System - Backend Migration

## 📢 Important Notice

**Your system is ready to migrate from Node.js to Spring Boot backend!**

---

## 🎯 Quick Start (3 Simple Steps)

### 1️⃣ Run the Migration Script

**Right-click and select "Run with PowerShell":**
```
stop-node-start-springboot.ps1
```

### 2️⃣ Initialize Database (One-time)

**Import the SQL file into Azure MySQL:**
```
database-init.sql
```

### 3️⃣ Start React App

```powershell
npm start
```

**Done! ✅**

---

## 📚 Documentation Files

| File | Description | When to Use |
|------|-------------|-------------|
| **START_HERE.md** | 👈 **Start with this!** | First time migration |
| QUICK_MIGRATION_GUIDE.md | Quick reference guide | Quick lookup |
| MIGRATION_TO_SPRING_BOOT.md | Detailed documentation | Troubleshooting |
| MIGRATION_COMPLETE_SUMMARY.md | What was changed | Understanding changes |
| database-init.sql | Database setup script | Database initialization |

---

## 🛠️ Scripts Available

| Script | Purpose | How to Run |
|--------|---------|------------|
| `stop-node-start-springboot.ps1` | Automated migration | Right-click → Run with PowerShell |
| `stop-node-start-springboot.bat` | Automated migration | Double-click |

---

## 🏗️ System Architecture

### Before (Node.js)
```
React (3000) → Node.js (8080) → Azure MySQL
```

### After (Spring Boot)
```
React (3000) → Spring Boot (8080) → Azure MySQL
```

**Same ports, same database, better backend!**

---

## ✅ What's Already Done

- ✅ Spring Boot backend fully implemented
- ✅ Azure MySQL connection configured
- ✅ IC number generation service ready
- ✅ All inspection call APIs implemented
- ✅ CORS configured for React frontend
- ✅ Migration scripts created
- ✅ Database initialization scripts ready

---

## 🎯 What You Need to Do

1. **Stop Node.js server** (script does this automatically)
2. **Start Spring Boot backend** (script does this automatically)
3. **Initialize database** (run `database-init.sql` once)
4. **Test the application** (create inspection calls)

---

## 📊 API Endpoints

### Spring Boot Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/vendor/inspection-calls/rm` | Create RM Inspection Call |
| POST | `/api/vendor/inspection-calls/process` | Create Process Inspection Call |
| POST | `/api/vendor/inspection-calls/final` | Create Final Inspection Call |
| GET | `/api/vendor/inspection-calls` | Get all inspection calls |
| GET | `/api/vendor/inspection-calls/{icNumber}` | Get specific inspection call |
| GET | `/api/vendor/inspection-calls/rm/approved` | Get approved RM calls |
| GET | `/api/vendor/inspection-calls/process/approved` | Get approved Process calls |

---

## 🔧 Configuration

### Spring Boot
**File:** `RITES-SARTHI-BACKEND-main/src/main/resources/application.properties`

```properties
# Azure MySQL (Already configured)
spring.datasource.url=jdbc:mysql://sarthibackenddb.mysql.database.azure.com:3306/sarthidb
spring.datasource.username=DkgSarthi
spring.datasource.password=Test@123

# Server
server.servlet.context-path=/
server.port=8080
```

### React
**File:** `src/services/apiConfig.js`

```javascript
// API base URL
const BASE_URLS = {
  development: 'http://localhost:8080/api/vendor'
};
```

---

## 🧪 Testing

### 1. Health Check
```
http://localhost:8080/actuator/health
```
Expected: `{"status":"UP"}`

### 2. Create RM Inspection Call
```bash
curl -X POST http://localhost:8080/api/vendor/inspection-calls/rm \
  -H "Content-Type: application/json" \
  -d '{
    "vendorCode": "V001",
    "itemDescription": "Steel Bars",
    "quantity": 1000,
    "uom": "MT"
  }'
```

### 3. Get All Inspection Calls
```
http://localhost:8080/api/vendor/inspection-calls
```

---

## 🐛 Common Issues & Solutions

### Issue 1: Port 8080 already in use
```powershell
# Kill Node.js process
taskkill /IM node.exe /F
```

### Issue 2: Maven not found
- Install Maven: https://maven.apache.org/download.cgi
- Add to PATH
- Restart terminal

### Issue 3: Database connection failed
- Check Azure MySQL firewall rules
- Add your IP address
- Verify credentials

### Issue 4: CORS errors
- Clear browser cache
- Verify Spring Boot is running
- Check `CorsConfig.java`

---

## 📁 Project Structure

```
RITES-ERC-main/
├── START_HERE.md                    ← Start with this!
├── QUICK_MIGRATION_GUIDE.md
├── MIGRATION_TO_SPRING_BOOT.md
├── MIGRATION_COMPLETE_SUMMARY.md
├── database-init.sql
├── stop-node-start-springboot.ps1
├── stop-node-start-springboot.bat
├── src/                             ← React frontend
└── server/                          ← Old Node.js (can be removed later)

RITES-SARTHI-BACKEND-main/
└── RITES-SARTHI-BACKEND-main/
    ├── src/main/java/               ← Spring Boot code
    ├── src/main/resources/          ← Configuration
    └── pom.xml                      ← Maven dependencies
```

---

## 🎉 Success Indicators

- ✅ Spring Boot console shows: "Started SarthiBackendApplication"
- ✅ Health check returns: `{"status":"UP"}`
- ✅ React app loads without errors
- ✅ Can create inspection calls
- ✅ Data appears in Azure MySQL

---

## 🔄 Rollback

If needed, go back to Node.js:

```powershell
# Stop Spring Boot (Ctrl+C)

# Start Node.js
cd server
npm start
```

---

## 📞 Need Help?

1. Read `START_HERE.md` for step-by-step instructions
2. Check `MIGRATION_TO_SPRING_BOOT.md` for detailed guide
3. Review troubleshooting section above
4. Check Spring Boot logs in terminal
5. Verify database connection in Azure Portal

---

## 🚀 Ready to Migrate?

**Open this file and follow the steps:**
```
START_HERE.md
```

**Good luck! 🎉**

