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
 * GET /player-positions - Fetch all player positions
 * @returns {Promise<Array>} List of player positions
 */
export async function getPlayerPositions() {
  return request("/player-positions");
}

/**
 * GET /player-positions/:player_position_id - Fetch a single player position by id
 * @param {number} playerPositionId
 * @returns {Promise<Object>} Player position object
 */
export async function getPlayerPositionById(playerPositionId) {
  return request(`/player-positions/${playerPositionId}`);
}

/**
 * POST /player-positions - Create a new player position
 * @param {Object} playerPosition - { player_position_id, player_id, position_id, is_primary? }
 * @returns {Promise<Object>} Created player position
 */
export async function createPlayerPosition(playerPosition) {
  return request("/player-positions", {
    method: "POST",
    body: JSON.stringify(playerPosition),
  });
}

/**
 * PUT /player-positions/:player_position_id - Update an existing player position
 * @param {number} playerPositionId
 * @param {Object} updates - { player_id?, position_id?, is_primary? }
 * @returns {Promise<Object>} Updated player position
 */
export async function updatePlayerPosition(playerPositionId, updates) {
  return request(`/player-positions/${playerPositionId}`, {
    method: "PUT",
    body: JSON.stringify(updates),
  });
}

/**
 * DELETE /player-positions/:player_position_id - Delete a player position
 * @param {number} playerPositionId
 * @returns {Promise<Object>} { message: "..." }
 */
export async function deletePlayerPosition(playerPositionId) {
  return request(`/player-positions/${playerPositionId}`, {
    method: "DELETE",
  });
}
