import React, { useState, useEffect } from 'react';
import api from '../api';

function SetPasswordPage() {

  const [view,     setView]     = useState('loading'); // loading | form | success | error
  const [userInfo, setUserInfo] = useState(null);
  const [password, setPassword] = useState('');
  const [confirm,  setConfirm]  = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConf, setShowConf] = useState(false);

  const token = new URLSearchParams(window.location.search).get('token');

  useEffect(() => {
    if (!token) {
      setView('error');
      setError('No token provided. This link appears to be invalid.');
      return;
    }
    // Try invite token first, then reset token
    api.verifyInvite(token)
      .then(data => {
        if (data.error) {
          // Try reset token
          return api.verifyReset(token).then(resetData => {
            if (resetData.error) {
              setError('This link is invalid or has expired. Please request a new one.');
              setView('error');
            } else {
              setUserInfo({ ...resetData, isReset: true });
              setView('form');
            }
          });
        } else {
          setUserInfo({ ...data, isReset: false });
          setView('form');
        }
      })
      .catch(() => {
        setError('Could not verify this link. Please try again.');
        setView('error');
      });
  }, [token]);

  const validatePassword = () => {
    if (password.length < 8)
      return 'Password must be at least 8 characters.';
    if (!/[A-Z]/.test(password))
      return 'Password must contain at least one uppercase letter.';
    if (!/[0-9]/.test(password))
      return 'Password must contain at least one number.';
    if (password !== confirm)
      return 'Passwords do not match.';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const validationError = validatePassword();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      const result = await api.setPassword(token, password);
      if (result.message) {
        setView('success');
      } else {
        setError(result.error || 'Could not set password. Please try again.');
      }
    } catch (err) {
      setError('Cannot connect to server. Please try again.');
    }
    setLoading(false);
  };

  const passwordStrength = () => {
    if (!password) return null;
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    if (score <= 1) return { label: 'Weak',   color: '#dc2626', width: '25%' };
    if (score === 2) return { label: 'Fair',   color: '#d97706', width: '50%' };
    if (score === 3) return { label: 'Good',   color: '#16a34a', width: '75%' };
    return              { label: 'Strong', color: '#15803d', width: '100%' };
  };

  const strength = passwordStrength();

  return (
    <div style={styles.page}>
      <div style={styles.card}>

        {/* ── HEADER ── */}
        <div style={styles.header}>
          <div style={styles.logoBox}>
            <div style={styles.logoIcon}>◈</div>
            <div>
              <div style={styles.logoTitle}>RAK Properties</div>
              <div style={styles.logoSub}>Learning Management System</div>
            </div>
          </div>
        </div>

        <div style={styles.body}>

          {/* ── LOADING ── */}
          {view === 'loading' && (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#9baabb' }}>
              Verifying your link...
            </div>
          )}

          {/* ── ERROR ── */}
          {view === 'error' && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
              <div style={{ fontSize: '18px', fontWeight: '700', color: '#991b1b', marginBottom: '8px' }}>
                Invalid Link
              </div>
              <div style={{ fontSize: '13px', color: '#5a6878', lineHeight: 1.6, marginBottom: '24px' }}>
                {error}
              </div>
              <button
                onClick={() => window.location.href = '/'}
                style={styles.submitBtn}
              >
                Go to Login
              </button>
            </div>
          )}

          {/* ── SET PASSWORD FORM ── */}
          {view === 'form' && userInfo && (
            <>
              <div style={{ marginBottom: '24px' }}>
                <div style={{ fontSize: '22px', fontWeight: '700', color: '#051c2c', marginBottom: '6px' }}>
                  {userInfo.isReset ? 'Reset Your Password' : 'Set Your Password'}
                </div>
                <div style={{ fontSize: '13px', color: '#9baabb', lineHeight: 1.5 }}>
                  {userInfo.isReset
                    ? `Create a new password for ${userInfo.email}`
                    : `Welcome, ${userInfo.name}! Set a password to activate your account.`
                  }
                </div>
              </div>

              {/* Account info */}
              <div style={styles.accountBox}>
                <div style={styles.accountAvatar}>
                  {(userInfo.name || '?').split(' ').slice(0,2).map(w => w[0]).join('').toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#051c2c' }}>
                    {userInfo.name}
                  </div>
                  <div style={{ fontSize: '12px', color: '#9baabb', marginTop: '2px' }}>
                    {userInfo.email}
                  </div>
                  <div style={{ marginTop: '4px' }}>
                    <span style={{ background: '#f0f9ff', color: '#0369a1', padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: '600' }}>
                      {userInfo.role === 'admin' ? 'Administrator' : 'Head of Department'}
                    </span>
                  </div>
                </div>
              </div>

              {error && (
                <div style={styles.errorBox}>{error}</div>
              )}

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                {/* New Password */}
                <div style={styles.formField}>
                  <label style={styles.fieldLabel}>New Password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPass ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Min 8 chars, 1 uppercase, 1 number"
                      required
                      style={styles.input}
                    />
                    <button type="button" onClick={() => setShowPass(!showPass)} style={styles.showPassBtn}>
                      {showPass ? '🙈' : '👁'}
                    </button>
                  </div>

                  {/* Password strength bar */}
                  {strength && (
                    <div style={{ marginTop: '8px' }}>
                      <div style={{ height: '4px', background: '#e8ecf0', borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: strength.width, background: strength.color, borderRadius: '2px', transition: 'width 0.3s ease' }} />
                      </div>
                      <div style={{ fontSize: '11px', color: strength.color, fontWeight: '600', marginTop: '4px' }}>
                        {strength.label}
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div style={styles.formField}>
                  <label style={styles.fieldLabel}>Confirm Password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showConf ? 'text' : 'password'}
                      value={confirm}
                      onChange={e => setConfirm(e.target.value)}
                      placeholder="Re-enter your password"
                      required
                      style={{
                        ...styles.input,
                        borderColor: confirm && confirm !== password ? '#fca5a5' : '#e8ecf0',
                      }}
                    />
                    <button type="button" onClick={() => setShowConf(!showConf)} style={styles.showPassBtn}>
                      {showConf ? '🙈' : '👁'}
                    </button>
                  </div>
                  {confirm && confirm !== password && (
                    <div style={{ fontSize: '11px', color: '#dc2626', marginTop: '4px' }}>
                      Passwords do not match
                    </div>
                  )}
                  {confirm && confirm === password && (
                    <div style={{ fontSize: '11px', color: '#16a34a', marginTop: '4px' }}>
                      ✓ Passwords match
                    </div>
                  )}
                </div>

                {/* Requirements */}
                <div style={styles.requirementsBox}>
                  <div style={{ fontSize: '11px', fontWeight: '700', color: '#5a6878', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Password Requirements
                  </div>
                  {[
                    ['At least 8 characters',           password.length >= 8],
                    ['At least 1 uppercase letter',     /[A-Z]/.test(password)],
                    ['At least 1 number',               /[0-9]/.test(password)],
                  ].map(([req, met]) => (
                    <div key={req} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: met ? '#15803d' : '#9baabb', marginBottom: '4px' }}>
                      <span>{met ? '✅' : '○'}</span>
                      {req}
                    </div>
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{ ...styles.submitBtn, opacity: loading ? 0.7 : 1 }}
                >
                  {loading ? 'Setting password...' : userInfo.isReset ? 'Reset Password' : 'Activate Account'}
                </button>
              </form>
            </>
          )}

          {/* ── SUCCESS ── */}
          {view === 'success' && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎉</div>
              <div style={{ fontSize: '22px', fontWeight: '700', color: '#051c2c', marginBottom: '8px' }}>
                {userInfo?.isReset ? 'Password Reset!' : 'Account Activated!'}
              </div>
              <div style={{ fontSize: '13px', color: '#5a6878', lineHeight: 1.6, marginBottom: '24px' }}>
                {userInfo?.isReset
                  ? 'Your password has been reset successfully. You can now log in with your new password.'
                  : 'Your account is now active. You can log in to the RAK Properties LMS.'
                }
              </div>
              <button
                onClick={() => window.location.href = '/'}
                style={styles.submitBtn}
              >
                Go to Login →
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

const styles = {
  page:            { minHeight: '100vh', background: '#f2f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', fontFamily: 'Inter, sans-serif' },
  card:            { background: '#ffffff', borderRadius: '20px', width: '100%', maxWidth: '440px', boxShadow: '0 24px 64px rgba(5,28,44,0.12)', overflow: 'hidden' },
  header:          { background: '#051c2c', padding: '28px 32px' },
  logoBox:         { display: 'flex', alignItems: 'center', gap: '14px' },
  logoIcon:        { fontSize: '32px', color: '#A5C8D2' },
  logoTitle:       { fontSize: '18px', fontWeight: '700', color: '#ffffff' },
  logoSub:         { fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginTop: '2px', letterSpacing: '0.5px' },
  body:            { padding: '32px' },
  accountBox:      { display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 16px', background: '#f8f9fa', borderRadius: '10px', border: '1px solid #e8ecf0', marginBottom: '20px' },
  accountAvatar:   { width: '44px', height: '44px', borderRadius: '50%', background: '#051c2c', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '700', flexShrink: 0 },
  errorBox:        { background: '#fee2e2', color: '#991b1b', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px', border: '1px solid #fca5a5' },
  formField:       { display: 'flex', flexDirection: 'column' },
  fieldLabel:      { fontSize: '12px', fontWeight: '600', color: '#5a6878', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' },
  input:           { padding: '12px 40px 12px 14px', border: '1.5px solid #e8ecf0', borderRadius: '10px', fontSize: '14px', outline: 'none', background: '#f8f9fa', color: '#051c2c', fontFamily: 'Inter, sans-serif', width: '100%', boxSizing: 'border-box' },
  showPassBtn:     { position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', padding: 0 },
  requirementsBox: { background: '#f8f9fa', border: '1px solid #e8ecf0', borderRadius: '8px', padding: '12px 14px' },
  submitBtn:       { padding: '14px', background: '#051c2c', color: '#ffffff', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', fontFamily: 'Inter, sans-serif', width: '100%' },
};

export default SetPasswordPage;