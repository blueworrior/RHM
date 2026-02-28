import { useState, useMemo } from 'react';

const useTableFilter = (data, searchableFields = []) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({});

  // Sort function
  const handleSort = (key, direction) => {
    setSortConfig({ key, direction });
  };

  // Search function
  const handleSearch = (term) => {
    setSearchTerm(term.toLowerCase());
  };

  // Filter function
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Apply all filters
  const filteredData = useMemo(() => {
    let filtered = [...data];

    // Apply search
    if (searchTerm && searchableFields.length > 0) {
      filtered = filtered.filter(item => {
        return searchableFields.some(field => {
          const value = field.split('.').reduce((obj, key) => obj?.[key], item);
          return value?.toString().toLowerCase().includes(searchTerm);
        });
      });
    }

    // Apply custom filters
    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        filtered = filtered.filter(item => {
          const value = key.split('.').reduce((obj, k) => obj?.[k], item);
          return value?.toString().toLowerCase() === filters[key].toLowerCase();
        });
      }
    });

    // Apply sorting
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        const aValue = sortConfig.key.split('.').reduce((obj, key) => obj?.[key], a);
        const bValue = sortConfig.key.split('.').reduce((obj, key) => obj?.[key], b);

        if (aValue === null || aValue === undefined) return 1;
        if (bValue === null || bValue === undefined) return -1;

        if (typeof aValue === 'string') {
          const comparison = aValue.localeCompare(bValue);
          return sortConfig.direction === 'asc' ? comparison : -comparison;
        }

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [data, sortConfig, searchTerm, filters, searchableFields]);

  const resetFilters = () => {
    setSortConfig({ key: null, direction: 'asc' });
    setSearchTerm('');
    setFilters({});
  };

  return {
    filteredData,
    handleSort,
    handleSearch,
    handleFilterChange,
    filters,
    sortConfig,
    searchTerm,
    resetFilters
  };
};

export default useTableFilter;