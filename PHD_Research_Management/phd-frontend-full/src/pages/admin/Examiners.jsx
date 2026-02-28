import React, { useState, useEffect } from 'react';
import { Plus, Edit2 } from 'lucide-react';
import api from '../../services/api';
import Modal from '../../components/Modal';
import Loading from '../../components/Loading';

const Examiners = () => {
    const [examiners, setExaminers] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedExaminer, setSelectedExaminer] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        confirmPassword: "",
        dept_id: '',
        designation: ''
    });

    // for confirm password helper
    const passwordsMatch = formData.password && formData.confirmPassword &&
        formData.password === formData.confirmPassword;

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [examRes, deptRes] = await Promise.all([
                api.get('/api/admin/examiners'),
                api.get('/api/admin/departments')
            ]);
            setExaminers(examRes.data);
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
            await api.post('/api/admin/examiners', formData);
            setSuccess('Examiner created successfully');
            setFormData({
                first_name: '',
                last_name: '',
                email: '',
                password: '',
                dept_id: '',
                designation: ''
            });
            setIsCreateModalOpen(false);
            fetchData();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create examiner');
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            await api.put(`/api/admin/examiners/${selectedExaminer.user_id}`, {
                first_name: formData.first_name,
                last_name: formData.last_name,
                email: formData.email,
                dept_id: formData.dept_id,
                designation: formData.designation
            });
            setSuccess('Examiner updated successfully');
            setIsEditModalOpen(false);
            setSelectedExaminer(null);
            setFormData({
                first_name: '',
                last_name: '',
                email: '',
                password: '',
                dept_id: '',
                designation: ''
            });
            fetchData();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update examiner');
        }
    };

    const openEditModal = (examiner) => {
        setSelectedExaminer(examiner);
        const dept = departments.find(d => d.name === examiner.department);
        setFormData({
            first_name: examiner.first_name,
            last_name: examiner.last_name,
            email: examiner.email,
            dept_id: dept?.id || '',
            designation: examiner.designation || '',
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
                        Examiners
                    </h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Manage thesis examiners</p>
                </div>
                <button onClick={() => setIsCreateModalOpen(true)} className="btn btn-primary">
                    <Plus size={18} />
                    Add Examiner
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
                        {examiners.map((examiner) => (
                            <tr key={examiner.user_id}>
                                <td>{examiner.first_name} {examiner.last_name}</td>
                                <td>{examiner.email}</td>
                                <td>{examiner.department}</td>
                                <td>
                                    <button
                                        onClick={() => openEditModal(examiner)}
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
                        designation: ''
                    });
                    setError('');
                }}
                title="Create New Examiner"
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
                            placeholder="e.g., Professor, Dr."
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
                    setSelectedExaminer(null);
                    setFormData({
                        first_name: '',
                        last_name: '',
                        email: '',
                        password: '',
                        dept_id: '',
                        designation: ''
                    });
                    setError('');
                }}
                title="Edit Examiner"
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

export default Examiners;