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
 * GET /match-events - Fetch all match events
 * @returns {Promise<Array>} List of match events
 */
export async function getMatchEvents() {
  return request("/match-events");
}

/**
 * GET /match-events/:event_id - Fetch a single match event by id
 * @param {number} eventId
 * @returns {Promise<Object>} Match event object
 */
export async function getMatchEventById(eventId) {
  return request(`/match-events/${eventId}`);
}

/**
 * POST /match-events - Create a new match event
 * @param {Object} matchEvent - { event_id, match_id, team_id, player_id, event_type, minute, extra_time_minute?, assist_player_id?, substituted_player_id?, description? }
 * @returns {Promise<Object>} Created match event
 */
export async function createMatchEvent(matchEvent) {
  return request("/match-events", {
    method: "POST",
    body: JSON.stringify(matchEvent),
  });
}

/**
 * PUT /match-events/:event_id - Update an existing match event
 * @param {number} eventId
 * @param {Object} updates - { match_id?, team_id?, player_id?, event_type?, minute?, extra_time_minute?, assist_player_id?, substituted_player_id?, description? }
 * @returns {Promise<Object>} Updated match event
 */
export async function updateMatchEvent(eventId, updates) {
  return request(`/match-events/${eventId}`, {
    method: "PUT",
    body: JSON.stringify(updates),
  });
}

/**
 * DELETE /match-events/:event_id - Delete a match event
 * @param {number} eventId
 * @returns {Promise<Object>} { message: "..." }
 */
export async function deleteMatchEvent(eventId) {
  return request(`/match-events/${eventId}`, {
    method: "DELETE",
  });
}
