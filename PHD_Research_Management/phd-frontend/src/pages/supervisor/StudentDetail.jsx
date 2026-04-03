import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, TrendingUp, BookOpen, GraduationCap, Download, CheckCircle, XCircle } from 'lucide-react';
import api from '../../services/api';
import Loading from '../../components/Loading';
import Modal from '../../components/Modal';

const tabs = [
  { key: 'proposals', label: 'Proposals', icon: FileText },
  { key: 'reports', label: 'Progress Reports', icon: TrendingUp },
  { key: 'publications', label: 'Publications', icon: BookOpen },
  { key: 'thesis', label: 'Thesis', icon: GraduationCap },
];

const getStatusBadge = (status) => {
  const badges = {
    'Pending': 'badge-inactive',
    'Approved': 'badge-active',
    'Rejected': 'badge-error',
    'Under_Examination': 'badge-warning',
    'Approved_Final': 'badge-active'
  };
  return badges[status] || 'badge-inactive';
};

const handleDownload = (filePath) => {
  window.open(`http://localhost:5000/${filePath}`, '_blank');
};

const SupervisorStudentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('proposals');
  const [isDecisionModalOpen, setIsDecisionModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [decisionType, setDecisionType] = useState(''); // 'proposal' | 'report' | 'thesis'
  const [decision, setDecision] = useState({ status: '', remarks: '' });
  const [decisionError, setDecisionError] = useState('');
  const [decisionSuccess, setDecisionSuccess] = useState('');

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await api.get(`/api/supervisor/my-students/${id}`);
        setData(res.data);
      } catch (err) {
        setError('Failed to load student data');
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  const openDecisionModal = (item, type) => {
    setSelectedItem(item);
    setDecisionType(type);
    setDecision({ status: '', remarks: '' });
    setDecisionError('');
    setDecisionSuccess('');
    setIsDecisionModalOpen(true);
  };

  const handleDecision = async (e) => {
    e.preventDefault();
    setDecisionError('');
    setDecisionSuccess('');

    if (!decision.status) {
      setDecisionError('Please select a decision');
      return;
    }

    try {
      const endpoints = {
        proposal: `/api/supervisor/proposals/${selectedItem.proposal_id}/decision`,
        report: `/api/supervisor/progress-reports/${selectedItem.report_id}/decision`,
        thesis: `/api/supervisor/thesis/${selectedItem.thesis_id}/decision`,
      };

      await api.put(endpoints[decisionType], {
        status: decision.status,
        remarks: decision.remarks
      });

      setDecisionSuccess(`${decisionType} ${decision.status.toLowerCase()} successfully`);
      setIsDecisionModalOpen(false);

      // Refresh data
      const res = await api.get(`/api/supervisor/my-students/${id}`);
      setData(res.data);
    } catch (err) {
      setDecisionError(err.response?.data?.message || 'Failed to submit decision');
    }
  };

  if (loading) return <Loading />;
  if (error) return <div className="error-message">{error}</div>;

  const { student, proposals, reports, publications, thesis } = data;

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
        <button
          onClick={() => navigate('/supervisor/students')}
          className="btn btn-outline"
          style={{ padding: '8px 12px' }}
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: 'var(--primary)' }}>
            {student.first_name} {student.last_name}
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            {student.registration_no} · {student.research_area || 'No research area set'}
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '24px' }}>

        {/* Left Tab Navigation */}
        <div style={{
          width: '200px', flexShrink: 0,
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          padding: '8px',
          height: 'fit-content'
        }}>
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center',
                gap: '10px', padding: '12px 14px', borderRadius: '8px',
                border: 'none', cursor: 'pointer', textAlign: 'left',
                fontSize: '14px', fontWeight: activeTab === tab.key ? '600' : '400',
                background: activeTab === tab.key ? 'var(--primary)' : 'transparent',
                color: activeTab === tab.key ? 'white' : 'var(--text-primary)',
                marginBottom: '4px', transition: 'all 0.2s'
              }}
            >
              <tab.icon size={17} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Right Content Panel */}
        <div style={{ flex: 1 }}>

          {/* PROPOSALS TAB */}
          {activeTab === 'proposals' && (
            <div className="table-container">
              <h2 style={{ fontSize: '18px', fontWeight: '600', padding: '16px 16px 0', color: 'var(--primary)' }}>
                Proposals
              </h2>
              <table>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Submitted</th>
                    <th>Status</th>
                    <th>File</th>
                  </tr>
                </thead>
                <tbody>
                  {proposals.length === 0 ? (
                    <tr><td colSpan="4" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>No proposals submitted yet</td></tr>
                  ) : proposals.map((p) => (
                    <tr key={p.proposal_id}>
                      <td>{p.title}</td>
                      <td>{new Date(p.submitted_at).toLocaleDateString()}</td>
                      <td><span className={`badge ${getStatusBadge(p.status)}`}>{p.status}</span></td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          {p.file_path && (
                            <button onClick={() => handleDownload(p.file_path)} className="btn btn-outline" style={{ padding: '6px 10px' }}>
                              <Download size={15} />
                            </button>
                          )}
                          {p.status === 'Pending' && (
                            <button onClick={() => openDecisionModal(p, 'proposal')} className="btn btn-primary" style={{ padding: '6px 12px' }}>
                              Decide
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* PROGRESS REPORTS TAB */}
          {activeTab === 'reports' && (
            <div className="table-container">
              <h2 style={{ fontSize: '18px', fontWeight: '600', padding: '16px 16px 0', color: 'var(--primary)' }}>
                Progress Reports
              </h2>
              <table>
                <thead>
                  <tr>
                    <th>Semester</th>
                    <th>Submitted</th>
                    <th>Status</th>
                    <th>File</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.length === 0 ? (
                    <tr><td colSpan="4" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>No progress reports submitted yet</td></tr>
                  ) : reports.map((r) => (
                    <tr key={r.report_id}>
                      <td>{r.semester}</td>
                      <td>{new Date(r.submitted_at).toLocaleDateString()}</td>
                      <td><span className={`badge ${getStatusBadge(r.status)}`}>{r.status}</span></td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          {r.file_path && (
                            <button onClick={() => handleDownload(r.file_path)} className="btn btn-outline" style={{ padding: '6px 10px' }}>
                              <Download size={15} />
                            </button>
                          )}
                          {r.status === 'Pending' && (
                            <button onClick={() => openDecisionModal(r, 'report')} className="btn btn-primary" style={{ padding: '6px 12px' }}>
                              Decide
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* PUBLICATIONS TAB */}
          {activeTab === 'publications' && (
            <div className="table-container">
              <h2 style={{ fontSize: '18px', fontWeight: '600', padding: '16px 16px 0', color: 'var(--primary)' }}>
                Publications
              </h2>
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
                    <tr><td colSpan="4" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>No publications added yet</td></tr>
                  ) : publications.map((p) => (
                    <tr key={p.publication_id}>
                      <td>{p.title}</td>
                      <td>{p.journal_name || '-'}</td>
                      <td>{p.year}</td>
                      <td><span className={`badge ${p.type === 'Journal' ? 'badge-active' : 'badge-inactive'}`}>{p.type}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* THESIS TAB */}
          {activeTab === 'thesis' && (
            <div className="card">
              <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px', color: 'var(--primary)' }}>
                Thesis
              </h2>
              {!thesis ? (
                <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '40px 0' }}>
                  No thesis submitted yet
                </p>
              ) : (
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>{thesis.title}</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px', marginBottom: '20px' }}>
                    <div>
                      <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Status</p>
                      <span className={`badge ${getStatusBadge(thesis.status)}`}>
                        {thesis.status?.replace('_', ' ')}
                      </span>
                    </div>
                    <div>
                      <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Version</p>
                      <p style={{ fontWeight: '600' }}>v{thesis.version}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Submitted</p>
                      <p style={{ fontWeight: '600' }}>{new Date(thesis.submitted_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    {thesis.file_path && (
                      <button onClick={() => handleDownload(thesis.file_path)} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Download size={16} /> Download Thesis
                      </button>
                    )}
                    {thesis.status === 'Pending' && (
                      <button onClick={() => openDecisionModal(thesis, 'thesis')} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        Decide
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    {/* Decision Modal */}
      <Modal
        isOpen={isDecisionModalOpen}
        onClose={() => {
          setIsDecisionModalOpen(false);
          setDecisionError('');
        }}
        title={`Review ${decisionType.charAt(0).toUpperCase() + decisionType.slice(1)}`}
      >
        <form onSubmit={handleDecision}>
          {decisionError && <div className="error-message">{decisionError}</div>}
          {decisionSuccess && <div className="success-message">{decisionSuccess}</div>}

          <p style={{ marginBottom: '20px', color: 'var(--text-secondary)' }}>
            <strong>Student:</strong> {student.first_name} {student.last_name}<br />
            <strong>Item:</strong> {selectedItem?.title || selectedItem?.semester || 'Thesis'}
          </p>

          <div className="input-group">
            <label>Decision *</label>
            <select
              value={decision.status}
              onChange={(e) => setDecision({ ...decision, status: e.target.value })}
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
              onChange={(e) => setDecision({ ...decision, remarks: e.target.value })}
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

export default SupervisorStudentDetail;