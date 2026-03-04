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
 * GET /leagues - Fetch all leagues
 * @returns {Promise<Array>} List of leagues
 */
export async function getLeagues() {
  return request("/leagues");
}

/**
 * GET /leagues/:league_id - Fetch a single league by id
 * @param {number} leagueId
 * @returns {Promise<Object>} League object
 */
export async function getLeagueById(leagueId) {
  return request(`/leagues/${leagueId}`);
}

/**
 * POST /leagues - Create a new league
 * @param {Object} league - { league_id, name, country_id, level?, type, logo_url?, founded_year?, is_active? }
 * @returns {Promise<Object>} Created league
 */
export async function createLeague(league) {
  return request("/leagues", {
    method: "POST",
    body: JSON.stringify(league),
  });
}

/**
 * PUT /leagues/:league_id - Update an existing league
 * @param {number} leagueId
 * @param {Object} updates - { name?, country_id?, level?, type?, logo_url?, founded_year?, is_active? }
 * @returns {Promise<Object>} Updated league
 */
export async function updateLeague(leagueId, updates) {
  return request(`/leagues/${leagueId}`, {
    method: "PUT",
    body: JSON.stringify(updates),
  });
}

/**
 * DELETE /leagues/:league_id - Delete a league
 * @param {number} leagueId
 * @returns {Promise<Object>} { message: "..." }
 */
export async function deleteLeague(leagueId) {
  return request(`/leagues/${leagueId}`, {
    method: "DELETE",
  });
}
