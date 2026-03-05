import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { getMatches, createMatch, updateMatch, deleteMatch } from '../services/matchService';
import { getLeagues } from '../services/leagueService';
import { getTeams } from '../services/teamService';
import { getSeasons } from '../services/seasonService';
import { getReferees } from '../services/refereeService';
import './Matches.css';

function Matches() {
  const [matches, setMatches] = useState([]);
  const [leagues, setLeagues] = useState([]);
  const [teams, setTeams] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [referees, setReferees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    match_id: '',
    league_id: '',
    season_id: '',
    home_team_id: '',
    away_team_id: '',
    match_date: new Date().toISOString().split('T')[0],
    venue: '',
    matchweek: '',
    home_score: '',
    away_score: '',
    home_halftime_score: '',
    away_halftime_score: '',
    status: 'scheduled',
    attendance: '',
    referee_id: '',
  });

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [matchesData, leaguesData, teamsData] = await Promise.all([
        getMatches(),
        getLeagues().catch(() => []),
        getTeams().catch(() => []),
      ]);
      setMatches(matchesData);
      setLeagues(leaguesData);
      setTeams(teamsData);

      // Try to load optional related data
      try {
        const seasonsData = await getSeasons();
        setSeasons(seasonsData);
      } catch (err) {
        console.warn('Seasons endpoint not available:', err);
      }

      try {
        const refereesData = await getReferees();
        setReferees(refereesData);
      } catch (err) {
        console.warn('Referees endpoint not available:', err);
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

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
      return dateString;
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '—';
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
      return dateString;
    }
  };

  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toISOString().slice(0, 16); // For datetime-local input
    } catch {
      return '';
    }
  };

  const getLeagueName = (leagueId) => {
    const l = leagues.find((x) => x.league_id === leagueId);
    return l ? l.name : `League #${leagueId}`;
  };

  const getTeamName = (teamId) => {
    const t = teams.find((x) => x.team_id === teamId);
    return t ? t.name : `Team #${teamId}`;
  };


  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'scheduled':
        return 'badge-info';
      case 'live':
        return 'badge-danger';
      case 'finished':
        return 'badge-success';
      case 'postponed':
        return 'badge-warning';
      case 'cancelled':
        return 'badge-gray';
      default:
        return 'badge-gray';
    }
  };

  const openCreate = () => {
    setEditing(null);
    setForm({
      match_id: '',
      league_id: leagues[0]?.league_id ?? '',
      season_id: seasons[0]?.season_id ?? '',
      home_team_id: teams[0]?.team_id ?? '',
      away_team_id: '',
      match_date: new Date().toISOString().slice(0, 16),
      venue: '',
      matchweek: '',
      home_score: '',
      away_score: '',
      home_halftime_score: '',
      away_halftime_score: '',
      status: 'scheduled',
      attendance: '',
      referee_id: '',
    });
    setModalOpen(true);
  };

  const openEdit = (match) => {
    setEditing(match);
    setForm({
      match_id: String(match.match_id),
      league_id: match.league_id ?? '',
      season_id: match.season_id ?? '',
      home_team_id: match.home_team_id ?? '',
      away_team_id: match.away_team_id ?? '',
      match_date: formatDateForInput(match.match_date),
      venue: match.venue || '',
      matchweek: match.matchweek ?? '',
      home_score: match.home_score ?? '',
      away_score: match.away_score ?? '',
      home_halftime_score: match.home_halftime_score ?? '',
      away_halftime_score: match.away_halftime_score ?? '',
      status: match.status || 'scheduled',
      attendance: match.attendance ?? '',
      referee_id: match.referee_id ?? '',
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
        league_id: parseInt(form.league_id, 10) || null,
        season_id: parseInt(form.season_id, 10) || null,
        home_team_id: parseInt(form.home_team_id, 10) || null,
        away_team_id: parseInt(form.away_team_id, 10) || null,
        match_date: form.match_date || null,
        venue: form.venue.trim() || null,
        matchweek: form.matchweek ? parseInt(form.matchweek, 10) : null,
        home_score: form.home_score ? parseInt(form.home_score, 10) : null,
        away_score: form.away_score ? parseInt(form.away_score, 10) : null,
        home_halftime_score: form.home_halftime_score ? parseInt(form.home_halftime_score, 10) : null,
        away_halftime_score: form.away_halftime_score ? parseInt(form.away_halftime_score, 10) : null,
        status: form.status,
        attendance: form.attendance ? parseInt(form.attendance, 10) : null,
        referee_id: form.referee_id ? parseInt(form.referee_id, 10) : null,
      };

      if (editing) {
        await updateMatch(editing.match_id, payload);
      } else {
        const matchId = parseInt(form.match_id, 10);
        if (!matchId || matchId < 1) {
          setError('Match ID must be a positive number');
          return;
        }
        await createMatch({ match_id: matchId, ...payload });
      }
      closeModal();
      loadData();
    } catch (err) {
      setError(err.message || 'Operation failed');
    }
  };

  const handleDelete = async (match) => {
    if (!window.confirm(`Delete match #${match.match_id}?`)) return;
    try {
      setError(null);
      await deleteMatch(match.match_id);
      loadData();
    } catch (err) {
      setError(err.message || 'Delete failed');
    }
  };

  const filtered = matches.filter(
    (m) =>
      getLeagueName(m.league_id)?.toLowerCase().includes(search.toLowerCase()) ||
      getTeamName(m.home_team_id)?.toLowerCase().includes(search.toLowerCase()) ||
      getTeamName(m.away_team_id)?.toLowerCase().includes(search.toLowerCase()) ||
      m.status?.toLowerCase().includes(search.toLowerCase()) ||
      formatDate(m.match_date)?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="data-page">
      <div className="data-toolbar">
        <div className="data-search">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search matches..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className="data-add-btn" onClick={openCreate}>
          <Plus size={18} />
          Add Match
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
                <th>Date</th>
                <th>League</th>
                <th>Home Team</th>
                <th>Score</th>
                <th>Away Team</th>
                <th>Status</th>
                <th>Venue</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((match) => (
                <tr key={match.match_id}>
                  <td>{match.match_id}</td>
                  <td>{formatDateTime(match.match_date)}</td>
                  <td>{getLeagueName(match.league_id)}</td>
                  <td className="data-cell-name">{getTeamName(match.home_team_id)}</td>
                  <td>
                    {match.home_score !== null && match.away_score !== null ? (
                      <strong>{match.home_score} - {match.away_score}</strong>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="data-cell-name">{getTeamName(match.away_team_id)}</td>
                  <td>
                    <span className={`badge ${getStatusBadgeClass(match.status)}`}>
                      {match.status}
                    </span>
                  </td>
                  <td>{match.venue || '—'}</td>
                  <td>
                    <div className="action-btns">
                      <button className="edit-btn" onClick={() => openEdit(match)}>
                        <Pencil size={14} /> Edit
                      </button>
                      <button className="delete-btn" onClick={() => handleDelete(match)} aria-label="Delete">
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
          <div className="data-empty">No matches found</div>
        )}
      </div>

      {modalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal modal-extra-wide" onClick={(e) => e.stopPropagation()}>
            <h2>{editing ? 'Edit Match' : 'Add Match'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="modal-grid">
                <div className="modal-row">
                  <label>Match ID *</label>
                  <input
                    type="number"
                    min="1"
                    value={form.match_id}
                    onChange={(e) => setForm({ ...form, match_id: e.target.value })}
                    disabled={!!editing}
                    required
                  />
                </div>
                <div className="modal-row">
                  <label>League *</label>
                  {leagues.length > 0 ? (
                    <select
                      value={form.league_id}
                      onChange={(e) => setForm({ ...form, league_id: e.target.value })}
                      required
                    >
                      <option value="">Select league</option>
                      {leagues.map((l) => (
                        <option key={l.league_id} value={l.league_id}>
                          {l.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="number"
                      min="1"
                      value={form.league_id}
                      onChange={(e) => setForm({ ...form, league_id: e.target.value })}
                      placeholder="League ID"
                      required
                    />
                  )}
                </div>
                <div className="modal-row">
                  <label>Season *</label>
                  {seasons.length > 0 ? (
                    <select
                      value={form.season_id}
                      onChange={(e) => setForm({ ...form, season_id: e.target.value })}
                      required
                    >
                      <option value="">Select season</option>
                      {seasons.map((s) => (
                        <option key={s.season_id} value={s.season_id}>
                          {s.name || `Season #${s.season_id}`}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="number"
                      min="1"
                      value={form.season_id}
                      onChange={(e) => setForm({ ...form, season_id: e.target.value })}
                      placeholder="Season ID"
                      required
                    />
                  )}
                </div>
                <div className="modal-row">
                  <label>Home Team *</label>
                  {teams.length > 0 ? (
                    <select
                      value={form.home_team_id}
                      onChange={(e) => setForm({ ...form, home_team_id: e.target.value })}
                      required
                    >
                      <option value="">Select home team</option>
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
                      value={form.home_team_id}
                      onChange={(e) => setForm({ ...form, home_team_id: e.target.value })}
                      placeholder="Home Team ID"
                      required
                    />
                  )}
                </div>
                <div className="modal-row">
                  <label>Away Team *</label>
                  {teams.length > 0 ? (
                    <select
                      value={form.away_team_id}
                      onChange={(e) => setForm({ ...form, away_team_id: e.target.value })}
                      required
                    >
                      <option value="">Select away team</option>
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
                      value={form.away_team_id}
                      onChange={(e) => setForm({ ...form, away_team_id: e.target.value })}
                      placeholder="Away Team ID"
                      required
                    />
                  )}
                </div>
                <div className="modal-row">
                  <label>Match Date & Time *</label>
                  <input
                    type="datetime-local"
                    value={form.match_date}
                    onChange={(e) => setForm({ ...form, match_date: e.target.value })}
                    required
                  />
                </div>
                <div className="modal-row">
                  <label>Status *</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    required
                  >
                    <option value="scheduled">Scheduled</option>
                    <option value="live">Live</option>
                    <option value="finished">Finished</option>
                    <option value="postponed">Postponed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div className="modal-row">
                  <label>Venue</label>
                  <input
                    type="text"
                    maxLength="100"
                    value={form.venue}
                    onChange={(e) => setForm({ ...form, venue: e.target.value })}
                    placeholder="e.g. Old Trafford"
                  />
                </div>
                <div className="modal-row">
                  <label>Matchweek</label>
                  <input
                    type="number"
                    min="0"
                    value={form.matchweek}
                    onChange={(e) => setForm({ ...form, matchweek: e.target.value })}
                    placeholder="e.g. 1"
                  />
                </div>
                <div className="modal-row">
                  <label>Home Score</label>
                  <input
                    type="number"
                    min="0"
                    value={form.home_score}
                    onChange={(e) => setForm({ ...form, home_score: e.target.value })}
                    placeholder="0"
                  />
                </div>
                <div className="modal-row">
                  <label>Away Score</label>
                  <input
                    type="number"
                    min="0"
                    value={form.away_score}
                    onChange={(e) => setForm({ ...form, away_score: e.target.value })}
                    placeholder="0"
                  />
                </div>
                <div className="modal-row">
                  <label>Home Halftime Score</label>
                  <input
                    type="number"
                    min="0"
                    value={form.home_halftime_score}
                    onChange={(e) => setForm({ ...form, home_halftime_score: e.target.value })}
                    placeholder="0"
                  />
                </div>
                <div className="modal-row">
                  <label>Away Halftime Score</label>
                  <input
                    type="number"
                    min="0"
                    value={form.away_halftime_score}
                    onChange={(e) => setForm({ ...form, away_halftime_score: e.target.value })}
                    placeholder="0"
                  />
                </div>
                <div className="modal-row">
                  <label>Attendance</label>
                  <input
                    type="number"
                    min="0"
                    value={form.attendance}
                    onChange={(e) => setForm({ ...form, attendance: e.target.value })}
                    placeholder="e.g. 75000"
                  />
                </div>
                <div className="modal-row">
                  <label>Referee</label>
                  {referees.length > 0 ? (
                    <select
                      value={form.referee_id}
                      onChange={(e) => setForm({ ...form, referee_id: e.target.value })}
                    >
                      <option value="">None</option>
                      {referees.map((r) => {
                        const fullName = `${r.first_name || ''} ${r.last_name || ''}`.trim() || `Referee #${r.referee_id}`;
                        return (
                          <option key={r.referee_id} value={r.referee_id}>
                            {fullName}
                          </option>
                        );
                      })}
                    </select>
                  ) : (
                    <input
                      type="number"
                      min="1"
                      value={form.referee_id}
                      onChange={(e) => setForm({ ...form, referee_id: e.target.value })}
                      placeholder="Referee ID (optional)"
                    />
                  )}
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

export default Matches;
