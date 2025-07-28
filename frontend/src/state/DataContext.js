import React, { createContext, useCallback, useContext, useState } from 'react';

const DataContext = createContext();

export function DataProvider({ children }) {
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchItems = useCallback(
    async ({ page = 1, q = '', signal } = {}) => {
      setLoading(true);

      const params = new URLSearchParams({
        limit: 20,
        page,
        q,
      });

      const res = await fetch(`http://localhost:4001/api/items?${params}`, { signal });
      const json = await res.json();

      setItems(json.items);
      setPagination({ page: json.page, totalPages: json.totalPages });
      setSearch(json.q);
      setLoading(false);
    },
    []
  );

  return (
    <DataContext.Provider
      value={{ items, fetchItems, pagination, search, loading }}
    >
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => useContext(DataContext);
