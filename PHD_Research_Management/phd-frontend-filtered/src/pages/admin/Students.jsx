import React, { useState, useEffect } from 'react';
import { Filter } from 'lucide-react';
import api from '../../services/api';
import Loading from '../../components/Loading';
import TableFilter from '../../components/TableFilter';
import useTableFilter from '../../hooks/useTableFilter';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // FILTER HOOK
  const {
    filteredData: filteredStudents,
    handleSort,
    handleSearch,
    handleFilterChange,
    filters,
    sortConfig,
    resetFilters
  } = useTableFilter(students, ['first_name', 'last_name', 'email', 'registration_no', 'department_name', 'supervisor']);

  // FILTER MODAL STATE
  const [filterModal, setFilterModal] = useState({
    isOpen: false,
    columnKey: '',
    columnName: ''
  });

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

  const openFilterModal = (columnKey, columnName) => {
    setFilterModal({
      isOpen: true,
      columnKey,
      columnName
    });
  };

  const closeFilterModal = () => {
    setFilterModal({
      isOpen: false,
      columnKey: '',
      columnName: ''
    });
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
      {success && <div className="success-message">{success}</div>}

      {/* Clear Filters Banner */}
      {(Object.keys(filters).some(key => filters[key]) || sortConfig.key) && (
        <div style={{
          marginBottom: '16px',
          padding: '12px 16px',
          background: 'rgba(177, 18, 38, 0.1)',
          border: '2px solid var(--primary)',
          borderRadius: '8px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <p style={{ fontSize: '14px', fontWeight: '600', color: 'var(--primary)', margin: 0 }}>
              Filters Active
            </p>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
              {Object.keys(filters).filter(key => filters[key]).length} filter(s) applied
              {sortConfig.key && ` • Sorted by ${sortConfig.key}`}
            </p>
          </div>
          <button
            onClick={() => {
              resetFilters();
              setSuccess('All filters cleared');
              setTimeout(() => setSuccess(''), 3000);
            }}
            className="btn btn-outline"
            style={{ padding: '8px 16px' }}
          >
            Clear All Filters
          </button>
        </div>
      )}

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
                  onClick={() => openFilterModal('first_name', 'Name')}>
                  Name
                  <Filter size={14} style={{ color: 'var(--text-secondary)' }} />
                </div>
              </th>
              <th>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
                  onClick={() => openFilterModal('email', 'Email')}>
                  Email
                  <Filter size={14} style={{ color: 'var(--text-secondary)' }} />
                </div>
              </th>
              <th>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
                  onClick={() => openFilterModal('registration_no', 'Registration No')}>
                  Registration No
                  <Filter size={14} style={{ color: 'var(--text-secondary)' }} />
                </div>
              </th>
              <th>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
                  onClick={() => openFilterModal('department_name', 'Department')}>
                  Department
                  <Filter size={14} style={{ color: 'var(--text-secondary)' }} />
                </div>
              </th>
              <th>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
                  onClick={() => openFilterModal('supervisor', 'Supervisor')}>
                  Supervisor
                  <Filter size={14} style={{ color: 'var(--text-secondary)' }} />
                </div>
              </th>
              <th>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
                  onClick={() => openFilterModal('research_area', 'Research Area')}>
                  Research Area
                  <Filter size={14} style={{ color: 'var(--text-secondary)' }} />
                </div>
              </th>
              <th>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
                  onClick={() => openFilterModal('enrollment_date', 'Enrollment Date')}>
                  Enrollment Date
                  <Filter size={14} style={{ color: 'var(--text-secondary)' }} />
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                  No students found
                </td>
              </tr>
            ) : (
              filteredStudents.map((student) => (
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

      {/* Table Filter Modal */}
      <TableFilter
        isOpen={filterModal.isOpen}
        onClose={closeFilterModal}
        columnName={filterModal.columnName}
        onSort={(direction) => handleSort(filterModal.columnKey, direction)}
        onSearch={handleSearch}
        searchPlaceholder={`Search ${filterModal.columnName.toLowerCase()}...`}
        filters={[]}
        onFilterChange={handleFilterChange}
        currentFilters={filters}
      />
    </div>
  );
};

export default Students;