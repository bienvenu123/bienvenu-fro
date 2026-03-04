import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { getMatchEvents, createMatchEvent, updateMatchEvent, deleteMatchEvent } from '../services/matchEventService';
import { getMatches } from '../services/matchService';
import { getTeams } from '../services/teamService';
import { getPlayers } from '../services/playerService';
import './MatchEvents.css';

function MatchEvents() {
  const [events, setEvents] = useState([]);
  const [matches, setMatches] = useState([]);
  const [teams, setTeams] = useState([]);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    event_id: '',
    match_id: '',
    team_id: '',
    player_id: '',
    event_type: 'goal',
    minute: '',
    extra_time_minute: '',
    assist_player_id: '',
    substituted_player_id: '',
    description: '',
  });

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [eventsData, matchesData, teamsData] = await Promise.all([
        getMatchEvents(),
        getMatches().catch(() => []),
        getTeams().catch(() => []),
      ]);
      setEvents(eventsData);
      setMatches(matchesData);
      setTeams(teamsData);

      // Try to load players
      try {
        const playersData = await getPlayers();
        setPlayers(playersData);
      } catch (err) {
        console.warn('Players endpoint not available:', err);
      }
    } catch (err) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getMatchName = (matchId) => {
    const m = matches.find((x) => x.match_id === matchId);
    if (!m) return `Match #${matchId}`;
    const homeTeam = teams.find((t) => t.team_id === m.home_team_id);
    const awayTeam = teams.find((t) => t.team_id === m.away_team_id);
    const homeName = homeTeam ? homeTeam.name : `Team #${m.home_team_id}`;
    const awayName = awayTeam ? awayTeam.name : `Team #${m.away_team_id}`;
    return `${homeName} vs ${awayName}`;
  };

  const getTeamName = (teamId) => {
    const t = teams.find((x) => x.team_id === teamId);
    return t ? t.name : `Team #${teamId}`;
  };

  const getPlayerName = (playerId) => {
    if (!playerId) return '—';
    const p = players.find((x) => x.player_id === playerId);
    return p ? (p.name || `Player #${playerId}`) : `Player #${playerId}`;
  };

  const getEventTypeBadgeClass = (eventType) => {
    switch (eventType) {
      case 'goal':
      case 'penalty':
        return 'badge-success';
      case 'own_goal':
        return 'badge-danger';
      case 'yellow_card':
        return 'badge-warning';
      case 'red_card':
        return 'badge-danger';
      case 'substitution':
        return 'badge-info';
      default:
        return 'badge-gray';
    }
  };

  const formatEventType = (eventType) => {
    return eventType
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const formatMinute = (minute, extraTime) => {
    if (extraTime !== null && extraTime !== undefined) {
      return `${minute}+${extraTime}'`;
    }
    return `${minute}'`;
  };

  const openCreate = () => {
    setEditing(null);
    setForm({
      event_id: '',
      match_id: matches[0]?.match_id ?? '',
      team_id: teams[0]?.team_id ?? '',
      player_id: players[0]?.player_id ?? '',
      event_type: 'goal',
      minute: '',
      extra_time_minute: '',
      assist_player_id: '',
      substituted_player_id: '',
      description: '',
    });
    setModalOpen(true);
  };

  const openEdit = (event) => {
    setEditing(event);
    setForm({
      event_id: String(event.event_id),
      match_id: event.match_id ?? '',
      team_id: event.team_id ?? '',
      player_id: event.player_id ?? '',
      event_type: event.event_type || 'goal',
      minute: String(event.minute ?? ''),
      extra_time_minute: event.extra_time_minute !== null ? String(event.extra_time_minute) : '',
      assist_player_id: event.assist_player_id ?? '',
      substituted_player_id: event.substituted_player_id ?? '',
      description: event.description || '',
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      const payload = {
        match_id: parseInt(form.match_id, 10) || null,
        team_id: parseInt(form.team_id, 10) || null,
        player_id: parseInt(form.player_id, 10) || null,
        event_type: form.event_type,
        minute: parseInt(form.minute, 10) || 0,
        extra_time_minute: form.extra_time_minute ? parseInt(form.extra_time_minute, 10) : null,
        assist_player_id: form.assist_player_id ? parseInt(form.assist_player_id, 10) : null,
        substituted_player_id: form.substituted_player_id ? parseInt(form.substituted_player_id, 10) : null,
        description: form.description.trim() || null,
      };

      if (editing) {
        await updateMatchEvent(editing.event_id, payload);
      } else {
        const eventId = parseInt(form.event_id, 10);
        if (!eventId || eventId < 1) {
          setError('Event ID must be a positive number');
          return;
        }
        await createMatchEvent({ event_id: eventId, ...payload });
      }
      closeModal();
      loadData();
    } catch (err) {
      setError(err.message || 'Operation failed');
    }
  };

  const handleDelete = async (event) => {
    if (!window.confirm(`Delete match event #${event.event_id}?`)) return;
    try {
      setError(null);
      await deleteMatchEvent(event.event_id);
      loadData();
    } catch (err) {
      setError(err.message || 'Delete failed');
    }
  };

  const filtered = events.filter(
    (e) =>
      getMatchName(e.match_id)?.toLowerCase().includes(search.toLowerCase()) ||
      getTeamName(e.team_id)?.toLowerCase().includes(search.toLowerCase()) ||
      getPlayerName(e.player_id)?.toLowerCase().includes(search.toLowerCase()) ||
      formatEventType(e.event_type)?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="data-page">
      <div className="data-toolbar">
        <div className="data-search">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search match events..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className="data-add-btn" onClick={openCreate}>
          <Plus size={18} />
          Add Match Event
        </button>
      </div>

      {error && (
        <div className="data-error" role="alert">
          {error}
        </div>
      )}

      <div className="data-table-wrapper">
        {loading ? (
          <div className="data-loading">Loading...</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Match</th>
                <th>Team</th>
                <th>Player</th>
                <th>Event Type</th>
                <th>Minute</th>
                <th>Assist</th>
                <th>Substituted</th>
                <th>Description</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((event) => (
                <tr key={event.event_id}>
                  <td>{event.event_id}</td>
                  <td className="data-cell-name">{getMatchName(event.match_id)}</td>
                  <td>{getTeamName(event.team_id)}</td>
                  <td>{getPlayerName(event.player_id)}</td>
                  <td>
                    <span className={`badge ${getEventTypeBadgeClass(event.event_type)}`}>
                      {formatEventType(event.event_type)}
                    </span>
                  </td>
                  <td>{formatMinute(event.minute, event.extra_time_minute)}</td>
                  <td>{getPlayerName(event.assist_player_id)}</td>
                  <td>{getPlayerName(event.substituted_player_id)}</td>
                  <td>{event.description || '—'}</td>
                  <td>
                    <div className="action-btns">
                      <button className="edit-btn" onClick={() => openEdit(event)}>
                        <Pencil size={14} /> Edit
                      </button>
                      <button className="delete-btn" onClick={() => handleDelete(event)} aria-label="Delete">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!loading && filtered.length === 0 && (
          <div className="data-empty">No match events found</div>
        )}
      </div>

      {modalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal modal-extra-wide" onClick={(e) => e.stopPropagation()}>
            <h2>{editing ? 'Edit Match Event' : 'Add Match Event'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="modal-grid">
                <div className="modal-row">
                  <label>Event ID *</label>
                  <input
                    type="number"
                    min="1"
                    value={form.event_id}
                    onChange={(e) => setForm({ ...form, event_id: e.target.value })}
                    disabled={!!editing}
                    required
                  />
                </div>
                <div className="modal-row">
                  <label>Match *</label>
                  {matches.length > 0 ? (
                    <select
                      value={form.match_id}
                      onChange={(e) => setForm({ ...form, match_id: e.target.value })}
                      required
                    >
                      <option value="">Select match</option>
                      {matches.map((m) => {
                        const homeTeam = teams.find((t) => t.team_id === m.home_team_id);
                        const awayTeam = teams.find((t) => t.team_id === m.away_team_id);
                        const homeName = homeTeam ? homeTeam.name : `Team #${m.home_team_id}`;
                        const awayName = awayTeam ? awayTeam.name : `Team #${m.away_team_id}`;
                        return (
                          <option key={m.match_id} value={m.match_id}>
                            {homeName} vs {awayName}
                          </option>
                        );
                      })}
                    </select>
                  ) : (
                    <input
                      type="number"
                      min="1"
                      value={form.match_id}
                      onChange={(e) => setForm({ ...form, match_id: e.target.value })}
                      placeholder="Match ID"
                      required
                    />
                  )}
                </div>
                <div className="modal-row">
                  <label>Team *</label>
                  {teams.length > 0 ? (
                    <select
                      value={form.team_id}
                      onChange={(e) => setForm({ ...form, team_id: e.target.value })}
                      required
                    >
                      <option value="">Select team</option>
                      {teams.map((t) => (
                        <option key={t.team_id} value={t.team_id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="number"
                      min="1"
                      value={form.team_id}
                      onChange={(e) => setForm({ ...form, team_id: e.target.value })}
                      placeholder="Team ID"
                      required
                    />
                  )}
                </div>
                <div className="modal-row">
                  <label>Player *</label>
                  {players.length > 0 ? (
                    <select
                      value={form.player_id}
                      onChange={(e) => setForm({ ...form, player_id: e.target.value })}
                      required
                    >
                      <option value="">Select player</option>
                      {players.map((p) => (
                        <option key={p.player_id} value={p.player_id}>
                          {p.name || `Player #${p.player_id}`}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="number"
                      min="1"
                      value={form.player_id}
                      onChange={(e) => setForm({ ...form, player_id: e.target.value })}
                      placeholder="Player ID"
                      required
                    />
                  )}
                </div>
                <div className="modal-row">
                  <label>Event Type *</label>
                  <select
                    value={form.event_type}
                    onChange={(e) => setForm({ ...form, event_type: e.target.value })}
                    required
                  >
                    <option value="goal">Goal</option>
                    <option value="own_goal">Own Goal</option>
                    <option value="penalty">Penalty</option>
                    <option value="yellow_card">Yellow Card</option>
                    <option value="red_card">Red Card</option>
                    <option value="substitution">Substitution</option>
                  </select>
                </div>
                <div className="modal-row">
                  <label>Minute *</label>
                  <input
                    type="number"
                    min="0"
                    max="130"
                    value={form.minute}
                    onChange={(e) => setForm({ ...form, minute: e.target.value })}
                    required
                  />
                </div>
                <div className="modal-row">
                  <label>Extra Time Minute</label>
                  <input
                    type="number"
                    min="0"
                    max="30"
                    value={form.extra_time_minute}
                    onChange={(e) => setForm({ ...form, extra_time_minute: e.target.value })}
                    placeholder="0-30"
                  />
                </div>
                <div className="modal-row">
                  <label>Assist Player</label>
                  {players.length > 0 ? (
                    <select
                      value={form.assist_player_id}
                      onChange={(e) => setForm({ ...form, assist_player_id: e.target.value })}
                    >
                      <option value="">None</option>
                      {players.map((p) => (
                        <option key={p.player_id} value={p.player_id}>
                          {p.name || `Player #${p.player_id}`}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="number"
                      min="1"
                      value={form.assist_player_id}
                      onChange={(e) => setForm({ ...form, assist_player_id: e.target.value })}
                      placeholder="Assist Player ID (optional)"
                    />
                  )}
                </div>
                <div className="modal-row">
                  <label>Substituted Player</label>
                  {players.length > 0 ? (
                    <select
                      value={form.substituted_player_id}
                      onChange={(e) => setForm({ ...form, substituted_player_id: e.target.value })}
                    >
                      <option value="">None</option>
                      {players.map((p) => (
                        <option key={p.player_id} value={p.player_id}>
                          {p.name || `Player #${p.player_id}`}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="number"
                      min="1"
                      value={form.substituted_player_id}
                      onChange={(e) => setForm({ ...form, substituted_player_id: e.target.value })}
                      placeholder="Substituted Player ID (optional)"
                    />
                  )}
                </div>
                <div className="modal-row" style={{ gridColumn: '1 / -1' }}>
                  <label>Description</label>
                  <textarea
                    rows="2"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Optional description..."
                  />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="modal-cancel" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="modal-submit">
                  {editing ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default MatchEvents;
