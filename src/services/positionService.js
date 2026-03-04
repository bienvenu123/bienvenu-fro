/**
 * Base API URL. Set REACT_APP_API_URL in .env for production.
 * @example REACT_APP_API_URL=http://localhost:5000/api
 */
const API_BASE = process.env.REACT_APP_API_URL || "https://bienvenu-2.onrender.com/api";

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
 * GET /positions - Fetch all positions
 * @returns {Promise<Array>} List of positions
 */
export async function getPositions() {
  return request("/positions");
}

/**
 * GET /positions/:position_id - Fetch a single position by id
 * @param {number} positionId
 * @returns {Promise<Object>} Position object
 */
export async function getPositionById(positionId) {
  return request(`/positions/${positionId}`);
}

/**
 * POST /positions - Create a new position
 * @param {Object} position - { position_id, name, short_name, category }
 * @returns {Promise<Object>} Created position
 */
export async function createPosition(position) {
  return request("/positions", {
    method: "POST",
    body: JSON.stringify(position),
  });
}

/**
 * PUT /positions/:position_id - Update an existing position
 * @param {number} positionId
 * @param {Object} updates - { name?, short_name?, category? }
 * @returns {Promise<Object>} Updated position
 */
export async function updatePosition(positionId, updates) {
  return request(`/positions/${positionId}`, {
    method: "PUT",
    body: JSON.stringify(updates),
  });
}

/**
 * DELETE /positions/:position_id - Delete a position
 * @param {number} positionId
 * @returns {Promise<Object>} { message: "..." }
 */
export async function deletePosition(positionId) {
  return request(`/positions/${positionId}`, {
    method: "DELETE",
  });
}
