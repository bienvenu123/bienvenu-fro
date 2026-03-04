import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { getMatchLineups, createMatchLineup, updateMatchLineup, deleteMatchLineup } from '../services/matchLineupService';
import { getMatches } from '../services/matchService';
import { getTeams } from '../services/teamService';
import { getPlayers } from '../services/playerService';
import { getPositions } from '../services/positionService';
import './MatchLineups.css';

function MatchLineups() {
  const [lineups, setLineups] = useState([]);
  const [matches, setMatches] = useState([]);
  const [teams, setTeams] = useState([]);
  const [players, setPlayers] = useState([]);
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    lineup_id: '',
    match_id: '',
    team_id: '',
    player_id: '',
    position_id: '',
    is_starter: false,
    formation_position: '',
    shirt_number: '',
  });

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [lineupsData, matchesData, teamsData] = await Promise.all([
        getMatchLineups(),
        getMatches().catch(() => []),
        getTeams().catch(() => []),
      ]);
      setLineups(lineupsData);
      setMatches(matchesData);
      setTeams(teamsData);

      // Try to load optional related data
      try {
        const playersData = await getPlayers();
        setPlayers(playersData);
      } catch (err) {
        console.warn('Players endpoint not available:', err);
      }

      try {
        const positionsData = await getPositions();
        setPositions(positionsData);
      } catch (err) {
        console.warn('Positions endpoint not available:', err);
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
    const p = players.find((x) => x.player_id === playerId);
    return p ? (p.name || `Player #${playerId}`) : `Player #${playerId}`;
  };

  const getPositionName = (positionId) => {
    const pos = positions.find((x) => x.position_id === positionId);
    return pos ? (pos.name || `Position #${positionId}`) : `Position #${positionId}`;
  };

  const openCreate = () => {
    setEditing(null);
    setForm({
      lineup_id: '',
      match_id: matches[0]?.match_id ?? '',
      team_id: teams[0]?.team_id ?? '',
      player_id: players[0]?.player_id ?? '',
      position_id: positions[0]?.position_id ?? '',
      is_starter: false,
      formation_position: '',
      shirt_number: '',
    });
    setModalOpen(true);
  };

  const openEdit = (lineup) => {
    setEditing(lineup);
    setForm({
      lineup_id: String(lineup.lineup_id),
      match_id: lineup.match_id ?? '',
      team_id: lineup.team_id ?? '',
      player_id: lineup.player_id ?? '',
      position_id: lineup.position_id ?? '',
      is_starter: lineup.is_starter || false,
      formation_position: lineup.formation_position || '',
      shirt_number: lineup.shirt_number ?? '',
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
        position_id: parseInt(form.position_id, 10) || null,
        is_starter: form.is_starter,
        formation_position: form.formation_position.trim() || null,
        shirt_number: form.shirt_number ? parseInt(form.shirt_number, 10) : null,
      };

      if (editing) {
        await updateMatchLineup(editing.lineup_id, payload);
      } else {
        const lineupId = parseInt(form.lineup_id, 10);
        if (!lineupId || lineupId < 1) {
          setError('Lineup ID must be a positive number');
          return;
        }
        await createMatchLineup({ lineup_id: lineupId, ...payload });
      }
      closeModal();
      loadData();
    } catch (err) {
      setError(err.message || 'Operation failed');
    }
  };

  const handleDelete = async (lineup) => {
    if (!window.confirm(`Delete lineup entry #${lineup.lineup_id}?`)) return;
    try {
      setError(null);
      await deleteMatchLineup(lineup.lineup_id);
      loadData();
    } catch (err) {
      setError(err.message || 'Delete failed');
    }
  };

  const filtered = lineups.filter(
    (l) =>
      getMatchName(l.match_id)?.toLowerCase().includes(search.toLowerCase()) ||
      getTeamName(l.team_id)?.toLowerCase().includes(search.toLowerCase()) ||
      getPlayerName(l.player_id)?.toLowerCase().includes(search.toLowerCase()) ||
      getPositionName(l.position_id)?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="data-page">
      <div className="data-toolbar">
        <div className="data-search">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search match lineups..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className="data-add-btn" onClick={openCreate}>
          <Plus size={18} />
          Add Match Lineup
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
                <th>Position</th>
                <th>Starter</th>
                <th>Formation Pos</th>
                <th>Shirt #</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((lineup) => (
                <tr key={lineup.lineup_id}>
                  <td>{lineup.lineup_id}</td>
                  <td className="data-cell-name">{getMatchName(lineup.match_id)}</td>
                  <td className="data-cell-name">{getTeamName(lineup.team_id)}</td>
                  <td>{getPlayerName(lineup.player_id)}</td>
                  <td>{getPositionName(lineup.position_id)}</td>
                  <td>
                    <span className={`badge ${lineup.is_starter ? 'badge-success' : 'badge-gray'}`}>
                      {lineup.is_starter ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td>
                    {lineup.formation_position ? (
                      <code className="formation-code">{lineup.formation_position}</code>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td>{lineup.shirt_number ?? '—'}</td>
                  <td>
                    <div className="action-btns">
                      <button className="edit-btn" onClick={() => openEdit(lineup)}>
                        <Pencil size={14} /> Edit
                      </button>
                      <button className="delete-btn" onClick={() => handleDelete(lineup)} aria-label="Delete">
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
          <div className="data-empty">No match lineups found</div>
        )}
      </div>

      {modalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal modal-wide" onClick={(e) => e.stopPropagation()}>
            <h2>{editing ? 'Edit Match Lineup' : 'Add Match Lineup'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="modal-grid">
                <div className="modal-row">
                  <label>Lineup ID *</label>
                  <input
                    type="number"
                    min="1"
                    value={form.lineup_id}
                    onChange={(e) => setForm({ ...form, lineup_id: e.target.value })}
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
                  <label>Position *</label>
                  {positions.length > 0 ? (
                    <select
                      value={form.position_id}
                      onChange={(e) => setForm({ ...form, position_id: e.target.value })}
                      required
                    >
                      <option value="">Select position</option>
                      {positions.map((pos) => (
                        <option key={pos.position_id} value={pos.position_id}>
                          {pos.name || `Position #${pos.position_id}`}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="number"
                      min="1"
                      value={form.position_id}
                      onChange={(e) => setForm({ ...form, position_id: e.target.value })}
                      placeholder="Position ID"
                      required
                    />
                  )}
                </div>
                <div className="modal-row">
                  <label>Shirt Number</label>
                  <input
                    type="number"
                    min="0"
                    max="99"
                    value={form.shirt_number}
                    onChange={(e) => setForm({ ...form, shirt_number: e.target.value })}
                    placeholder="0-99"
                  />
                </div>
                <div className="modal-row">
                  <label>Formation Position</label>
                  <input
                    type="text"
                    maxLength="10"
                    value={form.formation_position}
                    onChange={(e) => setForm({ ...form, formation_position: e.target.value })}
                    placeholder="e.g. LW, ST, CB"
                  />
                </div>
                <div className="modal-row modal-row-check">
                  <label>
                    <input
                      type="checkbox"
                      checked={form.is_starter}
                      onChange={(e) => setForm({ ...form, is_starter: e.target.checked })}
                    />
                    {' '}Starter
                  </label>
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

export default MatchLineups;
