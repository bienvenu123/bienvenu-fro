import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Search, FileBarChart } from 'lucide-react';
import { getAwards, createAward, updateAward, deleteAward } from '../services/awardService';
import ReportModal from '../components/ReportModal/ReportModal';
import './Awards.css';

function Awards() {
  const [awards, setAwards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    award_id: '',
    name: '',
    category: 'player',
    level: 'individual',
    description: '',
  });

  const loadAwards = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAwards();
      setAwards(data);
    } catch (err) {
      setError(err.message || 'Failed to load awards');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAwards();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({
      award_id: '',
      name: '',
      category: 'player',
      level: 'individual',
      description: '',
    });
    setModalOpen(true);
  };

  const openEdit = (award) => {
    setEditing(award);
    setForm({
      award_id: String(award.award_id),
      name: award.name || '',
      category: award.category || 'player',
      level: award.level || 'individual',
      description: award.description || '',
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
        category: form.category,
        level: form.level,
        description: form.description.trim() || null,
      };

      if (editing) {
        await updateAward(editing.award_id, payload);
      } else {
        const awardId = parseInt(form.award_id, 10);
        if (!awardId || awardId < 1) {
          setError('Award ID must be a positive number');
          return;
        }
        await createAward({ award_id: awardId, ...payload });
      }
      closeModal();
      loadAwards();
    } catch (err) {
      setError(err.message || 'Operation failed');
    }
  };

  const handleDelete = async (award) => {
    if (!window.confirm(`Delete ${award.name}?`)) return;
    try {
      setError(null);
      await deleteAward(award.award_id);
      loadAwards();
    } catch (err) {
      setError(err.message || 'Delete failed');
    }
  };

  const filtered = awards.filter(
    (a) =>
      a.name?.toLowerCase().includes(search.toLowerCase()) ||
      a.category?.toLowerCase().includes(search.toLowerCase()) ||
      a.level?.toLowerCase().includes(search.toLowerCase()) ||
      a.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="data-page">
      <div className="data-toolbar">
        <div className="data-search">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search awards..."
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
            Add Award
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
                <th>Name</th>
                <th>Category</th>
                <th>Level</th>
                <th>Description</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((award) => (
                <tr key={award.award_id}>
                  <td>{award.award_id}</td>
                  <td className="data-cell-name">{award.name}</td>
                  <td>
                    <span className="badge badge-info">{award.category}</span>
                  </td>
                  <td>
                    <span className="badge badge-info">{award.level}</span>
                  </td>
                  <td>{award.description || '—'}</td>
                  <td>
                    <div className="action-btns">
                      <button className="edit-btn" onClick={() => openEdit(award)}>
                        <Pencil size={14} /> Edit
                      </button>
                      <button className="delete-btn" onClick={() => handleDelete(award)} aria-label="Delete">
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
          <div className="data-empty">No awards found</div>
        )}
      </div>

      {modalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{editing ? 'Edit Award' : 'Add Award'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="modal-row">
                <label>Award ID *</label>
                <input
                  type="number"
                  min="1"
                  value={form.award_id}
                  onChange={(e) => setForm({ ...form, award_id: e.target.value })}
                  disabled={!!editing}
                  required
                />
              </div>
              <div className="modal-row">
                <label>Name *</label>
                <input
                  type="text"
                  maxLength="150"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
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
                  <option value="player">Player</option>
                  <option value="team">Team</option>
                  <option value="manager">Manager</option>
                </select>
              </div>
              <div className="modal-row">
                <label>Level *</label>
                <select
                  value={form.level}
                  onChange={(e) => setForm({ ...form, level: e.target.value })}
                  required
                >
                  <option value="individual">Individual</option>
                  <option value="team">Team</option>
                  <option value="league">League</option>
                  <option value="international">International</option>
                </select>
              </div>
              <div className="modal-row">
                <label>Description</label>
                <textarea
                  rows="3"
                  maxLength="500"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Optional description..."
                />
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
        entityType="awards"
        entityName="Awards"
        data={awards}
        dateField="created_at"
      />
    </div>
  );
}

export default Awards;
