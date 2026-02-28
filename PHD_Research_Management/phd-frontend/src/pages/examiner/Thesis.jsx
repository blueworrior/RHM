import React, { useState, useEffect } from 'react';
import { CheckCircle, Download } from 'lucide-react';
import api from '../../services/api';
import Modal from '../../components/Modal';
import Loading from '../../components/Loading';

const ExaminerThesis = () => {
    const [theses, setTheses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [isEvaluateModalOpen, setIsEvaluateModalOpen] = useState(false);
    const [selectedThesis, setSelectedThesis] = useState(null);
    const [evaluation, setEvaluation] = useState({
        grade: '',
        remarks: ''
    });

    useEffect(() => {
        fetchTheses();
    }, []);

    const fetchTheses = async () => {
        try {
            const response = await api.get('/api/examiner/thesis');
            setTheses(response.data);
        } catch (err) {
            setError('Failed to load assigned thesis');
        } finally {
            setLoading(false);
        }
    };

    const openEvaluateModal = (thesis) => {
        setSelectedThesis(thesis);
        setEvaluation({ grade: '', remarks: '' });
        setError('');
        setIsEvaluateModalOpen(true);
    };

    const handleEvaluate = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!evaluation.grade) {
            setError('Please select a grade');
            return;
        }

        try {
            await api.post(`/api/examiner/thesis/${selectedThesis.thesis_id}/evaluate`, {
                grade: evaluation.grade,
                remarks: evaluation.remarks
            });

            setSuccess('Evaluation submitted successfully');
            setIsEvaluateModalOpen(false);
            fetchTheses();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit evaluation');
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
                    Assigned Thesis
                </h1>
                <p style={{ color: 'var(--text-secondary)' }}>
                    Evaluate thesis assigned to you by coordinator
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
            {theses.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                  No thesis assigned to you yet
                </td>
              </tr>
            ) : (
              theses.map((thesis) => (
                <tr key={thesis.thesis_id}>
                  <td>{thesis.student_name}</td>
                  <td>{thesis.registration_no}</td>
                  <td>{thesis.title}</td>
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
                      {/* Show different button based on evaluation status */}
                      {thesis.status === 'Under_Examination' && (
                        thesis.has_evaluated ? (
                          <button
                            className="btn btn-success"
                            style={{ padding: '6px 12px', cursor: 'default' }}
                            disabled={true}
                          >
                            <CheckCircle size={16} />
                            Evaluated
                          </button>
                        ) : (
                          <button
                            onClick={() => openEvaluateModal(thesis)}
                            className="btn btn-primary"
                            style={{ padding: '6px 12px' }}
                          >
                            Evaluate
                          </button>
                        )
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
                </table>
            </div>

            {/* Evaluate Modal */}
            <Modal
                isOpen={isEvaluateModalOpen}
                onClose={() => {
                    setIsEvaluateModalOpen(false);
                    setEvaluation({ grade: '', remarks: '' });
                    setError('');
                }}
                title="Evaluate Thesis"
            >
                <form onSubmit={handleEvaluate}>
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
                            <strong>Note:</strong> Your evaluation will be reviewed by the coordinator.
                            At least 2 examiners must evaluate before final decision.
                        </p>
                    </div>

                    <div className="input-group">
                        <label>Grade *</label>
                        <select
                            value={evaluation.grade}
                            onChange={(e) => setEvaluation({ ...evaluation, grade: e.target.value })}
                            required
                        >
                            <option value="">Select Grade</option>
                            <option value="A">A - Excellent</option>
                            <option value="B">B - Good</option>
                            <option value="C">C - Satisfactory</option>
                            <option value="Pass">Pass</option>
                            <option value="Fail">Fail</option>
                        </select>
                    </div>

                    <div className="input-group">
                        <label>Remarks *</label>
                        <textarea
                            value={evaluation.remarks}
                            onChange={(e) => setEvaluation({ ...evaluation, remarks: e.target.value })}
                            placeholder="Add detailed feedback and comments..."
                            rows={6}
                            required
                        />
                    </div>

                    <div className="modal-footer">
                        <button type="button" onClick={() => setIsEvaluateModalOpen(false)} className="btn btn-outline">
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-success"
                        >
                            <CheckCircle size={16} />
                            Submit Evaluation
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default ExaminerThesis;