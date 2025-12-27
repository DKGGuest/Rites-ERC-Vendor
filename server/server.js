// RITES ERC Inspection - Simple Node.js API Server
// Direct MySQL connection for frontend development
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { testConnection } = require('./config/database');

// Import routes
const inspectionCallRoutes = require('./routes/inspectionCallRoutes');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 8080;

// ============================================================
// MIDDLEWARE
// ============================================================

// CORS - Allow React frontend to access API
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));

// Body parser - Parse JSON requests
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// ============================================================
// ROUTES
// ============================================================

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'RITES ERC API Server is running',
    timestamp: new Date().toISOString(),
    database: 'Connected'
  });
});

// Inspection Call routes
app.use('/api/inspection-calls', inspectionCallRoutes);

// Workflow routes (mock for now - returns success)
app.post('/api/initiateWorkflow', (req, res) => {
  console.log('📋 Workflow initiation request received:', req.body);
  res.json({
    success: true,
    message: 'Workflow initiated successfully (mock)',
    data: {
      workflowId: `WF-${Date.now()}`,
      status: 'Initiated'
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    path: req.path
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// ============================================================
// START SERVER
// ============================================================

const startServer = async () => {
  try {
    // Test database connection
    console.log('🔄 Testing database connection...');
    const dbConnected = await testConnection();
    
    if (!dbConnected) {
      console.error('❌ Failed to connect to database. Please check your configuration.');
      console.error('📝 Update server/.env with your MySQL credentials');
      process.exit(1);
    }
    
    // Start Express server
    app.listen(PORT, () => {
      console.log('');
      console.log('========================================');
      console.log('🚀 RITES ERC API Server Started');
      console.log('========================================');
      console.log(`📡 Server running on: http://localhost:${PORT}`);
      console.log(`🌐 API Base URL: http://localhost:${PORT}/api`);
      console.log(`💚 Health Check: http://localhost:${PORT}/api/health`);
      console.log(`📊 Database: ${process.env.DB_NAME}`);
      console.log(`🔗 CORS Enabled for: ${process.env.CORS_ORIGIN}`);
      console.log('========================================');
      console.log('');
      console.log('📋 Available Endpoints:');
      console.log('');
      console.log('  Raw Material Inspection:');
      console.log('    POST   /api/inspection-calls/raw-material');
      console.log('    GET    /api/inspection-calls/raw-material/approved');
      console.log('');
      console.log('  Process Inspection:');
      console.log('    POST   /api/inspection-calls/process');
      console.log('    GET    /api/inspection-calls/process/approved');
      console.log('');
      console.log('  Final Inspection:');
      console.log('    POST   /api/inspection-calls/final');
      console.log('');
      console.log('  General:');
      console.log('    GET    /api/inspection-calls');
      console.log('    GET    /api/inspection-calls/:icNumber');
      console.log('    GET    /api/heat-numbers/:rm_ic_number');
      console.log('    POST   /api/initiateWorkflow (mock)');
      console.log('========================================');
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  process.exit(0);
});

// Start the server
startServer();

