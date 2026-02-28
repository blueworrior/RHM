import React, { useState } from 'react';
import { X, Search, SortAsc, SortDesc, Filter } from 'lucide-react';

const TableFilter = ({ 
  isOpen, 
  onClose, 
  columnName, 
  onSort, 
  onSearch,
  searchPlaceholder = "Search...",
  filters = [],
  onFilterChange,
  currentFilters = {}
}) => {
  const [searchValue, setSearchValue] = useState('');

  const handleSearch = () => {
    onSearch(searchValue);
    setSearchValue('');
  };

  const handleSortAsc = () => {
    onSort('asc');
    onClose();
  };

  const handleSortDesc = () => {
    onSort('desc');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          zIndex: 999
        }}
        onClick={onClose}
      />

      {/* Filter Modal */}
      <div style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        background: 'var(--card-bg)',
        borderRadius: '12px',
        padding: '24px',
        width: '90%',
        maxWidth: '400px',
        maxHeight: '80vh',
        overflowY: 'auto',
        boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
        zIndex: 1000,
        border: '2px solid var(--border)'
      }}>
        {/* Header */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <h3 style={{ 
            fontSize: '18px', 
            fontWeight: '600', 
            color: 'var(--primary)',
            margin: 0
          }}>
            Filter: {columnName}
          </h3>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              color: 'var(--text-secondary)'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Sort Section */}
        <div style={{ marginBottom: '20px' }}>
          <p style={{ 
            fontSize: '14px', 
            fontWeight: '600', 
            marginBottom: '12px',
            color: 'var(--text)'
          }}>
            Sort
          </p>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handleSortAsc}
              className="btn btn-outline"
              style={{ flex: 1, justifyContent: 'center' }}
            >
              <SortAsc size={16} />
              Ascending
            </button>
            <button
              onClick={handleSortDesc}
              className="btn btn-outline"
              style={{ flex: 1, justifyContent: 'center' }}
            >
              <SortDesc size={16} />
              Descending
            </button>
          </div>
        </div>

        {/* Search Section */}
        {onSearch && (
          <div style={{ marginBottom: '20px' }}>
            <p style={{ 
              fontSize: '14px', 
              fontWeight: '600', 
              marginBottom: '12px',
              color: 'var(--text)'
            }}>
              Search
            </p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder={searchPlaceholder}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  border: '2px solid var(--border)',
                  borderRadius: '8px',
                  background: 'var(--surface)',
                  color: 'var(--text)',
                  fontSize: '14px'
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') handleSearch();
                }}
              />
              <button
                onClick={handleSearch}
                className="btn btn-primary"
                style={{ padding: '8px 16px' }}
              >
                <Search size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Advanced Filters */}
        {filters.length > 0 && (
          <div>
            <p style={{ 
              fontSize: '14px', 
              fontWeight: '600', 
              marginBottom: '12px',
              color: 'var(--text)'
            }}>
              Filters
            </p>
            {filters.map((filter, index) => (
              <div key={index} style={{ marginBottom: '12px' }}>
                <label style={{ 
                  fontSize: '13px', 
                  color: 'var(--text-secondary)',
                  display: 'block',
                  marginBottom: '6px'
                }}>
                  {filter.label}
                </label>
                {filter.type === 'select' ? (
                  <select
                    value={currentFilters[filter.key] || ''}
                    onChange={(e) => onFilterChange(filter.key, e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '2px solid var(--border)',
                      borderRadius: '8px',
                      background: 'var(--surface)',
                      color: 'var(--text)',
                      fontSize: '14px'
                    }}
                  >
                    <option value="">All</option>
                    {filter.options.map((option, i) => (
                      <option key={i} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : filter.type === 'date' ? (
                  <input
                    type="date"
                    value={currentFilters[filter.key] || ''}
                    onChange={(e) => onFilterChange(filter.key, e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '2px solid var(--border)',
                      borderRadius: '8px',
                      background: 'var(--surface)',
                      color: 'var(--text)',
                      fontSize: '14px'
                    }}
                  />
                ) : (
                  <input
                    type="text"
                    value={currentFilters[filter.key] || ''}
                    onChange={(e) => onFilterChange(filter.key, e.target.value)}
                    placeholder={filter.placeholder}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '2px solid var(--border)',
                      borderRadius: '8px',
                      background: 'var(--surface)',
                      color: 'var(--text)',
                      fontSize: '14px'
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        )}

      </div>
    </>
  );
};

export default TableFilter;