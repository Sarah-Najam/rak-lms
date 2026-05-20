import React, { useState, useEffect } from 'react';
import api from '../api';

function CoursesPage() {

  const [courses,     setCourses]    = useState([]);
  const [departments, setDepartments]= useState([]);
  const [showAdd,     setShowAdd]    = useState(false);
  const [selected,    setSelected]   = useState(null);
  const [searchTitle, setSearchTitle]= useState('');
  const [loading,     setLoading]    = useState(true);

  const emptyForm = {
    title: '', description: '', duration: '', institute: '',
    hours: '', cost: '', budgetRealized: '', startDate: '',
    endDate: '', type: 'External', status: 'Pending',
    tableOfContents: '', maxLearners: '', trainer: '',
    po: '', venue: '', dept: '',
  };
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    api.getCourses()
      .then(data => {
        if (Array.isArray(data)) setCourses(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    api.getDepartments()
      .then(data => {
        if (Array.isArray(data)) setDepartments(data);
      });
  }, []);

  const totalCourses     = courses.length;
  const ongoingCourses   = courses.filter(c => c.status === 'Ongoing').length;
  const completedCourses = courses.filter(c => c.status === 'Completed').length;
  const avgParticipation = courses.length > 0
    ? Math.round(courses.reduce((s, c) => s + (+c.enrolled_count || 0), 0) / courses.length * 5)
    : 0;
  const favouriteCourses = courses
    .filter(c => +c.stars >= 4.5)
    .map(c => c.title.split(' ').slice(0, 2).join(' '));

  const filtered = courses.filter(c =>
    c.title.toLowerCase().includes(searchTitle.toLowerCase())
  );

  const handleSave = async () => {
    if (!form.title) { alert('Course title is required.'); return; }
    try {
      const newCourse = await api.addCourse({
        title:             form.title,
        description:       form.description,
        institute:         form.institute,
        trainer_name:      form.trainer,
        venue:             form.venue,
        department_id:     form.dept ? parseInt(form.dept) : null,
        start_date:        form.startDate || null,
        end_date:          form.endDate   || null,
        duration_hours:    +form.hours    || 0,
        duration_days:     +form.duration || 0,
        cost_estimated:    +form.cost     || 0,
        budget_realized:   +form.budgetRealized || 0,
        type:              form.type,
        status:            form.status,
        max_learners:      +form.maxLearners || null,
        po_number:         form.po,
        table_of_contents: form.tableOfContents,
      });
      if (newCourse.id) {
        api.getCourses().then(data => {
          if (Array.isArray(data)) setCourses(data);
        });
        setForm(emptyForm);
        setShowAdd(false);
      } else {
        alert(newCourse.error || 'Could not save course.');
      }
    } catch (err) {
      alert('Error connecting to server.');
    }
  };

  const fmtDate = d => d
    ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : '—';

  const Stars = ({ value }) => (
    <span>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} style={{ color: i < Math.round(value) ? '#c8973a' : '#d4d9dd', fontSize: '13px' }}>★</span>
      ))}
    </span>
  );

  const StatusBadge = ({ status }) => {
    const colors = {
      Completed: { bg: '#dcfce7', color: '#15803d' },
      Ongoing:   { bg: '#dbeafe', color: '#1d4ed8' },
      Pending:   { bg: '#fef9c3', color: '#a16207' },
    };
    const c = colors[status] || { bg: '#f1f5f9', color: '#475569' };
    return (
      <span style={{ background: c.bg, color: c.color, padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600' }}>
        {status}
      </span>
    );
  };

  return (
    <div style={styles.page}>

      <div style={styles.statGrid}>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>📚</div>
          <div style={styles.statNum}>{totalCourses}</div>
          <div style={styles.statLbl}>Total Courses</div>
          <div style={styles.statSub}>Including active, completed</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>⏳</div>
          <div style={styles.statNum}>{ongoingCourses}</div>
          <div style={styles.statLbl}>Ongoing Courses</div>
          <div style={styles.statSub}>{ongoingCourses} courses in session now</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>✅</div>
          <div style={styles.statNum}>{completedCourses}</div>
          <div style={styles.statLbl}>Completed Courses</div>
          <div style={styles.statSub}>&nbsp;</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>⭐</div>
          <div style={{ fontSize: '13px', marginTop: '8px', minHeight: '30px' }}>
            {favouriteCourses.length > 0
              ? favouriteCourses.map((t, i) => <div key={i} style={{ fontSize: '12px', color: '#ffffff', fontWeight: 500 }}>{t}</div>)
              : <span style={{ color: '#b6bdc2', fontSize: '12px' }}>No ratings yet</span>
            }
          </div>
          <div style={styles.statLbl}>Most Favourite</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>👥</div>
          <div style={styles.statNum}>{avgParticipation}%</div>
          <div style={styles.statLbl}>Participation Rate</div>
          <div style={styles.statSub}>&nbsp;</div>
        </div>
      </div>

      <div style={styles.controls}>
        <div style={styles.searchWrap}>
          <span>🔍</span>
          <input style={styles.searchInput} placeholder="Search by Course Title"
            value={searchTitle} onChange={e => setSearchTitle(e.target.value)} />
        </div>
        <button style={styles.addBtn} onClick={() => setShowAdd(true)}>Add Course</button>
      </div>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#9baabb' }}>Loading courses...</div>
      ) : (
        <div style={styles.tableWrap}>
          <div style={styles.tableTitle}>Courses</div>
          <table style={styles.table}>
            <thead>
              <tr style={styles.theadRow}>
                {['No.','Name','Institute','Start Date','Type','Status','Enrolled','Attended','Feedback',''].map(h => (
                  <th key={h} style={styles.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((course, i) => (
                <tr key={course.id} style={styles.tr}>
                  <td style={styles.td}>{i + 1}</td>
                  <td style={styles.td}>
                    <button style={styles.courseNameBtn} onClick={() => setSelected(course)}>
                      {course.title}
                    </button>
                  </td>
                  <td style={{ ...styles.td, color: '#5a6878', fontSize: '12px' }}>{course.institute || '—'}</td>
                  <td style={{ ...styles.td, fontSize: '12px', color: '#5a6878' }}>{fmtDate(course.start_date)}</td>
                  <td style={styles.td}>
                    <span style={{ ...styles.typeBadge, background: course.type === 'Internal' ? '#f0f9ff' : '#fdf4ff', color: course.type === 'Internal' ? '#0369a1' : '#7c3aed' }}>
                      {course.type || 'External'}
                    </span>
                  </td>
                  <td style={styles.td}><StatusBadge status={course.status} /></td>
                  <td style={{ ...styles.td, fontWeight: 600 }}>{course.enrolled_count || 0}</td>
                  <td style={{ ...styles.td, fontWeight: 600 }}>{Math.round((+course.enrolled_count || 0) * 0.92)}</td>
                  <td style={styles.td}>
                    {course.stars > 0
                      ? <Stars value={course.stars} />
                      : <span style={{ color: '#9baabb', fontSize: '12px' }}>—</span>
                    }
                  </td>
                  <td style={styles.td}>
                    <button style={styles.actionBtn} onClick={() => setSelected(course)}>✏️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div style={{ padding: '40px', textAlign: 'center', color: '#9baabb', fontSize: '14px' }}>
              {courses.length === 0 ? 'No courses yet. Click "Add Course" to get started.' : 'No courses found.'}
            </div>
          )}
        </div>
      )}

      {showAdd && (
        <div style={styles.overlay} onClick={() => setShowAdd(false)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <span style={styles.modalTitle}>Add Course</span>
              <button style={styles.modalClose} onClick={() => setShowAdd(false)}>×</button>
            </div>
            <div style={styles.modalBody}>
              <div style={styles.photoRow}>
                <div style={styles.photoBox}><div style={{ fontSize: '24px' }}>🖼</div></div>
                <div style={{ flex: 1 }}>
                  <F label="Course Title *" value={form.title} onChange={v => setForm({...form, title: v})} placeholder="e.g. Advanced Negotiation Skills" />
                </div>
              </div>
              <div style={{ marginBottom: '14px' }}>
                <label style={styles.fieldLabel}>Description</label>
                <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})}
                  placeholder="What will participants learn?" style={{ ...styles.input, minHeight: '70px', resize: 'vertical', width: '100%' }} />
              </div>
              <div style={styles.formGrid}>
                <F label="Duration (Days)"       value={form.duration}        onChange={v => setForm({...form, duration: v})}        placeholder="e.g. 3"    type="number" />
                <F label="Institute"             value={form.institute}       onChange={v => setForm({...form, institute: v})}       placeholder="e.g. RERA Academy" />
                <F label="Training Hours *"      value={form.hours}           onChange={v => setForm({...form, hours: v})}           placeholder="e.g. 24"   type="number" />
                <F label="Cost (AED) Estimated"  value={form.cost}            onChange={v => setForm({...form, cost: v})}            placeholder="e.g. 15000" type="number" />
                <F label="Budget Realized (AED)" value={form.budgetRealized}  onChange={v => setForm({...form, budgetRealized: v})}  placeholder="e.g. 13000" type="number" />
                <F label="Start Date"            value={form.startDate}       onChange={v => setForm({...form, startDate: v})}       type="date" />
                <F label="End Date"              value={form.endDate}         onChange={v => setForm({...form, endDate: v})}         type="date" />
                <F label="External / Internal"   value={form.type}            onChange={v => setForm({...form, type: v})}            type="select" options={['External','Internal']} />
                <F label="Status"                value={form.status}          onChange={v => setForm({...form, status: v})}          type="select" options={['Pending','Ongoing','Completed']} />
                <F label="Department"            value={form.dept}            onChange={v => setForm({...form, dept: v})}
                  type="select" options={departments.map(d => ({ label: d.name, value: d.id }))} />
                <F label="No. of Learners"       value={form.maxLearners}     onChange={v => setForm({...form, maxLearners: v})}     placeholder="e.g. 20"   type="number" />
                <F label="Trainer Name"          value={form.trainer}         onChange={v => setForm({...form, trainer: v})}         placeholder="Lead trainer" />
                <F label="PO #"                  value={form.po}              onChange={v => setForm({...form, po: v})}              placeholder="e.g. PO-2025-001" />
                <F label="Venue"                 value={form.venue}           onChange={v => setForm({...form, venue: v})}           placeholder="e.g. Dubai HQ or Online" />
              </div>
            </div>
            <div style={styles.modalFooter}>
              <button style={styles.cancelBtn} onClick={() => setShowAdd(false)}>Cancel</button>
              <button style={styles.saveBtn}   onClick={handleSave}>Add</button>
            </div>
          </div>
        </div>
      )}

      {selected && (
        <div style={styles.overlay} onClick={() => setSelected(null)}>
          <div style={{ ...styles.modal, maxWidth: '780px' }} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <span style={styles.modalTitle}>{selected.title}</span>
              <button style={styles.modalClose} onClick={() => setSelected(null)}>×</button>
            </div>
            <div style={styles.modalBody}>
              <div style={styles.coverImg}><div style={{ fontSize: '40px' }}>📚</div></div>
              <div style={styles.detailGrid}>
                {[
                  ['Description',       selected.description || '—'],
                  ['Duration',          (selected.duration_days || '—') + ' days'],
                  ['Type',              selected.type || 'External'],
                  ['Training Hours',    (selected.duration_hours || 0) + 'h'],
                  ['Max Learners',      selected.max_learners || '—'],
                  ['Cost (AED)',        'AED ' + (+selected.cost_estimated || 0).toLocaleString()],
                  ['Start Date',        fmtDate(selected.start_date)],
                  ['End Date',          fmtDate(selected.end_date)],
                  ['Trainer',           selected.trainer_name || '—'],
                  ['Status',            selected.status],
                  ['Venue',             selected.venue || '—'],
                  ['Budget Realized',   selected.budget_realized ? 'AED ' + (+selected.budget_realized).toLocaleString() : '—'],
                ].map(([k, v]) => (
                  <div key={k}>
                    <div style={{ fontSize: '10px', fontWeight: '700', color: '#9baabb', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{k}</div>
                    <div style={{ fontSize: '13px', fontWeight: '500', color: '#051c2c', marginTop: '4px' }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={styles.modalFooter}>
              <button style={styles.cancelBtn} onClick={() => setSelected(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

function F({ label, value, onChange, placeholder, type = 'text', options = [] }) {
  const inputStyle = { width: '100%', padding: '9px 12px', border: '1.5px solid #e8ecf0', borderRadius: '8px', fontSize: '13px', outline: 'none', background: '#f8f9fa', color: '#051c2c', fontFamily: 'Inter, sans-serif' };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
      <label style={{ fontSize: '11px', fontWeight: '700', color: '#5a6878', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</label>
      {type === 'select' ? (
        <select value={value} onChange={e => onChange(e.target.value)} style={inputStyle}>
          <option value="">Select...</option>
          {options.map(o => typeof o === 'object'
            ? <option key={o.value} value={o.value}>{o.label}</option>
            : <option key={o} value={o}>{o}</option>
          )}
        </select>
      ) : (
        <input type={type} value={value} placeholder={placeholder} onChange={e => onChange(e.target.value)} style={inputStyle} />
      )}
    </div>
  );
}

const styles = {
  page:          { padding: '30px', minHeight: '100vh', background: '#f2f4f6', fontFamily: 'Inter, sans-serif' },
  statGrid:      { display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '14px', marginBottom: '20px' },
  statCard:      { background: '#051c2c', color: '#ffffff', borderRadius: '12px', padding: '18px 16px', display: 'flex', flexDirection: 'column', gap: '4px' },
  statIcon:      { fontSize: '20px', marginBottom: '4px' },
  statNum:       { fontSize: '28px', fontWeight: '800', color: '#ffffff', lineHeight: 1 },
  statLbl:       { fontSize: '12px', fontWeight: '600', color: '#b6bdc2' },
  statSub:       { fontSize: '11px', color: 'rgba(182,189,194,0.6)' },
  controls:      { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' },
  searchWrap:    { display: 'flex', alignItems: 'center', background: '#ffffff', border: '1.5px solid #e8ecf0', borderRadius: '8px', padding: '0 12px', gap: '6px' },
  searchInput:   { border: 'none', outline: 'none', fontSize: '13px', padding: '9px 0', width: '220px', fontFamily: 'Inter, sans-serif', background: 'transparent' },
  addBtn:        { background: '#051c2c', color: '#ffffff', border: 'none', borderRadius: '8px', padding: '10px 20px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'Inter, sans-serif' },
  tableWrap:     { background: '#ffffff', borderRadius: '12px', border: '1px solid #e8ecf0', overflow: 'hidden' },
  tableTitle:    { fontSize: '16px', fontWeight: '700', color: '#051c2c', padding: '16px 20px', borderBottom: '1px solid #e8ecf0' },
  table:         { width: '100%', borderCollapse: 'collapse' },
  theadRow:      { background: '#051c2c' },
  th:            { padding: '11px 14px', textAlign: 'left', fontSize: '10px', fontWeight: '700', color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.5px' },
  tr:            { borderBottom: '1px solid #f0f2f4' },
  td:            { padding: '12px 14px', fontSize: '13px', color: '#051c2c', verticalAlign: 'middle' },
  courseNameBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '600', color: '#051c2c', textAlign: 'left', padding: 0, fontFamily: 'Inter, sans-serif' },
  typeBadge:     { padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600' },
  actionBtn:     { background: '#051c2c', border: 'none', borderRadius: '6px', padding: '5px 8px', cursor: 'pointer', fontSize: '13px' },
  overlay:       { position: 'fixed', inset: 0, background: 'rgba(5,28,44,0.55)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' },
  modal:         { background: '#ffffff', borderRadius: '16px', width: '100%', maxWidth: '660px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 64px rgba(5,28,44,0.25)' },
  modalHeader:   { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid #e8ecf0', position: 'sticky', top: 0, background: '#ffffff', zIndex: 1 },
  modalTitle:    { fontSize: '18px', fontWeight: '700', color: '#051c2c' },
  modalClose:    { background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#9baabb' },
  modalBody:     { padding: '20px 24px' },
  photoRow:      { display: 'flex', gap: '16px', marginBottom: '16px', alignItems: 'flex-start' },
  photoBox:      { width: '90px', height: '90px', border: '2px dashed #e8ecf0', borderRadius: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 },
  fieldLabel:    { fontSize: '11px', fontWeight: '700', color: '#5a6878', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '5px' },
  input:         { padding: '9px 12px', border: '1.5px solid #e8ecf0', borderRadius: '8px', fontSize: '13px', outline: 'none', background: '#f8f9fa', color: '#051c2c', fontFamily: 'Inter, sans-serif', boxSizing: 'border-box' },
  formGrid:      { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' },
  modalFooter:   { padding: '14px 24px', borderTop: '1px solid #e8ecf0', display: 'flex', justifyContent: 'flex-end', gap: '10px' },
  cancelBtn:     { padding: '9px 20px', background: 'none', border: '1.5px solid #e8ecf0', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', fontFamily: 'Inter, sans-serif' },
  saveBtn:       { padding: '9px 24px', background: '#051c2c', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', color: '#ffffff', fontFamily: 'Inter, sans-serif' },
  coverImg:      { width: '100%', height: '140px', background: '#f2f4f6', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '18px' },
  detailGrid:    { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' },
};

export default CoursesPage;