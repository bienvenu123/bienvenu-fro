import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { getPlayerAttributes, createPlayerAttribute, updatePlayerAttribute, deletePlayerAttribute } from '../services/playerAttributeService';
import { getPlayers } from '../services/playerService';
import { getSeasons } from '../services/seasonService';
import './PlayerAttributes.css';

function PlayerAttributes() {
  const [attributes, setAttributes] = useState([]);
  const [players, setPlayers] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    attribute_id: '',
    player_id: '',
    season_id: '',
    pace: '',
    shooting: '',
    passing: '',
    dribbling: '',
    defending: '',
    physical: '',
    overall_rating: '',
    potential_rating: '',
    updated_at: '',
  });

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [attributesData] = await Promise.all([
        getPlayerAttributes(),
      ]);
      setAttributes(attributesData);

      // Try to load optional related data
      try {
        const playersData = await getPlayers();
        setPlayers(playersData);
      } catch (err) {
        console.warn('Players endpoint not available:', err);
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
    const p = players.find((x) => x.player_id === playerId);
    if (!p) return `Player #${playerId}`;
    return `${p.first_name || ''} ${p.last_name || ''}`.trim() || `Player #${playerId}`;
  };

  const getSeasonName = (seasonId) => {
    if (!seasonId) return '—';
    const s = seasons.find((x) => x.season_id === seasonId);
    return s ? (s.name || `Season #${seasonId}`) : `Season #${seasonId}`;
  };

  const getRatingColor = (rating) => {
    if (rating === null || rating === undefined) return '';
    if (rating >= 80) return 'rating-excellent';
    if (rating >= 70) return 'rating-good';
    if (rating >= 60) return 'rating-average';
    if (rating >= 50) return 'rating-below-average';
    return 'rating-poor';
  };

  const openCreate = () => {
    setEditing(null);
    setForm({
      attribute_id: '',
      player_id: players[0]?.player_id ?? '',
      season_id: seasons[0]?.season_id ?? '',
      pace: '',
      shooting: '',
      passing: '',
      dribbling: '',
      defending: '',
      physical: '',
      overall_rating: '',
      potential_rating: '',
      updated_at: new Date().toISOString().split('T')[0],
    });
    setModalOpen(true);
  };

  const openEdit = (attribute) => {
    setEditing(attribute);
    setForm({
      attribute_id: String(attribute.attribute_id),
      player_id: attribute.player_id ?? '',
      season_id: attribute.season_id ?? '',
      pace: attribute.pace ?? '',
      shooting: attribute.shooting ?? '',
      passing: attribute.passing ?? '',
      dribbling: attribute.dribbling ?? '',
      defending: attribute.defending ?? '',
      physical: attribute.physical ?? '',
      overall_rating: attribute.overall_rating ?? '',
      potential_rating: attribute.potential_rating ?? '',
      updated_at: formatDateForInput(attribute.updated_at),
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
        season_id: parseInt(form.season_id, 10) || null,
        pace: form.pace ? parseInt(form.pace, 10) : null,
        shooting: form.shooting ? parseInt(form.shooting, 10) : null,
        passing: form.passing ? parseInt(form.passing, 10) : null,
        dribbling: form.dribbling ? parseInt(form.dribbling, 10) : null,
        defending: form.defending ? parseInt(form.defending, 10) : null,
        physical: form.physical ? parseInt(form.physical, 10) : null,
        overall_rating: form.overall_rating ? parseInt(form.overall_rating, 10) : null,
        potential_rating: form.potential_rating ? parseInt(form.potential_rating, 10) : null,
        updated_at: form.updated_at || new Date().toISOString(),
      };

      if (editing) {
        await updatePlayerAttribute(editing.attribute_id, payload);
      } else {
        const attributeId = parseInt(form.attribute_id, 10);
        if (!attributeId || attributeId < 1) {
          setError('Attribute ID must be a positive number');
          return;
        }
        await createPlayerAttribute({ attribute_id: attributeId, ...payload });
      }
      closeModal();
      loadData();
    } catch (err) {
      setError(err.message || 'Operation failed');
    }
  };

  const handleDelete = async (attribute) => {
    if (!window.confirm(`Delete player attribute #${attribute.attribute_id}?`)) return;
    try {
      setError(null);
      await deletePlayerAttribute(attribute.attribute_id);
      loadData();
    } catch (err) {
      setError(err.message || 'Delete failed');
    }
  };

  const filtered = attributes.filter(
    (a) =>
      getPlayerName(a.player_id)?.toLowerCase().includes(search.toLowerCase()) ||
      getSeasonName(a.season_id)?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="data-page">
      <div className="data-toolbar">
        <div className="data-search">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search player attributes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className="data-add-btn" onClick={openCreate}>
          <Plus size={18} />
          Add Player Attribute
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
                <th>Season</th>
                <th>Pace</th>
                <th>Shooting</th>
                <th>Passing</th>
                <th>Dribbling</th>
                <th>Defending</th>
                <th>Physical</th>
                <th>Overall</th>
                <th>Potential</th>
                <th>Updated</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((attr) => (
                <tr key={attr.attribute_id}>
                  <td>{attr.attribute_id}</td>
                  <td className="data-cell-name">{getPlayerName(attr.player_id)}</td>
                  <td>{getSeasonName(attr.season_id)}</td>
                  <td>
                    {attr.pace !== null ? (
                      <span className={`rating ${getRatingColor(attr.pace)}`}>{attr.pace}</span>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td>
                    {attr.shooting !== null ? (
                      <span className={`rating ${getRatingColor(attr.shooting)}`}>{attr.shooting}</span>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td>
                    {attr.passing !== null ? (
                      <span className={`rating ${getRatingColor(attr.passing)}`}>{attr.passing}</span>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td>
                    {attr.dribbling !== null ? (
                      <span className={`rating ${getRatingColor(attr.dribbling)}`}>{attr.dribbling}</span>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td>
                    {attr.defending !== null ? (
                      <span className={`rating ${getRatingColor(attr.defending)}`}>{attr.defending}</span>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td>
                    {attr.physical !== null ? (
                      <span className={`rating ${getRatingColor(attr.physical)}`}>{attr.physical}</span>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td>
                    {attr.overall_rating !== null ? (
                      <strong className={`rating ${getRatingColor(attr.overall_rating)}`}>{attr.overall_rating}</strong>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td>
                    {attr.potential_rating !== null ? (
                      <strong className={`rating ${getRatingColor(attr.potential_rating)}`}>{attr.potential_rating}</strong>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td>{formatDate(attr.updated_at)}</td>
                  <td>
                    <div className="action-btns">
                      <button className="edit-btn" onClick={() => openEdit(attr)}>
                        <Pencil size={14} /> Edit
                      </button>
                      <button className="delete-btn" onClick={() => handleDelete(attr)} aria-label="Delete">
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
          <div className="data-empty">No player attributes found</div>
        )}
      </div>

      {modalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal modal-extra-wide" onClick={(e) => e.stopPropagation()}>
            <h2>{editing ? 'Edit Player Attribute' : 'Add Player Attribute'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="modal-grid">
                <div className="modal-row">
                  <label>Attribute ID *</label>
                  <input
                    type="number"
                    min="1"
                    value={form.attribute_id}
                    onChange={(e) => setForm({ ...form, attribute_id: e.target.value })}
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
                  <label>Pace (0-100)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={form.pace}
                    onChange={(e) => setForm({ ...form, pace: e.target.value })}
                    placeholder="0-100"
                  />
                </div>
                <div className="modal-row">
                  <label>Shooting (0-100)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={form.shooting}
                    onChange={(e) => setForm({ ...form, shooting: e.target.value })}
                    placeholder="0-100"
                  />
                </div>
                <div className="modal-row">
                  <label>Passing (0-100)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={form.passing}
                    onChange={(e) => setForm({ ...form, passing: e.target.value })}
                    placeholder="0-100"
                  />
                </div>
                <div className="modal-row">
                  <label>Dribbling (0-100)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={form.dribbling}
                    onChange={(e) => setForm({ ...form, dribbling: e.target.value })}
                    placeholder="0-100"
                  />
                </div>
                <div className="modal-row">
                  <label>Defending (0-100)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={form.defending}
                    onChange={(e) => setForm({ ...form, defending: e.target.value })}
                    placeholder="0-100"
                  />
                </div>
                <div className="modal-row">
                  <label>Physical (0-100)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={form.physical}
                    onChange={(e) => setForm({ ...form, physical: e.target.value })}
                    placeholder="0-100"
                  />
                </div>
                <div className="modal-row">
                  <label>Overall Rating (0-100)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={form.overall_rating}
                    onChange={(e) => setForm({ ...form, overall_rating: e.target.value })}
                    placeholder="0-100"
                  />
                </div>
                <div className="modal-row">
                  <label>Potential Rating (0-100)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={form.potential_rating}
                    onChange={(e) => setForm({ ...form, potential_rating: e.target.value })}
                    placeholder="0-100"
                  />
                </div>
                <div className="modal-row">
                  <label>Updated At</label>
                  <input
                    type="date"
                    value={form.updated_at}
                    onChange={(e) => setForm({ ...form, updated_at: e.target.value })}
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

export default PlayerAttributes;
