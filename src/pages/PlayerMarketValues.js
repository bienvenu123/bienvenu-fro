import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { getPlayerMarketValues, createPlayerMarketValue, updatePlayerMarketValue, deletePlayerMarketValue } from '../services/playerMarketValueService';
import { getPlayers } from '../services/playerService';
import './PlayerMarketValues.css';

function PlayerMarketValues() {
  const [marketValues, setMarketValues] = useState([]);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    market_value_id: '',
    player_id: '',
    value_eur: '',
    valuation_date: new Date().toISOString().split('T')[0],
    source: '',
  });

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [marketValuesData] = await Promise.all([
        getPlayerMarketValues(),
      ]);
      setMarketValues(marketValuesData);

      // Try to load players
      try {
        const playersData = await getPlayers();
        setPlayers(playersData);
      } catch (err) {
        console.warn('Players endpoint not available:', err);
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

  const formatCurrency = (value) => {
    if (value === null || value === undefined) return '—';
    try {
      const num = typeof value === 'string' ? parseFloat(value) : value;
      if (isNaN(num)) return '—';
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(num);
    } catch {
      return value;
    }
  };

  const getPlayerName = (playerId) => {
    const p = players.find((x) => x.player_id === playerId);
    if (!p) return `Player #${playerId}`;
    return `${p.first_name || ''} ${p.last_name || ''}`.trim() || `Player #${playerId}`;
  };

  const openCreate = () => {
    setEditing(null);
    setForm({
      market_value_id: '',
      player_id: players[0]?.player_id ?? '',
      value_eur: '',
      valuation_date: new Date().toISOString().split('T')[0],
      source: '',
    });
    setModalOpen(true);
  };

  const openEdit = (marketValue) => {
    setEditing(marketValue);
    setForm({
      market_value_id: String(marketValue.market_value_id),
      player_id: marketValue.player_id ?? '',
      value_eur: marketValue.value_eur ? String(marketValue.value_eur) : '',
      valuation_date: formatDateForInput(marketValue.valuation_date),
      source: marketValue.source || '',
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
        value_eur: form.value_eur ? parseFloat(form.value_eur) : null,
        valuation_date: form.valuation_date || null,
        source: form.source.trim() || null,
      };

      if (editing) {
        await updatePlayerMarketValue(editing.market_value_id, payload);
      } else {
        const marketValueId = parseInt(form.market_value_id, 10);
        if (!marketValueId || marketValueId < 1) {
          setError('Market Value ID must be a positive number');
          return;
        }
        await createPlayerMarketValue({ market_value_id: marketValueId, ...payload });
      }
      closeModal();
      loadData();
    } catch (err) {
      setError(err.message || 'Operation failed');
    }
  };

  const handleDelete = async (marketValue) => {
    if (!window.confirm(`Delete market value #${marketValue.market_value_id}?`)) return;
    try {
      setError(null);
      await deletePlayerMarketValue(marketValue.market_value_id);
      loadData();
    } catch (err) {
      setError(err.message || 'Delete failed');
    }
  };

  const filtered = marketValues.filter(
    (mv) =>
      getPlayerName(mv.player_id)?.toLowerCase().includes(search.toLowerCase()) ||
      formatCurrency(mv.value_eur)?.toLowerCase().includes(search.toLowerCase()) ||
      mv.source?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="data-page">
      <div className="data-toolbar">
        <div className="data-search">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search player market values..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className="data-add-btn" onClick={openCreate}>
          <Plus size={18} />
          Add Market Value
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
                <th>Value (EUR)</th>
                <th>Valuation Date</th>
                <th>Source</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((marketValue) => (
                <tr key={marketValue.market_value_id}>
                  <td>{marketValue.market_value_id}</td>
                  <td className="data-cell-name">{getPlayerName(marketValue.player_id)}</td>
                  <td>
                    <strong className="value-amount">{formatCurrency(marketValue.value_eur)}</strong>
                  </td>
                  <td>{formatDate(marketValue.valuation_date)}</td>
                  <td>{marketValue.source || '—'}</td>
                  <td>
                    <div className="action-btns">
                      <button className="edit-btn" onClick={() => openEdit(marketValue)}>
                        <Pencil size={14} /> Edit
                      </button>
                      <button className="delete-btn" onClick={() => handleDelete(marketValue)} aria-label="Delete">
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
          <div className="data-empty">No player market values found</div>
        )}
      </div>

      {modalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{editing ? 'Edit Player Market Value' : 'Add Player Market Value'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="modal-row">
                <label>Market Value ID *</label>
                <input
                  type="number"
                  min="1"
                  value={form.market_value_id}
                  onChange={(e) => setForm({ ...form, market_value_id: e.target.value })}
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
                <label>Value (EUR) *</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.value_eur}
                  onChange={(e) => setForm({ ...form, value_eur: e.target.value })}
                  placeholder="e.g. 50000000"
                  required
                />
              </div>
              <div className="modal-row">
                <label>Valuation Date *</label>
                <input
                  type="date"
                  value={form.valuation_date}
                  onChange={(e) => setForm({ ...form, valuation_date: e.target.value })}
                  required
                />
              </div>
              <div className="modal-row">
                <label>Source</label>
                <input
                  type="text"
                  maxLength="50"
                  value={form.source}
                  onChange={(e) => setForm({ ...form, source: e.target.value })}
                  placeholder="e.g. Transfermarkt"
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

export default PlayerMarketValues;
