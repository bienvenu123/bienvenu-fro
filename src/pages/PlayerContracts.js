import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { getPlayerContracts, createPlayerContract, updatePlayerContract, deletePlayerContract } from '../services/playerContractService';
import { getPlayers } from '../services/playerService';
import { getTeams } from '../services/teamService';
import './PlayerContracts.css';

function PlayerContracts() {
  const [contracts, setContracts] = useState([]);
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    contract_id: '',
    player_id: '',
    team_id: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    shirt_number: '',
    is_on_loan: false,
    parent_team_id: '',
    weekly_salary: '',
    contract_type: 'permanent',
  });

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [contractsData, playersData, teamsData] = await Promise.all([
        getPlayerContracts(),
        getPlayers().catch(() => []),
        getTeams().catch(() => []),
      ]);
      setContracts(contractsData);
      setPlayers(playersData);
      setTeams(teamsData);
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
        currency: 'USD',
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

  const getTeamName = (teamId) => {
    const t = teams.find((x) => x.team_id === teamId);
    return t ? t.name : `Team #${teamId}`;
  };

  const getContractTypeBadgeClass = (contractType) => {
    switch (contractType) {
      case 'permanent':
        return 'badge-success';
      case 'loan':
        return 'badge-warning';
      case 'trial':
        return 'badge-info';
      default:
        return 'badge-gray';
    }
  };

  const openCreate = () => {
    setEditing(null);
    setForm({
      contract_id: '',
      player_id: players[0]?.player_id ?? '',
      team_id: teams[0]?.team_id ?? '',
      start_date: new Date().toISOString().split('T')[0],
      end_date: '',
      shirt_number: '',
      is_on_loan: false,
      parent_team_id: '',
      weekly_salary: '',
      contract_type: 'permanent',
    });
    setModalOpen(true);
  };

  const openEdit = (contract) => {
    setEditing(contract);
    setForm({
      contract_id: String(contract.contract_id),
      player_id: contract.player_id ?? '',
      team_id: contract.team_id ?? '',
      start_date: formatDateForInput(contract.start_date),
      end_date: formatDateForInput(contract.end_date),
      shirt_number: contract.shirt_number ?? '',
      is_on_loan: contract.is_on_loan || false,
      parent_team_id: contract.parent_team_id ?? '',
      weekly_salary: contract.weekly_salary ? String(contract.weekly_salary) : '',
      contract_type: contract.contract_type || 'permanent',
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
        team_id: parseInt(form.team_id, 10) || null,
        start_date: form.start_date || null,
        end_date: form.end_date || null,
        shirt_number: form.shirt_number ? parseInt(form.shirt_number, 10) : null,
        is_on_loan: form.is_on_loan,
        parent_team_id: form.parent_team_id ? parseInt(form.parent_team_id, 10) : null,
        weekly_salary: form.weekly_salary ? parseFloat(form.weekly_salary) : null,
        contract_type: form.contract_type,
      };

      if (editing) {
        await updatePlayerContract(editing.contract_id, payload);
      } else {
        const contractId = parseInt(form.contract_id, 10);
        if (!contractId || contractId < 1) {
          setError('Contract ID must be a positive number');
          return;
        }
        await createPlayerContract({ contract_id: contractId, ...payload });
      }
      closeModal();
      loadData();
    } catch (err) {
      setError(err.message || 'Operation failed');
    }
  };

  const handleDelete = async (contract) => {
    if (!window.confirm(`Delete contract #${contract.contract_id}?`)) return;
    try {
      setError(null);
      await deletePlayerContract(contract.contract_id);
      loadData();
    } catch (err) {
      setError(err.message || 'Delete failed');
    }
  };

  const filtered = contracts.filter(
    (c) =>
      getPlayerName(c.player_id)?.toLowerCase().includes(search.toLowerCase()) ||
      getTeamName(c.team_id)?.toLowerCase().includes(search.toLowerCase()) ||
      c.contract_type?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="data-page">
      <div className="data-toolbar">
        <div className="data-search">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search player contracts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className="data-add-btn" onClick={openCreate}>
          <Plus size={18} />
          Add Player Contract
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
                <th>Team</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Type</th>
                <th>On Loan</th>
                <th>Parent Team</th>
                <th>Shirt #</th>
                <th>Weekly Salary</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((contract) => (
                <tr key={contract.contract_id}>
                  <td>{contract.contract_id}</td>
                  <td className="data-cell-name">{getPlayerName(contract.player_id)}</td>
                  <td className="data-cell-name">{getTeamName(contract.team_id)}</td>
                  <td>{formatDate(contract.start_date)}</td>
                  <td>{formatDate(contract.end_date)}</td>
                  <td>
                    <span className={`badge ${getContractTypeBadgeClass(contract.contract_type)}`}>
                      {contract.contract_type}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${contract.is_on_loan ? 'badge-warning' : 'badge-gray'}`}>
                      {contract.is_on_loan ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td>{contract.parent_team_id ? getTeamName(contract.parent_team_id) : '—'}</td>
                  <td>{contract.shirt_number ?? '—'}</td>
                  <td>{formatCurrency(contract.weekly_salary)}</td>
                  <td>
                    <div className="action-btns">
                      <button className="edit-btn" onClick={() => openEdit(contract)}>
                        <Pencil size={14} /> Edit
                      </button>
                      <button className="delete-btn" onClick={() => handleDelete(contract)} aria-label="Delete">
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
          <div className="data-empty">No player contracts found</div>
        )}
      </div>

      {modalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal modal-wide" onClick={(e) => e.stopPropagation()}>
            <h2>{editing ? 'Edit Player Contract' : 'Add Player Contract'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="modal-grid">
                <div className="modal-row">
                  <label>Contract ID *</label>
                  <input
                    type="number"
                    min="1"
                    value={form.contract_id}
                    onChange={(e) => setForm({ ...form, contract_id: e.target.value })}
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
                  <label>Contract Type *</label>
                  <select
                    value={form.contract_type}
                    onChange={(e) => setForm({ ...form, contract_type: e.target.value })}
                    required
                  >
                    <option value="permanent">Permanent</option>
                    <option value="loan">Loan</option>
                    <option value="trial">Trial</option>
                  </select>
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
                  <label>Weekly Salary</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.weekly_salary}
                    onChange={(e) => setForm({ ...form, weekly_salary: e.target.value })}
                    placeholder="e.g. 50000"
                  />
                </div>
                <div className="modal-row">
                  <label>Parent Team (for loans)</label>
                  {teams.length > 0 ? (
                    <select
                      value={form.parent_team_id}
                      onChange={(e) => setForm({ ...form, parent_team_id: e.target.value })}
                    >
                      <option value="">None</option>
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
                      value={form.parent_team_id}
                      onChange={(e) => setForm({ ...form, parent_team_id: e.target.value })}
                      placeholder="Parent Team ID (optional)"
                    />
                  )}
                </div>
                <div className="modal-row modal-row-check">
                  <label>
                    <input
                      type="checkbox"
                      checked={form.is_on_loan}
                      onChange={(e) => setForm({ ...form, is_on_loan: e.target.checked })}
                    />
                    {' '}On Loan
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

export default PlayerContracts;
