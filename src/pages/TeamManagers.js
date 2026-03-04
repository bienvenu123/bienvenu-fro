import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { getTeamManagers, createTeamManager, updateTeamManager, deleteTeamManager } from '../services/teamManagerService';
import { getTeams } from '../services/teamService';
import { getManagers } from '../services/managerService';
import './TeamManagers.css';

function TeamManagers() {
  const [teamManagers, setTeamManagers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    team_manager_id: '',
    team_id: '',
    manager_id: '',
    start_date: '',
    end_date: '',
    contract_type: 'permanent',
  });

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [teamManagersData, teamsData, managersData] = await Promise.all([
        getTeamManagers(),
        getTeams().catch(() => []),
        getManagers().catch(() => []),
      ]);
      setTeamManagers(teamManagersData);
      setTeams(teamsData);
      setManagers(managersData);
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

  const getTeamName = (teamId) => {
    const t = teams.find((x) => x.team_id === teamId);
    return t ? t.name : `Team #${teamId}`;
  };

  const getManagerName = (managerId) => {
    const m = managers.find((x) => x.manager_id === managerId);
    if (!m) return `Manager #${managerId}`;
    return `${m.first_name || ''} ${m.last_name || ''}`.trim() || `Manager #${managerId}`;
  };

  const getContractTypeBadgeClass = (contractType) => {
    switch (contractType) {
      case 'permanent':
        return 'badge-success';
      case 'interim':
        return 'badge-warning';
      case 'caretaker':
        return 'badge-info';
      default:
        return 'badge-gray';
    }
  };

  const formatContractType = (contractType) => {
    return contractType
      .charAt(0)
      .toUpperCase() + contractType.slice(1);
  };

  const openCreate = () => {
    setEditing(null);
    setForm({
      team_manager_id: '',
      team_id: teams[0]?.team_id ?? '',
      manager_id: managers[0]?.manager_id ?? '',
      start_date: '',
      end_date: '',
      contract_type: 'permanent',
    });
    setModalOpen(true);
  };

  const openEdit = (tm) => {
    setEditing(tm);
    setForm({
      team_manager_id: String(tm.team_manager_id),
      team_id: tm.team_id ?? '',
      manager_id: tm.manager_id ?? '',
      start_date: formatDateForInput(tm.start_date),
      end_date: formatDateForInput(tm.end_date),
      contract_type: tm.contract_type || 'permanent',
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
        team_id: parseInt(form.team_id, 10) || null,
        manager_id: parseInt(form.manager_id, 10) || null,
        start_date: form.start_date || null,
        end_date: form.end_date || null,
        contract_type: form.contract_type,
      };

      if (editing) {
        await updateTeamManager(editing.team_manager_id, payload);
      } else {
        const teamManagerId = parseInt(form.team_manager_id, 10);
        if (!teamManagerId || teamManagerId < 1) {
          setError('Team Manager ID must be a positive number');
          return;
        }
        await createTeamManager({ team_manager_id: teamManagerId, ...payload });
      }
      closeModal();
      loadData();
    } catch (err) {
      setError(err.message || 'Operation failed');
    }
  };

  const handleDelete = async (tm) => {
    if (!window.confirm(`Delete team manager relationship for ${getManagerName(tm.manager_id)} at ${getTeamName(tm.team_id)}?`)) return;
    try {
      setError(null);
      await deleteTeamManager(tm.team_manager_id);
      loadData();
    } catch (err) {
      setError(err.message || 'Delete failed');
    }
  };

  const filtered = teamManagers.filter(
    (tm) =>
      getTeamName(tm.team_id)?.toLowerCase().includes(search.toLowerCase()) ||
      getManagerName(tm.manager_id)?.toLowerCase().includes(search.toLowerCase()) ||
      tm.contract_type?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="data-page">
      <div className="data-toolbar">
        <div className="data-search">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search team managers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className="data-add-btn" onClick={openCreate}>
          <Plus size={18} />
          Add Team Manager
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
                <th>Team</th>
                <th>Manager</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Contract Type</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((tm) => (
                <tr key={tm.team_manager_id}>
                  <td>{tm.team_manager_id}</td>
                  <td className="data-cell-name">{getTeamName(tm.team_id)}</td>
                  <td className="data-cell-name">{getManagerName(tm.manager_id)}</td>
                  <td>{formatDate(tm.start_date)}</td>
                  <td>{formatDate(tm.end_date)}</td>
                  <td>
                    <span className={`badge ${getContractTypeBadgeClass(tm.contract_type)}`}>
                      {formatContractType(tm.contract_type)}
                    </span>
                  </td>
                  <td>
                    <div className="action-btns">
                      <button className="edit-btn" onClick={() => openEdit(tm)}>
                        <Pencil size={14} /> Edit
                      </button>
                      <button className="delete-btn" onClick={() => handleDelete(tm)} aria-label="Delete">
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
          <div className="data-empty">No team managers found</div>
        )}
      </div>

      {modalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal modal-wide" onClick={(e) => e.stopPropagation()}>
            <h2>{editing ? 'Edit Team Manager' : 'Add Team Manager'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="modal-grid">
                <div className="modal-row">
                  <label>Team Manager ID *</label>
                  <input
                    type="number"
                    min="1"
                    value={form.team_manager_id}
                    onChange={(e) => setForm({ ...form, team_manager_id: e.target.value })}
                    disabled={!!editing}
                    required
                  />
                </div>
                <div className="modal-row">
                  <label>Team *</label>
                  {teams.length > 0 ? (
                    <select
                      value={form.team_id}
                      onChange={(e) => setForm({ ...form, team_id: e.target.value })}
                      required
                    >
                      <option value="">Select team</option>
                      {teams.map((t) => (
                        <option key={t.team_id} value={t.team_id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="number"
                      min="1"
                      value={form.team_id}
                      onChange={(e) => setForm({ ...form, team_id: e.target.value })}
                      placeholder="Team ID"
                      required
                    />
                  )}
                </div>
                <div className="modal-row">
                  <label>Manager *</label>
                  {managers.length > 0 ? (
                    <select
                      value={form.manager_id}
                      onChange={(e) => setForm({ ...form, manager_id: e.target.value })}
                      required
                    >
                      <option value="">Select manager</option>
                      {managers.map((m) => {
                        const fullName = `${m.first_name || ''} ${m.last_name || ''}`.trim() || `Manager #${m.manager_id}`;
                        return (
                          <option key={m.manager_id} value={m.manager_id}>
                            {fullName}
                          </option>
                        );
                      })}
                    </select>
                  ) : (
                    <input
                      type="number"
                      min="1"
                      value={form.manager_id}
                      onChange={(e) => setForm({ ...form, manager_id: e.target.value })}
                      placeholder="Manager ID"
                      required
                    />
                  )}
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
                  <label>End Date</label>
                  <input
                    type="date"
                    value={form.end_date}
                    onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                  />
                </div>
                <div className="modal-row">
                  <label>Contract Type *</label>
                  <select
                    value={form.contract_type}
                    onChange={(e) => setForm({ ...form, contract_type: e.target.value })}
                    required
                  >
                    <option value="permanent">Permanent</option>
                    <option value="interim">Interim</option>
                    <option value="caretaker">Caretaker</option>
                  </select>
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

export default TeamManagers;
