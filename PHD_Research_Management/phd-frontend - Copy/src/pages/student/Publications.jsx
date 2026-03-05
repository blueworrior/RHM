import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import api from '../../services/api';
import Modal from '../../components/Modal';
import Loading from '../../components/Loading';

const StudentPublications = () => {
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    journal_name: '',
    year: new Date().getFullYear(),
    type: 'Journal'
  });

  useEffect(() => {
    fetchPublications();
  }, []);

  const fetchPublications = async () => {
    try {
      const response = await api.get('/api/student/publications');
      setPublications(response.data);
    } catch (err) {
      setError('Failed to load publications');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.title || !formData.year || !formData.type) {
      setError('Title, year, and type are required');
      return;
    }

    try {
      await api.post('/api/student/publications', formData);

      setSuccess('Publication added successfully');
      setIsAddModalOpen(false);
      setFormData({ title: '', journal_name: '', year: new Date().getFullYear(), type: 'Journal' });
      fetchPublications();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add publication');
    }
  };

  if (loading) return <Loading />;

  return (
    <div>
      <div className="mb-3" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: 'var(--primary)' }}>
            My Publications
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Track your research publications
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="btn btn-primary"
        >
          <Plus size={18} />
          Add Publication
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Journal/Conference</th>
              <th>Year</th>
              <th>Type</th>
            </tr>
          </thead>
          <tbody>
            {publications.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                  No publications added yet
                </td>
              </tr>
            ) : (
              publications.map((pub) => (
                <tr key={pub.id}>
                  <td>{pub.title}</td>
                  <td>{pub.journal_name || '-'}</td>
                  <td>{pub.year}</td>
                  <td>
                    <span className={`badge ${pub.type === 'Journal' ? 'badge-active' : 'badge-inactive'}`}>
                      {pub.type}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Publication Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setFormData({ title: '', journal_name: '', year: new Date().getFullYear(), type: 'Journal' });
          setError('');
        }}
        title="Add Publication"
      >
        <form onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}

          <div className="input-group">
            <label>Publication Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="Enter publication title"
              required
            />
          </div>

          <div className="input-group">
            <label>Journal/Conference Name</label>
            <input
              type="text"
              value={formData.journal_name}
              onChange={(e) => setFormData({...formData, journal_name: e.target.value})}
              placeholder="Enter journal or conference name"
            />
          </div>

          <div className="input-group">
            <label>Year *</label>
            <input
              type="number"
              value={formData.year}
              onChange={(e) => setFormData({...formData, year: parseInt(e.target.value)})}
              min="2000"
              max={new Date().getFullYear() + 1}
              required
            />
          </div>

          <div className="input-group">
            <label>Type *</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({...formData, type: e.target.value})}
              required
            >
              <option value="Journal">Journal</option>
              <option value="Conference">Conference</option>
            </select>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={() => setIsAddModalOpen(false)} className="btn btn-outline">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <Plus size={16} />
              Add Publication
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default StudentPublications;