import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { getSeasons, createSeason, updateSeason, deleteSeason } from '../services/seasonService';
import { getLeagues } from '../services/leagueService';
import './Seasons.css';

function Seasons() {
  const [seasons, setSeasons] = useState([]);
  const [leagues, setLeagues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    season_id: '',
    league_id: '',
    name: '',
    start_date: '',
    end_date: '',
    is_current: false,
  });

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [seasonsData, leaguesData] = await Promise.all([
        getSeasons(),
        getLeagues().catch(() => []),
      ]);
      setSeasons(seasonsData);
      setLeagues(leaguesData);
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

  const getLeagueName = (leagueId) => {
    const l = leagues.find((x) => x.league_id === leagueId);
    return l ? l.name : `League #${leagueId}`;
  };

  const openCreate = () => {
    setEditing(null);
    setForm({
      season_id: '',
      league_id: leagues[0]?.league_id ?? '',
      name: '',
      start_date: '',
      end_date: '',
      is_current: false,
    });
    setModalOpen(true);
  };

  const openEdit = (season) => {
    setEditing(season);
    setForm({
      season_id: String(season.season_id),
      league_id: season.league_id ?? '',
      name: season.name || '',
      start_date: formatDateForInput(season.start_date),
      end_date: formatDateForInput(season.end_date),
      is_current: season.is_current || false,
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
        league_id: parseInt(form.league_id, 10) || null,
        name: form.name.trim(),
        start_date: form.start_date || null,
        end_date: form.end_date || null,
        is_current: form.is_current,
      };

      if (editing) {
        await updateSeason(editing.season_id, payload);
      } else {
        const seasonId = parseInt(form.season_id, 10);
        if (!seasonId || seasonId < 1) {
          setError('Season ID must be a positive number');
          return;
        }
        await createSeason({ season_id: seasonId, ...payload });
      }
      closeModal();
      loadData();
    } catch (err) {
      setError(err.message || 'Operation failed');
    }
  };

  const handleDelete = async (season) => {
    if (!window.confirm(`Delete season "${season.name}"?`)) return;
    try {
      setError(null);
      await deleteSeason(season.season_id);
      loadData();
    } catch (err) {
      setError(err.message || 'Delete failed');
    }
  };

  const filtered = seasons.filter(
    (s) =>
      s.name?.toLowerCase().includes(search.toLowerCase()) ||
      getLeagueName(s.league_id)?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="data-page">
      <div className="data-toolbar">
        <div className="data-search">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search seasons..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className="data-add-btn" onClick={openCreate}>
          <Plus size={18} />
          Add Season
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
                <th>Name</th>
                <th>League</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Current</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((season) => (
                <tr key={season.season_id}>
                  <td>{season.season_id}</td>
                  <td className="data-cell-name">{season.name}</td>
                  <td>{getLeagueName(season.league_id)}</td>
                  <td>{formatDate(season.start_date)}</td>
                  <td>{formatDate(season.end_date)}</td>
                  <td>
                    <span className={`badge ${season.is_current ? 'badge-success' : 'badge-gray'}`}>
                      {season.is_current ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td>
                    <div className="action-btns">
                      <button className="edit-btn" onClick={() => openEdit(season)}>
                        <Pencil size={14} /> Edit
                      </button>
                      <button className="delete-btn" onClick={() => handleDelete(season)} aria-label="Delete">
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
          <div className="data-empty">No seasons found</div>
        )}
      </div>

      {modalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal modal-wide" onClick={(e) => e.stopPropagation()}>
            <h2>{editing ? 'Edit Season' : 'Add Season'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="modal-grid">
                <div className="modal-row">
                  <label>Season ID *</label>
                  <input
                    type="number"
                    min="1"
                    value={form.season_id}
                    onChange={(e) => setForm({ ...form, season_id: e.target.value })}
                    disabled={!!editing}
                    required
                  />
                </div>
                <div className="modal-row">
                  <label>League *</label>
                  {leagues.length > 0 ? (
                    <select
                      value={form.league_id}
                      onChange={(e) => setForm({ ...form, league_id: e.target.value })}
                      required
                    >
                      <option value="">Select league</option>
                      {leagues.map((l) => (
                        <option key={l.league_id} value={l.league_id}>
                          {l.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="number"
                      min="1"
                      value={form.league_id}
                      onChange={(e) => setForm({ ...form, league_id: e.target.value })}
                      placeholder="League ID"
                      required
                    />
                  )}
                </div>
                <div className="modal-row">
                  <label>Name *</label>
                  <input
                    type="text"
                    maxLength="20"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. 2023/24"
                    required
                  />
                </div>
                <div className="modal-row">
                  <label>Start Date *</label>
                  <input
                    type="date"
                    value={form.start_date}
                    onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                    required
                  />
                </div>
                <div className="modal-row">
                  <label>End Date *</label>
                  <input
                    type="date"
                    value={form.end_date}
                    onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                    required
                  />
                </div>
                <div className="modal-row modal-row-check">
                  <label>
                    <input
                      type="checkbox"
                      checked={form.is_current}
                      onChange={(e) => setForm({ ...form, is_current: e.target.checked })}
                    />
                    {' '}Current Season
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

export default Seasons;
