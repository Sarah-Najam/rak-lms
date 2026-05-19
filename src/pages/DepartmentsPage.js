// ============================================================
// DepartmentsPage.js
//
// WHAT THIS PAGE HAS (from the wireframe):
// 1. 4 big stat cards — Total Depts, Population,
//    Total Learners, Total Courses (with large icons)
// 2. Search by department + Add Department button
// 3. Departments table — Population, Active, Inactive
// 4. Add Department modal — name, HOD, designation,
//    population, photo upload
// 5. Department Profile popup — HOD details,
//    active vs inactive learners side by side
// ============================================================

import React, { useState } from 'react';
import { DEPARTMENTS, LEARNERS, COURSES } from '../data/sampleData';

function DepartmentsPage() {

  // ── STATE ──────────────────────────────────────────────────
  const [departments,  setDepartments]  = useState(DEPARTMENTS);
  const [selected,     setSelected]     = useState(null);
  const [showAdd,      setShowAdd]      = useState(false);
  const [searchTerm,   setSearchTerm]   = useState('');
  const [form,         setForm]         = useState({
    name: '', hod: '', designation: '', population: '',
  });

  // ── STATS ──────────────────────────────────────────────────
  const totalDepts      = departments.length;
  const totalPopulation = departments.reduce((s, d) => s + (d.population || d.learners * 8), 0);
  const totalLearners   = departments.reduce((s, d) => s + d.learners, 0);
  const totalCourses    = COURSES.length;

  // ── FILTER ─────────────────────────────────────────────────
  const filtered = departments.filter(d =>
    d.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ── GET LEARNERS FOR DEPARTMENT ────────────────────────────
  const getDeptLearners = (deptName) =>
    LEARNERS.filter(l => l.dept === deptName);

  const getActiveLearners = (deptName) =>
    getDeptLearners(deptName).filter(l => l.status === 'Active');

  const getInactiveLearners = (deptName) =>
    getDeptLearners(deptName).filter(l => l.status !== 'Active');

  // ── SAVE NEW DEPARTMENT ────────────────────────────────────
  const handleSave = () => {
    if (!form.name) { alert('Department name is required.'); return; }
    const newDept = {
      id: Date.now(),
      name: form.name,
      hod: form.hod,
      designation: form.designation,
      population: +form.population || 0,
      learners: 0,
      courses: 0,
      male: 0,
      female: 0,
      hours: 0,
      score: 0,
    };
    setDepartments([...departments, newDept]);
    setForm({ name: '', hod: '', designation: '', population: '' });
    setShowAdd(false);
  };

  // ── INITIALS ───────────────────────────────────────────────
  const initials = name =>
    name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();

  return (
    <div style={styles.page}>

      {/* ── PAGE TITLE ── */}
    

      {/* ── BIG STAT CARDS ── */}
      {/* These match the wireframe exactly — large icons, */}
      {/* big numbers, white background with navy text */}
      <div style={styles.statGrid}>

        <div style={styles.statCard}>
          <div style={styles.statIconWrap}>
            {/* Building/department icon */}
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <rect x="8" y="14" width="32" height="28" rx="2"
                stroke="#051c2c" strokeWidth="2.5" fill="none"/>
              <rect x="14" y="8" width="20" height="8" rx="1"
                stroke="#051c2c" strokeWidth="2.5" fill="none"/>
              <rect x="18" y="28" width="5" height="8"
                fill="#051c2c" rx="1"/>
              <rect x="25" y="28" width="5" height="8"
                fill="#051c2c" rx="1"/>
              <line x1="8" y1="24" x2="40" y2="24"
                stroke="#051c2c" strokeWidth="2"/>
            </svg>
          </div>
          <div style={styles.statNum}>{totalDepts}</div>
          <div style={styles.statLbl}>TOTAL DEPARTMENTS</div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statIconWrap}>
            {/* People/population icon */}
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <circle cx="24" cy="16" r="7"
                stroke="#051c2c" strokeWidth="2.5" fill="none"/>
              <circle cx="10" cy="18" r="5"
                stroke="#051c2c" strokeWidth="2" fill="none"/>
              <circle cx="38" cy="18" r="5"
                stroke="#051c2c" strokeWidth="2" fill="none"/>
              <path d="M4 38 C4 28 16 24 24 24 C32 24 44 28 44 38"
                stroke="#051c2c" strokeWidth="2.5" fill="none"/>
              <path d="M1 38 C1 32 6 28 10 28"
                stroke="#051c2c" strokeWidth="2" fill="none"/>
              <path d="M47 38 C47 32 42 28 38 28"
                stroke="#051c2c" strokeWidth="2" fill="none"/>
            </svg>
          </div>
          <div style={styles.statNum}>{totalPopulation}</div>
          <div style={styles.statLbl}>TOTAL POPULATION</div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statIconWrap}>
            {/* Book/learners icon */}
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <rect x="8" y="8" width="26" height="34" rx="2"
                stroke="#051c2c" strokeWidth="2.5" fill="none"/>
              <path d="M34 8 C34 8 40 10 40 20 C40 30 34 42 34 42"
                stroke="#051c2c" strokeWidth="2.5" fill="none"/>
              <line x1="14" y1="18" x2="28" y2="18"
                stroke="#051c2c" strokeWidth="2"/>
              <line x1="14" y1="24" x2="28" y2="24"
                stroke="#051c2c" strokeWidth="2"/>
              <line x1="14" y1="30" x2="22" y2="30"
                stroke="#051c2c" strokeWidth="2"/>
            </svg>
          </div>
          <div style={styles.statNum}>{totalLearners}</div>
          <div style={styles.statLbl}>TOTAL LEARNERS</div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statIconWrap}>
            {/* Courses/certificate icon */}
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <rect x="6" y="8" width="36" height="26" rx="2"
                stroke="#051c2c" strokeWidth="2.5" fill="none"/>
              <line x1="12" y1="18" x2="36" y2="18"
                stroke="#051c2c" strokeWidth="2"/>
              <line x1="12" y1="24" x2="28" y2="24"
                stroke="#051c2c" strokeWidth="2"/>
              <circle cx="34" cy="36" r="7"
                stroke="#051c2c" strokeWidth="2.5" fill="white"/>
              <path d="M31 36 L33 38 L37 34"
                stroke="#051c2c" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div style={styles.statNum}>{totalCourses}</div>
          <div style={styles.statLbl}>TOTAL COURSES</div>
        </div>

      </div>

      {/* ── TABLE CONTROLS ── */}
      <div style={styles.controls}>
        <div style={styles.searchWrap}>
          <span style={{ fontSize: '13px' }}>🔍</span>
          <input
            style={styles.searchInput}
            placeholder="Search by Department"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <button style={styles.addBtn} onClick={() => setShowAdd(true)}>
          Add Department
        </button>
      </div>

      {/* ── DEPARTMENTS TABLE ── */}
      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.theadRow}>
              {['No.', 'Department', 'Department Population',
                'Active Learners', 'Inactive Learners', ''].map(h => (
                <th key={h} style={styles.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((dept, i) => {
              const active   = getActiveLearners(dept.name).length || dept.learners - 2;
              const inactive = getInactiveLearners(dept.name).length || 2;
              const pop      = dept.population || dept.learners * 8;
              return (
                <tr key={dept.id} style={styles.tr}>
                  <td style={styles.td}>{i + 1}</td>
                  <td style={styles.td}>
                    {/* Clicking dept name opens the profile popup */}
                    <button
                      style={styles.deptNameBtn}
                      onClick={() => setSelected(dept)}
                    >
                      {dept.name}
                    </button>
                  </td>
                  <td style={{ ...styles.td, fontWeight: 600 }}>{pop}</td>
                  <td style={{ ...styles.td, fontWeight: 600, color: '#15803d' }}>
                    {active}
                  </td>
                  <td style={{ ...styles.td, fontWeight: 600, color: '#9b2020' }}>
                    {inactive}
                  </td>
                  <td style={styles.td}>
                    <button
                      style={styles.viewBtn}
                      onClick={() => setSelected(dept)}
                    >
                      View
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div style={styles.empty}>No departments found.</div>
        )}
      </div>

      {/* ── ADD DEPARTMENT MODAL ── */}
      {showAdd && (
        <div style={styles.overlay} onClick={() => setShowAdd(false)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>

            <div style={styles.modalHeader}>
              <span style={styles.modalTitle}>Add Department</span>
              <button style={styles.modalClose}
                onClick={() => setShowAdd(false)}>×</button>
            </div>

            <div style={styles.modalBody}>
              <div style={styles.addModalGrid}>

                {/* Left — form fields */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <F label="Name of the Department *"
                    value={form.name}
                    onChange={v => setForm({ ...form, name: v })}
                    placeholder="e.g. Marketing"
                  />
                  <F label="Department Head"
                    value={form.hod}
                    onChange={v => setForm({ ...form, hod: v })}
                    placeholder="Search by name"
                  />
                  <F label="Designation"
                    value={form.designation}
                    onChange={v => setForm({ ...form, designation: v })}
                    placeholder="e.g. HR Director"
                  />
                  <F label="Department Population"
                    value={form.population}
                    onChange={v => setForm({ ...form, population: v })}
                    placeholder="e.g. 105"
                    type="number"
                  />
                </div>

                {/* Right — photo upload */}
                <div style={styles.photoUpload}>
                  <div style={styles.photoCircle}>
                    <span style={{ fontSize: '28px' }}>👤</span>
                  </div>
                  <div style={styles.uploadLabel}>Upload photo</div>
                </div>

              </div>
            </div>

            <div style={styles.modalFooter}>
              <button style={styles.cancelBtn}
                onClick={() => setShowAdd(false)}>Cancel</button>
              <button style={styles.saveBtn}
                onClick={handleSave}>Add</button>
            </div>

          </div>
        </div>
      )}

      {/* ── DEPARTMENT PROFILE POPUP ── */}
      {selected && (
        <div style={styles.overlay} onClick={() => setSelected(null)}>
          <div style={styles.profileModal} onClick={e => e.stopPropagation()}>

            <div style={styles.modalHeader}>
              <span style={styles.modalTitle}>{selected.name}</span>
              <button style={styles.modalClose}
                onClick={() => setSelected(null)}>×</button>
            </div>

            <div style={styles.modalBody}>

              {/* HOD Section */}
              <div style={styles.hodSection}>
                <div style={styles.hodInfo}>
                  <div style={styles.hodLabel}>Department head</div>
                  <div style={styles.hodName}>{selected.hod}</div>
                  {selected.designation && (
                    <div style={styles.hodDesig}>{selected.designation}</div>
                  )}
                </div>
                {/* HOD Avatar */}
                <div style={styles.hodAvatar}>
                  {initials(selected.hod)}
                </div>
              </div>

              {/* Stats row */}
              <div style={styles.profileStats}>
                {[
                  ['Active Learners',   getActiveLearners(selected.name).length || selected.learners - 2],
                  ['Inactive Learners', getInactiveLearners(selected.name).length || 2],
                  ['Total Courses',     selected.courses],
                  ['Training Hours',    selected.hours + 'h'],
                ].map(([k, v]) => (
                  <div key={k} style={styles.profileStatCard}>
                    <div style={styles.profileStatNum}>{v}</div>
                    <div style={styles.profileStatLbl}>{k}</div>
                  </div>
                ))}
              </div>

              {/* Active vs Inactive learners side by side */}
              <div style={styles.learnersGrid}>

                {/* Active Learners */}
                <div>
                  <div style={styles.learnerColTitle}>Active Learners</div>
                  {(getActiveLearners(selected.name).length > 0
                    ? getActiveLearners(selected.name)
                    : [
                        { id: 1, name: 'Fatima Abdulla' },
                        { id: 2, name: 'Hassan Al Ali' },
                        { id: 3, name: 'Latifa Al Hamadi' },
                      ]
                  ).map(l => (
                    <div key={l.id} style={styles.learnerRow}>
                      <div style={styles.learnerDot} />
                      {l.name}
                    </div>
                  ))}
                </div>

                {/* Divider */}
                <div style={styles.divider} />

                {/* Inactive Learners */}
                <div>
                  <div style={styles.learnerColTitle}>Inactive Learners</div>
                  {(getInactiveLearners(selected.name).length > 0
                    ? getInactiveLearners(selected.name)
                    : [
                        { id: 4, name: 'Saeed Al Mansoori' },
                        { id: 5, name: 'Mariam Al Ketbi' },
                        { id: 6, name: 'Yousef Al Zarooni' },
                      ]
                  ).map(l => (
                    <div key={l.id} style={styles.learnerRow}>
                      <div style={{ ...styles.learnerDot, background: '#9baabb' }} />
                      {l.name}
                    </div>
                  ))}
                </div>

              </div>

              {/* Department Population */}
              <div style={styles.popRow}>
                <span style={styles.popLabel}>Department Population</span>
                <span style={styles.popValue}>
                  {selected.population || selected.learners * 8}
                </span>
              </div>

            </div>

            <div style={styles.modalFooter}>
              <button style={styles.cancelBtn}
                onClick={() => setSelected(null)}>Close</button>
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
        fontSize: '11px', fontWeight: '700',
        color: '#5a6878', textTransform: 'uppercase', letterSpacing: '0.5px',
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
    color: '#051c2c', marginBottom: '20px', letterSpacing: '-0.3px',
  },

  // Big stat cards
  statGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '16px', marginBottom: '22px',
  },
  statCard: {
    background: '#ffffff', borderRadius: '14px',
    border: '1.5px solid #e8ecf0', padding: '24px 20px',
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', gap: '10px', textAlign: 'center',
  },
  statIconWrap: {
    width: '64px', height: '64px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  statNum: {
    fontSize: '36px', fontWeight: '800',
    color: '#051c2c', lineHeight: 1,
  },
  statLbl: {
    fontSize: '11px', fontWeight: '700',
    color: '#5a6878', textTransform: 'uppercase', letterSpacing: '0.8px',
  },

  // Controls
  controls: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: '14px',
  },
  searchWrap: {
    display: 'flex', alignItems: 'center',
    background: '#ffffff', border: '1.5px solid #e8ecf0',
    borderRadius: '8px', padding: '0 12px', gap: '6px',
  },
  searchInput: {
    border: 'none', outline: 'none', fontSize: '13px',
    padding: '10px 0', width: '220px', background: 'transparent',
    fontFamily: 'Inter, sans-serif',
  },
  addBtn: {
    background: '#051c2c', color: '#ffffff', border: 'none',
    borderRadius: '8px', padding: '10px 20px', fontSize: '13px',
    fontWeight: '600', cursor: 'pointer', fontFamily: 'Inter, sans-serif',
  },

  // Table
  tableWrap: {
    background: '#ffffff', borderRadius: '12px',
    border: '1px solid #e8ecf0', overflow: 'hidden',
  },
  table: { width: '100%', borderCollapse: 'collapse' },
  theadRow: { background: '#ffffff', borderBottom: '2px solid #e8ecf0' },
  th: {
    padding: '12px 16px', textAlign: 'left',
    fontSize: '11px', fontWeight: '700',
    color: '#5a6878', textTransform: 'uppercase', letterSpacing: '0.5px',
  },
  tr: { borderBottom: '1px solid #f0f2f4' },
  td: {
    padding: '14px 16px', fontSize: '13px',
    color: '#051c2c', verticalAlign: 'middle',
  },
  deptNameBtn: {
    background: 'none', border: 'none', cursor: 'pointer',
    fontSize: '13px', fontWeight: '600', color: '#051c2c',
    padding: 0, fontFamily: 'Inter, sans-serif',
    textDecoration: 'underline', textDecorationColor: '#e8ecf0',
  },
  viewBtn: {
    background: '#f2f4f6', border: 'none', borderRadius: '6px',
    padding: '5px 14px', fontSize: '12px', fontWeight: '600',
    cursor: 'pointer', color: '#051c2c', fontFamily: 'Inter, sans-serif',
  },
  empty: {
    padding: '40px', textAlign: 'center',
    color: '#9baabb', fontSize: '14px',
  },

  // Modal shared
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(5,28,44,0.55)',
    zIndex: 999, display: 'flex', alignItems: 'center',
    justifyContent: 'center', padding: '20px',
  },
  modal: {
    background: '#ffffff', borderRadius: '16px', width: '100%',
    maxWidth: '520px', maxHeight: '90vh', overflowY: 'auto',
    boxShadow: '0 24px 64px rgba(5,28,44,0.25)',
  },
  profileModal: {
    background: '#ffffff', borderRadius: '16px', width: '100%',
    maxWidth: '580px', maxHeight: '90vh', overflowY: 'auto',
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

  // Add dept modal
  addModalGrid: {
    display: 'grid', gridTemplateColumns: '1fr auto', gap: '24px',
  },
  photoUpload: {
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', gap: '8px', paddingTop: '8px',
  },
  photoCircle: {
    width: '80px', height: '80px', borderRadius: '50%',
    border: '2px dashed #e8ecf0', display: 'flex',
    alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
  },
  uploadLabel: { fontSize: '11px', color: '#9baabb', fontWeight: '500' },

  // Department profile popup
  hodSection: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: '20px',
    padding: '16px 18px', background: '#f8f9fa',
    borderRadius: '10px', border: '1px solid #e8ecf0',
  },
  hodInfo: {},
  hodLabel: { fontSize: '11px', color: '#9baabb', fontWeight: '500' },
  hodName: { fontSize: '16px', fontWeight: '700', color: '#051c2c', marginTop: '2px' },
  hodDesig: { fontSize: '13px', color: '#5a6878', marginTop: '2px' },
  hodAvatar: {
    width: '52px', height: '52px', borderRadius: '50%',
    background: '#051c2c', color: '#ffffff', display: 'flex',
    alignItems: 'center', justifyContent: 'center',
    fontSize: '16px', fontWeight: '700', flexShrink: 0,
  },

  profileStats: {
    display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '10px', marginBottom: '20px',
  },
  profileStatCard: {
    background: '#f8f9fa', borderRadius: '10px',
    padding: '14px', textAlign: 'center',
    border: '1px solid #e8ecf0',
  },
  profileStatNum: {
    fontSize: '22px', fontWeight: '800', color: '#051c2c',
  },
  profileStatLbl: {
    fontSize: '10px', color: '#5a6878',
    fontWeight: '600', marginTop: '4px',
    textTransform: 'uppercase', letterSpacing: '0.4px',
  },

  learnersGrid: {
    display: 'grid', gridTemplateColumns: '1fr 1px 1fr',
    gap: '16px', marginBottom: '16px',
    padding: '16px', background: '#f8f9fa',
    borderRadius: '10px', border: '1px solid #e8ecf0',
  },
  learnerColTitle: {
    fontSize: '12px', fontWeight: '700', color: '#051c2c',
    marginBottom: '10px',
  },
  learnerRow: {
    display: 'flex', alignItems: 'center', gap: '8px',
    fontSize: '13px', color: '#051c2c', padding: '4px 0',
  },
  learnerDot: {
    width: '8px', height: '8px', borderRadius: '50%',
    background: '#051c2c', flexShrink: 0,
  },
  divider: { background: '#e8ecf0', width: '1px' },

  popRow: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', padding: '12px 16px',
    background: '#f8f9fa', borderRadius: '8px',
    border: '1px solid #e8ecf0',
  },
  popLabel: { fontSize: '13px', fontWeight: '600', color: '#051c2c' },
  popValue: { fontSize: '18px', fontWeight: '800', color: '#051c2c' },
};

export default DepartmentsPage;