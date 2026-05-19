// ============================================================
// TrainersPage.js
//
// WHAT THIS PAGE HAS (from the wireframe):
// 1. Search by name + Add Trainer button
// 2. Trainers table — Name, Institute, Courses, Type, Action
// 3. Add Trainer modal — photo, name, course select,
//    CV upload/download, star rating, contact, expertise
// 4. Trainer profile popup — same fields + courses table
// ============================================================

import React, { useState } from 'react';
import { TRAINERS, COURSES } from '../data/sampleData';

function TrainersPage() {

  // ── STATE ──────────────────────────────────────────────────
  const [trainers,    setTrainers]   = useState(TRAINERS);
  const [showAdd,     setShowAdd]    = useState(false);
  const [selected,    setSelected]   = useState(null);
  const [searchTerm,  setSearchTerm] = useState('');
  const [hoverRating, setHoverRating] = useState(0);

  const emptyForm = {
    name: '', institute: '', courseIds: [],
    rating: 0, phone: '', email: '',
    expertise: '', bio: '', type: 'Internal',
  };
  const [form, setForm] = useState(emptyForm);

  // ── FILTER ─────────────────────────────────────────────────
  const filtered = trainers.filter(t =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.institute.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ── GET COURSES FOR TRAINER ────────────────────────────────
  const getTrainerCourses = (courseIds) =>
    COURSES.filter(c => (courseIds || []).includes(c.id));

  // ── FORMAT DATE ────────────────────────────────────────────
  const fmtDate = d => d
    ? new Date(d).toLocaleDateString('en-GB', {
        day: '2-digit', month: '2-digit', year: 'numeric',
      })
    : '—';

  // ── SAVE NEW TRAINER ───────────────────────────────────────
  const handleSave = () => {
    if (!form.name) { alert('Trainer name is required.'); return; }
    const newTrainer = {
      ...form,
      id: Date.now(),
      expertise: form.expertise
        ? form.expertise.split(',').map(e => e.trim())
        : [],
      courseIds: [],
    };
    setTrainers([...trainers, newTrainer]);
    setForm(emptyForm);
    setShowAdd(false);
  };

  // ── INITIALS ───────────────────────────────────────────────
  const initials = name =>
    name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();

  // ── STAR RATER COMPONENT ───────────────────────────────────
  // WHY A COMPONENT INSIDE THE PAGE?
  // The star rating is only used in this page.
  // Making it a small inner component keeps things organized.
  const StarRater = ({ value, onChange }) => (
    <div style={{ display: 'flex', gap: '4px' }}>
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          style={{
            background: 'none', border: 'none',
            cursor: 'pointer', padding: '2px',
            fontSize: '24px',
            color: star <= (hoverRating || value) ? '#c8973a' : '#d4d9dd',
            transition: 'color 0.1s',
          }}
          onMouseEnter={() => setHoverRating(star)}
          onMouseLeave={() => setHoverRating(0)}
          onClick={() => onChange(star)}
        >
          ★
        </button>
      ))}
    </div>
  );

  // ── STARS DISPLAY ──────────────────────────────────────────
  const Stars = ({ value, size = 14 }) => (
    <span>
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} style={{
          color: i <= Math.round(value) ? '#c8973a' : '#d4d9dd',
          fontSize: size + 'px',
        }}>★</span>
      ))}
      {value > 0 && (
        <span style={{ fontSize: '11px', color: '#9baabb', marginLeft: '3px' }}>
          {value}
        </span>
      )}
    </span>
  );

  return (
    <div style={styles.page}>

    

      {/* ── CONTROLS ── */}
      <div style={styles.controls}>
        <div style={styles.searchWrap}>
          <span>🔍</span>
          <input
            style={styles.searchInput}
            placeholder="Search by Name"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <button style={styles.addBtn} onClick={() => setShowAdd(true)}>
          Add Trainer
        </button>
      </div>

      {/* ── TRAINERS TABLE ── */}
      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.theadRow}>
              {['No.', 'Name', 'Institute', 'Courses', 'Type', ''].map(h => (
                <th key={h} style={styles.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((trainer, i) => (
              <tr key={trainer.id} style={styles.tr}>
                <td style={styles.td}>{i + 1}</td>
                <td style={styles.td}>
                  <button
                    style={styles.nameBtn}
                    onClick={() => setSelected(trainer)}
                  >
                    {trainer.name}
                  </button>
                </td>
                <td style={{ ...styles.td, color: '#5a6878', fontSize: '12.5px' }}>
                  {trainer.institute}
                </td>
                <td style={{ ...styles.td, fontSize: '12px', color: '#5a6878' }}>
                  {getTrainerCourses(trainer.courseIds)
                    .map(c => c.title.split(' ').slice(0, 2).join(' '))
                    .join(', ') || '—'}
                </td>
                <td style={styles.td}>
                  <span style={{
                    ...styles.typeBadge,
                    background: (trainer.type || 'External') === 'Internal'
                      ? '#f0f9ff' : '#fdf4ff',
                    color: (trainer.type || 'External') === 'Internal'
                      ? '#0369a1' : '#7c3aed',
                  }}>
                    {trainer.type || 'External'}
                  </span>
                </td>
                <td style={styles.td}>
                  <button
                    style={styles.editBtn}
                    onClick={() => setSelected(trainer)}
                  >
                    ✏️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div style={styles.empty}>No trainers found.</div>
        )}
      </div>

      {/* ── ADD TRAINER MODAL ── */}
      {showAdd && (
        <div style={styles.overlay} onClick={() => setShowAdd(false)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>

            <div style={styles.modalHeader}>
              <span style={styles.modalTitle}>Add Trainer</span>
              <button style={styles.modalClose}
                onClick={() => setShowAdd(false)}>×</button>
            </div>

            <div style={styles.modalBody}>

              {/* Top row — photo + name */}
              <div style={styles.topRow}>
                <div style={styles.photoCircle}>
                  <span style={{ fontSize: '28px' }}>👤</span>
                </div>
                <div style={{ flex: 1 }}>
                  <F label="Trainer Name *"
                    value={form.name}
                    onChange={v => setForm({ ...form, name: v })}
                    placeholder="Full name"
                  />
                </div>
              </div>

              {/* Course select */}
              <div style={{ marginBottom: '14px' }}>
                <label style={styles.fieldLabel}>Select Course</label>
                <select
                  style={styles.input}
                  onChange={e => {
                    const id = +e.target.value;
                    if (id && !form.courseIds.includes(id)) {
                      setForm({ ...form, courseIds: [...form.courseIds, id] });
                    }
                  }}
                >
                  <option value="">Select course...</option>
                  {COURSES.map(c => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
                {/* Show selected courses as chips */}
                {form.courseIds.length > 0 && (
                  <div style={styles.chipRow}>
                    {form.courseIds.map(id => {
                      const course = COURSES.find(c => c.id === id);
                      return course ? (
                        <span key={id} style={styles.chip}>
                          {course.title.split(' ').slice(0, 3).join(' ')}
                          <button
                            style={styles.chipRemove}
                            onClick={() => setForm({
                              ...form,
                              courseIds: form.courseIds.filter(i => i !== id)
                            })}
                          >×</button>
                        </span>
                      ) : null;
                    })}
                  </div>
                )}
              </div>

              {/* CV upload/download */}
              <div style={styles.cvRow}>
                <button style={styles.cvBtn}>
                  📎 Upload CV
                </button>
                <button style={styles.cvBtn}>
                  ⬇ Download CV
                </button>
              </div>

              {/* Star rating */}
              <div style={{ marginBottom: '16px' }}>
                <label style={styles.fieldLabel}>Trainer Rating</label>
                <StarRater
                  value={form.rating}
                  onChange={v => setForm({ ...form, rating: v })}
                />
              </div>

              {/* Contact + email */}
              <div style={styles.formGrid}>
                <F label="Contact Number"
                  value={form.phone}
                  onChange={v => setForm({ ...form, phone: v })}
                  placeholder="+971 50 000 0000"
                />
                <F label="Email Address"
                  value={form.email}
                  onChange={v => setForm({ ...form, email: v })}
                  placeholder="trainer@email.com"
                  type="email"
                />
                <F label="Type"
                  value={form.type}
                  onChange={v => setForm({ ...form, type: v })}
                  type="select"
                  options={['Internal', 'External']}
                />
                <F label="Area of Expertise"
                  value={form.expertise}
                  onChange={v => setForm({ ...form, expertise: v })}
                  placeholder="e.g. Leadership, Sales (comma separated)"
                />
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

      {/* ── TRAINER PROFILE POPUP ── */}
      {selected && (
        <div style={styles.overlay} onClick={() => setSelected(null)}>
          <div style={{ ...styles.modal, maxWidth: '700px' }}
            onClick={e => e.stopPropagation()}>

            <div style={styles.modalHeader}>
              <span style={styles.modalTitle}>Trainer Profile</span>
              <button style={styles.modalClose}
                onClick={() => setSelected(null)}>×</button>
            </div>

            <div style={styles.modalBody}>

              {/* Profile header */}
              <div style={styles.profileHeader}>
                <div style={styles.profileAvatar}>
                  {initials(selected.name)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={styles.profileName}>{selected.name}</div>
                  <div style={styles.profileInstitute}>{selected.institute}</div>
                  <Stars value={selected.rating} size={16} />
                </div>
                <span style={{
                  ...styles.typeBadge,
                  background: (selected.type || 'External') === 'Internal'
                    ? '#f0f9ff' : '#fdf4ff',
                  color: (selected.type || 'External') === 'Internal'
                    ? '#0369a1' : '#7c3aed',
                  alignSelf: 'flex-start',
                }}>
                  {selected.type || 'External'}
                </span>
              </div>

              {/* Bio */}
              {selected.bio && (
                <div style={styles.bio}>{selected.bio}</div>
              )}

              {/* Expertise chips */}
              {selected.expertise && selected.expertise.length > 0 && (
                <div style={{ marginBottom: '16px' }}>
                  <div style={styles.sectionLbl}>Areas of Expertise</div>
                  <div style={styles.chipRow}>
                    {(Array.isArray(selected.expertise)
                      ? selected.expertise
                      : [selected.expertise]
                    ).map((e, i) => (
                      <span key={i} style={styles.chip}>{e}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Contact info */}
              <div style={styles.formGrid}>
                <div>
                  <div style={styles.fieldLabel}>Phone</div>
                  <div style={styles.infoVal}>{selected.phone || '—'}</div>
                </div>
                <div>
                  <div style={styles.fieldLabel}>Email</div>
                  <div style={styles.infoVal}>{selected.email || '—'}</div>
                </div>
              </div>

              {/* CV buttons */}
              <div style={{ ...styles.cvRow, marginBottom: '20px' }}>
                <button style={styles.cvBtn}>📎 Upload CV</button>
                <button style={styles.cvBtn}>⬇ Download CV</button>
              </div>

              {/* Courses table */}
              <div style={styles.sectionLbl}>Courses Delivered</div>
              <div style={styles.tableWrap}>
                <table style={styles.table}>
                  <thead>
                    <tr style={{ background: '#f2f4f6' }}>
                      {['Course Name', 'Completion Date', 'Status', 'Rating'].map(h => (
                        <th key={h} style={{
                          ...styles.th, color: '#5a6878', fontSize: '10px',
                        }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {getTrainerCourses(selected.courseIds).map((course, i) => (
                      <tr key={course.id} style={styles.tr}>
                        <td style={{ ...styles.td, fontWeight: 500 }}>{course.title}</td>
                        <td style={{ ...styles.td, color: '#5a6878', fontSize: '12px' }}>
                          {fmtDate(course.end)}
                        </td>
                        <td style={styles.td}>
                          <span style={{
                            background: course.status === 'Completed'
                              ? '#dcfce7' : course.status === 'Ongoing'
                              ? '#dbeafe' : '#fef9c3',
                            color: course.status === 'Completed'
                              ? '#15803d' : course.status === 'Ongoing'
                              ? '#1d4ed8' : '#a16207',
                            padding: '3px 10px', borderRadius: '20px',
                            fontSize: '11px', fontWeight: '600',
                          }}>
                            {course.status}
                          </span>
                        </td>
                        <td style={styles.td}>
                          {course.stars > 0
                            ? <Stars value={course.stars} />
                            : <span style={{ color: '#9baabb' }}>—</span>
                          }
                        </td>
                      </tr>
                    ))}
                    {getTrainerCourses(selected.courseIds).length === 0 && (
                      <tr>
                        <td colSpan={4} style={{
                          ...styles.td, textAlign: 'center', color: '#9baabb',
                        }}>
                          No courses assigned yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Assign course button */}
              <div style={{ marginTop: '14px' }}>
                <button style={styles.assignBtn}>
                  + Assign Course
                </button>
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
function F({ label, value, onChange, placeholder, type = 'text', options = [] }) {
  const inputStyle = {
    width: '100%', padding: '10px 12px',
    border: '1.5px solid #e8ecf0', borderRadius: '8px',
    fontSize: '13px', outline: 'none', background: '#f8f9fa',
    color: '#051c2c', fontFamily: 'Inter, sans-serif',
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
      <label style={{
        fontSize: '11px', fontWeight: '700', color: '#5a6878',
        textTransform: 'uppercase', letterSpacing: '0.5px',
      }}>
        {label}
      </label>
      {type === 'select' ? (
        <select value={value} onChange={e => onChange(e.target.value)} style={inputStyle}>
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : (
        <input
          type={type} value={value} placeholder={placeholder}
          onChange={e => onChange(e.target.value)} style={inputStyle}
        />
      )}
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
  controls: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: '16px',
  },
  searchWrap: {
    display: 'flex', alignItems: 'center',
    background: '#ffffff', border: '1.5px solid #e8ecf0',
    borderRadius: '8px', padding: '0 12px', gap: '6px',
  },
  searchInput: {
    border: 'none', outline: 'none', fontSize: '13px',
    padding: '10px 0', width: '200px', background: 'transparent',
    fontFamily: 'Inter, sans-serif',
  },
  addBtn: {
    background: '#051c2c', color: '#ffffff', border: 'none',
    borderRadius: '8px', padding: '10px 20px', fontSize: '13px',
    fontWeight: '600', cursor: 'pointer', fontFamily: 'Inter, sans-serif',
  },
  tableWrap: {
    background: '#ffffff', borderRadius: '12px',
    border: '1px solid #e8ecf0', overflow: 'hidden',
  },
  table: { width: '100%', borderCollapse: 'collapse' },
  theadRow: { borderBottom: '2px solid #e8ecf0' },
  th: {
    padding: '12px 16px', textAlign: 'left',
    fontSize: '11px', fontWeight: '700',
    color: '#5a6878', textTransform: 'uppercase', letterSpacing: '0.5px',
  },
  tr: { borderBottom: '1px solid #f0f2f4' },
  td: {
    padding: '13px 16px', fontSize: '13px',
    color: '#051c2c', verticalAlign: 'middle',
  },
  nameBtn: {
    background: 'none', border: 'none', cursor: 'pointer',
    fontSize: '13px', fontWeight: '600', color: '#051c2c',
    padding: 0, fontFamily: 'Inter, sans-serif',
  },
  typeBadge: {
    padding: '3px 10px', borderRadius: '20px',
    fontSize: '11px', fontWeight: '600',
  },
  editBtn: {
    background: '#051c2c', border: 'none', borderRadius: '6px',
    padding: '5px 8px', cursor: 'pointer', fontSize: '13px',
  },
  empty: {
    padding: '40px', textAlign: 'center',
    color: '#9baabb', fontSize: '14px',
  },
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(5,28,44,0.55)',
    zIndex: 999, display: 'flex', alignItems: 'center',
    justifyContent: 'center', padding: '20px',
  },
  modal: {
    background: '#ffffff', borderRadius: '16px', width: '100%',
    maxWidth: '560px', maxHeight: '90vh', overflowY: 'auto',
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
  topRow: {
    display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '16px',
  },
  photoCircle: {
    width: '72px', height: '72px', borderRadius: '50%',
    border: '2px dashed #e8ecf0', display: 'flex',
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0, cursor: 'pointer',
  },
  formGrid: {
    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px',
    marginBottom: '14px',
  },
  fieldLabel: {
    fontSize: '11px', fontWeight: '700', color: '#5a6878',
    textTransform: 'uppercase', letterSpacing: '0.5px',
    display: 'block', marginBottom: '5px',
  },
  input: {
    width: '100%', padding: '10px 12px', border: '1.5px solid #e8ecf0',
    borderRadius: '8px', fontSize: '13px', outline: 'none',
    background: '#f8f9fa', color: '#051c2c',
    fontFamily: 'Inter, sans-serif',
  },
  chipRow: { display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' },
  chip: {
    background: '#f2f4f6', border: '1px solid #e8ecf0',
    borderRadius: '20px', padding: '3px 10px',
    fontSize: '12px', fontWeight: '500', color: '#051c2c',
    display: 'flex', alignItems: 'center', gap: '4px',
  },
  chipRemove: {
    background: 'none', border: 'none', cursor: 'pointer',
    fontSize: '14px', color: '#9baabb', padding: 0, lineHeight: 1,
  },
  cvRow: { display: 'flex', gap: '10px', marginBottom: '16px' },
  cvBtn: {
    padding: '8px 16px', background: 'none',
    border: '1.5px solid #e8ecf0', borderRadius: '8px',
    fontSize: '12px', fontWeight: '500', cursor: 'pointer',
    color: '#051c2c', fontFamily: 'Inter, sans-serif',
  },
  profileHeader: {
    display: 'flex', alignItems: 'center', gap: '14px',
    padding: '16px', background: '#f8f9fa',
    borderRadius: '10px', marginBottom: '16px',
    border: '1px solid #e8ecf0',
  },
  profileAvatar: {
    width: '52px', height: '52px', borderRadius: '50%',
    background: '#051c2c', color: '#ffffff',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '16px', fontWeight: '700', flexShrink: 0,
  },
  profileName: { fontSize: '17px', fontWeight: '700', color: '#051c2c' },
  profileInstitute: { fontSize: '12px', color: '#5a6878', marginBottom: '4px' },
  bio: {
    fontSize: '13px', color: '#5a6878', lineHeight: 1.6,
    padding: '12px 14px', background: '#f8f9fa',
    borderRadius: '8px', borderLeft: '3px solid #051c2c',
    marginBottom: '16px',
  },
  sectionLbl: {
    fontSize: '12px', fontWeight: '700', color: '#051c2c',
    marginBottom: '10px', paddingBottom: '8px',
    borderBottom: '1px solid #e8ecf0', textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  infoVal: { fontSize: '13px', fontWeight: '500', color: '#051c2c', marginTop: '4px' },
  assignBtn: {
    background: '#051c2c', color: '#ffffff', border: 'none',
    borderRadius: '8px', padding: '9px 18px', fontSize: '13px',
    fontWeight: '600', cursor: 'pointer', fontFamily: 'Inter, sans-serif',
  },
};

export default TrainersPage;