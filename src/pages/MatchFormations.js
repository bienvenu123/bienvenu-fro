import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { getMatchFormations, createMatchFormation, updateMatchFormation, deleteMatchFormation } from '../services/matchFormationService';
import { getMatches } from '../services/matchService';
import { getTeams } from '../services/teamService';
import './MatchFormations.css';

function MatchFormations() {
  const [formations, setFormations] = useState([]);
  const [matches, setMatches] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    formation_id: '',
    match_id: '',
    team_id: '',
    formation: '',
    formation_type: '',
  });

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [formationsData, matchesData, teamsData] = await Promise.all([
        getMatchFormations(),
        getMatches().catch(() => []),
        getTeams().catch(() => []),
      ]);
      setFormations(formationsData);
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
    setForm({
      formation_id: '',
      match_id: matches[0]?.match_id ?? '',
      team_id: teams[0]?.team_id ?? '',
      formation: '',
      formation_type: '',
    });
    setModalOpen(true);
  };

  const openEdit = (formation) => {
    setEditing(formation);
    setForm({
      formation_id: String(formation.formation_id),
      match_id: formation.match_id ?? '',
      team_id: formation.team_id ?? '',
      formation: formation.formation || '',
      formation_type: formation.formation_type || '',
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
        formation: form.formation.trim(),
        formation_type: form.formation_type.trim() || null,
      };

      if (editing) {
        await updateMatchFormation(editing.formation_id, payload);
      } else {
        const formationId = parseInt(form.formation_id, 10);
        if (!formationId || formationId < 1) {
          setError('Formation ID must be a positive number');
          return;
        }
        await createMatchFormation({ formation_id: formationId, ...payload });
      }
      closeModal();
      loadData();
    } catch (err) {
      setError(err.message || 'Operation failed');
    }
  };

  const handleDelete = async (formation) => {
    if (!window.confirm(`Delete formation #${formation.formation_id}?`)) return;
    try {
      setError(null);
      await deleteMatchFormation(formation.formation_id);
      loadData();
    } catch (err) {
      setError(err.message || 'Delete failed');
    }
  };

  const filtered = formations.filter(
    (f) =>
      getMatchName(f.match_id)?.toLowerCase().includes(search.toLowerCase()) ||
      getTeamName(f.team_id)?.toLowerCase().includes(search.toLowerCase()) ||
      f.formation?.toLowerCase().includes(search.toLowerCase()) ||
      f.formation_type?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="data-page">
      <div className="data-toolbar">
        <div className="data-search">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search match formations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className="data-add-btn" onClick={openCreate}>
          <Plus size={18} />
          Add Match Formation
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
                <th>Formation</th>
                <th>Formation Type</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((formation) => (
                <tr key={formation.formation_id}>
                  <td>{formation.formation_id}</td>
                  <td className="data-cell-name">{getMatchName(formation.match_id)}</td>
                  <td className="data-cell-name">{getTeamName(formation.team_id)}</td>
                  <td>
                    <code className="formation-code">{formation.formation}</code>
                  </td>
                  <td>{formation.formation_type || '—'}</td>
                  <td>
                    <div className="action-btns">
                      <button className="edit-btn" onClick={() => openEdit(formation)}>
                        <Pencil size={14} /> Edit
                      </button>
                      <button className="delete-btn" onClick={() => handleDelete(formation)} aria-label="Delete">
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
          <div className="data-empty">No match formations found</div>
        )}
      </div>

      {modalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{editing ? 'Edit Match Formation' : 'Add Match Formation'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="modal-row">
                <label>Formation ID *</label>
                <input
                  type="number"
                  min="1"
                  value={form.formation_id}
                  onChange={(e) => setForm({ ...form, formation_id: e.target.value })}
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
                <label>Formation *</label>
                <input
                  type="text"
                  maxLength="10"
                  value={form.formation}
                  onChange={(e) => setForm({ ...form, formation: e.target.value })}
                  placeholder="e.g. 4-4-2"
                  required
                />
              </div>
              <div className="modal-row">
                <label>Formation Type</label>
                <input
                  type="text"
                  maxLength="50"
                  value={form.formation_type}
                  onChange={(e) => setForm({ ...form, formation_type: e.target.value })}
                  placeholder="e.g. Attacking, Defensive"
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

export default MatchFormations;
