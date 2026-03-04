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
 * GET /injuries - Fetch all injuries
 * @returns {Promise<Array>} List of injuries
 */
export async function getInjuries() {
  return request("/injuries");
}

/**
 * GET /injuries/:injury_id - Fetch a single injury by id
 * @param {number} injuryId
 * @returns {Promise<Object>} Injury object
 */
export async function getInjuryById(injuryId) {
  return request(`/injuries/${injuryId}`);
}

/**
 * POST /injuries - Create a new injury
 * @param {Object} injury - { injury_id, player_id, injury_type, injury_date, expected_return_date?, actual_return_date?, severity, matches_missed? }
 * @returns {Promise<Object>} Created injury
 */
export async function createInjury(injury) {
  return request("/injuries", {
    method: "POST",
    body: JSON.stringify(injury),
  });
}

/**
 * PUT /injuries/:injury_id - Update an existing injury
 * @param {number} injuryId
 * @param {Object} updates - { player_id?, injury_type?, injury_date?, expected_return_date?, actual_return_date?, severity?, matches_missed? }
 * @returns {Promise<Object>} Updated injury
 */
export async function updateInjury(injuryId, updates) {
  return request(`/injuries/${injuryId}`, {
    method: "PUT",
    body: JSON.stringify(updates),
  });
}

/**
 * DELETE /injuries/:injury_id - Delete an injury
 * @param {number} injuryId
 * @returns {Promise<Object>} { message: "..." }
 */
export async function deleteInjury(injuryId) {
  return request(`/injuries/${injuryId}`, {
    method: "DELETE",
  });
}
