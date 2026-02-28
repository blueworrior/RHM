import React, { useState, useEffect } from 'react';
import { Upload, Eye } from 'lucide-react';
import api from '../../services/api';
import Modal from '../../components/Modal';
import Loading from '../../components/Loading';

const StudentProgressReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    semester: '',
    report_file: null
  });

  const [isRemarksModalOpen, setIsRemarksModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);

  const openRemarksModal = (report) => {
    setSelectedReport(report);
    setIsRemarksModalOpen(true);
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await api.get('/api/student/progress-reports/status');
      setReports(response.data);
    } catch (err) {
      setError('Failed to load progress reports');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.semester || !formData.report_file) {
      setError('All fields are required');
      return;
    }

    try {
      const data = new FormData();
      data.append('semester', formData.semester);
      data.append('report_file', formData.report_file);

      await api.post('/api/student/progress-reports', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setSuccess('Progress report submitted successfully');
      setIsSubmitModalOpen(false);
      setFormData({ semester: '', report_file: null });
      fetchReports();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit progress report');
    }
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
      <div className="mb-3" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: 'var(--primary)' }}>
            Progress Reports
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Submit your semester progress reports
          </p>
        </div>
        <button
          onClick={() => setIsSubmitModalOpen(true)}
          className="btn btn-primary"
        >
          <Upload size={18} />
          Submit Report
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Semester</th>
              <th>Submitted</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {reports.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                  No progress reports submitted yet
                </td>
              </tr>
            ) : (
              reports.map((report) => (
                <tr key={report.report_id || report.id}>
                  <td>{report.semester}</td>
                  <td>{new Date(report.submitted_at).toLocaleDateString()}</td>
                  <td>
                    <span className={`badge ${getStatusBadge(report.status)}`}>
                      {report.status}
                    </span>
                  </td>
                  <td>
                    {(report.decision_status || report.remarks) && (
                      <button
                        onClick={() => openRemarksModal(report)}
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

      {/* View Remarks Modal */}
      <Modal
        isOpen={isRemarksModalOpen}
        onClose={() => {
          setIsRemarksModalOpen(false);
          setSelectedReport(null);
        }}
        title="Supervisor Feedback"
      >
        <div>
          <p style={{ marginBottom: '16px', color: 'var(--text-secondary)' }}>
            <strong>Semester:</strong> {selectedReport?.semester}
          </p>

          <div style={{
            background: selectedReport?.decision_status === 'Approved' 
              ? 'rgba(40, 167, 69, 0.1)' 
              : 'rgba(220, 53, 69, 0.1)',
            border: `2px solid ${selectedReport?.decision_status === 'Approved' ? '#28a745' : '#dc3545'}`,
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '16px'
          }}>
            <p style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
              Decision: {selectedReport?.decision_status || 'Pending'}
            </p>
            {selectedReport?.approved_at && (
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                Date: {new Date(selectedReport.approved_at).toLocaleDateString()}
              </p>
            )}
            {selectedReport?.decided_by && (
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                By: {selectedReport.decided_by}
              </p>
            )}
          </div>

          {selectedReport?.remarks && (
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
                {selectedReport.remarks}
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

      {/* Submit Report Modal */}
      <Modal
        isOpen={isSubmitModalOpen}
        onClose={() => {
          setIsSubmitModalOpen(false);
          setFormData({ semester: '', report_file: null });
          setError('');
        }}
        title="Submit Progress Report"
      >
        <form onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}

          <div className="input-group">
            <label>Semester *</label>
            <input
              type="text"
              value={formData.semester}
              onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
              placeholder="e.g., Fall 2024, Spring 2025"
              required
            />
          </div>

          <div className="input-group">
            <label>Report File * (PDF)</label>
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => setFormData({ ...formData, report_file: e.target.files[0] })}
              required
            />
            {formData.report_file && (
              <p style={{ fontSize: '12px', color: 'var(--success)', marginTop: '8px' }}>
                Selected: {formData.report_file.name}
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
    </div>
  );
};

export default StudentProgressReports;