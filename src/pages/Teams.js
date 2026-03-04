import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Search, FileBarChart } from 'lucide-react';
import { getTeams, createTeam, updateTeam, deleteTeam } from '../services/teamService';
import { getCountries } from '../services/countryService';
import ReportModal from '../components/ReportModal/ReportModal';
import './Teams.css';

function Teams() {
  const [teams, setTeams] = useState([]);
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    team_id: '',
    name: '',
    short_name: '',
    country_id: '',
    founded_year: '',
    stadium_name: '',
    stadium_capacity: '',
    logo_url: '',
    primary_color: '',
    secondary_color: '',
    city: '',
    is_active: true,
  });

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [teamsData, countriesData] = await Promise.all([getTeams(), getCountries()]);
      setTeams(teamsData);
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
    return c ? c.name : String(countryId);
  };

  const openCreate = () => {
    setEditing(null);
    setForm({
      team_id: '',
      name: '',
      short_name: '',
      country_id: countries[0]?.country_id ?? '',
      founded_year: '',
      stadium_name: '',
      stadium_capacity: '',
      logo_url: '',
      primary_color: '',
      secondary_color: '',
      city: '',
      is_active: true,
    });
    setModalOpen(true);
  };

  const openEdit = (team) => {
    setEditing(team);
    setForm({
      team_id: String(team.team_id),
      name: team.name || '',
      short_name: team.short_name || '',
      country_id: team.country_id ?? '',
      founded_year: team.founded_year ?? '',
      stadium_name: team.stadium_name || '',
      stadium_capacity: team.stadium_capacity ?? '',
      logo_url: team.logo_url || '',
      primary_color: team.primary_color || '',
      secondary_color: team.secondary_color || '',
      city: team.city || '',
      is_active: team.is_active !== false,
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
        short_name: form.short_name.trim() || null,
        country_id: parseInt(form.country_id, 10) || null,
        founded_year: form.founded_year ? parseInt(form.founded_year, 10) : null,
        stadium_name: form.stadium_name.trim() || null,
        stadium_capacity: form.stadium_capacity ? parseInt(form.stadium_capacity, 10) : null,
        logo_url: form.logo_url.trim() || null,
        primary_color: form.primary_color.trim() || null,
        secondary_color: form.secondary_color.trim() || null,
        city: form.city.trim() || null,
        is_active: form.is_active,
      };

      if (editing) {
        await updateTeam(editing.team_id, payload);
      } else {
        const teamId = parseInt(form.team_id, 10);
        if (!teamId || teamId < 1) {
          setError('Team ID must be a positive number');
          return;
        }
        await createTeam({ team_id: teamId, ...payload });
      }
      closeModal();
      loadData();
    } catch (err) {
      setError(err.message || 'Operation failed');
    }
  };

  const handleDelete = async (team) => {
    if (!window.confirm(`Delete ${team.name}?`)) return;
    try {
      setError(null);
      await deleteTeam(team.team_id);
      loadData();
    } catch (err) {
      setError(err.message || 'Delete failed');
    }
  };

  const filtered = teams.filter(
    (t) =>
      t.name?.toLowerCase().includes(search.toLowerCase()) ||
      t.short_name?.toLowerCase().includes(search.toLowerCase()) ||
      t.city?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="data-page">
      <div className="data-toolbar">
        <div className="data-search">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search teams..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="data-toolbar-actions">
          <button className="data-report-btn" onClick={() => setReportModalOpen(true)}>
            <FileBarChart size={18} />
            Generate Report
          </button>
          <button className="data-add-btn" onClick={openCreate}>
            <Plus size={18} />
            Add Team
          </button>
        </div>
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
                <th>Short</th>
                <th>Country</th>
                <th>Founded</th>
                <th>Stadium</th>
                <th>City</th>
                <th>Active</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((team) => (
                <tr key={team.team_id}>
                  <td>{team.team_id}</td>
                  <td>
                    {team.logo_url ? (
                      <img src={team.logo_url} alt="" className="team-logo" />
                    ) : (
                      <span className="flag-placeholder">—</span>
                    )}
                  </td>
                  <td className="data-cell-name">{team.name}</td>
                  <td>{team.short_name || '—'}</td>
                  <td>{getCountryName(team.country_id)}</td>
                  <td>{team.founded_year || '—'}</td>
                  <td>{team.stadium_name || '—'}</td>
                  <td>{team.city || '—'}</td>
                  <td>
                    <span className={`badge ${team.is_active ? 'badge-success' : 'badge-gray'}`}>
                      {team.is_active ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td>
                    <div className="action-btns">
                      <button className="edit-btn" onClick={() => openEdit(team)}>
                        <Pencil size={14} /> Edit
                      </button>
                      <button className="delete-btn" onClick={() => handleDelete(team)} aria-label="Delete">
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
          <div className="data-empty">No teams found</div>
        )}
      </div>

      {modalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal modal-wide" onClick={(e) => e.stopPropagation()}>
            <h2>{editing ? 'Edit Team' : 'Add Team'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="modal-grid">
                <div className="modal-row">
                  <label>Team ID *</label>
                  <input
                    type="number"
                    min="1"
                    value={form.team_id}
                    onChange={(e) => setForm({ ...form, team_id: e.target.value })}
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
                  <label>Short Name</label>
                  <input
                    type="text"
                    maxLength="50"
                    placeholder="e.g. RMA"
                    value={form.short_name}
                    onChange={(e) => setForm({ ...form, short_name: e.target.value })}
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
                  <label>Founded Year</label>
                  <input
                    type="number"
                    min="1800"
                    max="2100"
                    placeholder="e.g. 1902"
                    value={form.founded_year}
                    onChange={(e) => setForm({ ...form, founded_year: e.target.value })}
                  />
                </div>
                <div className="modal-row">
                  <label>City</label>
                  <input
                    type="text"
                    maxLength="100"
                    placeholder="e.g. Madrid"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                  />
                </div>
                <div className="modal-row">
                  <label>Stadium Name</label>
                  <input
                    type="text"
                    maxLength="100"
                    placeholder="e.g. Santiago Bernabéu"
                    value={form.stadium_name}
                    onChange={(e) => setForm({ ...form, stadium_name: e.target.value })}
                  />
                </div>
                <div className="modal-row">
                  <label>Stadium Capacity</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 81044"
                    value={form.stadium_capacity}
                    onChange={(e) => setForm({ ...form, stadium_capacity: e.target.value })}
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
                <div className="modal-row">
                  <label>Primary Color</label>
                  <input
                    type="text"
                    maxLength="7"
                    placeholder="#FFFFFF"
                    value={form.primary_color}
                    onChange={(e) => setForm({ ...form, primary_color: e.target.value })}
                  />
                </div>
                <div className="modal-row">
                  <label>Secondary Color</label>
                  <input
                    type="text"
                    maxLength="7"
                    placeholder="#000000"
                    value={form.secondary_color}
                    onChange={(e) => setForm({ ...form, secondary_color: e.target.value })}
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

      <ReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        entityType="teams"
        entityName="Teams"
        data={teams}
        dateField="created_at"
      />
    </div>
  );
}

export default Teams;
