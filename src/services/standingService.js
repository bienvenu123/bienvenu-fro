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
 * GET /standings - Fetch all standings
 * @returns {Promise<Array>} List of standings
 */
export async function getStandings() {
  return request("/standings");
}

/**
 * GET /standings/:standing_id - Fetch a single standing by id
 * @param {number} standingId
 * @returns {Promise<Object>} Standing object
 */
export async function getStandingById(standingId) {
  return request(`/standings/${standingId}`);
}

/**
 * POST /standings - Create a new standing
 * @param {Object} standing - { standing_id, league_id, season_id, team_id, position, played?, won?, drawn?, lost?, goals_for?, goals_against?, goal_difference?, points?, form?, updated_at? }
 * @returns {Promise<Object>} Created standing
 */
export async function createStanding(standing) {
  return request("/standings", {
    method: "POST",
    body: JSON.stringify(standing),
  });
}

/**
 * PUT /standings/:standing_id - Update an existing standing
 * @param {number} standingId
 * @param {Object} updates - { league_id?, season_id?, team_id?, position?, played?, won?, drawn?, lost?, goals_for?, goals_against?, goal_difference?, points?, form?, updated_at? }
 * @returns {Promise<Object>} Updated standing
 */
export async function updateStanding(standingId, updates) {
  return request(`/standings/${standingId}`, {
    method: "PUT",
    body: JSON.stringify(updates),
  });
}

/**
 * DELETE /standings/:standing_id - Delete a standing
 * @param {number} standingId
 * @returns {Promise<Object>} { message: "..." }
 */
export async function deleteStanding(standingId) {
  return request(`/standings/${standingId}`, {
    method: "DELETE",
  });
}
