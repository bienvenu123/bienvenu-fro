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
 * GET /match-formations - Fetch all match formations
 * @returns {Promise<Array>} List of match formations
 */
export async function getMatchFormations() {
  return request("/match-formations");
}

/**
 * GET /match-formations/:formation_id - Fetch a single match formation by id
 * @param {number} formationId
 * @returns {Promise<Object>} Match formation object
 */
export async function getMatchFormationById(formationId) {
  return request(`/match-formations/${formationId}`);
}

/**
 * POST /match-formations - Create a new match formation
 * @param {Object} matchFormation - { formation_id, match_id, team_id, formation, formation_type? }
 * @returns {Promise<Object>} Created match formation
 */
export async function createMatchFormation(matchFormation) {
  return request("/match-formations", {
    method: "POST",
    body: JSON.stringify(matchFormation),
  });
}

/**
 * PUT /match-formations/:formation_id - Update an existing match formation
 * @param {number} formationId
 * @param {Object} updates - { match_id?, team_id?, formation?, formation_type? }
 * @returns {Promise<Object>} Updated match formation
 */
export async function updateMatchFormation(formationId, updates) {
  return request(`/match-formations/${formationId}`, {
    method: "PUT",
    body: JSON.stringify(updates),
  });
}

/**
 * DELETE /match-formations/:formation_id - Delete a match formation
 * @param {number} formationId
 * @returns {Promise<Object>} { message: "..." }
 */
export async function deleteMatchFormation(formationId) {
  return request(`/match-formations/${formationId}`, {
    method: "DELETE",
  });
}
