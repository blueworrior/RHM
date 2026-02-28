import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Loading from '../../components/Loading';

const CoordinatorSupervisors = () => {
  const [supervisors, setSupervisors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSupervisors();
  }, []);

  const fetchSupervisors = async () => {
    try {
      const response = await api.get('/api/coordinator/my-supervisors');
      setSupervisors(response.data);
    } catch (err) {
      setError('Failed to load supervisors');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div>
      <div className="mb-3">
        <h1 style={{ fontSize: '28px', fontWeight: '700', color: 'var(--primary)' }}>
          Department Supervisors
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          View supervisors in your department
        </p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Designation</th>
              <th>Expertise</th>
            </tr>
          </thead>
          <tbody>
            {supervisors.length === 0 ? (
              <tr>
                <td colSpan="3" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                  No supervisors in your department yet
                </td>
              </tr>
            ) : (
              supervisors.map((supervisor) => (
                <tr key={supervisor.supervisor_id}>
                  <td>{supervisor.first_name} {supervisor.last_name}</td>
                  <td>{supervisor.designation}</td>
                  <td>{supervisor.expertise}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CoordinatorSupervisors;