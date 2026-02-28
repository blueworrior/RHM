import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Download } from 'lucide-react';
import api from '../../services/api';
import Modal from '../../components/Modal';
import Loading from '../../components/Loading';

const SupervisorProposals = () => {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [isDecisionModalOpen, setIsDecisionModalOpen] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [decision, setDecision] = useState({
    status: '',
    remarks: ''
  });

  useEffect(() => {
    fetchProposals();
  }, []);

  const fetchProposals = async () => {
    try {
      const response = await api.get('/api/supervisor/proposals');
      setProposals(response.data);
    } catch (err) {
      setError('Failed to load proposals');
    } finally {
      setLoading(false);
    }
  };

  const openDecisionModal = (proposal) => {
    setSelectedProposal(proposal);
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
      await api.put(`/api/supervisor/proposals/${selectedProposal.proposal_id}/decision`, {
        status: decision.status,
        remarks: decision.remarks
      });

      setSuccess(`Proposal ${decision.status.toLowerCase()} successfully`);
      setIsDecisionModalOpen(false);
      fetchProposals();
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
      'Rejected': 'badge-error'
    };
    return badges[status] || 'badge-inactive';
  };

  if (loading) return <Loading />;

  return (
    <div>
      <div className="mb-3">
        <h1 style={{ fontSize: '28px', fontWeight: '700', color: 'var(--primary)' }}>
          Student Proposals
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Review and approve/reject student research proposals
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
              <th>Submitted</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {proposals.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                  No proposals submitted yet
                </td>
              </tr>
            ) : (
              proposals.map((proposal) => (
                <tr key={proposal.proposal_id}>
                  <td>{proposal.student_name}</td>
                  <td>{proposal.registration_no}</td>
                  <td>{proposal.title}</td>
                  <td>{new Date(proposal.submitted_at).toLocaleDateString()}</td>
                  <td>
                    <span className={`badge ${getStatusBadge(proposal.status)}`}>
                      {proposal.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => handleDownload(proposal.file_path)}
                        className="btn btn-outline"
                        style={{ padding: '6px 12px' }}
                        title="Download Proposal"
                      >
                        <Download size={16} />
                      </button>
                      {proposal.status === 'Pending' && (
                        <button
                          onClick={() => openDecisionModal(proposal)}
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
        title="Review Proposal"
      >
        <form onSubmit={handleDecision}>
          {error && <div className="error-message">{error}</div>}

          <p style={{ marginBottom: '20px', color: 'var(--text-secondary)' }}>
            <strong>Student:</strong> {selectedProposal?.student_name}<br />
            <strong>Title:</strong> {selectedProposal?.title}
          </p>

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

export default SupervisorProposals;
