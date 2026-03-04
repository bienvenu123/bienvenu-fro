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
 * GET /matches - Fetch all matches
 * @returns {Promise<Array>} List of matches
 */
export async function getMatches() {
  return request("/matches");
}

/**
 * GET /matches/:match_id - Fetch a single match by id
 * @param {number} matchId
 * @returns {Promise<Object>} Match object
 */
export async function getMatchById(matchId) {
  return request(`/matches/${matchId}`);
}

/**
 * POST /matches - Create a new match
 * @param {Object} match - { match_id, league_id, season_id, home_team_id, away_team_id, match_date, venue?, matchweek?, home_score?, away_score?, home_halftime_score?, away_halftime_score?, status, attendance?, referee_id? }
 * @returns {Promise<Object>} Created match
 */
export async function createMatch(match) {
  return request("/matches", {
    method: "POST",
    body: JSON.stringify(match),
  });
}

/**
 * PUT /matches/:match_id - Update an existing match
 * @param {number} matchId
 * @param {Object} updates - { league_id?, season_id?, home_team_id?, away_team_id?, match_date?, venue?, matchweek?, home_score?, away_score?, home_halftime_score?, away_halftime_score?, status?, attendance?, referee_id? }
 * @returns {Promise<Object>} Updated match
 */
export async function updateMatch(matchId, updates) {
  return request(`/matches/${matchId}`, {
    method: "PUT",
    body: JSON.stringify(updates),
  });
}

/**
 * DELETE /matches/:match_id - Delete a match
 * @param {number} matchId
 * @returns {Promise<Object>} { message: "..." }
 */
export async function deleteMatch(matchId) {
  return request(`/matches/${matchId}`, {
    method: "DELETE",
  });
}
