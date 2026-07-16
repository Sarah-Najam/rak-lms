import React, { useState, useEffect } from 'react';
import api from '../api';
import Pagination from '../components/Pagination';

const ITEMS_PER_PAGE = 20;

function DepartmentsPage() {

  const [departments,    setDepartments]    = useState([]);
  const [selected,       setSelected]       = useState(null);
  const [showAdd,        setShowAdd]        = useState(false);
  const [searchTerm,     setSearchTerm]     = useState('');
  const [loading,        setLoading]        = useState(true);
  const [currentPage,    setCurrentPage]    = useState(1);
  const [deptLearners,   setDeptLearners]   = useState([]);
  const [deptLoading,    setDeptLoading]    = useState(false);
  const [learnerCourses, setLearnerCourses] = useState({});
  const [profileLearner, setProfileLearner] = useState(null);

 const [form, setForm] = useState({
    name: '', hod: '', designation: ''
  });

  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = () => {
    api.getDepartments()
      .then(data => {
        if (Array.isArray(data)) setDepartments(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const filtered = departments.filter(d =>
    d.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginated = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const totalLearners   = departments.reduce((s, d) => s + (+d.learner_count || 0), 0);



  const openDetail = async (dept) => {
    setSelected(dept);
    setDeptLoading(true);
    setDeptLearners([]);
    setLearnerCourses({});
    try {
      const all = await api.getLearners();
      if (Array.isArray(all)) {
        const dLearners = all.filter(l => l.department_id === dept.id);
        setDeptLearners(dLearners);

        // Load courses for each learner
        const coursesMap = {};
        await Promise.all(dLearners.map(async learner => {
          try {
            const lCourses = await api.getEnrollmentsByLearner(learner.id);
            if (Array.isArray(lCourses)) coursesMap[learner.id] = lCourses;
          } catch {
            coursesMap[learner.id] = [];
          }
        }));
        setLearnerCourses(coursesMap);
      }
    } catch (err) {
      setDeptLearners([]);
    }
    setDeptLoading(false);
  };

  const handleSave = async () => {
    if (!form.name) { alert('Department name is required.'); return; }
    try {
      const newDept = await api.addDepartment({
        name:        form.name,
        hod:         form.hod,
        designation: form.designation,
      });
      if (newDept.id) {
        loadDepartments();
setForm({ name: '', hod: '', designation: '' });        setShowAdd(false);
      } else {
        alert(newDept.error || 'Could not save department.');
      }
    } catch (err) {
      alert('Error connecting to server.');
    }
  };

  const initials = name =>
    name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();

  const statusColor = status => {
    if (status === 'Completed' || status === 'Attended') return { bg: '#dcfce7', color: '#15803d' };
    if (status === 'Ongoing')   return { bg: '#dbeafe', color: '#1d4ed8' };
    return { bg: '#fef9c3', color: '#a16207' };
  };

  return (
    <div style={styles.page}>

      {/* ── STAT CARDS ── */}
      <div style={styles.statGrid}>
        <div style={styles.statCard}>
          <div style={styles.statIconWrap}>
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <rect x="8" y="14" width="32" height="28" rx="2" stroke="#051c2c" strokeWidth="2.5" fill="none"/>
              <rect x="14" y="8" width="20" height="8" rx="1" stroke="#051c2c" strokeWidth="2.5" fill="none"/>
              <rect x="18" y="28" width="5" height="8" fill="#051c2c" rx="1"/>
              <rect x="25" y="28" width="5" height="8" fill="#051c2c" rx="1"/>
              <line x1="8" y1="24" x2="40" y2="24" stroke="#051c2c" strokeWidth="2"/>
            </svg>
          </div>
          <div style={styles.statNum}>{departments.length}</div>
          <div style={styles.statLbl}>TOTAL DEPARTMENTS</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIconWrap}>
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <circle cx="24" cy="16" r="7" stroke="#051c2c" strokeWidth="2.5" fill="none"/>
              <circle cx="10" cy="18" r="5" stroke="#051c2c" strokeWidth="2" fill="none"/>
              <circle cx="38" cy="18" r="5" stroke="#051c2c" strokeWidth="2" fill="none"/>
              <path d="M4 38 C4 28 16 24 24 24 C32 24 44 28 44 38" stroke="#051c2c" strokeWidth="2.5" fill="none"/>
            </svg>
          </div>
          <div style={styles.statNum}>{totalLearners}</div>
          <div style={styles.statLbl}>ACTIVE LEARNERS</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIconWrap}>
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <rect x="8" y="8" width="26" height="34" rx="2" stroke="#051c2c" strokeWidth="2.5" fill="none"/>
              <path d="M34 8 C34 8 40 10 40 20 C40 30 34 42 34 42" stroke="#051c2c" strokeWidth="2.5" fill="none"/>
              <line x1="14" y1="18" x2="28" y2="18" stroke="#051c2c" strokeWidth="2"/>
              <line x1="14" y1="24" x2="28" y2="24" stroke="#051c2c" strokeWidth="2"/>
              <line x1="14" y1="30" x2="22" y2="30" stroke="#051c2c" strokeWidth="2"/>
            </svg>
          </div>
          <div style={styles.statNum}>{totalLearners}</div>
          <div style={styles.statLbl}>TOTAL LEARNERS</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIconWrap}>
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <rect x="6" y="8" width="36" height="26" rx="2" stroke="#051c2c" strokeWidth="2.5" fill="none"/>
              <line x1="12" y1="18" x2="36" y2="18" stroke="#051c2c" strokeWidth="2"/>
              <line x1="12" y1="24" x2="28" y2="24" stroke="#051c2c" strokeWidth="2"/>
              <circle cx="34" cy="36" r="7" stroke="#051c2c" strokeWidth="2.5" fill="white"/>
              <path d="M31 36 L33 38 L37 34" stroke="#051c2c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div style={styles.statNum}>{departments.reduce((s, d) => s + (+d.course_count || 0), 0)}</div>
          <div style={styles.statLbl}>TOTAL COURSES</div>
        </div>
      </div>

      {/* ── CONTROLS ── */}
      <div style={styles.controls}>
        <div style={styles.searchWrap}>
          <span style={{ fontSize: '13px' }}>🔍</span>
          <input
            style={styles.searchInput}
            placeholder="Search by Department"
            value={searchTerm}
            onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          />
        </div>
        <button style={styles.addBtn} onClick={() => setShowAdd(true)}>
          Add Department
        </button>
      </div>

      {/* ── TABLE ── */}
      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#9baabb' }}>
          Loading departments...
        </div>
      ) : (
        <div style={styles.tableWrap}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ ...styles.table, minWidth: '800px' }}>
              <thead>
                <tr style={styles.theadRow}>
                  {['No.', 'Department', 'Population', 'Active Learners',
                    'Inactive Learners', 'Total Courses', 'Total Training Hours', ''].map(h => (
                    <th key={h} style={styles.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.map((dept, i) => {
                  return (
                    <tr key={dept.id} style={styles.tr}>
                      <td style={styles.td}>
                        {(currentPage - 1) * ITEMS_PER_PAGE + i + 1}
                      </td>
                      <td style={styles.td}>
                        <button style={styles.deptNameBtn} onClick={() => openDetail(dept)}>
                          {dept.name}
                        </button>
                      </td>
                      <td style={{ ...styles.td, fontWeight: 600 }}>{dept.learner_count || 0}</td>
                      <td style={{ ...styles.td, fontWeight: 600, color: '#15803d' }}>
                        {dept.learner_count || 0}
                      </td>
                      <td style={{ ...styles.td, fontWeight: 600, color: '#991b1b' }}>
                        {Math.max(0, (+dept.population || 0) - (+dept.learner_count || 0))}
                      </td>
                      <td style={{ ...styles.td, fontWeight: 600 }}>
                        {dept.course_count || 0}
                      </td>
                      <td style={{ ...styles.td, fontWeight: 600, color: '#5a6878' }}>
                        Click View →
                      </td>
                      <td style={styles.td}>
                        <button style={styles.viewBtn} onClick={() => openDetail(dept)}>
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filtered.length === 0 && (
            <div style={{ padding: '40px', textAlign: 'center', color: '#9baabb', fontSize: '14px' }}>
              {departments.length === 0
                ? 'No departments yet. Click "Add Department" to get started.'
                : 'No departments found.'
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

      {/* ── ADD DEPARTMENT MODAL ── */}
      {showAdd && (
        <div style={styles.overlay} onClick={() => setShowAdd(false)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <span style={styles.modalTitle}>Add Department</span>
              <button style={styles.modalClose} onClick={() => setShowAdd(false)}>×</button>
            </div>
            <div style={styles.modalBody}>
              <div style={styles.addModalGrid}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <F label="Name of the Department *" value={form.name}        onChange={v => setForm({...form, name: v})}        placeholder="e.g. Marketing" />
                  <F label="Department Head"          value={form.hod}         onChange={v => setForm({...form, hod: v})}         placeholder="Full name" />
                  <F label="Designation"              value={form.designation} onChange={v => setForm({...form, designation: v})} placeholder="e.g. HR Director" />
                </div>
                <div style={styles.photoUpload}>
                  <div style={styles.photoCircle}><span style={{ fontSize: '28px' }}>👤</span></div>
                  <div style={{ fontSize: '11px', color: '#9baabb', fontWeight: '500' }}>Upload photo</div>
                </div>
              </div>
            </div>
            <div style={styles.modalFooter}>
              <button style={styles.cancelBtn} onClick={() => setShowAdd(false)}>Cancel</button>
              <button style={styles.saveBtn}   onClick={handleSave}>Add</button>
            </div>
          </div>
        </div>
      )}

      {/* ── DEPARTMENT DETAIL POPUP ── */}
      {selected && (
        <div style={styles.overlay} onClick={() => { setSelected(null); setProfileLearner(null); }}>
          <div style={{ ...styles.modal, maxWidth: '720px' }} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <span style={styles.modalTitle}>{selected.name}</span>
              <button style={styles.modalClose} onClick={() => { setSelected(null); setProfileLearner(null); }}>×</button>
            </div>
            <div style={styles.modalBody}>

              {/* HOD section */}
              <div style={styles.hodSection}>
                <div>
                  <div style={{ fontSize: '11px', color: '#9baabb' }}>Department Head</div>
                  <div style={{ fontSize: '16px', fontWeight: '700', color: '#051c2c', marginTop: '2px' }}>
                    {selected.hod || '—'}
                  </div>
                  {selected.designation && (
                    <div style={{ fontSize: '13px', color: '#5a6878', marginTop: '2px' }}>
                      {selected.designation}
                    </div>
                  )}
                </div>
                <div style={styles.hodAvatar}>
                  {selected.hod ? initials(selected.hod) : '—'}
                </div>
              </div>

              {/* Stats */}
              <div style={styles.profileStats}>
                {[
                  ['Total Learners',  deptLearners.length],
                  ['Active',          deptLearners.filter(l => l.status === 'Active').length],
['Enrolled Courses', Object.values(learnerCourses).reduce((s, lc) => s + lc.length, 0)],                  ['Training Hours',  (() => {
                    let total = 0;
                    Object.values(learnerCourses).forEach(lc => {
                      lc.forEach(c => {
                        if (c.attended) total += +c.duration_hours || 0;
                      });
                    });
                    return total > 0 ? total + 'h' : '0h';
                  })()],
                ].map(([k, v]) => (
                  <div key={k} style={styles.profileStatCard}>
                    <div style={styles.profileStatNum}>{v}</div>
                    <div style={styles.profileStatLbl}>{k}</div>
                  </div>
                ))}
              </div>

              {/* Learners list with course badges */}
              <div>
                <div style={styles.sectionLabel}>
                  Learners in this Department
                  <span style={{ fontSize: '11px', color: '#9baabb', fontWeight: '400', marginLeft: '8px' }}>
                    {deptLearners.length} total
                  </span>
                </div>

                {deptLoading ? (
                  <div style={{ padding: '20px', textAlign: 'center', color: '#9baabb', fontSize: '13px' }}>
                    Loading learners...
                  </div>
                ) : deptLearners.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {deptLearners.map(learner => {
                      const lCourses = learnerCourses[learner.id] || [];
                      return (
                        <div
                          key={learner.id}
                          style={{
                            padding: '12px 14px', borderRadius: '10px',
                            border: '1px solid #e8ecf0', background: '#f8f9fa',
                          }}
                        >
                          {/* Learner header row */}
                          <div
                            style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
                            onClick={() => setProfileLearner(profileLearner?.id === learner.id ? null : learner)}
                          >
                            <div style={{
                              width: '34px', height: '34px', borderRadius: '50%',
                              background: '#051c2c', color: '#ffffff',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: '11px', fontWeight: '700', flexShrink: 0,
                            }}>
                              {learner.name.split(' ').slice(0,2).map(w => w[0]).join('')}
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: '13px', fontWeight: '600', color: '#051c2c' }}>
                                {learner.name}
                              </div>
                              <div style={{ fontSize: '11px', color: '#9baabb', marginTop: '1px' }}>
                                {learner.designation || '—'} · {learner.emp_id || '—'}
                              </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{
                                background: learner.status === 'Active' ? '#dcfce7' : '#fee2e2',
                                color:      learner.status === 'Active' ? '#15803d' : '#991b1b',
                                padding: '2px 8px', borderRadius: '10px',
                                fontSize: '11px', fontWeight: '600',
                              }}>
                                {learner.status}
                              </span>
                              <span style={{ fontSize: '11px', color: '#9baabb' }}>
                                {lCourses.length} course{lCourses.length !== 1 ? 's' : ''}
                              </span>
                              <span style={{ fontSize: '12px', color: '#9baabb' }}>
                                {profileLearner?.id === learner.id ? '▲' : '▼'}
                              </span>
                            </div>
                          </div>

                          {/* Course badges — show when learner is expanded */}
                          {profileLearner?.id === learner.id && (
                            <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #e8ecf0' }}>
                              {lCourses.length > 0 ? (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                  {lCourses.map((course, ci) => {
                                    const isDone = course.attended === true ||
                                      course.enrollment_status === 'Attended' ||
                                      course.enrollment_status === 'Completed';
                                    const sc = statusColor(isDone ? 'Completed' : course.status || 'Pending');
                                    return (
                                      <span
                                        key={ci}
                                        title={`${course.title} — ${isDone ? 'Attended' : course.status || 'Enrolled'}`}
                                        style={{
                                          display: 'inline-flex', alignItems: 'center', gap: '4px',
                                          padding: '4px 10px', borderRadius: '20px',
                                          background: sc.bg, color: sc.color,
                                          fontSize: '11px', fontWeight: '600',
                                          border: `1px solid ${sc.color}20`,
                                          maxWidth: '200px', overflow: 'hidden',
                                          textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                        }}
                                      >
                                        {isDone ? '✅' : '📚'}
                                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                          {course.title}
                                        </span>
                                      </span>
                                    );
                                  })}
                                </div>
                              ) : (
                                <div style={{ fontSize: '12px', color: '#9baabb', fontStyle: 'italic' }}>
                                  Not enrolled in any courses yet.
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div style={{ padding: '20px', background: '#f8f9fa', borderRadius: '8px', border: '1px solid #e8ecf0', textAlign: 'center', fontSize: '13px', color: '#9baabb' }}>
                    No learners assigned to this department yet.
                  </div>
                )}
              </div>

            </div>
            <div style={styles.modalFooter}>
              <button style={styles.cancelBtn} onClick={() => { setSelected(null); setProfileLearner(null); }}>Close</button>
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
      <label style={{ fontSize: '11px', fontWeight: '700', color: '#5a6878', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        {label}
      </label>
      <input
        type={type} value={value} placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
        style={{ padding: '10px 12px', border: '1.5px solid #e8ecf0', borderRadius: '8px', fontSize: '13px', outline: 'none', background: '#f8f9fa', color: '#051c2c', fontFamily: 'Inter, sans-serif', width: '100%' }}
      />
    </div>
  );
}

const styles = {
  page:           { padding: '30px', minHeight: '100vh', background: '#f2f4f6', fontFamily: 'Inter, sans-serif' },
  statGrid:       { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '22px' },
  statCard:       { background: '#ffffff', borderRadius: '14px', border: '1.5px solid #e8ecf0', padding: '24px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', textAlign: 'center' },
  statIconWrap:   { width: '64px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  statNum:        { fontSize: '36px', fontWeight: '800', color: '#051c2c', lineHeight: 1 },
  statLbl:        { fontSize: '11px', fontWeight: '700', color: '#5a6878', textTransform: 'uppercase', letterSpacing: '0.8px' },
  controls:       { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' },
  searchWrap:     { display: 'flex', alignItems: 'center', background: '#ffffff', border: '1.5px solid #e8ecf0', borderRadius: '8px', padding: '0 12px', gap: '6px' },
  searchInput:    { border: 'none', outline: 'none', fontSize: '13px', padding: '10px 0', width: '220px', background: 'transparent', fontFamily: 'Inter, sans-serif' },
  addBtn:         { background: '#051c2c', color: '#ffffff', border: 'none', borderRadius: '8px', padding: '10px 20px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'Inter, sans-serif' },
  tableWrap:      { background: '#ffffff', borderRadius: '12px', border: '1px solid #e8ecf0', overflow: 'hidden' },
  table:          { width: '100%', borderCollapse: 'collapse' },
  theadRow:       { background: '#051c2c' },
  th:             { padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' },
  tr:             { borderBottom: '1px solid #f0f2f4' },
  td:             { padding: '14px 16px', fontSize: '13px', color: '#051c2c', verticalAlign: 'middle' },
  deptNameBtn:    { background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '600', color: '#051c2c', padding: 0, fontFamily: 'Inter, sans-serif', textDecoration: 'underline', textDecorationColor: '#e8ecf0' },
  viewBtn:        { background: '#f2f4f6', border: 'none', borderRadius: '6px', padding: '5px 14px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', color: '#051c2c', fontFamily: 'Inter, sans-serif' },
  overlay:        { position: 'fixed', inset: 0, background: 'rgba(5,28,44,0.55)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' },
  modal:          { background: '#ffffff', borderRadius: '16px', width: '100%', maxWidth: '520px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 64px rgba(5,28,44,0.25)' },
  modalHeader:    { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid #e8ecf0', position: 'sticky', top: 0, background: '#ffffff', zIndex: 1 },
  modalTitle:     { fontSize: '18px', fontWeight: '700', color: '#051c2c' },
  modalClose:     { background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#9baabb' },
  modalBody:      { padding: '22px 24px' },
  modalFooter:    { padding: '14px 24px', borderTop: '1px solid #e8ecf0', display: 'flex', justifyContent: 'flex-end', gap: '10px' },
  cancelBtn:      { padding: '9px 20px', background: 'none', border: '1.5px solid #e8ecf0', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', fontFamily: 'Inter, sans-serif' },
  saveBtn:        { padding: '9px 24px', background: '#051c2c', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', color: '#ffffff', fontFamily: 'Inter, sans-serif' },
  addModalGrid:   { display: 'grid', gridTemplateColumns: '1fr auto', gap: '24px' },
  photoUpload:    { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', paddingTop: '8px' },
  photoCircle:    { width: '80px', height: '80px', borderRadius: '50%', border: '2px dashed #e8ecf0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' },
  hodSection:     { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', padding: '16px 18px', background: '#f8f9fa', borderRadius: '10px', border: '1px solid #e8ecf0' },
  hodAvatar:      { width: '52px', height: '52px', borderRadius: '50%', background: '#051c2c', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: '700', flexShrink: 0 },
  profileStats:   { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '20px' },
  profileStatCard:{ background: '#f8f9fa', borderRadius: '10px', padding: '14px', textAlign: 'center', border: '1px solid #e8ecf0' },
  profileStatNum: { fontSize: '22px', fontWeight: '800', color: '#051c2c' },
  profileStatLbl: { fontSize: '10px', color: '#5a6878', fontWeight: '600', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.4px' },
  sectionLabel:   { fontSize: '12px', fontWeight: '700', color: '#051c2c', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px', paddingBottom: '8px', borderBottom: '1px solid #e8ecf0' },
};

export default DepartmentsPage;