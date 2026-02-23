import React, { useState, useEffect } from 'react';
import { UserPlus, Eye, CheckCircle, XCircle } from 'lucide-react';
import api from '../../services/api';
import Modal from '../../components/Modal';
import Loading from '../../components/Loading';

const Thesis = () => {
    const [approvedTheses, setApprovedTheses] = useState([]); // ✅ NEW
    const [evaluatedTheses, setEvaluatedTheses] = useState([]);
    const [readyTheses, setReadyTheses] = useState([]);
    const [examiners, setExaminers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Modals
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [isEvaluationsModalOpen, setIsEvaluationsModalOpen] = useState(false);
    const [isFinalizeModalOpen, setIsFinalizeModalOpen] = useState(false);

    // Selected data
    const [selectedThesis, setSelectedThesis] = useState(null);
    const [evaluations, setEvaluations] = useState([]);
    const [selectedExaminers, setSelectedExaminers] = useState([]);
    const [finalDecision, setFinalDecision] = useState({
        status: '',
        remarks: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [approvedRes, evalRes, readyRes, examRes] = await Promise.all([
                api.get('/api/coordinator/thesis/approved'), // ✅ NEW - Get approved thesis
                api.get('/api/coordinator/thesis/evaluated'),
                api.get('/api/coordinator/thesis/ready'),
                api.get('/api/coordinator/examiners')
            ]);
            setApprovedTheses(approvedRes.data || []); // ✅ NEW
            setEvaluatedTheses(evalRes.data.theses || []);
            setReadyTheses(readyRes.data || []);
            setExaminers(examRes.data || []);
        } catch (err) {
            setError('Failed to load data');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleViewEvaluations = async (thesis) => {
        setSelectedThesis(thesis);
        setError('');

        try {
            const response = await api.get(`/api/coordinator/thesis/${thesis.thesis_id}/evaluations`);
            setEvaluations(response.data.evaluations || []);
            setIsEvaluationsModalOpen(true);
        } catch (err) {
            setError('Failed to load evaluations');
        }
    };

    const openAssignModal = (thesis) => {
        setSelectedThesis(thesis);
        setSelectedExaminers([]);
        setError('');
        setIsAssignModalOpen(true);
    };

    const handleExaminerToggle = (examinerId) => {
        setError(''); // Clear errors when selecting
        if (selectedExaminers.includes(examinerId)) {
            setSelectedExaminers(selectedExaminers.filter(id => id !== examinerId));
        } else {
            if (selectedExaminers.length >= 3) {
                setError('Maximum 3 examiners allowed');
                return;
            }
            setSelectedExaminers([...selectedExaminers, examinerId]);
        }
    };

    const handleAssignExaminers = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (selectedExaminers.length === 0) {
            setError('Please select at least one examiner');
            return;
        }

        try {
            // Assign each examiner
            for (const examinerId of selectedExaminers) {
                await api.post('/api/coordinator/assign-examiner', {
                    thesis_id: selectedThesis.thesis_id,
                    examiner_id: examinerId
                });
            }

            setSuccess(`${selectedExaminers.length} examiner(s) assigned successfully`);
            setIsAssignModalOpen(false);
            setSelectedExaminers([]);
            fetchData();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to assign examiners');
        }
    };

    const openFinalizeModal = (thesis) => {
        setSelectedThesis(thesis);
        setFinalDecision({ status: '', remarks: '' });
        setIsFinalizeModalOpen(true);
    };

    const handleFinalize = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!finalDecision.status) {
            setError('Please select a decision');
            return;
        }

        try {
            await api.put(`/api/coordinator/thesis/${selectedThesis.id}/final-decision`, {
                status: finalDecision.status,
                remarks: finalDecision.remarks
            });

            setSuccess(`Thesis ${finalDecision.status.toLowerCase()} successfully`);
            setIsFinalizeModalOpen(false);
            fetchData();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to finalize thesis');
        }
    };

    if (loading) return <Loading />;

    return (
        <div>
            <div className="mb-3">
                <h1 style={{ fontSize: '28px', fontWeight: '700', color: 'var(--primary)' }}>
                    Thesis Management
                </h1>
                <p style={{ color: 'var(--text-secondary)' }}>
                    Manage thesis evaluations and final decisions
                </p>
            </div>

            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            {/* ✅ NEW SECTION: Approved Thesis (Waiting for Examiner Assignment) */}
            <div className="card" style={{ marginBottom: '32px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px', color: 'var(--primary)' }}>
                    Approved Thesis - Assign Examiners
                </h2>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                    These thesis have been approved by supervisors and are ready for examiner assignment
                </p>

                {approvedTheses.length === 0 ? (
                    <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '20px' }}>
                        No approved thesis waiting for examiner assignment
                    </p>
                ) : (
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Student</th>
                                    <th>Registration No</th>
                                    <th>Title</th>
                                    <th>Version</th>
                                    <th>Submitted</th>
                                    <th>Assigned Examiners</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {approvedTheses.map((thesis) => (
                                    <tr key={thesis.thesis_id}>
                                        <td>{thesis.student_name}</td>
                                        <td>{thesis.registration_no}</td>
                                        <td>{thesis.title}</td>
                                        <td>v{thesis.version}</td>
                                        <td>{new Date(thesis.submitted_at).toLocaleDateString()}</td>
                                        <td>
                                            <span className={`badge ${thesis.assigned_examiners >= 2 ? 'badge-active' : 'badge-inactive'}`}>
                                                {thesis.assigned_examiners} / 3
                                            </span>
                                        </td>
                                        <td>
                                            <button
                                                onClick={() => openAssignModal(thesis)}
                                                className="btn btn-primary"
                                                style={{ padding: '6px 12px' }}
                                                disabled={thesis.assigned_examiners >= 3}
                                            >
                                                <UserPlus size={16} />
                                                {thesis.assigned_examiners === 0 ? 'Assign' : 'Add More'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Evaluated Thesis Section */}
            <div className="card" style={{ marginBottom: '32px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px', color: 'var(--primary)' }}>
                    Under Examination
                </h2>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                    Thesis that have been assigned to examiners and have received evaluations
                </p>

                {evaluatedTheses.length === 0 ? (
                    <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '20px' }}>
                        No evaluated thesis yet
                    </p>
                ) : (
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Student</th>
                                    <th>Registration No</th>
                                    <th>Title</th>
                                    <th>Version</th>
                                    <th>Status</th>
                                    <th>Evaluations</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {evaluatedTheses.map((thesis) => (
                                    <tr key={thesis.thesis_id}>
                                        <td>{thesis.student_name}</td>
                                        <td>{thesis.registration_no}</td>
                                        <td>{thesis.title}</td>
                                        <td>v{thesis.version}</td>
                                        <td>
                                            <span className="badge badge-active">
                                                {thesis.status}
                                            </span>
                                        </td>
                                        <td>{thesis.total_evaluations} / 3</td>
                                        <td>
                                            <button
                                                onClick={() => handleViewEvaluations(thesis)}
                                                className="btn btn-outline"
                                                style={{ padding: '6px 12px' }}
                                                title="View Evaluations"
                                            >
                                                <Eye size={16} />
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Ready for Final Decision Section */}
            <div className="card">
                <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px', color: 'var(--primary)' }}>
                    Ready for Final Decision
                </h2>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                    Thesis that have received all evaluations and are ready for your final decision
                </p>

                {readyTheses.length === 0 ? (
                    <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '20px' }}>
                        No thesis ready for final decision
                    </p>
                ) : (
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Student</th>
                                    <th>Registration No</th>
                                    <th>Title</th>
                                    <th>Version</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {readyTheses.map((thesis) => (
                                    <tr key={thesis.id}>
                                        <td>{thesis.first_name} {thesis.last_name}</td>
                                        <td>{thesis.registration_no}</td>
                                        <td>{thesis.title}</td>
                                        <td>v{thesis.version}</td>
                                        <td>
                                            <button
                                                onClick={() => openFinalizeModal(thesis)}
                                                className="btn btn-primary"
                                                style={{ padding: '6px 12px' }}
                                            >
                                                <CheckCircle size={16} />
                                                Finalize
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Assign Examiners Modal */}
            <Modal
                isOpen={isAssignModalOpen}
                onClose={() => {
                    setIsAssignModalOpen(false);
                    setSelectedExaminers([]);
                    setError('');
                }}
                title="Assign Examiners"
            >
                <form onSubmit={handleAssignExaminers}>
                    {error && <div className="error-message">{error}</div>}

                    <p style={{ marginBottom: '20px', color: 'var(--text-secondary)' }}>
                        Thesis: <strong>{selectedThesis?.title}</strong><br />
                        Student: <strong>{selectedThesis?.student_name}</strong><br />
                        <span style={{ fontSize: '12px' }}>Select up to 3 examiners (currently assigned: {selectedThesis?.assigned_examiners || 0})</span>
                    </p>

                    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        {examiners.length === 0 ? (
                            <p style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)' }}>
                                No examiners available in your department
                            </p>
                        ) : (
                            examiners.map((examiner) => (
                                <div
                                    key={examiner.examiner_id}
                                    style={{
                                        padding: '12px',
                                        border: '2px solid var(--border)',
                                        borderRadius: '8px',
                                        marginBottom: '12px',
                                        cursor: 'pointer',
                                        background: selectedExaminers.includes(examiner.examiner_id)
                                            ? 'rgba(177, 18, 38, 0.1)'
                                            : 'var(--surface)',
                                        borderColor: selectedExaminers.includes(examiner.examiner_id)
                                            ? 'var(--primary)'
                                            : 'var(--border)'
                                    }}
                                    onClick={() => handleExaminerToggle(examiner.examiner_id)}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <strong>{examiner.first_name} {examiner.last_name}</strong>
                                            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
                                                {examiner.designation} - {examiner.department}
                                            </p>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={selectedExaminers.includes(examiner.examiner_id)}
                                            onChange={() => { }}
                                            style={{ width: '20px', height: '20px' }}
                                        />
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <p style={{ marginTop: '16px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                        Selected: {selectedExaminers.length} examiner(s)
                    </p>

                    <div className="modal-footer">
                        <button type="button" onClick={() => setIsAssignModalOpen(false)} className="btn btn-outline">
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={selectedExaminers.length === 0}>
                            Assign Examiner{selectedExaminers.length !== 1 ? 's' : ''}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* View Evaluations Modal */}
            <Modal
                isOpen={isEvaluationsModalOpen}
                onClose={() => {
                    setIsEvaluationsModalOpen(false);
                    setEvaluations([]);
                }}
                title="Thesis Evaluations"
            >
                <div>
                    <p style={{ marginBottom: '20px', color: 'var(--text-secondary)' }}>
                        Thesis: <strong>{selectedThesis?.title}</strong>
                    </p>

                    {evaluations.length === 0 ? (
                        <p style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)' }}>
                            No evaluations yet
                        </p>
                    ) : (
                        evaluations.map((evaluation, index) => (
                            <div
                                key={index}
                                style={{
                                    border: '2px solid var(--border)',
                                    borderRadius: '12px',
                                    padding: '16px',
                                    marginBottom: '16px'
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                    <strong style={{ color: 'var(--primary)' }}>{evaluation.examiner_name}</strong>
                                    <span className="badge badge-active">{evaluation.grade}</span>
                                </div>
                                <p style={{ fontSize: '14px', color: 'var(--text)', marginBottom: '8px' }}>
                                    <strong>Remarks:</strong>
                                </p>
                                <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                                    {evaluation.remarks || 'No remarks provided'}
                                </p>
                                <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '8px' }}>
                                    Evaluated on: {new Date(evaluation.created_at).toLocaleDateString()}
                                </p>
                            </div>
                        ))
                    )}

                    <div className="modal-footer">
                        <button
                            onClick={() => setIsEvaluationsModalOpen(false)}
                            className="btn btn-primary"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Finalize Decision Modal */}
            <Modal
                isOpen={isFinalizeModalOpen}
                onClose={() => {
                    setIsFinalizeModalOpen(false);
                    setFinalDecision({ status: '', remarks: '' });
                    setError('');
                }}
                title="Finalize Thesis Decision"
            >
                <form onSubmit={handleFinalize}>
                    {error && <div className="error-message">{error}</div>}

                    <p style={{ marginBottom: '20px', color: 'var(--text-secondary)' }}>
                        Student: <strong>{selectedThesis?.first_name} {selectedThesis?.last_name}</strong><br />
                        Thesis: <strong>{selectedThesis?.title}</strong>
                    </p>

                    <div className="input-group">
                        <label>Final Decision *</label>
                        <select
                            value={finalDecision.status}
                            onChange={(e) => setFinalDecision({ ...finalDecision, status: e.target.value })}
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
                            value={finalDecision.remarks}
                            onChange={(e) => setFinalDecision({ ...finalDecision, remarks: e.target.value })}
                            placeholder="Add any comments or feedback..."
                            rows={4}
                        />
                    </div>

                    <div className="modal-footer">
                        <button type="button" onClick={() => setIsFinalizeModalOpen(false)} className="btn btn-outline">
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className={`btn ${finalDecision.status === 'Approved' ? 'btn-success' : 'btn-danger'}`}
                        >
                            {finalDecision.status === 'Approved' ? <CheckCircle size={16} /> : <XCircle size={16} />}
                            {finalDecision.status === 'Approved' ? 'Approve' : 'Reject'} Thesis
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Thesis;