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
 * GET /player-season-stats - Fetch all player season stats
 * @returns {Promise<Array>} List of player season stats
 */
export async function getPlayerSeasonStats() {
  return request("/player-season-stats");
}

/**
 * GET /player-season-stats/:season_stat_id - Fetch a single player season stat by id
 * @param {number} seasonStatId
 * @returns {Promise<Object>} Player season stat object
 */
export async function getPlayerSeasonStatById(seasonStatId) {
  return request(`/player-season-stats/${seasonStatId}`);
}

/**
 * POST /player-season-stats - Create a new player season stat
 * @param {Object} playerSeasonStat - { season_stat_id, player_id, team_id, season_id, league_id, appearances?, minutes_played?, goals?, assists?, yellow_cards?, red_cards?, clean_sheets?, shots?, shots_on_target?, pass_completion_rate?, average_rating? }
 * @returns {Promise<Object>} Created player season stat
 */
export async function createPlayerSeasonStat(playerSeasonStat) {
  return request("/player-season-stats", {
    method: "POST",
    body: JSON.stringify(playerSeasonStat),
  });
}

/**
 * PUT /player-season-stats/:season_stat_id - Update an existing player season stat
 * @param {number} seasonStatId
 * @param {Object} updates - { player_id?, team_id?, season_id?, league_id?, appearances?, minutes_played?, goals?, assists?, yellow_cards?, red_cards?, clean_sheets?, shots?, shots_on_target?, pass_completion_rate?, average_rating? }
 * @returns {Promise<Object>} Updated player season stat
 */
export async function updatePlayerSeasonStat(seasonStatId, updates) {
  return request(`/player-season-stats/${seasonStatId}`, {
    method: "PUT",
    body: JSON.stringify(updates),
  });
}

/**
 * DELETE /player-season-stats/:season_stat_id - Delete a player season stat
 * @param {number} seasonStatId
 * @returns {Promise<Object>} { message: "..." }
 */
export async function deletePlayerSeasonStat(seasonStatId) {
  return request(`/player-season-stats/${seasonStatId}`, {
    method: "DELETE",
  });
}
