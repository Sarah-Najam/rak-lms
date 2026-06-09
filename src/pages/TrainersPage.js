import React, { useState, useEffect } from 'react';
import api from '../api';
import Pagination from '../components/Pagination';

const ITEMS_PER_PAGE = 20;

const STAR_LEGEND = [
  { stars: 5, label: 'Excellent',  pct: '100%', color: '#15803d' },
  { stars: 4, label: 'Very Good',  pct: '80%',  color: '#0369a1' },
  { stars: 3, label: 'Good',       pct: '60%',  color: '#a16207' },
  { stars: 2, label: 'Fair',       pct: '40%',  color: '#c2410c' },
  { stars: 1, label: 'Poor',       pct: '20%',  color: '#991b1b' },
];

function CourseSatisfactionBar({ pct, title }) {
  return (
    <div style={{ marginBottom: '8px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
        <span style={{ fontSize: '12px', color: '#051c2c', fontWeight: '500' }}>{title}</span>
        <span style={{ fontSize: '12px', fontWeight: '700', color: '#c8973a' }}>{pct}%</span>
      </div>
      <div style={{ height: '6px', background: '#e8ecf0', borderRadius: '3px', overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: pct + '%',
          background: pct >= 80 ? '#15803d' : pct >= 60 ? '#a16207' : '#991b1b',
          borderRadius: '3px', transition: 'width 0.4s ease',
        }} />
      </div>
    </div>
  );
}

function TrainerRating({ trainerId }) {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getTrainerSatisfactionById(trainerId, 'annual')
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [trainerId]);

  if (loading) return (
    <span style={{ fontSize: '11px', color: '#9baabb' }}>...</span>
  );

  if (!data || data.course_count === 0) return (
    <span style={{ fontSize: '12px', color: '#9baabb' }}>No data</span>
  );

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
      <span style={{
        background: data.percentage >= 80 ? '#dcfce7'
          : data.percentage >= 60 ? '#fef9c3' : '#fee2e2',
        color: data.percentage >= 80 ? '#15803d'
          : data.percentage >= 60 ? '#a16207' : '#991b1b',
        padding: '2px 8px', borderRadius: '10px',
        fontSize: '11px', fontWeight: '700',
      }}>
        {data.percentage}%
      </span>
      <span style={{ fontSize: '11px', color: '#9baabb' }}>
        ({data.course_count} course{data.course_count !== 1 ? 's' : ''})
      </span>
    </div>
  );
}

function TrainersPage() {

  const [trainers,   setTrainers]   = useState([]);
  const [showAdd,    setShowAdd]    = useState(false);
  const [showEdit,   setShowEdit]   = useState(false);
  const [selected,   setSelected]   = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading,    setLoading]    = useState(true);
  const [hoverRating,setHoverRating]= useState(0);
  const [currentPage,setCurrentPage]= useState(1);
  const [satPeriod,  setSatPeriod]  = useState('annual');
  const [satData,    setSatData]    = useState(null);
  const [satLoading, setSatLoading] = useState(false);

  const emptyForm = {
    name: '', institute: '', rating: 0, phone: '',
    email: '', expertise: '', bio: '', type: 'Internal',
  };
  const [form,     setForm]     = useState(emptyForm);
  const [editForm, setEditForm] = useState(emptyForm);

  useEffect(() => { loadTrainers(); }, []);

  useEffect(() => {
    if (selected && !showEdit) loadSatisfaction(selected, satPeriod);
  }, [selected, satPeriod, showEdit]);

  const loadTrainers = () => {
    api.getTrainers()
      .then(data => {
        if (Array.isArray(data)) setTrainers(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const loadSatisfaction = async (trainer, period) => {
    setSatLoading(true);
    try {
      const data = await api.getTrainerSatisfactionById(trainer.id, period);
      setSatData(data);
    } catch (err) {
      setSatData(null);
    }
    setSatLoading(false);
  };

  const filtered = trainers.filter(t =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.institute || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginated = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleSave = async () => {
    if (!form.name) { alert('Trainer name is required.'); return; }
    try {
      const newTrainer = await api.addTrainer({
        name:      form.name,
        institute: form.institute,
        expertise: form.expertise
          ? form.expertise.split(',').map(e => e.trim()) : [],
        rating:    +form.rating || 0,
        phone:     form.phone,
        email:     form.email,
        bio:       form.bio,
        type:      form.type,
      });
      if (newTrainer.id) {
        loadTrainers();
        setForm(emptyForm);
        setShowAdd(false);
      } else {
        alert(newTrainer.error || 'Could not save trainer.');
      }
    } catch (err) {
      alert('Error connecting to server.');
    }
  };

  const handleEditSave = async () => {
    if (!editForm.name) { alert('Trainer name is required.'); return; }
    try {
      const updated = await api.updateTrainer(selected.id, {
        name:      editForm.name,
        institute: editForm.institute,
        expertise: editForm.expertise
          ? editForm.expertise.split(',').map(e => e.trim()) : [],
        rating:    +editForm.rating || 0,
        phone:     editForm.phone,
        email:     editForm.email,
        bio:       editForm.bio,
        type:      editForm.type,
      });
      if (updated.id) {
        loadTrainers();
        setShowEdit(false);
        setSelected(null);
      } else {
        alert(updated.error || 'Could not update trainer.');
      }
    } catch (err) {
      alert('Error connecting to server.');
    }
  };

  const openEdit = (trainer) => {
    setSelected(trainer);
    setEditForm({
      name:      trainer.name      || '',
      institute: trainer.institute || '',
      rating:    trainer.rating    || 0,
      phone:     trainer.phone     || '',
      email:     trainer.email     || '',
      expertise: Array.isArray(trainer.expertise)
        ? trainer.expertise.join(', ') : trainer.expertise || '',
      bio:       trainer.bio  || '',
      type:      trainer.type || 'Internal',
    });
    setShowEdit(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this trainer?')) return;
    try {
      await api.deleteTrainer(id);
      loadTrainers();
    } catch (err) {
      alert('Error deleting trainer.');
    }
  };

  const initials = name =>
    name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();

  const Stars = ({ value, size = 14 }) => (
    <span>
      {[1,2,3,4,5].map(i => (
        <span key={i} style={{
          color: i <= Math.round(value) ? '#c8973a' : '#d4d9dd',
          fontSize: size + 'px',
        }}>★</span>
      ))}
    </span>
  );

  const StarRater = ({ value, onChange }) => (
    <div style={{ display: 'flex', gap: '4px' }}>
      {[1,2,3,4,5].map(star => (
        <button
          key={star}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            padding: '2px', fontSize: '24px',
            color: star <= (hoverRating || value) ? '#c8973a' : '#d4d9dd',
          }}
          onMouseEnter={() => setHoverRating(star)}
          onMouseLeave={() => setHoverRating(0)}
          onClick={() => onChange(star)}
        >★</button>
      ))}
    </div>
  );

  const periodLabel = {
    monthly:   'This Month',
    quarterly: 'This Quarter',
    annual:    'This Year',
  };

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
            onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          />
        </div>
        <button style={styles.addBtn} onClick={() => setShowAdd(true)}>
          Add Trainer
        </button>
      </div>

      {/* ── TABLE ── */}
      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#9baabb' }}>
          Loading trainers...
        </div>
      ) : (
        <div style={styles.tableWrap}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ ...styles.table, minWidth: '700px' }}>
              <thead>
                <tr style={styles.theadRow}>
                  {['No.', 'Name', 'Institute', 'Expertise',
                    'Satisfaction Rate', 'Type', ''].map(h => (
                    <th key={h} style={styles.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.map((trainer, i) => (
                  <tr key={trainer.id} style={styles.tr}>
                    <td style={styles.td}>
                      {(currentPage - 1) * ITEMS_PER_PAGE + i + 1}
                    </td>
                    <td style={styles.td}>
                      <button
                        style={styles.nameBtn}
                        onClick={() => { setSelected(trainer); setSatData(null); }}
                      >
                        {trainer.name}
                      </button>
                    </td>
                    <td style={{ ...styles.td, color: '#5a6878', fontSize: '12.5px' }}>
                      {trainer.institute || '—'}
                    </td>
                    <td style={{ ...styles.td, fontSize: '12px', color: '#5a6878' }}>
                      {Array.isArray(trainer.expertise)
                        ? trainer.expertise.slice(0,2).join(', ')
                        : trainer.expertise || '—'}
                    </td>
                    <td style={styles.td}>
                      <TrainerRating trainerId={trainer.id} />
                    </td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.typeBadge,
                        background: trainer.type === 'Internal' ? '#f0f9ff' : '#fdf4ff',
                        color:      trainer.type === 'Internal' ? '#0369a1' : '#7c3aed',
                      }}>
                        {trainer.type || 'External'}
                      </span>
                    </td>
                    <td style={{ ...styles.td, whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          style={styles.editBtn}
                          onClick={() => openEdit(trainer)}
                          title="Edit"
                        >✏️</button>
                        <button
                          style={{ ...styles.editBtn, background: '#fee2e2' }}
                          onClick={() => handleDelete(trainer.id)}
                          title="Delete"
                        >🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filtered.length === 0 && (
            <div style={{ padding: '40px', textAlign: 'center', color: '#9baabb', fontSize: '14px' }}>
              {trainers.length === 0
                ? 'No trainers yet. Click "Add Trainer" to get started.'
                : 'No trainers found.'
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

      {/* ── ADD TRAINER MODAL ── */}
      {showAdd && (
        <div style={styles.overlay} onClick={() => setShowAdd(false)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <span style={styles.modalTitle}>Add Trainer</span>
              <button style={styles.modalClose} onClick={() => setShowAdd(false)}>×</button>
            </div>
            <div style={styles.modalBody}>
              <TrainerForm
                form={form} setForm={setForm}
                hoverRating={hoverRating}
                setHoverRating={setHoverRating}
                StarRater={StarRater}
              />
            </div>
            <div style={styles.modalFooter}>
              <button style={styles.cancelBtn} onClick={() => setShowAdd(false)}>Cancel</button>
              <button style={styles.saveBtn} onClick={handleSave}>Add</button>
            </div>
          </div>
        </div>
      )}

      {/* ── EDIT TRAINER MODAL ── */}
      {showEdit && selected && (
        <div style={styles.overlay} onClick={() => setShowEdit(false)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <span style={styles.modalTitle}>Edit Trainer</span>
              <button style={styles.modalClose} onClick={() => setShowEdit(false)}>×</button>
            </div>
            <div style={styles.modalBody}>
              <TrainerForm
                form={editForm} setForm={setEditForm}
                hoverRating={hoverRating}
                setHoverRating={setHoverRating}
                StarRater={StarRater}
              />
            </div>
            <div style={styles.modalFooter}>
              <button style={styles.cancelBtn} onClick={() => setShowEdit(false)}>Cancel</button>
              <button style={styles.saveBtn} onClick={handleEditSave}>Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* ── TRAINER PROFILE POPUP ── */}
      {selected && !showEdit && (
        <div style={styles.overlay} onClick={() => { setSelected(null); setSatData(null); }}>
          <div style={{ ...styles.modal, maxWidth: '660px' }}
            onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <span style={styles.modalTitle}>Trainer Profile</span>
              <button style={styles.modalClose} onClick={() => { setSelected(null); setSatData(null); }}>×</button>
            </div>
            <div style={styles.modalBody}>

              {/* Header */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '16px',
                padding: '16px 18px', background: '#f8f9fa',
                borderRadius: '10px', marginBottom: '18px',
                border: '1px solid #e8ecf0',
              }}>
                <div style={{
                  width: '54px', height: '54px', borderRadius: '50%',
                  background: '#051c2c', color: '#ffffff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '18px', fontWeight: '700', flexShrink: 0,
                }}>
                  {initials(selected.name)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '16px', fontWeight: '700', color: '#051c2c' }}>
                    {selected.name}
                  </div>
                  <div style={{ fontSize: '12px', color: '#5a6878', marginTop: '3px' }}>
                    {selected.institute || '—'}
                  </div>
                  <div style={{ marginTop: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {satData && satData.course_count > 0 ? (
                      <>
                        <Stars value={satData.star_value} size={14} />
                        <span style={{ fontSize: '13px', fontWeight: '700', color: '#c8973a' }}>
                          {satData.percentage}%
                        </span>
                      </>
                    ) : (
                      <span style={{ fontSize: '12px', color: '#9baabb' }}>
                        No rated courses yet
                      </span>
                    )}
                  </div>
                </div>
                <span style={{
                  ...styles.typeBadge,
                  background: selected.type === 'Internal' ? '#f0f9ff' : '#fdf4ff',
                  color:      selected.type === 'Internal' ? '#0369a1' : '#7c3aed',
                  alignSelf: 'flex-start',
                }}>
                  {selected.type || 'External'}
                </span>
              </div>

              {/* Bio */}
              {selected.bio && (
                <div style={{
                  fontSize: '13px', color: '#5a6878', lineHeight: 1.65,
                  padding: '13px 16px', background: '#f8f9fa',
                  borderRadius: '8px', borderLeft: '3px solid #051c2c',
                  marginBottom: '16px',
                }}>
                  {selected.bio}
                </div>
              )}

              {/* Expertise */}
              {selected.expertise && selected.expertise.length > 0 && (
                <div style={{ marginBottom: '16px' }}>
                  <div style={{
                    fontSize: '11px', fontWeight: '700', color: '#5a6878',
                    textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px',
                  }}>
                    Areas of Expertise
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {(Array.isArray(selected.expertise)
                      ? selected.expertise : [selected.expertise]
                    ).map((e, i) => (
                      <span key={i} style={{
                        background: '#f2f4f6', border: '1px solid #e8ecf0',
                        borderRadius: '20px', padding: '3px 10px',
                        fontSize: '12px', fontWeight: '500', color: '#051c2c',
                      }}>
                        {e}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Contact */}
              <div style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr',
                gap: '14px', marginBottom: '20px',
              }}>
                <div>
                  <div style={styles.fieldLabel}>Phone</div>
                  <div style={{ fontSize: '13px', fontWeight: '500', color: '#051c2c', marginTop: '4px' }}>
                    {selected.phone || '—'}
                  </div>
                </div>
                <div>
                  <div style={styles.fieldLabel}>Email</div>
                  <div style={{ fontSize: '13px', fontWeight: '500', color: '#051c2c', marginTop: '4px' }}>
                    {selected.email || '—'}
                  </div>
                </div>
              </div>

              {/* ── SATISFACTION RATE SECTION ── */}
              <div style={{ borderTop: '1px solid #e8ecf0', paddingTop: '16px' }}>
                <div style={{
                  display: 'flex', justifyContent: 'space-between',
                  alignItems: 'center', marginBottom: '14px',
                }}>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#051c2c' }}>
                    Satisfaction Rate
                  </div>
                  <div style={styles.periodToggle}>
                    {['monthly', 'quarterly', 'annual'].map(p => (
                      <button
                        key={p}
                        onClick={() => setSatPeriod(p)}
                        style={{
                          ...styles.periodBtn,
                          ...(satPeriod === p ? styles.periodBtnActive : {}),
                        }}
                      >
                        {periodLabel[p]}
                      </button>
                    ))}
                  </div>
                </div>

                {satLoading ? (
                  <div style={{ padding: '16px', textAlign: 'center', color: '#9baabb', fontSize: '13px' }}>
                    Loading...
                  </div>
                ) : satData && satData.course_count > 0 ? (
                  <>
                    {/* Overall score */}
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: '16px',
                      padding: '14px 16px', background: '#f8f9fa',
                      borderRadius: '10px', border: '1px solid #e8ecf0',
                      marginBottom: '14px',
                    }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '32px', fontWeight: '800', color: '#c8973a', lineHeight: 1 }}>
                          {satData.percentage}%
                        </div>
                        <div style={{ fontSize: '10px', color: '#9baabb', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          Overall
                        </div>
                      </div>
                      <div style={{ flex: 1 }}>
                        <Stars value={satData.star_value} size={20} />
                        <div style={{ fontSize: '12px', color: '#5a6878', marginTop: '6px' }}>
                          Based on {satData.course_count} course{satData.course_count !== 1 ? 's' : ''} — {periodLabel[satPeriod]}
                        </div>
                      </div>
                    </div>

                    {/* Per course breakdown */}
                    <div style={{ marginBottom: '16px' }}>
                      <div style={{
                        fontSize: '11px', fontWeight: '700', color: '#5a6878',
                        textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px',
                      }}>
                        Course Breakdown
                      </div>
                      {satData.courses.map((c, i) => (
                        <CourseSatisfactionBar key={i} title={c.title} pct={c.percentage} />
                      ))}
                    </div>
                  </>
                ) : (
                  <div style={{
                    padding: '16px', background: '#f8f9fa', borderRadius: '8px',
                    border: '1px solid #e8ecf0', textAlign: 'center',
                    fontSize: '13px', color: '#9baabb',
                  }}>
                    No rated courses found for {periodLabel[satPeriod].toLowerCase()}.
                    <br />
                    <span style={{ fontSize: '11px' }}>
                      Rate courses by editing them on the Courses page.
                    </span>
                  </div>
                )}

                {/* ── STAR LEGEND ── */}
                <div style={{ marginTop: '16px' }}>
                  <div style={{
                    fontSize: '11px', fontWeight: '700', color: '#5a6878',
                    textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px',
                  }}>
                    Rating Legend
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px' }}>
                    {STAR_LEGEND.map(item => (
                      <div key={item.stars} style={{
                        background: '#f8f9fa', borderRadius: '8px',
                        padding: '8px', textAlign: 'center',
                        border: '1px solid #e8ecf0',
                      }}>
                        <div style={{ fontSize: '14px', color: '#c8973a', marginBottom: '2px' }}>
                          {'★'.repeat(item.stars)}{'☆'.repeat(5 - item.stars)}
                        </div>
                        <div style={{ fontSize: '12px', fontWeight: '700', color: item.color }}>
                          {item.pct}
                        </div>
                        <div style={{ fontSize: '10px', color: '#9baabb', marginTop: '2px' }}>
                          {item.label}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>

            <div style={styles.modalFooter}>
              <button style={styles.cancelBtn} onClick={() => { setSelected(null); setSatData(null); }}>
                Close
              </button>
              <button style={styles.saveBtn} onClick={() => openEdit(selected)}>
                Edit Trainer
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

function TrainerForm({ form, setForm, hoverRating, setHoverRating, StarRater }) {
  return (
    <>
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '16px' }}>
        <div style={{
          width: '72px', height: '72px', borderRadius: '50%',
          border: '2px dashed #e8ecf0', display: 'flex',
          alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <span style={{ fontSize: '28px' }}>👤</span>
        </div>
        <div style={{ flex: 1 }}>
          <F label="Trainer Name *" value={form.name}
            onChange={v => setForm({...form, name: v})} placeholder="Full name" />
        </div>
      </div>
      <div style={{ marginBottom: '14px' }}>
        <label style={{
          fontSize: '11px', fontWeight: '700', color: '#5a6878',
          textTransform: 'uppercase', letterSpacing: '0.5px',
          display: 'block', marginBottom: '6px',
        }}>
          Trainer Rating
        </label>
        <StarRater value={form.rating} onChange={v => setForm({...form, rating: v})} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
        <F label="Institute"      value={form.institute}  onChange={v => setForm({...form, institute: v})}  placeholder="e.g. RERA Academy" />
        <F label="Type"           value={form.type}       onChange={v => setForm({...form, type: v})}       type="select" options={['Internal','External']} />
        <F label="Contact Number" value={form.phone}      onChange={v => setForm({...form, phone: v})}      placeholder="+971 50 000 0000" />
        <F label="Email Address"  value={form.email}      onChange={v => setForm({...form, email: v})}      placeholder="trainer@email.com" type="email" />
        <div style={{ gridColumn: 'span 2' }}>
          <F label="Area of Expertise (comma separated)"
            value={form.expertise}
            onChange={v => setForm({...form, expertise: v})}
            placeholder="e.g. Leadership, Sales" />
        </div>
      </div>
      <div>
        <label style={{
          fontSize: '11px', fontWeight: '700', color: '#5a6878',
          textTransform: 'uppercase', letterSpacing: '0.5px',
          display: 'block', marginBottom: '5px',
        }}>
          Bio
        </label>
        <textarea
          value={form.bio}
          onChange={e => setForm({...form, bio: e.target.value})}
          placeholder="Brief background of the trainer"
          style={{
            width: '100%', padding: '10px 12px', border: '1.5px solid #e8ecf0',
            borderRadius: '8px', fontSize: '13px', outline: 'none',
            background: '#f8f9fa', resize: 'vertical', minHeight: '70px',
            fontFamily: 'Inter, sans-serif', boxSizing: 'border-box',
          }}
        />
      </div>
    </>
  );
}

function F({ label, value, onChange, placeholder, type = 'text', options = [] }) {
  const inputStyle = {
    width: '100%', padding: '10px 12px', border: '1.5px solid #e8ecf0',
    borderRadius: '8px', fontSize: '13px', outline: 'none',
    background: '#f8f9fa', color: '#051c2c', fontFamily: 'Inter, sans-serif',
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
        <input type={type} value={value} placeholder={placeholder}
          onChange={e => onChange(e.target.value)} style={inputStyle} />
      )}
    </div>
  );
}

const styles = {
  page:            { padding: '30px', minHeight: '100vh', background: '#f2f4f6', fontFamily: 'Inter, sans-serif' },
  controls:        { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
  searchWrap:      { display: 'flex', alignItems: 'center', background: '#ffffff', border: '1.5px solid #e8ecf0', borderRadius: '8px', padding: '0 12px', gap: '6px' },
  searchInput:     { border: 'none', outline: 'none', fontSize: '13px', padding: '10px 0', width: '200px', background: 'transparent', fontFamily: 'Inter, sans-serif' },
  addBtn:          { background: '#051c2c', color: '#ffffff', border: 'none', borderRadius: '8px', padding: '10px 20px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'Inter, sans-serif' },
  tableWrap:       { background: '#ffffff', borderRadius: '12px', border: '1px solid #e8ecf0', overflow: 'hidden' },
  table:           { width: '100%', borderCollapse: 'collapse' },
  theadRow:        { background: '#051c2c' },
  th:              { padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' },
  tr:              { borderBottom: '1px solid #f0f2f4' },
  td:              { padding: '13px 16px', fontSize: '13px', color: '#051c2c', verticalAlign: 'middle' },
  nameBtn:         { background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '600', color: '#051c2c', padding: 0, fontFamily: 'Inter, sans-serif', textDecoration: 'underline', textDecorationColor: '#e8ecf0' },
  typeBadge:       { padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600' },
  editBtn:         { background: '#051c2c', border: 'none', borderRadius: '6px', padding: '5px 8px', cursor: 'pointer', fontSize: '13px' },
  overlay:         { position: 'fixed', inset: 0, background: 'rgba(5,28,44,0.55)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' },
  modal:           { background: '#ffffff', borderRadius: '16px', width: '100%', maxWidth: '560px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 64px rgba(5,28,44,0.25)' },
  modalHeader:     { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid #e8ecf0', position: 'sticky', top: 0, background: '#ffffff', zIndex: 1 },
  modalTitle:      { fontSize: '18px', fontWeight: '700', color: '#051c2c' },
  modalClose:      { background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#9baabb' },
  modalBody:       { padding: '22px 24px' },
  modalFooter:     { padding: '14px 24px', borderTop: '1px solid #e8ecf0', display: 'flex', justifyContent: 'flex-end', gap: '10px' },
  cancelBtn:       { padding: '9px 20px', background: 'none', border: '1.5px solid #e8ecf0', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', fontFamily: 'Inter, sans-serif' },
  saveBtn:         { padding: '9px 24px', background: '#051c2c', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', color: '#ffffff', fontFamily: 'Inter, sans-serif' },
  fieldLabel:      { fontSize: '11px', fontWeight: '700', color: '#5a6878', textTransform: 'uppercase', letterSpacing: '0.5px' },
  periodToggle:    { display: 'flex', background: '#f2f4f6', borderRadius: '6px', padding: '2px', gap: '2px' },
  periodBtn:       { padding: '4px 10px', fontSize: '11px', fontWeight: '500', border: 'none', background: 'none', borderRadius: '4px', cursor: 'pointer', color: '#5a6878', fontFamily: 'Inter, sans-serif', whiteSpace: 'nowrap' },
  periodBtnActive: { background: '#051c2c', color: '#ffffff' },
};

export default TrainersPage;