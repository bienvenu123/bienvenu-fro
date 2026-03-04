import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { getTeamSeasonStats, createTeamSeasonStat, updateTeamSeasonStat, deleteTeamSeasonStat } from '../services/teamSeasonStatService';
import { getTeams } from '../services/teamService';
import { getSeasons } from '../services/seasonService';
import { getLeagues } from '../services/leagueService';
import './TeamSeasonStats.css';

function TeamSeasonStats() {
  const [teamSeasonStats, setTeamSeasonStats] = useState([]);
  const [teams, setTeams] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [leagues, setLeagues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    team_season_stat_id: '',
    team_id: '',
    season_id: '',
    league_id: '',
    matches_played: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    goals_for: 0,
    goals_against: 0,
    goal_difference: 0,
    points: 0,
    clean_sheets: 0,
    position: '',
    home_wins: 0,
    home_draws: 0,
    home_losses: 0,
    away_wins: 0,
    away_draws: 0,
    away_losses: 0,
  });

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [statsData, teamsData, seasonsData, leaguesData] = await Promise.all([
        getTeamSeasonStats(),
        getTeams().catch(() => []),
        getSeasons().catch(() => []),
        getLeagues().catch(() => []),
      ]);
      setTeamSeasonStats(statsData);
      setTeams(teamsData);
      setSeasons(seasonsData);
      setLeagues(leaguesData);
    } catch (err) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getTeamName = (teamId) => {
    const t = teams.find((x) => x.team_id === teamId);
    return t ? t.name : `Team #${teamId}`;
  };

  const getSeasonName = (seasonId) => {
    const s = seasons.find((x) => x.season_id === seasonId);
    return s ? s.name : `Season #${seasonId}`;
  };

  const getLeagueName = (leagueId) => {
    const l = leagues.find((x) => x.league_id === leagueId);
    return l ? l.name : `League #${leagueId}`;
  };

  const getGoalDifferenceClass = (gd) => {
    if (gd > 0) return 'badge-success';
    if (gd < 0) return 'badge-danger';
    return 'badge-gray';
  };

  const openCreate = () => {
    setEditing(null);
    setForm({
      team_season_stat_id: '',
      team_id: teams[0]?.team_id ?? '',
      season_id: seasons[0]?.season_id ?? '',
      league_id: leagues[0]?.league_id ?? '',
      matches_played: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      goals_for: 0,
      goals_against: 0,
      goal_difference: 0,
      points: 0,
      clean_sheets: 0,
      position: '',
      home_wins: 0,
      home_draws: 0,
      home_losses: 0,
      away_wins: 0,
      away_draws: 0,
      away_losses: 0,
    });
    setModalOpen(true);
  };

  const openEdit = (stat) => {
    setEditing(stat);
    setForm({
      team_season_stat_id: String(stat.team_season_stat_id),
      team_id: stat.team_id ?? '',
      season_id: stat.season_id ?? '',
      league_id: stat.league_id ?? '',
      matches_played: stat.matches_played ?? 0,
      wins: stat.wins ?? 0,
      draws: stat.draws ?? 0,
      losses: stat.losses ?? 0,
      goals_for: stat.goals_for ?? 0,
      goals_against: stat.goals_against ?? 0,
      goal_difference: stat.goal_difference ?? 0,
      points: stat.points ?? 0,
      clean_sheets: stat.clean_sheets ?? 0,
      position: stat.position ? String(stat.position) : '',
      home_wins: stat.home_wins ?? 0,
      home_draws: stat.home_draws ?? 0,
      home_losses: stat.home_losses ?? 0,
      away_wins: stat.away_wins ?? 0,
      away_draws: stat.away_draws ?? 0,
      away_losses: stat.away_losses ?? 0,
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
        team_id: parseInt(form.team_id, 10) || null,
        season_id: parseInt(form.season_id, 10) || null,
        league_id: parseInt(form.league_id, 10) || null,
        matches_played: parseInt(form.matches_played, 10) || 0,
        wins: parseInt(form.wins, 10) || 0,
        draws: parseInt(form.draws, 10) || 0,
        losses: parseInt(form.losses, 10) || 0,
        goals_for: parseInt(form.goals_for, 10) || 0,
        goals_against: parseInt(form.goals_against, 10) || 0,
        goal_difference: parseInt(form.goal_difference, 10) || 0,
        points: parseInt(form.points, 10) || 0,
        clean_sheets: parseInt(form.clean_sheets, 10) || 0,
        position: form.position ? parseInt(form.position, 10) : null,
        home_wins: parseInt(form.home_wins, 10) || 0,
        home_draws: parseInt(form.home_draws, 10) || 0,
        home_losses: parseInt(form.home_losses, 10) || 0,
        away_wins: parseInt(form.away_wins, 10) || 0,
        away_draws: parseInt(form.away_draws, 10) || 0,
        away_losses: parseInt(form.away_losses, 10) || 0,
      };

      if (editing) {
        await updateTeamSeasonStat(editing.team_season_stat_id, payload);
      } else {
        const statId = parseInt(form.team_season_stat_id, 10);
        if (!statId || statId < 1) {
          setError('Team Season Stat ID must be a positive number');
          return;
        }
        await createTeamSeasonStat({ team_season_stat_id: statId, ...payload });
      }
      closeModal();
      loadData();
    } catch (err) {
      setError(err.message || 'Operation failed');
    }
  };

  const handleDelete = async (stat) => {
    if (!window.confirm(`Delete season stats for ${getTeamName(stat.team_id)} in ${getSeasonName(stat.season_id)}?`)) return;
    try {
      setError(null);
      await deleteTeamSeasonStat(stat.team_season_stat_id);
      loadData();
    } catch (err) {
      setError(err.message || 'Delete failed');
    }
  };

  const filtered = teamSeasonStats.filter(
    (stat) =>
      getTeamName(stat.team_id)?.toLowerCase().includes(search.toLowerCase()) ||
      getSeasonName(stat.season_id)?.toLowerCase().includes(search.toLowerCase()) ||
      getLeagueName(stat.league_id)?.toLowerCase().includes(search.toLowerCase()) ||
      String(stat.position || '').includes(search)
  );

  return (
    <div className="data-page">
      <div className="data-toolbar">
        <div className="data-search">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search team season stats..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className="data-add-btn" onClick={openCreate}>
          <Plus size={18} />
          Add Team Season Stat
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
                <th>Team</th>
                <th>Season</th>
                <th>League</th>
                <th>Pos</th>
                <th>P</th>
                <th>W</th>
                <th>D</th>
                <th>L</th>
                <th>GF</th>
                <th>GA</th>
                <th>GD</th>
                <th>Pts</th>
                <th>CS</th>
                <th>Home</th>
                <th>Away</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((stat) => (
                <tr key={stat.team_season_stat_id}>
                  <td>{stat.team_season_stat_id}</td>
                  <td className="data-cell-name">{getTeamName(stat.team_id)}</td>
                  <td>{getSeasonName(stat.season_id)}</td>
                  <td>{getLeagueName(stat.league_id)}</td>
                  <td>
                    {stat.position ? (
                      <span className="badge badge-position">{stat.position}</span>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td>{stat.matches_played}</td>
                  <td>{stat.wins}</td>
                  <td>{stat.draws}</td>
                  <td>{stat.losses}</td>
                  <td>{stat.goals_for}</td>
                  <td>{stat.goals_against}</td>
                  <td>
                    <span className={`badge ${getGoalDifferenceClass(stat.goal_difference)}`}>
                      {stat.goal_difference}
                    </span>
                  </td>
                  <td><span className="badge badge-points">{stat.points}</span></td>
                  <td>{stat.clean_sheets}</td>
                  <td className="data-cell-compact">
                    {stat.home_wins}-{stat.home_draws}-{stat.home_losses}
                  </td>
                  <td className="data-cell-compact">
                    {stat.away_wins}-{stat.away_draws}-{stat.away_losses}
                  </td>
                  <td>
                    <div className="action-btns">
                      <button className="edit-btn" onClick={() => openEdit(stat)}>
                        <Pencil size={14} /> Edit
                      </button>
                      <button className="delete-btn" onClick={() => handleDelete(stat)} aria-label="Delete">
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
          <div className="data-empty">No team season stats found</div>
        )}
      </div>

      {modalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal modal-extra-wide" onClick={(e) => e.stopPropagation()}>
            <h2>{editing ? 'Edit Team Season Stat' : 'Add Team Season Stat'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="modal-grid">
                <div className="modal-row">
                  <label>Team Season Stat ID *</label>
                  <input
                    type="number"
                    min="1"
                    value={form.team_season_stat_id}
                    onChange={(e) => setForm({ ...form, team_season_stat_id: e.target.value })}
                    disabled={!!editing}
                    required
                  />
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
                          {s.name}
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
                  <label>Matches Played</label>
                  <input
                    type="number"
                    min="0"
                    value={form.matches_played}
                    onChange={(e) => setForm({ ...form, matches_played: e.target.value })}
                  />
                </div>
                <div className="modal-row">
                  <label>Wins</label>
                  <input
                    type="number"
                    min="0"
                    value={form.wins}
                    onChange={(e) => setForm({ ...form, wins: e.target.value })}
                  />
                </div>
                <div className="modal-row">
                  <label>Draws</label>
                  <input
                    type="number"
                    min="0"
                    value={form.draws}
                    onChange={(e) => setForm({ ...form, draws: e.target.value })}
                  />
                </div>
                <div className="modal-row">
                  <label>Losses</label>
                  <input
                    type="number"
                    min="0"
                    value={form.losses}
                    onChange={(e) => setForm({ ...form, losses: e.target.value })}
                  />
                </div>
                <div className="modal-row">
                  <label>Goals For</label>
                  <input
                    type="number"
                    min="0"
                    value={form.goals_for}
                    onChange={(e) => setForm({ ...form, goals_for: e.target.value })}
                  />
                </div>
                <div className="modal-row">
                  <label>Goals Against</label>
                  <input
                    type="number"
                    min="0"
                    value={form.goals_against}
                    onChange={(e) => setForm({ ...form, goals_against: e.target.value })}
                  />
                </div>
                <div className="modal-row">
                  <label>Goal Difference</label>
                  <input
                    type="number"
                    value={form.goal_difference}
                    onChange={(e) => setForm({ ...form, goal_difference: e.target.value })}
                  />
                </div>
                <div className="modal-row">
                  <label>Points</label>
                  <input
                    type="number"
                    min="0"
                    value={form.points}
                    onChange={(e) => setForm({ ...form, points: e.target.value })}
                  />
                </div>
                <div className="modal-row">
                  <label>Clean Sheets</label>
                  <input
                    type="number"
                    min="0"
                    value={form.clean_sheets}
                    onChange={(e) => setForm({ ...form, clean_sheets: e.target.value })}
                  />
                </div>
                <div className="modal-row">
                  <label>Position</label>
                  <input
                    type="number"
                    min="1"
                    value={form.position}
                    onChange={(e) => setForm({ ...form, position: e.target.value })}
                    placeholder="Optional"
                  />
                </div>
                <div className="modal-row">
                  <label>Home Wins</label>
                  <input
                    type="number"
                    min="0"
                    value={form.home_wins}
                    onChange={(e) => setForm({ ...form, home_wins: e.target.value })}
                  />
                </div>
                <div className="modal-row">
                  <label>Home Draws</label>
                  <input
                    type="number"
                    min="0"
                    value={form.home_draws}
                    onChange={(e) => setForm({ ...form, home_draws: e.target.value })}
                  />
                </div>
                <div className="modal-row">
                  <label>Home Losses</label>
                  <input
                    type="number"
                    min="0"
                    value={form.home_losses}
                    onChange={(e) => setForm({ ...form, home_losses: e.target.value })}
                  />
                </div>
                <div className="modal-row">
                  <label>Away Wins</label>
                  <input
                    type="number"
                    min="0"
                    value={form.away_wins}
                    onChange={(e) => setForm({ ...form, away_wins: e.target.value })}
                  />
                </div>
                <div className="modal-row">
                  <label>Away Draws</label>
                  <input
                    type="number"
                    min="0"
                    value={form.away_draws}
                    onChange={(e) => setForm({ ...form, away_draws: e.target.value })}
                  />
                </div>
                <div className="modal-row">
                  <label>Away Losses</label>
                  <input
                    type="number"
                    min="0"
                    value={form.away_losses}
                    onChange={(e) => setForm({ ...form, away_losses: e.target.value })}
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

export default TeamSeasonStats;
