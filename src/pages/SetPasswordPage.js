import React, { useState, useEffect } from 'react';
import api from '../api';

function SetPasswordPage() {

  const [status,   setStatus]   = useState('loading');
  const [password, setPassword] = useState('');
  const [confirm,  setConfirm]  = useState('');
  const [message,  setMessage]  = useState('');
  const [token,    setToken]    = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t      = params.get('token');
    if (!t) {
      setStatus('error');
      setMessage('Invalid or missing token.');
      return;
    }
    setToken(t);
    api.verifyInvite(t)
      .then(data => {
        if (data.error) {
          setStatus('error');
          setMessage(data.error);
        } else {
          setStatus('form');
        }
      })
      .catch(() => {
        setStatus('error');
        setMessage('Could not connect to server.');
      });
  }, []);

  const handleSubmit = async () => {
    if (!password || password.length < 6) {
      setMessage('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirm) {
      setMessage('Passwords do not match.');
      return;
    }
    try {
      const result = await api.setPassword(token, password);
      if (result.message) {
        setStatus('success');
      } else {
        setMessage(result.error || 'Could not set password.');
      }
    } catch (err) {
      setMessage('Error connecting to server.');
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>

        <div style={styles.logo}>
          <div style={styles.logoText}>RAK Properties</div>
          <div style={styles.logoSub}>Learning Management System</div>
        </div>

        {status === 'loading' && (
          <div style={styles.section}>
            <div style={{ fontSize: '40px' }}>⏳</div>
            <div style={styles.title}>Verifying your invite link...</div>
          </div>
        )}

        {status === 'form' && (
          <div style={styles.section}>
            <div style={styles.title}>Set Your Password</div>
            <div style={styles.subtitle}>
              Create a secure password for your account.
            </div>
            <div style={styles.formWrap}>
              <div style={styles.fieldWrap}>
                <label style={styles.fieldLabel}>New Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  style={styles.input}
                />
              </div>
              <div style={styles.fieldWrap}>
                <label style={styles.fieldLabel}>Confirm Password</label>
                <input
                  type="password"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  placeholder="Repeat your password"
                  style={styles.input}
                />
              </div>
              {message && (
                <div style={styles.errorMsg}>{message}</div>
              )}
              <button style={styles.submitBtn} onClick={handleSubmit}>
                Set Password & Login
              </button>
            </div>
          </div>
        )}

        {status === 'success' && (
          <div style={styles.section}>
            <div style={{ fontSize: '56px' }}>✅</div>
            <div style={styles.title}>Password Set Successfully!</div>
            <div style={styles.successMsg}>
              Your account is ready. You can now log in with your
              @rakproperties.ae email and the password you just set.
            </div>
            <button
              style={styles.submitBtn}
              onClick={() => window.location.href = '/'}
            >
              Go to Login
            </button>
          </div>
        )}

        {status === 'error' && (
          <div style={styles.section}>
            <div style={{ fontSize: '56px' }}>❌</div>
            <div style={styles.title}>Invalid Link</div>
            <div style={styles.errorMsg}>{message}</div>
            <div style={{ fontSize: '12px', color: '#9baabb', marginTop: '8px' }}>
              Please contact your administrator for a new invite.
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

const styles = {
  page:       { minHeight: '100vh', background: '#f2f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif', padding: '20px' },
  card:       { background: '#ffffff', borderRadius: '16px', padding: '40px', maxWidth: '420px', width: '100%', boxShadow: '0 8px 40px rgba(5,28,44,0.12)', textAlign: 'center' },
  logo:       { marginBottom: '28px', paddingBottom: '20px', borderBottom: '1px solid #e8ecf0' },
  logoText:   { fontSize: '20px', fontWeight: '800', color: '#051c2c' },
  logoSub:    { fontSize: '12px', color: '#9baabb', marginTop: '4px' },
  section:    { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' },
  title:      { fontSize: '20px', fontWeight: '700', color: '#051c2c' },
  subtitle:   { fontSize: '13px', color: '#5a6878', lineHeight: 1.6 },
  formWrap:   { width: '100%', display: 'flex', flexDirection: 'column', gap: '14px' },
  fieldWrap:  { display: 'flex', flexDirection: 'column', gap: '5px', textAlign: 'left' },
  fieldLabel: { fontSize: '11px', fontWeight: '700', color: '#5a6878', textTransform: 'uppercase', letterSpacing: '0.5px' },
  input:      { padding: '11px 14px', border: '1.5px solid #e8ecf0', borderRadius: '8px', fontSize: '13px', outline: 'none', background: '#f8f9fa', color: '#051c2c', fontFamily: 'Inter, sans-serif', width: '100%', boxSizing: 'border-box' },
  submitBtn:  { width: '100%', padding: '12px', background: '#051c2c', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', fontFamily: 'Inter, sans-serif', marginTop: '4px' },
  successMsg: { fontSize: '13px', color: '#15803d', background: '#dcfce7', padding: '12px 16px', borderRadius: '8px', lineHeight: 1.6, width: '100%', boxSizing: 'border-box' },
  errorMsg:   { fontSize: '13px', color: '#991b1b', background: '#fee2e2', padding: '12px 16px', borderRadius: '8px', lineHeight: 1.6, width: '100%', boxSizing: 'border-box', textAlign: 'left' },
};

export default SetPasswordPage;