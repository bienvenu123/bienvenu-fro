import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { getAwardWinners, createAwardWinner, updateAwardWinner, deleteAwardWinner } from '../services/awardWinnerService';
import { getAwards } from '../services/awardService';
import { getTeams } from '../services/teamService';
import { getPlayers } from '../services/playerService';
import { getManagers } from '../services/managerService';
import { getSeasons } from '../services/seasonService';
import './AwardWinners.css';

function AwardWinners() {
  const [winners, setWinners] = useState([]);
  const [awards, setAwards] = useState([]);
  const [teams, setTeams] = useState([]);
  const [players, setPlayers] = useState([]);
  const [managers, setManagers] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    winner_id: '',
    award_id: '',
    player_id: '',
    team_id: '',
    manager_id: '',
    season_id: '',
    year: new Date().getFullYear(),
  });

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [winnersData, awardsData, teamsData] = await Promise.all([
        getAwardWinners(),
        getAwards().catch(() => []),
        getTeams().catch(() => []),
      ]);
      setWinners(winnersData);
      setAwards(awardsData);
      setTeams(teamsData);

      // Try to load optional related data, but don't fail if they don't exist
      try {
        const playersData = await getPlayers();
        setPlayers(playersData);
      } catch (err) {
        console.warn('Players endpoint not available:', err);
      }

      try {
        const managersData = await getManagers();
        setManagers(managersData);
      } catch (err) {
        console.warn('Managers endpoint not available:', err);
      }

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

  const getAwardName = (awardId) => {
    const a = awards.find((x) => x.award_id === awardId);
    return a ? a.name : `Award #${awardId}`;
  };

  const getTeamName = (teamId) => {
    if (!teamId) return '—';
    const t = teams.find((x) => x.team_id === teamId);
    return t ? t.name : `Team #${teamId}`;
  };

  const getPlayerName = (playerId) => {
    if (!playerId) return '—';
    const p = players.find((x) => x.player_id === playerId);
    return p ? (p.name || `Player #${playerId}`) : `Player #${playerId}`;
  };

  const getManagerName = (managerId) => {
    if (!managerId) return '—';
    const m = managers.find((x) => x.manager_id === managerId);
    return m ? (m.name || `Manager #${managerId}`) : `Manager #${managerId}`;
  };

  const getSeasonName = (seasonId) => {
    if (!seasonId) return '—';
    const s = seasons.find((x) => x.season_id === seasonId);
    return s ? (s.name || `Season #${seasonId}`) : `Season #${seasonId}`;
  };

  const openCreate = () => {
    setEditing(null);
    setForm({
      winner_id: '',
      award_id: awards[0]?.award_id ?? '',
      player_id: '',
      team_id: '',
      manager_id: '',
      season_id: '',
      year: new Date().getFullYear(),
    });
    setModalOpen(true);
  };

  const openEdit = (winner) => {
    setEditing(winner);
    setForm({
      winner_id: String(winner.winner_id),
      award_id: winner.award_id ?? '',
      player_id: winner.player_id ?? '',
      team_id: winner.team_id ?? '',
      manager_id: winner.manager_id ?? '',
      season_id: winner.season_id ?? '',
      year: winner.year ?? new Date().getFullYear(),
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
        award_id: parseInt(form.award_id, 10) || null,
        player_id: form.player_id ? parseInt(form.player_id, 10) : null,
        team_id: form.team_id ? parseInt(form.team_id, 10) : null,
        manager_id: form.manager_id ? parseInt(form.manager_id, 10) : null,
        season_id: form.season_id ? parseInt(form.season_id, 10) : null,
        year: parseInt(form.year, 10) || new Date().getFullYear(),
      };

      if (editing) {
        await updateAwardWinner(editing.winner_id, payload);
      } else {
        const winnerId = parseInt(form.winner_id, 10);
        if (!winnerId || winnerId < 1) {
          setError('Winner ID must be a positive number');
          return;
        }
        await createAwardWinner({ winner_id: winnerId, ...payload });
      }
      closeModal();
      loadData();
    } catch (err) {
      setError(err.message || 'Operation failed');
    }
  };

  const handleDelete = async (winner) => {
    if (!window.confirm(`Delete award winner #${winner.winner_id}?`)) return;
    try {
      setError(null);
      await deleteAwardWinner(winner.winner_id);
      loadData();
    } catch (err) {
      setError(err.message || 'Delete failed');
    }
  };

  const filtered = winners.filter(
    (w) =>
      getAwardName(w.award_id)?.toLowerCase().includes(search.toLowerCase()) ||
      getTeamName(w.team_id)?.toLowerCase().includes(search.toLowerCase()) ||
      getPlayerName(w.player_id)?.toLowerCase().includes(search.toLowerCase()) ||
      getManagerName(w.manager_id)?.toLowerCase().includes(search.toLowerCase()) ||
      String(w.year)?.includes(search)
  );

  return (
    <div className="data-page">
      <div className="data-toolbar">
        <div className="data-search">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search award winners..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className="data-add-btn" onClick={openCreate}>
          <Plus size={18} />
          Add Award Winner
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
                <th>Award</th>
                <th>Year</th>
                <th>Player</th>
                <th>Team</th>
                <th>Manager</th>
                <th>Season</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((winner) => (
                <tr key={winner.winner_id}>
                  <td>{winner.winner_id}</td>
                  <td className="data-cell-name">{getAwardName(winner.award_id)}</td>
                  <td>{winner.year}</td>
                  <td>{getPlayerName(winner.player_id)}</td>
                  <td>{getTeamName(winner.team_id)}</td>
                  <td>{getManagerName(winner.manager_id)}</td>
                  <td>{getSeasonName(winner.season_id)}</td>
                  <td>
                    <div className="action-btns">
                      <button className="edit-btn" onClick={() => openEdit(winner)}>
                        <Pencil size={14} /> Edit
                      </button>
                      <button className="delete-btn" onClick={() => handleDelete(winner)} aria-label="Delete">
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
          <div className="data-empty">No award winners found</div>
        )}
      </div>

      {modalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal modal-wide" onClick={(e) => e.stopPropagation()}>
            <h2>{editing ? 'Edit Award Winner' : 'Add Award Winner'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="modal-grid">
                <div className="modal-row">
                  <label>Winner ID *</label>
                  <input
                    type="number"
                    min="1"
                    value={form.winner_id}
                    onChange={(e) => setForm({ ...form, winner_id: e.target.value })}
                    disabled={!!editing}
                    required
                  />
                </div>
                <div className="modal-row">
                  <label>Award *</label>
                  {awards.length > 0 ? (
                    <select
                      value={form.award_id}
                      onChange={(e) => setForm({ ...form, award_id: e.target.value })}
                      required
                    >
                      <option value="">Select award</option>
                      {awards.map((a) => (
                        <option key={a.award_id} value={a.award_id}>
                          {a.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="number"
                      min="1"
                      value={form.award_id}
                      onChange={(e) => setForm({ ...form, award_id: e.target.value })}
                      placeholder="Award ID"
                      required
                    />
                  )}
                </div>
                <div className="modal-row">
                  <label>Year *</label>
                  <input
                    type="number"
                    min="1800"
                    max="2100"
                    value={form.year}
                    onChange={(e) => setForm({ ...form, year: e.target.value })}
                    required
                  />
                </div>
                <div className="modal-row">
                  <label>Player ID</label>
                  {players.length > 0 ? (
                    <select
                      value={form.player_id}
                      onChange={(e) => setForm({ ...form, player_id: e.target.value })}
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
                      value={form.player_id}
                      onChange={(e) => setForm({ ...form, player_id: e.target.value })}
                      placeholder="Player ID (optional)"
                    />
                  )}
                </div>
                <div className="modal-row">
                  <label>Team ID</label>
                  {teams.length > 0 ? (
                    <select
                      value={form.team_id}
                      onChange={(e) => setForm({ ...form, team_id: e.target.value })}
                    >
                      <option value="">None</option>
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
                      placeholder="Team ID (optional)"
                    />
                  )}
                </div>
                <div className="modal-row">
                  <label>Manager ID</label>
                  {managers.length > 0 ? (
                    <select
                      value={form.manager_id}
                      onChange={(e) => setForm({ ...form, manager_id: e.target.value })}
                    >
                      <option value="">None</option>
                      {managers.map((m) => (
                        <option key={m.manager_id} value={m.manager_id}>
                          {m.name || `Manager #${m.manager_id}`}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="number"
                      min="1"
                      value={form.manager_id}
                      onChange={(e) => setForm({ ...form, manager_id: e.target.value })}
                      placeholder="Manager ID (optional)"
                    />
                  )}
                </div>
                <div className="modal-row">
                  <label>Season ID</label>
                  {seasons.length > 0 ? (
                    <select
                      value={form.season_id}
                      onChange={(e) => setForm({ ...form, season_id: e.target.value })}
                    >
                      <option value="">None</option>
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
                      placeholder="Season ID (optional)"
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

export default AwardWinners;
