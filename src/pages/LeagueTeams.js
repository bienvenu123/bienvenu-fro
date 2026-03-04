import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { getLeagueTeams, createLeagueTeam, updateLeagueTeam, deleteLeagueTeam } from '../services/leagueTeamService';
import { getLeagues } from '../services/leagueService';
import { getTeams } from '../services/teamService';
import { getSeasons } from '../services/seasonService';
import './LeagueTeams.css';

function LeagueTeams() {
  const [leagueTeams, setLeagueTeams] = useState([]);
  const [leagues, setLeagues] = useState([]);
  const [teams, setTeams] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    league_team_id: '',
    league_id: '',
    team_id: '',
    season_id: '',
    joined_date: new Date().toISOString().split('T')[0],
  });

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [leagueTeamsData, leaguesData, teamsData] = await Promise.all([
        getLeagueTeams(),
        getLeagues().catch(() => []),
        getTeams().catch(() => []),
      ]);
      setLeagueTeams(leagueTeamsData);
      setLeagues(leaguesData);
      setTeams(teamsData);

      // Try to load seasons, but don't fail if endpoint doesn't exist
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
      return date.toISOString().split('T')[0];
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

  const getSeasonName = (seasonId) => {
    if (!seasonId) return '—';
    const s = seasons.find((x) => x.season_id === seasonId);
    return s ? (s.name || `Season #${seasonId}`) : `Season #${seasonId}`;
  };

  const openCreate = () => {
    setEditing(null);
    setForm({
      league_team_id: '',
      league_id: leagues[0]?.league_id ?? '',
      team_id: teams[0]?.team_id ?? '',
      season_id: seasons[0]?.season_id ?? '',
      joined_date: new Date().toISOString().split('T')[0],
    });
    setModalOpen(true);
  };

  const openEdit = (leagueTeam) => {
    setEditing(leagueTeam);
    setForm({
      league_team_id: String(leagueTeam.league_team_id),
      league_id: leagueTeam.league_id ?? '',
      team_id: leagueTeam.team_id ?? '',
      season_id: leagueTeam.season_id ?? '',
      joined_date: formatDateForInput(leagueTeam.joined_date),
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
        team_id: parseInt(form.team_id, 10) || null,
        season_id: parseInt(form.season_id, 10) || null,
        joined_date: form.joined_date || null,
      };

      if (editing) {
        await updateLeagueTeam(editing.league_team_id, payload);
      } else {
        const leagueTeamId = parseInt(form.league_team_id, 10);
        if (!leagueTeamId || leagueTeamId < 1) {
          setError('League Team ID must be a positive number');
          return;
        }
        await createLeagueTeam({ league_team_id: leagueTeamId, ...payload });
      }
      closeModal();
      loadData();
    } catch (err) {
      setError(err.message || 'Operation failed');
    }
  };

  const handleDelete = async (leagueTeam) => {
    if (!window.confirm(`Delete league team association #${leagueTeam.league_team_id}?`)) return;
    try {
      setError(null);
      await deleteLeagueTeam(leagueTeam.league_team_id);
      loadData();
    } catch (err) {
      setError(err.message || 'Delete failed');
    }
  };

  const filtered = leagueTeams.filter(
    (lt) =>
      getLeagueName(lt.league_id)?.toLowerCase().includes(search.toLowerCase()) ||
      getTeamName(lt.team_id)?.toLowerCase().includes(search.toLowerCase()) ||
      getSeasonName(lt.season_id)?.toLowerCase().includes(search.toLowerCase()) ||
      formatDate(lt.joined_date)?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="data-page">
      <div className="data-toolbar">
        <div className="data-search">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search league teams..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className="data-add-btn" onClick={openCreate}>
          <Plus size={18} />
          Add League Team
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
                <th>Team</th>
                <th>Season</th>
                <th>Joined Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((leagueTeam) => (
                <tr key={leagueTeam.league_team_id}>
                  <td>{leagueTeam.league_team_id}</td>
                  <td className="data-cell-name">{getLeagueName(leagueTeam.league_id)}</td>
                  <td className="data-cell-name">{getTeamName(leagueTeam.team_id)}</td>
                  <td>{getSeasonName(leagueTeam.season_id)}</td>
                  <td>{formatDate(leagueTeam.joined_date)}</td>
                  <td>
                    <div className="action-btns">
                      <button className="edit-btn" onClick={() => openEdit(leagueTeam)}>
                        <Pencil size={14} /> Edit
                      </button>
                      <button className="delete-btn" onClick={() => handleDelete(leagueTeam)} aria-label="Delete">
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
          <div className="data-empty">No league teams found</div>
        )}
      </div>

      {modalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{editing ? 'Edit League Team' : 'Add League Team'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="modal-row">
                <label>League Team ID *</label>
                <input
                  type="number"
                  min="1"
                  value={form.league_team_id}
                  onChange={(e) => setForm({ ...form, league_team_id: e.target.value })}
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
                <label>Joined Date *</label>
                <input
                  type="date"
                  value={form.joined_date}
                  onChange={(e) => setForm({ ...form, joined_date: e.target.value })}
                  required
                />
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

export default LeagueTeams;
