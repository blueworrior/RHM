import React, { useState, useEffect } from 'react';
import { Plus, Key, Power, Filter } from 'lucide-react';
import api from '../../services/api';
import Modal from '../../components/Modal';
import Loading from '../../components/Loading';
import TableFilter from '../../components/TableFilter';
import useTableFilter from '../../hooks/useTableFilter';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // FILTER HOOK
    const {
        filteredData: filteredUsers,
        handleSort,
        handleSearch,
        handleFilterChange,
        filters,
        sortConfig,
        resetFilters
    } = useTableFilter(users, ['first_name', 'last_name', 'email', 'role']);

    // FILTER MODAL STATE
    const [filterModal, setFilterModal] = useState({
        isOpen: false,
        columnKey: '',
        columnName: ''
    });

    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');

    const passwordsMatch = formData.password && formData.confirmPassword &&
        formData.password === formData.confirmPassword;

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await api.get('/api/admin/users');
            setUsers(response.data);
        } catch (err) {
            setError('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const openFilterModal = (columnKey, columnName) => {
        setFilterModal({
            isOpen: true,
            columnKey,
            columnName
        });
    };

    const closeFilterModal = () => {
        setFilterModal({
            isOpen: false,
            columnKey: '',
            columnName: ''
        });
    };

    const handleCreateAdmin = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        try {
            await api.post('/api/admin/admins', formData);
            setSuccess('Admin created successfully');
            setFormData({ first_name: '', last_name: '', email: '', password: '', confirmPassword: '' });
            setIsCreateModalOpen(false);
            fetchUsers();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create admin');
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (newPassword !== confirmNewPassword) {
            setError('Passwords do not match');
            return;
        }

        try {
            await api.put(`/api/admin/users/${selectedUser.id}/reset-password`, {
                password: newPassword
            });
            setSuccess('Password reset successfully');
            setNewPassword('');
            setConfirmNewPassword('');
            setIsResetPasswordModalOpen(false);
            setSelectedUser(null);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to reset password');
        }
    };

    const handleToggleStatus = async (userId, currentStatus) => {
        const newStatus = currentStatus === 'active' ? 'inactive' : 'active';

        if (!window.confirm(`Are you sure you want to ${newStatus === 'active' ? 'activate' : 'deactivate'} this user?`)) {
            return;
        }

        setError('');
        setSuccess('');

        try {
            await api.put(`/api/admin/users/${userId}/status`, {
                status: newStatus
            });
            setSuccess(`User ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`);
            fetchUsers();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update user status');
        }
    };

    if (loading) return <Loading />;

    return (
        <div>
            <div className="flex-between mb-3">
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: '700', color: 'var(--primary)' }}>
                        Users Management
                    </h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Manage system users and permissions</p>
                </div>
                <button onClick={() => setIsCreateModalOpen(true)} className="btn btn-primary">
                    <Plus size={18} />
                    Create Admin
                </button>
            </div>

            { error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            {/* ✅ ADD CLEAR FILTERS BUTTON */}
            {(Object.keys(filters).some(key => filters[key]) || sortConfig.key) && (
                <div style={{
                    marginBottom: '16px',
                    padding: '12px 16px',
                    background: 'rgba(177, 18, 38, 0.1)',
                    border: '2px solid var(--primary)',
                    borderRadius: '8px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <div>
                        <p style={{ fontSize: '14px', fontWeight: '600', color: 'var(--primary)', margin: 0 }}>
                            Filters Active
                        </p>
                        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
                            {Object.keys(filters).filter(key => filters[key]).length} filter(s) applied
                            {sortConfig.key && ` • Sorted by ${sortConfig.key}`}
                        </p>
                    </div>
                    <button
                        onClick={() => {
                            resetFilters();
                            setSuccess('All filters cleared');
                            setTimeout(() => setSuccess(''), 3000);
                        }}
                        className="btn btn-outline"
                        style={{ padding: '8px 16px' }}
                    >
                        Clear All Filters
                    </button>
                </div>
            )}

            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
                                    onClick={() => openFilterModal('first_name', 'Name')}>
                                    Name
                                    <Filter size={14} style={{ color: 'var(--text-secondary)' }} />
                                </div>
                            </th>
                            <th>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
                                    onClick={() => openFilterModal('email', 'Email')}>
                                    Email
                                    <Filter size={14} style={{ color: 'var(--text-secondary)' }} />
                                </div>
                            </th>
                            <th>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
                                    onClick={() => openFilterModal('role', 'Role')}>
                                    Role
                                    <Filter size={14} style={{ color: 'var(--text-secondary)' }} />
                                </div>
                            </th>
                            <th>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
                                    onClick={() => openFilterModal('status', 'Status')}>
                                    Status
                                    <Filter size={14} style={{ color: 'var(--text-secondary)' }} />
                                </div>
                            </th>
                            <th>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
                                    onClick={() => openFilterModal('is_super_admin', 'Super Admin')}>
                                    Super Admin
                                    <Filter size={14} style={{ color: 'var(--text-secondary)' }} />
                                </div>
                            </th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.length === 0 ? (
                            <tr>
                                <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                                    No users found
                                </td>
                            </tr>
                        ) : (
                            filteredUsers.map((user) => (
                                <tr key={user.id}>
                                    <td>{user.first_name} {user.last_name}</td>
                                    <td>{user.email}</td>
                                    <td style={{ textTransform: 'capitalize' }}>{user.role}</td>
                                    <td>
                                        <span className={`badge ${user.status === 'active' ? 'badge-active' : 'badge-inactive'}`}>
                                            {user.status}
                                        </span>
                                    </td>
                                    <td>{user.is_super_admin ? 'Yes' : 'No'}</td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            {!user.is_super_admin && (
                                                <>
                                                    <button
                                                        onClick={() => {
                                                            setSelectedUser(user);
                                                            setIsResetPasswordModalOpen(true);
                                                        }}
                                                        className="btn btn-outline"
                                                        style={{ padding: '6px 12px' }}
                                                        title="Reset Password"
                                                    >
                                                        <Key size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleToggleStatus(user.id, user.status)}
                                                        className={`btn ${user.status === 'active' ? 'btn-danger' : 'btn-success'}`}
                                                        style={{ padding: '6px 12px' }}
                                                        title={user.status === 'active' ? 'Deactivate' : 'Activate'}
                                                    >
                                                        <Power size={16} />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Create Admin Modal */}
            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => {
                    setIsCreateModalOpen(false);
                    setFormData({ first_name: '', last_name: '', email: '', password: '', confirmPassword: '' });
                    setError('');
                }}
                title="Create New Admin"
            >
                <form onSubmit={handleCreateAdmin}>
                    {error && <div className="error-message">{error}</div>}

                    <div className="input-group">
                        <label>First Name *</label>
                        <input
                            type="text"
                            value={formData.first_name}
                            onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label>Last Name *</label>
                        <input
                            type="text"
                            value={formData.last_name}
                            onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label>Email *</label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label>Password *</label>
                        <input
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                            minLength={6}
                        />
                    </div>

                    <div className="input-group">
                        <label>Confirm Password *</label>
                        <input
                            type="password"
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                            required
                            minLength={6}
                            placeholder="Re-enter password"
                            style={{
                                borderColor: formData.confirmPassword
                                    ? (passwordsMatch ? 'var(--success)' : 'var(--error)')
                                    : 'var(--border)'
                            }}
                        />
                        {formData.confirmPassword && !passwordsMatch && (
                            <span style={{ color: 'var(--error)', fontSize: '12px', marginTop: '4px' }}>
                                Passwords do not match
                            </span>
                        )}
                    </div>

                    <div className="modal-footer">
                        <button type="button" onClick={() => setIsCreateModalOpen(false)} className="btn btn-outline">
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary">
                            Create Admin
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Reset Password Modal */}
            <Modal
                isOpen={isResetPasswordModalOpen}
                onClose={() => {
                    setIsResetPasswordModalOpen(false);
                    setSelectedUser(null);
                    setNewPassword('');
                    setConfirmNewPassword('');
                    setError('');
                }}
                title="Reset User Password"
            >
                <form onSubmit={handleResetPassword}>
                    {error && <div className="error-message">{error}</div>}

                    <p style={{ marginBottom: '20px', color: 'var(--text-secondary)' }}>
                        Resetting password for: <strong>{selectedUser?.first_name} {selectedUser?.last_name}</strong>
                    </p>

                    <div className="input-group">
                        <label>New Password *</label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                            minLength={6}
                            placeholder="Enter new password"
                        />
                    </div>

                    <div className="input-group">
                        <label>Confirm Password *</label>
                        <input
                            type="password"
                            value={confirmNewPassword}
                            onChange={(e) => setConfirmNewPassword(e.target.value)}
                            required
                            minLength={6}
                            placeholder="Re-enter password"
                        />
                    </div>

                    <div className="modal-footer">
                        <button type="button" onClick={() => {
                            setIsResetPasswordModalOpen(false);
                            setSelectedUser(null);
                            setNewPassword('');
                            setConfirmNewPassword('');
                        }} className="btn btn-outline">
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary">
                            Reset Password
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Table Filter Modal */}
            <TableFilter
                isOpen={filterModal.isOpen}
                onClose={closeFilterModal}
                columnName={filterModal.columnName}
                onSort={(direction) => handleSort(filterModal.columnKey, direction)}
                onSearch={handleSearch}
                searchPlaceholder={`Search ${filterModal.columnName.toLowerCase()}...`}
                filters={[
                    ...(filterModal.columnKey === 'role' ? [{
                        key: 'role',
                        label: 'Filter by Role',
                        type: 'select',
                        options: [
                            { value: 'admin', label: 'Admin' },
                            { value: 'coordinator', label: 'Coordinator' },
                            { value: 'supervisor', label: 'Supervisor' },
                            { value: 'examiner', label: 'Examiner' },
                            { value: 'student', label: 'Student' }
                        ]
                    }] : []),
                    ...(filterModal.columnKey === 'status' ? [{
                        key: 'status',
                        label: 'Filter by Status',
                        type: 'select',
                        options: [
                            { value: 'active', label: 'Active' },
                            { value: 'inactive', label: 'Inactive' }
                        ]
                    }] : []),
                    ...(filterModal.columnKey === 'is_super_admin' ? [{
                        key: 'is_super_admin',
                        label: 'Filter by Super Admin',
                        type: 'select',
                        options: [
                            { value: '1', label: 'Yes' },
                            { value: '0', label: 'No' }
                        ]
                    }] : [])
                ]}
                onFilterChange={handleFilterChange}
                currentFilters={filters}
            />
        </div>
    );
};

export default Users;