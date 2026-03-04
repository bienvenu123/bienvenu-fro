import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { getPositions, createPosition, updatePosition, deletePosition } from '../services/positionService';
import './Positions.css';

function Positions() {
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    position_id: '',
    name: '',
    short_name: '',
    category: 'goalkeeper',
  });

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getPositions();
      setPositions(data);
    } catch (err) {
      setError(err.message || 'Failed to load positions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getCategoryBadgeClass = (category) => {
    switch (category) {
      case 'goalkeeper':
        return 'badge-info';
      case 'defender':
        return 'badge-gray';
      case 'midfielder':
        return 'badge-success';
      case 'forward':
        return 'badge-warning';
      default:
        return 'badge-gray';
    }
  };

  const formatCategory = (category) => {
    return category
      .charAt(0)
      .toUpperCase() + category.slice(1);
  };

  const openCreate = () => {
    setEditing(null);
    setForm({
      position_id: '',
      name: '',
      short_name: '',
      category: 'goalkeeper',
    });
    setModalOpen(true);
  };

  const openEdit = (position) => {
    setEditing(position);
    setForm({
      position_id: String(position.position_id),
      name: position.name || '',
      short_name: position.short_name || '',
      category: position.category || 'goalkeeper',
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
        short_name: form.short_name.trim(),
        category: form.category,
      };

      if (editing) {
        await updatePosition(editing.position_id, payload);
      } else {
        const positionId = parseInt(form.position_id, 10);
        if (!positionId || positionId < 1) {
          setError('Position ID must be a positive number');
          return;
        }
        await createPosition({ position_id: positionId, ...payload });
      }
      closeModal();
      loadData();
    } catch (err) {
      setError(err.message || 'Operation failed');
    }
  };

  const handleDelete = async (position) => {
    if (!window.confirm(`Delete position "${position.name}"?`)) return;
    try {
      setError(null);
      await deletePosition(position.position_id);
      loadData();
    } catch (err) {
      setError(err.message || 'Delete failed');
    }
  };

  const filtered = positions.filter(
    (p) =>
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.short_name?.toLowerCase().includes(search.toLowerCase()) ||
      p.category?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="data-page">
      <div className="data-toolbar">
        <div className="data-search">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search positions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className="data-add-btn" onClick={openCreate}>
          <Plus size={18} />
          Add Position
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
                <th>Short Name</th>
                <th>Category</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((position) => (
                <tr key={position.position_id}>
                  <td>{position.position_id}</td>
                  <td className="data-cell-name">{position.name}</td>
                  <td>
                    <code className="short-name-code">{position.short_name}</code>
                  </td>
                  <td>
                    <span className={`badge ${getCategoryBadgeClass(position.category)}`}>
                      {formatCategory(position.category)}
                    </span>
                  </td>
                  <td>
                    <div className="action-btns">
                      <button className="edit-btn" onClick={() => openEdit(position)}>
                        <Pencil size={14} /> Edit
                      </button>
                      <button className="delete-btn" onClick={() => handleDelete(position)} aria-label="Delete">
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
          <div className="data-empty">No positions found</div>
        )}
      </div>

      {modalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{editing ? 'Edit Position' : 'Add Position'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="modal-row">
                <label>Position ID *</label>
                <input
                  type="number"
                  min="1"
                  value={form.position_id}
                  onChange={(e) => setForm({ ...form, position_id: e.target.value })}
                  disabled={!!editing}
                  required
                />
              </div>
              <div className="modal-row">
                <label>Name *</label>
                <input
                  type="text"
                  maxLength={50}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Goalkeeper"
                  required
                />
              </div>
              <div className="modal-row">
                <label>Short Name *</label>
                <input
                  type="text"
                  maxLength={5}
                  value={form.short_name}
                  onChange={(e) => setForm({ ...form, short_name: e.target.value.toUpperCase() })}
                  placeholder="e.g. GK"
                  required
                />
              </div>
              <div className="modal-row">
                <label>Category *</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  required
                >
                  <option value="goalkeeper">Goalkeeper</option>
                  <option value="defender">Defender</option>
                  <option value="midfielder">Midfielder</option>
                  <option value="forward">Forward</option>
                </select>
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

export default Positions;
