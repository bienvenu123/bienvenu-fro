import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { getPlayerPositions, createPlayerPosition, updatePlayerPosition, deletePlayerPosition } from '../services/playerPositionService';
import { getPlayers } from '../services/playerService';
import { getPositions } from '../services/positionService';
import './PlayerPositions.css';

function PlayerPositions() {
  const [playerPositions, setPlayerPositions] = useState([]);
  const [players, setPlayers] = useState([]);
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    player_position_id: '',
    player_id: '',
    position_id: '',
    is_primary: false,
  });

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [playerPositionsData] = await Promise.all([
        getPlayerPositions(),
      ]);
      setPlayerPositions(playerPositionsData);

      // Try to load optional related data
      try {
        const playersData = await getPlayers();
        setPlayers(playersData);
      } catch (err) {
        console.warn('Players endpoint not available:', err);
      }

      try {
        const positionsData = await getPositions();
        setPositions(positionsData);
      } catch (err) {
        console.warn('Positions endpoint not available:', err);
      }
    } catch (err) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getPlayerName = (playerId) => {
    const p = players.find((x) => x.player_id === playerId);
    if (!p) return `Player #${playerId}`;
    return `${p.first_name || ''} ${p.last_name || ''}`.trim() || `Player #${playerId}`;
  };

  const getPositionName = (positionId) => {
    const pos = positions.find((x) => x.position_id === positionId);
    return pos ? (pos.name || `Position #${positionId}`) : `Position #${positionId}`;
  };

  const openCreate = () => {
    setEditing(null);
    setForm({
      player_position_id: '',
      player_id: players[0]?.player_id ?? '',
      position_id: positions[0]?.position_id ?? '',
      is_primary: false,
    });
    setModalOpen(true);
  };

  const openEdit = (playerPosition) => {
    setEditing(playerPosition);
    setForm({
      player_position_id: String(playerPosition.player_position_id),
      player_id: playerPosition.player_id ?? '',
      position_id: playerPosition.position_id ?? '',
      is_primary: playerPosition.is_primary || false,
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
        position_id: parseInt(form.position_id, 10) || null,
        is_primary: form.is_primary,
      };

      if (editing) {
        await updatePlayerPosition(editing.player_position_id, payload);
      } else {
        const playerPositionId = parseInt(form.player_position_id, 10);
        if (!playerPositionId || playerPositionId < 1) {
          setError('Player Position ID must be a positive number');
          return;
        }
        await createPlayerPosition({ player_position_id: playerPositionId, ...payload });
      }
      closeModal();
      loadData();
    } catch (err) {
      setError(err.message || 'Operation failed');
    }
  };

  const handleDelete = async (playerPosition) => {
    if (!window.confirm(`Delete player position #${playerPosition.player_position_id}?`)) return;
    try {
      setError(null);
      await deletePlayerPosition(playerPosition.player_position_id);
      loadData();
    } catch (err) {
      setError(err.message || 'Delete failed');
    }
  };

  const filtered = playerPositions.filter(
    (pp) =>
      getPlayerName(pp.player_id)?.toLowerCase().includes(search.toLowerCase()) ||
      getPositionName(pp.position_id)?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="data-page">
      <div className="data-toolbar">
        <div className="data-search">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search player positions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className="data-add-btn" onClick={openCreate}>
          <Plus size={18} />
          Add Player Position
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
                <th>Position</th>
                <th>Primary</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((playerPosition) => (
                <tr key={playerPosition.player_position_id}>
                  <td>{playerPosition.player_position_id}</td>
                  <td className="data-cell-name">{getPlayerName(playerPosition.player_id)}</td>
                  <td>{getPositionName(playerPosition.position_id)}</td>
                  <td>
                    <span className={`badge ${playerPosition.is_primary ? 'badge-success' : 'badge-gray'}`}>
                      {playerPosition.is_primary ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td>
                    <div className="action-btns">
                      <button className="edit-btn" onClick={() => openEdit(playerPosition)}>
                        <Pencil size={14} /> Edit
                      </button>
                      <button className="delete-btn" onClick={() => handleDelete(playerPosition)} aria-label="Delete">
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
          <div className="data-empty">No player positions found</div>
        )}
      </div>

      {modalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{editing ? 'Edit Player Position' : 'Add Player Position'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="modal-row">
                <label>Player Position ID *</label>
                <input
                  type="number"
                  min="1"
                  value={form.player_position_id}
                  onChange={(e) => setForm({ ...form, player_position_id: e.target.value })}
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
                <label>Position *</label>
                {positions.length > 0 ? (
                  <select
                    value={form.position_id}
                    onChange={(e) => setForm({ ...form, position_id: e.target.value })}
                    required
                  >
                    <option value="">Select position</option>
                    {positions.map((pos) => (
                      <option key={pos.position_id} value={pos.position_id}>
                        {pos.name || `Position #${pos.position_id}`}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="number"
                    min="1"
                    value={form.position_id}
                    onChange={(e) => setForm({ ...form, position_id: e.target.value })}
                    placeholder="Position ID"
                    required
                  />
                )}
              </div>
              <div className="modal-row modal-row-check">
                <label>
                  <input
                    type="checkbox"
                    checked={form.is_primary}
                    onChange={(e) => setForm({ ...form, is_primary: e.target.checked })}
                  />
                  {' '}Primary Position
                </label>
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

export default PlayerPositions;
