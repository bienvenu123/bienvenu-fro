import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { getStadiums, createStadium, updateStadium, deleteStadium } from '../services/stadiumService';
import { getCountries } from '../services/countryService';
import './Stadiums.css';

function Stadiums() {
  const [stadiums, setStadiums] = useState([]);
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    stadium_id: '',
    name: '',
    city: '',
    country_id: '',
    capacity: '',
    built_year: '',
    surface_type: '',
    photo_url: '',
  });

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [stadiumsData, countriesData] = await Promise.all([
        getStadiums(),
        getCountries(),
      ]);
      setStadiums(stadiumsData);
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

  const getCountryName = (countryId) => {
    const c = countries.find((x) => x.country_id === countryId);
    return c ? c.name : `Country #${countryId}`;
  };

  const formatCapacity = (capacity) => {
    if (!capacity) return '—';
    return capacity.toLocaleString();
  };

  const openCreate = () => {
    setEditing(null);
    setForm({
      stadium_id: '',
      name: '',
      city: '',
      country_id: countries[0]?.country_id ?? '',
      capacity: '',
      built_year: '',
      surface_type: '',
      photo_url: '',
    });
    setModalOpen(true);
  };

  const openEdit = (stadium) => {
    setEditing(stadium);
    setForm({
      stadium_id: String(stadium.stadium_id),
      name: stadium.name || '',
      city: stadium.city || '',
      country_id: stadium.country_id ?? '',
      capacity: stadium.capacity ? String(stadium.capacity) : '',
      built_year: stadium.built_year ? String(stadium.built_year) : '',
      surface_type: stadium.surface_type || '',
      photo_url: stadium.photo_url || '',
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
        name: form.name.trim(),
        city: form.city.trim(),
        country_id: parseInt(form.country_id, 10) || null,
        capacity: form.capacity ? parseInt(form.capacity, 10) : null,
        built_year: form.built_year ? parseInt(form.built_year, 10) : null,
        surface_type: form.surface_type.trim() || null,
        photo_url: form.photo_url.trim() || null,
      };

      if (editing) {
        await updateStadium(editing.stadium_id, payload);
      } else {
        const stadiumId = parseInt(form.stadium_id, 10);
        if (!stadiumId || stadiumId < 1) {
          setError('Stadium ID must be a positive number');
          return;
        }
        await createStadium({ stadium_id: stadiumId, ...payload });
      }
      closeModal();
      loadData();
    } catch (err) {
      setError(err.message || 'Operation failed');
    }
  };

  const handleDelete = async (stadium) => {
    if (!window.confirm(`Delete stadium "${stadium.name}"?`)) return;
    try {
      setError(null);
      await deleteStadium(stadium.stadium_id);
      loadData();
    } catch (err) {
      setError(err.message || 'Delete failed');
    }
  };

  const filtered = stadiums.filter(
    (s) =>
      s.name?.toLowerCase().includes(search.toLowerCase()) ||
      s.city?.toLowerCase().includes(search.toLowerCase()) ||
      getCountryName(s.country_id)?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="data-page">
      <div className="data-toolbar">
        <div className="data-search">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search stadiums..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className="data-add-btn" onClick={openCreate}>
          <Plus size={18} />
          Add Stadium
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
                <th>Name</th>
                <th>City</th>
                <th>Country</th>
                <th>Capacity</th>
                <th>Built</th>
                <th>Surface</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((stadium) => (
                <tr key={stadium.stadium_id}>
                  <td>{stadium.stadium_id}</td>
                  <td>
                    {stadium.photo_url ? (
                      <img src={stadium.photo_url} alt="" className="stadium-photo" />
                    ) : (
                      <span className="photo-placeholder">—</span>
                    )}
                  </td>
                  <td className="data-cell-name">{stadium.name}</td>
                  <td>{stadium.city}</td>
                  <td>{getCountryName(stadium.country_id)}</td>
                  <td>{formatCapacity(stadium.capacity)}</td>
                  <td>{stadium.built_year || '—'}</td>
                  <td>{stadium.surface_type || '—'}</td>
                  <td>
                    <div className="action-btns">
                      <button className="edit-btn" onClick={() => openEdit(stadium)}>
                        <Pencil size={14} /> Edit
                      </button>
                      <button className="delete-btn" onClick={() => handleDelete(stadium)} aria-label="Delete">
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
          <div className="data-empty">No stadiums found</div>
        )}
      </div>

      {modalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal modal-extra-wide" onClick={(e) => e.stopPropagation()}>
            <h2>{editing ? 'Edit Stadium' : 'Add Stadium'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="modal-grid">
                <div className="modal-row">
                  <label>Stadium ID *</label>
                  <input
                    type="number"
                    min="1"
                    value={form.stadium_id}
                    onChange={(e) => setForm({ ...form, stadium_id: e.target.value })}
                    disabled={!!editing}
                    required
                  />
                </div>
                <div className="modal-row">
                  <label>Name *</label>
                  <input
                    type="text"
                    maxLength="150"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>
                <div className="modal-row">
                  <label>City *</label>
                  <input
                    type="text"
                    maxLength="100"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    required
                  />
                </div>
                <div className="modal-row">
                  <label>Country *</label>
                  <select
                    value={form.country_id}
                    onChange={(e) => setForm({ ...form, country_id: e.target.value })}
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
                  <label>Capacity</label>
                  <input
                    type="number"
                    min="0"
                    value={form.capacity}
                    onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                    placeholder="e.g. 75000"
                  />
                </div>
                <div className="modal-row">
                  <label>Built Year</label>
                  <input
                    type="number"
                    min="1800"
                    max="2100"
                    value={form.built_year}
                    onChange={(e) => setForm({ ...form, built_year: e.target.value })}
                    placeholder="e.g. 1910"
                  />
                </div>
                <div className="modal-row">
                  <label>Surface Type</label>
                  <input
                    type="text"
                    maxLength="50"
                    value={form.surface_type}
                    onChange={(e) => setForm({ ...form, surface_type: e.target.value })}
                    placeholder="e.g. Grass, Artificial"
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

export default Stadiums;
