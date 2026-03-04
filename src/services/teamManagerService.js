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
 * GET /team-managers - Fetch all team managers
 * @returns {Promise<Array>} List of team managers
 */
export async function getTeamManagers() {
  return request("/team-managers");
}

/**
 * GET /team-managers/:team_manager_id - Fetch a single team manager by id
 * @param {number} teamManagerId
 * @returns {Promise<Object>} Team manager object
 */
export async function getTeamManagerById(teamManagerId) {
  return request(`/team-managers/${teamManagerId}`);
}

/**
 * POST /team-managers - Create a new team manager
 * @param {Object} teamManager - { team_manager_id, team_id, manager_id, start_date, end_date?, contract_type }
 * @returns {Promise<Object>} Created team manager
 */
export async function createTeamManager(teamManager) {
  return request("/team-managers", {
    method: "POST",
    body: JSON.stringify(teamManager),
  });
}

/**
 * PUT /team-managers/:team_manager_id - Update an existing team manager
 * @param {number} teamManagerId
 * @param {Object} updates - { team_id?, manager_id?, start_date?, end_date?, contract_type? }
 * @returns {Promise<Object>} Updated team manager
 */
export async function updateTeamManager(teamManagerId, updates) {
  return request(`/team-managers/${teamManagerId}`, {
    method: "PUT",
    body: JSON.stringify(updates),
  });
}

/**
 * DELETE /team-managers/:team_manager_id - Delete a team manager
 * @param {number} teamManagerId
 * @returns {Promise<Object>} { message: "..." }
 */
export async function deleteTeamManager(teamManagerId) {
  return request(`/team-managers/${teamManagerId}`, {
    method: "DELETE",
  });
}
