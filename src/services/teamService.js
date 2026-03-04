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
 * GET /teams - Fetch all teams
 * @returns {Promise<Array>} List of teams
 */
export async function getTeams() {
  return request("/teams");
}

/**
 * GET /teams/:team_id - Fetch a single team by id
 * @param {number} teamId
 * @returns {Promise<Object>} Team object
 */
export async function getTeamById(teamId) {
  return request(`/teams/${teamId}`);
}

/**
 * POST /teams - Create a new team
 * @param {Object} team - { name, short_name?, country_id?, founded_year?, stadium_name?, stadium_capacity?, logo_url?, primary_color?, secondary_color?, city?, is_active? }
 * @returns {Promise<Object>} Created team
 */
export async function createTeam(team) {
  return request("/teams", {
    method: "POST",
    body: JSON.stringify(team),
  });
}

/**
 * PUT /teams/:team_id - Update an existing team
 * @param {number} teamId
 * @param {Object} updates - { name?, short_name?, country_id?, founded_year?, stadium_name?, stadium_capacity?, logo_url?, primary_color?, secondary_color?, city?, is_active? }
 * @returns {Promise<Object>} Updated team
 */
export async function updateTeam(teamId, updates) {
  return request(`/teams/${teamId}`, {
    method: "PUT",
    body: JSON.stringify(updates),
  });
}

/**
 * DELETE /teams/:team_id - Delete a team
 * @param {number} teamId
 * @returns {Promise<Object>} { message: "..." }
 */
export async function deleteTeam(teamId) {
  return request(`/teams/${teamId}`, {
    method: "DELETE",
  });
}
