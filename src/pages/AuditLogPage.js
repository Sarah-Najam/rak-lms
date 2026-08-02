import React, { useState, useEffect } from 'react';
import api from '../api';

const ACTION_COLORS = {
  LOGIN:                   { bg: '#f0f9ff', color: '#0369a1' },
  LOGOUT:                  { bg: '#f1f5f9', color: '#5a6878' },
  SET_PASSWORD:            { bg: '#f0f9ff', color: '#0369a1' },
  RESET_PASSWORD:          { bg: '#f0f9ff', color: '#0369a1' },
  INVITE_USER:             { bg: '#f3e8ff', color: '#7c3aed' },
  ADD_LEARNER:             { bg: '#dcfce7', color: '#15803d' },
  EDIT_LEARNER:            { bg: '#fef9c3', color: '#a16207' },
  DELETE_LEARNER:          { bg: '#fee2e2', color: '#991b1b' },
  REMOVE_PHOTO:            { bg: '#fee2e2', color: '#991b1b' },
  ADD_COURSE:              { bg: '#dcfce7', color: '#15803d' },
  EDIT_COURSE:             { bg: '#fef9c3', color: '#a16207' },
  DELETE_COURSE:           { bg: '#fee2e2', color: '#991b1b' },
  ADD_TRAINER:             { bg: '#dcfce7', color: '#15803d' },
  EDIT_TRAINER:            { bg: '#fef9c3', color: '#a16207' },
  DELETE_TRAINER:          { bg: '#fee2e2', color: '#991b1b' },
  ADD_DEPARTMENT:          { bg: '#dcfce7', color: '#15803d' },
  EDIT_DEPARTMENT:         { bg: '#fef9c3', color: '#a16207' },
  DELETE_DEPARTMENT:       { bg: '#fee2e2', color: '#991b1b' },
  ENROLL_LEARNER:          { bg: '#dbeafe', color: '#1d4ed8' },
  UNENROLL_LEARNER:        { bg: '#fee2e2', color: '#991b1b' },
  SEND_CHECKIN:            { bg: '#dbeafe', color: '#1d4ed8' },
  SEND_FEEDBACK:           { bg: '#dbeafe', color: '#1d4ed8' },
  GENERATE_CERTIFICATE:    { bg: '#f3e8ff', color: '#7c3aed' },
  REGENERATE_CERTIFICATE:  { bg: '#f3e8ff', color: '#7c3aed' },
  SET_BUDGET:              { bg: '#fef9c3', color: '#a16207' },
  UPLOAD_MATERIAL:         { bg: '#dcfce7', color: '#15803d' },
  DELETE_MATERIAL:         { bg: '#fee2e2', color: '#991b1b' },
};

const ACTION_LABELS = {
  LOGIN:                   '🔐 Login',
  LOGOUT:                  '🚪 Logout',
  SET_PASSWORD:            '🔑 Set Password',
  RESET_PASSWORD:          '🔑 Reset Password',
  INVITE_USER:             '📨 Invited User',
  ADD_LEARNER:             '➕ Added Learner',
  EDIT_LEARNER:            '✏️ Edited Learner',
  DELETE_LEARNER:          '🗑️ Deleted Learner',
  REMOVE_PHOTO:            '🖼️ Removed Photo',
  ADD_COURSE:              '➕ Added Course',
  EDIT_COURSE:             '✏️ Edited Course',
  DELETE_COURSE:           '🗑️ Deleted Course',
  ADD_TRAINER:             '➕ Added Trainer',
  EDIT_TRAINER:            '✏️ Edited Trainer',
  DELETE_TRAINER:          '🗑️ Deleted Trainer',
  ADD_DEPARTMENT:          '➕ Added Department',
  EDIT_DEPARTMENT:         '✏️ Edited Department',
  DELETE_DEPARTMENT:       '🗑️ Deleted Department',
  ENROLL_LEARNER:          '📚 Enrolled Learner',
  UNENROLL_LEARNER:        '❌ Unenrolled Learner',
  SEND_CHECKIN:            '📧 Sent Check-in Links',
  SEND_FEEDBACK:           '📝 Sent Feedback Form',
  GENERATE_CERTIFICATE:    '🎓 Generated Certificate',
  REGENERATE_CERTIFICATE:  '🔄 Regenerated Certificate',
  SET_BUDGET:              '💰 Set Budget',
  UPLOAD_MATERIAL:         '📎 Uploaded Material',
  DELETE_MATERIAL:         '🗑️ Deleted Material',
};

const SKIP_FIELDS = [
  'created_at', 'password_hash', 'invite_token',
  'checkin_token', 'feedback_token',
  'token_expires_at', 'feedback_token_expires_at',
];

export default function AuditLogPage() {
  const [logs,       setLogs]       = useState([]);
  const [total,      setTotal]      = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading,    setLoading]    = useState(true);
  const [selected,   setSelected]   = useState(null);
  const [actions,    setActions]    = useState([]);
  const [users,      setUsers]      = useState([]);

  const [filters, setFilters] = useState({
    page:     1,
    limit:    50,
    action:   '',
    entity:   '',
    userId:   '',
    dateFrom: '',
    dateTo:   '',
    search:   '',
  });

  useEffect(() => {
    api.getAuditActions().then(data => { if (Array.isArray(data)) setActions(data); });
    api.getAuditUsers().then(data   => { if (Array.isArray(data)) setUsers(data);   });
  }, []);

  useEffect(() => {
    loadLogs();
  }, [filters]);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const data = await api.getAuditLogs(filters);
      if (data.logs) {
        setLogs(data.logs);
        setTotal(data.total      || 0);
        setTotalPages(data.totalPages || 1);
      }
    } catch {}
    setLoading(false);
  };

  const setFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const fmtDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleString('en-GB', {
      day:    '2-digit', month: 'short', year:   'numeric',
      hour:   '2-digit', minute: '2-digit', second: '2-digit',
    });
  };

  const getDiffFields = (oldVal, newVal) => {
    if (!oldVal || !newVal) return [];
    const changed = [];
    const allKeys = new Set([...Object.keys(oldVal), ...Object.keys(newVal)]);
    allKeys.forEach(key => {
      if (SKIP_FIELDS.includes(key)) return;
      if (JSON.stringify(oldVal[key]) !== JSON.stringify(newVal[key])) {
        changed.push({ field: key, old: oldVal[key], new: newVal[key] });
      }
    });
    return changed;
  };

  const parseJSON = (val) => {
    if (!val) return null;
    if (typeof val === 'object') return val;
    try { return JSON.parse(val); } catch { return null; }
  };

  const ActionBadge = ({ action }) => {
    const c     = ACTION_COLORS[action] || { bg: '#f1f5f9', color: '#5a6878' };
    const label = ACTION_LABELS[action] || action;
    return (
      <span style={{ background: c.bg, color: c.color, padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600', whiteSpace: 'nowrap' }}>
        {label}
      </span>
    );
  };

  const clearFilters = () => setFilters({ page: 1, limit: 50, action: '', entity: '', userId: '', dateFrom: '', dateTo: '', search: '' });

  const hasFilters = filters.action || filters.entity || filters.userId || filters.dateFrom || filters.dateTo || filters.search;

  return (
    <div style={{ padding: '30px', minHeight: '100vh', background: '#f2f4f6', fontFamily: 'Inter, sans-serif' }}>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ fontSize: '20px', fontWeight: '700', color: '#051c2c' }}>Audit Log</div>
          <div style={{ fontSize: '13px', color: '#9baabb', marginTop: '2px' }}>
            {total.toLocaleString()} total records · admin access only
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <div style={{ background: '#ffffff', border: '1.5px solid #e8ecf0', borderRadius: '8px', padding: '0 12px', display: 'flex', gap: '6px', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: '#9baabb' }}>🔍</span>
            <input
              value={filters.search}
              onChange={e => setFilter('search', e.target.value)}
              placeholder="Search by name or action..."
              style={{ border: 'none', outline: 'none', fontSize: '13px', color: '#051c2c', fontFamily: 'Inter, sans-serif', width: '220px', padding: '9px 0', background: 'transparent' }}
            />
          </div>
          {hasFilters && (
            <button onClick={clearFilters} style={{ background: '#fee2e2', color: '#991b1b', border: 'none', borderRadius: '8px', padding: '9px 14px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
              ✕ Clear Filters
            </button>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <select value={filters.action} onChange={e => setFilter('action', e.target.value)} style={styles.filterSelect}>
          <option value="">All Actions</option>
          {actions.map(a => <option key={a} value={a}>{ACTION_LABELS[a] || a}</option>)}
        </select>

        <select value={filters.entity} onChange={e => setFilter('entity', e.target.value)} style={styles.filterSelect}>
          <option value="">All Entities</option>
          {['learner','course','trainer','department','enrollment','certificate','material','budget'].map(e => (
            <option key={e} value={e}>{e.charAt(0).toUpperCase() + e.slice(1)}</option>
          ))}
        </select>

        <select value={filters.userId} onChange={e => setFilter('userId', e.target.value)} style={styles.filterSelect}>
          <option value="">All Users</option>
          {users.map(u => <option key={u.user_id} value={u.user_id}>{u.user_name}</option>)}
        </select>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#ffffff', border: '1.5px solid #e8ecf0', borderRadius: '8px', padding: '0 12px' }}>
          <input type="date" value={filters.dateFrom} onChange={e => setFilter('dateFrom', e.target.value)}
            style={{ border: 'none', outline: 'none', fontSize: '12px', fontFamily: 'Inter, sans-serif', color: '#051c2c', padding: '8px 0' }} />
          <span style={{ color: '#9baabb', fontSize: '12px' }}>to</span>
          <input type="date" value={filters.dateTo} onChange={e => setFilter('dateTo', e.target.value)}
            style={{ border: 'none', outline: 'none', fontSize: '12px', fontFamily: 'Inter, sans-serif', color: '#051c2c', padding: '8px 0' }} />
        </div>
      </div>

      <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e8ecf0', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#9baabb', fontSize: '14px' }}>
            Loading audit log...
          </div>
        ) : logs.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#9baabb' }}>
            <div style={{ fontSize: '36px', marginBottom: '12px' }}>📋</div>
            <div style={{ fontSize: '14px' }}>No audit records found.</div>
            {hasFilters && (
              <button onClick={clearFilters} style={{ marginTop: '12px', background: 'none', border: 'none', color: '#0369a1', cursor: 'pointer', fontSize: '13px', textDecoration: 'underline', fontFamily: 'Inter, sans-serif' }}>
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '900px' }}>
              <thead>
                <tr style={{ background: '#051c2c' }}>
                  {['Timestamp', 'User', 'Action', 'Entity', 'Details', 'IP Address', ''].map((h, i) => (
                    <th key={i} style={{ padding: '11px 14px', textAlign: 'left', fontSize: '10px', fontWeight: '700', color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {logs.map(log => {
                  const oldVal  = parseJSON(log.old_value);
                  const newVal  = parseJSON(log.new_value);
                  const diff    = oldVal && newVal ? getDiffFields(oldVal, newVal) : [];
                  const hasData = oldVal || newVal;

                  return (
                    <tr key={log.id} style={{ borderBottom: '1px solid #f0f2f4' }}>
                      <td style={{ ...styles.td, whiteSpace: 'nowrap', fontSize: '12px', color: '#5a6878' }}>
                        {fmtDate(log.created_at)}
                      </td>
                      <td style={styles.td}>
                        <div style={{ fontSize: '13px', fontWeight: '600', color: '#051c2c' }}>{log.user_name || '—'}</div>
                        <div style={{ fontSize: '11px', color: '#9baabb' }}>{log.user_email || ''}</div>
                      </td>
                      <td style={styles.td}>
                        <ActionBadge action={log.action} />
                      </td>
                      <td style={styles.td}>
                        {log.entity_type && (
                          <span style={{ background: '#f0f9ff', color: '#0369a1', padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: '600' }}>
                            {log.entity_type}
                          </span>
                        )}
                      </td>
                      <td style={{ ...styles.td, maxWidth: '220px' }}>
                        {log.entity_name && (
                          <div style={{ fontSize: '13px', fontWeight: '600', color: '#051c2c', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {log.entity_name}
                          </div>
                        )}
                        {diff.length > 0 && (
                          <div style={{ fontSize: '11px', color: '#9baabb', marginTop: '2px' }}>
                            {diff.length} field{diff.length !== 1 ? 's' : ''} changed
                          </div>
                        )}
                      </td>
                      <td style={{ ...styles.td, fontSize: '11px', color: '#9baabb', fontFamily: 'monospace' }}>
                        {log.ip_address || '—'}
                      </td>
                      <td style={styles.td}>
                        {hasData && (
                          <button onClick={() => setSelected(log)} style={{ background: '#f0f9ff', color: '#0369a1', border: 'none', borderRadius: '6px', padding: '4px 10px', fontSize: '11px', fontWeight: '600', cursor: 'pointer', fontFamily: 'Inter, sans-serif', whiteSpace: 'nowrap' }}>
                            View →
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {!loading && totalPages > 1 && (
          <div style={{ padding: '14px 20px', borderTop: '1px solid #e8ecf0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '13px', color: '#5a6878' }}>
              Page {filters.page} of {totalPages} · {total.toLocaleString()} records
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                onClick={() => setFilter('page', Math.max(1, filters.page - 1))}
                disabled={filters.page === 1}
                style={{ ...styles.pageBtn, opacity: filters.page === 1 ? 0.4 : 1 }}
              >
                ← Prev
              </button>
              <button
                onClick={() => setFilter('page', Math.min(totalPages, filters.page + 1))}
                disabled={filters.page === totalPages}
                style={{ ...styles.pageBtn, opacity: filters.page === totalPages ? 0.4 : 1 }}
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>

      {selected && (() => {
        const oldVal = parseJSON(selected.old_value);
        const newVal = parseJSON(selected.new_value);
        const diff   = oldVal && newVal ? getDiffFields(oldVal, newVal) : [];

        return (
          <div style={styles.overlay} onClick={() => setSelected(null)}>
            <div style={styles.modal} onClick={e => e.stopPropagation()}>
              <div style={styles.modalHeader}>
                <div>
                  <div style={styles.modalTitle}>Change Details</div>
                  <div style={{ fontSize: '12px', color: '#9baabb', marginTop: '3px' }}>
                    {fmtDate(selected.created_at)} · {selected.user_name}
                  </div>
                </div>
                <button style={styles.modalClose} onClick={() => setSelected(null)}>×</button>
              </div>

              <div style={styles.modalBody}>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
                  <ActionBadge action={selected.action} />
                  {selected.entity_type && (
                    <span style={{ background: '#f0f9ff', color: '#0369a1', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600' }}>
                      {selected.entity_type}
                    </span>
                  )}
                  {selected.entity_name && (
                    <span style={{ fontSize: '13px', fontWeight: '600', color: '#051c2c' }}>
                      {selected.entity_name}
                    </span>
                  )}
                </div>

                {diff.length > 0 ? (
                  <div>
                    <div style={styles.sectionLabel}>Changed Fields ({diff.length})</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {diff.map(({ field, old: oldV, new: newV }) => (
                        <div key={field} style={{ background: '#f8f9fa', borderRadius: '8px', padding: '12px 14px', border: '1px solid #e8ecf0' }}>
                          <div style={{ fontSize: '11px', fontWeight: '700', color: '#9baabb', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
                            {field.replace(/_/g, ' ')}
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                            <div>
                              <div style={{ fontSize: '10px', color: '#991b1b', fontWeight: '700', marginBottom: '4px' }}>BEFORE</div>
                              <div style={{ background: '#fee2e2', color: '#991b1b', padding: '6px 10px', borderRadius: '6px', fontSize: '12px', wordBreak: 'break-all', minHeight: '28px' }}>
                                {oldV === null || oldV === undefined ? <span style={{ opacity: 0.5 }}>empty</span> : String(oldV)}
                              </div>
                            </div>
                            <div>
                              <div style={{ fontSize: '10px', color: '#15803d', fontWeight: '700', marginBottom: '4px' }}>AFTER</div>
                              <div style={{ background: '#dcfce7', color: '#15803d', padding: '6px 10px', borderRadius: '6px', fontSize: '12px', wordBreak: 'break-all', minHeight: '28px' }}>
                                {newV === null || newV === undefined ? <span style={{ opacity: 0.5 }}>empty</span> : String(newV)}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : newVal && !oldVal ? (
  <div>
    <div style={styles.sectionLabel}>Created Record</div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {Object.entries(newVal).filter(([k]) => !SKIP_FIELDS.includes(k)).map(([k, v]) => (
        <div key={k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '8px 12px', background: '#f0fdf4', borderRadius: '8px', border: '1px solid #86efac', gap: '12px' }}>
          <span style={{ fontSize: '11px', fontWeight: '700', color: '#166534', textTransform: 'uppercase', letterSpacing: '0.5px', flexShrink: 0 }}>
            {k.replace(/_/g, ' ')}
          </span>
          <span style={{ fontSize: '13px', color: '#15803d', fontWeight: '500', textAlign: 'right', wordBreak: 'break-word' }}>
            {v === null || v === undefined ? '—' : String(v)}
          </span>
        </div>
      ))}
    </div>
  </div>
                ) : oldVal && !newVal ? (
  <div>
    <div style={{ ...styles.sectionLabel, color: '#991b1b' }}>Deleted Record</div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {Object.entries(oldVal).filter(([k]) => !SKIP_FIELDS.includes(k)).map(([k, v]) => (
        <div key={k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '8px 12px', background: '#fee2e2', borderRadius: '8px', border: '1px solid #fca5a5', gap: '12px' }}>
          <span style={{ fontSize: '11px', fontWeight: '700', color: '#991b1b', textTransform: 'uppercase', letterSpacing: '0.5px', flexShrink: 0 }}>
            {k.replace(/_/g, ' ')}
          </span>
          <span style={{ fontSize: '13px', color: '#991b1b', fontWeight: '500', textAlign: 'right', wordBreak: 'break-word' }}>
            {v === null || v === undefined ? '—' : String(v)}
          </span>
        </div>
      ))}
    </div>
  </div>
                ) : (
                  <div style={{ color: '#9baabb', fontSize: '13px', textAlign: 'center', padding: '20px' }}>
                    No field differences detected.
                  </div>
                )}
              </div>

              <div style={styles.modalFooter}>
                <button style={styles.cancelBtn} onClick={() => setSelected(null)}>Close</button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

const styles = {
  filterSelect: { padding: '9px 12px', border: '1.5px solid #e8ecf0', borderRadius: '8px', fontSize: '13px', outline: 'none', background: '#ffffff', color: '#051c2c', fontFamily: 'Inter, sans-serif', cursor: 'pointer' },
  td:           { padding: '12px 14px', fontSize: '13px', color: '#051c2c', verticalAlign: 'middle' },
  pageBtn:      { padding: '7px 14px', background: '#ffffff', border: '1.5px solid #e8ecf0', borderRadius: '8px', fontSize: '12px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', color: '#051c2c' },
  sectionLabel: { fontSize: '12px', fontWeight: '700', color: '#051c2c', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' },
  overlay:      { position: 'fixed', inset: 0, background: 'rgba(5,28,44,0.55)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' },
  modal:        { background: '#ffffff', borderRadius: '16px', width: '100%', maxWidth: '680px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 64px rgba(5,28,44,0.25)' },
  modalHeader:  { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '20px 24px', borderBottom: '1px solid #e8ecf0', position: 'sticky', top: 0, background: '#ffffff', zIndex: 1 },
  modalTitle:   { fontSize: '18px', fontWeight: '700', color: '#051c2c' },
  modalClose:   { background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#9baabb', lineHeight: 1 },
  modalBody:    { padding: '20px 24px' },
  modalFooter:  { padding: '14px 24px', borderTop: '1px solid #e8ecf0', display: 'flex', justifyContent: 'flex-end' },
  cancelBtn:    { padding: '9px 20px', background: 'none', border: '1.5px solid #e8ecf0', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', fontFamily: 'Inter, sans-serif' },
};