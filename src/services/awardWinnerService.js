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
 * GET /award-winners - Fetch all award winners
 * @returns {Promise<Array>} List of award winners
 */
export async function getAwardWinners() {
  return request("/award-winners");
}

/**
 * GET /award-winners/:winner_id - Fetch a single award winner by id
 * @param {number} winnerId
 * @returns {Promise<Object>} Award winner object
 */
export async function getAwardWinnerById(winnerId) {
  return request(`/award-winners/${winnerId}`);
}

/**
 * POST /award-winners - Create a new award winner
 * @param {Object} awardWinner - { winner_id, award_id, player_id?, team_id?, manager_id?, season_id?, year }
 * @returns {Promise<Object>} Created award winner
 */
export async function createAwardWinner(awardWinner) {
  return request("/award-winners", {
    method: "POST",
    body: JSON.stringify(awardWinner),
  });
}

/**
 * PUT /award-winners/:winner_id - Update an existing award winner
 * @param {number} winnerId
 * @param {Object} updates - { award_id?, player_id?, team_id?, manager_id?, season_id?, year? }
 * @returns {Promise<Object>} Updated award winner
 */
export async function updateAwardWinner(winnerId, updates) {
  return request(`/award-winners/${winnerId}`, {
    method: "PUT",
    body: JSON.stringify(updates),
  });
}

/**
 * DELETE /award-winners/:winner_id - Delete an award winner
 * @param {number} winnerId
 * @returns {Promise<Object>} { message: "..." }
 */
export async function deleteAwardWinner(winnerId) {
  return request(`/award-winners/${winnerId}`, {
    method: "DELETE",
  });
}
