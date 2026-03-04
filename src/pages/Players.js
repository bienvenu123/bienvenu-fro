import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { getPlayers, createPlayer, updatePlayer, deletePlayer } from '../services/playerService';
import { getCountries } from '../services/countryService';
import './Players.css';

function Players() {
  const [players, setPlayers] = useState([]);
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    player_id: '',
    first_name: '',
    last_name: '',
    date_of_birth: '',
    nationality_id: '',
    second_nationality_id: '',
    height_cm: '',
    weight_kg: '',
    preferred_foot: '',
    photo_url: '',
    shirt_number: '',
    is_active: true,
  });

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [playersData, countriesData] = await Promise.all([
        getPlayers(),
        getCountries(),
      ]);
      setPlayers(playersData);
      setCountries(countriesData);
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

  const getCountryName = (countryId) => {
    if (!countryId) return '—';
    const c = countries.find((x) => x.country_id === countryId);
    return c ? c.name : `Country #${countryId}`;
  };

  const getFullName = (player) => {
    return `${player.first_name || ''} ${player.last_name || ''}`.trim() || `Player #${player.player_id}`;
  };

  const openCreate = () => {
    setEditing(null);
    setForm({
      player_id: '',
      first_name: '',
      last_name: '',
      date_of_birth: '',
      nationality_id: countries[0]?.country_id ?? '',
      second_nationality_id: '',
      height_cm: '',
      weight_kg: '',
      preferred_foot: '',
      photo_url: '',
      shirt_number: '',
      is_active: true,
    });
    setModalOpen(true);
  };

  const openEdit = (player) => {
    setEditing(player);
    setForm({
      player_id: String(player.player_id),
      first_name: player.first_name || '',
      last_name: player.last_name || '',
      date_of_birth: formatDateForInput(player.date_of_birth),
      nationality_id: player.nationality_id ?? '',
      second_nationality_id: player.second_nationality_id ?? '',
      height_cm: player.height_cm ?? '',
      weight_kg: player.weight_kg ?? '',
      preferred_foot: player.preferred_foot || '',
      photo_url: player.photo_url || '',
      shirt_number: player.shirt_number ?? '',
      is_active: player.is_active !== false,
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
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        date_of_birth: form.date_of_birth || null,
        nationality_id: parseInt(form.nationality_id, 10) || null,
        second_nationality_id: form.second_nationality_id ? parseInt(form.second_nationality_id, 10) : null,
        height_cm: form.height_cm ? parseInt(form.height_cm, 10) : null,
        weight_kg: form.weight_kg ? parseFloat(form.weight_kg) : null,
        preferred_foot: form.preferred_foot || null,
        photo_url: form.photo_url.trim() || null,
        shirt_number: form.shirt_number ? parseInt(form.shirt_number, 10) : null,
        is_active: form.is_active,
      };

      if (editing) {
        await updatePlayer(editing.player_id, payload);
      } else {
        const playerId = parseInt(form.player_id, 10);
        if (!playerId || playerId < 1) {
          setError('Player ID must be a positive number');
          return;
        }
        await createPlayer({ player_id: playerId, ...payload });
      }
      closeModal();
      loadData();
    } catch (err) {
      setError(err.message || 'Operation failed');
    }
  };

  const handleDelete = async (player) => {
    const fullName = getFullName(player);
    if (!window.confirm(`Delete ${fullName}?`)) return;
    try {
      setError(null);
      await deletePlayer(player.player_id);
      loadData();
    } catch (err) {
      setError(err.message || 'Delete failed');
    }
  };

  const filtered = players.filter(
    (p) =>
      p.first_name?.toLowerCase().includes(search.toLowerCase()) ||
      p.last_name?.toLowerCase().includes(search.toLowerCase()) ||
      getCountryName(p.nationality_id)?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="data-page">
      <div className="data-toolbar">
        <div className="data-search">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search players..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className="data-add-btn" onClick={openCreate}>
          <Plus size={18} />
          Add Player
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
                <th>Photo</th>
                <th>First Name</th>
                <th>Last Name</th>
                <th>Date of Birth</th>
                <th>Nationality</th>
                <th>Height</th>
                <th>Weight</th>
                <th>Foot</th>
                <th>Shirt #</th>
                <th>Active</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((player) => (
                <tr key={player.player_id}>
                  <td>{player.player_id}</td>
                  <td>
                    {player.photo_url ? (
                      <img src={player.photo_url} alt="" className="player-photo" />
                    ) : (
                      <span className="photo-placeholder">—</span>
                    )}
                  </td>
                  <td className="data-cell-name">{player.first_name}</td>
                  <td className="data-cell-name">{player.last_name}</td>
                  <td>{formatDate(player.date_of_birth)}</td>
                  <td>{getCountryName(player.nationality_id)}</td>
                  <td>{player.height_cm ? `${player.height_cm} cm` : '—'}</td>
                  <td>{player.weight_kg ? `${player.weight_kg} kg` : '—'}</td>
                  <td>
                    {player.preferred_foot ? (
                      <span className="badge badge-info">{player.preferred_foot}</span>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td>{player.shirt_number ?? '—'}</td>
                  <td>
                    <span className={`badge ${player.is_active ? 'badge-success' : 'badge-gray'}`}>
                      {player.is_active ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td>
                    <div className="action-btns">
                      <button className="edit-btn" onClick={() => openEdit(player)}>
                        <Pencil size={14} /> Edit
                      </button>
                      <button className="delete-btn" onClick={() => handleDelete(player)} aria-label="Delete">
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
          <div className="data-empty">No players found</div>
        )}
      </div>

      {modalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal modal-wide" onClick={(e) => e.stopPropagation()}>
            <h2>{editing ? 'Edit Player' : 'Add Player'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="modal-grid">
                <div className="modal-row">
                  <label>Player ID *</label>
                  <input
                    type="number"
                    min="1"
                    value={form.player_id}
                    onChange={(e) => setForm({ ...form, player_id: e.target.value })}
                    disabled={!!editing}
                    required
                  />
                </div>
                <div className="modal-row">
                  <label>First Name *</label>
                  <input
                    type="text"
                    maxLength="100"
                    value={form.first_name}
                    onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                    required
                  />
                </div>
                <div className="modal-row">
                  <label>Last Name *</label>
                  <input
                    type="text"
                    maxLength="100"
                    value={form.last_name}
                    onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                    required
                  />
                </div>
                <div className="modal-row">
                  <label>Date of Birth *</label>
                  <input
                    type="date"
                    value={form.date_of_birth}
                    onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })}
                    required
                  />
                </div>
                <div className="modal-row">
                  <label>Nationality *</label>
                  <select
                    value={form.nationality_id}
                    onChange={(e) => setForm({ ...form, nationality_id: e.target.value })}
                    required
                  >
                    <option value="">Select country</option>
                    {countries.map((c) => (
                      <option key={c.country_id} value={c.country_id}>
                        {c.name} ({c.code})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="modal-row">
                  <label>Second Nationality</label>
                  <select
                    value={form.second_nationality_id}
                    onChange={(e) => setForm({ ...form, second_nationality_id: e.target.value })}
                  >
                    <option value="">None</option>
                    {countries.map((c) => (
                      <option key={c.country_id} value={c.country_id}>
                        {c.name} ({c.code})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="modal-row">
                  <label>Height (cm)</label>
                  <input
                    type="number"
                    min="0"
                    value={form.height_cm}
                    onChange={(e) => setForm({ ...form, height_cm: e.target.value })}
                    placeholder="e.g. 180"
                  />
                </div>
                <div className="modal-row">
                  <label>Weight (kg)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={form.weight_kg}
                    onChange={(e) => setForm({ ...form, weight_kg: e.target.value })}
                    placeholder="e.g. 75.5"
                  />
                </div>
                <div className="modal-row">
                  <label>Preferred Foot</label>
                  <select
                    value={form.preferred_foot}
                    onChange={(e) => setForm({ ...form, preferred_foot: e.target.value })}
                  >
                    <option value="">None</option>
                    <option value="left">Left</option>
                    <option value="right">Right</option>
                    <option value="both">Both</option>
                  </select>
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
                  <label>Photo URL</label>
                  <input
                    type="url"
                    maxLength="255"
                    placeholder="https://..."
                    value={form.photo_url}
                    onChange={(e) => setForm({ ...form, photo_url: e.target.value })}
                  />
                </div>
                <div className="modal-row modal-row-check">
                  <label>
                    <input
                      type="checkbox"
                      checked={form.is_active}
                      onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                    />
                    {' '}Active
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

export default Players;
