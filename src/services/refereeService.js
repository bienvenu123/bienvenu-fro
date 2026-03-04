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
 * GET /referees - Fetch all referees
 * @returns {Promise<Array>} List of referees
 */
export async function getReferees() {
  return request("/referees");
}

/**
 * GET /referees/:referee_id - Fetch a single referee by id
 * @param {number} refereeId
 * @returns {Promise<Object>} Referee object
 */
export async function getRefereeById(refereeId) {
  return request(`/referees/${refereeId}`);
}

/**
 * POST /referees - Create a new referee
 * @param {Object} referee - { referee_id, first_name, last_name, country_id, date_of_birth, is_active? }
 * @returns {Promise<Object>} Created referee
 */
export async function createReferee(referee) {
  return request("/referees", {
    method: "POST",
    body: JSON.stringify(referee),
  });
}

/**
 * PUT /referees/:referee_id - Update an existing referee
 * @param {number} refereeId
 * @param {Object} updates - { first_name?, last_name?, country_id?, date_of_birth?, is_active? }
 * @returns {Promise<Object>} Updated referee
 */
export async function updateReferee(refereeId, updates) {
  return request(`/referees/${refereeId}`, {
    method: "PUT",
    body: JSON.stringify(updates),
  });
}

/**
 * DELETE /referees/:referee_id - Delete a referee
 * @param {number} refereeId
 * @returns {Promise<Object>} { message: "..." }
 */
export async function deleteReferee(refereeId) {
  return request(`/referees/${refereeId}`, {
    method: "DELETE",
  });
}
