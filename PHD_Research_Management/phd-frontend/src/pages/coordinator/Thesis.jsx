import React, { useState, useEffect } from 'react';
import { UserPlus, Eye, CheckCircle, XCircle, Download } from 'lucide-react';
import api from '../../services/api';
import Modal from '../../components/Modal';
import Loading from '../../components/Loading';

const Thesis = () => {
    const [approvedTheses, setApprovedTheses] = useState([]);
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
    const [assignedExaminerIds, setAssignedExaminerIds] = useState([]); // ✅ Track already assigned
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
                api.get('/api/coordinator/thesis/approved'),
                api.get('/api/coordinator/thesis/evaluated'),
                api.get('/api/coordinator/thesis/ready'),
                api.get('/api/coordinator/examiners')
            ]);
            setApprovedTheses(approvedRes.data || []);
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

    const handleDownload = (filePath) => {
        if (!filePath) {
            setError('File not available');
            return;
        }
        const downloadUrl = `http://localhost:5000/${filePath}`;
        window.open(downloadUrl, '_blank');
    };

    // ✅ Get already assigned examiners when opening modal
    const openAssignModal = async (thesis) => {
        setSelectedThesis(thesis);
        setSelectedExaminers([]);
        setError('');

        // ✅ Fetch already assigned examiners for this thesis
        try {
            const response = await api.get(`/api/coordinator/thesis/${thesis.thesis_id}/assigned-examiners`);
            setAssignedExaminerIds(response.data.map(e => e.examiner_id));
        } catch (err) {
            setAssignedExaminerIds([]);
        }

        setIsAssignModalOpen(true);
    };

    const handleExaminerToggle = (examinerId) => {
        setError('');

        // ✅ Check if already assigned
        if (assignedExaminerIds.includes(examinerId)) {
            setError('This examiner is already assigned to this thesis');
            return;
        }

        if (selectedExaminers.includes(examinerId)) {
            setSelectedExaminers(selectedExaminers.filter(id => id !== examinerId));
        } else {
            // ✅ Calculate total: already assigned + newly selected
            const totalCount = assignedExaminerIds.length + selectedExaminers.length + 1;

            if (totalCount > 3) {
                setError('Maximum 3 examiners allowed (including already assigned)');
                return;
            }
            setSelectedExaminers([...selectedExaminers, examinerId]);
        }
    };

    const handleAssignExaminers = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // ✅ Validation: Must select 2-3 examiners total
        const totalSelected = selectedExaminers.length;
        const alreadyAssigned = assignedExaminerIds.length;
        const totalCount = alreadyAssigned + totalSelected;

        if (totalSelected === 0) {
            setError('Please select at least one examiner');
            return;
        }

        // ✅ Check minimum requirement (2 total)
        if (totalCount < 2) {
            setError(`You must assign at least 2 examiners. Currently ${alreadyAssigned} assigned, select ${2 - alreadyAssigned} more.`);
            return;
        }

        try {
            // ✅ Assign each selected examiner
            const assignPromises = selectedExaminers.map(examinerId =>
                api.post('/api/coordinator/assign-examiner', {
                    thesis_id: selectedThesis.thesis_id,
                    examiner_id: examinerId
                })
            );

            await Promise.all(assignPromises);

            setSuccess(`${totalSelected} examiner(s) assigned successfully (Total: ${totalCount})`);
            setIsAssignModalOpen(false);
            setSelectedExaminers([]);
            setAssignedExaminerIds([]);
            fetchData();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to assign examiners');
        }
    };

    const openFinalizeModal = (thesis) => {
        setSelectedThesis(thesis);
        setFinalDecision({ status: '', remarks: '' });
        setError('');
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

            {/* Approved Thesis Section */}
            <div className="card" style={{ marginBottom: '32px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px', color: 'var(--primary)' }}>
                    Approved Thesis - Assign Examiners
                </h2>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                    Assign 2-3 examiners to each thesis (minimum 2 required)
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
                                            >
                                                <UserPlus size={16} />
                                                Assign Examiners
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Under Examination Section */}
            <div className="card" style={{ marginBottom: '32px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px', color: 'var(--primary)' }}>
                    Under Examination
                </h2>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                    Thesis currently being evaluated by examiners
                </p>

                {evaluatedTheses.length === 0 ? (
                    <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '20px' }}>
                        No thesis under examination
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
                                        <td>
                                            <span className={`badge ${thesis.total_evaluations >= 2 ? 'badge-active' : 'badge-inactive'}`}>
                                                {thesis.total_evaluations} / {thesis.total_assigned_examiners || 0}
                                            </span>
                                        </td>
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
                    Thesis ready for final decision and successfully approved thesis
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
                                                <button
                                                    onClick={() => handleViewEvaluations({ thesis_id: thesis.id, title: thesis.title })}
                                                    className="btn btn-outline"
                                                    style={{ padding: '6px 12px' }}
                                                >
                                                    <Eye size={16} />
                                                    View Evaluations
                                                </button>
                                                <button
                                                    onClick={() => openFinalizeModal(thesis)}
                                                    className={`btn ${thesis.status === 'Approved_Final' ? 'btn-success' : 'btn-danger'}`}
                                                    style={{ padding: '6px 12px' }}
                                                    disabled={thesis.status === 'Approved_Final' ? true : false}
                                                >
                                                    <CheckCircle size={16} />
                                                    {thesis.status === 'Approved_Final' ? 'Finalized' : 'Finalize'}
                                                </button>
                                            </div>
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
                    setAssignedExaminerIds([]);
                    setError('');
                }}
                title="Assign Examiners"
            >
                <form onSubmit={handleAssignExaminers}>
                    {error && <div className="error-message">{error}</div>}

                    <p style={{ marginBottom: '20px', color: 'var(--text-secondary)' }}>
                        <strong>Thesis:</strong> {selectedThesis?.title}<br />
                        <strong>Student:</strong> {selectedThesis?.student_name}<br />
                        <strong>Already Assigned:</strong> {assignedExaminerIds.length} examiner(s)<br />
                        <span style={{ fontSize: '12px', color: 'var(--primary)' }}>
                            Select {2 - assignedExaminerIds.length} to {3 - assignedExaminerIds.length} more examiner(s) (Total needed: 2-3)
                        </span>
                    </p>

                    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        {examiners.length === 0 ? (
                            <p style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)' }}>
                                No examiners available in your department
                            </p>
                        ) : (
                            examiners.map((examiner) => {
                                const isAssigned = assignedExaminerIds.includes(examiner.examiner_id);
                                const isSelected = selectedExaminers.includes(examiner.examiner_id);

                                return (
                                    <div
                                        key={examiner.examiner_id}
                                        style={{
                                            padding: '12px',
                                            border: '2px solid var(--border)',
                                            borderRadius: '8px',
                                            marginBottom: '12px',
                                            cursor: isAssigned ? 'not-allowed' : 'pointer',
                                            background: isAssigned
                                                ? 'rgba(128, 128, 128, 0.1)'
                                                : isSelected
                                                    ? 'rgba(177, 18, 38, 0.1)'
                                                    : 'var(--surface)',
                                            borderColor: isAssigned
                                                ? '#ccc'
                                                : isSelected
                                                    ? 'var(--primary)'
                                                    : 'var(--border)',
                                            opacity: isAssigned ? 0.6 : 1
                                        }}
                                        onClick={() => !isAssigned && handleExaminerToggle(examiner.examiner_id)}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div>
                                                <strong>{examiner.first_name} {examiner.last_name}</strong>
                                                {isAssigned && <span style={{ color: 'var(--success)', fontSize: '12px', marginLeft: '8px' }}>✓ Already Assigned</span>}
                                                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
                                                    {examiner.designation} - {examiner.department}
                                                </p>
                                            </div>
                                            <input
                                                type="checkbox"
                                                checked={isSelected || isAssigned}
                                                disabled={isAssigned}
                                                onChange={() => { }}
                                                style={{ width: '20px', height: '20px' }}
                                            />
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    <p style={{ marginTop: '16px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                        Selected: {selectedExaminers.length} |
                        Total (including assigned): {assignedExaminerIds.length + selectedExaminers.length} / 3
                    </p>

                    <div className="modal-footer">
                        <button type="button" onClick={() => setIsAssignModalOpen(false)} className="btn btn-outline">
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={selectedExaminers.length === 0}
                        >
                            Assign {selectedExaminers.length} Examiner{selectedExaminers.length !== 1 ? 's' : ''}
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
                        <strong>Thesis:</strong> {selectedThesis?.title}
                    </p>

                    {evaluations.length === 0 ? (
                        <p style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)' }}>
                            No evaluations received yet
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
                                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '8px' }}>
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
                        <strong>Student:</strong> {selectedThesis?.first_name} {selectedThesis?.last_name}<br />
                        <strong>Thesis:</strong> {selectedThesis?.title}
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