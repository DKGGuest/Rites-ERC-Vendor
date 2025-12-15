// HTTP Client - Generic fetch wrapper with error handling
import { getBaseUrl, getDefaultHeaders, REQUEST_TIMEOUT } from './apiConfig';

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  constructor(message, status, data = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

/**
 * Fetch with timeout utility
 */
const fetchWithTimeout = async (url, options, timeout = REQUEST_TIMEOUT) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new ApiError('Request timeout', 408);
    }
    throw error;
  }
};

/**
 * Parse response based on content type
 */
const parseResponse = async (response) => {
  const contentType = response.headers.get('content-type');
  
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }
  
  return response.text();
};

/**
 * Generic HTTP request handler
 */
const request = async (endpoint, options = {}) => {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}${endpoint}`;
  
  const config = {
    ...options,
    headers: {
      ...getDefaultHeaders(options.token),
      ...options.headers
    }
  };
  
  // Remove token from config if passed (already added to headers)
  delete config.token;
  
  try {
    const response = await fetchWithTimeout(url, config);
    const data = await parseResponse(response);
    
    if (!response.ok) {
      throw new ApiError(
        data?.message || `HTTP Error ${response.status}`,
        response.status,
        data
      );
    }
    
    return {
      success: true,
      data,
      status: response.status
    };
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Network or other errors
    throw new ApiError(
      error.message || 'Network error occurred',
      0,
      null
    );
  }
};

/**
 * HTTP Methods
 */
export const httpClient = {
  get: (endpoint, options = {}) => 
    request(endpoint, { ...options, method: 'GET' }),
  
  post: (endpoint, data, options = {}) => 
    request(endpoint, { 
      ...options, 
      method: 'POST', 
      body: JSON.stringify(data) 
    }),
  
  put: (endpoint, data, options = {}) => 
    request(endpoint, { 
      ...options, 
      method: 'PUT', 
      body: JSON.stringify(data) 
    }),
  
  patch: (endpoint, data, options = {}) => 
    request(endpoint, { 
      ...options, 
      method: 'PATCH', 
      body: JSON.stringify(data) 
    }),
  
  delete: (endpoint, options = {}) => 
    request(endpoint, { ...options, method: 'DELETE' })
};

export default httpClient;

