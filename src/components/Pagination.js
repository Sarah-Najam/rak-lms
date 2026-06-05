import React from 'react';

function Pagination({ currentPage, totalItems, itemsPerPage, onPageChange }) {

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  if (totalPages <= 1) return null;

  const getPages = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 4) {
        pages.push(1, 2, 3, 4, 5, '...', totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  const start = (currentPage - 1) * itemsPerPage + 1;
  const end   = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div style={styles.wrap}>
      <div style={styles.info}>
        Showing {start}–{end} of {totalItems}
      </div>
      <div style={styles.controls}>
        <button
          style={{ ...styles.btn, ...(currentPage === 1 ? styles.btnDisabled : {}) }}
          onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          ← Previous
        </button>
        {getPages().map((page, i) =>
          page === '...' ? (
            <span key={'dots' + i} style={styles.dots}>...</span>
          ) : (
            <button
              key={page}
              style={{
                ...styles.btn,
                ...(page === currentPage ? styles.btnActive : {}),
              }}
              onClick={() => onPageChange(page)}
            >
              {page}
            </button>
          )
        )}
        <button
          style={{ ...styles.btn, ...(currentPage === totalPages ? styles.btnDisabled : {}) }}
          onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next →
        </button>
      </div>
    </div>
  );
}

const styles = {
  wrap:        { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', borderTop: '1px solid #e8ecf0', background: '#ffffff', flexWrap: 'wrap', gap: '10px' },
  info:        { fontSize: '13px', color: '#9baabb' },
  controls:    { display: 'flex', gap: '4px', alignItems: 'center' },
  btn:         { padding: '6px 12px', border: '1.5px solid #e8ecf0', borderRadius: '6px', background: '#ffffff', fontSize: '12px', fontWeight: '500', cursor: 'pointer', color: '#051c2c', fontFamily: 'Inter, sans-serif' },
  btnActive:   { background: '#051c2c', color: '#ffffff', borderColor: '#051c2c' },
  btnDisabled: { color: '#d1d5db', cursor: 'not-allowed', borderColor: '#f0f2f4' },
  dots:        { padding: '6px 4px', fontSize: '12px', color: '#9baabb' },
};

export default Pagination;