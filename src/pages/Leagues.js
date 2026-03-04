import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { getLeagues, createLeague, updateLeague, deleteLeague } from '../services/leagueService';
import { getCountries } from '../services/countryService';
import './Leagues.css';

function Leagues() {
  const [leagues, setLeagues] = useState([]);
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    league_id: '',
    name: '',
    country_id: '',
    level: '',
    type: 'domestic',
    logo_url: '',
    founded_year: '',
    is_active: true,
  });

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [leaguesData, countriesData] = await Promise.all([
        getLeagues(),
        getCountries(),
      ]);
      setLeagues(leaguesData);
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

  const getTypeBadgeClass = (type) => {
    switch (type) {
      case 'domestic':
        return 'badge-info';
      case 'international':
        return 'badge-warning';
      case 'cup':
        return 'badge-success';
      default:
        return 'badge-gray';
    }
  };

  const openCreate = () => {
    setEditing(null);
    setForm({
      league_id: '',
      name: '',
      country_id: countries[0]?.country_id ?? '',
      level: '',
      type: 'domestic',
      logo_url: '',
      founded_year: '',
      is_active: true,
    });
    setModalOpen(true);
  };

  const openEdit = (league) => {
    setEditing(league);
    setForm({
      league_id: String(league.league_id),
      name: league.name || '',
      country_id: league.country_id ?? '',
      level: league.level ?? '',
      type: league.type || 'domestic',
      logo_url: league.logo_url || '',
      founded_year: league.founded_year ?? '',
      is_active: league.is_active !== false,
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
        country_id: parseInt(form.country_id, 10) || null,
        level: form.level ? parseInt(form.level, 10) : null,
        type: form.type,
        logo_url: form.logo_url.trim() || null,
        founded_year: form.founded_year ? parseInt(form.founded_year, 10) : null,
        is_active: form.is_active,
      };

      if (editing) {
        await updateLeague(editing.league_id, payload);
      } else {
        const leagueId = parseInt(form.league_id, 10);
        if (!leagueId || leagueId < 1) {
          setError('League ID must be a positive number');
          return;
        }
        await createLeague({ league_id: leagueId, ...payload });
      }
      closeModal();
      loadData();
    } catch (err) {
      setError(err.message || 'Operation failed');
    }
  };

  const handleDelete = async (league) => {
    if (!window.confirm(`Delete ${league.name}?`)) return;
    try {
      setError(null);
      await deleteLeague(league.league_id);
      loadData();
    } catch (err) {
      setError(err.message || 'Delete failed');
    }
  };

  const filtered = leagues.filter(
    (l) =>
      l.name?.toLowerCase().includes(search.toLowerCase()) ||
      getCountryName(l.country_id)?.toLowerCase().includes(search.toLowerCase()) ||
      l.type?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="data-page">
      <div className="data-toolbar">
        <div className="data-search">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search leagues..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className="data-add-btn" onClick={openCreate}>
          <Plus size={18} />
          Add League
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
                <th>Logo</th>
                <th>Name</th>
                <th>Country</th>
                <th>Type</th>
                <th>Level</th>
                <th>Founded</th>
                <th>Active</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((league) => (
                <tr key={league.league_id}>
                  <td>{league.league_id}</td>
                  <td>
                    {league.logo_url ? (
                      <img src={league.logo_url} alt="" className="league-logo" />
                    ) : (
                      <span className="logo-placeholder">—</span>
                    )}
                  </td>
                  <td className="data-cell-name">{league.name}</td>
                  <td>{getCountryName(league.country_id)}</td>
                  <td>
                    <span className={`badge ${getTypeBadgeClass(league.type)}`}>
                      {league.type}
                    </span>
                  </td>
                  <td>{league.level ?? '—'}</td>
                  <td>{league.founded_year || '—'}</td>
                  <td>
                    <span className={`badge ${league.is_active ? 'badge-success' : 'badge-gray'}`}>
                      {league.is_active ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td>
                    <div className="action-btns">
                      <button className="edit-btn" onClick={() => openEdit(league)}>
                        <Pencil size={14} /> Edit
                      </button>
                      <button className="delete-btn" onClick={() => handleDelete(league)} aria-label="Delete">
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
          <div className="data-empty">No leagues found</div>
        )}
      </div>

      {modalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal modal-wide" onClick={(e) => e.stopPropagation()}>
            <h2>{editing ? 'Edit League' : 'Add League'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="modal-grid">
                <div className="modal-row">
                  <label>League ID *</label>
                  <input
                    type="number"
                    min="1"
                    value={form.league_id}
                    onChange={(e) => setForm({ ...form, league_id: e.target.value })}
                    disabled={!!editing}
                    required
                  />
                </div>
                <div className="modal-row">
                  <label>Name *</label>
                  <input
                    type="text"
                    maxLength="100"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
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
                  <label>Type *</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    required
                  >
                    <option value="domestic">Domestic</option>
                    <option value="international">International</option>
                    <option value="cup">Cup</option>
                  </select>
                </div>
                <div className="modal-row">
                  <label>Level</label>
                  <input
                    type="number"
                    min="0"
                    value={form.level}
                    onChange={(e) => setForm({ ...form, level: e.target.value })}
                    placeholder="e.g. 1"
                  />
                </div>
                <div className="modal-row">
                  <label>Founded Year</label>
                  <input
                    type="number"
                    min="1800"
                    max="2100"
                    placeholder="e.g. 1888"
                    value={form.founded_year}
                    onChange={(e) => setForm({ ...form, founded_year: e.target.value })}
                  />
                </div>
                <div className="modal-row">
                  <label>Logo URL</label>
                  <input
                    type="url"
                    maxLength="255"
                    placeholder="https://..."
                    value={form.logo_url}
                    onChange={(e) => setForm({ ...form, logo_url: e.target.value })}
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

export default Leagues;
