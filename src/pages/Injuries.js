import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { getInjuries, createInjury, updateInjury, deleteInjury } from '../services/injuryService';
import { getPlayers } from '../services/playerService';
import './Injuries.css';

function Injuries() {
  const [injuries, setInjuries] = useState([]);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    injury_id: '',
    player_id: '',
    injury_type: '',
    injury_date: '',
    expected_return_date: '',
    actual_return_date: '',
    severity: 'minor',
    matches_missed: '0',
  });

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [injuriesData] = await Promise.all([getInjuries()]);
      setInjuries(injuriesData);

      // Try to load players, but don't fail if endpoint doesn't exist
      try {
        const playersData = await getPlayers();
        setPlayers(playersData);
      } catch (err) {
        console.warn('Players endpoint not available:', err);
      }
    } catch (err) {
      setError(err.message || 'Failed to load injuries');
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

  const getPlayerName = (playerId) => {
    if (!playerId) return '—';
    const p = players.find((x) => x.player_id === playerId);
    return p ? (p.name || `Player #${playerId}`) : `Player #${playerId}`;
  };

  const getSeverityBadgeClass = (severity) => {
    switch (severity) {
      case 'minor':
        return 'badge-success';
      case 'moderate':
        return 'badge-warning';
      case 'severe':
        return 'badge-danger';
      default:
        return 'badge-gray';
    }
  };

  const openCreate = () => {
    setEditing(null);
    setForm({
      injury_id: '',
      player_id: players[0]?.player_id ?? '',
      injury_type: '',
      injury_date: new Date().toISOString().split('T')[0],
      expected_return_date: '',
      actual_return_date: '',
      severity: 'minor',
      matches_missed: '0',
    });
    setModalOpen(true);
  };

  const openEdit = (injury) => {
    setEditing(injury);
    setForm({
      injury_id: String(injury.injury_id),
      player_id: injury.player_id ?? '',
      injury_type: injury.injury_type || '',
      injury_date: formatDateForInput(injury.injury_date),
      expected_return_date: formatDateForInput(injury.expected_return_date),
      actual_return_date: formatDateForInput(injury.actual_return_date),
      severity: injury.severity || 'minor',
      matches_missed: String(injury.matches_missed ?? 0),
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
        injury_type: form.injury_type.trim(),
        injury_date: form.injury_date || null,
        expected_return_date: form.expected_return_date || null,
        actual_return_date: form.actual_return_date || null,
        severity: form.severity,
        matches_missed: parseInt(form.matches_missed, 10) || 0,
      };

      if (editing) {
        await updateInjury(editing.injury_id, payload);
      } else {
        const injuryId = parseInt(form.injury_id, 10);
        if (!injuryId || injuryId < 1) {
          setError('Injury ID must be a positive number');
          return;
        }
        await createInjury({ injury_id: injuryId, ...payload });
      }
      closeModal();
      loadData();
    } catch (err) {
      setError(err.message || 'Operation failed');
    }
  };

  const handleDelete = async (injury) => {
    if (!window.confirm(`Delete injury #${injury.injury_id}?`)) return;
    try {
      setError(null);
      await deleteInjury(injury.injury_id);
      loadData();
    } catch (err) {
      setError(err.message || 'Delete failed');
    }
  };

  const filtered = injuries.filter(
    (i) =>
      getPlayerName(i.player_id)?.toLowerCase().includes(search.toLowerCase()) ||
      i.injury_type?.toLowerCase().includes(search.toLowerCase()) ||
      i.severity?.toLowerCase().includes(search.toLowerCase()) ||
      formatDate(i.injury_date)?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="data-page">
      <div className="data-toolbar">
        <div className="data-search">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search injuries..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className="data-add-btn" onClick={openCreate}>
          <Plus size={18} />
          Add Injury
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
                <th>Injury Type</th>
                <th>Injury Date</th>
                <th>Expected Return</th>
                <th>Actual Return</th>
                <th>Severity</th>
                <th>Matches Missed</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((injury) => (
                <tr key={injury.injury_id}>
                  <td>{injury.injury_id}</td>
                  <td className="data-cell-name">{getPlayerName(injury.player_id)}</td>
                  <td>{injury.injury_type}</td>
                  <td>{formatDate(injury.injury_date)}</td>
                  <td>{formatDate(injury.expected_return_date)}</td>
                  <td>{formatDate(injury.actual_return_date)}</td>
                  <td>
                    <span className={`badge ${getSeverityBadgeClass(injury.severity)}`}>
                      {injury.severity}
                    </span>
                  </td>
                  <td>{injury.matches_missed || 0}</td>
                  <td>
                    <div className="action-btns">
                      <button className="edit-btn" onClick={() => openEdit(injury)}>
                        <Pencil size={14} /> Edit
                      </button>
                      <button className="delete-btn" onClick={() => handleDelete(injury)} aria-label="Delete">
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
          <div className="data-empty">No injuries found</div>
        )}
      </div>

      {modalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal modal-wide" onClick={(e) => e.stopPropagation()}>
            <h2>{editing ? 'Edit Injury' : 'Add Injury'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="modal-grid">
                <div className="modal-row">
                  <label>Injury ID *</label>
                  <input
                    type="number"
                    min="1"
                    value={form.injury_id}
                    onChange={(e) => setForm({ ...form, injury_id: e.target.value })}
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
                  <label>Injury Type *</label>
                  <input
                    type="text"
                    maxLength="100"
                    value={form.injury_type}
                    onChange={(e) => setForm({ ...form, injury_type: e.target.value })}
                    placeholder="e.g. Ankle sprain"
                    required
                  />
                </div>
                <div className="modal-row">
                  <label>Injury Date *</label>
                  <input
                    type="date"
                    value={form.injury_date}
                    onChange={(e) => setForm({ ...form, injury_date: e.target.value })}
                    required
                  />
                </div>
                <div className="modal-row">
                  <label>Severity *</label>
                  <select
                    value={form.severity}
                    onChange={(e) => setForm({ ...form, severity: e.target.value })}
                    required
                  >
                    <option value="minor">Minor</option>
                    <option value="moderate">Moderate</option>
                    <option value="severe">Severe</option>
                  </select>
                </div>
                <div className="modal-row">
                  <label>Expected Return Date</label>
                  <input
                    type="date"
                    value={form.expected_return_date}
                    onChange={(e) => setForm({ ...form, expected_return_date: e.target.value })}
                  />
                </div>
                <div className="modal-row">
                  <label>Actual Return Date</label>
                  <input
                    type="date"
                    value={form.actual_return_date}
                    onChange={(e) => setForm({ ...form, actual_return_date: e.target.value })}
                  />
                </div>
                <div className="modal-row">
                  <label>Matches Missed</label>
                  <input
                    type="number"
                    min="0"
                    value={form.matches_missed}
                    onChange={(e) => setForm({ ...form, matches_missed: e.target.value })}
                    placeholder="0"
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

export default Injuries;
