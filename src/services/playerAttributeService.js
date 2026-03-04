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
 * GET /player-attributes - Fetch all player attributes
 * @returns {Promise<Array>} List of player attributes
 */
export async function getPlayerAttributes() {
  return request("/player-attributes");
}

/**
 * GET /player-attributes/:attribute_id - Fetch a single player attribute by id
 * @param {number} attributeId
 * @returns {Promise<Object>} Player attribute object
 */
export async function getPlayerAttributeById(attributeId) {
  return request(`/player-attributes/${attributeId}`);
}

/**
 * POST /player-attributes - Create a new player attribute
 * @param {Object} playerAttribute - { attribute_id, player_id, season_id, pace?, shooting?, passing?, dribbling?, defending?, physical?, overall_rating?, potential_rating?, updated_at? }
 * @returns {Promise<Object>} Created player attribute
 */
export async function createPlayerAttribute(playerAttribute) {
  return request("/player-attributes", {
    method: "POST",
    body: JSON.stringify(playerAttribute),
  });
}

/**
 * PUT /player-attributes/:attribute_id - Update an existing player attribute
 * @param {number} attributeId
 * @param {Object} updates - { player_id?, season_id?, pace?, shooting?, passing?, dribbling?, defending?, physical?, overall_rating?, potential_rating?, updated_at? }
 * @returns {Promise<Object>} Updated player attribute
 */
export async function updatePlayerAttribute(attributeId, updates) {
  return request(`/player-attributes/${attributeId}`, {
    method: "PUT",
    body: JSON.stringify(updates),
  });
}

/**
 * DELETE /player-attributes/:attribute_id - Delete a player attribute
 * @param {number} attributeId
 * @returns {Promise<Object>} { message: "..." }
 */
export async function deletePlayerAttribute(attributeId) {
  return request(`/player-attributes/${attributeId}`, {
    method: "DELETE",
  });
}
