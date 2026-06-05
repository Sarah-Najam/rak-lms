import React, { useState, useEffect } from 'react';
import api from '../api';

function SettingsPage() {

  const [users,       setUsers]       = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [showInvite,  setShowInvite]  = useState(false);
  const [inviteForm,  setInviteForm]  = useState({ name: '', email: '', role: 'user', designation: '' });
  const [inviteMsg,   setInviteMsg]   = useState('');

  useEffect(() => {
    api.getUsers()
      .then(data => {
        if (Array.isArray(data)) setUsers(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleInvite = async () => {
    if (!inviteForm.name || !inviteForm.email) {
      alert('Name and email are required.');
      return;
    }
    if (!inviteForm.email.endsWith('@rakproperties.ae')) {
      alert('Email must be a @rakproperties.ae address.');
      return;
    }
    try {
      const result = await api.inviteUser(inviteForm);
      if (result.message) {
        setInviteMsg(`✅ Invite created for ${inviteForm.email}`);
        setInviteForm({ name: '', email: '', role: 'user', designation: '' });
        api.getUsers().then(data => { if (Array.isArray(data)) setUsers(data); });
      } else {
        setInviteMsg('❌ ' + (result.error || 'Could not send invite.'));
      }
    } catch (err) {
      setInviteMsg('❌ Error connecting to server.');
    }
  };

  return (
    <div style={styles.page}>

      <div style={styles.header}>
        <div style={styles.headerTitle}>Settings</div>
        <button style={styles.inviteBtn} onClick={() => setShowInvite(!showInvite)}>
          + Invite User
        </button>
      </div>

      {showInvite && (
        <div style={styles.inviteCard}>
          <div style={styles.cardTitle}>Invite New User</div>
          <div style={styles.formGrid}>
            <Field label="Full Name *"   value={inviteForm.name}        onChange={v => setInviteForm({...inviteForm, name: v})}        placeholder="e.g. Sara Al Mansoori" />
            <Field label="Email *"       value={inviteForm.email}       onChange={v => setInviteForm({...inviteForm, email: v})}       placeholder="name@rakproperties.ae" type="email" />
            <Field label="Designation"   value={inviteForm.designation} onChange={v => setInviteForm({...inviteForm, designation: v})} placeholder="e.g. HR Manager" />
            <Field label="Role"          value={inviteForm.role}        onChange={v => setInviteForm({...inviteForm, role: v})}
              type="select" options={['user', 'admin']} />
          </div>
          {inviteMsg && (
            <div style={{
              marginTop: '12px', padding: '10px 14px', borderRadius: '8px', fontSize: '13px',
              background: inviteMsg.startsWith('✅') ? '#dcfce7' : '#fee2e2',
              color:      inviteMsg.startsWith('✅') ? '#15803d' : '#991b1b',
            }}>
              {inviteMsg}
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
            <button style={styles.cancelBtn} onClick={() => { setShowInvite(false); setInviteMsg(''); }}>Cancel</button>
            <button style={styles.saveBtn} onClick={handleInvite}>Send Invite</button>
          </div>
        </div>
      )}

      <div style={styles.tableWrap}>
        <div style={styles.cardTitle}>System Users</div>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#9baabb' }}>Loading users...</div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr style={styles.theadRow}>
                {['No.', 'Name', 'Email', 'Role', 'Designation', 'Status'].map(h => (
                  <th key={h} style={styles.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((user, i) => (
                <tr key={user.id} style={styles.tr}>
                  <td style={styles.td}>{i + 1}</td>
                  <td style={styles.td}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{
                        width: '28px', height: '28px', borderRadius: '50%',
                        background: '#051c2c', color: '#ffffff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '10px', fontWeight: '700', flexShrink: 0,
                      }}>
                        {user.name.split(' ').slice(0,2).map(w => w[0]).join('')}
                      </div>
                      <span style={{ fontWeight: '500' }}>{user.name}</span>
                    </div>
                  </td>
                  <td style={{ ...styles.td, color: '#5a6878', fontSize: '12px' }}>{user.email}</td>
                  <td style={styles.td}>
                    <span style={{
                      background: user.role === 'admin' ? '#fdf4ff' : '#f0f9ff',
                      color:      user.role === 'admin' ? '#7c3aed' : '#0369a1',
                      padding: '3px 10px', borderRadius: '20px',
                      fontSize: '11px', fontWeight: '600',
                    }}>
                      {user.role}
                    </span>
                  </td>
                  <td style={{ ...styles.td, color: '#5a6878' }}>{user.designation || '—'}</td>
                  <td style={styles.td}>
                    <span style={{
                      background: user.status === 'active' ? '#dcfce7' : '#fef9c3',
                      color:      user.status === 'active' ? '#15803d' : '#a16207',
                      padding: '3px 10px', borderRadius: '20px',
                      fontSize: '11px', fontWeight: '600',
                    }}>
                      {user.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = 'text', options = [] }) {
  const inputStyle = {
    width: '100%', padding: '9px 12px', border: '1.5px solid #e8ecf0',
    borderRadius: '8px', fontSize: '13px', outline: 'none',
    background: '#f8f9fa', color: '#051c2c', fontFamily: 'Inter, sans-serif',
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
      <label style={{ fontSize: '11px', fontWeight: '700', color: '#5a6878', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
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
  page:       { padding: '30px', minHeight: '100vh', background: '#f2f4f6', fontFamily: 'Inter, sans-serif' },
  header:     { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  headerTitle:{ fontSize: '24px', fontWeight: '700', color: '#051c2c' },
  inviteBtn:  { background: '#051c2c', color: '#ffffff', border: 'none', borderRadius: '8px', padding: '10px 20px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'Inter, sans-serif' },
  inviteCard: { background: '#ffffff', borderRadius: '12px', border: '1px solid #e8ecf0', padding: '22px 24px', marginBottom: '20px' },
  cardTitle:  { fontSize: '15px', fontWeight: '700', color: '#051c2c', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid #e8ecf0' },
  formGrid:   { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' },
  cancelBtn:  { padding: '9px 20px', background: 'none', border: '1.5px solid #e8ecf0', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', fontFamily: 'Inter, sans-serif' },
  saveBtn:    { padding: '9px 24px', background: '#051c2c', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', color: '#ffffff', fontFamily: 'Inter, sans-serif' },
  tableWrap:  { background: '#ffffff', borderRadius: '12px', border: '1px solid #e8ecf0', padding: '0 0 8px 0', overflow: 'hidden' },
  table:      { width: '100%', borderCollapse: 'collapse' },
  theadRow:   { background: '#051c2c' },
  th:         { padding: '12px 16px', textAlign: 'left', fontSize: '10px', fontWeight: '700', color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.5px' },
  tr:         { borderBottom: '1px solid #f0f2f4' },
  td:         { padding: '12px 16px', fontSize: '13px', color: '#051c2c', verticalAlign: 'middle' },
};

export default SettingsPage;