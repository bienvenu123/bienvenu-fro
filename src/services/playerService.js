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
 * GET /players - Fetch all players
 * @returns {Promise<Array>} List of players
 */
export async function getPlayers() {
  return request("/players");
}

/**
 * GET /players/:player_id - Fetch a single player by id
 * @param {number} playerId
 * @returns {Promise<Object>} Player object
 */
export async function getPlayerById(playerId) {
  return request(`/players/${playerId}`);
}

/**
 * POST /players - Create a new player
 * @param {Object} player - { player_id, first_name, last_name, date_of_birth, nationality_id, second_nationality_id?, height_cm?, weight_kg?, preferred_foot?, photo_url?, shirt_number?, is_active? }
 * @returns {Promise<Object>} Created player
 */
export async function createPlayer(player) {
  return request("/players", {
    method: "POST",
    body: JSON.stringify(player),
  });
}

/**
 * PUT /players/:player_id - Update an existing player
 * @param {number} playerId
 * @param {Object} updates - { first_name?, last_name?, date_of_birth?, nationality_id?, second_nationality_id?, height_cm?, weight_kg?, preferred_foot?, photo_url?, shirt_number?, is_active? }
 * @returns {Promise<Object>} Updated player
 */
export async function updatePlayer(playerId, updates) {
  return request(`/players/${playerId}`, {
    method: "PUT",
    body: JSON.stringify(updates),
  });
}

/**
 * DELETE /players/:player_id - Delete a player
 * @param {number} playerId
 * @returns {Promise<Object>} { message: "..." }
 */
export async function deletePlayer(playerId) {
  return request(`/players/${playerId}`, {
    method: "DELETE",
  });
}
