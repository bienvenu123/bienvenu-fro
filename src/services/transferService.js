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
 * GET /transfers - Fetch all transfers
 * @returns {Promise<Array>} List of transfers
 */
export async function getTransfers() {
  return request("/transfers");
}

/**
 * GET /transfers/:transfer_id - Fetch a single transfer by id
 * @param {number} transferId
 * @returns {Promise<Object>} Transfer object
 */
export async function getTransferById(transferId) {
  return request(`/transfers/${transferId}`);
}

/**
 * POST /transfers - Create a new transfer
 * @param {Object} transfer - Transfer object
 * @returns {Promise<Object>} Created transfer
 */
export async function createTransfer(transfer) {
  return request("/transfers", {
    method: "POST",
    body: JSON.stringify(transfer),
  });
}

/**
 * PUT /transfers/:transfer_id - Update an existing transfer
 * @param {number} transferId
 * @param {Object} updates - Update fields
 * @returns {Promise<Object>} Updated transfer
 */
export async function updateTransfer(transferId, updates) {
  return request(`/transfers/${transferId}`, {
    method: "PUT",
    body: JSON.stringify(updates),
  });
}

/**
 * DELETE /transfers/:transfer_id - Delete a transfer
 * @param {number} transferId
 * @returns {Promise<Object>} { message: "..." }
 */
export async function deleteTransfer(transferId) {
  return request(`/transfers/${transferId}`, {
    method: "DELETE",
  });
}
