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
 * GET /stadiums - Fetch all stadiums
 * @returns {Promise<Array>} List of stadiums
 */
export async function getStadiums() {
  return request("/stadiums");
}

/**
 * GET /stadiums/:stadium_id - Fetch a single stadium by id
 * @param {number} stadiumId
 * @returns {Promise<Object>} Stadium object
 */
export async function getStadiumById(stadiumId) {
  return request(`/stadiums/${stadiumId}`);
}

/**
 * POST /stadiums - Create a new stadium
 * @param {Object} stadium - { stadium_id, name, city, country_id, capacity?, built_year?, surface_type?, photo_url? }
 * @returns {Promise<Object>} Created stadium
 */
export async function createStadium(stadium) {
  return request("/stadiums", {
    method: "POST",
    body: JSON.stringify(stadium),
  });
}

/**
 * PUT /stadiums/:stadium_id - Update an existing stadium
 * @param {number} stadiumId
 * @param {Object} updates - { name?, city?, country_id?, capacity?, built_year?, surface_type?, photo_url? }
 * @returns {Promise<Object>} Updated stadium
 */
export async function updateStadium(stadiumId, updates) {
  return request(`/stadiums/${stadiumId}`, {
    method: "PUT",
    body: JSON.stringify(updates),
  });
}

/**
 * DELETE /stadiums/:stadium_id - Delete a stadium
 * @param {number} stadiumId
 * @returns {Promise<Object>} { message: "..." }
 */
export async function deleteStadium(stadiumId) {
  return request(`/stadiums/${stadiumId}`, {
    method: "DELETE",
  });
}
