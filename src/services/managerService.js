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
 * GET /managers - Fetch all managers
 * @returns {Promise<Array>} List of managers
 */
export async function getManagers() {
  return request("/managers");
}

/**
 * GET /managers/:manager_id - Fetch a single manager by id
 * @param {number} managerId
 * @returns {Promise<Object>} Manager object
 */
export async function getManagerById(managerId) {
  return request(`/managers/${managerId}`);
}

/**
 * POST /managers - Create a new manager
 * @param {Object} manager - { manager_id, first_name, last_name, date_of_birth, nationality_id, photo_url?, is_active? }
 * @returns {Promise<Object>} Created manager
 */
export async function createManager(manager) {
  return request("/managers", {
    method: "POST",
    body: JSON.stringify(manager),
  });
}

/**
 * PUT /managers/:manager_id - Update an existing manager
 * @param {number} managerId
 * @param {Object} updates - { first_name?, last_name?, date_of_birth?, nationality_id?, photo_url?, is_active? }
 * @returns {Promise<Object>} Updated manager
 */
export async function updateManager(managerId, updates) {
  return request(`/managers/${managerId}`, {
    method: "PUT",
    body: JSON.stringify(updates),
  });
}

/**
 * DELETE /managers/:manager_id - Delete a manager
 * @param {number} managerId
 * @returns {Promise<Object>} { message: "..." }
 */
export async function deleteManager(managerId) {
  return request(`/managers/${managerId}`, {
    method: "DELETE",
  });
}
