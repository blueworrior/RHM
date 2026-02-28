import React, { useState, useEffect } from 'react';
import { Upload, Eye } from 'lucide-react';
import api from '../../services/api';
import Modal from '../../components/Modal';
import Loading from '../../components/Loading';

const StudentProposals = () => {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isRemarksModalOpen, setIsRemarksModalOpen] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    proposal_file: null
  });

  useEffect(() => {
    fetchProposals();
  }, []);

  const fetchProposals = async () => {
    try {
      // ✅ Using status API to get remarks too
      const response = await api.get('/api/student/proposals/status');
      setProposals(response.data);
    } catch (err) {
      setError('Failed to load proposals');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.title || !formData.proposal_file) {
      setError('All fields are required');
      return;
    }

    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('proposal_file', formData.proposal_file);

      await api.post('/api/student/proposals', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setSuccess('Proposal submitted successfully');
      setIsSubmitModalOpen(false);
      setFormData({ title: '', proposal_file: null });
      fetchProposals();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit proposal');
    }
  };

  const openRemarksModal = (proposal) => {
    setSelectedProposal(proposal);
    setIsRemarksModalOpen(true);
  };

  const getStatusBadge = (status) => {
    const badges = {
      'Pending': 'badge-inactive',
      'Approved': 'badge-active',
      'Rejected': 'badge-error'
    };
    return badges[status] || 'badge-inactive';
  };

  const hasPendingProposal = proposals.some(p => p.status === 'Pending');

  if (loading) return <Loading />;

  return (
    <div>
      <div className="mb-3" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: 'var(--primary)' }}>
            My Proposals
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Submit and track your research proposals
          </p>
        </div>
        <button
          onClick={() => setIsSubmitModalOpen(true)}
          className="btn btn-primary"
          disabled={hasPendingProposal}
          title={hasPendingProposal ? 'You have a pending proposal. Wait for decision.' : ''}
        >
          <Upload size={18} />
          Submit Proposal
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {hasPendingProposal && (
        <div style={{
          background: 'rgba(255, 193, 7, 0.1)',
          border: '2px solid #ffc107',
          borderRadius: '8px',
          padding: '12px',
          marginBottom: '20px'
        }}>
          <p style={{ fontSize: '14px', margin: 0 }}>
            <strong>Note:</strong> You have a pending proposal. You can submit a new one after your supervisor reviews it.
          </p>
        </div>
      )}

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Submitted</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {proposals.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                  No proposals submitted yet
                </td>
              </tr>
            ) : (
              proposals.map((proposal) => (
                <tr key={proposal.proposal_id || proposal.id}>
                  <td>{proposal.title}</td>
                  <td>{new Date(proposal.submitted_at).toLocaleDateString()}</td>
                  <td>
                    <span className={`badge ${getStatusBadge(proposal.status)}`}>
                      {proposal.status}
                    </span>
                  </td>
                  <td>
                    {(proposal.decision_status || proposal.remarks) && (
                      <button
                        onClick={() => openRemarksModal(proposal)}
                        className="btn btn-outline"
                        style={{ padding: '6px 12px' }}
                      >
                        <Eye size={16} />
                        View Feedback
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Submit Proposal Modal */}
      <Modal
        isOpen={isSubmitModalOpen}
        onClose={() => {
          setIsSubmitModalOpen(false);
          setFormData({ title: '', proposal_file: null });
          setError('');
        }}
        title="Submit Proposal"
      >
        <form onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}

          <div className="input-group">
            <label>Proposal Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="Enter proposal title"
              required
            />
          </div>

          <div className="input-group">
            <label>Proposal File * (PDF)</label>
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => setFormData({...formData, proposal_file: e.target.files[0]})}
              required
            />
            {formData.proposal_file && (
              <p style={{ fontSize: '12px', color: 'var(--success)', marginTop: '8px' }}>
                Selected: {formData.proposal_file.name}
              </p>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" onClick={() => setIsSubmitModalOpen(false)} className="btn btn-outline">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <Upload size={16} />
              Submit
            </button>
          </div>
        </form>
      </Modal>

      {/* View Remarks Modal */}
      <Modal
        isOpen={isRemarksModalOpen}
        onClose={() => {
          setIsRemarksModalOpen(false);
          setSelectedProposal(null);
        }}
        title="Supervisor Feedback"
      >
        <div>
          <p style={{ marginBottom: '16px', color: 'var(--text-secondary)' }}>
            <strong>Proposal:</strong> {selectedProposal?.title}
          </p>

          <div style={{
            background: selectedProposal?.decision_status === 'Approved' 
              ? 'rgba(40, 167, 69, 0.1)' 
              : 'rgba(220, 53, 69, 0.1)',
            border: `2px solid ${selectedProposal?.decision_status === 'Approved' ? '#28a745' : '#dc3545'}`,
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '16px'
          }}>
            <p style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
              Decision: {selectedProposal?.decision_status || 'Pending'}
            </p>
            {selectedProposal?.approved_at && (
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                Date: {new Date(selectedProposal.approved_at).toLocaleDateString()}
              </p>
            )}
          </div>

          {selectedProposal?.remarks && (
            <div>
              <p style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                Remarks:
              </p>
              <p style={{ 
                fontSize: '14px', 
                color: 'var(--text-secondary)',
                background: 'var(--surface)',
                padding: '12px',
                borderRadius: '8px'
              }}>
                {selectedProposal.remarks}
              </p>
            </div>
          )}

          <div className="modal-footer">
            <button
              onClick={() => setIsRemarksModalOpen(false)}
              className="btn btn-primary"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default StudentProposals;