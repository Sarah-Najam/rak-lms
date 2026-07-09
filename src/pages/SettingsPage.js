import React, { useState, useEffect } from 'react';
import api from '../api';

function SettingsPage({ user }) {

  const isAdmin = user?.role === 'admin';

  const [users,       setUsers]       = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [showInvite,  setShowInvite]  = useState(false);
  const [inviteResult,setInviteResult]= useState(null);
  const [saving,      setSaving]      = useState(false);

  const emptyInvite = {
    name: '', email: '', role: 'hod', designation: '', department_id: '',
  };
  const [inviteForm, setInviteForm] = useState(emptyInvite);

  useEffect(() => {
    Promise.all([
      api.getUsers(),
      api.getDepartments(),
    ]).then(([u, d]) => {
      if (Array.isArray(u)) setUsers(u);
      if (Array.isArray(d)) setDepartments(d);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleInvite = async () => {
    if (!inviteForm.name || !inviteForm.email) {
      alert('Name and email are required.');
      return;
    }
    if (!inviteForm.email.toLowerCase().endsWith('@rakproperties.ae')) {
      alert('Only @rakproperties.ae email addresses are allowed.');
      return;
    }
    if (inviteForm.role === 'hod' && !inviteForm.department_id) {
      alert('Please select a department for this HOD.');
      return;
    }
    setSaving(true);
    try {
      const result = await api.inviteUser({
        name:          inviteForm.name,
        email:         inviteForm.email,
        role:          inviteForm.role,
        designation:   inviteForm.designation,
        department_id: inviteForm.department_id ? +inviteForm.department_id : null,
      });
      if (result.inviteUrl) {
        setInviteResult(result);
        setInviteForm(emptyInvite);
        // Refresh users list
        api.getUsers().then(u => { if (Array.isArray(u)) setUsers(u); });
      } else {
        alert(result.error || 'Could not create invite.');
      }
    } catch (err) {
      alert('Error connecting to server.');
    }
    setSaving(false);
  };

  const getRoleBadge = (role) => {
    const colors = {
      admin: { bg: '#051c2c', color: '#ffffff' },
      hod:   { bg: '#f0f9ff', color: '#0369a1' },
    };
    const c = colors[role] || { bg: '#f1f5f9', color: '#5a6878' };
    return (
      <span style={{ background: c.bg, color: c.color, padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600' }}>
        {role === 'admin' ? 'Admin' : 'Head of Department'}
      </span>
    );
  };

  const getStatusBadge = (status) => {
    const colors = {
      active:  { bg: '#dcfce7', color: '#15803d' },
      invited: { bg: '#fef9c3', color: '#a16207' },
    };
    const c = colors[status] || { bg: '#fee2e2', color: '#991b1b' };
    return (
      <span style={{ background: c.bg, color: c.color, padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600' }}>
        {status === 'active' ? 'Active' : status === 'invited' ? 'Invited (pending)' : status}
      </span>
    );
  };

  return (
    <div style={styles.page}>

      {/* ── PAGE HEADER ── */}
      <div style={styles.pageHeader}>
        <div>
          <div style={{ fontSize: '20px', fontWeight: '700', color: '#051c2c' }}>Settings</div>
          <div style={{ fontSize: '13px', color: '#9baabb', marginTop: '4px' }}>
            Manage users and system access
          </div>
        </div>
        {isAdmin && (
          <button style={styles.addBtn} onClick={() => { setShowInvite(true); setInviteResult(null); }}>
            + Invite User
          </button>
        )}
      </div>


      {/* ── USERS TABLE ── */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <span style={styles.sectionTitle}>
            System Users
            <span style={{ fontSize: '13px', color: '#9baabb', fontWeight: '400', marginLeft: '8px' }}>
              {users.length} user{users.length !== 1 ? 's' : ''}
            </span>
          </span>
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#9baabb' }}>Loading...</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.theadRow}>
                  {['Name', 'Email', 'Role', 'Department', 'Designation', 'Status', 'Joined'].map(h => (
                    <th key={h} style={styles.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} style={styles.tr}>
                    <td style={styles.td}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={styles.avatar}>
                          {(u.full_name || u.name || '?').split(' ').slice(0,2).map(w => w[0]).join('').toUpperCase()}
                        </div>
                        <span style={{ fontWeight: '600', color: '#051c2c' }}>
                          {u.full_name || u.name || '—'}
                        </span>
                      </div>
                    </td>
                    <td style={{ ...styles.td, fontSize: '12px', color: '#5a6878' }}>{u.email}</td>
                    <td style={styles.td}>{getRoleBadge(u.role)}</td>
                    <td style={{ ...styles.td, fontSize: '12px', color: '#5a6878' }}>
                      {u.department_name
                        ? <span style={{ background: '#f0f9ff', color: '#0369a1', padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: '600' }}>{u.department_name}</span>
                        : <span style={{ color: '#9baabb' }}>All Departments</span>
                      }
                    </td>
                    <td style={{ ...styles.td, fontSize: '12px', color: '#5a6878' }}>{u.designation || '—'}</td>
                    <td style={styles.td}>{getStatusBadge(u.status)}</td>
                    <td style={{ ...styles.td, fontSize: '12px', color: '#9baabb' }}>
                      {u.created_at ? new Date(u.created_at).toLocaleDateString('en-GB') : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {users.length === 0 && (
              <div style={{ padding: '40px', textAlign: 'center', color: '#9baabb', fontSize: '14px' }}>
                No users found.
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── INVITE USER MODAL — admin only ── */}
      {showInvite && isAdmin && (
        <div style={styles.overlay} onClick={() => setShowInvite(false)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <span style={styles.modalTitle}>Invite User</span>
              <button style={styles.modalClose} onClick={() => setShowInvite(false)}>×</button>
            </div>
            <div style={styles.modalBody}>

              {/* Success state */}
              {inviteResult ? (
                <div>
                  <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                    <div style={{ fontSize: '48px', marginBottom: '12px' }}>✅</div>
                    <div style={{ fontSize: '16px', fontWeight: '700', color: '#051c2c' }}>
                      Invite Created Successfully!
                    </div>
                    <div style={{ fontSize: '13px', color: '#5a6878', marginTop: '6px' }}>
                      Share this link with the user to set their password.
                    </div>
                  </div>

                  <div style={{ background: '#f8f9fa', border: '1px solid #e8ecf0', borderRadius: '10px', padding: '16px', marginBottom: '16px' }}>
                    <div style={{ fontSize: '11px', fontWeight: '700', color: '#9baabb', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
                      Invite Link
                    </div>
                    <div style={{ fontSize: '12px', color: '#051c2c', wordBreak: 'break-all', fontFamily: 'monospace', background: '#ffffff', border: '1px solid #e8ecf0', borderRadius: '6px', padding: '10px 12px' }}>
                      {inviteResult.inviteUrl}
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(inviteResult.inviteUrl);
                        alert('Link copied to clipboard!');
                      }}
                      style={{ marginTop: '10px', background: '#051c2c', color: '#ffffff', border: 'none', borderRadius: '6px', padding: '8px 16px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
                    >
                      📋 Copy Link
                    </button>
                  </div>

                  <div style={{ background: '#fef9c3', border: '1px solid #fde68a', borderRadius: '8px', padding: '12px 16px', fontSize: '12px', color: '#92400e' }}>
                    ⚠️ This link is valid for one-time use. Share it securely with the user via email or messaging.
                  </div>
                </div>
              ) : (
                /* Invite form */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={styles.formGrid}>
                    <F label="Full Name *" value={inviteForm.name} onChange={v => setInviteForm({...inviteForm, name: v})} placeholder="e.g. Sara Al Blooshi" />
                    <F label="Email Address *" value={inviteForm.email} onChange={v => setInviteForm({...inviteForm, email: v})} placeholder="sara@rakproperties.ae" type="email" />
                    <F label="Role *" value={inviteForm.role} onChange={v => setInviteForm({...inviteForm, role: v})}
                      type="select" options={[{ label: 'Head of Department (Read-Only)', value: 'hod' }, { label: 'Administrator (Full Access)', value: 'admin' }]} />
                    <F label="Designation" value={inviteForm.designation} onChange={v => setInviteForm({...inviteForm, designation: v})} placeholder="e.g. Sales Director" />
                    {inviteForm.role === 'hod' && (
                      <F label="Department *" value={inviteForm.department_id} onChange={v => setInviteForm({...inviteForm, department_id: v})}
                        type="select" options={departments.map(d => ({ label: d.name, value: d.id }))} />
                    )}
                  </div>

                  {inviteForm.role === 'hod' && (
                    <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '8px', padding: '12px 16px', fontSize: '12px', color: '#0369a1' }}>
                      ℹ️ HOD users can view their department's learners, courses and reports in read-only mode. They cannot add, edit or delete any data.
                    </div>
                  )}

                  {inviteForm.role === 'admin' && (
                    <div style={{ background: '#fef9c3', border: '1px solid #fde68a', borderRadius: '8px', padding: '12px 16px', fontSize: '12px', color: '#92400e' }}>
                      ⚠️ Admin users have full access to all data across all departments including add, edit and delete.
                    </div>
                  )}
                </div>
              )}
            </div>
            <div style={styles.modalFooter}>
              <button style={styles.cancelBtn} onClick={() => { setShowInvite(false); setInviteResult(null); }}>
                {inviteResult ? 'Done' : 'Cancel'}
              </button>
              {!inviteResult && (
                <button style={styles.saveBtn} onClick={handleInvite} disabled={saving}>
                  {saving ? 'Sending...' : 'Send Invite'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
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
        <input type={type} value={value} placeholder={placeholder}
          onChange={e => onChange(e.target.value)} style={inputStyle} />
      )}
    </div>
  );
}

const styles = {
  page:          { padding: '30px', minHeight: '100vh', background: '#f2f4f6', fontFamily: 'Inter, sans-serif' },
  pageHeader:    { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' },
  addBtn:        { background: '#051c2c', color: '#ffffff', border: 'none', borderRadius: '8px', padding: '10px 20px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'Inter, sans-serif' },
  infoGrid:      { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '24px' },
  infoCard:      { background: '#ffffff', borderRadius: '12px', border: '1px solid #e8ecf0', padding: '20px' },
  infoLabel:     { fontSize: '10px', fontWeight: '700', color: '#9baabb', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' },
  infoValue:     { fontSize: '16px', fontWeight: '700', color: '#051c2c' },
  infoSub:       { fontSize: '11px', color: '#9baabb', marginTop: '4px' },
  section:       { background: '#ffffff', borderRadius: '12px', border: '1px solid #e8ecf0', overflow: 'hidden' },
  sectionHeader: { padding: '16px 20px', borderBottom: '1px solid #e8ecf0' },
  sectionTitle:  { fontSize: '16px', fontWeight: '700', color: '#051c2c' },
  table:         { width: '100%', borderCollapse: 'collapse', minWidth: '800px' },
  theadRow:      { background: '#051c2c' },
  th:            { padding: '12px 16px', textAlign: 'left', fontSize: '10px', fontWeight: '700', color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' },
  tr:            { borderBottom: '1px solid #f0f2f4' },
  td:            { padding: '14px 16px', fontSize: '13px', color: '#051c2c', verticalAlign: 'middle' },
  avatar:        { width: '32px', height: '32px', borderRadius: '50%', background: '#051c2c', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '700', flexShrink: 0 },
  overlay:       { position: 'fixed', inset: 0, background: 'rgba(5,28,44,0.55)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' },
  modal:         { background: '#ffffff', borderRadius: '16px', width: '100%', maxWidth: '540px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 64px rgba(5,28,44,0.25)' },
  modalHeader:   { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid #e8ecf0', position: 'sticky', top: 0, background: '#ffffff', zIndex: 1 },
  modalTitle:    { fontSize: '18px', fontWeight: '700', color: '#051c2c' },
  modalClose:    { background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#9baabb' },
  modalBody:     { padding: '24px' },
  formGrid:      { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' },
  modalFooter:   { padding: '14px 24px', borderTop: '1px solid #e8ecf0', display: 'flex', justifyContent: 'flex-end', gap: '10px' },
  cancelBtn:     { padding: '9px 20px', background: 'none', border: '1.5px solid #e8ecf0', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', fontFamily: 'Inter, sans-serif' },
  saveBtn:       { padding: '9px 24px', background: '#051c2c', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', color: '#ffffff', fontFamily: 'Inter, sans-serif' },
};

export default SettingsPage;