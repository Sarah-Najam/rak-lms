// ============================================================
// LearnersPage.js
//
// NEW THINGS YOU WILL LEARN HERE:
// 1. Tabs — switching between two views (Emirati / All)
// 2. Modal — a popup form for adding a learner
// 3. Action menu — dropdown on each table row
// 4. Filter/search — filtering the table in real time
// ============================================================

import React, { useState } from 'react';
import { LEARNERS, COURSES, DEPARTMENTS } from '../data/sampleData';

function LearnersPage() {

  // ── STATE ──────────────────────────────────────────────────
  // activeTab    → which tab is selected (all or emirati)
  // showModal    → is the Add Learner popup open?
  // actionMenu   → which row's action menu is open (by id)
  // searchName   → what the user typed in name search
  // searchId     → what the user typed in ID search
  // searchEmail  → what the user typed in email search
  // learners     → our list of learners (starts from sample data)
  const [activeTab,   setActiveTab]   = useState('all');
  const [showModal,   setShowModal]   = useState(false);
  const [actionMenu,  setActionMenu]  = useState(null);
  const [searchName,  setSearchName]  = useState('');
  const [searchId,    setSearchId]    = useState('');
  const [searchEmail, setSearchEmail] = useState('');
  const [learners,    setLearners]    = useState(LEARNERS);

  // ── FORM STATE ─────────────────────────────────────────────
  // WHY SEPARATE STATE FOR THE FORM?
  // The form has many fields. Keeping them in one object
  // makes it easy to reset all fields at once after saving.
  const emptyForm = {
    empId: '', name: '', nationality: '', designation: '',
    department: '', email: '', gender: '', status: 'Active',
  };
  const [form, setForm] = useState(emptyForm);

  // ── FILTER LEARNERS ────────────────────────────────────────
  // WHY COMPUTE THIS INSTEAD OF STORING IN STATE?
  // We don't need to store filtered results separately.
  // Every time searchName/searchId changes, React re-renders
  // and this calculation runs fresh automatically.
  // This is called a "derived value" — computed from state.
  const filtered = learners.filter(l => {
    const matchTab    = activeTab === 'all' || l.nationality === 'Emirati';
    const matchName   = l.name.toLowerCase().includes(searchName.toLowerCase());
    const matchId     = l.empId.toLowerCase().includes(searchId.toLowerCase());
    const matchEmail  = l.email.toLowerCase().includes(searchEmail.toLowerCase());
    return matchTab && matchName && matchId && matchEmail;
  });

  // ── STATS ──────────────────────────────────────────────────
  const emiratiLearners = learners.filter(l => l.nationality === 'Emirati');
  const maleLearners    = learners.filter(l => l.gender === 'Male');
  const femaleLearners  = learners.filter(l => l.gender === 'Female');
  const avgHours        = Math.round(
    learners.reduce((s, l) => s + l.cost / 100, 0) / learners.length
  );

  // ── SAVE NEW LEARNER ───────────────────────────────────────
  const handleSave = () => {
    if (!form.empId || !form.name) {
      alert('Emp ID and Name are required.');
      return;
    }
    const newLearner = {
      ...form,
      id: Date.now(),
      courseIds: [],
      cost: 0,
    };
    // WHY SPREAD OPERATOR (...)?
    // [...learners, newLearner] creates a NEW array with
    // all existing learners PLUS the new one at the end.
    // We never mutate (directly change) state in React —
    // we always create a new copy. This is a React rule.
    setLearners([...learners, newLearner]);
    setForm(emptyForm);
    setShowModal(false);
  };

  // ── GET COURSE NAME ────────────────────────────────────────
  const getCourseName = (id) =>
    (COURSES.find(c => c.id === id) || {}).title || '—';

  return (
    <div style={styles.page}>

      {/* ── PAGE TITLE ── */}
      

      {/* ── TABS ── */}
      {/* WHY TABS? */}
      {/* The wireframe shows two separate views: */}
      {/* All Learners and Emirati Learners. */}
      {/* Tabs let us switch between them without a page reload. */}
      <div style={styles.tabRow}>
        <button
          style={{ ...styles.tab, ...(activeTab === 'emirati' ? styles.tabActive : {}) }}
          onClick={() => setActiveTab('emirati')}
        >
          Emirati Learners
          {activeTab === 'emirati' && <span style={styles.tabTick}>✓</span>}
        </button>
        <button
          style={{ ...styles.tab, ...(activeTab === 'all' ? styles.tabActive : {}) }}
          onClick={() => setActiveTab('all')}
        >
          All Learners
        </button>
      </div>

      {/* ── STAT CARDS ROW ── */}
      <div style={styles.statsRow}>
        <MiniStat label="Learners Population"    value={learners.length} />
        <MiniStat label="Average Learning Hours" value={avgHours}        />
        <MiniStat label="Total Learning Hours"   value={avgHours * learners.length} />
        <MiniStat label="Total Learners"         value={learners.length} />
        <MiniStat label="Total Emirati Learners" value={emiratiLearners.length} />
      </div>

      {/* ── GENDER VISUALS ── */}
      <div style={styles.genderRow}>

        {/* All Learners gender breakdown */}
        <div style={styles.genderCard}>
          <div style={styles.genderTitle}>Male and Female Learners</div>
          <div style={styles.peopleRow}>
            {/* WHY Array.from? */}
            {/* We want to draw N person icons. */}
            {/* Array.from({length: N}) creates an array of N items */}
            {/* then .map() draws one icon per item. */}
            {Array.from({ length: Math.min(maleLearners.length, 8) }).map((_, i) => (
              <PersonIcon key={'m' + i} color="#051c2c" />
            ))}
            {Array.from({ length: Math.min(femaleLearners.length, 8) }).map((_, i) => (
              <PersonIcon key={'f' + i} color="#b6bdc2" />
            ))}
          </div>
          <div style={styles.genderLegend}>
            <span><span style={{ color: '#051c2c' }}>●</span> Male Learners</span>
            <span><span style={{ color: '#b6bdc2' }}>●</span> Female Learners</span>
          </div>
        </div>

        {/* Emirati Learners gender breakdown */}
        <div style={styles.genderCard}>
          <div style={styles.genderTitle}>Emirati Male and Female Learners</div>
          <div style={styles.peopleRow}>
            {Array.from({ length: Math.min(
              emiratiLearners.filter(l => l.gender === 'Male').length, 8
            )}).map((_, i) => (
              <PersonIcon key={'em' + i} color="#051c2c" />
            ))}
            {Array.from({ length: Math.min(
              emiratiLearners.filter(l => l.gender === 'Female').length, 8
            )}).map((_, i) => (
              <PersonIcon key={'ef' + i} color="#b6bdc2" />
            ))}
          </div>
          <div style={styles.genderLegend}>
            <span><span style={{ color: '#051c2c' }}>●</span> Male Learners</span>
            <span><span style={{ color: '#b6bdc2' }}>●</span> Female Learners</span>
          </div>
        </div>

      </div>

      {/* ── TABLE HEADER: title + search + add button ── */}
      <div style={styles.tableHeader}>
        <span style={styles.tableTitle}>
          {activeTab === 'all' ? 'All Learners' : 'Emirati Learners'}
        </span>
        <div style={styles.tableControls}>
          <div style={styles.searchWrap}>
            <span style={styles.searchIcon}>🔍</span>
            <input
              style={styles.searchInput}
              placeholder="Search by Name"
              value={searchName}
              onChange={e => setSearchName(e.target.value)}
            />
          </div>
          <div style={styles.searchWrap}>
            <span style={styles.searchIcon}>🔍</span>
            <input
              style={styles.searchInput}
              placeholder="Search by ID"
              value={searchId}
              onChange={e => setSearchId(e.target.value)}
            />
          </div>
          <div style={styles.searchWrap}>
            <span style={styles.searchIcon}>🔍</span>
            <input
              style={styles.searchInput}
              placeholder="Search by Email"
              value={searchEmail}
              onChange={e => setSearchEmail(e.target.value)}
            />
          </div>
          <button style={styles.addBtn} onClick={() => setShowModal(true)}>
            Add Learner
          </button>
        </div>
      </div>

      {/* ── LEARNERS TABLE ── */}
      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.tableHeadRow}>
              {['No.', 'Emp ID', 'Name', 'Designation', 'Department', 'Courses', 'Action'].map(h => (
                <th key={h} style={styles.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((learner, index) => (
              <tr key={learner.id} style={styles.tr}>
                <td style={styles.td}>{index + 1}</td>
                <td style={styles.td}>
                  <span style={styles.empId}>{learner.empId}</span>
                </td>
                <td style={styles.td}>
                  <div style={styles.nameCell}>
                    {/* Avatar circle with initials */}
                    <div style={styles.avatar}>
                      {learner.name.split(' ').slice(0, 2).map(w => w[0]).join('')}
                    </div>
                    <span style={styles.learnerName}>{learner.name}</span>
                    {/* Green tick for active learners */}
                    {learner.status === 'Active' && (
                      <span style={styles.activeTick}>✓</span>
                    )}
                  </div>
                </td>
                <td style={styles.td}>{learner.designation}</td>
                <td style={styles.td}>{learner.dept}</td>
                <td style={styles.td}>
                  {learner.courseIds.length > 0
                    ? learner.courseIds.map(id => getCourseName(id)).join(', ')
                    : <span style={{ color: '#9baabb' }}>—</span>
                  }
                </td>
                <td style={{ ...styles.td, position: 'relative' }}>
                  {/* Action button — pencil icon */}
                  <button
                    style={styles.actionBtn}
                    onClick={() => setActionMenu(
                      actionMenu === learner.id ? null : learner.id
                    )}
                  >
                    ✏️
                  </button>

                  {/* Action dropdown menu */}
                  {/* WHY conditional render? */}
                  {/* Only show THIS learner's menu */}
                  {/* when actionMenu matches their id */}
                  {actionMenu === learner.id && (
                    <div style={styles.actionMenu}>
                      <button style={styles.actionMenuItem}
                        onClick={() => setActionMenu(null)}>
                        Edit
                      </button>
                      <button style={styles.actionMenuItem}
                        onClick={() => setActionMenu(null)}>
                        Delete
                      </button>
                      <button style={styles.actionMenuItem}
                        onClick={() => setActionMenu(null)}>
                        Assign Course
                      </button>
                      <button style={styles.actionMenuItem}
                        onClick={() => setActionMenu(null)}>
                        Add Course
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Empty state — shows when no results found */}
        {filtered.length === 0 && (
          <div style={styles.emptyState}>
            No learners found matching your search.
          </div>
        )}
      </div>

      {/* ── ADD LEARNER MODAL ── */}
      {showModal && (
        // WHY this overlay div?
        // It covers the entire screen with a dark background.
        // Clicking it closes the modal (good UX practice).
        <div style={styles.overlay} onClick={() => setShowModal(false)}>

          {/* stopPropagation prevents clicks INSIDE the modal */}
          {/* from bubbling up to the overlay and closing it */}
          <div style={styles.modal} onClick={e => e.stopPropagation()}>

            <div style={styles.modalHeader}>
              <span style={styles.modalTitle}>Add Learner</span>
              <button style={styles.modalClose}
                onClick={() => setShowModal(false)}>×</button>
            </div>

            <div style={styles.modalBody}>

              {/* Profile photo placeholder */}
              <div style={styles.photoUpload}>
                <div style={styles.photoPlaceholder}>🖼</div>
              </div>

              <div style={styles.formGrid}>

                <FormField label="Emp ID *"
                  value={form.empId}
                  onChange={v => setForm({ ...form, empId: v })}
                  placeholder="e.g. RAK-006"
                />
                <FormField label="Name *"
                  value={form.name}
                  onChange={v => setForm({ ...form, name: v })}
                  placeholder="Full name"
                />
                <FormField label="Nationality"
                  value={form.nationality}
                  onChange={v => setForm({ ...form, nationality: v })}
                  placeholder="e.g. Emirati"
                />
                <FormField label="Designation"
                  value={form.designation}
                  onChange={v => setForm({ ...form, designation: v })}
                  placeholder="Job title"
                />
                <FormField
                  label="Department"
                  value={form.department}
                  onChange={v => setForm({ ...form, department: v })}
                  type="select"
                  options={DEPARTMENTS.map(d => d.name)}
                />
                <FormField label="Email Address"
                  value={form.email}
                  onChange={v => setForm({ ...form, email: v })}
                  placeholder="name@rakprop.ae"
                  type="email"
                />
                <FormField
                  label="Gender"
                  value={form.gender}
                  onChange={v => setForm({ ...form, gender: v })}
                  type="select"
                  options={['Male', 'Female']}
                />

              </div>

              {/* Employment Status radio buttons */}
              <div style={styles.statusRow}>
                <span style={styles.fieldLabel}>Employment Status</span>
                <div style={styles.radioGroup}>
                  {['Active', 'Resigned/Terminated'].map(s => (
                    <label key={s} style={styles.radioLabel}>
                      <input
                        type="radio"
                        name="status"
                        value={s}
                        checked={form.status === s}
                        onChange={() => setForm({ ...form, status: s })}
                        style={{ accentColor: '#051c2c' }}
                      />
                      {s}
                    </label>
                  ))}
                </div>
              </div>

            </div>

            <div style={styles.modalFooter}>
              <button style={styles.cancelBtn}
                onClick={() => setShowModal(false)}>Cancel</button>
              <button style={styles.saveBtn}
                onClick={handleSave}>Add</button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

// ── HELPER COMPONENTS ────────────────────────────────────────

// Person icon for gender visual
function PersonIcon({ color }) {
  return (
    <svg width="22" height="32" viewBox="0 0 22 32" fill={color}>
      <circle cx="11" cy="8" r="6" />
      <path d="M1 30 C1 20 21 20 21 30" />
    </svg>
  );
}

// Mini stat card
function MiniStat({ label, value }) {
  return (
    <div style={styles.miniStat}>
      <div style={styles.miniStatLabel}>{label}</div>
      <div style={styles.miniStatValue}>{value}</div>
    </div>
  );
}

// Reusable form field
function FormField({ label, value, onChange, placeholder, type = 'text', options = [] }) {
  return (
    <div style={styles.formField}>
      <label style={styles.fieldLabel}>{label}</label>
      {type === 'select' ? (
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          style={styles.input}
        >
          <option value="">Select...</option>
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : (
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          style={styles.input}
        />
      )}
    </div>
  );
}

// ── STYLES ───────────────────────────────────────────────────
const styles = {
  page: {
    padding: '30px',
    minHeight: '100vh',
    background: '#f2f4f6',
    fontFamily: 'Inter, sans-serif',
  },
  pageTitle: {
    fontSize: '26px', fontWeight: '700',
    color: '#051c2c', marginBottom: '20px',
    letterSpacing: '-0.3px',
  },

  // Tabs
  tabRow: {
    display: 'flex', gap: '8px', marginBottom: '20px',
  },
  tab: {
    padding: '9px 20px', borderRadius: '8px',
    border: 'none', fontSize: '13px', fontWeight: '600',
    cursor: 'pointer', background: '#2a3f52', color: '#b6bdc2',
    fontFamily: 'Inter, sans-serif',
    display: 'flex', alignItems: 'center', gap: '6px',
  },
  tabActive: {
    background: '#1a2f42', color: '#ffffff',
  },
  tabTick: {
    background: '#16a34a', color: '#fff',
    borderRadius: '50%', width: '16px', height: '16px',
    display: 'inline-flex', alignItems: 'center',
    justifyContent: 'center', fontSize: '9px',
  },

  // Stats
  statsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    gap: '12px', marginBottom: '16px',
  },
  miniStat: {
    background: '#ffffff', borderRadius: '10px',
    border: '1px solid #e8ecf0', padding: '16px',
  },
  miniStatLabel: {
    fontSize: '11px', color: '#5a6878',
    fontWeight: '500', marginBottom: '6px',
  },
  miniStatValue: {
    fontSize: '28px', fontWeight: '800',
    color: '#051c2c', lineHeight: 1,
  },

  // Gender visuals
  genderRow: {
    display: 'grid', gridTemplateColumns: '1fr 1fr',
    gap: '12px', marginBottom: '20px',
  },
  genderCard: {
    background: '#ffffff', borderRadius: '10px',
    border: '1px solid #e8ecf0', padding: '16px',
  },
  genderTitle: {
    fontSize: '12px', fontWeight: '600',
    color: '#051c2c', marginBottom: '10px',
  },
  peopleRow: {
    display: 'flex', flexWrap: 'wrap',
    gap: '4px', marginBottom: '8px',
  },
  genderLegend: {
    display: 'flex', gap: '16px',
    fontSize: '11px', color: '#5a6878',
  },

  // Table controls
  tableHeader: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: '12px',
    flexWrap: 'wrap', gap: '10px',
  },
  tableTitle: {
    fontSize: '18px', fontWeight: '700', color: '#051c2c',
  },
  tableControls: {
    display: 'flex', gap: '8px', alignItems: 'center',
    flexWrap: 'wrap',
  },
  searchWrap: {
    display: 'flex', alignItems: 'center',
    background: '#ffffff', border: '1.5px solid #e8ecf0',
    borderRadius: '8px', padding: '0 10px', gap: '6px',
  },
  searchIcon: { fontSize: '12px' },
  searchInput: {
    border: 'none', outline: 'none', fontSize: '12px',
    padding: '8px 0', width: '130px',
    fontFamily: 'Inter, sans-serif', color: '#051c2c',
    background: 'transparent',
  },
  addBtn: {
    background: '#051c2c', color: '#ffffff',
    border: 'none', borderRadius: '8px',
    padding: '9px 18px', fontSize: '13px',
    fontWeight: '600', cursor: 'pointer',
    fontFamily: 'Inter, sans-serif',
  },

  // Table
  tableWrap: {
    background: '#ffffff', borderRadius: '12px',
    border: '1px solid #e8ecf0', overflow: 'hidden',
  },
  table: { width: '100%', borderCollapse: 'collapse' },
  tableHeadRow: { background: '#051c2c' },
  th: {
    padding: '12px 16px', textAlign: 'left',
    fontSize: '11px', fontWeight: '600',
    color: '#ffffff', textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  tr: { borderBottom: '1px solid #f0f2f4' },
  td: {
    padding: '12px 16px', fontSize: '13px',
    color: '#051c2c', verticalAlign: 'middle',
  },
  empId: {
    fontFamily: 'monospace', fontSize: '12px', color: '#5a6878',
  },
  nameCell: {
    display: 'flex', alignItems: 'center', gap: '8px',
  },
  avatar: {
    width: '30px', height: '30px', borderRadius: '50%',
    background: '#051c2c', color: '#ffffff',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '10px', fontWeight: '700', flexShrink: 0,
  },
  learnerName: { fontWeight: '500' },
  activeTick: {
    background: '#16a34a', color: '#fff',
    borderRadius: '50%', width: '15px', height: '15px',
    display: 'inline-flex', alignItems: 'center',
    justifyContent: 'center', fontSize: '8px',
  },
  actionBtn: {
    background: '#051c2c', border: 'none',
    borderRadius: '6px', padding: '5px 8px',
    cursor: 'pointer', fontSize: '13px',
  },
  actionMenu: {
    position: 'absolute', right: '50px', top: '8px',
    background: '#ffffff', border: '1px solid #e8ecf0',
    borderRadius: '8px', boxShadow: '0 4px 20px rgba(5,28,44,0.15)',
    zIndex: 10, overflow: 'hidden', minWidth: '140px',
  },
  actionMenuItem: {
    display: 'block', width: '100%', padding: '9px 14px',
    background: 'none', border: 'none', textAlign: 'left',
    fontSize: '13px', cursor: 'pointer', color: '#051c2c',
    fontFamily: 'Inter, sans-serif',
  },
  emptyState: {
    padding: '40px', textAlign: 'center',
    color: '#9baabb', fontSize: '14px',
  },

  // Modal
  overlay: {
    position: 'fixed', inset: 0,
    background: 'rgba(5,28,44,0.55)',
    zIndex: 999, display: 'flex',
    alignItems: 'center', justifyContent: 'center',
    padding: '20px',
  },
  modal: {
    background: '#ffffff', borderRadius: '16px',
    width: '100%', maxWidth: '600px',
    maxHeight: '90vh', overflowY: 'auto',
    boxShadow: '0 24px 64px rgba(5,28,44,0.25)',
  },
  modalHeader: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', padding: '20px 24px',
    borderBottom: '1px solid #e8ecf0',
    position: 'sticky', top: 0,
    background: '#ffffff', zIndex: 1,
  },
  modalTitle: {
    fontSize: '18px', fontWeight: '700', color: '#051c2c',
  },
  modalClose: {
    background: 'none', border: 'none',
    fontSize: '24px', cursor: 'pointer', color: '#9baabb',
  },
  modalBody: { padding: '20px 24px' },
  photoUpload: {
    display: 'flex', justifyContent: 'flex-end',
    marginBottom: '16px',
  },
  photoPlaceholder: {
    width: '80px', height: '80px',
    border: '2px dashed #e8ecf0', borderRadius: '10px',
    display: 'flex', alignItems: 'center',
    justifyContent: 'center', fontSize: '24px',
    cursor: 'pointer',
  },
  formGrid: {
    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px',
  },
  formField: { display: 'flex', flexDirection: 'column', gap: '5px' },
  fieldLabel: {
    fontSize: '11px', fontWeight: '700',
    color: '#5a6878', textTransform: 'uppercase', letterSpacing: '0.5px',
  },
  input: {
    padding: '10px 12px', border: '1.5px solid #e8ecf0',
    borderRadius: '8px', fontSize: '13px', outline: 'none',
    background: '#f8f9fa', color: '#051c2c',
    fontFamily: 'Inter, sans-serif',
  },
  statusRow: { marginTop: '16px' },
  radioGroup: {
    display: 'flex', gap: '24px', marginTop: '8px',
  },
  radioLabel: {
    display: 'flex', alignItems: 'center',
    gap: '6px', fontSize: '13px', cursor: 'pointer', color: '#051c2c',
  },
  modalFooter: {
    padding: '14px 24px', borderTop: '1px solid #e8ecf0',
    display: 'flex', justifyContent: 'flex-end', gap: '10px',
  },
  cancelBtn: {
    padding: '9px 20px', background: 'none',
    border: '1.5px solid #e8ecf0', borderRadius: '8px',
    fontSize: '13px', cursor: 'pointer', color: '#051c2c',
    fontFamily: 'Inter, sans-serif',
  },
  saveBtn: {
    padding: '9px 24px', background: '#051c2c',
    border: 'none', borderRadius: '8px', fontSize: '13px',
    fontWeight: '600', cursor: 'pointer', color: '#ffffff',
    fontFamily: 'Inter, sans-serif',
  },
};

export default LearnersPage;