import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { getPlayerMatchStats, createPlayerMatchStat, updatePlayerMatchStat, deletePlayerMatchStat } from '../services/playerMatchStatService';
import { getMatches } from '../services/matchService';
import { getPlayers } from '../services/playerService';
import { getTeams } from '../services/teamService';
import './PlayerMatchStats.css';

function PlayerMatchStats() {
  const [stats, setStats] = useState([]);
  const [matches, setMatches] = useState([]);
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    stat_id: '',
    match_id: '',
    player_id: '',
    team_id: '',
    minutes_played: '0',
    goals: '0',
    assists: '0',
    shots: '0',
    shots_on_target: '0',
    passes_completed: '0',
    passes_attempted: '0',
    tackles: '0',
    interceptions: '0',
    clearances: '0',
    dribbles_completed: '0',
    dribbles_attempted: '0',
    fouls_committed: '0',
    fouls_won: '0',
    yellow_cards: '0',
    red_cards: '0',
    offsides: '0',
    saves: '0',
    rating: '',
  });

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [statsData, matchesData, playersData, teamsData] = await Promise.all([
        getPlayerMatchStats(),
        getMatches().catch(() => []),
        getPlayers().catch(() => []),
        getTeams().catch(() => []),
      ]);
      setStats(statsData);
      setMatches(matchesData);
      setPlayers(playersData);
      setTeams(teamsData);
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

  const getPlayerName = (playerId) => {
    const p = players.find((x) => x.player_id === playerId);
    if (!p) return `Player #${playerId}`;
    return `${p.first_name || ''} ${p.last_name || ''}`.trim() || `Player #${playerId}`;
  };

  const getTeamName = (teamId) => {
    const t = teams.find((x) => x.team_id === teamId);
    return t ? t.name : `Team #${teamId}`;
  };

  const openCreate = () => {
    setEditing(null);
    setForm({
      stat_id: '',
      match_id: matches[0]?.match_id ?? '',
      player_id: players[0]?.player_id ?? '',
      team_id: teams[0]?.team_id ?? '',
      minutes_played: '0',
      goals: '0',
      assists: '0',
      shots: '0',
      shots_on_target: '0',
      passes_completed: '0',
      passes_attempted: '0',
      tackles: '0',
      interceptions: '0',
      clearances: '0',
      dribbles_completed: '0',
      dribbles_attempted: '0',
      fouls_committed: '0',
      fouls_won: '0',
      yellow_cards: '0',
      red_cards: '0',
      offsides: '0',
      saves: '0',
      rating: '',
    });
    setModalOpen(true);
  };

  const openEdit = (stat) => {
    setEditing(stat);
    setForm({
      stat_id: String(stat.stat_id),
      match_id: stat.match_id ?? '',
      player_id: stat.player_id ?? '',
      team_id: stat.team_id ?? '',
      minutes_played: String(stat.minutes_played ?? 0),
      goals: String(stat.goals ?? 0),
      assists: String(stat.assists ?? 0),
      shots: String(stat.shots ?? 0),
      shots_on_target: String(stat.shots_on_target ?? 0),
      passes_completed: String(stat.passes_completed ?? 0),
      passes_attempted: String(stat.passes_attempted ?? 0),
      tackles: String(stat.tackles ?? 0),
      interceptions: String(stat.interceptions ?? 0),
      clearances: String(stat.clearances ?? 0),
      dribbles_completed: String(stat.dribbles_completed ?? 0),
      dribbles_attempted: String(stat.dribbles_attempted ?? 0),
      fouls_committed: String(stat.fouls_committed ?? 0),
      fouls_won: String(stat.fouls_won ?? 0),
      yellow_cards: String(stat.yellow_cards ?? 0),
      red_cards: String(stat.red_cards ?? 0),
      offsides: String(stat.offsides ?? 0),
      saves: String(stat.saves ?? 0),
      rating: stat.rating ? String(stat.rating) : '',
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
        player_id: parseInt(form.player_id, 10) || null,
        team_id: parseInt(form.team_id, 10) || null,
        minutes_played: parseInt(form.minutes_played, 10) || 0,
        goals: parseInt(form.goals, 10) || 0,
        assists: parseInt(form.assists, 10) || 0,
        shots: parseInt(form.shots, 10) || 0,
        shots_on_target: parseInt(form.shots_on_target, 10) || 0,
        passes_completed: parseInt(form.passes_completed, 10) || 0,
        passes_attempted: parseInt(form.passes_attempted, 10) || 0,
        tackles: parseInt(form.tackles, 10) || 0,
        interceptions: parseInt(form.interceptions, 10) || 0,
        clearances: parseInt(form.clearances, 10) || 0,
        dribbles_completed: parseInt(form.dribbles_completed, 10) || 0,
        dribbles_attempted: parseInt(form.dribbles_attempted, 10) || 0,
        fouls_committed: parseInt(form.fouls_committed, 10) || 0,
        fouls_won: parseInt(form.fouls_won, 10) || 0,
        yellow_cards: parseInt(form.yellow_cards, 10) || 0,
        red_cards: parseInt(form.red_cards, 10) || 0,
        offsides: parseInt(form.offsides, 10) || 0,
        saves: parseInt(form.saves, 10) || 0,
        rating: form.rating ? parseFloat(form.rating) : null,
      };

      if (editing) {
        await updatePlayerMatchStat(editing.stat_id, payload);
      } else {
        const statId = parseInt(form.stat_id, 10);
        if (!statId || statId < 1) {
          setError('Stat ID must be a positive number');
          return;
        }
        await createPlayerMatchStat({ stat_id: statId, ...payload });
      }
      closeModal();
      loadData();
    } catch (err) {
      setError(err.message || 'Operation failed');
    }
  };

  const handleDelete = async (stat) => {
    if (!window.confirm(`Delete match stat #${stat.stat_id}?`)) return;
    try {
      setError(null);
      await deletePlayerMatchStat(stat.stat_id);
      loadData();
    } catch (err) {
      setError(err.message || 'Delete failed');
    }
  };

  const filtered = stats.filter(
    (s) =>
      getMatchName(s.match_id)?.toLowerCase().includes(search.toLowerCase()) ||
      getPlayerName(s.player_id)?.toLowerCase().includes(search.toLowerCase()) ||
      getTeamName(s.team_id)?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="data-page">
      <div className="data-toolbar">
        <div className="data-search">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search player match stats..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className="data-add-btn" onClick={openCreate}>
          <Plus size={18} />
          Add Match Stat
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
                <th>Player</th>
                <th>Team</th>
                <th>Min</th>
                <th>G</th>
                <th>A</th>
                <th>Shots</th>
                <th>Passes</th>
                <th>Rating</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((stat) => (
                <tr key={stat.stat_id}>
                  <td>{stat.stat_id}</td>
                  <td className="data-cell-name">{getMatchName(stat.match_id)}</td>
                  <td className="data-cell-name">{getPlayerName(stat.player_id)}</td>
                  <td>{getTeamName(stat.team_id)}</td>
                  <td>{stat.minutes_played || 0}</td>
                  <td>{stat.goals || 0}</td>
                  <td>{stat.assists || 0}</td>
                  <td>{stat.shots || 0} ({stat.shots_on_target || 0})</td>
                  <td>{stat.passes_completed || 0}/{stat.passes_attempted || 0}</td>
                  <td>
                    {stat.rating !== null && stat.rating !== undefined ? (
                      <strong className="rating-value">{parseFloat(stat.rating).toFixed(1)}</strong>
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
          <div className="data-empty">No player match stats found</div>
        )}
      </div>

      {modalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal modal-extra-wide" onClick={(e) => e.stopPropagation()}>
            <h2>{editing ? 'Edit Player Match Stat' : 'Add Player Match Stat'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="modal-grid">
                <div className="modal-row">
                  <label>Stat ID *</label>
                  <input
                    type="number"
                    min="1"
                    value={form.stat_id}
                    onChange={(e) => setForm({ ...form, stat_id: e.target.value })}
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
                  <label>Passes Completed</label>
                  <input
                    type="number"
                    min="0"
                    value={form.passes_completed}
                    onChange={(e) => setForm({ ...form, passes_completed: e.target.value })}
                    placeholder="0"
                  />
                </div>
                <div className="modal-row">
                  <label>Passes Attempted</label>
                  <input
                    type="number"
                    min="0"
                    value={form.passes_attempted}
                    onChange={(e) => setForm({ ...form, passes_attempted: e.target.value })}
                    placeholder="0"
                  />
                </div>
                <div className="modal-row">
                  <label>Tackles</label>
                  <input
                    type="number"
                    min="0"
                    value={form.tackles}
                    onChange={(e) => setForm({ ...form, tackles: e.target.value })}
                    placeholder="0"
                  />
                </div>
                <div className="modal-row">
                  <label>Interceptions</label>
                  <input
                    type="number"
                    min="0"
                    value={form.interceptions}
                    onChange={(e) => setForm({ ...form, interceptions: e.target.value })}
                    placeholder="0"
                  />
                </div>
                <div className="modal-row">
                  <label>Clearances</label>
                  <input
                    type="number"
                    min="0"
                    value={form.clearances}
                    onChange={(e) => setForm({ ...form, clearances: e.target.value })}
                    placeholder="0"
                  />
                </div>
                <div className="modal-row">
                  <label>Dribbles Completed</label>
                  <input
                    type="number"
                    min="0"
                    value={form.dribbles_completed}
                    onChange={(e) => setForm({ ...form, dribbles_completed: e.target.value })}
                    placeholder="0"
                  />
                </div>
                <div className="modal-row">
                  <label>Dribbles Attempted</label>
                  <input
                    type="number"
                    min="0"
                    value={form.dribbles_attempted}
                    onChange={(e) => setForm({ ...form, dribbles_attempted: e.target.value })}
                    placeholder="0"
                  />
                </div>
                <div className="modal-row">
                  <label>Fouls Committed</label>
                  <input
                    type="number"
                    min="0"
                    value={form.fouls_committed}
                    onChange={(e) => setForm({ ...form, fouls_committed: e.target.value })}
                    placeholder="0"
                  />
                </div>
                <div className="modal-row">
                  <label>Fouls Won</label>
                  <input
                    type="number"
                    min="0"
                    value={form.fouls_won}
                    onChange={(e) => setForm({ ...form, fouls_won: e.target.value })}
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
                  <label>Offsides</label>
                  <input
                    type="number"
                    min="0"
                    value={form.offsides}
                    onChange={(e) => setForm({ ...form, offsides: e.target.value })}
                    placeholder="0"
                  />
                </div>
                <div className="modal-row">
                  <label>Saves</label>
                  <input
                    type="number"
                    min="0"
                    value={form.saves}
                    onChange={(e) => setForm({ ...form, saves: e.target.value })}
                    placeholder="0"
                  />
                </div>
                <div className="modal-row">
                  <label>Rating</label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    step="0.1"
                    value={form.rating}
                    onChange={(e) => setForm({ ...form, rating: e.target.value })}
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

export default PlayerMatchStats;
