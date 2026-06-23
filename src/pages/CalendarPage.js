import React, { useState, useEffect } from 'react';
import api from '../api';
import Pagination from '../components/Pagination';

const ITEMS_PER_PAGE = 20;

const STATUS_OPTIONS   = ['Planned', 'Scheduled', 'Ongoing', 'Completed', 'Postponed', 'On hold', 'Cancelled'];
const DELIVERY_OPTIONS = ['Classroom', 'Online', 'Hybrid', 'E-Learning', 'Workshop', 'Conference', 'Training'];
const TYPE_OPTIONS     = ['Mandatory', 'Developmental'];

function CalendarPage() {

  const [entries,      setEntries]      = useState([]);
  const [departments,  setDepartments]  = useState([]);
  const [showAdd,      setShowAdd]      = useState(false);
  const [editEntry,    setEditEntry]    = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [currentPage,  setCurrentPage]  = useState(1);
  const [filterDept,   setFilterDept]   = useState('');
  const [filterMonth,  setFilterMonth]  = useState('');
  const [filterQuarter,setFilterQuarter]= useState('');
  const [formError,    setFormError]    = useState('');

  const emptyForm = {
    trainingName: '', departmentId: '', status: 'Planned',
    startDate: '', endDate: '', duration: '', modeOfDelivery: '',
    type: 'Developmental', trainingHours: '', cost: '', remarks: '',
  };
  const [form,     setForm]     = useState(emptyForm);
  const [editForm, setEditForm] = useState(emptyForm);

  useEffect(() => {
    loadEntries();
    api.getDepartments().then(data => { if (Array.isArray(data)) setDepartments(data); });
  }, []);

  const loadEntries = () => {
    api.getCalendar()
      .then(data => {
        if (Array.isArray(data)) setEntries(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

  const getMonthName = (dateStr) => {
    if (!dateStr) return '—';
    return MONTHS[new Date(dateStr).getMonth()];
  };

  const getQuarter = (dateStr) => {
    if (!dateStr) return '—';
    return 'Q' + (Math.floor(new Date(dateStr).getMonth() / 3) + 1);
  };

  const filtered = entries.filter(e => {
    const matchDept    = !filterDept    || e.department_id === +filterDept;
    const matchMonth   = !filterMonth   || getMonthName(e.start_date) === filterMonth;
    const matchQuarter = !filterQuarter || getQuarter(e.start_date) === filterQuarter;
    return matchDept && matchMonth && matchQuarter;
  });

  const paginated = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const totalEntries       = entries.length;
  const mandatoryCount     = entries.filter(e => e.type === 'Mandatory').length;
  const developmentalCount = entries.filter(e => e.type === 'Developmental').length;
  const totalCost          = entries.reduce((s, e) => s + (+e.cost || 0), 0);
  const totalHours         = entries.reduce((s, e) => s + (+e.training_hours || 0), 0);

  const validateForm = (f) => {
    if (!f.trainingName) return 'Training Name is required.';
    if (!f.departmentId) return 'Department is required.';
    if (!f.status) return 'Status is required.';
    if (!f.startDate) return 'Start Date is required.';
    if (!f.endDate) return 'End Date is required.';
    if (!f.modeOfDelivery) return 'Mode of Delivery is required.';
    if (!f.type) return 'Type is required.';
    if (!f.trainingHours) return 'Training Hours is required.';
    if (new Date(f.endDate) < new Date(f.startDate)) return 'End Date cannot be earlier than Start Date.';
    return '';
  };

  const handleSave = async () => {
    const err = validateForm(form);
    if (err) { setFormError(err); return; }
    setFormError('');
    try {
      const result = await api.addCalendarEntry({
        training_name:    form.trainingName,
        department_id:    +form.departmentId,
        status:           form.status,
        start_date:       form.startDate,
        end_date:         form.endDate,
        duration:         form.duration,
        mode_of_delivery: form.modeOfDelivery,
        type:             form.type,
        training_hours:   +form.trainingHours,
        cost:             +form.cost || 0,
        remarks:          form.remarks,
      });
      if (result.id) {
        loadEntries();
        setForm(emptyForm);
        setShowAdd(false);
      } else {
        setFormError(result.error || 'Could not save entry.');
      }
    } catch (err) {
      setFormError('Error connecting to server.');
    }
  };

  const handleEditSave = async () => {
    const err = validateForm(editForm);
    if (err) { setFormError(err); return; }
    setFormError('');
    try {
      const result = await api.updateCalendarEntry(editEntry.id, {
        training_name:    editForm.trainingName,
        department_id:    +editForm.departmentId,
        status:           editForm.status,
        start_date:       editForm.startDate,
        end_date:         editForm.endDate,
        duration:         editForm.duration,
        mode_of_delivery: editForm.modeOfDelivery,
        type:             editForm.type,
        training_hours:   +editForm.trainingHours,
        cost:             +editForm.cost || 0,
        remarks:          editForm.remarks,
      });
      if (result.id) {
        loadEntries();
        setEditEntry(null);
      } else {
        setFormError(result.error || 'Could not update entry.');
      }
    } catch (err) {
      setFormError('Error connecting to server.');
    }
  };

  const openEdit = (entry) => {
    setEditForm({
      trainingName:   entry.training_name    || '',
      departmentId:   entry.department_id    || '',
      status:         entry.status           || 'Planned',
      startDate:      entry.start_date ? entry.start_date.split('T')[0] : '',
      endDate:        entry.end_date   ? entry.end_date.split('T')[0]   : '',
      duration:       entry.duration         || '',
      modeOfDelivery: entry.mode_of_delivery || '',
      type:           entry.type             || 'Developmental',
      trainingHours:  entry.training_hours   || '',
      cost:           entry.cost             || '',
      remarks:        entry.remarks          || '',
    });
    setFormError('');
    setEditEntry(entry);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this training calendar entry?')) return;
    try {
      await api.deleteCalendarEntry(id);
      loadEntries();
    } catch (err) {
      alert('Error deleting entry.');
    }
  };

  const fmtDate = d => d
    ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : '—';

  const StatusBadge = ({ status }) => {
    const colors = {
      Planned:   { bg: '#f0f9ff', color: '#0369a1' },
      Scheduled: { bg: '#e0e7ff', color: '#4338ca' },
      Ongoing:   { bg: '#dbeafe', color: '#1d4ed8' },
      Completed: { bg: '#dcfce7', color: '#15803d' },
      Postponed: { bg: '#fef9c3', color: '#a16207' },
      'On hold': { bg: '#fed7aa', color: '#c2410c' },
      Cancelled: { bg: '#fee2e2', color: '#991b1b' },
    };
    const c = colors[status] || { bg: '#f1f5f9', color: '#475569' };
    return (
      <span style={{ background: c.bg, color: c.color, padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600' }}>
        {status}
      </span>
    );
  };

  const TypeBadge = ({ type }) => (
    <span style={{
      background: type === 'Mandatory' ? '#fee2e2' : '#f0f9ff',
      color:      type === 'Mandatory' ? '#991b1b' : '#0369a1',
      padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600',
    }}>
      {type === 'Mandatory' ? '⚠️ Mandatory' : '📘 Developmental'}
    </span>
  );

  return (
    <div style={styles.page}>

      {/* ── STAT CARDS ── */}
      <div style={styles.statGrid}>
        <div style={{ ...styles.statCard, background: '#051C2C' }}>
          <div style={styles.statIcon}>📅</div>
          <div style={styles.statNum}>{totalEntries}</div>
          <div style={styles.statLbl}>Total Entries</div>
        </div>
        <div style={{ ...styles.statCard, background: '#AF5F46' }}>
          <div style={styles.statIcon}>⚠️</div>
          <div style={styles.statNum}>{mandatoryCount}</div>
          <div style={styles.statLbl}>Mandatory</div>
        </div>
        <div style={{ ...styles.statCard, background: '#6a9ea8' }}>
          <div style={styles.statIcon}>📘</div>
          <div style={styles.statNum}>{developmentalCount}</div>
          <div style={styles.statLbl}>Developmental</div>
        </div>
        <div style={{ ...styles.statCard, background: '#7a9e7a' }}>
          <div style={styles.statIcon}>⏱️</div>
          <div style={styles.statNum}>{totalHours}h</div>
          <div style={styles.statLbl}>Total Training Hours</div>
        </div>
        <div style={{ ...styles.statCard, background: '#7c3aed' }}>
          <div style={styles.statIcon}>💰</div>
          <div style={styles.statNum}>AED {totalCost.toLocaleString()}</div>
          <div style={styles.statLbl}>Total Estimated Cost</div>
        </div>
      </div>

      {/* ── CONTROLS ── */}
      <div style={styles.controls}>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <select
            value={filterDept}
            onChange={e => { setFilterDept(e.target.value); setCurrentPage(1); }}
            style={styles.filterSelect}
          >
            <option value="">All Departments</option>
            {departments.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>

          <select
            value={filterMonth}
            onChange={e => { setFilterMonth(e.target.value); setCurrentPage(1); }}
            style={styles.filterSelect}
          >
            <option value="">All Months</option>
            {MONTHS.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>

          <select
            value={filterQuarter}
            onChange={e => { setFilterQuarter(e.target.value); setCurrentPage(1); }}
            style={styles.filterSelect}
          >
            <option value="">All Quarters</option>
            {['Q1','Q2','Q3','Q4'].map(q => (
              <option key={q} value={q}>{q}</option>
            ))}
          </select>

          {(filterDept || filterMonth || filterQuarter) && (
            <button
              onClick={() => { setFilterDept(''); setFilterMonth(''); setFilterQuarter(''); setCurrentPage(1); }}
              style={styles.clearFilterBtn}
            >
              ✕ Clear Filters
            </button>
          )}
        </div>
        <button style={styles.addBtn} onClick={() => { setFormError(''); setShowAdd(true); }}>
          Add Entry
        </button>
      </div>

      {/* ── TABLE ── */}
      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#9baabb' }}>
          Loading training calendar...
        </div>
      ) : (
        <div style={styles.tableWrap}>
          <div style={styles.tableTitle}>
            Training Calendar
            <span style={{ fontSize: '13px', color: '#9baabb', fontWeight: '400', marginLeft: '8px' }}>
              {filtered.length} entr{filtered.length !== 1 ? 'ies' : 'y'}
            </span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ ...styles.table, minWidth: '1300px' }}>
              <thead>
                <tr style={styles.theadRow}>
                  {['No.', 'Training Name', 'Department', 'Status', 'Start Date', 'End Date',
                    'Duration', 'Mode of Delivery', 'Type', 'Training Hours', 'Cost (AED)', 'Remarks', ''].map(h => (
                    <th key={h} style={styles.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.map((entry, i) => (
                  <tr key={entry.id} style={styles.tr}>
                    <td style={styles.td}>
                      {(currentPage - 1) * ITEMS_PER_PAGE + i + 1}
                    </td>
                    <td style={{ ...styles.td, minWidth: '180px', fontWeight: 600 }}>
                      {entry.training_name}
                    </td>
                    <td style={{ ...styles.td, fontSize: '12px' }}>
                      {entry.department_name
                        ? <span style={{ background: '#f0f9ff', color: '#0369a1', padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: '600' }}>{entry.department_name}</span>
                        : '—'}
                    </td>
                    <td style={styles.td}>
                      <StatusBadge status={entry.status} />
                    </td>
                    <td style={{ ...styles.td, fontSize: '12px', color: '#5a6878', whiteSpace: 'nowrap' }}>
                      {fmtDate(entry.start_date)}
                    </td>
                    <td style={{ ...styles.td, fontSize: '12px', color: '#5a6878', whiteSpace: 'nowrap' }}>
                      {fmtDate(entry.end_date)}
                    </td>
                    <td style={{ ...styles.td, fontSize: '12px', color: '#5a6878' }}>
                      {entry.duration || '—'}
                    </td>
                    <td style={{ ...styles.td, fontSize: '12px' }}>
                      {entry.mode_of_delivery || '—'}
                    </td>
                    <td style={styles.td}>
                      <TypeBadge type={entry.type} />
                    </td>
                    <td style={{ ...styles.td, fontWeight: 600 }}>
                      {entry.training_hours || 0}h
                    </td>
                    <td style={{ ...styles.td, fontWeight: 600 }}>
                      {entry.cost ? 'AED ' + (+entry.cost).toLocaleString() : '—'}
                    </td>
                    <td style={{ ...styles.td, fontSize: '12px', color: '#5a6878', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {entry.remarks || '—'}
                    </td>
                    <td style={{ ...styles.td, whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button style={styles.actionBtn} onClick={() => openEdit(entry)} title="Edit">✏️</button>
                        <button style={{ ...styles.actionBtn, background: '#fee2e2' }} onClick={() => handleDelete(entry.id)} title="Delete">🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filtered.length === 0 && (
            <div style={{ padding: '40px', textAlign: 'center', color: '#9baabb', fontSize: '14px' }}>
              {entries.length === 0
                ? 'No training calendar entries yet. Click "Add Entry" to get started.'
                : 'No entries match your filters.'
              }
            </div>
          )}

          <Pagination
            currentPage={currentPage}
            totalItems={filtered.length}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* ── ADD ENTRY MODAL ── */}
      {showAdd && (
        <div style={styles.overlay} onClick={() => setShowAdd(false)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <span style={styles.modalTitle}>Add Training Calendar Entry</span>
              <button style={styles.modalClose} onClick={() => setShowAdd(false)}>×</button>
            </div>
            <div style={styles.modalBody}>
              {formError && (
                <div style={styles.errorBox}>{formError}</div>
              )}
              <EntryForm f={form} setF={setForm} departments={departments} />
            </div>
            <div style={styles.modalFooter}>
              <button style={styles.cancelBtn} onClick={() => setShowAdd(false)}>Cancel</button>
              <button style={styles.saveBtn} onClick={handleSave}>Add Entry</button>
            </div>
          </div>
        </div>
      )}

      {/* ── EDIT ENTRY MODAL ── */}
      {editEntry && (
        <div style={styles.overlay} onClick={() => setEditEntry(null)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <span style={styles.modalTitle}>Edit Training Calendar Entry</span>
              <button style={styles.modalClose} onClick={() => setEditEntry(null)}>×</button>
            </div>
            <div style={styles.modalBody}>
              {formError && (
                <div style={styles.errorBox}>{formError}</div>
              )}
              <EntryForm f={editForm} setF={setEditForm} departments={departments} />
            </div>
            <div style={styles.modalFooter}>
              <button style={styles.cancelBtn} onClick={() => setEditEntry(null)}>Cancel</button>
              <button style={styles.saveBtn} onClick={handleEditSave}>Save Changes</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

function EntryForm({ f, setF, departments }) {
  return (
    <>
      <div style={styles.formGrid}>
        <F label="Training Name *" value={f.trainingName} onChange={v => setF({...f, trainingName: v})}
          placeholder="e.g. Fire Safety Refresher" full />

        <F label="Department *" value={f.departmentId} onChange={v => setF({...f, departmentId: v})}
          type="select" options={departments.map(d => ({ label: d.name, value: d.id }))} />

        <F label="Status *" value={f.status} onChange={v => setF({...f, status: v})}
          type="select" options={STATUS_OPTIONS} />

        <F label="Start Date *" value={f.startDate} onChange={v => setF({...f, startDate: v})} type="date" />

        <F label="End Date *" value={f.endDate} onChange={v => setF({...f, endDate: v})} type="date" />

        <F label="Duration" value={f.duration} onChange={v => setF({...f, duration: v})}
          placeholder="e.g. 3 days" />

        <F label="Mode of Delivery *" value={f.modeOfDelivery} onChange={v => setF({...f, modeOfDelivery: v})}
          type="select" options={DELIVERY_OPTIONS} />

        <F label="Type *" value={f.type} onChange={v => setF({...f, type: v})}
          type="select" options={TYPE_OPTIONS} />

        <F label="Training Hours *" value={f.trainingHours} onChange={v => setF({...f, trainingHours: v})}
          placeholder="e.g. 16" type="number" />

        <F label="Cost (AED)" value={f.cost} onChange={v => setF({...f, cost: v})}
          placeholder="e.g. 5000" type="number" />
      </div>

      <div style={{ marginTop: '14px' }}>
        <label style={styles.fieldLabelStandalone}>
          Remarks <span style={{ fontWeight: '400', textTransform: 'none', color: '#9baabb' }}>(optional)</span>
        </label>
        <textarea
          value={f.remarks}
          onChange={e => setF({...f, remarks: e.target.value})}
          placeholder="Any additional notes or special instructions"
          style={styles.textarea}
        />
      </div>
    </>
  );
}

function F({ label, value, onChange, placeholder, type = 'text', options = [], full }) {
  const inputStyle = {
    width: '100%', padding: '9px 12px', border: '1.5px solid #e8ecf0',
    borderRadius: '8px', fontSize: '13px', outline: 'none',
    background: '#f8f9fa', color: '#051c2c', fontFamily: 'Inter, sans-serif',
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', gridColumn: full ? 'span 2' : 'auto' }}>
      <label style={styles.fieldLabelStandalone}>{label}</label>
      {type === 'select' ? (
        <select value={value} onChange={e => onChange(e.target.value)} style={inputStyle}>
          <option value="">Select...</option>
          {options.map(o =>
            typeof o === 'object'
              ? <option key={o.value} value={o.value}>{o.label}</option>
              : <option key={o} value={o}>{o}</option>
          )}
        </select>
      ) : (
        <input type={type} value={value} placeholder={placeholder}
          onChange={e => onChange(e.target.value)} style={inputStyle} />
      )}
    </div>
  );
}

const styles = {
  page:             { padding: '30px', minHeight: '100vh', background: '#f2f4f6', fontFamily: 'Inter, sans-serif' },
  statGrid:         { display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '14px', marginBottom: '20px' },
  statCard:         { color: '#ffffff', borderRadius: '12px', padding: '18px 16px', display: 'flex', flexDirection: 'column', gap: '4px' },
  statIcon:         { fontSize: '20px', marginBottom: '4px' },
  statNum:          { fontSize: '24px', fontWeight: '800', color: '#ffffff', lineHeight: 1 },
  statLbl:          { fontSize: '12px', fontWeight: '600', color: 'rgba(255,255,255,0.8)' },
  controls:         { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' },
  filterSelect:     { padding: '9px 12px', border: '1.5px solid #e8ecf0', borderRadius: '8px', fontSize: '13px', outline: 'none', background: '#ffffff', color: '#051c2c', fontFamily: 'Inter, sans-serif', cursor: 'pointer' },
  clearFilterBtn:   { background: '#fee2e2', color: '#991b1b', border: 'none', borderRadius: '8px', padding: '9px 14px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', fontFamily: 'Inter, sans-serif' },
  addBtn:           { background: '#051c2c', color: '#ffffff', border: 'none', borderRadius: '8px', padding: '10px 20px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'Inter, sans-serif' },
  tableWrap:        { background: '#ffffff', borderRadius: '12px', border: '1px solid #e8ecf0', overflow: 'hidden' },
  tableTitle:       { fontSize: '16px', fontWeight: '700', color: '#051c2c', padding: '16px 20px', borderBottom: '1px solid #e8ecf0' },
  table:            { width: '100%', borderCollapse: 'collapse' },
  theadRow:         { background: '#051c2c' },
  th:               { padding: '11px 14px', textAlign: 'left', fontSize: '10px', fontWeight: '700', color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' },
  tr:               { borderBottom: '1px solid #f0f2f4' },
  td:               { padding: '12px 14px', fontSize: '13px', color: '#051c2c', verticalAlign: 'middle' },
  actionBtn:        { background: '#051c2c', border: 'none', borderRadius: '6px', padding: '5px 8px', cursor: 'pointer', fontSize: '13px' },
  overlay:          { position: 'fixed', inset: 0, background: 'rgba(5,28,44,0.55)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' },
  modal:            { background: '#ffffff', borderRadius: '16px', width: '100%', maxWidth: '640px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 64px rgba(5,28,44,0.25)' },
  modalHeader:      { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid #e8ecf0', position: 'sticky', top: 0, background: '#ffffff', zIndex: 1 },
  modalTitle:       { fontSize: '18px', fontWeight: '700', color: '#051c2c' },
  modalClose:       { background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#9baabb' },
  modalBody:        { padding: '20px 24px' },
  modalFooter:      { padding: '14px 24px', borderTop: '1px solid #e8ecf0', display: 'flex', justifyContent: 'flex-end', gap: '10px' },
  cancelBtn:        { padding: '9px 20px', background: 'none', border: '1.5px solid #e8ecf0', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', fontFamily: 'Inter, sans-serif' },
  saveBtn:          { padding: '9px 24px', background: '#051c2c', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', color: '#ffffff', fontFamily: 'Inter, sans-serif' },
  formGrid:         { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' },
  fieldLabelStandalone: { fontSize: '11px', fontWeight: '700', color: '#5a6878', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '5px' },
  textarea:         { width: '100%', padding: '9px 12px', border: '1.5px solid #e8ecf0', borderRadius: '8px', fontSize: '13px', outline: 'none', background: '#f8f9fa', color: '#051c2c', fontFamily: 'Inter, sans-serif', minHeight: '70px', resize: 'vertical', boxSizing: 'border-box' },
  errorBox:         { background: '#fee2e2', color: '#991b1b', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: '500', marginBottom: '14px', border: '1px solid #fca5a5' },
};

export default CalendarPage;