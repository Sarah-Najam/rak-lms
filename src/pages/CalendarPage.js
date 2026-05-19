// ============================================================
// CalendarPage.js
//
// WHAT THIS PAGE HAS (from the wireframe):
// 1. Year selector — 2024, 2025, 2026
// 2. Quarter selector — Q1, Q2, Q3, Q4 + View All
// 3. Data table — Course, Cost, PR#, PO#, Days, Hours
// 4. Totals row at the bottom
// 5. Add entry button
//
// IMPORTANT: This is a STANDALONE dataset.
// It is NOT connected to the Courses page data.
// It is a separate planning/budgeting tool.
// ============================================================

import React, { useState } from 'react';

// ── STANDALONE CALENDAR DATA ─────────────────────────────────
// WHY DEFINED HERE AND NOT IN sampleData.js?
// The wireframe says this data is independent —
// it does not connect to any other module.
// So it lives here, separate from everything else.
const CALENDAR_DATA = {
  2024: {
    Q1: [],
    Q2: [],
    Q3: [
      { id: 1, course: "IELTS Corporate Training",
        cost: 8000,  pr: "PR-2024-001", po: "PO-2024-001", days: 2, hours: 14 },
    ],
    Q4: [
      { id: 2, course: "Fire Safety & Emergency Response",
        cost: 4500,  pr: "PR-2024-002", po: "PO-2024-002", days: 1, hours: 8  },
      { id: 3, course: "Anti-Money Laundering (AML)",
        cost: 6000,  pr: "PR-2024-003", po: "PO-2024-003", days: 1, hours: 6  },
    ],
  },
  2025: {
    Q1: [
      { id: 4, course: "Real Estate Law & Compliance",
        cost: 15000, pr: "PR-2025-001", po: "PO-2025-001", days: 3, hours: 24 },
      { id: 5, course: "Customer Experience Excellence",
        cost: 12000, pr: "PR-2025-002", po: "PO-2025-002", days: 2, hours: 16 },
    ],
    Q2: [
      { id: 6, course: "Financial Modeling for Real Estate",
        cost: 18000, pr: "PR-2025-003", po: "PO-2025-003", days: 3, hours: 24 },
    ],
    Q3: [],
    Q4: [
      { id: 7, course: "Leadership & Management Skills",
        cost: 22000, pr: "PR-2025-004", po: "",            days: 4, hours: 32 },
    ],
  },
  2026: {
    Q1: [],
    Q2: [],
    Q3: [],
    Q4: [],
  },
};

const Q_LABELS = {
  Q1: 'Q1 — Jan to Mar',
  Q2: 'Q2 — Apr to Jun',
  Q3: 'Q3 — Jul to Sep',
  Q4: 'Q4 — Oct to Dec',
};

function CalendarPage() {

  // ── STATE ──────────────────────────────────────────────────
  const [year,      setYear]      = useState(2025);
  const [quarter,   setQuarter]   = useState('Q1');
  const [showAdd,   setShowAdd]   = useState(false);
  const [calData,   setCalData]   = useState(CALENDAR_DATA);

  const emptyForm = {
    course: '', cost: '', pr: '', po: '', days: '', hours: '',
  };
  const [form, setForm] = useState(emptyForm);

  // ── GET DATA FOR CURRENT VIEW ──────────────────────────────
  // WHY THIS FUNCTION?
  // When quarter is 'ALL' we flatten all 4 quarters into one array.
  // Otherwise we just return the selected quarter's data.
  const getData = () => {
    if (quarter === 'ALL') {
      return ['Q1', 'Q2', 'Q3', 'Q4'].flatMap(q =>
        calData[year][q] || []
      );
    }
    return calData[year][quarter] || [];
  };

  const data = getData();

  // ── TOTALS ─────────────────────────────────────────────────
  const totalCost  = data.reduce((s, r) => s + (+r.cost  || 0), 0);
  const totalHours = data.reduce((s, r) => s + (+r.hours || 0), 0);
  const totalDays  = data.reduce((s, r) => s + (+r.days  || 0), 0);

  // ── SAVE NEW ENTRY ─────────────────────────────────────────
  const handleSave = () => {
    if (!form.course) { alert('Course name is required.'); return; }
    const newEntry = {
      id: Date.now(),
      course: form.course,
      cost:   +form.cost  || 0,
      pr:     form.pr,
      po:     form.po,
      days:   +form.days  || 0,
      hours:  +form.hours || 0,
    };
    // WHY THIS NESTED UPDATE?
    // calData is a nested object: { year: { quarter: [...] } }
    // We need to add the new entry to the correct year + quarter.
    // We use spread operator at each level to create new objects
    // without mutating (directly changing) the original state.
    const targetQ = quarter === 'ALL' ? 'Q1' : quarter;
    setCalData(prev => ({
      ...prev,
      [year]: {
        ...prev[year],
        [targetQ]: [...(prev[year][targetQ] || []), newEntry],
      },
    }));
    setForm(emptyForm);
    setShowAdd(false);
  };

  return (
    <div style={styles.page}>

      {/* ── PAGE TITLE ── */}
      
      <p style={styles.pageSubtitle}>
        Independent planning dataset — separate from the Courses module
      </p>

      {/* ── YEAR SELECTOR ── */}
      <div style={styles.yearRow}>
        {[2024, 2025, 2026].map(y => (
          <button
            key={y}
            style={{
              ...styles.yearBtn,
              ...(year === y ? styles.yearBtnActive : {}),
            }}
            onClick={() => setYear(y)}
          >
            {y}
          </button>
        ))}
      </div>

      {/* ── QUARTER SELECTOR ── */}
      <div style={styles.quarterRow}>
        {['Q1', 'Q2', 'Q3', 'Q4'].map(q => (
          <button
            key={q}
            style={{
              ...styles.qBtn,
              ...(quarter === q ? styles.qBtnActive : {}),
            }}
            onClick={() => setQuarter(q)}
          >
            {Q_LABELS[q]}
          </button>
        ))}
        <button
          style={{
            ...styles.qBtn,
            ...(quarter === 'ALL' ? styles.qBtnActive : {}),
          }}
          onClick={() => setQuarter('ALL')}
        >
          View All {year}
        </button>
      </div>

      {/* ── TABLE HEADER ── */}
      <div style={styles.tableHeader}>
        <span style={styles.tableTitle}>
          {quarter === 'ALL'
            ? `Full Year ${year}`
            : `${Q_LABELS[quarter]} — ${year}`
          }
        </span>
        <button style={styles.addBtn} onClick={() => setShowAdd(true)}>
          + Add Entry
        </button>
      </div>

      {/* ── DATA TABLE ── */}
      <div style={styles.tableWrap}>
        {data.length > 0 ? (
          <table style={styles.table}>
            <thead>
              <tr style={styles.theadRow}>
                {['No.', 'Course', 'Cost (AED)',
                  'Purchase Request #', 'PO #',
                  'Duration (Days)', 'Duration (Hours)'].map(h => (
                  <th key={h} style={styles.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => (
                <tr key={row.id} style={styles.tr}>
                  <td style={styles.td}>{i + 1}</td>
                  <td style={{ ...styles.td, fontWeight: 600 }}>{row.course}</td>
                  <td style={{ ...styles.td, fontWeight: 600 }}>
                    {(+row.cost).toLocaleString()}
                  </td>
                  <td style={styles.monoTd}>{row.pr || '—'}</td>
                  <td style={styles.monoTd}>
                    {row.po
                      ? row.po
                      : <span style={styles.pendingTag}>Pending</span>
                    }
                  </td>
                  <td style={styles.td}>{row.days} day{row.days !== 1 ? 's' : ''}</td>
                  <td style={{ ...styles.td, fontWeight: 600 }}>{row.hours}h</td>
                </tr>
              ))}
            </tbody>
            {/* Totals row */}
            <tfoot>
              <tr style={styles.totalRow}>
                <td style={styles.totalTd} colSpan={2}>
                  Total ({data.length} {data.length === 1 ? 'course' : 'courses'})
                </td>
                <td style={styles.totalTd}>
                  AED {totalCost.toLocaleString()}
                </td>
                <td style={styles.totalTd} colSpan={2} />
                <td style={styles.totalTd}>{totalDays}d</td>
                <td style={styles.totalTd}>{totalHours}h</td>
              </tr>
            </tfoot>
          </table>
        ) : (
          // Empty state
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>📅</div>
            <div style={styles.emptyText}>
              No training planned for this period.
            </div>
            <button style={styles.emptyBtn} onClick={() => setShowAdd(true)}>
              + Add First Entry
            </button>
          </div>
        )}
      </div>

      {/* ── SUMMARY CARDS — only show when data exists ── */}
      {data.length > 0 && (
        <div style={styles.summaryRow}>
          <div style={styles.summaryCard}>
            <div style={styles.summaryLabel}>Total Budget</div>
            <div style={styles.summaryValue}>
              AED {totalCost.toLocaleString()}
            </div>
          </div>
          <div style={styles.summaryCard}>
            <div style={styles.summaryLabel}>Total Training Hours</div>
            <div style={styles.summaryValue}>{totalHours}h</div>
          </div>
          <div style={styles.summaryCard}>
            <div style={styles.summaryLabel}>Total Training Days</div>
            <div style={styles.summaryValue}>{totalDays} days</div>
          </div>
          <div style={styles.summaryCard}>
            <div style={styles.summaryLabel}>No. of Courses</div>
            <div style={styles.summaryValue}>{data.length}</div>
          </div>
        </div>
      )}

      {/* ── ADD ENTRY MODAL ── */}
      {showAdd && (
        <div style={styles.overlay} onClick={() => setShowAdd(false)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>

            <div style={styles.modalHeader}>
              <span style={styles.modalTitle}>Add Calendar Entry</span>
              <button style={styles.modalClose}
                onClick={() => setShowAdd(false)}>×</button>
            </div>

            <div style={styles.modalBody}>

              {/* Which year/quarter this entry goes into */}
              <div style={styles.entryMeta}>
                Adding to: <strong>{year} — {quarter === 'ALL' ? 'Q1' : Q_LABELS[quarter]}</strong>
              </div>

              <div style={styles.formGrid}>
                <div style={{ gridColumn: 'span 2' }}>
                  <F label="Course Name *"
                    value={form.course}
                    onChange={v => setForm({ ...form, course: v })}
                    placeholder="e.g. Advanced Sales Techniques"
                  />
                </div>
                <F label="Cost (AED)"
                  value={form.cost}
                  onChange={v => setForm({ ...form, cost: v })}
                  placeholder="e.g. 12000" type="number"
                />
                <F label="Purchase Request #"
                  value={form.pr}
                  onChange={v => setForm({ ...form, pr: v })}
                  placeholder="e.g. PR-2025-005"
                />
                <F label="PO #"
                  value={form.po}
                  onChange={v => setForm({ ...form, po: v })}
                  placeholder="e.g. PO-2025-005"
                />
                <F label="Duration (Days)"
                  value={form.days}
                  onChange={v => setForm({ ...form, days: v })}
                  placeholder="e.g. 2" type="number"
                />
                <F label="Duration (Hours)"
                  value={form.hours}
                  onChange={v => setForm({ ...form, hours: v })}
                  placeholder="e.g. 16" type="number"
                />
              </div>

            </div>

            <div style={styles.modalFooter}>
              <button style={styles.cancelBtn}
                onClick={() => setShowAdd(false)}>Cancel</button>
              <button style={styles.saveBtn}
                onClick={handleSave}>Add Entry</button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

// ── REUSABLE FORM FIELD ──────────────────────────────────────
function F({ label, value, onChange, placeholder, type = 'text' }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
      <label style={{
        fontSize: '11px', fontWeight: '700', color: '#5a6878',
        textTransform: 'uppercase', letterSpacing: '0.5px',
      }}>
        {label}
      </label>
      <input
        type={type} value={value} placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
        style={{
          padding: '10px 12px', border: '1.5px solid #e8ecf0',
          borderRadius: '8px', fontSize: '13px', outline: 'none',
          background: '#f8f9fa', color: '#051c2c',
          fontFamily: 'Inter, sans-serif', width: '100%',
        }}
      />
    </div>
  );
}

// ── STYLES ───────────────────────────────────────────────────
const styles = {
  page: {
    padding: '30px', minHeight: '100vh',
    background: '#f2f4f6', fontFamily: 'Inter, sans-serif',
  },
  pageTitle: {
    fontSize: '26px', fontWeight: '700',
    color: '#051c2c', marginBottom: '4px', letterSpacing: '-0.3px',
  },
  pageSubtitle: {
    fontSize: '13px', color: '#9baabb',
    marginBottom: '22px', fontStyle: 'italic',
  },

  // Year selector
  yearRow: { display: 'flex', gap: '8px', marginBottom: '12px' },
  yearBtn: {
    padding: '9px 22px', borderRadius: '8px',
    border: '1.5px solid #e8ecf0', background: '#ffffff',
    fontSize: '14px', fontWeight: '600', cursor: 'pointer',
    color: '#5a6878', fontFamily: 'Inter, sans-serif',
    transition: 'all 0.15s',
  },
  yearBtnActive: {
    background: '#051c2c', color: '#ffffff',
    borderColor: '#051c2c',
  },

  // Quarter selector
  quarterRow: {
    display: 'flex', gap: '8px', marginBottom: '22px', flexWrap: 'wrap',
  },
  qBtn: {
    padding: '8px 18px', borderRadius: '8px',
    border: '1.5px solid #e8ecf0', background: '#ffffff',
    fontSize: '13px', fontWeight: '500', cursor: 'pointer',
    color: '#5a6878', fontFamily: 'Inter, sans-serif',
    transition: 'all 0.15s',
  },
  qBtnActive: {
    background: '#f2f4f6', color: '#051c2c',
    borderColor: '#b6bdc2', fontWeight: '600',
  },

  // Table header
  tableHeader: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: '12px',
  },
  tableTitle: {
    fontSize: '16px', fontWeight: '700', color: '#051c2c',
  },
  addBtn: {
    background: '#051c2c', color: '#ffffff', border: 'none',
    borderRadius: '8px', padding: '9px 18px', fontSize: '13px',
    fontWeight: '600', cursor: 'pointer', fontFamily: 'Inter, sans-serif',
  },

  // Table
  tableWrap: {
    background: '#ffffff', borderRadius: '12px',
    border: '1px solid #e8ecf0', overflow: 'hidden',
    marginBottom: '16px',
  },
  table: { width: '100%', borderCollapse: 'collapse' },
  theadRow: { background: '#051c2c' },
  th: {
    padding: '12px 16px', textAlign: 'left',
    fontSize: '10px', fontWeight: '700', color: '#ffffff',
    textTransform: 'uppercase', letterSpacing: '0.5px',
  },
  tr: { borderBottom: '1px solid #f0f2f4' },
  td: { padding: '13px 16px', fontSize: '13px', color: '#051c2c' },
  monoTd: {
    padding: '13px 16px', fontSize: '12px',
    fontFamily: 'monospace', color: '#5a6878',
  },
  pendingTag: {
    background: '#fef9c3', color: '#a16207',
    padding: '2px 8px', borderRadius: '10px',
    fontSize: '11px', fontWeight: '600',
  },
  totalRow: { background: '#f8f9fa', borderTop: '2px solid #e8ecf0' },
  totalTd: {
    padding: '12px 16px', fontSize: '13px',
    fontWeight: '700', color: '#051c2c',
  },

  // Empty state
  emptyState: {
    padding: '60px 20px', textAlign: 'center',
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', gap: '12px',
  },
  emptyIcon: { fontSize: '40px' },
  emptyText: { fontSize: '14px', color: '#9baabb' },
  emptyBtn: {
    background: '#051c2c', color: '#ffffff', border: 'none',
    borderRadius: '8px', padding: '10px 20px', fontSize: '13px',
    fontWeight: '600', cursor: 'pointer', fontFamily: 'Inter, sans-serif',
  },

  // Summary cards
  summaryRow: {
    display: 'grid', gridTemplateColumns: 'repeat(4,1fr)',
    gap: '14px',
  },
  summaryCard: {
    background: '#ffffff', borderRadius: '12px',
    border: '1px solid #e8ecf0', padding: '18px 20px',
  },
  summaryLabel: { fontSize: '11px', color: '#5a6878', fontWeight: '500' },
  summaryValue: {
    fontSize: '22px', fontWeight: '800',
    color: '#051c2c', marginTop: '6px', lineHeight: 1,
  },

  // Modal
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(5,28,44,0.55)',
    zIndex: 999, display: 'flex', alignItems: 'center',
    justifyContent: 'center', padding: '20px',
  },
  modal: {
    background: '#ffffff', borderRadius: '16px',
    width: '100%', maxWidth: '560px',
    maxHeight: '90vh', overflowY: 'auto',
    boxShadow: '0 24px 64px rgba(5,28,44,0.25)',
  },
  modalHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '20px 24px', borderBottom: '1px solid #e8ecf0',
    position: 'sticky', top: 0, background: '#ffffff', zIndex: 1,
  },
  modalTitle: { fontSize: '18px', fontWeight: '700', color: '#051c2c' },
  modalClose: {
    background: 'none', border: 'none',
    fontSize: '24px', cursor: 'pointer', color: '#9baabb',
  },
  modalBody: { padding: '22px 24px' },
  modalFooter: {
    padding: '14px 24px', borderTop: '1px solid #e8ecf0',
    display: 'flex', justifyContent: 'flex-end', gap: '10px',
  },
  cancelBtn: {
    padding: '9px 20px', background: 'none',
    border: '1.5px solid #e8ecf0', borderRadius: '8px',
    fontSize: '13px', cursor: 'pointer', fontFamily: 'Inter, sans-serif',
  },
  saveBtn: {
    padding: '9px 24px', background: '#051c2c', border: 'none',
    borderRadius: '8px', fontSize: '13px', fontWeight: '600',
    cursor: 'pointer', color: '#ffffff', fontFamily: 'Inter, sans-serif',
  },
  entryMeta: {
    fontSize: '13px', color: '#5a6878', marginBottom: '16px',
    padding: '10px 14px', background: '#f2f4f6', borderRadius: '8px',
  },
  formGrid: {
    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px',
  },
};

export default CalendarPage;