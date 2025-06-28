// API Configuration for different environments
const API_CONFIG = {
  development: {
    baseURL: "http://localhost:8000",
  },
  production: {
    baseURL:
      process.env.REACT_APP_API_URL || "https://your-railway-app.railway.app",
  },
};

// Get current environment
const environment = process.env.NODE_ENV || "development";

// Export the base URL for the current environment
export const API_BASE_URL = API_CONFIG[environment].baseURL;

// Helper function to create full API URLs
export const createApiUrl = (endpoint) => {
  return `${API_BASE_URL}${endpoint}`;
};

export default API_CONFIG;
