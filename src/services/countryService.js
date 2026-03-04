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
 * GET /countries - Fetch all countries
 * @returns {Promise<Array>} List of countries
 */
export async function getCountries() {
  return request("/countries");
}

/**
 * GET /countries/:country_id - Fetch a single country by id
 * @param {number} countryId
 * @returns {Promise<Object>} Country object
 */
export async function getCountryById(countryId) {
  return request(`/countries/${countryId}`);
}

/**
 * POST /countries - Create a new country
 * @param {Object} country - { country_id, name, code, flag_url?, continent? }
 * @returns {Promise<Object>} Created country
 */
export async function createCountry(country) {
  return request("/countries", {
    method: "POST",
    body: JSON.stringify(country),
  });
}

/**
 * PUT /countries/:country_id - Update an existing country
 * @param {number} countryId
 * @param {Object} updates - { name?, code?, flag_url?, continent? }
 * @returns {Promise<Object>} Updated country
 */
export async function updateCountry(countryId, updates) {
  return request(`/countries/${countryId}`, {
    method: "PUT",
    body: JSON.stringify(updates),
  });
}

/**
 * DELETE /countries/:country_id - Delete a country
 * @param {number} countryId
 * @returns {Promise<Object>} { message: "Country deleted" }
 */
export async function deleteCountry(countryId) {
  return request(`/countries/${countryId}`, {
    method: "DELETE",
  });
}
