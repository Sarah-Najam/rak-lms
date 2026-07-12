import React, { useState, useEffect } from 'react';
import api from '../api';
import Pagination from '../components/Pagination';

const ITEMS_PER_PAGE = 20;

function TrainersPage({ user }) {

  const isHod = user?.role === 'hod';

  const [trainers,        setTrainers]        = useState([]);
  const [loading,         setLoading]         = useState(true);
  const [showAdd,         setShowAdd]         = useState(false);
  const [selectedTrainer, setSelectedTrainer] = useState(null);
  const [editTrainer,     setEditTrainer]     = useState(null);
  const [currentPage,     setCurrentPage]     = useState(1);
  const [searchTerm,      setSearchTerm]      = useState('');
  const [satData,         setSatData]         = useState(null);
  const [satPeriod,       setSatPeriod]       = useState('annual');
  const [satLoading,      setSatLoading]      = useState(false);
  const [uploadingId,     setUploadingId]     = useState(null);
  const [photoPreview,    setPhotoPreview]    = useState(null);

  const emptyForm = {
    name: '', institute: '', expertise: '', rating: '',
    phone: '', email: '', bio: '', type: 'External',
  };
  const [form,     setForm]     = useState(emptyForm);
  const [editForm, setEditForm] = useState(emptyForm);

  useEffect(() => {
    loadTrainers();
  }, []);

  const loadTrainers = () => {
    api.getTrainers()
      .then(data => {
        if (Array.isArray(data)) setTrainers(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const handlePhotoUpload = async (trainerId, file) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('File too large. Maximum size is 5MB.');
      return;
    }
    setUploadingId(trainerId);
    try {
      const result = await api.uploadTrainerPhoto(trainerId, file);
      if (result.url) {
        loadTrainers();
        if (selectedTrainer && selectedTrainer.id === trainerId) {
          setSelectedTrainer(prev => ({ ...prev, photo_url: result.url }));
        }
      } else {
        alert(result.error || 'Upload failed.');
      }
    } catch (err) {
      alert('Error uploading photo.');
    }
    setUploadingId(null);
  };

  const handleRemovePhoto = async (trainerId) => {
    if (!window.confirm('Remove this photo?')) return;
    try {
      const result = await api.removeTrainerPhoto(trainerId);
      if (result.message) {
        loadTrainers();
        if (selectedTrainer && selectedTrainer.id === trainerId) {
          setSelectedTrainer(prev => ({ ...prev, photo_url: null }));
        }
      }
    } catch (err) {
      alert('Error removing photo.');
    }
  };

  const filtered = trainers.filter(t =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginated = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const loadSatisfaction = async (trainer, period) => {
    setSatLoading(true);
    setSatData(null);
    try {
      const data = await api.getTrainerSatisfactionByName(trainer.name, period);
      setSatData(data);
    } catch (err) {
      setSatData(null);
    }
    setSatLoading(false);
  };

  const openTrainerDetail = (trainer) => {
    setSelectedTrainer(trainer);
    setSatPeriod('annual');
    loadSatisfaction(trainer, 'annual');
  };

  const handlePeriodChange = (period) => {
    setSatPeriod(period);
    if (selectedTrainer) loadSatisfaction(selectedTrainer, period);
  };

  const handleSave = async () => {
    if (!form.name) { alert('Trainer name is required.'); return; }
    try {
      const result = await api.addTrainer({
        name:      form.name,
        institute: form.institute,
        expertise: form.expertise ? form.expertise.split(',').map(e => e.trim()) : [],
        rating:    +form.rating || 0,
        phone:     form.phone,
        email:     form.email,
        bio:       form.bio,
        type:      form.type,
      });
      if (result.id) {
        loadTrainers();
        setForm(emptyForm);
        setShowAdd(false);
      } else {
        alert(result.error || 'Could not save trainer.');
      }
    } catch (err) {
      alert('Error connecting to server.');
    }
  };

  const handleEditSave = async () => {
    if (!editForm.name) { alert('Trainer name is required.'); return; }
    try {
      const result = await api.updateTrainer(editTrainer.id, {
        name:      editForm.name,
        institute: editForm.institute,
        expertise: editForm.expertise ? editForm.expertise.split(',').map(e => e.trim()) : [],
        rating:    +editForm.rating || 0,
        phone:     editForm.phone,
        email:     editForm.email,
        bio:       editForm.bio,
        type:      editForm.type,
      });
      if (result.id) {
        loadTrainers();
        setEditTrainer(null);
        if (selectedTrainer?.id === result.id) {
          setSelectedTrainer(result);
        }
      } else {
        alert(result.error || 'Could not update trainer.');
      }
    } catch (err) {
      alert('Error connecting to server.');
    }
  };

  const openEdit = (trainer) => {
    setEditForm({
      name:      trainer.name      || '',
      institute: trainer.institute || '',
      expertise: Array.isArray(trainer.expertise)
        ? trainer.expertise.join(', ')
        : trainer.expertise || '',
      rating:    trainer.rating || '',
      phone:     trainer.phone  || '',
      email:     trainer.email  || '',
      bio:       trainer.bio    || '',
      type:      trainer.type   || 'External',
    });
    setEditTrainer(trainer);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this trainer?')) return;
    try {
      await api.deleteTrainer(id);
      loadTrainers();
      if (selectedTrainer?.id === id) setSelectedTrainer(null);
    } catch (err) {
      alert('Error deleting trainer.');
    }
  };

  const StarBar = ({ label, value, maxVal }) => {
    const pct = maxVal > 0 ? Math.round((value / maxVal) * 100) : 0;
    return (
      <div style={{ marginBottom: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
          <span style={{ fontSize: '12px', color: '#051c2c', fontWeight: '500', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '180px' }}>{label}</span>
          <span style={{ fontSize: '12px', color: '#c8973a', fontWeight: '700', marginLeft: '8px' }}>{pct}%</span>
        </div>
        <div style={{ height: '6px', background: '#e8ecf0', borderRadius: '3px', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${pct}%`, background: pct >= 80 ? '#16a34a' : pct >= 60 ? '#c8973a' : '#dc2626', borderRadius: '3px', transition: 'width 0.3s ease' }} />
        </div>
      </div>
    );
  };

  const AvatarDisplay = ({ trainer, size = 'sm' }) => {
    const isLarge = size === 'lg';
    const dim     = isLarge ? '64px' : '36px';
    const fontSize = isLarge ? '20px' : '12px';
    const initials = trainer.name.split(' ').slice(0,2).map(w => w[0]).join('').toUpperCase();

    return (
      <div style={{ position: 'relative', width: dim, height: dim, flexShrink: 0 }}>
        {/* Avatar circle — clickable to preview if large */}
        <div
          onClick={() => isLarge && trainer.photo_url ? setPhotoPreview(trainer.photo_url) : null}
          style={{
            width: dim, height: dim, borderRadius: '50%',
            background: '#051c2c', color: '#ffffff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize, fontWeight: '700', overflow: 'hidden',
            cursor: isLarge && trainer.photo_url ? 'zoom-in' : 'default',
          }}
        >
          {trainer.photo_url
            ? <img src={trainer.photo_url} alt={trainer.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : initials
          }
        </div>

        {/* Upload button */}
        {isLarge && !isHod && (
          <label style={styles.photoUploadBtn} title="Upload photo">
            {uploadingId === trainer.id ? '⏳' : '📷'}
            <input
              type="file" accept="image/jpeg,image/png,image/webp"
              style={{ display: 'none' }}
              onChange={e => handlePhotoUpload(trainer.id, e.target.files[0])}
            />
          </label>
        )}

        {/* Remove button — only shows if photo exists */}
        {isLarge && !isHod && trainer.photo_url && (
          <button
            onClick={() => handleRemovePhoto(trainer.id)}
            title="Remove photo"
            style={{
              position: 'absolute', top: '-4px', right: '-28px',
              width: '22px', height: '22px', borderRadius: '50%',
              background: '#fee2e2', color: '#991b1b',
              border: '2px solid #ffffff', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              fontSize: '11px', cursor: 'pointer', fontWeight: '700',
              lineHeight: 1,
            }}
          >
            ✕
          </button>
        )}
      </div>
    );
  };

  return (
    <div style={styles.page}>

      {/* ── CONTROLS ── */}
      <div style={styles.controls}>
        <div style={styles.searchWrap}>
          <span style={{ fontSize: '13px' }}>🔍</span>
          <input
            style={styles.searchInput}
            placeholder="Search by Trainer Name"
            value={searchTerm}
            onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          />
        </div>
        {!isHod && (
          <button style={styles.addBtn} onClick={() => setShowAdd(true)}>
            Add Trainer
          </button>
        )}
      </div>

      {/* ── TABLE ── */}
      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#9baabb' }}>
          Loading trainers...
        </div>
      ) : (
        <div style={styles.tableWrap}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ ...styles.table, minWidth: '800px' }}>
              <thead>
                <tr style={styles.theadRow}>
                  {['No.', 'Trainer', 'Institute', 'Type', 'Expertise',
                    'Satisfaction Rate', 'Contact', ...(isHod ? [] : [''])].map(h => (
                    <th key={h} style={styles.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.map((trainer, i) => {
                  const satPct = trainer.rating > 0
                    ? Math.round((+trainer.rating / 5) * 100)
                    : null;
                  return (
                    <tr key={trainer.id} style={styles.tr}>
                      <td style={styles.td}>
                        {(currentPage - 1) * ITEMS_PER_PAGE + i + 1}
                      </td>
                      <td style={{ ...styles.td, minWidth: '180px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <AvatarDisplay trainer={trainer} size="sm" />
                          <button style={styles.nameBtn} onClick={() => openTrainerDetail(trainer)}>
                            {trainer.name}
                          </button>
                        </div>
                      </td>
                      <td style={{ ...styles.td, fontSize: '12px', color: '#5a6878' }}>
                        {trainer.institute || '—'}
                      </td>
                      <td style={styles.td}>
                        <span style={{
                          background: trainer.type === 'Internal' ? '#f0f9ff' : '#fdf4ff',
                          color:      trainer.type === 'Internal' ? '#0369a1' : '#7c3aed',
                          padding: '3px 10px', borderRadius: '20px',
                          fontSize: '11px', fontWeight: '600',
                        }}>
                          {trainer.type || 'External'}
                        </span>
                      </td>
                      <td style={{ ...styles.td, fontSize: '12px', color: '#5a6878', maxWidth: '180px' }}>
                        {Array.isArray(trainer.expertise)
                          ? trainer.expertise.join(', ')
                          : trainer.expertise || '—'}
                      </td>
                      <td style={styles.td}>
                        {satPct !== null ? (
                          <span style={{
                            background: satPct >= 80 ? '#dcfce7' : satPct >= 60 ? '#fef9c3' : '#fee2e2',
                            color:      satPct >= 80 ? '#15803d' : satPct >= 60 ? '#a16207' : '#991b1b',
                            padding: '3px 10px', borderRadius: '20px',
                            fontSize: '11px', fontWeight: '700',
                          }}>
                            {satPct}%
                          </span>
                        ) : (
                          <span style={{ color: '#9baabb', fontSize: '12px' }}>No data</span>
                        )}
                      </td>
                      <td style={{ ...styles.td, fontSize: '12px', color: '#5a6878' }}>
                        <div>{trainer.phone || '—'}</div>
                        <div style={{ color: '#9baabb' }}>{trainer.email || ''}</div>
                      </td>
                      {!isHod && (
                        <td style={{ ...styles.td, whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button style={styles.actionBtn} onClick={() => openEdit(trainer)} title="Edit">✏️</button>
                            <button style={{ ...styles.actionBtn, background: '#fee2e2' }} onClick={() => handleDelete(trainer.id)} title="Delete">🗑️</button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filtered.length === 0 && (
            <div style={{ padding: '40px', textAlign: 'center', color: '#9baabb', fontSize: '14px' }}>
              {trainers.length === 0
                ? 'No trainers yet. Click "Add Trainer" to get started.'
                : 'No trainers match your search.'
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

      {/* ── TRAINER DETAIL POPUP ── */}
      {selectedTrainer && (
        <div style={styles.overlay} onClick={() => setSelectedTrainer(null)}>
          <div style={{ ...styles.modal, maxWidth: '580px' }} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <span style={styles.modalTitle}>Trainer Profile</span>
              <button style={styles.modalClose} onClick={() => setSelectedTrainer(null)}>×</button>
            </div>
            <div style={styles.modalBody}>

              {/* Header with photo */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '16px', background: '#f8f9fa', borderRadius: '12px', border: '1px solid #e8ecf0', marginBottom: '20px' }}>
                <AvatarDisplay trainer={selectedTrainer} size="lg" />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '18px', fontWeight: '700', color: '#051c2c' }}>
                    {selectedTrainer.name}
                  </div>
                  <div style={{ fontSize: '13px', color: '#5a6878', marginTop: '2px' }}>
                    {selectedTrainer.institute || '—'}
                  </div>
                  <div style={{ marginTop: '6px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{
                      background: selectedTrainer.type === 'Internal' ? '#f0f9ff' : '#fdf4ff',
                      color:      selectedTrainer.type === 'Internal' ? '#0369a1' : '#7c3aed',
                      padding: '3px 10px', borderRadius: '20px',
                      fontSize: '11px', fontWeight: '600',
                    }}>
                      {selectedTrainer.type || 'External'}
                    </span>
                  </div>
                  {selectedTrainer.photo_url && (
                    <div style={{ marginTop: '8px', display: 'flex', gap: '8px', fontSize: '11px' }}>
                      <button
                        onClick={() => setPhotoPreview(selectedTrainer.photo_url)}
                        style={{ background: 'none', border: 'none', color: '#0369a1', cursor: 'pointer', fontSize: '11px', fontFamily: 'Inter, sans-serif', textDecoration: 'underline', padding: 0 }}
                      >
                        🔍 View full photo
                      </button>
                      {!isHod && (
                        <button
                          onClick={() => handleRemovePhoto(selectedTrainer.id)}
                          style={{ background: 'none', border: 'none', color: '#991b1b', cursor: 'pointer', fontSize: '11px', fontFamily: 'Inter, sans-serif', textDecoration: 'underline', padding: 0 }}
                        >
                          ✕ Remove photo
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Bio */}
              {selectedTrainer.bio && (
                <div style={{ fontSize: '13px', color: '#5a6878', lineHeight: 1.65, padding: '12px 16px', background: '#f8f9fa', borderRadius: '8px', borderLeft: '3px solid #051c2c', marginBottom: '16px' }}>
                  {selectedTrainer.bio}
                </div>
              )}

              {/* Expertise */}
              {selectedTrainer.expertise && selectedTrainer.expertise.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ fontSize: '11px', fontWeight: '700', color: '#5a6878', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
                    Areas of Expertise
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {(Array.isArray(selectedTrainer.expertise)
                      ? selectedTrainer.expertise
                      : [selectedTrainer.expertise]
                    ).map((e, i) => (
                      <span key={i} style={{ background: '#f2f4f6', border: '1px solid #e8ecf0', borderRadius: '20px', padding: '4px 12px', fontSize: '12px', color: '#051c2c' }}>
                        {e}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Contact */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
                {[
                  ['Phone', selectedTrainer.phone || '—'],
                  ['Email', selectedTrainer.email || '—'],
                ].map(([k, v]) => (
                  <div key={k}>
                    <div style={{ fontSize: '10px', fontWeight: '700', color: '#9baabb', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>{k}</div>
                    <div style={{ fontSize: '13px', fontWeight: '500', color: '#051c2c' }}>{v}</div>
                  </div>
                ))}
              </div>

              {/* Satisfaction */}
              <div style={{ background: '#f8f9fa', borderRadius: '12px', padding: '16px', border: '1px solid #e8ecf0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <span style={{ fontSize: '13px', fontWeight: '700', color: '#051c2c' }}>
                    Satisfaction Rate
                  </span>
                  <div style={styles.periodToggle}>
                    {['monthly', 'quarterly', 'annual'].map(p => (
                      <button
                        key={p}
                        onClick={() => handlePeriodChange(p)}
                        style={{ ...styles.periodBtn, ...(satPeriod === p ? styles.periodBtnActive : {}) }}
                      >
                        {p.charAt(0).toUpperCase() + p.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {satLoading ? (
                  <div style={{ textAlign: 'center', padding: '20px', color: '#9baabb', fontSize: '13px' }}>
                    Loading...
                  </div>
                ) : satData && satData.course_count > 0 ? (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                      <div style={{ position: 'relative', width: '80px', height: '80px', flexShrink: 0 }}>
                        <svg viewBox="0 0 80 80" style={{ width: '80px', height: '80px', transform: 'rotate(-90deg)' }}>
                          <circle cx="40" cy="40" r="34" fill="none" stroke="#e8ecf0" strokeWidth="8" />
                          <circle cx="40" cy="40" r="34" fill="none"
                            stroke={satData.percentage >= 80 ? '#16a34a' : satData.percentage >= 60 ? '#c8973a' : '#dc2626'}
                            strokeWidth="8"
                            strokeDasharray={`${2 * Math.PI * 34 * satData.percentage / 100} ${2 * Math.PI * 34}`}
                            strokeLinecap="round" />
                        </svg>
                        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                          <span style={{ fontSize: '16px', fontWeight: '800', color: '#051c2c', lineHeight: 1 }}>
                            {satData.percentage}%
                          </span>
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '13px', color: '#5a6878' }}>
                          Based on <strong>{satData.course_count}</strong> course{satData.course_count !== 1 ? 's' : ''}
                        </div>
                        <div style={{ fontSize: '13px', color: '#c8973a', marginTop: '4px' }}>
                          {'★'.repeat(Math.round(satData.star_value))}{'☆'.repeat(5 - Math.round(satData.star_value))}
                          <span style={{ fontSize: '12px', color: '#9baabb', marginLeft: '6px' }}>{satData.star_value}/5</span>
                        </div>
                      </div>
                    </div>
                    <div style={{ borderTop: '1px solid #e8ecf0', paddingTop: '14px' }}>
                      <div style={{ fontSize: '11px', fontWeight: '700', color: '#9baabb', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>
                        Course Breakdown
                      </div>
                      {satData.courses.map((c, i) => (
                        <StarBar key={i} label={c.title} value={c.percentage} maxVal={100} />
                      ))}
                    </div>
                  </>
                ) : (
                  <div style={{ textAlign: 'center', padding: '20px', color: '#9baabb', fontSize: '13px' }}>
                    No rated courses for this period.
                  </div>
                )}
              </div>

            </div>
            <div style={styles.modalFooter}>
              <button style={styles.cancelBtn} onClick={() => setSelectedTrainer(null)}>Close</button>
              {!isHod && (
                <button style={styles.saveBtn} onClick={() => { setSelectedTrainer(null); openEdit(selectedTrainer); }}>
                  Edit Trainer
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── ADD TRAINER MODAL ── */}
      {showAdd && !isHod && (
        <div style={styles.overlay} onClick={() => setShowAdd(false)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <span style={styles.modalTitle}>Add Trainer</span>
              <button style={styles.modalClose} onClick={() => setShowAdd(false)}>×</button>
            </div>
            <div style={styles.modalBody}><TrainerForm f={form} setF={setForm} /></div>
            <div style={styles.modalFooter}>
              <button style={styles.cancelBtn} onClick={() => setShowAdd(false)}>Cancel</button>
              <button style={styles.saveBtn} onClick={handleSave}>Add</button>
            </div>
          </div>
        </div>
      )}

      {/* ── EDIT TRAINER MODAL ── */}
      {editTrainer && !isHod && (
        <div style={styles.overlay} onClick={() => setEditTrainer(null)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <span style={styles.modalTitle}>Edit Trainer</span>
              <button style={styles.modalClose} onClick={() => setEditTrainer(null)}>×</button>
            </div>
            <div style={styles.modalBody}><TrainerForm f={editForm} setF={setEditForm} /></div>
            <div style={styles.modalFooter}>
              <button style={styles.cancelBtn} onClick={() => setEditTrainer(null)}>Cancel</button>
              <button style={styles.saveBtn} onClick={handleEditSave}>Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* ── PHOTO PREVIEW LIGHTBOX ── */}
      {photoPreview && (
        <div
          onClick={() => setPhotoPreview(null)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)',
            zIndex: 2000, display: 'flex', alignItems: 'center',
            justifyContent: 'center', padding: '20px', cursor: 'zoom-out',
          }}
        >
          <div style={{ position: 'relative' }} onClick={e => e.stopPropagation()}>
            <img
              src={photoPreview}
              alt="Preview"
              style={{
                maxWidth: '90vw', maxHeight: '85vh',
                borderRadius: '12px',
                boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
                display: 'block',
              }}
            />
            <button
              onClick={() => setPhotoPreview(null)}
              style={{
                position: 'absolute', top: '-14px', right: '-14px',
                width: '32px', height: '32px', borderRadius: '50%',
                background: '#ffffff', border: 'none', fontSize: '18px',
                cursor: 'pointer', display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontWeight: '700', color: '#051c2c',
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)', lineHeight: 1,
              }}
            >
              ×
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

function TrainerForm({ f, setF }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
        <F label="Full Name *"         value={f.name}      onChange={v => setF({...f, name: v})}      placeholder="e.g. Dr. Omar Khalid" />
        <F label="Institute"            value={f.institute} onChange={v => setF({...f, institute: v})} placeholder="e.g. RERA Academy" />
        <F label="Type"                 value={f.type}      onChange={v => setF({...f, type: v})}      type="select" options={['External', 'Internal']} />
        <F label="Rating (1-5)"         value={f.rating}    onChange={v => setF({...f, rating: v})}    placeholder="e.g. 4.5" type="number" />
        <F label="Phone"                value={f.phone}     onChange={v => setF({...f, phone: v})}     placeholder="+971-50-123-4567" />
        <F label="Email"                value={f.email}     onChange={v => setF({...f, email: v})}     placeholder="trainer@email.com" type="email" />
        <div style={{ gridColumn: 'span 2' }}>
          <F label="Expertise (comma separated)" value={f.expertise} onChange={v => setF({...f, expertise: v})} placeholder="e.g. Leadership, Management, Strategy" />
        </div>
      </div>
      <div>
        <label style={{ fontSize: '11px', fontWeight: '700', color: '#5a6878', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '5px' }}>Bio</label>
        <textarea value={f.bio} onChange={e => setF({...f, bio: e.target.value})
          } placeholder="Brief description of trainer's background and experience..."
          style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #e8ecf0', borderRadius: '8px', fontSize: '13px', outline: 'none', background: '#f8f9fa', color: '#051c2c', fontFamily: 'Inter, sans-serif', minHeight: '80px', resize: 'vertical', boxSizing: 'border-box' }}
        />
      </div>
    </div>
  );
}

function F({ label, value, onChange, placeholder, type = 'text', options = [] }) {
  const inputStyle = {
    width: '100%', padding: '9px 12px', border: '1.5px solid #e8ecf0',
    borderRadius: '8px', fontSize: '13px', outline: 'none',
    background: '#f8f9fa', color: '#051c2c', fontFamily: 'Inter, sans-serif',
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
      <label style={{ fontSize: '11px', fontWeight: '700', color: '#5a6878', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</label>
      {type === 'select' ? (
        <select value={value} onChange={e => onChange(e.target.value)} style={inputStyle}>
          <option value="">Select...</option>
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
  searchInput:     { border: 'none', outline: 'none', fontSize: '13px', padding: '10px 0', width: '240px', background: 'transparent', fontFamily: 'Inter, sans-serif' },
  addBtn:          { background: '#051c2c', color: '#ffffff', border: 'none', borderRadius: '8px', padding: '10px 20px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'Inter, sans-serif' },
  tableWrap:       { background: '#ffffff', borderRadius: '12px', border: '1px solid #e8ecf0', overflow: 'hidden' },
  table:           { width: '100%', borderCollapse: 'collapse' },
  theadRow:        { background: '#051c2c' },
  th:              { padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' },
  tr:              { borderBottom: '1px solid #f0f2f4' },
  td:              { padding: '12px 16px', fontSize: '13px', color: '#051c2c', verticalAlign: 'middle' },
  nameBtn:         { background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '600', color: '#051c2c', padding: 0, fontFamily: 'Inter, sans-serif', textDecoration: 'underline', textDecorationColor: '#e8ecf0' },
  actionBtn:       { background: '#051c2c', border: 'none', borderRadius: '6px', padding: '5px 8px', cursor: 'pointer', fontSize: '13px' },
  photoUploadBtn:  { position: 'absolute', bottom: 0, right: 0, width: '22px', height: '22px', borderRadius: '50%', background: '#051c2c', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', cursor: 'pointer', border: '2px solid #ffffff' },
  overlay:         { position: 'fixed', inset: 0, background: 'rgba(5,28,44,0.55)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' },
  modal:           { background: '#ffffff', borderRadius: '16px', width: '100%', maxWidth: '560px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 64px rgba(5,28,44,0.25)' },
  modalHeader:     { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid #e8ecf0', position: 'sticky', top: 0, background: '#ffffff', zIndex: 1 },
  modalTitle:      { fontSize: '18px', fontWeight: '700', color: '#051c2c' },
  modalClose:      { background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#9baabb' },
  modalBody:       { padding: '20px 24px' },
  modalFooter:     { padding: '14px 24px', borderTop: '1px solid #e8ecf0', display: 'flex', justifyContent: 'flex-end', gap: '10px' },
  cancelBtn:       { padding: '9px 20px', background: 'none', border: '1.5px solid #e8ecf0', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', fontFamily: 'Inter, sans-serif' },
  saveBtn:         { padding: '9px 24px', background: '#051c2c', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', color: '#ffffff', fontFamily: 'Inter, sans-serif' },
  periodToggle:    { display: 'flex', background: '#f2f4f6', borderRadius: '6px', padding: '2px', gap: '2px' },
  periodBtn:       { padding: '4px 10px', fontSize: '11px', fontWeight: '500', border: 'none', background: 'none', borderRadius: '4px', cursor: 'pointer', color: '#5a6878', fontFamily: 'Inter, sans-serif', textTransform: 'capitalize' },
  periodBtnActive: { background: '#051c2c', color: '#ffffff' },
};

export default TrainersPage;