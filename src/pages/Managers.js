import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { getManagers, createManager, updateManager, deleteManager } from '../services/managerService';
import { getCountries } from '../services/countryService';
import './Managers.css';

function Managers() {
  const [managers, setManagers] = useState([]);
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    manager_id: '',
    first_name: '',
    last_name: '',
    date_of_birth: '',
    nationality_id: '',
    photo_url: '',
    is_active: true,
  });

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [managersData, countriesData] = await Promise.all([
        getManagers(),
        getCountries(),
      ]);
      setManagers(managersData);
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
    const c = countries.find((x) => x.country_id === countryId);
    return c ? c.name : `Country #${countryId}`;
  };

  const getFullName = (manager) => {
    return `${manager.first_name || ''} ${manager.last_name || ''}`.trim() || `Manager #${manager.manager_id}`;
  };

  const openCreate = () => {
    setEditing(null);
    setForm({
      manager_id: '',
      first_name: '',
      last_name: '',
      date_of_birth: '',
      nationality_id: countries[0]?.country_id ?? '',
      photo_url: '',
      is_active: true,
    });
    setModalOpen(true);
  };

  const openEdit = (manager) => {
    setEditing(manager);
    setForm({
      manager_id: String(manager.manager_id),
      first_name: manager.first_name || '',
      last_name: manager.last_name || '',
      date_of_birth: formatDateForInput(manager.date_of_birth),
      nationality_id: manager.nationality_id ?? '',
      photo_url: manager.photo_url || '',
      is_active: manager.is_active !== false,
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
        photo_url: form.photo_url.trim() || null,
        is_active: form.is_active,
      };

      if (editing) {
        await updateManager(editing.manager_id, payload);
      } else {
        const managerId = parseInt(form.manager_id, 10);
        if (!managerId || managerId < 1) {
          setError('Manager ID must be a positive number');
          return;
        }
        await createManager({ manager_id: managerId, ...payload });
      }
      closeModal();
      loadData();
    } catch (err) {
      setError(err.message || 'Operation failed');
    }
  };

  const handleDelete = async (manager) => {
    const fullName = getFullName(manager);
    if (!window.confirm(`Delete ${fullName}?`)) return;
    try {
      setError(null);
      await deleteManager(manager.manager_id);
      loadData();
    } catch (err) {
      setError(err.message || 'Delete failed');
    }
  };

  const filtered = managers.filter(
    (m) =>
      m.first_name?.toLowerCase().includes(search.toLowerCase()) ||
      m.last_name?.toLowerCase().includes(search.toLowerCase()) ||
      getCountryName(m.nationality_id)?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="data-page">
      <div className="data-toolbar">
        <div className="data-search">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search managers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className="data-add-btn" onClick={openCreate}>
          <Plus size={18} />
          Add Manager
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
                <th>Active</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((manager) => (
                <tr key={manager.manager_id}>
                  <td>{manager.manager_id}</td>
                  <td>
                    {manager.photo_url ? (
                      <img src={manager.photo_url} alt="" className="manager-photo" />
                    ) : (
                      <span className="photo-placeholder">—</span>
                    )}
                  </td>
                  <td className="data-cell-name">{manager.first_name}</td>
                  <td className="data-cell-name">{manager.last_name}</td>
                  <td>{formatDate(manager.date_of_birth)}</td>
                  <td>{getCountryName(manager.nationality_id)}</td>
                  <td>
                    <span className={`badge ${manager.is_active ? 'badge-success' : 'badge-gray'}`}>
                      {manager.is_active ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td>
                    <div className="action-btns">
                      <button className="edit-btn" onClick={() => openEdit(manager)}>
                        <Pencil size={14} /> Edit
                      </button>
                      <button className="delete-btn" onClick={() => handleDelete(manager)} aria-label="Delete">
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
          <div className="data-empty">No managers found</div>
        )}
      </div>

      {modalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal modal-wide" onClick={(e) => e.stopPropagation()}>
            <h2>{editing ? 'Edit Manager' : 'Add Manager'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="modal-grid">
                <div className="modal-row">
                  <label>Manager ID *</label>
                  <input
                    type="number"
                    min="1"
                    value={form.manager_id}
                    onChange={(e) => setForm({ ...form, manager_id: e.target.value })}
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

export default Managers;
