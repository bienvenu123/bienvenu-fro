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
 * GET /player-contracts - Fetch all player contracts
 * @returns {Promise<Array>} List of player contracts
 */
export async function getPlayerContracts() {
  return request("/player-contracts");
}

/**
 * GET /player-contracts/:contract_id - Fetch a single player contract by id
 * @param {number} contractId
 * @returns {Promise<Object>} Player contract object
 */
export async function getPlayerContractById(contractId) {
  return request(`/player-contracts/${contractId}`);
}

/**
 * POST /player-contracts - Create a new player contract
 * @param {Object} playerContract - { contract_id, player_id, team_id, start_date, end_date?, shirt_number?, is_on_loan?, parent_team_id?, weekly_salary?, contract_type }
 * @returns {Promise<Object>} Created player contract
 */
export async function createPlayerContract(playerContract) {
  return request("/player-contracts", {
    method: "POST",
    body: JSON.stringify(playerContract),
  });
}

/**
 * PUT /player-contracts/:contract_id - Update an existing player contract
 * @param {number} contractId
 * @param {Object} updates - { player_id?, team_id?, start_date?, end_date?, shirt_number?, is_on_loan?, parent_team_id?, weekly_salary?, contract_type? }
 * @returns {Promise<Object>} Updated player contract
 */
export async function updatePlayerContract(contractId, updates) {
  return request(`/player-contracts/${contractId}`, {
    method: "PUT",
    body: JSON.stringify(updates),
  });
}

/**
 * DELETE /player-contracts/:contract_id - Delete a player contract
 * @param {number} contractId
 * @returns {Promise<Object>} { message: "..." }
 */
export async function deletePlayerContract(contractId) {
  return request(`/player-contracts/${contractId}`, {
    method: "DELETE",
  });
}
