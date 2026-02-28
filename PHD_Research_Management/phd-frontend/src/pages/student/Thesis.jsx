import React, { useState, useEffect } from 'react';
import { Upload, RefreshCw, Eye } from 'lucide-react';
import api from '../../services/api';
import Modal from '../../components/Modal';
import Loading from '../../components/Loading';

const StudentThesis = () => {
  const [thesis, setThesis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isResubmitModalOpen, setIsResubmitModalOpen] = useState(false);
  const [isRemarksModalOpen, setIsRemarksModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    thesis_file: null
  });

  const [resubmitFile, setResubmitFile] = useState(null);

  useEffect(() => {
    fetchThesis();
  }, []);

  const fetchThesis = async () => {
    try {
      const response = await api.get('/api/student/thesis');
      setThesis(response.data);
    } catch (err) {
      setError('Failed to load thesis');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.title || !formData.thesis_file) {
      setError('All fields are required');
      return;
    }

    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('thesis_file', formData.thesis_file);

      await api.post('/api/student/thesis', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setSuccess('Thesis submitted successfully');
      setIsSubmitModalOpen(false);
      setFormData({ title: '', thesis_file: null });
      fetchThesis();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit thesis');
    }
  };

  const handleResubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!resubmitFile) {
      setError('Please select a file');
      return;
    }

    try {
      const data = new FormData();
      data.append('thesis_file', resubmitFile);

      await api.put('/api/student/thesis/resubmit', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setSuccess('Thesis resubmitted successfully');
      setIsResubmitModalOpen(false);
      setResubmitFile(null);
      fetchThesis();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resubmit thesis');
    }
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
    return status?.replace('_', ' ') || 'Unknown';
  };

  const canResubmit = thesis?.status === 'Rejected' && !thesis?.is_locked;

  if (loading) return <Loading />;

  return (
    <div>
      <div className="mb-3" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: 'var(--primary)' }}>
            My Thesis
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Submit and track your PhD thesis
          </p>
        </div>
        {!thesis && (
          <button
            onClick={() => setIsSubmitModalOpen(true)}
            className="btn btn-primary"
          >
            <Upload size={18} />
            Submit Thesis
          </button>
        )}
        {canResubmit && (
          <button
            onClick={() => setIsResubmitModalOpen(true)}
            className="btn btn-primary"
          >
            <RefreshCw size={18} />
            Resubmit Thesis
          </button>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {thesis ? (
        <div className="card">
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px', color: 'var(--primary)' }}>
              {thesis.title}
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
              Version {thesis.version}
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            <div>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Status</p>
              <span className={`badge ${getStatusBadge(thesis.status)}`}>
                {getStatusDisplay(thesis.status)}
              </span>
            </div>

            {thesis.decision_status && (
              <div>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Last Decision By
                </p>
                <p style={{ fontSize: '14px', fontWeight: '600' }}>
                  {thesis.approval_role}
                </p>
              </div>
            )}

            {thesis.approved_at && (
              <div>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Decision Date
                </p>
                <p style={{ fontSize: '14px', fontWeight: '600' }}>
                  {new Date(thesis.approved_at).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>

          {thesis.remarks && (
            <div style={{
              background: thesis.decision_status === 'Approved' 
                ? 'rgba(40, 167, 69, 0.1)' 
                : 'rgba(220, 53, 69, 0.1)',
              border: `2px solid ${thesis.decision_status === 'Approved' ? '#28a745' : '#dc3545'}`,
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '16px'
            }}>
              <p style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                Feedback:
              </p>
              <p style={{ fontSize: '14px', color: 'var(--text)' }}>
                {thesis.remarks}
              </p>
            </div>
          )}

          {canResubmit && (
            <div style={{
              background: 'rgba(255, 193, 7, 0.1)',
              border: '2px solid #ffc107',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '16px'
            }}>
              <p style={{ fontSize: '14px', margin: 0 }}>
                <strong>Action Required:</strong> Your thesis was rejected. Please review the feedback and resubmit an improved version.
              </p>
            </div>
          )}

          {thesis.status === 'Under_Examination' && (
            <div style={{
              background: 'rgba(0, 123, 255, 0.1)',
              border: '2px solid #007bff',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '16px'
            }}>
              <p style={{ fontSize: '14px', margin: 0 }}>
                <strong>In Progress:</strong> Your thesis is currently being evaluated by examiners. You will be notified when the evaluation is complete.
              </p>
            </div>
          )}

          {thesis.status === 'Approved_Final' && (
            <div style={{
              background: 'rgba(40, 167, 69, 0.1)',
              border: '2px solid #28a745',
              borderRadius: '8px',
              padding: '16px'
            }}>
              <p style={{ fontSize: '14px', margin: 0 }}>
                <strong>🎉 Congratulations!</strong> Your thesis has been approved. Your PhD journey is complete!
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <p style={{ fontSize: '16px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
            You haven't submitted your thesis yet
          </p>
          <button
            onClick={() => setIsSubmitModalOpen(true)}
            className="btn btn-primary"
          >
            <Upload size={18} />
            Submit Thesis
          </button>
        </div>
      )}

      {/* Submit Thesis Modal */}
      <Modal
        isOpen={isSubmitModalOpen}
        onClose={() => {
          setIsSubmitModalOpen(false);
          setFormData({ title: '', thesis_file: null });
          setError('');
        }}
        title="Submit Thesis"
      >
        <form onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}

          <div style={{
            background: 'rgba(0, 123, 255, 0.1)',
            border: '2px solid #007bff',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '20px'
          }}>
            <p style={{ fontSize: '14px', margin: 0 }}>
              <strong>Note:</strong> Once submitted, your thesis will be reviewed by your supervisor. 
              Make sure all content is complete and properly formatted.
            </p>
          </div>

          <div className="input-group">
            <label>Thesis Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="Enter thesis title"
              required
            />
          </div>

          <div className="input-group">
            <label>Thesis File * (PDF)</label>
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => setFormData({...formData, thesis_file: e.target.files[0]})}
              required
            />
            {formData.thesis_file && (
              <p style={{ fontSize: '12px', color: 'var(--success)', marginTop: '8px' }}>
                Selected: {formData.thesis_file.name}
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

      {/* Resubmit Thesis Modal */}
      <Modal
        isOpen={isResubmitModalOpen}
        onClose={() => {
          setIsResubmitModalOpen(false);
          setResubmitFile(null);
          setError('');
        }}
        title="Resubmit Thesis"
      >
        <form onSubmit={handleResubmit}>
          {error && <div className="error-message">{error}</div>}

          <div style={{
            background: 'rgba(255, 193, 7, 0.1)',
            border: '2px solid #ffc107',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '20px'
          }}>
            <p style={{ fontSize: '14px', margin: 0 }}>
              <strong>Resubmission:</strong> This will create version {thesis ? thesis.version + 1 : 2} of your thesis. 
              Please address all feedback from the previous rejection.
            </p>
          </div>

          <div style={{
            background: 'var(--surface)',
            border: '2px solid var(--border)',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '20px'
          }}>
            <p style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
              Current Version: {thesis?.version || 1}
            </p>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '0' }}>
              New Version: {thesis ? thesis.version + 1 : 2}
            </p>
          </div>

          <div className="input-group">
            <label>Updated Thesis File * (PDF)</label>
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => setResubmitFile(e.target.files[0])}
              required
            />
            {resubmitFile && (
              <p style={{ fontSize: '12px', color: 'var(--success)', marginTop: '8px' }}>
                Selected: {resubmitFile.name}
              </p>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" onClick={() => setIsResubmitModalOpen(false)} className="btn btn-outline">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <RefreshCw size={16} />
              Resubmit
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default StudentThesis;