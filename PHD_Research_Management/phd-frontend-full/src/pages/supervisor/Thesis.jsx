import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Download } from 'lucide-react';
import api from '../../services/api';
import Modal from '../../components/Modal';
import Loading from '../../components/Loading';

const SupervisorThesis = () => {
  const [theses, setTheses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [isDecisionModalOpen, setIsDecisionModalOpen] = useState(false);
  const [selectedThesis, setSelectedThesis] = useState(null);
  const [decision, setDecision] = useState({
    status: '',
    remarks: ''
  });

  useEffect(() => {
    fetchTheses();
  }, []);

  const fetchTheses = async () => {
    try {
      const response = await api.get('/api/supervisor/thesis');
      setTheses(response.data);
    } catch (err) {
      setError('Failed to load thesis');
    } finally {
      setLoading(false);
    }
  };

  const openDecisionModal = (thesis) => {
    setSelectedThesis(thesis);
    setDecision({ status: '', remarks: '' });
    setError('');
    setIsDecisionModalOpen(true);
  };

  const handleDecision = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!decision.status) {
      setError('Please select a decision');
      return;
    }

    try {
      await api.put(`/api/supervisor/thesis/${selectedThesis.thesis_id}/decision`, {
        status: decision.status,
        remarks: decision.remarks
      });

      setSuccess(`Thesis ${decision.status.toLowerCase()} successfully`);
      setIsDecisionModalOpen(false);
      fetchTheses();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit decision');
    }
  };

  const handleDownload = (filePath) => {
    const downloadUrl = `http://localhost:5000/${filePath}`;
    window.open(downloadUrl, '_blank');
  };

  const getStatusBadge = (status) => {
    const badges = {
      'Pending': 'badge-inactive',
      'Approved': 'badge-active',
      'Rejected': 'badge-error',
      'Under_Examination': 'badge-warning',
      'Approved_Final': 'badge-success'
    };
    return badges[status] || 'badge-inactive';
  };

  const getStatusDisplay = (status) => {
    return status.replace('_', ' ');
  };

  if (loading) return <Loading />;

  return (
    <div>
      <div className="mb-3">
        <h1 style={{ fontSize: '28px', fontWeight: '700', color: 'var(--primary)' }}>
          Student Thesis
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Review and approve/reject student thesis submissions
        </p>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Student</th>
              <th>Registration No</th>
              <th>Title</th>
              <th >Version</th>
              <th>Submitted</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {theses.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                  No thesis submissions yet
                </td>
              </tr>
            ) : (
              theses.map((thesis) => (
                <tr key={thesis.thesis_id}>
                  <td>{thesis.student_name}</td>
                  <td>{thesis.registration_no}</td>
                  <td>{thesis.title}</td>
                  <td>v{thesis.version}</td>
                  <td>{new Date(thesis.submitted_at).toLocaleDateString()}</td>
                  <td>
                    <span className={`badge ${getStatusBadge(thesis.status)}`}>
                      {getStatusDisplay(thesis.status)}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {thesis.file_path && (
                        <button
                          onClick={() => handleDownload(thesis.file_path)}
                          className="btn btn-outline"
                          style={{ padding: '6px 12px' }}
                          title="Download Thesis"
                        >
                          <Download size={16} />
                        </button>
                      )}
                      {thesis.status === 'Pending' && (
                        <button
                          onClick={() => openDecisionModal(thesis)}
                          className="btn btn-primary"
                          style={{ padding: '6px 12px' }}
                        >
                          Decide
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Decision Modal */}
      <Modal
        isOpen={isDecisionModalOpen}
        onClose={() => {
          setIsDecisionModalOpen(false);
          setDecision({ status: '', remarks: '' });
          setError('');
        }}
        title="Review Thesis"
      >
        <form onSubmit={handleDecision}>
          {error && <div className="error-message">{error}</div>}

          <p style={{ marginBottom: '20px', color: 'var(--text-secondary)' }}>
            <strong>Student:</strong> {selectedThesis?.student_name}<br />
            <strong>Title:</strong> {selectedThesis?.title}
          </p>

          <div style={{
            background: 'rgba(255, 193, 7, 0.1)',
            border: '2px solid #ffc107',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '20px'
          }}>
            <p style={{ fontSize: '14px', margin: 0 }}>
              <strong>Note:</strong> Approved thesis will be sent to coordinator for examiner assignment.
              Rejected thesis will be returned to student for revision.
            </p>
          </div>

          <div className="input-group">
            <label>Decision *</label>
            <select
              value={decision.status}
              onChange={(e) => setDecision({...decision, status: e.target.value})}
              required
            >
              <option value="">Select Decision</option>
              <option value="Approved">Approve</option>
              <option value="Rejected">Reject</option>
            </select>
          </div>

          <div className="input-group">
            <label>Remarks</label>
            <textarea
              value={decision.remarks}
              onChange={(e) => setDecision({...decision, remarks: e.target.value})}
              placeholder="Add feedback or comments..."
              rows={4}
            />
          </div>

          <div className="modal-footer">
            <button type="button" onClick={() => setIsDecisionModalOpen(false)} className="btn btn-outline">
              Cancel
            </button>
            <button 
              type="submit" 
              className={`btn ${decision.status === 'Approved' ? 'btn-success' : 'btn-danger'}`}
            >
              {decision.status === 'Approved' ? <CheckCircle size={16} /> : <XCircle size={16} />}
              {decision.status === 'Approved' ? 'Approve' : 'Reject'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default SupervisorThesis;