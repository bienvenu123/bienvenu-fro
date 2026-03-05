import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { getPlayerSeasonStats, createPlayerSeasonStat, updatePlayerSeasonStat, deletePlayerSeasonStat } from '../services/playerSeasonStatService';
import { getPlayers } from '../services/playerService';
import { getTeams } from '../services/teamService';
import { getSeasons } from '../services/seasonService';
import { getLeagues } from '../services/leagueService';
import './PlayerSeasonStats.css';

function PlayerSeasonStats() {
  const [stats, setStats] = useState([]);
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [leagues, setLeagues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    season_stat_id: '',
    player_id: '',
    team_id: '',
    season_id: '',
    league_id: '',
    appearances: '0',
    minutes_played: '0',
    goals: '0',
    assists: '0',
    yellow_cards: '0',
    red_cards: '0',
    clean_sheets: '0',
    shots: '0',
    shots_on_target: '0',
    pass_completion_rate: '',
    average_rating: '',
  });

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [statsData, playersData, teamsData, leaguesData] = await Promise.all([
        getPlayerSeasonStats(),
        getPlayers().catch(() => []),
        getTeams().catch(() => []),
        getLeagues().catch(() => []),
      ]);
      setStats(statsData);
      setPlayers(playersData);
      setTeams(teamsData);
      setLeagues(leaguesData);

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

  const getPlayerName = (playerId) => {
    const p = players.find((x) => x.player_id === playerId);
    if (!p) return `Player #${playerId}`;
    return `${p.first_name || ''} ${p.last_name || ''}`.trim() || `Player #${playerId}`;
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

  const getLeagueName = (leagueId) => {
    const l = leagues.find((x) => x.league_id === leagueId);
    return l ? l.name : `League #${leagueId}`;
  };


  const formatRating = (value) => {
    if (value === null || value === undefined) return '—';
    try {
      const num = typeof value === 'string' ? parseFloat(value) : value;
      if (isNaN(num)) return '—';
      return num.toFixed(1);
    } catch {
      return value;
    }
  };

  const openCreate = () => {
    setEditing(null);
    setForm({
      season_stat_id: '',
      player_id: players[0]?.player_id ?? '',
      team_id: teams[0]?.team_id ?? '',
      season_id: seasons[0]?.season_id ?? '',
      league_id: leagues[0]?.league_id ?? '',
      appearances: '0',
      minutes_played: '0',
      goals: '0',
      assists: '0',
      yellow_cards: '0',
      red_cards: '0',
      clean_sheets: '0',
      shots: '0',
      shots_on_target: '0',
      pass_completion_rate: '',
      average_rating: '',
    });
    setModalOpen(true);
  };

  const openEdit = (stat) => {
    setEditing(stat);
    setForm({
      season_stat_id: String(stat.season_stat_id),
      player_id: stat.player_id ?? '',
      team_id: stat.team_id ?? '',
      season_id: stat.season_id ?? '',
      league_id: stat.league_id ?? '',
      appearances: String(stat.appearances ?? 0),
      minutes_played: String(stat.minutes_played ?? 0),
      goals: String(stat.goals ?? 0),
      assists: String(stat.assists ?? 0),
      yellow_cards: String(stat.yellow_cards ?? 0),
      red_cards: String(stat.red_cards ?? 0),
      clean_sheets: String(stat.clean_sheets ?? 0),
      shots: String(stat.shots ?? 0),
      shots_on_target: String(stat.shots_on_target ?? 0),
      pass_completion_rate: stat.pass_completion_rate ? String(stat.pass_completion_rate) : '',
      average_rating: stat.average_rating ? String(stat.average_rating) : '',
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
        player_id: parseInt(form.player_id, 10) || null,
        team_id: parseInt(form.team_id, 10) || null,
        season_id: parseInt(form.season_id, 10) || null,
        league_id: parseInt(form.league_id, 10) || null,
        appearances: parseInt(form.appearances, 10) || 0,
        minutes_played: parseInt(form.minutes_played, 10) || 0,
        goals: parseInt(form.goals, 10) || 0,
        assists: parseInt(form.assists, 10) || 0,
        yellow_cards: parseInt(form.yellow_cards, 10) || 0,
        red_cards: parseInt(form.red_cards, 10) || 0,
        clean_sheets: parseInt(form.clean_sheets, 10) || 0,
        shots: parseInt(form.shots, 10) || 0,
        shots_on_target: parseInt(form.shots_on_target, 10) || 0,
        pass_completion_rate: form.pass_completion_rate ? parseFloat(form.pass_completion_rate) : null,
        average_rating: form.average_rating ? parseFloat(form.average_rating) : null,
      };

      if (editing) {
        await updatePlayerSeasonStat(editing.season_stat_id, payload);
      } else {
        const seasonStatId = parseInt(form.season_stat_id, 10);
        if (!seasonStatId || seasonStatId < 1) {
          setError('Season Stat ID must be a positive number');
          return;
        }
        await createPlayerSeasonStat({ season_stat_id: seasonStatId, ...payload });
      }
      closeModal();
      loadData();
    } catch (err) {
      setError(err.message || 'Operation failed');
    }
  };

  const handleDelete = async (stat) => {
    if (!window.confirm(`Delete season stat #${stat.season_stat_id}?`)) return;
    try {
      setError(null);
      await deletePlayerSeasonStat(stat.season_stat_id);
      loadData();
    } catch (err) {
      setError(err.message || 'Delete failed');
    }
  };

  const filtered = stats.filter(
    (s) =>
      getPlayerName(s.player_id)?.toLowerCase().includes(search.toLowerCase()) ||
      getTeamName(s.team_id)?.toLowerCase().includes(search.toLowerCase()) ||
      getSeasonName(s.season_id)?.toLowerCase().includes(search.toLowerCase()) ||
      getLeagueName(s.league_id)?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="data-page">
      <div className="data-toolbar">
        <div className="data-search">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search player season stats..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className="data-add-btn" onClick={openCreate}>
          <Plus size={18} />
          Add Season Stat
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
                <th>Player</th>
                <th>Team</th>
                <th>Season</th>
                <th>League</th>
                <th>Apps</th>
                <th>Min</th>
                <th>G</th>
                <th>A</th>
                <th>CS</th>
                <th>Rating</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((stat) => (
                <tr key={stat.season_stat_id}>
                  <td>{stat.season_stat_id}</td>
                  <td className="data-cell-name">{getPlayerName(stat.player_id)}</td>
                  <td className="data-cell-name">{getTeamName(stat.team_id)}</td>
                  <td>{getSeasonName(stat.season_id)}</td>
                  <td>{getLeagueName(stat.league_id)}</td>
                  <td>{stat.appearances || 0}</td>
                  <td>{stat.minutes_played || 0}</td>
                  <td>{stat.goals || 0}</td>
                  <td>{stat.assists || 0}</td>
                  <td>{stat.clean_sheets || 0}</td>
                  <td>
                    {stat.average_rating !== null && stat.average_rating !== undefined ? (
                      <strong className="rating-value">{formatRating(stat.average_rating)}</strong>
                    ) : (
                      '—'
                    )}
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
          <div className="data-empty">No player season stats found</div>
        )}
      </div>

      {modalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal modal-extra-wide" onClick={(e) => e.stopPropagation()}>
            <h2>{editing ? 'Edit Player Season Stat' : 'Add Player Season Stat'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="modal-grid">
                <div className="modal-row">
                  <label>Season Stat ID *</label>
                  <input
                    type="number"
                    min="1"
                    value={form.season_stat_id}
                    onChange={(e) => setForm({ ...form, season_stat_id: e.target.value })}
                    disabled={!!editing}
                    required
                  />
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
                      {players.map((p) => {
                        const fullName = `${p.first_name || ''} ${p.last_name || ''}`.trim() || `Player #${p.player_id}`;
                        return (
                          <option key={p.player_id} value={p.player_id}>
                            {fullName}
                          </option>
                        );
                      })}
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
                  <label>Appearances</label>
                  <input
                    type="number"
                    min="0"
                    value={form.appearances}
                    onChange={(e) => setForm({ ...form, appearances: e.target.value })}
                    placeholder="0"
                  />
                </div>
                <div className="modal-row">
                  <label>Minutes Played</label>
                  <input
                    type="number"
                    min="0"
                    value={form.minutes_played}
                    onChange={(e) => setForm({ ...form, minutes_played: e.target.value })}
                    placeholder="0"
                  />
                </div>
                <div className="modal-row">
                  <label>Goals</label>
                  <input
                    type="number"
                    min="0"
                    value={form.goals}
                    onChange={(e) => setForm({ ...form, goals: e.target.value })}
                    placeholder="0"
                  />
                </div>
                <div className="modal-row">
                  <label>Assists</label>
                  <input
                    type="number"
                    min="0"
                    value={form.assists}
                    onChange={(e) => setForm({ ...form, assists: e.target.value })}
                    placeholder="0"
                  />
                </div>
                <div className="modal-row">
                  <label>Yellow Cards</label>
                  <input
                    type="number"
                    min="0"
                    value={form.yellow_cards}
                    onChange={(e) => setForm({ ...form, yellow_cards: e.target.value })}
                    placeholder="0"
                  />
                </div>
                <div className="modal-row">
                  <label>Red Cards</label>
                  <input
                    type="number"
                    min="0"
                    value={form.red_cards}
                    onChange={(e) => setForm({ ...form, red_cards: e.target.value })}
                    placeholder="0"
                  />
                </div>
                <div className="modal-row">
                  <label>Clean Sheets</label>
                  <input
                    type="number"
                    min="0"
                    value={form.clean_sheets}
                    onChange={(e) => setForm({ ...form, clean_sheets: e.target.value })}
                    placeholder="0"
                  />
                </div>
                <div className="modal-row">
                  <label>Shots</label>
                  <input
                    type="number"
                    min="0"
                    value={form.shots}
                    onChange={(e) => setForm({ ...form, shots: e.target.value })}
                    placeholder="0"
                  />
                </div>
                <div className="modal-row">
                  <label>Shots on Target</label>
                  <input
                    type="number"
                    min="0"
                    value={form.shots_on_target}
                    onChange={(e) => setForm({ ...form, shots_on_target: e.target.value })}
                    placeholder="0"
                  />
                </div>
                <div className="modal-row">
                  <label>Pass Completion Rate (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={form.pass_completion_rate}
                    onChange={(e) => setForm({ ...form, pass_completion_rate: e.target.value })}
                    placeholder="e.g. 85.5"
                  />
                </div>
                <div className="modal-row">
                  <label>Average Rating</label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    step="0.1"
                    value={form.average_rating}
                    onChange={(e) => setForm({ ...form, average_rating: e.target.value })}
                    placeholder="e.g. 7.5"
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

export default PlayerSeasonStats;
