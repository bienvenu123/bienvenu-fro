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
 * GET /league-teams - Fetch all league teams
 * @returns {Promise<Array>} List of league teams
 */
export async function getLeagueTeams() {
  return request("/league-teams");
}

/**
 * GET /league-teams/:league_team_id - Fetch a single league team by id
 * @param {number} leagueTeamId
 * @returns {Promise<Object>} League team object
 */
export async function getLeagueTeamById(leagueTeamId) {
  return request(`/league-teams/${leagueTeamId}`);
}

/**
 * POST /league-teams - Create a new league team
 * @param {Object} leagueTeam - { league_team_id, league_id, team_id, season_id, joined_date }
 * @returns {Promise<Object>} Created league team
 */
export async function createLeagueTeam(leagueTeam) {
  return request("/league-teams", {
    method: "POST",
    body: JSON.stringify(leagueTeam),
  });
}

/**
 * PUT /league-teams/:league_team_id - Update an existing league team
 * @param {number} leagueTeamId
 * @param {Object} updates - { league_id?, team_id?, season_id?, joined_date? }
 * @returns {Promise<Object>} Updated league team
 */
export async function updateLeagueTeam(leagueTeamId, updates) {
  return request(`/league-teams/${leagueTeamId}`, {
    method: "PUT",
    body: JSON.stringify(updates),
  });
}

/**
 * DELETE /league-teams/:league_team_id - Delete a league team
 * @param {number} leagueTeamId
 * @returns {Promise<Object>} { message: "..." }
 */
export async function deleteLeagueTeam(leagueTeamId) {
  return request(`/league-teams/${leagueTeamId}`, {
    method: "DELETE",
  });
}
