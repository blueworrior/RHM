import React, { useState, useEffect } from 'react';
import { Plus, Edit2 } from 'lucide-react';
import api from '../../services/api';
import Modal from '../../components/Modal';
import Loading from '../../components/Loading';

const Supervisors = () => {
    const [supervisors, setSupervisors] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedSupervisor, setSelectedSupervisor] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        confirmPassword: "",
        dept_id: '',
        designation: '',
        expertise: ''
    });

    // for confirm password helper
    const passwordsMatch = formData.password && formData.confirmPassword &&
        formData.password === formData.confirmPassword;

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [supRes, deptRes] = await Promise.all([
                api.get('/api/admin/supervisors'),
                api.get('/api/admin/departments')
            ]);
            setSupervisors(supRes.data);
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
            await api.post('/api/admin/supervisors', formData);
            setSuccess('Supervisor created successfully');
            setFormData({
                first_name: '',
                last_name: '',
                email: '',
                password: '',
                dept_id: '',
                designation: '',
                expertise: ''
            });
            setIsCreateModalOpen(false);
            fetchData();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create supervisor');
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            await api.put(`/api/admin/supervisors/${selectedSupervisor.user_id}`, {
                first_name: formData.first_name,
                last_name: formData.last_name,
                email: formData.email,
                dept_id: formData.dept_id,
                designation: formData.designation,
                expertise: formData.expertise
            });
            setSuccess('Supervisor updated successfully');
            setIsEditModalOpen(false);
            setSelectedSupervisor(null);
            setFormData({
                first_name: '',
                last_name: '',
                email: '',
                password: '',
                dept_id: '',
                designation: '',
                expertise: ''
            });
            fetchData();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update supervisor');
        }
    };

    const openEditModal = (supervisor) => {
        setSelectedSupervisor(supervisor);
        const dept = departments.find(d => d.name === supervisor.department);
        setFormData({
            first_name: supervisor.first_name,
            last_name: supervisor.last_name,
            email: supervisor.email,
            dept_id: dept?.id || '',
            designation: supervisor.designation || '',
            expertise: supervisor.expertise || '',
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
                        Supervisors
                    </h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Manage research supervisors</p>
                </div>
                <button onClick={() => setIsCreateModalOpen(true)} className="btn btn-primary">
                    <Plus size={18} />
                    Add Supervisor
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
                            <th>Designation</th>
                            <th>Expertise</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {supervisors.map((sup) => (
                            <tr key={sup.user_id}>
                                <td>{sup.first_name} {sup.last_name}</td>
                                <td>{sup.email}</td>
                                <td>{sup.department}</td>
                                <td>{sup.designation}</td>
                                <td>{sup.expertise}</td>
                                <td>
                                    <button
                                        onClick={() => openEditModal(sup)}
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
                    setFormData({
                        first_name: '',
                        last_name: '',
                        email: '',
                        password: '',
                        dept_id: '',
                        designation: '',
                        expertise: ''
                    });
                    setError('');
                }}
                title="Create New Supervisor"
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

                    <div className="input-group">
                        <label>Designation *</label>
                        <input
                            type="text"
                            value={formData.designation}
                            onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                            placeholder="e.g., Professor, Associate Professor"
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label>Expertise *</label>
                        <input
                            type="text"
                            value={formData.expertise}
                            onChange={(e) => setFormData({ ...formData, expertise: e.target.value })}
                            placeholder="e.g., Machine Learning, Data Science"
                            required
                        />
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
                    setSelectedSupervisor(null);
                    setFormData({
                        first_name: '',
                        last_name: '',
                        email: '',
                        password: '',
                        dept_id: '',
                        designation: '',
                        expertise: ''
                    });
                    setError('');
                }}
                title="Edit Supervisor"
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

                    <div className="input-group">
                        <label>Designation *</label>
                        <input
                            type="text"
                            value={formData.designation}
                            onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label>Expertise *</label>
                        <input
                            type="text"
                            value={formData.expertise}
                            onChange={(e) => setFormData({ ...formData, expertise: e.target.value })}
                            required
                        />
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

export default Supervisors;