/**
 * Base API URL. Set REACT_APP_API_URL in .env for production.
 * @example REACT_APP_API_URL=http://localhost:5000/api
 */
const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  };

  try {
    const res = await fetch(url, config);
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const error = new Error(data.message || `Request failed with status ${res.status}`);
      error.status = res.status;
      error.details = data.details;
      throw error;
    }

    return data;
  } catch (error) {
    // Handle network errors (CORS, connection refused, etc.)
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Unable to connect to server. Please check if the backend is running.');
    }
    // Re-throw if it's already our custom error
    if (error.status) {
      throw error;
    }
    // Handle other errors
    throw new Error(error.message || 'Request failed');
  }
}

/**
 * POST /auth/login - Login user
 * Backend accepts either { username, password } or { email, password }
 * @param {Object} credentials - { username/email, password }
 * @returns {Promise<Object>} { user, token }
 */
export async function login(credentials) {
  try {
    const response = await request("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
    
    // Validate response structure
    if (!response.user || !response.token) {
      throw new Error('Invalid response from server. Missing user or token.');
    }
    
    return response;
  } catch (error) {
    // Handle 401 (Unauthorized) - invalid credentials
    if (error.status === 401) {
      throw new Error(error.message || 'Invalid username or password');
    }
    
    // Handle 400 (Bad Request) - missing credentials
    if (error.status === 400) {
      throw new Error(error.message || 'Missing credentials. Please provide username/email and password.');
    }
    
    // Handle 404 (Not Found) - endpoint doesn't exist
    if (error.status === 404) {
      throw new Error('Login endpoint not found. Please ensure the backend server is running and the /api/auth/login route is configured.');
    }
    
    // Handle 500 (Server Error)
    if (error.status === 500) {
      throw new Error('Server error. Please try again later.');
    }
    
    // Re-throw with the error message
    throw error;
  }
}

/**
 * POST /auth/logout - Logout user
 * @returns {Promise<Object>} { message: "Logged out" }
 */
export async function logout() {
  try {
    return await request("/auth/logout", {
      method: "POST",
    });
  } catch (error) {
    // If backend endpoint doesn't exist (404), just return success
    if (error.status === 404) {
      return { message: "Logged out" };
    }
    throw error;
  }
}

/**
 * Store auth token in localStorage
 */
export function setAuthToken(token) {
  localStorage.setItem("token", token);
}

/**
 * Get auth token from localStorage
 */
export function getAuthToken() {
  return localStorage.getItem("token");
}

/**
 * Remove auth token from localStorage
 */
export function removeAuthToken() {
  localStorage.removeItem("token");
}

/**
 * Store user data in localStorage
 */
export function setUserData(user) {
  localStorage.setItem("user", JSON.stringify(user));
}

/**
 * Get user data from localStorage
 */
export function getUserData() {
  const userStr = localStorage.getItem("user");
  return userStr ? JSON.parse(userStr) : null;
}

/**
 * Remove user data from localStorage
 */
export function removeUserData() {
  localStorage.removeItem("user");
}
