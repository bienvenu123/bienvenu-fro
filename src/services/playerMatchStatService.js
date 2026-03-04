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
 * GET /player-match-stats - Fetch all player match stats
 * @returns {Promise<Array>} List of player match stats
 */
export async function getPlayerMatchStats() {
  return request("/player-match-stats");
}

/**
 * GET /player-match-stats/:stat_id - Fetch a single player match stat by id
 * @param {number} statId
 * @returns {Promise<Object>} Player match stat object
 */
export async function getPlayerMatchStatById(statId) {
  return request(`/player-match-stats/${statId}`);
}

/**
 * POST /player-match-stats - Create a new player match stat
 * @param {Object} playerMatchStat - { stat_id, match_id, player_id, team_id, minutes_played?, goals?, assists?, shots?, shots_on_target?, passes_completed?, passes_attempted?, tackles?, interceptions?, clearances?, dribbles_completed?, dribbles_attempted?, fouls_committed?, fouls_won?, yellow_cards?, red_cards?, offsides?, saves?, rating? }
 * @returns {Promise<Object>} Created player match stat
 */
export async function createPlayerMatchStat(playerMatchStat) {
  return request("/player-match-stats", {
    method: "POST",
    body: JSON.stringify(playerMatchStat),
  });
}

/**
 * PUT /player-match-stats/:stat_id - Update an existing player match stat
 * @param {number} statId
 * @param {Object} updates - { match_id?, player_id?, team_id?, minutes_played?, goals?, assists?, shots?, shots_on_target?, passes_completed?, passes_attempted?, tackles?, interceptions?, clearances?, dribbles_completed?, dribbles_attempted?, fouls_committed?, fouls_won?, yellow_cards?, red_cards?, offsides?, saves?, rating? }
 * @returns {Promise<Object>} Updated player match stat
 */
export async function updatePlayerMatchStat(statId, updates) {
  return request(`/player-match-stats/${statId}`, {
    method: "PUT",
    body: JSON.stringify(updates),
  });
}

/**
 * DELETE /player-match-stats/:stat_id - Delete a player match stat
 * @param {number} statId
 * @returns {Promise<Object>} { message: "..." }
 */
export async function deletePlayerMatchStat(statId) {
  return request(`/player-match-stats/${statId}`, {
    method: "DELETE",
  });
}
