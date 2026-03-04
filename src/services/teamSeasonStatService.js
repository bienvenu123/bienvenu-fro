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
 * GET /team-season-stats - Fetch all team season stats
 * @returns {Promise<Array>} List of team season stats
 */
export async function getTeamSeasonStats() {
  return request("/team-season-stats");
}

/**
 * GET /team-season-stats/:team_season_stat_id - Fetch a single team season stat by id
 * @param {number} teamSeasonStatId
 * @returns {Promise<Object>} Team season stat object
 */
export async function getTeamSeasonStatById(teamSeasonStatId) {
  return request(`/team-season-stats/${teamSeasonStatId}`);
}

/**
 * POST /team-season-stats - Create a new team season stat
 * @param {Object} teamSeasonStat - Team season stat object
 * @returns {Promise<Object>} Created team season stat
 */
export async function createTeamSeasonStat(teamSeasonStat) {
  return request("/team-season-stats", {
    method: "POST",
    body: JSON.stringify(teamSeasonStat),
  });
}

/**
 * PUT /team-season-stats/:team_season_stat_id - Update an existing team season stat
 * @param {number} teamSeasonStatId
 * @param {Object} updates - Update fields
 * @returns {Promise<Object>} Updated team season stat
 */
export async function updateTeamSeasonStat(teamSeasonStatId, updates) {
  return request(`/team-season-stats/${teamSeasonStatId}`, {
    method: "PUT",
    body: JSON.stringify(updates),
  });
}

/**
 * DELETE /team-season-stats/:team_season_stat_id - Delete a team season stat
 * @param {number} teamSeasonStatId
 * @returns {Promise<Object>} { message: "..." }
 */
export async function deleteTeamSeasonStat(teamSeasonStatId) {
  return request(`/team-season-stats/${teamSeasonStatId}`, {
    method: "DELETE",
  });
}
