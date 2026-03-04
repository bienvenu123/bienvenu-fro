import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { getReferees, createReferee, updateReferee, deleteReferee } from '../services/refereeService';
import { getCountries } from '../services/countryService';
import './Referees.css';

function Referees() {
  const [referees, setReferees] = useState([]);
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    referee_id: '',
    first_name: '',
    last_name: '',
    date_of_birth: '',
    country_id: '',
    is_active: true,
  });

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [refereesData, countriesData] = await Promise.all([
        getReferees(),
        getCountries(),
      ]);
      setReferees(refereesData);
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

  const getFullName = (ref) => {
    return `${ref.first_name || ''} ${ref.last_name || ''}`.trim() || `Referee #${ref.referee_id}`;
  };

  const openCreate = () => {
    setEditing(null);
    setForm({
      referee_id: '',
      first_name: '',
      last_name: '',
      date_of_birth: '',
      country_id: countries[0]?.country_id ?? '',
      is_active: true,
    });
    setModalOpen(true);
  };

  const openEdit = (ref) => {
    setEditing(ref);
    setForm({
      referee_id: String(ref.referee_id),
      first_name: ref.first_name || '',
      last_name: ref.last_name || '',
      date_of_birth: formatDateForInput(ref.date_of_birth),
      country_id: ref.country_id ?? '',
      is_active: ref.is_active !== false,
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
        country_id: parseInt(form.country_id, 10) || null,
        is_active: form.is_active,
      };

      if (editing) {
        await updateReferee(editing.referee_id, payload);
      } else {
        const refereeId = parseInt(form.referee_id, 10);
        if (!refereeId || refereeId < 1) {
          setError('Referee ID must be a positive number');
          return;
        }
        await createReferee({ referee_id: refereeId, ...payload });
      }
      closeModal();
      loadData();
    } catch (err) {
      setError(err.message || 'Operation failed');
    }
  };

  const handleDelete = async (ref) => {
    const fullName = getFullName(ref);
    if (!window.confirm(`Delete ${fullName}?`)) return;
    try {
      setError(null);
      await deleteReferee(ref.referee_id);
      loadData();
    } catch (err) {
      setError(err.message || 'Delete failed');
    }
  };

  const filtered = referees.filter(
    (r) =>
      r.first_name?.toLowerCase().includes(search.toLowerCase()) ||
      r.last_name?.toLowerCase().includes(search.toLowerCase()) ||
      getCountryName(r.country_id)?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="data-page">
      <div className="data-toolbar">
        <div className="data-search">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search referees..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className="data-add-btn" onClick={openCreate}>
          <Plus size={18} />
          Add Referee
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
                <th>First Name</th>
                <th>Last Name</th>
                <th>Date of Birth</th>
                <th>Country</th>
                <th>Active</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((ref) => (
                <tr key={ref.referee_id}>
                  <td>{ref.referee_id}</td>
                  <td className="data-cell-name">{ref.first_name}</td>
                  <td className="data-cell-name">{ref.last_name}</td>
                  <td>{formatDate(ref.date_of_birth)}</td>
                  <td>{getCountryName(ref.country_id)}</td>
                  <td>
                    <span className={`badge ${ref.is_active ? 'badge-success' : 'badge-gray'}`}>
                      {ref.is_active ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td>
                    <div className="action-btns">
                      <button className="edit-btn" onClick={() => openEdit(ref)}>
                        <Pencil size={14} /> Edit
                      </button>
                      <button className="delete-btn" onClick={() => handleDelete(ref)} aria-label="Delete">
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
          <div className="data-empty">No referees found</div>
        )}
      </div>

      {modalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal modal-wide" onClick={(e) => e.stopPropagation()}>
            <h2>{editing ? 'Edit Referee' : 'Add Referee'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="modal-grid">
                <div className="modal-row">
                  <label>Referee ID *</label>
                  <input
                    type="number"
                    min="1"
                    value={form.referee_id}
                    onChange={(e) => setForm({ ...form, referee_id: e.target.value })}
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

export default Referees;
