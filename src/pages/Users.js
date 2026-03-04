import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { getUsers, createUser, updateUser, deleteUser } from '../services/userService';
import './Users.css';

function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    user_id: '',
    name: '',
    email: '',
    username: '',
    role: 'VIEWER',
    password: '',
  });

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const usersData = await getUsers();
      setUsers(usersData);
    } catch (err) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'ADMIN':
        return 'badge-danger';
      case 'EDITOR':
        return 'badge-warning';
      case 'VIEWER':
        return 'badge-info';
      default:
        return 'badge-gray';
    }
  };

  const openCreate = () => {
    setEditing(null);
    setForm({
      user_id: '',
      name: '',
      email: '',
      username: '',
      role: 'VIEWER',
      password: '',
    });
    setModalOpen(true);
  };

  const openEdit = (user) => {
    setEditing(user);
    setForm({
      user_id: String(user.user_id),
      name: user.name || '',
      email: user.email || '',
      username: user.username || '',
      role: user.role || 'VIEWER',
      password: '', // Don't populate password for security
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
        email: form.email.trim().toLowerCase(),
        username: form.username.trim(),
        role: form.role,
      };

      if (editing) {
        // Only include password if it was provided (not empty)
        if (form.password.trim()) {
          payload.password = form.password;
        }
        await updateUser(editing.user_id, payload);
      } else {
        // Password is required for new users
        if (!form.password.trim() || form.password.length < 6) {
          setError('Password must be at least 6 characters');
          return;
        }
        const userId = parseInt(form.user_id, 10);
        if (!userId || userId < 1) {
          setError('User ID must be a positive number');
          return;
        }
        await createUser({ 
          user_id: userId, 
          ...payload,
          password: form.password,
        });
      }
      closeModal();
      loadData();
    } catch (err) {
      setError(err.message || 'Operation failed');
    }
  };

  const handleDelete = async (user) => {
    if (!window.confirm(`Delete user "${user.name}" (${user.username})?`)) return;
    try {
      setError(null);
      await deleteUser(user.user_id);
      loadData();
    } catch (err) {
      setError(err.message || 'Delete failed');
    }
  };

  const filtered = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.username?.toLowerCase().includes(search.toLowerCase()) ||
      u.role?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="data-page">
      <div className="data-toolbar">
        <div className="data-search">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className="data-add-btn" onClick={openCreate}>
          <Plus size={18} />
          Add User
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
                <th>Email</th>
                <th>Username</th>
                <th>Role</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => (
                <tr key={user.user_id}>
                  <td>{user.user_id}</td>
                  <td className="data-cell-name">{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.username}</td>
                  <td>
                    <span className={`badge ${getRoleBadgeClass(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td>
                    <div className="action-btns">
                      <button className="edit-btn" onClick={() => openEdit(user)}>
                        <Pencil size={14} /> Edit
                      </button>
                      <button className="delete-btn" onClick={() => handleDelete(user)} aria-label="Delete">
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
          <div className="data-empty">No users found</div>
        )}
      </div>

      {modalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal modal-wide" onClick={(e) => e.stopPropagation()}>
            <h2>{editing ? 'Edit User' : 'Add User'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="modal-grid">
                <div className="modal-row">
                  <label>User ID *</label>
                  <input
                    type="number"
                    min="1"
                    value={form.user_id}
                    onChange={(e) => setForm({ ...form, user_id: e.target.value })}
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
                  <label>Email *</label>
                  <input
                    type="email"
                    maxLength="255"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value.toLowerCase() })}
                    required
                  />
                </div>
                <div className="modal-row">
                  <label>Username *</label>
                  <input
                    type="text"
                    minLength="3"
                    maxLength="50"
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                    required
                  />
                </div>
                <div className="modal-row">
                  <label>Role *</label>
                  <select
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    required
                  >
                    <option value="VIEWER">VIEWER</option>
                    <option value="EDITOR">EDITOR</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>
                <div className="modal-row">
                  <label>Password {editing ? '(leave blank to keep current)' : '*'}</label>
                  <input
                    type="password"
                    minLength="6"
                    maxLength="255"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required={!editing}
                    placeholder={editing ? 'Leave blank to keep current password' : 'Minimum 6 characters'}
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

export default Users;
