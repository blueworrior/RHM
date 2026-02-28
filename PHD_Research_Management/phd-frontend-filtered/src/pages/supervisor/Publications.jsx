import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Loading from '../../components/Loading';

const SupervisorPublications = () => {
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPublications();
  }, []);

  const fetchPublications = async () => {
    try {
      const response = await api.get('/api/supervisor/publications');
      setPublications(response.data);
    } catch (err) {
      setError('Failed to load publications');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div>
      <div className="mb-3">
        <h1 style={{ fontSize: '28px', fontWeight: '700', color: 'var(--primary)' }}>
          Student Publications
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          View publications from your students
        </p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Student</th>
              <th>Registration No</th>
              <th>Title</th>
              <th>Journal</th>
              <th>Year</th>
              <th>Type</th>
            </tr>
          </thead>
          <tbody>
            {publications.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                  No publications from your students yet
                </td>
              </tr>
            ) : (
              publications.map((pub) => (
                <tr key={pub.publication_id}>
                  <td>{pub.student_name}</td>
                  <td>{pub.registration_no}</td>
                  <td>{pub.title}</td>
                  <td>{pub.journal_name}</td>
                  <td>{pub.year}</td>
                  <td>
                    <span className={`badge ${pub.type === 'Journal' ? 'badge-active' : 'badge-inactive'}`}>
                      {pub.type}
                    </span>
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

export default SupervisorPublications;