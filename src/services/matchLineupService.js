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
 * GET /match-lineups - Fetch all match lineups
 * @returns {Promise<Array>} List of match lineups
 */
export async function getMatchLineups() {
  return request("/match-lineups");
}

/**
 * GET /match-lineups/:lineup_id - Fetch a single match lineup by id
 * @param {number} lineupId
 * @returns {Promise<Object>} Match lineup object
 */
export async function getMatchLineupById(lineupId) {
  return request(`/match-lineups/${lineupId}`);
}

/**
 * POST /match-lineups - Create a new match lineup
 * @param {Object} matchLineup - { lineup_id, match_id, team_id, player_id, position_id, is_starter?, formation_position?, shirt_number? }
 * @returns {Promise<Object>} Created match lineup
 */
export async function createMatchLineup(matchLineup) {
  return request("/match-lineups", {
    method: "POST",
    body: JSON.stringify(matchLineup),
  });
}

/**
 * PUT /match-lineups/:lineup_id - Update an existing match lineup
 * @param {number} lineupId
 * @param {Object} updates - { match_id?, team_id?, player_id?, position_id?, is_starter?, formation_position?, shirt_number? }
 * @returns {Promise<Object>} Updated match lineup
 */
export async function updateMatchLineup(lineupId, updates) {
  return request(`/match-lineups/${lineupId}`, {
    method: "PUT",
    body: JSON.stringify(updates),
  });
}

/**
 * DELETE /match-lineups/:lineup_id - Delete a match lineup
 * @param {number} lineupId
 * @returns {Promise<Object>} { message: "..." }
 */
export async function deleteMatchLineup(lineupId) {
  return request(`/match-lineups/${lineupId}`, {
    method: "DELETE",
  });
}
