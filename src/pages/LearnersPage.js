import React, { useState, useEffect } from 'react';
import api from '../api';
import Pagination from '../components/Pagination';

const ITEMS_PER_PAGE = 20;

function LearnersPage({ user }) {

  const isHod = user?.role === 'hod';

  const [activeTab,      setActiveTab]      = useState('all');
  const [showModal,      setShowModal]      = useState(false);
  const [showEdit,       setShowEdit]       = useState(false);
  const [showProfile,    setShowProfile]    = useState(false);
  const [showAssign,     setShowAssign]     = useState(false);
  const [actionMenu,     setActionMenu]     = useState(null);
  const [searchName,     setSearchName]     = useState('');
  const [searchId,       setSearchId]       = useState('');
  const [searchEmail,    setSearchEmail]    = useState('');
  const [learners,       setLearners]       = useState([]);
  const [departments,    setDepartments]    = useState([]);
  const [allCourses,     setAllCourses]     = useState([]);
  const [enrolled,       setEnrolled]       = useState([]);
  const [profileCourses, setProfileCourses] = useState([]);
  const [profileLoading, setProfileLoading] = useState(false);
  const [assignLoading,  setAssignLoading]  = useState(false);
  const [loading,        setLoading]        = useState(true);
  const [selected,       setSelected]       = useState(null);
  const [currentPage,    setCurrentPage]    = useState(1);
  const [enrollStats,    setEnrollStats]    = useState({ enrolled: 0, attended: 0 });

  const emptyForm = {
    empId: '', name: '', nationality: '', designation: '',
    department: '', email: '', gender: '', status: 'Active',
    learnerLevel: '', age: '',
  };
  const [form,     setForm]     = useState(emptyForm);
  const [editForm, setEditForm] = useState(emptyForm);

  useEffect(() => {
    loadLearners();
    api.getDepartments().then(data => { if (Array.isArray(data)) setDepartments(data); });
    api.getCourses().then(data => { if (Array.isArray(data)) setAllCourses(data); });
    api.getReports().then(stats => {
      setEnrollStats({
        enrolled: stats?.totalEnrolled || 0,
        attended: stats?.totalAttended || 0,
      });
    });
  }, []);

  const loadLearners = () => {
    api.getLearners()
      .then(data => {
        if (Array.isArray(data)) setLearners(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const emiratiLearners = learners.filter(l => l.nationality === 'Emirati');
  const emiratiMale     = emiratiLearners.filter(l => l.gender === 'Male');
  const emiratiFemale   = emiratiLearners.filter(l => l.gender === 'Female');
  const allMale         = learners.filter(l => l.gender === 'Male');
  const allFemale       = learners.filter(l => l.gender === 'Female');

  const activeLearnersCount   = learners.filter(l => l.status === 'Active').length;
  const inactiveLearnersCount = learners.filter(l => l.status !== 'Active').length;

  const filtered = learners.filter(l => {
    const name  = l.name   || '';
    const emp   = l.emp_id || '';
    const email = l.email  || '';
    const nat   = l.nationality || '';
    const matchTab   = activeTab === 'all' || nat === 'Emirati';
    const matchName  = name.toLowerCase().includes(searchName.toLowerCase());
    const matchId    = emp.toLowerCase().includes(searchId.toLowerCase());
    const matchEmail = email.toLowerCase().includes(searchEmail.toLowerCase());
    return matchTab && matchName && matchId && matchEmail;
  });

  const paginated = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const totalTrainingHours = profileCourses.reduce((s, c) => {
    if (c.attended) return s + (+c.duration_hours || 0);
    return s;
  }, 0);

  const completedCount = profileCourses.filter(c =>
    c.enrollment_status === 'Attended' || c.enrollment_status === 'Completed' || c.attended
  ).length;
  const enrolledCount = profileCourses.length;

  const handleSave = async () => {
    if (!form.empId || !form.name) { alert('Emp ID and Name are required.'); return; }
    try {
      const newLearner = await api.addLearner({
        emp_id:        form.empId,
        name:          form.name,
        gender:        form.gender,
        nationality:   form.nationality,
        department_id: form.department ? parseInt(form.department) : null,
        email:         form.email,
        designation:   form.designation,
        status:        form.status,
        learner_level: form.learnerLevel,
        age:           +form.age || null,
      });
      if (newLearner.id) {
        loadLearners();
        setForm(emptyForm);
        setShowModal(false);
      } else {
        alert(newLearner.error || 'Could not save learner.');
      }
    } catch (err) {
      alert('Error connecting to server.');
    }
  };

  const handleEditSave = async () => {
    if (!editForm.name) { alert('Name is required.'); return; }
    try {
      const updated = await api.updateLearner(selected.id, {
        name:          editForm.name,
        gender:        editForm.gender,
        nationality:   editForm.nationality,
        department_id: editForm.department ? parseInt(editForm.department) : null,
        email:         editForm.email,
        designation:   editForm.designation,
        status:        editForm.status,
        learner_level: editForm.learnerLevel,
        age:           +editForm.age || null,
      });
      if (updated.id) {
        loadLearners();
        setShowEdit(false);
        setSelected(null);
      } else {
        alert(updated.error || 'Could not update learner.');
      }
    } catch (err) {
      alert('Error connecting to server.');
    }
  };

  const openEdit = (learner) => {
    setSelected(learner);
    setEditForm({
      empId:        learner.emp_id        || '',
      name:         learner.name          || '',
      nationality:  learner.nationality   || '',
      designation:  learner.designation   || '',
      department:   learner.department_id || '',
      email:        learner.email         || '',
      gender:       learner.gender        || '',
      status:       learner.status        || 'Active',
      learnerLevel: learner.learner_level || '',
      age:          learner.age           || '',
    });
    setShowEdit(true);
    setActionMenu(null);
  };

  const openProfile = async (learner) => {
    setSelected(learner);
    setShowProfile(true);
    setProfileLoading(true);
    try {
      const courses = await api.getEnrollmentsByLearner(learner.id);
      if (Array.isArray(courses)) setProfileCourses(courses);
      else setProfileCourses([]);
    } catch (err) {
      setProfileCourses([]);
    }
    setProfileLoading(false);
  };

  const openAssign = async (learner) => {
    setSelected(learner);
    setShowAssign(true);
    setAssignLoading(true);
    setActionMenu(null);
    try {
      const enrolledCourses = await api.getEnrollmentsByLearner(learner.id);
      if (Array.isArray(enrolledCourses)) {
        setEnrolled(enrolledCourses.map(c => c.id));
      }
    } catch (err) {
      setEnrolled([]);
    }
    setAssignLoading(false);
  };

  const handleEnroll = async (courseId) => {
    if (!selected) return;
    try {
      if (enrolled.includes(courseId)) {
        await api.unenrollLearner(selected.id, courseId);
        setEnrolled(prev => prev.filter(id => id !== courseId));
      } else {
        await api.enrollLearner(selected.id, courseId);
        setEnrolled(prev => [...prev, courseId]);
      }
    } catch (err) {
      alert('Error updating enrollment.');
    }
  };
const handlePhotoUpload = async (learnerId, file) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('File too large. Maximum size is 5MB.');
      return;
    }
    try {
      const result = await api.uploadLearnerPhoto(learnerId, file);
      if (result.url) {
        loadLearners();
        if (selected && selected.id === learnerId) {
          setSelected(prev => ({ ...prev, profile_photo: result.url }));
        }
      } else {
        alert(result.error || 'Upload failed.');
      }
    } catch (err) {
      alert('Error uploading photo.');
    }
  };
  const handleToggleStatus = async (learner) => {
    const newStatus = learner.status === 'Active' ? 'Resigned/Terminated' : 'Active';
    try {
      await api.updateLearner(learner.id, {
        name:          learner.name,
        gender:        learner.gender,
        nationality:   learner.nationality,
        department_id: learner.department_id,
        email:         learner.email,
        designation:   learner.designation,
        status:        newStatus,
        learner_level: learner.learner_level,
        age:           learner.age,
      });
      loadLearners();
    } catch (err) {
      alert('Error updating learner status.');
    }
  };

  const levelBadge = (level) => {
    const colors = {
      Entry:  { bg: '#f0f9ff', color: '#0369a1' },
      Mid:    { bg: '#fef9c3', color: '#a16207' },
      Senior: { bg: '#dcfce7', color: '#15803d' },
    };
    const c = colors[level] || { bg: '#f1f5f9', color: '#5a6878' };
    return (
      <span style={{ background: c.bg, color: c.color, padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: '600' }}>
        {level || '—'}
      </span>
    );
  };

  return (
    <div style={styles.page}>

      {/* ── READ ONLY BANNER FOR HOD ── */}
      {isHod && (
        <div style={styles.hodBanner}>
          👁 You are viewing your department's learners in read-only mode.
        </div>
      )}

      {/* ── TABS ── */}
      <div style={styles.tabRow}>
        <button
          style={{ ...styles.tab, ...(activeTab === 'emirati' ? styles.tabActive : {}) }}
          onClick={() => { setActiveTab('emirati'); setCurrentPage(1); }}
        >
          Emirati Learners
          {activeTab === 'emirati' && <span style={styles.tabTick}>✓</span>}
        </button>
        <button
          style={{ ...styles.tab, ...(activeTab === 'all' ? styles.tabActive : {}) }}
          onClick={() => { setActiveTab('all'); setCurrentPage(1); }}
        >
          All Learners
        </button>
      </div>

      {/* ── STATS ── */}
      <div style={styles.statsRow}>
        <MiniStatColor label="Total Learners"    value={activeTab === 'emirati' ? emiratiLearners.length : learners.length} color="#051C2C" />
        <MiniStatColor label="Active Learners"   value={activeTab === 'emirati' ? emiratiLearners.filter(l => l.status === 'Active').length : activeLearnersCount} color="#A5C8D2" textDark />
        <MiniStatColor label="Inactive Learners" value={activeTab === 'emirati' ? emiratiLearners.filter(l => l.status !== 'Active').length : inactiveLearnersCount} color="#AF5F46" />
        <MiniStatColor label="Enrolled"          value={enrollStats.enrolled} color="#BEC8BE" sub="course assignments" textDark />
        <MiniStatColor label="Attended"          value={enrollStats.attended} color="#051C2C" sub="completed training" />
      </div>

      {/* ── GENDER CARDS ── */}
      <div style={styles.genderRow}>
        {activeTab === 'all' ? (
          <>
            <div style={{ ...styles.genderCard, background: '#051C2C' }}>
              <div style={{ ...styles.genderTitle, color: '#ffffff' }}>Male and Female Learners</div>
              <div style={styles.peopleRow}>
                {Array.from({ length: Math.min(allMale.length, 8) }).map((_, i) => (
                  <PersonIcon key={'m' + i} color="#ffffff" />
                ))}
                {Array.from({ length: Math.min(allFemale.length, 8) }).map((_, i) => (
                  <PersonIcon key={'f' + i} color="#A5C8D2" />
                ))}
              </div>
              <div style={styles.genderLegendLight}>
                <span><span style={{ color: '#ffffff' }}>●</span> Male ({allMale.length})</span>
                <span><span style={{ color: '#A5C8D2' }}>●</span> Female ({allFemale.length})</span>
              </div>
            </div>
            <div style={{ ...styles.genderCard, background: '#AF5F46' }}>
              <div style={{ ...styles.genderTitle, color: '#ffffff' }}>Emirati Male and Female Learners</div>
              <div style={styles.peopleRow}>
                {Array.from({ length: Math.min(emiratiMale.length, 8) }).map((_, i) => (
                  <PersonIcon key={'em' + i} color="#051C2C" />
                ))}
                {Array.from({ length: Math.min(emiratiFemale.length, 8) }).map((_, i) => (
                  <PersonIcon key={'ef' + i} color="#ffffff" />
                ))}
              </div>
              <div style={styles.genderLegendLight}>
                <span><span style={{ color: '#051C2C' }}>●</span> Male ({emiratiMale.length})</span>
                <span><span style={{ color: '#ffffff' }}>●</span> Female ({emiratiFemale.length})</span>
              </div>
            </div>
          </>
        ) : (
          <div style={{ ...styles.genderCard, background: '#AF5F46', gridColumn: 'span 2' }}>
            <div style={{ ...styles.genderTitle, color: '#ffffff' }}>Emirati Male and Female Learners</div>
            <div style={styles.peopleRow}>
              {Array.from({ length: Math.min(emiratiMale.length, 12) }).map((_, i) => (
                <PersonIcon key={'em' + i} color="#051C2C" />
              ))}
              {Array.from({ length: Math.min(emiratiFemale.length, 12) }).map((_, i) => (
                <PersonIcon key={'ef' + i} color="#ffffff" />
              ))}
            </div>
            <div style={styles.genderLegendLight}>
              <span><span style={{ color: '#051C2C' }}>●</span> Emirati Male ({emiratiMale.length})</span>
              <span><span style={{ color: '#ffffff' }}>●</span> Emirati Female ({emiratiFemale.length})</span>
            </div>
          </div>
        )}
      </div>

      {/* ── TABLE HEADER ── */}
      <div style={styles.tableHeader}>
        <span style={styles.tableTitle}>
          {activeTab === 'all' ? 'All Learners' : 'Emirati Learners'}
          <span style={{ fontSize: '13px', color: '#9baabb', fontWeight: '400', marginLeft: '8px' }}>
            {filtered.length} total
          </span>
        </span>
        <div style={styles.tableControls}>
          <div style={styles.searchWrap}>
            <span style={styles.searchIcon}>🔍</span>
            <input style={styles.searchInput} placeholder="Search by Name"
              value={searchName}
              onChange={e => { setSearchName(e.target.value); setCurrentPage(1); }} />
          </div>
          <div style={styles.searchWrap}>
            <span style={styles.searchIcon}>🔍</span>
            <input style={styles.searchInput} placeholder="Search by ID"
              value={searchId}
              onChange={e => { setSearchId(e.target.value); setCurrentPage(1); }} />
          </div>
          <div style={styles.searchWrap}>
            <span style={styles.searchIcon}>🔍</span>
            <input style={styles.searchInput} placeholder="Search by Email"
              value={searchEmail}
              onChange={e => { setSearchEmail(e.target.value); setCurrentPage(1); }} />
          </div>
          {/* HOD cannot add learners */}
          {!isHod && (
            <button style={styles.addBtn} onClick={() => setShowModal(true)}>
              Add Learner
            </button>
          )}
        </div>
      </div>

      {/* ── TABLE ── */}
      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#9baabb', fontSize: '14px' }}>
          Loading learners...
        </div>
      ) : (
        <div style={styles.tableWrap}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ ...styles.table, minWidth: '950px' }}>
              <thead>
                <tr style={styles.tableHeadRow}>
                  {['No.', 'Emp ID', 'Name', 'Age', 'Level', 'Designation', 'Department', 'Status',
                    ...(isHod ? [] : ['Action'])
                  ].map(h => (
                    <th key={h} style={styles.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.map((learner, index) => (
                  <tr key={learner.id} style={styles.tr}>
                    <td style={styles.td}>{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}</td>
                    <td style={styles.td}>
                      <span style={styles.empId}>{learner.emp_id}</span>
                    </td>
                    <td style={{ ...styles.td, minWidth: '180px' }}>
                      <div style={styles.nameCell}>
                        <div style={styles.avatar}>
                          {learner.profile_photo
                            ? <img src={learner.profile_photo} alt={learner.name}
                                style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                            : learner.name.split(' ').slice(0,2).map(w => w[0]).join('')
                          }
                        </div>
                        <button style={styles.learnerNameBtn} onClick={() => openProfile(learner)}>
                          {learner.name}
                        </button>
                        {learner.status === 'Active' && (
                          <span style={styles.activeTick}>✓</span>
                        )}
                      </div>
                    </td>
                    <td style={{ ...styles.td, textAlign: 'center' }}>{learner.age || '—'}</td>
                    <td style={styles.td}>{levelBadge(learner.learner_level)}</td>
                    <td style={{ ...styles.td, whiteSpace: 'nowrap' }}>{learner.designation || '—'}</td>
                    <td style={{ ...styles.td, whiteSpace: 'nowrap' }}>{learner.department_name || '—'}</td>
                    <td style={styles.td}>
                      <span style={{
                        background: learner.status === 'Active' ? '#dcfce7' : '#fee2e2',
                        color:      learner.status === 'Active' ? '#15803d' : '#991b1b',
                        padding: '3px 10px', borderRadius: '20px',
                        fontSize: '11px', fontWeight: '600', whiteSpace: 'nowrap',
                      }}>
                        {learner.status}
                      </span>
                    </td>
                    {/* HOD sees no action column */}
                    {!isHod && (
                      <td style={{ ...styles.td, position: 'relative' }}>
                        <button
                          style={styles.actionBtn}
                          onClick={() => setActionMenu(actionMenu === learner.id ? null : learner.id)}
                        >
                          ✏️
                        </button>
                        {actionMenu === learner.id && (
                          <div style={styles.actionMenu}>
                            <button style={styles.actionMenuItem} onClick={() => openEdit(learner)}>
                              ✏️ Edit
                            </button>
                            <button style={styles.actionMenuItem} onClick={() => openAssign(learner)}>
                              📚 Assign Course
                            </button>
                            <button
                              style={{
                                ...styles.actionMenuItem,
                                color:      learner.status === 'Active' ? '#991b1b' : '#15803d',
                                fontWeight: '600',
                              }}
                              onClick={() => {
                                handleToggleStatus(learner);
                                setActionMenu(null);
                              }}
                            >
                              {learner.status === 'Active' ? '🚫 Deactivate' : '✅ Activate'}
                            </button>
                          </div>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filtered.length === 0 && (
            <div style={styles.emptyState}>
              {learners.length === 0
                ? 'No learners yet.'
                : 'No learners match your search.'
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

      {/* ── ADD LEARNER MODAL — admin only ── */}
      {showModal && !isHod && (
        <div style={styles.overlay} onClick={() => setShowModal(false)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <span style={styles.modalTitle}>Add Learner</span>
              <button style={styles.modalClose} onClick={() => setShowModal(false)}>×</button>
            </div>
            <div style={styles.modalBody}>
              <div style={styles.photoUpload}>
                <div style={{ fontSize: '11px', color: '#9baabb', textAlign: 'center' }}>
                  Photo can be added after saving the learner.
                </div>
              </div>
              <div style={styles.formGrid}>
                <FormField label="Emp ID *"     value={form.empId}        onChange={v => setForm({...form, empId: v})}        placeholder="e.g. RAK-006" />
                <FormField label="Name *"        value={form.name}         onChange={v => setForm({...form, name: v})}         placeholder="Full name" />
                <FormField label="Nationality"   value={form.nationality}  onChange={v => setForm({...form, nationality: v})}  placeholder="e.g. Emirati" />
                <FormField label="Designation"   value={form.designation}  onChange={v => setForm({...form, designation: v})}  placeholder="Job title" />
                <FormField label="Department"    value={form.department}   onChange={v => setForm({...form, department: v})}   type="select" options={departments.map(d => ({ label: d.name, value: d.id }))} />
                <FormField label="Email"         value={form.email}        onChange={v => setForm({...form, email: v})}        placeholder="name@rakprop.ae" type="email" />
                <FormField label="Gender"        value={form.gender}       onChange={v => setForm({...form, gender: v})}       type="select" options={['Male', 'Female']} />
                <FormField label="Learner Level" value={form.learnerLevel} onChange={v => setForm({...form, learnerLevel: v})} type="select" options={['Entry', 'Mid', 'Senior']} />
                <FormField label="Age"           value={form.age}          onChange={v => setForm({...form, age: v})}          placeholder="e.g. 28" type="number" />
              </div>
              <div style={styles.statusRow}>
                <span style={styles.fieldLabel}>Employment Status</span>
                <div style={styles.radioGroup}>
                  {['Active', 'Resigned/Terminated'].map(s => (
                    <label key={s} style={styles.radioLabel}>
                      <input type="radio" name="status" value={s}
                        checked={form.status === s}
                        onChange={() => setForm({...form, status: s})}
                        style={{ accentColor: '#051c2c' }}
                      />
                      {s}
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div style={styles.modalFooter}>
              <button style={styles.cancelBtn} onClick={() => setShowModal(false)}>Cancel</button>
              <button style={styles.saveBtn} onClick={handleSave}>Add</button>
            </div>
          </div>
        </div>
      )}

      {/* ── EDIT LEARNER MODAL — admin only ── */}
      {showEdit && selected && !isHod && (
        <div style={styles.overlay} onClick={() => setShowEdit(false)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <span style={styles.modalTitle}>Edit Learner</span>
              <button style={styles.modalClose} onClick={() => setShowEdit(false)}>×</button>
            </div>
            <div style={styles.modalBody}>
              <div style={styles.formGrid}>
                <FormField label="Emp ID"       value={editForm.empId}        onChange={v => setEditForm({...editForm, empId: v})}        placeholder="e.g. RAK-006" />
                <FormField label="Name *"        value={editForm.name}         onChange={v => setEditForm({...editForm, name: v})}         placeholder="Full name" />
                <FormField label="Nationality"   value={editForm.nationality}  onChange={v => setEditForm({...editForm, nationality: v})}  placeholder="e.g. Emirati" />
                <FormField label="Designation"   value={editForm.designation}  onChange={v => setEditForm({...editForm, designation: v})}  placeholder="Job title" />
                <FormField label="Department"    value={editForm.department}   onChange={v => setEditForm({...editForm, department: v})}   type="select" options={departments.map(d => ({ label: d.name, value: d.id }))} />
                <FormField label="Email"         value={editForm.email}        onChange={v => setEditForm({...editForm, email: v})}        placeholder="name@rakprop.ae" type="email" />
                <FormField label="Gender"        value={editForm.gender}       onChange={v => setEditForm({...editForm, gender: v})}       type="select" options={['Male', 'Female']} />
                <FormField label="Learner Level" value={editForm.learnerLevel} onChange={v => setEditForm({...editForm, learnerLevel: v})} type="select" options={['Entry', 'Mid', 'Senior']} />
                <FormField label="Age"           value={editForm.age}          onChange={v => setEditForm({...editForm, age: v})}          placeholder="e.g. 28" type="number" />
              </div>
              <div style={styles.statusRow}>
                <span style={styles.fieldLabel}>Employment Status</span>
                <div style={styles.radioGroup}>
                  {['Active', 'Resigned/Terminated'].map(s => (
                    <label key={s} style={styles.radioLabel}>
                      <input type="radio" name="editStatus" value={s}
                        checked={editForm.status === s}
                        onChange={() => setEditForm({...editForm, status: s})}
                        style={{ accentColor: '#051c2c' }}
                      />
                      {s}
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div style={styles.modalFooter}>
              <button style={styles.cancelBtn} onClick={() => setShowEdit(false)}>Cancel</button>
              <button style={styles.saveBtn} onClick={handleEditSave}>Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* ── LEARNER PROFILE POPUP ── */}
      {showProfile && selected && (
        <div style={styles.overlay} onClick={() => setShowProfile(false)}>
          <div style={{ ...styles.modal, maxWidth: '620px' }} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <span style={styles.modalTitle}>Learner Profile</span>
              <button style={styles.modalClose} onClick={() => setShowProfile(false)}>×</button>
            </div>
            <div style={styles.modalBody}>
              <div style={styles.profileHeader}>
                <div style={{ position: 'relative', flexShrink: 0 }}>
                <div style={styles.profileAvatar}>
                  {selected.profile_photo
                    ? <img src={selected.profile_photo} alt={selected.name}
                        style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                    : selected.name.split(' ').slice(0,2).map(w => w[0]).join('').toUpperCase()
                  }
                </div>
                {!isHod && (
                  <label style={styles.photoUploadBtn} title="Upload photo">
                    📷
                    <input type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }}
                      onChange={e => handlePhotoUpload(selected.id, e.target.files[0])} />
                  </label>
                )}
              </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '18px', fontWeight: '700', color: '#051c2c' }}>
                    {selected.name}
                  </div>
                  <div style={{ fontSize: '13px', color: '#5a6878', marginTop: '3px' }}>
                    {selected.designation || '—'} · {selected.department_name || '—'}
                  </div>
                  <div style={{ marginTop: '8px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{
                      background: selected.status === 'Active' ? '#dcfce7' : '#fee2e2',
                      color:      selected.status === 'Active' ? '#15803d' : '#991b1b',
                      padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600',
                    }}>
                      {selected.status}
                    </span>
                    {selected.nationality && (
                      <span style={{ background: '#f0f9ff', color: '#0369a1', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600' }}>
                        {selected.nationality}
                      </span>
                    )}
                    {selected.gender && (
                      <span style={{ background: '#f8f9fa', color: '#5a6878', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600' }}>
                        {selected.gender}
                      </span>
                    )}
                    {selected.learner_level && levelBadge(selected.learner_level)}
                  </div>
                </div>
              </div>

              <div style={styles.profileGrid}>
                {[
                  ['Emp ID', selected.emp_id || '—'],
                  ['Age',    selected.age    || '—'],
                  ['Email',  selected.email  || '—'],
                ].map(([k, v]) => (
                  <div key={k} style={styles.profileInfoItem}>
                    <div style={styles.profileInfoLabel}>{k}</div>
                    <div style={styles.profileInfoValue}>{v}</div>
                  </div>
                ))}
              </div>

              <div style={styles.trainingStats}>
                {[
                  ['Courses Enrolled', enrolledCount,                  '#051c2c'],
                  ['Courses Attended', completedCount,                  '#15803d'],
                  ['Training Hours',   totalTrainingHours + 'h',        '#0369a1'],
                  ['Pending',          enrolledCount - completedCount,  '#a16207'],
                ].map(([label, value, color]) => (
                  <div key={label} style={styles.trainingStat}>
                    <div style={{ fontSize: '22px', fontWeight: '800', color }}>{value}</div>
                    <div style={{ fontSize: '10px', color: '#9baabb', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.4px', marginTop: '4px' }}>
                      {label}
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: '4px' }}>
                <div style={styles.sectionLabel}>
                  Training History
                  <span style={{ fontSize: '11px', color: '#9baabb', fontWeight: '400', marginLeft: '8px' }}>
                    {enrolledCount} course{enrolledCount !== 1 ? 's' : ''}
                  </span>
                </div>
                {profileLoading ? (
                  <div style={{ padding: '24px', textAlign: 'center', color: '#9baabb', fontSize: '13px' }}>
                    Loading courses...
                  </div>
                ) : profileCourses.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {profileCourses.map(course => {
                      const isDone = course.attended === true ||
                        course.enrollment_status === 'Attended' ||
                        course.enrollment_status === 'Completed';
                      return (
                        <div key={course.id} style={{
                          display: 'flex', alignItems: 'center', gap: '12px',
                          padding: '12px 14px', borderRadius: '8px',
                          border: `1px solid ${isDone ? '#86efac' : '#e8ecf0'}`,
                          background: isDone ? '#f0fdf4' : '#f8f9fa',
                        }}>
                          <div style={{
                            width: '32px', height: '32px', borderRadius: '8px',
                            background: isDone ? '#dcfce7' : '#e8ecf0',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '16px', flexShrink: 0,
                          }}>
                            {isDone ? '✅' : '📚'}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '13px', fontWeight: '600', color: '#051c2c' }}>
                              {course.title}
                            </div>
                            <div style={{ fontSize: '11px', color: '#9baabb', marginTop: '2px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                              <span>{course.institute || '—'}</span>
                              <span>·</span>
                              <span>{course.duration_hours || 0}h</span>
                              {course.start_date && (
                                <>
                                  <span>·</span>
                                  <span>
                                    {new Date(course.start_date).toLocaleDateString('en-GB')}
                                    {course.end_date && course.end_date !== course.start_date
                                      ? ' – ' + new Date(course.end_date).toLocaleDateString('en-GB')
                                      : ''}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                            <span style={{
                              padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: '600',
                              background: isDone ? '#dcfce7' : course.status === 'Ongoing' ? '#dbeafe' : '#fef9c3',
                              color: isDone ? '#15803d' : course.status === 'Ongoing' ? '#1d4ed8' : '#a16207',
                            }}>
                              {isDone ? 'Attended' : course.enrollment_status || 'Enrolled'}
                            </span>
                            <span style={{ fontSize: '10px', color: '#9baabb' }}>
                              {course.type || 'External'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div style={{ padding: '24px', background: '#f8f9fa', borderRadius: '8px', border: '1px solid #e8ecf0', textAlign: 'center', fontSize: '13px', color: '#9baabb' }}>
                    No courses enrolled yet.
                    {!isHod && (
                      <button
                        style={{ display: 'block', margin: '10px auto 0', background: 'none', border: 'none', color: '#051c2c', fontWeight: '600', cursor: 'pointer', fontSize: '13px', textDecoration: 'underline' }}
                        onClick={() => { setShowProfile(false); openAssign(selected); }}
                      >
                        Assign a course →
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div style={styles.modalFooter}>
              <button style={styles.cancelBtn} onClick={() => setShowProfile(false)}>Close</button>
              {!isHod && (
                <>
                  <button
                    style={{ ...styles.cancelBtn, background: '#f0f9ff', color: '#0369a1', border: 'none' }}
                    onClick={() => { setShowProfile(false); openAssign(selected); }}
                  >
                    📚 Assign Course
                  </button>
                  <button style={styles.saveBtn} onClick={() => { setShowProfile(false); openEdit(selected); }}>
                    Edit Learner
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── ASSIGN COURSE MODAL — admin only ── */}
      {showAssign && selected && !isHod && (
        <div style={styles.overlay} onClick={() => setShowAssign(false)}>
          <div style={{ ...styles.modal, maxWidth: '580px' }} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <span style={styles.modalTitle}>Assign Courses — {selected.name}</span>
              <button style={styles.modalClose} onClick={() => setShowAssign(false)}>×</button>
            </div>
            <div style={styles.modalBody}>
              {assignLoading ? (
                <div style={{ padding: '40px', textAlign: 'center', color: '#9baabb' }}>Loading courses...</div>
              ) : (
                <>
                  <div style={{ fontSize: '13px', color: '#5a6878', marginBottom: '16px', padding: '10px 14px', background: '#f8f9fa', borderRadius: '8px', border: '1px solid #e8ecf0' }}>
                    Click a course to enroll or unenroll.
                    <span style={{ color: '#15803d', fontWeight: '600' }}> Green = enrolled.</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {allCourses.map(course => {
                      const isEnrolled = enrolled.includes(course.id);
                      return (
                        <div
                          key={course.id}
                          onClick={() => handleEnroll(course.id)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '12px',
                            padding: '12px 16px', borderRadius: '8px', cursor: 'pointer',
                            border: `1.5px solid ${isEnrolled ? '#86efac' : '#e8ecf0'}`,
                            background: isEnrolled ? '#f0fdf4' : '#ffffff',
                          }}
                        >
                          <div style={{
                            width: '20px', height: '20px', borderRadius: '50%',
                            border: `2px solid ${isEnrolled ? '#15803d' : '#d1d5db'}`,
                            background: isEnrolled ? '#15803d' : 'transparent',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                          }}>
                            {isEnrolled && <span style={{ color: '#ffffff', fontSize: '11px' }}>✓</span>}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '13px', fontWeight: '600', color: '#051c2c' }}>{course.title}</div>
                            <div style={{ fontSize: '11px', color: '#9baabb', marginTop: '2px' }}>
                              {course.institute || '—'} · {course.duration_hours || 0}h ·
                              <span style={{ marginLeft: '4px', color: course.status === 'Completed' ? '#15803d' : course.status === 'Ongoing' ? '#1d4ed8' : '#a16207' }}>
                                {course.status}
                              </span>
                            </div>
                          </div>
                          {isEnrolled && (
                            <span style={{ fontSize: '11px', color: '#15803d', fontWeight: '600', background: '#dcfce7', padding: '2px 8px', borderRadius: '10px' }}>
                              Enrolled
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
            <div style={styles.modalFooter}>
              <button style={styles.cancelBtn} onClick={() => setShowAssign(false)}>Done</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

function PersonIcon({ color }) {
  return (
    <svg width="22" height="32" viewBox="0 0 22 32" fill={color}>
      <circle cx="11" cy="8" r="6" />
      <path d="M1 30 C1 20 21 20 21 30" />
    </svg>
  );
}

function MiniStatColor({ label, value, color, sub, textDark }) {
  return (
    <div style={{ ...styles.miniStat, background: color }}>
      <div style={{ ...styles.miniStatLabel, color: textDark ? '#1f3a45' : 'rgba(255,255,255,0.7)' }}>{label}</div>
      <div style={{ ...styles.miniStatValue, color: textDark ? '#051C2C' : '#ffffff' }}>{value}</div>
      {sub && <div style={{ ...styles.miniStatSub, color: textDark ? '#3a5560' : 'rgba(255,255,255,0.5)' }}>{sub}</div>}
    </div>
  );
}

function FormField({ label, value, onChange, placeholder, type = 'text', options = [] }) {
  return (
    <div style={styles.formField}>
      <label style={styles.fieldLabel}>{label}</label>
      {type === 'select' ? (
        <select value={value} onChange={e => onChange(e.target.value)} style={styles.input}>
          <option value="">Select...</option>
          {options.map(o =>
            typeof o === 'object'
              ? <option key={o.value} value={o.value}>{o.label}</option>
              : <option key={o} value={o}>{o}</option>
          )}
        </select>
      ) : (
        <input type={type} value={value} onChange={e => onChange(e.target.value)}
          placeholder={placeholder} style={styles.input} />
      )}
    </div>
  );
}

const styles = {
  page:             { padding: '30px', minHeight: '100vh', background: '#f2f4f6', fontFamily: 'Inter, sans-serif' },
  hodBanner:        { background: '#fef9c3', border: '1px solid #fde68a', color: '#92400e', padding: '10px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: '500', marginBottom: '16px' },
  tabRow:           { display: 'flex', gap: '8px', marginBottom: '20px' },
  tab:              { padding: '9px 20px', borderRadius: '8px', border: 'none', fontSize: '13px', fontWeight: '600', cursor: 'pointer', background: '#2a3f52', color: '#b6bdc2', fontFamily: 'Inter, sans-serif', display: 'flex', alignItems: 'center', gap: '6px' },
  tabActive:        { background: '#1a2f42', color: '#ffffff' },
  tabTick:          { background: '#16a34a', color: '#fff', borderRadius: '50%', width: '16px', height: '16px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px' },
  statsRow:         { display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px', marginBottom: '16px' },
  miniStat:         { borderRadius: '10px', padding: '16px' },
  miniStatLabel:    { fontSize: '11px', fontWeight: '500', marginBottom: '6px' },
  miniStatValue:    { fontSize: '28px', fontWeight: '800', lineHeight: 1 },
  miniStatSub:      { fontSize: '10px', marginTop: '4px' },
  genderRow:        { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' },
  genderCard:       { borderRadius: '10px', padding: '16px' },
  genderTitle:      { fontSize: '12px', fontWeight: '600', marginBottom: '10px' },
  peopleRow:        { display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '8px' },
  genderLegendLight:{ display: 'flex', gap: '16px', fontSize: '11px', color: 'rgba(255,255,255,0.85)' },
  tableHeader:      { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '10px' },
  tableTitle:       { fontSize: '18px', fontWeight: '700', color: '#051c2c' },
  tableControls:    { display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' },
  searchWrap:       { display: 'flex', alignItems: 'center', background: '#ffffff', border: '1.5px solid #e8ecf0', borderRadius: '8px', padding: '0 10px', gap: '6px' },
  searchIcon:       { fontSize: '12px' },
  searchInput:      { border: 'none', outline: 'none', fontSize: '12px', padding: '8px 0', width: '130px', fontFamily: 'Inter, sans-serif', color: '#051c2c', background: 'transparent' },
  addBtn:           { background: '#051c2c', color: '#ffffff', border: 'none', borderRadius: '8px', padding: '9px 18px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'Inter, sans-serif' },
  tableWrap:        { background: '#ffffff', borderRadius: '12px', border: '1px solid #e8ecf0', overflow: 'hidden' },
  table:            { width: '100%', borderCollapse: 'collapse' },
  tableHeadRow:     { background: '#051c2c' },
  th:               { padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' },
  tr:               { borderBottom: '1px solid #f0f2f4' },
  td:               { padding: '12px 16px', fontSize: '13px', color: '#051c2c', verticalAlign: 'middle' },
  empId:            { fontFamily: 'monospace', fontSize: '12px', color: '#5a6878' },
  nameCell:         { display: 'flex', alignItems: 'center', gap: '8px' },
  avatar:           { width: '30px', height: '30px', borderRadius: '50%', background: '#051c2c', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '700', flexShrink: 0 },
  learnerNameBtn:   { background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '600', color: '#051c2c', padding: 0, fontFamily: 'Inter, sans-serif', textDecoration: 'underline', textDecorationColor: '#e8ecf0' },
  activeTick:       { background: '#16a34a', color: '#fff', borderRadius: '50%', width: '15px', height: '15px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '8px' },
  actionBtn:        { background: '#051c2c', border: 'none', borderRadius: '6px', padding: '5px 8px', cursor: 'pointer', fontSize: '13px' },
  actionMenu:       { position: 'absolute', right: '50px', top: '8px', background: '#ffffff', border: '1px solid #e8ecf0', borderRadius: '8px', boxShadow: '0 4px 20px rgba(5,28,44,0.15)', zIndex: 10, overflow: 'hidden', minWidth: '170px' },
  actionMenuItem:   { display: 'block', width: '100%', padding: '10px 14px', background: 'none', border: 'none', textAlign: 'left', fontSize: '13px', cursor: 'pointer', color: '#051c2c', fontFamily: 'Inter, sans-serif' },
  emptyState:       { padding: '40px', textAlign: 'center', color: '#9baabb', fontSize: '14px' },
  overlay:          { position: 'fixed', inset: 0, background: 'rgba(5,28,44,0.55)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' },
  modal:            { background: '#ffffff', borderRadius: '16px', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 64px rgba(5,28,44,0.25)' },
  modalHeader:      { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid #e8ecf0', position: 'sticky', top: 0, background: '#ffffff', zIndex: 1 },
  modalTitle:       { fontSize: '18px', fontWeight: '700', color: '#051c2c' },
  modalClose:       { background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#9baabb' },
  modalBody:        { padding: '20px 24px' },
  photoUpload:      { display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' },
  photoPlaceholder: { width: '80px', height: '80px', border: '2px dashed #e8ecf0', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', cursor: 'pointer' },
  formGrid:         { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' },
  formField:        { display: 'flex', flexDirection: 'column', gap: '5px' },
  fieldLabel:       { fontSize: '11px', fontWeight: '700', color: '#5a6878', textTransform: 'uppercase', letterSpacing: '0.5px' },
  input:            { padding: '10px 12px', border: '1.5px solid #e8ecf0', borderRadius: '8px', fontSize: '13px', outline: 'none', background: '#f8f9fa', color: '#051c2c', fontFamily: 'Inter, sans-serif' },
  statusRow:        { marginTop: '16px' },
  radioGroup:       { display: 'flex', gap: '24px', marginTop: '8px' },
  radioLabel:       { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer', color: '#051c2c' },
  modalFooter:      { padding: '14px 24px', borderTop: '1px solid #e8ecf0', display: 'flex', justifyContent: 'flex-end', gap: '10px' },
  cancelBtn:        { padding: '9px 20px', background: 'none', border: '1.5px solid #e8ecf0', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', fontFamily: 'Inter, sans-serif' },
  saveBtn:          { padding: '9px 24px', background: '#051c2c', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', color: '#ffffff', fontFamily: 'Inter, sans-serif' },
  profileHeader:    { display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', background: '#f8f9fa', borderRadius: '12px', marginBottom: '16px', border: '1px solid #e8ecf0' },
  profileAvatar:    { width: '56px', height: '56px', borderRadius: '50%', background: '#051c2c', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: '700', flexShrink: 0 },
  profileGrid:      { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '16px' },
  profileInfoItem:  { display: 'flex', flexDirection: 'column', gap: '4px' },
  profileInfoLabel: { fontSize: '10px', fontWeight: '700', color: '#9baabb', textTransform: 'uppercase', letterSpacing: '0.5px' },
  profileInfoValue: { fontSize: '13px', fontWeight: '500', color: '#051c2c' },
  trainingStats:    { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '20px' },
  trainingStat:     { background: '#f8f9fa', borderRadius: '10px', padding: '14px', textAlign: 'center', border: '1px solid #e8ecf0' },
  photoUploadBtn:   { position: 'absolute', bottom: 0, right: 0, width: '22px', height: '22px', borderRadius: '50%', background: '#051c2c', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', cursor: 'pointer', border: '2px solid #ffffff' },
  sectionLabel:     { fontSize: '12px', fontWeight: '700', color: '#051c2c', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px', paddingBottom: '8px', borderBottom: '1px solid #e8ecf0' },
};

export default LearnersPage;