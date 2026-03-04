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
 * GET /team-match-stats - Fetch all team match stats
 * @returns {Promise<Array>} List of team match stats
 */
export async function getTeamMatchStats() {
  return request("/team-match-stats");
}

/**
 * GET /team-match-stats/:team_match_stat_id - Fetch a single team match stat by id
 * @param {number} teamMatchStatId
 * @returns {Promise<Object>} Team match stat object
 */
export async function getTeamMatchStatById(teamMatchStatId) {
  return request(`/team-match-stats/${teamMatchStatId}`);
}

/**
 * POST /team-match-stats - Create a new team match stat
 * @param {Object} teamMatchStat - Team match stat object
 * @returns {Promise<Object>} Created team match stat
 */
export async function createTeamMatchStat(teamMatchStat) {
  return request("/team-match-stats", {
    method: "POST",
    body: JSON.stringify(teamMatchStat),
  });
}

/**
 * PUT /team-match-stats/:team_match_stat_id - Update an existing team match stat
 * @param {number} teamMatchStatId
 * @param {Object} updates - Update fields
 * @returns {Promise<Object>} Updated team match stat
 */
export async function updateTeamMatchStat(teamMatchStatId, updates) {
  return request(`/team-match-stats/${teamMatchStatId}`, {
    method: "PUT",
    body: JSON.stringify(updates),
  });
}

/**
 * DELETE /team-match-stats/:team_match_stat_id - Delete a team match stat
 * @param {number} teamMatchStatId
 * @returns {Promise<Object>} { message: "..." }
 */
export async function deleteTeamMatchStat(teamMatchStatId) {
  return request(`/team-match-stats/${teamMatchStatId}`, {
    method: "DELETE",
  });
}
