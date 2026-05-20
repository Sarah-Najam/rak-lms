import React, { useState, useEffect } from 'react';
import api from '../api';

const Q_LABELS = { Q1: 'Q1 — Jan to Mar', Q2: 'Q2 — Apr to Jun', Q3: 'Q3 — Jul to Sep', Q4: 'Q4 — Oct to Dec' };

function CalendarPage() {

  const [year,    setYear]    = useState(2025);
  const [quarter, setQuarter] = useState('Q1');
  const [data,    setData]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);

  const emptyForm = { course: '', cost: '', pr: '', po: '', days: '', hours: '' };
  const [form, setForm] = useState(emptyForm);

  const loadData = (y, q) => {
    setLoading(true);
    const url = q === 'ALL'
      ? `http://localhost:5000/api/calendar?year=${y}`
      : `http://localhost:5000/api/calendar?year=${y}&quarter=${q}`;
    fetch(url, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } })
      .then(r => r.json())
      .then(d => { if (Array.isArray(d)) setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { loadData(year, quarter); }, [year, quarter]);

  const totalCost  = data.reduce((s, r) => s + (+r.cost  || 0), 0);
  const totalHours = data.reduce((s, r) => s + (+r.duration_hours || 0), 0);
  const totalDays  = data.reduce((s, r) => s + (+r.duration_days  || 0), 0);

  const handleSave = async () => {
    if (!form.course) { alert('Course name is required.'); return; }
    try {
      const entry = await api.addCalendarEntry({
        course_name:     form.course,
        cost:            +form.cost  || 0,
        pr_number:       form.pr,
        po_number:       form.po,
        duration_days:   +form.days  || 0,
        duration_hours:  +form.hours || 0,
        year,
        quarter: quarter === 'ALL' ? 'Q1' : quarter,
      });
      if (entry.id) {
        loadData(year, quarter);
        setForm(emptyForm);
        setShowAdd(false);
      } else {
        alert(entry.error || 'Could not save entry.');
      }
    } catch (err) {
      alert('Error connecting to server.');
    }
  };

  return (
    <div style={styles.page}>
      <p style={{ fontSize: '13px', color: '#9baabb', marginBottom: '22px', fontStyle: 'italic' }}>
        Independent planning dataset — separate from the Courses module
      </p>

      <div style={styles.yearRow}>
        {[2024, 2025, 2026].map(y => (
          <button key={y} style={{ ...styles.yearBtn, ...(year === y ? styles.yearBtnActive : {}) }}
            onClick={() => setYear(y)}>{y}</button>
        ))}
      </div>

      <div style={styles.quarterRow}>
        {['Q1','Q2','Q3','Q4'].map(q => (
          <button key={q} style={{ ...styles.qBtn, ...(quarter === q ? styles.qBtnActive : {}) }}
            onClick={() => setQuarter(q)}>{Q_LABELS[q]}</button>
        ))}
        <button style={{ ...styles.qBtn, ...(quarter === 'ALL' ? styles.qBtnActive : {}) }}
          onClick={() => setQuarter('ALL')}>View All {year}</button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <span style={{ fontSize: '16px', fontWeight: '700', color: '#051c2c' }}>
          {quarter === 'ALL' ? `Full Year ${year}` : `${Q_LABELS[quarter]} — ${year}`}
        </span>
        <button style={styles.addBtn} onClick={() => setShowAdd(true)}>+ Add Entry</button>
      </div>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#9baabb' }}>Loading...</div>
      ) : (
        <div style={styles.tableWrap}>
          {data.length > 0 ? (
            <table style={styles.table}>
              <thead>
                <tr style={styles.theadRow}>
                  {['No.','Course','Cost (AED)','Purchase Request #','PO #','Duration (Days)','Duration (Hours)'].map(h => (
                    <th key={h} style={styles.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((row, i) => (
                  <tr key={row.id} style={styles.tr}>
                    <td style={styles.td}>{i + 1}</td>
                    <td style={{ ...styles.td, fontWeight: 600 }}>{row.course_name}</td>
                    <td style={{ ...styles.td, fontWeight: 600 }}>{(+row.cost).toLocaleString()}</td>
                    <td style={{ ...styles.td, fontFamily: 'monospace', fontSize: '12px', color: '#5a6878' }}>{row.pr_number || '—'}</td>
                    <td style={{ ...styles.td, fontFamily: 'monospace', fontSize: '12px' }}>
                      {row.po_number || <span style={{ color: '#a16207', fontWeight: '600' }}>Pending</span>}
                    </td>
                    <td style={styles.td}>{row.duration_days}d</td>
                    <td style={{ ...styles.td, fontWeight: 600 }}>{row.duration_hours}h</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ background: '#f8f9fa', borderTop: '2px solid #e8ecf0' }}>
                  <td style={{ ...styles.td, fontWeight: '700' }} colSpan={2}>Total ({data.length} courses)</td>
                  <td style={{ ...styles.td, fontWeight: '700' }}>AED {totalCost.toLocaleString()}</td>
                  <td colSpan={2} />
                  <td style={{ ...styles.td, fontWeight: '700' }}>{totalDays}d</td>
                  <td style={{ ...styles.td, fontWeight: '700' }}>{totalHours}h</td>
                </tr>
              </tfoot>
            </table>
          ) : (
            <div style={{ padding: '60px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
              <div style={{ fontSize: '40px' }}>📅</div>
              <div style={{ fontSize: '14px', color: '#9baabb' }}>No training planned for this period.</div>
              <button style={styles.addBtn} onClick={() => setShowAdd(true)}>+ Add First Entry</button>
            </div>
          )}
        </div>
      )}

      {data.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '14px', marginTop: '16px' }}>
          {[['Total Budget', 'AED ' + totalCost.toLocaleString()], ['Total Training Hours', totalHours + 'h'], ['Total Training Days', totalDays + ' days'], ['No. of Courses', data.length]].map(([l, v]) => (
            <div key={l} style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e8ecf0', padding: '16px 20px' }}>
              <div style={{ fontSize: '11px', color: '#5a6878', fontWeight: '500' }}>{l}</div>
              <div style={{ fontSize: '22px', fontWeight: '800', color: '#051c2c', marginTop: '5px' }}>{v}</div>
            </div>
          ))}
        </div>
      )}

      {showAdd && (
        <div style={styles.overlay} onClick={() => setShowAdd(false)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <span style={styles.modalTitle}>Add Calendar Entry</span>
              <button style={styles.modalClose} onClick={() => setShowAdd(false)}>×</button>
            </div>
            <div style={styles.modalBody}>
              <div style={{ fontSize: '13px', color: '#5a6878', marginBottom: '16px', padding: '10px 14px', background: '#f2f4f6', borderRadius: '8px' }}>
                Adding to: <strong>{year} — {quarter === 'ALL' ? 'Q1' : Q_LABELS[quarter]}</strong>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div style={{ gridColumn: 'span 2' }}>
                  <F label="Course Name *" value={form.course} onChange={v => setForm({...form, course: v})} placeholder="e.g. Advanced Sales Techniques" />
                </div>
                <F label="Cost (AED)"          value={form.cost}  onChange={v => setForm({...form, cost: v})}  placeholder="e.g. 12000" type="number" />
                <F label="Purchase Request #"  value={form.pr}    onChange={v => setForm({...form, pr: v})}    placeholder="e.g. PR-2025-005" />
                <F label="PO #"                value={form.po}    onChange={v => setForm({...form, po: v})}    placeholder="e.g. PO-2025-005" />
                <F label="Duration (Days)"     value={form.days}  onChange={v => setForm({...form, days: v})}  placeholder="e.g. 2" type="number" />
                <F label="Duration (Hours)"    value={form.hours} onChange={v => setForm({...form, hours: v})} placeholder="e.g. 16" type="number" />
              </div>
            </div>
            <div style={styles.modalFooter}>
              <button style={styles.cancelBtn} onClick={() => setShowAdd(false)}>Cancel</button>
              <button style={styles.saveBtn}   onClick={handleSave}>Add Entry</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function F({ label, value, onChange, placeholder, type = 'text' }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
      <label style={{ fontSize: '11px', fontWeight: '700', color: '#5a6878', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</label>
      <input type={type} value={value} placeholder={placeholder} onChange={e => onChange(e.target.value)}
        style={{ padding: '10px 12px', border: '1.5px solid #e8ecf0', borderRadius: '8px', fontSize: '13px', outline: 'none', background: '#f8f9fa', color: '#051c2c', fontFamily: 'Inter, sans-serif', width: '100%' }} />
    </div>
  );
}

const styles = {
  page:         { padding: '30px', minHeight: '100vh', background: '#f2f4f6', fontFamily: 'Inter, sans-serif' },
  yearRow:      { display: 'flex', gap: '8px', marginBottom: '12px' },
  yearBtn:      { padding: '9px 22px', borderRadius: '8px', border: '1.5px solid #e8ecf0', background: '#ffffff', fontSize: '14px', fontWeight: '600', cursor: 'pointer', color: '#5a6878', fontFamily: 'Inter, sans-serif' },
  yearBtnActive:{ background: '#051c2c', color: '#ffffff', borderColor: '#051c2c' },
  quarterRow:   { display: 'flex', gap: '8px', marginBottom: '22px', flexWrap: 'wrap' },
  qBtn:         { padding: '8px 18px', borderRadius: '8px', border: '1.5px solid #e8ecf0', background: '#ffffff', fontSize: '13px', fontWeight: '500', cursor: 'pointer', color: '#5a6878', fontFamily: 'Inter, sans-serif' },
  qBtnActive:   { background: '#f2f4f6', color: '#051c2c', borderColor: '#b6bdc2', fontWeight: '600' },
  addBtn:       { background: '#051c2c', color: '#ffffff', border: 'none', borderRadius: '8px', padding: '9px 18px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'Inter, sans-serif' },
  tableWrap:    { background: '#ffffff', borderRadius: '12px', border: '1px solid #e8ecf0', overflow: 'hidden', marginBottom: '16px' },
  table:        { width: '100%', borderCollapse: 'collapse' },
  theadRow:     { background: '#051c2c' },
  th:           { padding: '12px 16px', textAlign: 'left', fontSize: '10px', fontWeight: '700', color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.5px' },
  tr:           { borderBottom: '1px solid #f0f2f4' },
  td:           { padding: '13px 16px', fontSize: '13px', color: '#051c2c' },
  overlay:      { position: 'fixed', inset: 0, background: 'rgba(5,28,44,0.55)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' },
  modal:        { background: '#ffffff', borderRadius: '16px', width: '100%', maxWidth: '560px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 64px rgba(5,28,44,0.25)' },
  modalHeader:  { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid #e8ecf0', position: 'sticky', top: 0, background: '#ffffff', zIndex: 1 },
  modalTitle:   { fontSize: '18px', fontWeight: '700', color: '#051c2c' },
  modalClose:   { background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#9baabb' },
  modalBody:    { padding: '22px 24px' },
  modalFooter:  { padding: '14px 24px', borderTop: '1px solid #e8ecf0', display: 'flex', justifyContent: 'flex-end', gap: '10px' },
  cancelBtn:    { padding: '9px 20px', background: 'none', border: '1.5px solid #e8ecf0', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', fontFamily: 'Inter, sans-serif' },
  saveBtn:      { padding: '9px 24px', background: '#051c2c', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', color: '#ffffff', fontFamily: 'Inter, sans-serif' },
};

export default CalendarPage;