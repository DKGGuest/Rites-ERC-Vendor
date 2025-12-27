# Environment Setup Guide - RITES ERC Inspection System

## 📋 Overview

This guide explains how to set up environment variables and configuration files to connect your React frontend and Spring Boot backend to the MySQL database.

---

## 🎯 Quick Setup (3 Steps)

### Step 1: Configure React Frontend (.env)
The `.env` file has been created in the root directory. Update it with your settings:

```bash
# Open .env file and update these values:
REACT_APP_API_BASE_URL=http://localhost:8080/api
DB_PASSWORD=your_mysql_password
```

### Step 2: Configure Spring Boot Backend (application.properties)
Copy the backend configuration file to your Spring Boot project:

```bash
# Copy from:
database/backend-config/application.properties

# To:
your-spring-boot-project/src/main/resources/application.properties

# Update this line:
spring.datasource.password=your_mysql_password
```

### Step 3: Restart Both Applications
```bash
# Frontend (React)
npm start

# Backend (Spring Boot)
mvn spring-boot:run
# or
./mvnw spring-boot:run
```

---

## 📁 Files Created

### 1. Frontend Configuration Files

#### `.env` (Root Directory)
**Location**: `RITES-ERC-main/.env`

**Purpose**: Environment variables for React application

**Key Variables**:
```env
REACT_APP_ENV=development
REACT_APP_API_BASE_URL=http://localhost:8080/api
DB_HOST=localhost
DB_PORT=3306
DB_NAME=rites_erc_inspection
DB_USER=root
DB_PASSWORD=your_mysql_password
```

**Important Notes**:
- ✅ All React environment variables MUST start with `REACT_APP_`
- ✅ After changing `.env`, restart the development server (`npm start`)
- ✅ This file is already in `.gitignore` (won't be committed to Git)

---

#### `.env.example` (Root Directory)
**Location**: `RITES-ERC-main/.env.example`

**Purpose**: Template file for team members

**Usage**:
```bash
# New team member can copy this file:
cp .env.example .env

# Then update with their local settings
```

---

### 2. Backend Configuration Files

#### `application.properties` (Local Development)
**Location**: `database/backend-config/application.properties`

**Purpose**: Spring Boot configuration for local MySQL

**Key Settings**:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/rites_erc_inspection
spring.datasource.username=root
spring.datasource.password=your_mysql_password
spring.jpa.hibernate.ddl-auto=none
server.port=8080
```

**Copy To**: `your-spring-boot-project/src/main/resources/application.properties`

---

#### `application-production.properties` (Azure Production)
**Location**: `database/backend-config/application-production.properties`

**Purpose**: Spring Boot configuration for Azure MySQL

**Key Settings**:
```properties
spring.datasource.url=jdbc:mysql://your-server.mysql.database.azure.com:3306/rites_erc_inspection?useSSL=true
spring.datasource.username=${AZURE_MYSQL_USERNAME}
spring.datasource.password=${AZURE_MYSQL_PASSWORD}
```

**Activate With**:
```bash
java -jar app.jar --spring.profiles.active=production
```

---

## 🔧 Detailed Configuration

### React Frontend (.env)

#### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `REACT_APP_ENV` | Environment name | `development` |
| `REACT_APP_API_BASE_URL` | Backend API URL | `http://localhost:8080/api` |

#### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `REACT_APP_API_TIMEOUT` | API timeout (ms) | `30000` |
| `REACT_APP_ENABLE_DEBUG_MODE` | Enable debug logs | `true` |
| `REACT_APP_ENABLE_MOCK_DATA` | Use mock data | `false` |

#### Database Reference Variables (Not Used by React)

These are included for reference only:

```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=rites_erc_inspection
DB_USER=root
DB_PASSWORD=your_mysql_password
```

---

### Spring Boot Backend (application.properties)

#### Database Connection

```properties
# Local MySQL
spring.datasource.url=jdbc:mysql://localhost:3306/rites_erc_inspection?useSSL=false&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=your_mysql_password
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
```

#### JPA/Hibernate Settings

```properties
# Don't auto-create tables (we already have the schema)
spring.jpa.hibernate.ddl-auto=none

# Show SQL queries in console (development only)
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true

# MySQL 8 dialect
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL8Dialect
```

#### CORS Configuration

```properties
# Allow React frontend to access the API
cors.allowed.origins=http://localhost:3000
cors.allowed.methods=GET,POST,PUT,DELETE,PATCH,OPTIONS
cors.allowed.headers=*
cors.allow.credentials=true
```

---

## 🌐 Azure Production Setup

### Frontend (.env for Production)

```env
REACT_APP_ENV=production
REACT_APP_API_PROD_URL=https://your-api.azurewebsites.net/api
```

### Backend (Azure App Service Configuration)

Set these environment variables in Azure Portal:

1. Go to **Azure Portal** → **App Service** → **Configuration**
2. Add these **Application Settings**:

| Name | Value |
|------|-------|
| `AZURE_MYSQL_USERNAME` | `your-username@your-server` |
| `AZURE_MYSQL_PASSWORD` | `your-password` |
| `FRONTEND_URL` | `https://your-frontend.azurewebsites.net` |
| `SPRING_PROFILES_ACTIVE` | `production` |

3. Click **Save**

---

## ✅ Verification Steps

### 1. Verify React Frontend Configuration

```bash
# Start React app
npm start

# Check console for:
# - No CORS errors
# - API calls going to correct URL
```

### 2. Verify Spring Boot Backend Configuration

```bash
# Start Spring Boot app
mvn spring-boot:run

# Check console for:
# - Database connection successful
# - Hibernate initialized
# - Server started on port 8080
```

### 3. Test Database Connection

```bash
# In Spring Boot console, you should see:
HikariPool-1 - Starting...
HikariPool-1 - Start completed.
```

### 4. Test API Endpoint

```bash
# Test health endpoint
curl http://localhost:8080/api/health

# Or open in browser:
http://localhost:8080/api/health
```

---

## 🧪 Testing the Complete Setup

### Test 1: Frontend → Backend → Database

1. Open React app: `http://localhost:3000`
2. Navigate to "Raise Inspection Call" page
3. Fill in the form and submit
4. Check browser console for API call
5. Check Spring Boot console for SQL queries
6. Check MySQL Workbench for new record

---

## 🔍 Troubleshooting

### Issue 1: "CORS Error" in Browser Console

**Solution**: Update `application.properties`:
```properties
cors.allowed.origins=http://localhost:3000
```

### Issue 2: "Connection Refused" Error

**Solution**: 
- Check if Spring Boot is running on port 8080
- Check if `.env` has correct `REACT_APP_API_BASE_URL`

### Issue 3: "Access Denied for User" Error

**Solution**: Update MySQL password in `application.properties`:
```properties
spring.datasource.password=your_correct_password
```

### Issue 4: "Table doesn't exist" Error

**Solution**: 
- Verify database was imported correctly
- Run: `SHOW TABLES;` in MySQL Workbench
- Should see 10 tables

---

## 📝 Environment Variables Checklist

### React Frontend (.env)
- [x] `REACT_APP_ENV` set to `development`
- [x] `REACT_APP_API_BASE_URL` points to `http://localhost:8080/api`
- [x] `DB_PASSWORD` updated with your MySQL password

### Spring Boot Backend (application.properties)
- [x] `spring.datasource.url` points to `localhost:3306/rites_erc_inspection`
- [x] `spring.datasource.username` set to `root`
- [x] `spring.datasource.password` updated with your MySQL password
- [x] `spring.jpa.hibernate.ddl-auto` set to `none`
- [x] `cors.allowed.origins` includes `http://localhost:3000`

### MySQL Database
- [x] Database `rites_erc_inspection` created
- [x] All 10 tables present
- [x] IC number sequences initialized

---

## 🚀 Next Steps

1. ✅ **Configure .env** - Update with your MySQL password
2. ✅ **Configure application.properties** - Copy to Spring Boot project
3. ✅ **Start Backend** - Run Spring Boot application
4. ✅ **Start Frontend** - Run React application
5. ✅ **Test Connection** - Submit a test inspection call
6. 🔄 **Implement Backend APIs** - Follow API implementation guide
7. 🔄 **Deploy to Azure** - Use production configuration

---

## 📞 Support

If you encounter issues:
1. Check Spring Boot console for errors
2. Check browser console for errors
3. Verify MySQL is running
4. Verify all passwords are correct
5. Check CORS configuration

---

**Ready to start? Update your `.env` file and restart the applications!** 🚀

