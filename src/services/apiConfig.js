// API Configuration
// Base URL configuration for different environments

const ENV = {
  DEVELOPMENT: 'development',
  PRODUCTION: 'production',
  STAGING: 'staging'
};

// Get current environment - defaults to development
const getCurrentEnvironment = () => {
  return process.env.REACT_APP_ENV || ENV.DEVELOPMENT;
};

// Base URLs for different environments
const BASE_URLS = {
  [ENV.DEVELOPMENT]: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api',
  [ENV.STAGING]: process.env.REACT_APP_API_STAGING_URL || 'https://staging-api.yourserver.com/api',
  [ENV.PRODUCTION]: process.env.REACT_APP_API_PROD_URL || 'https://api.yourserver.com/api'
};

// Get the base URL for the current environment
export const getBaseUrl = () => {
  const env = getCurrentEnvironment();
  return BASE_URLS[env] || BASE_URLS[ENV.DEVELOPMENT];
};

// API Endpoints configuration
export const API_ENDPOINTS = {
  // Vendor Workflow APIs
  VENDOR_WORKFLOW: {
    INITIATE_WORKFLOW: '/initiateWorkflow',
    PERFORM_TRANSITION_ACTION: '/performTransitionAction',
    WORKFLOW_TRANSITION_HISTORY: '/workflowTransitionHistory',
    WORKFLOW_TRANSITIONS_PAYMENT_BLOCKED: '/workflowTransitionsPaymentBlocked',
    ALL_PENDING_WORKFLOW_TRANSITION: '/allPendingWorkflowtrasition'
  },
  
  // Placeholder for other API modules - can be extended
  INSPECTION: {
    CREATE: '/inspection/create',
    GET_BY_ID: '/inspection',
    UPDATE: '/inspection/update',
    DELETE: '/inspection/delete'
  },
  
  CALIBRATION: {
    GET_ALL: '/calibration/all',
    CREATE: '/calibration/create',
    UPDATE: '/calibration/update'
  },
  
  PAYMENT: {
    GET_ALL: '/payment/all',
    CREATE: '/payment/create',
    UPDATE: '/payment/update'
  }
};

// HTTP request timeout in milliseconds
export const REQUEST_TIMEOUT = 30000;

// Default headers for API requests
export const getDefaultHeaders = (token = null) => {
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

export default {
  getBaseUrl,
  API_ENDPOINTS,
  REQUEST_TIMEOUT,
  getDefaultHeaders
};

