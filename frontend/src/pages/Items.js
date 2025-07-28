import React, { useEffect, useCallback } from 'react';
import { FixedSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { Link } from 'react-router-dom';
import { useData } from '../state/DataContext';

function Items() {
  const {
    items,
    fetchItems,
    pagination: { page, totalPages },
    search,
    loading,
  } = useData();

  useEffect(() => {
    const controller = new AbortController();
    fetchItems({ page, q: search, signal: controller.signal }).catch(err => {
      if (err.name !== 'AbortError') console.error(err);
    });
    return () => controller.abort();
  }, [page, search, fetchItems]);

  /* Handlers */
  const handlePage   = useCallback(
    next => fetchItems({ page: next, q: search }).catch(console.error),
    [fetchItems, search],
  );
  const handleSearch = e => {
    e.preventDefault();
    const q = new FormData(e.target).get('q');
    fetchItems({ page: 1, q }).catch(console.error);
  };

  /* Row renderer for react-window */
  const Row = ({ index, style }) => {
    const item = items[index];
    return (
      <div style={{ ...style, display: 'flex', alignItems: 'center' }}>
        <Link to={`/items/${item.id}`}>{item.name}</Link>
      </div>
    );
  };

  /* UI */
  if (loading && !items.length) return <p>Loading…</p>;

  return (
    <>
      {/* Search bar */}
      <form onSubmit={handleSearch}>
        <input name="q" defaultValue={search} placeholder="Search…" />
        <button type="submit">🔍</button>
      </form>

      {/* Virtualised list */}
      <div style={{ height: '70vh', marginTop: 8 }}>
        {items.length ? (
          <AutoSizer>
            {({ height, width }) => (
              <List
                height={height}
                width={width}
                itemCount={items.length}
                itemSize={44}          /* px-tall rows; tweak to taste */
              >
                {Row}
              </List>
            )}
          </AutoSizer>
        ) : (
          <p>No results found.</p>
        )}
      </div>

      {/* Pagination controls */}
      {!!items.length && (
        <nav style={{ marginTop: 8 }}>
          <button
            onClick={() => handlePage(page - 1)}
            disabled={page <= 1 || loading}
          >
            ← Prev
          </button>
          <span style={{ margin: '0 1rem' }}>
            Page {page} / {totalPages}
          </span>
          <button
            onClick={() => handlePage(page + 1)}
            disabled={page >= totalPages || loading}
          >
            Next →
          </button>
        </nav>
      )}
    </>
  );
}

export default Items;
