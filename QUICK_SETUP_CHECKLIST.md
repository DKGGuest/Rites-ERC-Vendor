# Quick Setup Checklist - Connect Database to Application

## ✅ Step-by-Step Checklist

### 1️⃣ Database Setup (Already Done ✅)
- [x] MySQL Workbench installed
- [x] Database `rites_erc_inspection` created
- [x] All 10 tables imported
- [x] IC number sequences initialized

---

### 2️⃣ Frontend Configuration (React)

**File**: `.env` (root directory)

**Action**: Open `.env` and update this line:
```env
DB_PASSWORD=your_mysql_password
```

**Example**:
```env
# If your MySQL root password is "admin123"
DB_PASSWORD=admin123
```

**Restart Frontend**:
```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm start
```

✅ **Done!** Frontend is now configured.

---

### 3️⃣ Backend Configuration (Spring Boot)

**File**: `database/backend-config/application.properties`

**Action 1**: Copy this file to your Spring Boot project:
```
FROM: database/backend-config/application.properties
TO:   your-spring-boot-project/src/main/resources/application.properties
```

**Action 2**: Open the copied file and update this line:
```properties
spring.datasource.password=your_mysql_password
```

**Example**:
```properties
# If your MySQL root password is "admin123"
spring.datasource.password=admin123
```

**Start Backend**:
```bash
# Navigate to your Spring Boot project
cd your-spring-boot-project

# Run the application
mvn spring-boot:run
# or
./mvnw spring-boot:run
```

✅ **Done!** Backend is now configured.

---

### 4️⃣ Verify Everything Works

#### Test 1: Check Backend is Running
Open browser: `http://localhost:8080`

**Expected**: Backend server is running (may show error page, that's OK)

#### Test 2: Check Frontend is Running
Open browser: `http://localhost:3000`

**Expected**: React application loads

#### Test 3: Check Database Connection
Look at Spring Boot console output:

**Expected to see**:
```
HikariPool-1 - Starting...
HikariPool-1 - Start completed.
Hibernate: ...
Started Application in X.XXX seconds
```

✅ **Success!** Everything is connected.

---

## 📁 Files You Need to Update

| File | Location | What to Update |
|------|----------|----------------|
| `.env` | Root directory | `DB_PASSWORD=your_mysql_password` |
| `application.properties` | Spring Boot `src/main/resources/` | `spring.datasource.password=your_mysql_password` |

---

## 🔑 Important Values

### Your MySQL Settings
```
Host: localhost
Port: 3306
Database: rites_erc_inspection
Username: root
Password: [YOUR PASSWORD HERE]
```

### API Endpoints
```
Frontend: http://localhost:3000
Backend:  http://localhost:8080
API Base: http://localhost:8080/api
```

---

## 🧪 Quick Test

### Test API Connection

**Option 1: Browser**
```
http://localhost:8080/api/health
```

**Option 2: Command Line**
```bash
curl http://localhost:8080/api/health
```

**Expected Response**: JSON response or 404 (means backend is running)

---

## 🚨 Common Issues & Solutions

### Issue 1: "Access Denied for User 'root'"
**Solution**: Wrong password in `application.properties`
```properties
# Update with correct password:
spring.datasource.password=your_correct_password
```

### Issue 2: "CORS Error" in Browser
**Solution**: Backend not running or wrong URL in `.env`
```env
# Check this is correct:
REACT_APP_API_BASE_URL=http://localhost:8080/api
```

### Issue 3: "Connection Refused"
**Solution**: Backend not started
```bash
# Start backend:
mvn spring-boot:run
```

### Issue 4: "Table doesn't exist"
**Solution**: Database not imported
```bash
# Re-import database:
mysql -u root -p rites_erc_inspection < database/rites_erc_inspection_dump.sql
```

---

## 📋 Final Checklist

Before testing the application:

- [ ] MySQL Server is running
- [ ] Database `rites_erc_inspection` exists with 10 tables
- [ ] `.env` file updated with MySQL password
- [ ] `application.properties` copied to Spring Boot project
- [ ] `application.properties` updated with MySQL password
- [ ] Backend Spring Boot is running on port 8080
- [ ] Frontend React is running on port 3000
- [ ] No errors in Spring Boot console
- [ ] No errors in browser console

---

## 🎯 What's Next?

After setup is complete:

1. ✅ **Test Inspection Call Form** - Try creating a Raw Material IC
2. ✅ **Check Database** - Verify record is saved in MySQL
3. ✅ **Implement Backend APIs** - Follow `API_IMPLEMENTATION_GUIDE.md`
4. ✅ **Test Complete Workflow** - RM → Process → Final
5. ✅ **Deploy to Azure** - Use production configuration

---

## 📞 Need Help?

**Detailed Guides**:
- `ENVIRONMENT_SETUP_GUIDE.md` - Complete environment setup
- `database/MYSQL_WORKBENCH_IMPORT_GUIDE.md` - Database import steps
- `database/API_IMPLEMENTATION_GUIDE.md` - Backend API implementation

**Quick Commands**:
```bash
# Check MySQL is running
mysql -u root -p -e "SHOW DATABASES;"

# Check if database exists
mysql -u root -p -e "USE rites_erc_inspection; SHOW TABLES;"

# Restart React
npm start

# Restart Spring Boot
mvn spring-boot:run
```

---

## ✅ Summary

**What You Have**:
- ✅ Database created and imported
- ✅ `.env` file for React frontend
- ✅ `application.properties` for Spring Boot backend
- ✅ Complete configuration guides

**What You Need to Do**:
1. Update MySQL password in `.env`
2. Copy and update `application.properties` in Spring Boot project
3. Start both applications
4. Test the connection

**Time Required**: 5-10 minutes

---

**Ready? Update your passwords and start the applications!** 🚀

