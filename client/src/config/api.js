// API Configuration
const getApiUrl = () => {
  // If REACT_APP_API_URL is set, use it (for production)
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  // In development, use localhost
  return "http://localhost:8000";
};

export const API_BASE_URL = getApiUrl();

export const createApiUrl = (endpoint) => {
  const cleanEndpoint = endpoint.replace(/^\/+/, "");
  return `${API_BASE_URL}/${cleanEndpoint}`;
};

export default API_BASE_URL;
