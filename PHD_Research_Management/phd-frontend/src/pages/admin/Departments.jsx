import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import api from '../../services/api';
import Modal from '../../components/Modal';
import Loading from '../../components/Loading';

const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedDept, setSelectedDept] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [name, setName] = useState('');

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await api.get('/api/admin/departments');
      setDepartments(response.data);
    } catch (err) {
      setError('Failed to load departments');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await api.post('/api/admin/departments', { name });
      setSuccess('Department created successfully');
      setName('');
      setIsCreateModalOpen(false);
      fetchDepartments();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create department');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await api.put(`/api/admin/departments/${selectedDept.id}`, { name });
      setSuccess('Department updated successfully');
      setIsEditModalOpen(false);
      setSelectedDept(null);
      setName('');
      fetchDepartments();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update department');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this department?')) {
      return;
    }

    setError('');
    setSuccess('');

    try {
      await api.delete(`/api/admin/departments/${id}`);
      setSuccess('Department deleted successfully');
      fetchDepartments();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete department');
    }
  };

  const openEditModal = (dept) => {
    setSelectedDept(dept);
    setName(dept.name);
    setIsEditModalOpen(true);
  };

  if (loading) return <Loading />;

  return (
    <div>
      <div className="flex-between mb-3">
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: 'var(--primary)' }}>
            Departments
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage university departments</p>
        </div>
        <button onClick={() => setIsCreateModalOpen(true)} className="btn btn-primary">
          <Plus size={18} />
          Add Department
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Department Name</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {departments.map((dept) => (
              <tr key={dept.id}>
                <td>{dept.id}</td>
                <td>{dept.name}</td>
                <td>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => openEditModal(dept)}
                      className="btn btn-outline"
                      style={{ padding: '6px 12px' }}
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(dept.id)}
                      className="btn btn-danger"
                      style={{ padding: '6px 12px' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
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
          setName('');
          setError('');
        }}
        title="Create New Department"
      >
        <form onSubmit={handleCreate}>
          {error && <div className="error-message">{error}</div>}
          
          <div className="input-group">
            <label>Department Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Computer Science"
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
          setSelectedDept(null);
          setName('');
          setError('');
        }}
        title="Edit Department"
      >
        <form onSubmit={handleUpdate}>
          {error && <div className="error-message">{error}</div>}
          
          <div className="input-group">
            <label>Department Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
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

export default Departments;