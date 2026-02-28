import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, UserPlus, UserMinus, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import Modal from '../../components/Modal';
import Loading from '../../components/Loading';

const CoordinatorStudents = () => {
  const [students, setStudents] = useState([]);
  const [unassignedStudents, setUnassignedStudents] = useState([]);
  const [supervisors, setSupervisors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    dept_id: '',
    registration_no: '',
    research_area: '',
    enrollment_date: ''
  });

  const [assignData, setAssignData] = useState({
    student_id: '',
    supervisor_id: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [studentsRes, unassignedRes, supervisorsRes] = await Promise.all([
        api.get('/api/coordinator/my-students'),
        api.get('/api/coordinator/unassigned-students'),
        api.get('/api/coordinator/my-supervisors')
      ]);
      setStudents(studentsRes.data);
      setUnassignedStudents(unassignedRes.data);
      setSupervisors(supervisorsRes.data);
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

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      // Get coordinator's department
      const userStr = localStorage.getItem('user');
      const user = JSON.parse(userStr);
      
      await api.post('/api/coordinator/students', {
        ...formData,
        dept_id: user.dept_id || 1 // You'll need to store dept_id in user data
      });
      
      setSuccess('Student created successfully');
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        confirmPassword: '',
        dept_id: '',
        registration_no: '',
        research_area: '',
        enrollment_date: ''
      });
      setIsCreateModalOpen(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create student');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await api.put('/api/coordinator/students', {
        student_id: selectedStudent.id,
        registration_no: formData.registration_no,
        research_area: formData.research_area
      });
      setSuccess('Student updated successfully');
      setIsEditModalOpen(false);
      setSelectedStudent(null);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update student');
    }
  };

  const handleDelete = async (studentId) => {
    if (!window.confirm('Are you sure you want to delete this student? This will remove all their data.')) {
      return;
    }

    setError('');
    setSuccess('');

    try {
      await api.delete(`/api/coordinator/students/${studentId}`);
      setSuccess('Student deleted successfully');
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete student');
    }
  };

  const handleAssignSupervisor = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await api.put('/api/coordinator/assign-supervisor', assignData);
      setSuccess('Supervisor assigned successfully');
      setIsAssignModalOpen(false);
      setAssignData({ student_id: '', supervisor_id: '' });
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to assign supervisor');
    }
  };

  const handleRemoveSupervisor = async (studentId) => {
    if (!window.confirm('Are you sure you want to remove supervisor from this student?')) {
      return;
    }

    setError('');
    setSuccess('');

    try {
      await api.put('/api/coordinator/remove-supervisor', { student_id: studentId });
      setSuccess('Supervisor removed successfully');
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove supervisor');
    }
  };

  const openEditModal = (student) => {
    setSelectedStudent(student);
    setFormData({
      ...formData,
      registration_no: student.registration_no,
      research_area: student.research_area
    });
    setIsEditModalOpen(true);
  };

  const openAssignModal = (student) => {
    setAssignData({ student_id: student.id, supervisor_id: '' });
    setSelectedStudent(student);
    setIsAssignModalOpen(true);
  };

  const passwordsMatch = formData.password && formData.confirmPassword && 
                         formData.password === formData.confirmPassword;

  if (loading) return <Loading />;

  return (
    <div>
      <div className="flex-between mb-3">
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: 'var(--primary)' }}>
            Students Management
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage department students and supervisors</p>
        </div>
        <button onClick={() => setIsCreateModalOpen(true)} className="btn btn-primary">
          <Plus size={18} />
          Add Student
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {/* Unassigned Students Alert */}
      {unassignedStudents.length > 0 && (
        <div style={{
          background: 'rgba(255, 193, 7, 0.1)',
          border: '2px solid #ffc107',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <AlertCircle size={24} color="#f57c00" />
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px', color: 'var(--text-primary)' }}>
              {unassignedStudents.length} Student(s) Without Supervisor
            </h3>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
              The following students need supervisor assignment:
            </p>
            <div style={{ marginTop: '12px' }}>
              {unassignedStudents.map((student) => (
                <div key={student.student_id} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px',
                  background: 'var(--surface)',
                  borderRadius: '8px',
                  marginBottom: '8px'
                }}>
                  <span style={{ fontSize: '14px', color: 'var(--text-primary)' }}>
                    {student.first_name} {student.last_name} ({student.registration_no})
                  </span>
                  <button
                    onClick={() => openAssignModal({ id: student.student_id, first_name: student.first_name, last_name: student.last_name })}
                    className="btn btn-primary"
                    style={{ padding: '6px 12px' }}
                  >
                    <UserPlus size={16} />
                    Assign
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* All Students Table */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Registration No</th>
              <th>Research Area</th>
              <th>Supervisor</th>
              <th>Enrollment Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                  No students in your department yet
                </td>
              </tr>
            ) : (
              students.map((student) => (
                <tr key={student.id}>
                  <td>{student.first_name} {student.last_name}</td>
                  <td>{student.email}</td>
                  <td>{student.registration_no}</td>
                  <td>{student.research_area || '-'}</td>
                  <td>
                    {student.supervisor ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {student.supervisor}
                        <button
                          onClick={() => handleRemoveSupervisor(student.id)}
                          className="btn btn-danger"
                          style={{ padding: '4px 8px' }}
                          title="Remove Supervisor"
                        >
                          <UserMinus size={14} />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => openAssignModal(student)}
                        className="btn btn-outline"
                        style={{ padding: '6px 12px' }}
                      >
                        <UserPlus size={16} />
                        Assign
                      </button>
                    )}
                  </td>
                  <td>
                    {student.enrollment_date 
                      ? new Date(student.enrollment_date).toLocaleDateString() 
                      : '-'}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => openEditModal(student)}
                        className="btn btn-outline"
                        style={{ padding: '6px 12px' }}
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(student.id)}
                        className="btn btn-danger"
                        style={{ padding: '6px 12px' }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create Student Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setFormData({
            first_name: '',
            last_name: '',
            email: '',
            password: '',
            confirmPassword: '',
            dept_id: '',
            registration_no: '',
            research_area: '',
            enrollment_date: ''
          });
          setError('');
        }}
        title="Create New Student"
      >
        <form onSubmit={handleCreate}>
          {error && <div className="error-message">{error}</div>}
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="input-group">
              <label>First Name *</label>
              <input
                type="text"
                value={formData.first_name}
                onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                required
              />
            </div>

            <div className="input-group">
              <label>Last Name *</label>
              <input
                type="text"
                value={formData.last_name}
                onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label>Email *</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
            />
          </div>

          <div className="input-group">
            <label>Password *</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
              minLength={6}
            />
          </div>

          <div className="input-group">
            <label>Confirm Password *</label>
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
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
              <span style={{ color: 'var(--error)', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                Passwords do not match
              </span>
            )}
          </div>

          <div className="input-group">
            <label>Registration Number *</label>
            <input
              type="text"
              value={formData.registration_no}
              onChange={(e) => setFormData({...formData, registration_no: e.target.value})}
              placeholder="e.g., 2024-CS-001"
              required
            />
          </div>

          <div className="input-group">
            <label>Research Area *</label>
            <input
              type="text"
              value={formData.research_area}
              onChange={(e) => setFormData({...formData, research_area: e.target.value})}
              placeholder="e.g., Machine Learning"
              required
            />
          </div>

          <div className="input-group">
            <label>Enrollment Date *</label>
            <input
              type="date"
              value={formData.enrollment_date}
              onChange={(e) => setFormData({...formData, enrollment_date: e.target.value})}
              required
            />
          </div>

          <div className="modal-footer">
            <button type="button" onClick={() => setIsCreateModalOpen(false)} className="btn btn-outline">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Create Student
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Student Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedStudent(null);
          setError('');
        }}
        title="Edit Student"
      >
        <form onSubmit={handleUpdate}>
          {error && <div className="error-message">{error}</div>}
          
          <div className="input-group">
            <label>Registration Number *</label>
            <input
              type="text"
              value={formData.registration_no}
              onChange={(e) => setFormData({...formData, registration_no: e.target.value})}
              required
            />
          </div>

          <div className="input-group">
            <label>Research Area *</label>
            <input
              type="text"
              value={formData.research_area}
              onChange={(e) => setFormData({...formData, research_area: e.target.value})}
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

      {/* Assign Supervisor Modal */}
      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => {
          setIsAssignModalOpen(false);
          setAssignData({ student_id: '', supervisor_id: '' });
          setSelectedStudent(null);
          setError('');
        }}
        title="Assign Supervisor"
      >
        <form onSubmit={handleAssignSupervisor}>
          {error && <div className="error-message">{error}</div>}
          
          <p style={{ marginBottom: '20px', color: 'var(--text-secondary)' }}>
            Assigning supervisor for: <strong>{selectedStudent?.first_name} {selectedStudent?.last_name}</strong>
          </p>

          <div className="input-group">
            <label>Select Supervisor *</label>
            <select
              value={assignData.supervisor_id}
              onChange={(e) => setAssignData({...assignData, supervisor_id: e.target.value})}
              required
            >
              <option value="">Choose a supervisor</option>
              {supervisors.map(sup => (
                <option key={sup.supervisor_id} value={sup.supervisor_id}>
                  {sup.first_name} {sup.last_name} - {sup.designation} ({sup.expertise})
                </option>
              ))}
            </select>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={() => setIsAssignModalOpen(false)} className="btn btn-outline">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Assign Supervisor
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CoordinatorStudents;