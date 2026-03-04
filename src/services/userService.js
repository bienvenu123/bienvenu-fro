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

  const res = await fetch(url, config);
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const error = new Error(data.message || "Request failed");
    error.status = res.status;
    error.details = data.details;
    throw error;
  }

  return data;
}

/**
 * GET /users - Fetch all users
 * @returns {Promise<Array>} List of users
 */
export async function getUsers() {
  return request("/users");
}

/**
 * GET /users/:user_id - Fetch a single user by id
 * @param {number} userId
 * @returns {Promise<Object>} User object
 */
export async function getUserById(userId) {
  return request(`/users/${userId}`);
}

/**
 * POST /users - Create a new user
 * @param {Object} user - { user_id, name, email, username, role, password }
 * @returns {Promise<Object>} Created user
 */
export async function createUser(user) {
  return request("/users", {
    method: "POST",
    body: JSON.stringify(user),
  });
}

/**
 * PUT /users/:user_id - Update an existing user
 * @param {number} userId
 * @param {Object} updates - { name?, email?, username?, role?, password? }
 * @returns {Promise<Object>} Updated user
 */
export async function updateUser(userId, updates) {
  return request(`/users/${userId}`, {
    method: "PUT",
    body: JSON.stringify(updates),
  });
}

/**
 * DELETE /users/:user_id - Delete a user
 * @param {number} userId
 * @returns {Promise<Object>} { message: "User deleted" }
 */
export async function deleteUser(userId) {
  return request(`/users/${userId}`, {
    method: "DELETE",
  });
}
