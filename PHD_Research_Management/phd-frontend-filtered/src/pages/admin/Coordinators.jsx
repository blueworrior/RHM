import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Filter } from 'lucide-react';
import api from '../../services/api';
import Modal from '../../components/Modal';
import Loading from '../../components/Loading';
import TableFilter from '../../components/TableFilter';
import useTableFilter from '../../hooks/useTableFilter';

const Coordinators = () => {
    const [coordinators, setCoordinators] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedCoord, setSelectedCoord] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // FILTER HOOK
    const {
        filteredData: filteredCoordinators,
        handleSort,
        handleSearch,
        handleFilterChange,
        filters,
        sortConfig,
        resetFilters
    } = useTableFilter(coordinators, ['first_name', 'last_name', 'email', 'department']);

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
        confirmPassword: '',
        dept_id: ''
    });

    const passwordsMatch = formData.password && formData.confirmPassword &&
        formData.password === formData.confirmPassword;

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [coordRes, deptRes] = await Promise.all([
                api.get('/api/admin/coordinators'),
                api.get('/api/admin/departments')
            ]);
            setCoordinators(coordRes.data);
            setDepartments(deptRes.data);
        } catch (err) {
            setError('Failed to load data');
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

    const handleCreate = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        try {
            await api.post('/api/admin/coordinators', formData);
            setSuccess('Coordinator created successfully');
            setFormData({ first_name: '', last_name: '', email: '', password: '', confirmPassword: '', dept_id: '' });
            setIsCreateModalOpen(false);
            fetchData();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create coordinator');
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            await api.put(`/api/admin/coordinators/${selectedCoord.user_id}`, {
                first_name: formData.first_name,
                last_name: formData.last_name,
                email: formData.email,
                dept_id: formData.dept_id
            });
            setSuccess('Coordinator updated successfully');
            setIsEditModalOpen(false);
            setSelectedCoord(null);
            setFormData({ first_name: '', last_name: '', email: '', password: '', confirmPassword: '', dept_id: '' });
            fetchData();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update coordinator');
        }
    };

    const openEditModal = (coord) => {
        setSelectedCoord(coord);
        const dept = departments.find(d => d.name === coord.department);
        setFormData({
            first_name: coord.first_name,
            last_name: coord.last_name,
            email: coord.email,
            dept_id: dept?.id || '',
            password: '',
            confirmPassword: ''
        });
        setIsEditModalOpen(true);
    };

    if (loading) return <Loading />;

    return (
        <div>
            <div className="flex-between mb-3">
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: '700', color: 'var(--primary)' }}>
                        Coordinators
                    </h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Manage department coordinators</p>
                </div>
                <button onClick={() => setIsCreateModalOpen(true)} className="btn btn-primary">
                    <Plus size={18} />
                    Add Coordinator
                </button>
            </div>

            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            {/* Clear Filters Banner */}
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
                                    onClick={() => openFilterModal('department', 'Department')}>
                                    Department
                                    <Filter size={14} style={{ color: 'var(--text-secondary)' }} />
                                </div>
                            </th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredCoordinators.length === 0 ? (
                            <tr>
                                <td colSpan="4" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                                    No coordinators found
                                </td>
                            </tr>
                        ) : (
                            filteredCoordinators.map((coord) => (
                                <tr key={coord.user_id}>
                                    <td>{coord.first_name} {coord.last_name}</td>
                                    <td>{coord.email}</td>
                                    <td>{coord.department}</td>
                                    <td>
                                        <button
                                            onClick={() => openEditModal(coord)}
                                            className="btn btn-outline"
                                            style={{ padding: '6px 12px' }}
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Create Modal */}
            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => {
                    setIsCreateModalOpen(false);
                    setFormData({ first_name: '', last_name: '', email: '', password: '', confirmPassword: '', dept_id: '' });
                    setError('');
                }}
                title="Create New Coordinator"
            >
                <form onSubmit={handleCreate}>
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

                    <div className="input-group">
                        <label>Department *</label>
                        <select
                            value={formData.dept_id}
                            onChange={(e) => setFormData({ ...formData, dept_id: e.target.value })}
                            required
                        >
                            <option value="">Select Department</option>
                            {departments.map(dept => (
                                <option key={dept.id} value={dept.id}>{dept.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="modal-footer">
                        <button type="button" onClick={() => setIsCreateModalOpen(false)} className="btn btn-outline">
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary">
                            Create
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Edit Modal */}
            <Modal
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setSelectedCoord(null);
                    setFormData({ first_name: '', last_name: '', email: '', password: '', confirmPassword: '', dept_id: '' });
                    setError('');
                }}
                title="Edit Coordinator"
            >
                <form onSubmit={handleUpdate}>
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
                        <label>Department *</label>
                        <select
                            value={formData.dept_id}
                            onChange={(e) => setFormData({ ...formData, dept_id: e.target.value })}
                            required
                        >
                            <option value="">Select Department</option>
                            {departments.map(dept => (
                                <option key={dept.id} value={dept.id}>{dept.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="modal-footer">
                        <button type="button" onClick={() => setIsEditModalOpen(false)} className="btn btn-outline">
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary">
                            Update
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
                filters={[]}
                onFilterChange={handleFilterChange}
                currentFilters={filters}
            />
        </div>
    );
};

export default Coordinators;