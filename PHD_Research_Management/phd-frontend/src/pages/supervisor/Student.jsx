import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, ChevronRight } from 'lucide-react';
import api from '../../services/api';
import Loading from '../../components/Loading';

const SupervisorStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await api.get('/api/supervisor/my-students');
        setStudents(res.data);
      } catch (err) {
        setError('Failed to load students');
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  if (loading) return <Loading />;

  return (
    <div>
      <div className="mb-3">
        <h1 style={{ fontSize: '28px', fontWeight: '700', color: 'var(--primary)' }}>
          My Students
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Students assigned to you
        </p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Registration No</th>
              <th>Research Area</th>
              <th>Enrollment Date</th>
              <th>View</th>
            </tr>
          </thead>
          <tbody>
            {students.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                  No students assigned to you yet
                </td>
              </tr>
            ) : (
              students.map((s) => (
                <tr key={s.student_id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '36px', height: '36px', borderRadius: '50%',
                        background: 'var(--primary)', display: 'flex',
                        alignItems: 'center', justifyContent: 'center'
                      }}>
                        <GraduationCap size={18} color="white" />
                      </div>
                      {s.first_name} {s.last_name}
                    </div>
                  </td>
                  <td>{s.email}</td>
                  <td>{s.registration_no}</td>
                  <td>{s.research_area || '-'}</td>
                  <td>{s.enrollment_date ? new Date(s.enrollment_date).toLocaleDateString() : '-'}</td>
                  <td>
                    <button
                      onClick={() => navigate(`/supervisor/students/${s.student_id}`)}
                      className="btn btn-outline"
                      style={{ padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      View <ChevronRight size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SupervisorStudents;