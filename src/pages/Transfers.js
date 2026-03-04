import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { getTransfers, createTransfer, updateTransfer, deleteTransfer } from '../services/transferService';
import { getPlayers } from '../services/playerService';
import { getTeams } from '../services/teamService';
import { getSeasons } from '../services/seasonService';
import './Transfers.css';

function Transfers() {
  const [transfers, setTransfers] = useState([]);
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    transfer_id: '',
    player_id: '',
    from_team_id: '',
    to_team_id: '',
    transfer_date: '',
    transfer_fee_eur: '',
    transfer_type: 'permanent',
    season_id: '',
    is_loan: false,
    loan_fee_eur: '',
    buy_option_eur: '',
  });

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [transfersData, playersData, teamsData, seasonsData] = await Promise.all([
        getTransfers(),
        getPlayers().catch(() => []),
        getTeams().catch(() => []),
        getSeasons().catch(() => []),
      ]);
      setTransfers(transfersData);
      setPlayers(playersData);
      setTeams(teamsData);
      setSeasons(seasonsData);
    } catch (err) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const formatCurrency = (value) => {
    if (value === null || value === undefined || value === '') return '—';
    try {
      const num = typeof value === 'string' ? parseFloat(value) : value;
      if (isNaN(num)) return '—';
      if (num >= 1000000) {
        return `€${(num / 1000000).toFixed(2)}M`;
      } else if (num >= 1000) {
        return `€${(num / 1000).toFixed(1)}K`;
      }
      return `€${num.toFixed(0)}`;
    } catch {
      return '—';
    }
  };

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

  const getTeamName = (teamId) => {
    const t = teams.find((x) => x.team_id === teamId);
    return t ? t.name : `Team #${teamId}`;
  };

  const getSeasonName = (seasonId) => {
    const s = seasons.find((x) => x.season_id === seasonId);
    return s ? s.name : `Season #${seasonId}`;
  };

  const getTransferTypeBadgeClass = (type) => {
    switch (type) {
      case 'permanent':
        return 'badge-success';
      case 'loan':
        return 'badge-warning';
      case 'free':
        return 'badge-info';
      case 'end_of_contract':
        return 'badge-gray';
      default:
        return 'badge-gray';
    }
  };

  const formatTransferType = (type) => {
    return type
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const openCreate = () => {
    setEditing(null);
    setForm({
      transfer_id: '',
      player_id: players[0]?.player_id ?? '',
      from_team_id: teams[0]?.team_id ?? '',
      to_team_id: teams[0]?.team_id ?? '',
      transfer_date: '',
      transfer_fee_eur: '',
      transfer_type: 'permanent',
      season_id: seasons[0]?.season_id ?? '',
      is_loan: false,
      loan_fee_eur: '',
      buy_option_eur: '',
    });
    setModalOpen(true);
  };

  const openEdit = (transfer) => {
    setEditing(transfer);
    setForm({
      transfer_id: String(transfer.transfer_id),
      player_id: transfer.player_id ?? '',
      from_team_id: transfer.from_team_id ?? '',
      to_team_id: transfer.to_team_id ?? '',
      transfer_date: formatDateForInput(transfer.transfer_date),
      transfer_fee_eur: transfer.transfer_fee_eur ? String(transfer.transfer_fee_eur) : '',
      transfer_type: transfer.transfer_type || 'permanent',
      season_id: transfer.season_id ?? '',
      is_loan: transfer.is_loan || false,
      loan_fee_eur: transfer.loan_fee_eur ? String(transfer.loan_fee_eur) : '',
      buy_option_eur: transfer.buy_option_eur ? String(transfer.buy_option_eur) : '',
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
        from_team_id: parseInt(form.from_team_id, 10) || null,
        to_team_id: parseInt(form.to_team_id, 10) || null,
        transfer_date: form.transfer_date || null,
        transfer_fee_eur: form.transfer_fee_eur ? parseFloat(form.transfer_fee_eur) : null,
        transfer_type: form.transfer_type,
        season_id: parseInt(form.season_id, 10) || null,
        is_loan: form.is_loan || false,
        loan_fee_eur: form.loan_fee_eur ? parseFloat(form.loan_fee_eur) : null,
        buy_option_eur: form.buy_option_eur ? parseFloat(form.buy_option_eur) : null,
      };

      if (editing) {
        await updateTransfer(editing.transfer_id, payload);
      } else {
        const transferId = parseInt(form.transfer_id, 10);
        if (!transferId || transferId < 1) {
          setError('Transfer ID must be a positive number');
          return;
        }
        await createTransfer({ transfer_id: transferId, ...payload });
      }
      closeModal();
      loadData();
    } catch (err) {
      setError(err.message || 'Operation failed');
    }
  };

  const handleDelete = async (transfer) => {
    if (!window.confirm(`Delete transfer of ${getPlayerName(transfer.player_id)} from ${getTeamName(transfer.from_team_id)} to ${getTeamName(transfer.to_team_id)}?`)) return;
    try {
      setError(null);
      await deleteTransfer(transfer.transfer_id);
      loadData();
    } catch (err) {
      setError(err.message || 'Delete failed');
    }
  };

  const filtered = transfers.filter(
    (t) =>
      getPlayerName(t.player_id)?.toLowerCase().includes(search.toLowerCase()) ||
      getTeamName(t.from_team_id)?.toLowerCase().includes(search.toLowerCase()) ||
      getTeamName(t.to_team_id)?.toLowerCase().includes(search.toLowerCase()) ||
      t.transfer_type?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="data-page">
      <div className="data-toolbar">
        <div className="data-search">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search transfers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className="data-add-btn" onClick={openCreate}>
          <Plus size={18} />
          Add Transfer
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
                <th>From</th>
                <th>To</th>
                <th>Date</th>
                <th>Fee</th>
                <th>Type</th>
                <th>Season</th>
                <th>Loan</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((transfer) => (
                <tr key={transfer.transfer_id}>
                  <td>{transfer.transfer_id}</td>
                  <td className="data-cell-name">{getPlayerName(transfer.player_id)}</td>
                  <td className="data-cell-name">{getTeamName(transfer.from_team_id)}</td>
                  <td className="data-cell-name">{getTeamName(transfer.to_team_id)}</td>
                  <td>{formatDate(transfer.transfer_date)}</td>
                  <td>{formatCurrency(transfer.transfer_fee_eur)}</td>
                  <td>
                    <span className={`badge ${getTransferTypeBadgeClass(transfer.transfer_type)}`}>
                      {formatTransferType(transfer.transfer_type)}
                    </span>
                  </td>
                  <td>{getSeasonName(transfer.season_id)}</td>
                  <td>
                    {transfer.is_loan ? (
                      <span className="badge badge-warning">Yes</span>
                    ) : (
                      <span className="badge badge-gray">No</span>
                    )}
                  </td>
                  <td>
                    <div className="action-btns">
                      <button className="edit-btn" onClick={() => openEdit(transfer)}>
                        <Pencil size={14} /> Edit
                      </button>
                      <button className="delete-btn" onClick={() => handleDelete(transfer)} aria-label="Delete">
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
          <div className="data-empty">No transfers found</div>
        )}
      </div>

      {modalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal modal-wide" onClick={(e) => e.stopPropagation()}>
            <h2>{editing ? 'Edit Transfer' : 'Add Transfer'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="modal-grid">
                <div className="modal-row">
                  <label>Transfer ID *</label>
                  <input
                    type="number"
                    min="1"
                    value={form.transfer_id}
                    onChange={(e) => setForm({ ...form, transfer_id: e.target.value })}
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
                  <label>From Team *</label>
                  {teams.length > 0 ? (
                    <select
                      value={form.from_team_id}
                      onChange={(e) => setForm({ ...form, from_team_id: e.target.value })}
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
                      value={form.from_team_id}
                      onChange={(e) => setForm({ ...form, from_team_id: e.target.value })}
                      placeholder="From Team ID"
                      required
                    />
                  )}
                </div>
                <div className="modal-row">
                  <label>To Team *</label>
                  {teams.length > 0 ? (
                    <select
                      value={form.to_team_id}
                      onChange={(e) => setForm({ ...form, to_team_id: e.target.value })}
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
                      value={form.to_team_id}
                      onChange={(e) => setForm({ ...form, to_team_id: e.target.value })}
                      placeholder="To Team ID"
                      required
                    />
                  )}
                </div>
                <div className="modal-row">
                  <label>Transfer Date *</label>
                  <input
                    type="date"
                    value={form.transfer_date}
                    onChange={(e) => setForm({ ...form, transfer_date: e.target.value })}
                    required
                  />
                </div>
                <div className="modal-row">
                  <label>Transfer Fee (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.transfer_fee_eur}
                    onChange={(e) => setForm({ ...form, transfer_fee_eur: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
                <div className="modal-row">
                  <label>Transfer Type *</label>
                  <select
                    value={form.transfer_type}
                    onChange={(e) => setForm({ ...form, transfer_type: e.target.value })}
                    required
                  >
                    <option value="permanent">Permanent</option>
                    <option value="loan">Loan</option>
                    <option value="free">Free</option>
                    <option value="end_of_contract">End of Contract</option>
                  </select>
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
                          {s.name}
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
                  <label>
                    <input
                      type="checkbox"
                      checked={form.is_loan}
                      onChange={(e) => setForm({ ...form, is_loan: e.target.checked })}
                    />
                    {' '}Is Loan
                  </label>
                </div>
                <div className="modal-row">
                  <label>Loan Fee (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.loan_fee_eur}
                    onChange={(e) => setForm({ ...form, loan_fee_eur: e.target.value })}
                    placeholder="0.00"
                    disabled={!form.is_loan}
                  />
                </div>
                <div className="modal-row">
                  <label>Buy Option (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.buy_option_eur}
                    onChange={(e) => setForm({ ...form, buy_option_eur: e.target.value })}
                    placeholder="0.00"
                    disabled={!form.is_loan}
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

export default Transfers;
