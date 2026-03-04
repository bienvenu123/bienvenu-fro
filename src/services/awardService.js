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
 * GET /awards - Fetch all awards
 * @returns {Promise<Array>} List of awards
 */
export async function getAwards() {
  return request("/awards");
}

/**
 * GET /awards/:award_id - Fetch a single award by id
 * @param {number} awardId
 * @returns {Promise<Object>} Award object
 */
export async function getAwardById(awardId) {
  return request(`/awards/${awardId}`);
}

/**
 * POST /awards - Create a new award
 * @param {Object} award - { award_id, name, category, level, description? }
 * @returns {Promise<Object>} Created award
 */
export async function createAward(award) {
  return request("/awards", {
    method: "POST",
    body: JSON.stringify(award),
  });
}

/**
 * PUT /awards/:award_id - Update an existing award
 * @param {number} awardId
 * @param {Object} updates - { name?, category?, level?, description? }
 * @returns {Promise<Object>} Updated award
 */
export async function updateAward(awardId, updates) {
  return request(`/awards/${awardId}`, {
    method: "PUT",
    body: JSON.stringify(updates),
  });
}

/**
 * DELETE /awards/:award_id - Delete an award
 * @param {number} awardId
 * @returns {Promise<Object>} { message: "..." }
 */
export async function deleteAward(awardId) {
  return request(`/awards/${awardId}`, {
    method: "DELETE",
  });
}
