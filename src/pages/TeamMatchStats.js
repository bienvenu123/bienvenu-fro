import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { getTeamMatchStats, createTeamMatchStat, updateTeamMatchStat, deleteTeamMatchStat } from '../services/teamMatchStatService';
import { getMatches } from '../services/matchService';
import { getTeams } from '../services/teamService';
import './TeamMatchStats.css';

function TeamMatchStats() {
  const [teamMatchStats, setTeamMatchStats] = useState([]);
  const [matches, setMatches] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    team_match_stat_id: '',
    match_id: '',
    team_id: '',
    possession_percentage: '',
    shots: 0,
    shots_on_target: 0,
    shots_off_target: 0,
    blocked_shots: 0,
    corners: 0,
    offsides: 0,
    fouls: 0,
    yellow_cards: 0,
    red_cards: 0,
    passes: 0,
    passes_completed: 0,
    pass_accuracy: '',
    tackles: 0,
    saves: 0,
  });

  const defaultStatFields = () => ({
    possession_percentage: '',
    shots: 0,
    shots_on_target: 0,
    shots_off_target: 0,
    blocked_shots: 0,
    corners: 0,
    offsides: 0,
    fouls: 0,
    yellow_cards: 0,
    red_cards: 0,
    passes: 0,
    passes_completed: 0,
    pass_accuracy: '',
    tackles: 0,
    saves: 0,
  });

  const [bothTeamsForm, setBothTeamsForm] = useState({
    match_id: '',
    home_stat_id: '',
    away_stat_id: '',
    home: defaultStatFields(),
    away: defaultStatFields(),
  });

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [statsData, matchesData, teamsData] = await Promise.all([
        getTeamMatchStats(),
        getMatches().catch(() => []),
        getTeams().catch(() => []),
      ]);
      setTeamMatchStats(statsData);
      setMatches(matchesData);
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

  const formatDecimal = (value) => {
    if (value === null || value === undefined || value === '') return '—';
    try {
      const num = typeof value === 'string' ? parseFloat(value) : value;
      if (isNaN(num)) return '—';
      return num.toFixed(1);
    } catch {
      return '—';
    }
  };

  const formatPercentage = (value) => {
    const formatted = formatDecimal(value);
    return formatted === '—' ? '—' : `${formatted}%`;
  };

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

  const openCreate = () => {
    setEditing(null);
    const firstMatch = matches[0];
    setForm({
      team_match_stat_id: '',
      match_id: firstMatch?.match_id ?? '',
      team_id: teams[0]?.team_id ?? '',
      possession_percentage: '',
      shots: 0,
      shots_on_target: 0,
      shots_off_target: 0,
      blocked_shots: 0,
      corners: 0,
      offsides: 0,
      fouls: 0,
      yellow_cards: 0,
      red_cards: 0,
      passes: 0,
      passes_completed: 0,
      pass_accuracy: '',
      tackles: 0,
      saves: 0,
    });
    setBothTeamsForm({
      match_id: firstMatch?.match_id ?? '',
      home_stat_id: '',
      away_stat_id: '',
      home: defaultStatFields(),
      away: defaultStatFields(),
    });
    setModalOpen(true);
  };

  const openEdit = (stat) => {
    setEditing(stat);
    setForm({
      team_match_stat_id: String(stat.team_match_stat_id),
      match_id: stat.match_id ?? '',
      team_id: stat.team_id ?? '',
      possession_percentage: stat.possession_percentage ? String(stat.possession_percentage) : '',
      shots: stat.shots ?? 0,
      shots_on_target: stat.shots_on_target ?? 0,
      shots_off_target: stat.shots_off_target ?? 0,
      blocked_shots: stat.blocked_shots ?? 0,
      corners: stat.corners ?? 0,
      offsides: stat.offsides ?? 0,
      fouls: stat.fouls ?? 0,
      yellow_cards: stat.yellow_cards ?? 0,
      red_cards: stat.red_cards ?? 0,
      passes: stat.passes ?? 0,
      passes_completed: stat.passes_completed ?? 0,
      pass_accuracy: stat.pass_accuracy ? String(stat.pass_accuracy) : '',
      tackles: stat.tackles ?? 0,
      saves: stat.saves ?? 0,
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
  };

  const getSelectedMatch = () => {
    const id = bothTeamsForm.match_id ? parseInt(bothTeamsForm.match_id, 10) : null;
    return id ? matches.find((m) => m.match_id === id) : null;
  };

  const updateBothTeamsField = (side, field, value) => {
    setBothTeamsForm((prev) => ({
      ...prev,
      [side]: { ...prev[side], [field]: value },
    }));
  };

  const handleSubmitBothTeams = async (e) => {
    e.preventDefault();
    const match = getSelectedMatch();
    if (!match) {
      setError('Please select a match');
      return;
    }
    const homeId = parseInt(bothTeamsForm.home_stat_id, 10);
    const awayId = parseInt(bothTeamsForm.away_stat_id, 10);
    if (!homeId || homeId < 1 || !awayId || awayId < 1) {
      setError('Both Home and Away Team Match Stat IDs must be positive numbers');
      return;
    }
    if (homeId === awayId) {
      setError('Home and Away Stat IDs must be different');
      return;
    }
    try {
      setError(null);
      const toPayload = (teamId, statId, stats) => ({
        team_match_stat_id: statId,
        match_id: match.match_id,
        team_id: teamId,
        possession_percentage: stats.possession_percentage ? parseFloat(stats.possession_percentage) : null,
        shots: parseInt(stats.shots, 10) || 0,
        shots_on_target: parseInt(stats.shots_on_target, 10) || 0,
        shots_off_target: parseInt(stats.shots_off_target, 10) || 0,
        blocked_shots: parseInt(stats.blocked_shots, 10) || 0,
        corners: parseInt(stats.corners, 10) || 0,
        offsides: parseInt(stats.offsides, 10) || 0,
        fouls: parseInt(stats.fouls, 10) || 0,
        yellow_cards: parseInt(stats.yellow_cards, 10) || 0,
        red_cards: parseInt(stats.red_cards, 10) || 0,
        passes: parseInt(stats.passes, 10) || 0,
        passes_completed: parseInt(stats.passes_completed, 10) || 0,
        pass_accuracy: stats.pass_accuracy ? parseFloat(stats.pass_accuracy) : null,
        tackles: parseInt(stats.tackles, 10) || 0,
        saves: parseInt(stats.saves, 10) || 0,
      });
      await Promise.all([
        createTeamMatchStat(toPayload(match.home_team_id, homeId, bothTeamsForm.home)),
        createTeamMatchStat(toPayload(match.away_team_id, awayId, bothTeamsForm.away)),
      ]);
      closeModal();
      loadData();
    } catch (err) {
      setError(err.message || 'Operation failed');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      const payload = {
        match_id: parseInt(form.match_id, 10) || null,
        team_id: parseInt(form.team_id, 10) || null,
        possession_percentage: form.possession_percentage ? parseFloat(form.possession_percentage) : null,
        shots: parseInt(form.shots, 10) || 0,
        shots_on_target: parseInt(form.shots_on_target, 10) || 0,
        shots_off_target: parseInt(form.shots_off_target, 10) || 0,
        blocked_shots: parseInt(form.blocked_shots, 10) || 0,
        corners: parseInt(form.corners, 10) || 0,
        offsides: parseInt(form.offsides, 10) || 0,
        fouls: parseInt(form.fouls, 10) || 0,
        yellow_cards: parseInt(form.yellow_cards, 10) || 0,
        red_cards: parseInt(form.red_cards, 10) || 0,
        passes: parseInt(form.passes, 10) || 0,
        passes_completed: parseInt(form.passes_completed, 10) || 0,
        pass_accuracy: form.pass_accuracy ? parseFloat(form.pass_accuracy) : null,
        tackles: parseInt(form.tackles, 10) || 0,
        saves: parseInt(form.saves, 10) || 0,
      };

      if (editing) {
        await updateTeamMatchStat(editing.team_match_stat_id, payload);
      } else {
        const statId = parseInt(form.team_match_stat_id, 10);
        if (!statId || statId < 1) {
          setError('Team Match Stat ID must be a positive number');
          return;
        }
        await createTeamMatchStat({ team_match_stat_id: statId, ...payload });
      }
      closeModal();
      loadData();
    } catch (err) {
      setError(err.message || 'Operation failed');
    }
  };

  const handleDelete = async (stat) => {
    if (!window.confirm(`Delete match stats for ${getTeamName(stat.team_id)} in ${getMatchName(stat.match_id)}?`)) return;
    try {
      setError(null);
      await deleteTeamMatchStat(stat.team_match_stat_id);
      loadData();
    } catch (err) {
      setError(err.message || 'Delete failed');
    }
  };

  const filtered = teamMatchStats.filter(
    (stat) =>
      getMatchName(stat.match_id)?.toLowerCase().includes(search.toLowerCase()) ||
      getTeamName(stat.team_id)?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="data-page">
      <div className="data-toolbar">
        <div className="data-search">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search team match stats..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className="data-add-btn" onClick={openCreate}>
          <Plus size={18} />
          Add Team Match Stat
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
                <th>Possession</th>
                <th>Shots</th>
                <th>On Target</th>
                <th>Corners</th>
                <th>Fouls</th>
                <th>Yellow</th>
                <th>Red</th>
                <th>Passes</th>
                <th>Pass Acc.</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((stat) => (
                <tr key={stat.team_match_stat_id}>
                  <td>{stat.team_match_stat_id}</td>
                  <td className="data-cell-name">{getMatchName(stat.match_id)}</td>
                  <td className="data-cell-name">{getTeamName(stat.team_id)}</td>
                  <td>{formatPercentage(stat.possession_percentage)}</td>
                  <td>{stat.shots}</td>
                  <td>{stat.shots_on_target}</td>
                  <td>{stat.corners}</td>
                  <td>{stat.fouls}</td>
                  <td>
                    {stat.yellow_cards > 0 && (
                      <span className="badge badge-warning">{stat.yellow_cards}</span>
                    )}
                    {stat.yellow_cards === 0 && '—'}
                  </td>
                  <td>
                    {stat.red_cards > 0 && (
                      <span className="badge badge-danger">{stat.red_cards}</span>
                    )}
                    {stat.red_cards === 0 && '—'}
                  </td>
                  <td>{stat.passes}</td>
                  <td>{formatPercentage(stat.pass_accuracy)}</td>
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
          <div className="data-empty">No team match stats found</div>
        )}
      </div>

      {modalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal modal-extra-wide" onClick={(e) => e.stopPropagation()}>
            {editing ? (
              <>
                <h2>Edit Team Match Stat</h2>
                <form onSubmit={handleSubmit}>
              <div className="modal-grid">
                <div className="modal-row">
                  <label>Team Match Stat ID *</label>
                  <input
                    type="number"
                    min="1"
                    value={form.team_match_stat_id}
                    onChange={(e) => setForm({ ...form, team_match_stat_id: e.target.value })}
                    disabled={!!editing}
                    required
                  />
                </div>
                <div className="modal-row">
                  <label>Match *</label>
                  <span className="modal-readonly">{getMatchName(form.match_id)}</span>
                </div>
                <div className="modal-row">
                  <label>Team *</label>
                  <span className="modal-readonly">{getTeamName(form.team_id)}</span>
                </div>
                <div className="modal-row">
                  <label>Possession %</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={form.possession_percentage}
                    onChange={(e) => setForm({ ...form, possession_percentage: e.target.value })}
                    placeholder="0.0-100.0"
                  />
                </div>
                <div className="modal-row">
                  <label>Shots</label>
                  <input
                    type="number"
                    min="0"
                    value={form.shots}
                    onChange={(e) => setForm({ ...form, shots: e.target.value })}
                  />
                </div>
                <div className="modal-row">
                  <label>Shots on Target</label>
                  <input
                    type="number"
                    min="0"
                    value={form.shots_on_target}
                    onChange={(e) => setForm({ ...form, shots_on_target: e.target.value })}
                  />
                </div>
                <div className="modal-row">
                  <label>Shots off Target</label>
                  <input
                    type="number"
                    min="0"
                    value={form.shots_off_target}
                    onChange={(e) => setForm({ ...form, shots_off_target: e.target.value })}
                  />
                </div>
                <div className="modal-row">
                  <label>Blocked Shots</label>
                  <input
                    type="number"
                    min="0"
                    value={form.blocked_shots}
                    onChange={(e) => setForm({ ...form, blocked_shots: e.target.value })}
                  />
                </div>
                <div className="modal-row">
                  <label>Corners</label>
                  <input
                    type="number"
                    min="0"
                    value={form.corners}
                    onChange={(e) => setForm({ ...form, corners: e.target.value })}
                  />
                </div>
                <div className="modal-row">
                  <label>Offsides</label>
                  <input
                    type="number"
                    min="0"
                    value={form.offsides}
                    onChange={(e) => setForm({ ...form, offsides: e.target.value })}
                  />
                </div>
                <div className="modal-row">
                  <label>Fouls</label>
                  <input
                    type="number"
                    min="0"
                    value={form.fouls}
                    onChange={(e) => setForm({ ...form, fouls: e.target.value })}
                  />
                </div>
                <div className="modal-row">
                  <label>Yellow Cards</label>
                  <input
                    type="number"
                    min="0"
                    value={form.yellow_cards}
                    onChange={(e) => setForm({ ...form, yellow_cards: e.target.value })}
                  />
                </div>
                <div className="modal-row">
                  <label>Red Cards</label>
                  <input
                    type="number"
                    min="0"
                    value={form.red_cards}
                    onChange={(e) => setForm({ ...form, red_cards: e.target.value })}
                  />
                </div>
                <div className="modal-row">
                  <label>Passes</label>
                  <input
                    type="number"
                    min="0"
                    value={form.passes}
                    onChange={(e) => setForm({ ...form, passes: e.target.value })}
                  />
                </div>
                <div className="modal-row">
                  <label>Passes Completed</label>
                  <input
                    type="number"
                    min="0"
                    value={form.passes_completed}
                    onChange={(e) => setForm({ ...form, passes_completed: e.target.value })}
                  />
                </div>
                <div className="modal-row">
                  <label>Pass Accuracy %</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={form.pass_accuracy}
                    onChange={(e) => setForm({ ...form, pass_accuracy: e.target.value })}
                    placeholder="0.0-100.0"
                  />
                </div>
                <div className="modal-row">
                  <label>Tackles</label>
                  <input
                    type="number"
                    min="0"
                    value={form.tackles}
                    onChange={(e) => setForm({ ...form, tackles: e.target.value })}
                  />
                </div>
                <div className="modal-row">
                  <label>Saves</label>
                  <input
                    type="number"
                    min="0"
                    value={form.saves}
                    onChange={(e) => setForm({ ...form, saves: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="modal-cancel" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="modal-submit">
                  Update
                </button>
              </div>
            </form>
              </>
            ) : (
              <>
                <h2>Add Team Match Stat (Both Teams)</h2>
                <form onSubmit={handleSubmitBothTeams}>
                  <div className="modal-grid">
                    <div className="modal-row modal-row-full">
                      <label>Match *</label>
                      {matches.length > 0 ? (
                        <select
                          value={bothTeamsForm.match_id}
                          onChange={(e) => setBothTeamsForm({ ...bothTeamsForm, match_id: e.target.value })}
                          required
                        >
                          <option value="">Select match</option>
                          {matches.map((m) => {
                            const homeName = teams.find((t) => t.team_id === m.home_team_id)?.name || `Team #${m.home_team_id}`;
                            const awayName = teams.find((t) => t.team_id === m.away_team_id)?.name || `Team #${m.away_team_id}`;
                            return (
                              <option key={m.match_id} value={m.match_id}>
                                {homeName} vs {awayName}
                              </option>
                            );
                          })}
                        </select>
                      ) : (
                        <input type="number" min="1" value={bothTeamsForm.match_id} onChange={(e) => setBothTeamsForm({ ...bothTeamsForm, match_id: e.target.value })} placeholder="Match ID" required />
                      )}
                    </div>
                    <div className="modal-row">
                      <label>Home Team Stat ID *</label>
                      <input
                        type="number"
                        min="1"
                        value={bothTeamsForm.home_stat_id}
                        onChange={(e) => setBothTeamsForm({ ...bothTeamsForm, home_stat_id: e.target.value })}
                        placeholder="e.g. 1"
                        required
                      />
                    </div>
                    <div className="modal-row">
                      <label>Away Team Stat ID *</label>
                      <input
                        type="number"
                        min="1"
                        value={bothTeamsForm.away_stat_id}
                        onChange={(e) => setBothTeamsForm({ ...bothTeamsForm, away_stat_id: e.target.value })}
                        placeholder="e.g. 2"
                        required
                      />
                    </div>
                  </div>

                  {getSelectedMatch() && (
                    <>
                      <div className="team-match-stats-section">
                        <h3 className="team-stats-section-title">{getTeamName(getSelectedMatch().home_team_id)} (Home)</h3>
                        <div className="modal-grid">
                          {['possession_percentage', 'shots', 'shots_on_target', 'shots_off_target', 'blocked_shots', 'corners', 'offsides', 'fouls', 'yellow_cards', 'red_cards', 'passes', 'passes_completed', 'pass_accuracy', 'tackles', 'saves'].map((field) => (
                            <div key={`home-${field}`} className="modal-row">
                              <label>{field.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</label>
                              <input
                                type="number"
                                step={field.includes('percentage') || field.includes('accuracy') ? '0.1' : undefined}
                                min="0"
                                max={field.includes('percentage') || field.includes('accuracy') ? 100 : undefined}
                                value={bothTeamsForm.home[field] ?? ''}
                                onChange={(e) => updateBothTeamsField('home', field, e.target.value)}
                                placeholder={field.includes('percentage') || field.includes('accuracy') ? '0.0-100.0' : '0'}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="team-match-stats-section">
                        <h3 className="team-stats-section-title">{getTeamName(getSelectedMatch().away_team_id)} (Away)</h3>
                        <div className="modal-grid">
                          {['possession_percentage', 'shots', 'shots_on_target', 'shots_off_target', 'blocked_shots', 'corners', 'offsides', 'fouls', 'yellow_cards', 'red_cards', 'passes', 'passes_completed', 'pass_accuracy', 'tackles', 'saves'].map((field) => (
                            <div key={`away-${field}`} className="modal-row">
                              <label>{field.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</label>
                              <input
                                type="number"
                                step={field.includes('percentage') || field.includes('accuracy') ? '0.1' : undefined}
                                min="0"
                                max={field.includes('percentage') || field.includes('accuracy') ? 100 : undefined}
                                value={bothTeamsForm.away[field] ?? ''}
                                onChange={(e) => updateBothTeamsField('away', field, e.target.value)}
                                placeholder={field.includes('percentage') || field.includes('accuracy') ? '0.0-100.0' : '0'}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  <div className="modal-actions">
                    <button type="button" className="modal-cancel" onClick={closeModal}>Cancel</button>
                    <button type="submit" className="modal-submit" disabled={!getSelectedMatch()}>Create Both</button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default TeamMatchStats;
