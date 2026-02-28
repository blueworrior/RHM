import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Download } from 'lucide-react';
import api from '../../services/api';
import Modal from '../../components/Modal';
import Loading from '../../components/Loading';

const SupervisorProgressReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [isDecisionModalOpen, setIsDecisionModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [decision, setDecision] = useState({
    status: '',
    remarks: ''
  });

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await api.get('/api/supervisor/progress-reports');
      setReports(response.data);
    } catch (err) {
      setError('Failed to load progress reports');
    } finally {
      setLoading(false);
    }
  };

  const openDecisionModal = (report) => {
    setSelectedReport(report);
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
      await api.put(`/api/supervisor/progress-reports/${selectedReport.report_id}/decision`, {
        status: decision.status,
        remarks: decision.remarks
      });

      setSuccess(`Progress report ${decision.status.toLowerCase()} successfully`);
      setIsDecisionModalOpen(false);
      fetchReports();
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
          Student Progress Reports
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Review and approve/reject student progress reports
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
              <th>Semester</th>
              <th>Submitted</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {reports.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                  No progress reports submitted yet
                </td>
              </tr>
            ) : (
              reports.map((report) => (
                <tr key={report.report_id}>
                  <td>{report.student_name}</td>
                  <td>{report.registration_no}</td>
                  <td>{report.semester}</td>
                  <td>{new Date(report.submitted_at).toLocaleDateString()}</td>
                  <td>
                    <span className={`badge ${getStatusBadge(report.status)}`}>
                      {report.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => handleDownload(report.file_path)}
                        className="btn btn-outline"
                        style={{ padding: '6px 12px' }}
                        title="Download Report"
                      >
                        <Download size={16} />
                      </button>
                      {report.status === 'Pending' && (
                        <button
                          onClick={() => openDecisionModal(report)}
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
        title="Review Progress Report"
      >
        <form onSubmit={handleDecision}>
          {error && <div className="error-message">{error}</div>}

          <p style={{ marginBottom: '20px', color: 'var(--text-secondary)' }}>
            <strong>Student:</strong> {selectedReport?.student_name}<br />
            <strong>Semester:</strong> {selectedReport?.semester}
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

export default SupervisorProgressReports;