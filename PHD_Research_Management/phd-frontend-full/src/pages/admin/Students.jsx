import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Loading from '../../components/Loading';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await api.get('/api/admin/students');
      setStudents(response.data);
    } catch (err) {
      setError('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div>
      <div className="mb-3">
        <h1 style={{ fontSize: '28px', fontWeight: '700', color: 'var(--primary)' }}>
          Students
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>View all registered students</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Registration No</th>
              <th>Department</th>
              <th>Supervisor</th>
              <th>Research Area</th>
              <th>Enrollment Date</th>
            </tr>
          </thead>
          <tbody>
            {students.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                  No students registered yet
                </td>
              </tr>
            ) : (
              students.map((student) => (
                <tr key={student.id}>
                  <td>{student.first_name} {student.last_name}</td>
                  <td>{student.email}</td>
                  <td>{student.registration_no}</td>
                  <td>{student.department_name}</td>
                  <td>{student.supervisor || 'Not Assigned'}</td>
                  <td>{student.research_area || '-'}</td>
                  <td>
                    {student.enrollment_date 
                      ? new Date(student.enrollment_date).toLocaleDateString() 
                      : '-'}
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

export default Students;