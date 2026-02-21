import React, { useState, useEffect } from 'react';
import { Plus, Edit2 } from 'lucide-react';
import api from '../../services/api';
import Modal from '../../components/Modal';
import Loading from '../../components/Loading';

const Coordinators = () => {
    const [coordinators, setCoordinators] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedCoord, setSelectedCoord] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        confirmPassword: '',
        dept_id: ''
    });

    // for confirm password helper
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

    const handleCreate = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // check both input include same password
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        try {
            await api.post('/api/admin/coordinators', formData);
            setSuccess('Coordinator created successfully');
            setFormData({ first_name: '', last_name: '', email: '', password: '', dept_id: '' });
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
            setFormData({ first_name: '', last_name: '', email: '', password: '', dept_id: '' });
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
            password: ''
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

            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Department</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {coordinators.map((coord) => (
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
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Create Modal */}
            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => {
                    setIsCreateModalOpen(false);
                    setFormData({ first_name: '', last_name: '', email: '', password: '', dept_id: '' });
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
                    setFormData({ first_name: '', last_name: '', email: '', password: '', dept_id: '' });
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
        </div>
    );
};

export default Coordinators;