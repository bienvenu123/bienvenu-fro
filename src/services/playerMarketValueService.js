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
 * GET /player-market-values - Fetch all player market values
 * @returns {Promise<Array>} List of player market values
 */
export async function getPlayerMarketValues() {
  return request("/player-market-values");
}

/**
 * GET /player-market-values/:market_value_id - Fetch a single player market value by id
 * @param {number} marketValueId
 * @returns {Promise<Object>} Player market value object
 */
export async function getPlayerMarketValueById(marketValueId) {
  return request(`/player-market-values/${marketValueId}`);
}

/**
 * POST /player-market-values - Create a new player market value
 * @param {Object} playerMarketValue - { market_value_id, player_id, value_eur, valuation_date, source? }
 * @returns {Promise<Object>} Created player market value
 */
export async function createPlayerMarketValue(playerMarketValue) {
  return request("/player-market-values", {
    method: "POST",
    body: JSON.stringify(playerMarketValue),
  });
}

/**
 * PUT /player-market-values/:market_value_id - Update an existing player market value
 * @param {number} marketValueId
 * @param {Object} updates - { player_id?, value_eur?, valuation_date?, source? }
 * @returns {Promise<Object>} Updated player market value
 */
export async function updatePlayerMarketValue(marketValueId, updates) {
  return request(`/player-market-values/${marketValueId}`, {
    method: "PUT",
    body: JSON.stringify(updates),
  });
}

/**
 * DELETE /player-market-values/:market_value_id - Delete a player market value
 * @param {number} marketValueId
 * @returns {Promise<Object>} { message: "..." }
 */
export async function deletePlayerMarketValue(marketValueId) {
  return request(`/player-market-values/${marketValueId}`, {
    method: "DELETE",
  });
}
