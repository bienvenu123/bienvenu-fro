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
 * GET /seasons - Fetch all seasons
 * @returns {Promise<Array>} List of seasons
 */
export async function getSeasons() {
  return request("/seasons");
}

/**
 * GET /seasons/:season_id - Fetch a single season by id
 * @param {number} seasonId
 * @returns {Promise<Object>} Season object
 */
export async function getSeasonById(seasonId) {
  return request(`/seasons/${seasonId}`);
}

/**
 * POST /seasons - Create a new season
 * @param {Object} season - { season_id, league_id, name, start_date, end_date, is_current? }
 * @returns {Promise<Object>} Created season
 */
export async function createSeason(season) {
  return request("/seasons", {
    method: "POST",
    body: JSON.stringify(season),
  });
}

/**
 * PUT /seasons/:season_id - Update an existing season
 * @param {number} seasonId
 * @param {Object} updates - { league_id?, name?, start_date?, end_date?, is_current? }
 * @returns {Promise<Object>} Updated season
 */
export async function updateSeason(seasonId, updates) {
  return request(`/seasons/${seasonId}`, {
    method: "PUT",
    body: JSON.stringify(updates),
  });
}

/**
 * DELETE /seasons/:season_id - Delete a season
 * @param {number} seasonId
 * @returns {Promise<Object>} { message: "..." }
 */
export async function deleteSeason(seasonId) {
  return request(`/seasons/${seasonId}`, {
    method: "DELETE",
  });
}
