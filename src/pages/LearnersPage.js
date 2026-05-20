import React, { useState, useEffect } from 'react';
import api from '../api';

function LearnersPage() {

  const [activeTab,   setActiveTab]   = useState('all');
  const [showModal,   setShowModal]   = useState(false);
  const [actionMenu,  setActionMenu]  = useState(null);
  const [searchName,  setSearchName]  = useState('');
  const [searchId,    setSearchId]    = useState('');
  const [searchEmail, setSearchEmail] = useState('');
  const [learners,    setLearners]    = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading,     setLoading]     = useState(true);

  const emptyForm = {
    empId: '', name: '', nationality: '', designation: '',
    department: '', email: '', gender: '', status: 'Active',
  };
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    api.getLearners()
      .then(data => {
        if (Array.isArray(data)) setLearners(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    api.getDepartments()
      .then(data => {
        if (Array.isArray(data)) setDepartments(data);
      });
  }, []);

  const filtered = learners.filter(l => {
    const name  = l.name  || '';
    const emp   = l.emp_id || '';
    const email = l.email || '';
    const nat   = l.nationality || '';
    const matchTab   = activeTab === 'all' || nat === 'Emirati';
    const matchName  = name.toLowerCase().includes(searchName.toLowerCase());
    const matchId    = emp.toLowerCase().includes(searchId.toLowerCase());
    const matchEmail = email.toLowerCase().includes(searchEmail.toLowerCase());
    return matchTab && matchName && matchId && matchEmail;
  });

  const emiratiLearners = learners.filter(l => l.nationality === 'Emirati');
  const maleLearners    = learners.filter(l => l.gender === 'Male');
  const femaleLearners  = learners.filter(l => l.gender === 'Female');
  const avgHours        = learners.length > 0
    ? Math.round(learners.reduce((s, l) => s + (l.cost || 0) / 100, 0) / learners.length)
    : 0;

  const handleSave = async () => {
  if (!form.empId || !form.name) {
    alert('Emp ID and Name are required.');
    return;
  }
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
    });
    if (newLearner.id) {
      api.getLearners().then(data => {
        if (Array.isArray(data)) setLearners(data);
      });
      setForm(emptyForm);
      setShowModal(false);
    } else {
      alert(newLearner.error || 'Could not save learner.');
    }
  } catch (err) {
    alert('Error connecting to server.');
  }
};

  return (
    <div style={styles.page}>

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

      <div style={styles.statsRow}>
        <MiniStat label="Learners Population"    value={learners.length} />
        <MiniStat label="Average Learning Hours" value={avgHours} />
        <MiniStat label="Total Learning Hours"   value={avgHours * learners.length} />
        <MiniStat label="Total Learners"         value={learners.length} />
        <MiniStat label="Total Emirati Learners" value={emiratiLearners.length} />
      </div>

      <div style={styles.genderRow}>
        <div style={styles.genderCard}>
          <div style={styles.genderTitle}>Male and Female Learners</div>
          <div style={styles.peopleRow}>
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

      <div style={styles.tableHeader}>
        <span style={styles.tableTitle}>
          {activeTab === 'all' ? 'All Learners' : 'Emirati Learners'}
        </span>
        <div style={styles.tableControls}>
          <div style={styles.searchWrap}>
            <span style={styles.searchIcon}>🔍</span>
            <input style={styles.searchInput} placeholder="Search by Name"
              value={searchName} onChange={e => setSearchName(e.target.value)} />
          </div>
          <div style={styles.searchWrap}>
            <span style={styles.searchIcon}>🔍</span>
            <input style={styles.searchInput} placeholder="Search by ID"
              value={searchId} onChange={e => setSearchId(e.target.value)} />
          </div>
          <div style={styles.searchWrap}>
            <span style={styles.searchIcon}>🔍</span>
            <input style={styles.searchInput} placeholder="Search by Email"
              value={searchEmail} onChange={e => setSearchEmail(e.target.value)} />
          </div>
          <button style={styles.addBtn} onClick={() => setShowModal(true)}>
            Add Learner
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#9baabb', fontSize: '14px' }}>
          Loading learners...
        </div>
      ) : (
        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeadRow}>
                {['No.', 'Emp ID', 'Name', 'Designation', 'Department', 'Status', 'Action'].map(h => (
                  <th key={h} style={styles.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((learner, index) => (
                <tr key={learner.id} style={styles.tr}>
                  <td style={styles.td}>{index + 1}</td>
                  <td style={styles.td}>
                    <span style={styles.empId}>{learner.emp_id}</span>
                  </td>
                  <td style={styles.td}>
                    <div style={styles.nameCell}>
                      <div style={styles.avatar}>
                        {learner.name.split(' ').slice(0,2).map(w => w[0]).join('')}
                      </div>
                      <span style={styles.learnerName}>{learner.name}</span>
                      {learner.status === 'Active' && (
                        <span style={styles.activeTick}>✓</span>
                      )}
                    </div>
                  </td>
                  <td style={styles.td}>{learner.designation || '—'}</td>
                  <td style={styles.td}>{learner.department_name || '—'}</td>
                  <td style={styles.td}>
                    <span style={{
                      background: learner.status === 'Active' ? '#dcfce7' : '#fee2e2',
                      color:      learner.status === 'Active' ? '#15803d' : '#991b1b',
                      padding: '3px 10px', borderRadius: '20px',
                      fontSize: '11px', fontWeight: '600',
                    }}>
                      {learner.status}
                    </span>
                  </td>
                  <td style={{ ...styles.td, position: 'relative' }}>
                    <button
                      style={styles.actionBtn}
                      onClick={() => setActionMenu(actionMenu === learner.id ? null : learner.id)}
                    >
                      ✏️
                    </button>
                    {actionMenu === learner.id && (
                      <div style={styles.actionMenu}>
                        {['Edit', 'Delete', 'Assign Course', 'Add Course'].map(item => (
                          <button key={item} style={styles.actionMenuItem}
                            onClick={() => setActionMenu(null)}>
                            {item}
                          </button>
                        ))}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div style={styles.emptyState}>
              {learners.length === 0
                ? 'No learners yet. Click "Add Learner" to get started.'
                : 'No learners match your search.'}
            </div>
          )}
        </div>
      )}

      {showModal && (
        <div style={styles.overlay} onClick={() => setShowModal(false)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <span style={styles.modalTitle}>Add Learner</span>
              <button style={styles.modalClose} onClick={() => setShowModal(false)}>×</button>
            </div>
            <div style={styles.modalBody}>
              <div style={styles.photoUpload}>
                <div style={styles.photoPlaceholder}>🖼</div>
              </div>
              <div style={styles.formGrid}>
                <FormField label="Emp ID *"
                  value={form.empId}
                  onChange={v => setForm({...form, empId: v})}
                  placeholder="e.g. RAK-006"
                />
                <FormField label="Name *"
                  value={form.name}
                  onChange={v => setForm({...form, name: v})}
                  placeholder="Full name"
                />
                <FormField label="Nationality"
                  value={form.nationality}
                  onChange={v => setForm({...form, nationality: v})}
                  placeholder="e.g. Emirati"
                />
                <FormField label="Designation"
                  value={form.designation}
                  onChange={v => setForm({...form, designation: v})}
                  placeholder="Job title"
                />
                <FormField label="Department"
                  value={form.department}
                  onChange={v => setForm({...form, department: v})}
                  type="select"
                  options={departments.map(d => ({ label: d.name, value: d.id }))}
                />
                <FormField label="Email"
                  value={form.email}
                  onChange={v => setForm({...form, email: v})}
                  placeholder="name@rakprop.ae"
                  type="email"
                />
                <FormField label="Gender"
                  value={form.gender}
                  onChange={v => setForm({...form, gender: v})}
                  type="select"
                  options={['Male', 'Female']}
                />
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

function MiniStat({ label, value }) {
  return (
    <div style={styles.miniStat}>
      <div style={styles.miniStatLabel}>{label}</div>
      <div style={styles.miniStatValue}>{value}</div>
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
  page:          { padding: '30px', minHeight: '100vh', background: '#f2f4f6', fontFamily: 'Inter, sans-serif' },
  tabRow:        { display: 'flex', gap: '8px', marginBottom: '20px' },
  tab:           { padding: '9px 20px', borderRadius: '8px', border: 'none', fontSize: '13px', fontWeight: '600', cursor: 'pointer', background: '#2a3f52', color: '#b6bdc2', fontFamily: 'Inter, sans-serif', display: 'flex', alignItems: 'center', gap: '6px' },
  tabActive:     { background: '#1a2f42', color: '#ffffff' },
  tabTick:       { background: '#16a34a', color: '#fff', borderRadius: '50%', width: '16px', height: '16px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px' },
  statsRow:      { display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px', marginBottom: '16px' },
  miniStat:      { background: '#ffffff', borderRadius: '10px', border: '1px solid #e8ecf0', padding: '16px' },
  miniStatLabel: { fontSize: '11px', color: '#5a6878', fontWeight: '500', marginBottom: '6px' },
  miniStatValue: { fontSize: '28px', fontWeight: '800', color: '#051c2c', lineHeight: 1 },
  genderRow:     { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' },
  genderCard:    { background: '#ffffff', borderRadius: '10px', border: '1px solid #e8ecf0', padding: '16px' },
  genderTitle:   { fontSize: '12px', fontWeight: '600', color: '#051c2c', marginBottom: '10px' },
  peopleRow:     { display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '8px' },
  genderLegend:  { display: 'flex', gap: '16px', fontSize: '11px', color: '#5a6878' },
  tableHeader:   { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '10px' },
  tableTitle:    { fontSize: '18px', fontWeight: '700', color: '#051c2c' },
  tableControls: { display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' },
  searchWrap:    { display: 'flex', alignItems: 'center', background: '#ffffff', border: '1.5px solid #e8ecf0', borderRadius: '8px', padding: '0 10px', gap: '6px' },
  searchIcon:    { fontSize: '12px' },
  searchInput:   { border: 'none', outline: 'none', fontSize: '12px', padding: '8px 0', width: '130px', fontFamily: 'Inter, sans-serif', color: '#051c2c', background: 'transparent' },
  addBtn:        { background: '#051c2c', color: '#ffffff', border: 'none', borderRadius: '8px', padding: '9px 18px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'Inter, sans-serif' },
  tableWrap:     { background: '#ffffff', borderRadius: '12px', border: '1px solid #e8ecf0', overflow: 'hidden' },
  table:         { width: '100%', borderCollapse: 'collapse' },
  tableHeadRow:  { background: '#051c2c' },
  th:            { padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.5px' },
  tr:            { borderBottom: '1px solid #f0f2f4' },
  td:            { padding: '12px 16px', fontSize: '13px', color: '#051c2c', verticalAlign: 'middle' },
  empId:         { fontFamily: 'monospace', fontSize: '12px', color: '#5a6878' },
  nameCell:      { display: 'flex', alignItems: 'center', gap: '8px' },
  avatar:        { width: '30px', height: '30px', borderRadius: '50%', background: '#051c2c', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '700', flexShrink: 0 },
  learnerName:   { fontWeight: '500' },
  activeTick:    { background: '#16a34a', color: '#fff', borderRadius: '50%', width: '15px', height: '15px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '8px' },
  actionBtn:     { background: '#051c2c', border: 'none', borderRadius: '6px', padding: '5px 8px', cursor: 'pointer', fontSize: '13px' },
  actionMenu:    { position: 'absolute', right: '50px', top: '8px', background: '#ffffff', border: '1px solid #e8ecf0', borderRadius: '8px', boxShadow: '0 4px 20px rgba(5,28,44,0.15)', zIndex: 10, overflow: 'hidden', minWidth: '140px' },
  actionMenuItem:{ display: 'block', width: '100%', padding: '9px 14px', background: 'none', border: 'none', textAlign: 'left', fontSize: '13px', cursor: 'pointer', color: '#051c2c', fontFamily: 'Inter, sans-serif' },
  emptyState:    { padding: '40px', textAlign: 'center', color: '#9baabb', fontSize: '14px' },
  overlay:       { position: 'fixed', inset: 0, background: 'rgba(5,28,44,0.55)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' },
  modal:         { background: '#ffffff', borderRadius: '16px', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 64px rgba(5,28,44,0.25)' },
  modalHeader:   { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid #e8ecf0', position: 'sticky', top: 0, background: '#ffffff', zIndex: 1 },
  modalTitle:    { fontSize: '18px', fontWeight: '700', color: '#051c2c' },
  modalClose:    { background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#9baabb' },
  modalBody:     { padding: '20px 24px' },
  photoUpload:   { display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' },
  photoPlaceholder: { width: '80px', height: '80px', border: '2px dashed #e8ecf0', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', cursor: 'pointer' },
  formGrid:      { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' },
  formField:     { display: 'flex', flexDirection: 'column', gap: '5px' },
  fieldLabel:    { fontSize: '11px', fontWeight: '700', color: '#5a6878', textTransform: 'uppercase', letterSpacing: '0.5px' },
  input:         { padding: '10px 12px', border: '1.5px solid #e8ecf0', borderRadius: '8px', fontSize: '13px', outline: 'none', background: '#f8f9fa', color: '#051c2c', fontFamily: 'Inter, sans-serif' },
  statusRow:     { marginTop: '16px' },
  radioGroup:    { display: 'flex', gap: '24px', marginTop: '8px' },
  radioLabel:    { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer', color: '#051c2c' },
  modalFooter:   { padding: '14px 24px', borderTop: '1px solid #e8ecf0', display: 'flex', justifyContent: 'flex-end', gap: '10px' },
  cancelBtn:     { padding: '9px 20px', background: 'none', border: '1.5px solid #e8ecf0', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', fontFamily: 'Inter, sans-serif' },
  saveBtn:       { padding: '9px 24px', background: '#051c2c', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', color: '#ffffff', fontFamily: 'Inter, sans-serif' },
};

export default LearnersPage;