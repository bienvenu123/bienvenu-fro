import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { getStandings, createStanding, updateStanding, deleteStanding } from '../services/standingService';
import { getLeagues } from '../services/leagueService';
import { getSeasons } from '../services/seasonService';
import { getTeams } from '../services/teamService';
import './Standings.css';

function Standings() {
  const [standings, setStandings] = useState([]);
  const [leagues, setLeagues] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    standing_id: '',
    league_id: '',
    season_id: '',
    team_id: '',
    position: '1',
    played: '0',
    won: '0',
    drawn: '0',
    lost: '0',
    goals_for: '0',
    goals_against: '0',
    goal_difference: '0',
    points: '0',
    form: '',
    updated_at: '',
  });

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [standingsData, leaguesData, teamsData] = await Promise.all([
        getStandings(),
        getLeagues().catch(() => []),
        getTeams().catch(() => []),
      ]);
      setStandings(standingsData);
      setLeagues(leaguesData);
      setTeams(teamsData);

      // Try to load seasons
      try {
        const seasonsData = await getSeasons();
        setSeasons(seasonsData);
      } catch (err) {
        console.warn('Seasons endpoint not available:', err);
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

  const getLeagueName = (leagueId) => {
    const l = leagues.find((x) => x.league_id === leagueId);
    return l ? l.name : `League #${leagueId}`;
  };

  const getSeasonName = (seasonId) => {
    if (!seasonId) return '—';
    const s = seasons.find((x) => x.season_id === seasonId);
    return s ? (s.name || `Season #${seasonId}`) : `Season #${seasonId}`;
  };

  const getTeamName = (teamId) => {
    const t = teams.find((x) => x.team_id === teamId);
    return t ? t.name : `Team #${teamId}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
      return dateString;
    }
  };

  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toISOString().slice(0, 16);
    } catch {
      return '';
    }
  };

  const formatGoalDifference = (gd) => {
    if (gd === null || gd === undefined) return '0';
    return gd > 0 ? `+${gd}` : String(gd);
  };

  const openCreate = () => {
    setEditing(null);
    setForm({
      standing_id: '',
      league_id: leagues[0]?.league_id ?? '',
      season_id: seasons[0]?.season_id ?? '',
      team_id: teams[0]?.team_id ?? '',
      position: '1',
      played: '0',
      won: '0',
      drawn: '0',
      lost: '0',
      goals_for: '0',
      goals_against: '0',
      goal_difference: '0',
      points: '0',
      form: '',
      updated_at: '',
    });
    setModalOpen(true);
  };

  const openEdit = (standing) => {
    setEditing(standing);
    setForm({
      standing_id: String(standing.standing_id),
      league_id: standing.league_id ?? '',
      season_id: standing.season_id ?? '',
      team_id: standing.team_id ?? '',
      position: String(standing.position ?? 1),
      played: String(standing.played ?? 0),
      won: String(standing.won ?? 0),
      drawn: String(standing.drawn ?? 0),
      lost: String(standing.lost ?? 0),
      goals_for: String(standing.goals_for ?? 0),
      goals_against: String(standing.goals_against ?? 0),
      goal_difference: String(standing.goal_difference ?? 0),
      points: String(standing.points ?? 0),
      form: standing.form || '',
      updated_at: standing.updated_at ? formatDateForInput(standing.updated_at) : '',
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
        team_id: parseInt(form.team_id, 10) || null,
        position: parseInt(form.position, 10) || 1,
        played: parseInt(form.played, 10) || 0,
        won: parseInt(form.won, 10) || 0,
        drawn: parseInt(form.drawn, 10) || 0,
        lost: parseInt(form.lost, 10) || 0,
        goals_for: parseInt(form.goals_for, 10) || 0,
        goals_against: parseInt(form.goals_against, 10) || 0,
        goal_difference: parseInt(form.goal_difference, 10) || 0,
        points: parseInt(form.points, 10) || 0,
        form: form.form.trim() || null,
        updated_at: form.updated_at || null,
      };

      if (editing) {
        await updateStanding(editing.standing_id, payload);
      } else {
        const standingId = parseInt(form.standing_id, 10);
        if (!standingId || standingId < 1) {
          setError('Standing ID must be a positive number');
          return;
        }
        await createStanding({ standing_id: standingId, ...payload });
      }
      closeModal();
      loadData();
    } catch (err) {
      setError(err.message || 'Operation failed');
    }
  };

  const handleDelete = async (standing) => {
    if (!window.confirm(`Delete standing for ${getTeamName(standing.team_id)}?`)) return;
    try {
      setError(null);
      await deleteStanding(standing.standing_id);
      loadData();
    } catch (err) {
      setError(err.message || 'Delete failed');
    }
  };

  const filtered = standings.filter(
    (s) =>
      getLeagueName(s.league_id)?.toLowerCase().includes(search.toLowerCase()) ||
      getSeasonName(s.season_id)?.toLowerCase().includes(search.toLowerCase()) ||
      getTeamName(s.team_id)?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="data-page">
      <div className="data-toolbar">
        <div className="data-search">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search standings..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className="data-add-btn" onClick={openCreate}>
          <Plus size={18} />
          Add Standing
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
                <th>League</th>
                <th>Season</th>
                <th>Team</th>
                <th>Pos</th>
                <th>P</th>
                <th>W</th>
                <th>D</th>
                <th>L</th>
                <th>GF</th>
                <th>GA</th>
                <th>GD</th>
                <th>Pts</th>
                <th>Form</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((standing) => (
                <tr key={standing.standing_id}>
                  <td>{standing.standing_id}</td>
                  <td>{getLeagueName(standing.league_id)}</td>
                  <td>{getSeasonName(standing.season_id)}</td>
                  <td className="data-cell-name">{getTeamName(standing.team_id)}</td>
                  <td>
                    <strong className="position-value">{standing.position}</strong>
                  </td>
                  <td>{standing.played || 0}</td>
                  <td>{standing.won || 0}</td>
                  <td>{standing.drawn || 0}</td>
                  <td>{standing.lost || 0}</td>
                  <td>{standing.goals_for || 0}</td>
                  <td>{standing.goals_against || 0}</td>
                  <td>
                    <span className={`goal-diff ${standing.goal_difference > 0 ? 'positive' : standing.goal_difference < 0 ? 'negative' : ''}`}>
                      {formatGoalDifference(standing.goal_difference)}
                    </span>
                  </td>
                  <td>
                    <strong className="points-value">{standing.points || 0}</strong>
                  </td>
                  <td>
                    {standing.form ? (
                      <span className="form-string">{standing.form}</span>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td>
                    <div className="action-btns">
                      <button className="edit-btn" onClick={() => openEdit(standing)}>
                        <Pencil size={14} /> Edit
                      </button>
                      <button className="delete-btn" onClick={() => handleDelete(standing)} aria-label="Delete">
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
          <div className="data-empty">No standings found</div>
        )}
      </div>

      {modalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal modal-extra-wide" onClick={(e) => e.stopPropagation()}>
            <h2>{editing ? 'Edit Standing' : 'Add Standing'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="modal-grid">
                <div className="modal-row">
                  <label>Standing ID *</label>
                  <input
                    type="number"
                    min="1"
                    value={form.standing_id}
                    onChange={(e) => setForm({ ...form, standing_id: e.target.value })}
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
                  <label>Position *</label>
                  <input
                    type="number"
                    min="1"
                    value={form.position}
                    onChange={(e) => setForm({ ...form, position: e.target.value })}
                    required
                  />
                </div>
                <div className="modal-row">
                  <label>Played</label>
                  <input
                    type="number"
                    min="0"
                    value={form.played}
                    onChange={(e) => setForm({ ...form, played: e.target.value })}
                    placeholder="0"
                  />
                </div>
                <div className="modal-row">
                  <label>Won</label>
                  <input
                    type="number"
                    min="0"
                    value={form.won}
                    onChange={(e) => setForm({ ...form, won: e.target.value })}
                    placeholder="0"
                  />
                </div>
                <div className="modal-row">
                  <label>Drawn</label>
                  <input
                    type="number"
                    min="0"
                    value={form.drawn}
                    onChange={(e) => setForm({ ...form, drawn: e.target.value })}
                    placeholder="0"
                  />
                </div>
                <div className="modal-row">
                  <label>Lost</label>
                  <input
                    type="number"
                    min="0"
                    value={form.lost}
                    onChange={(e) => setForm({ ...form, lost: e.target.value })}
                    placeholder="0"
                  />
                </div>
                <div className="modal-row">
                  <label>Goals For</label>
                  <input
                    type="number"
                    min="0"
                    value={form.goals_for}
                    onChange={(e) => setForm({ ...form, goals_for: e.target.value })}
                    placeholder="0"
                  />
                </div>
                <div className="modal-row">
                  <label>Goals Against</label>
                  <input
                    type="number"
                    min="0"
                    value={form.goals_against}
                    onChange={(e) => setForm({ ...form, goals_against: e.target.value })}
                    placeholder="0"
                  />
                </div>
                <div className="modal-row">
                  <label>Goal Difference</label>
                  <input
                    type="number"
                    value={form.goal_difference}
                    onChange={(e) => setForm({ ...form, goal_difference: e.target.value })}
                    placeholder="0"
                  />
                </div>
                <div className="modal-row">
                  <label>Points</label>
                  <input
                    type="number"
                    min="0"
                    value={form.points}
                    onChange={(e) => setForm({ ...form, points: e.target.value })}
                    placeholder="0"
                  />
                </div>
                <div className="modal-row">
                  <label>Form</label>
                  <input
                    type="text"
                    maxLength="10"
                    value={form.form}
                    onChange={(e) => setForm({ ...form, form: e.target.value.toUpperCase() })}
                    placeholder="e.g. WWDLW"
                  />
                </div>
                <div className="modal-row">
                  <label>Updated At</label>
                  <input
                    type="datetime-local"
                    value={form.updated_at}
                    onChange={(e) => setForm({ ...form, updated_at: e.target.value })}
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

export default Standings;
