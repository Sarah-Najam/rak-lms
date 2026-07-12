import React, { useState } from 'react';
import api from '../api';

function LoginPage({ onLogin }) {

  const [view,        setView]        = useState('login'); // 'login' | 'forgot' | 'forgot-sent'
  const [email,       setEmail]       = useState('');
  const [password,    setPassword]    = useState('');
  const [resetEmail,  setResetEmail]  = useState('');
  const [resetResult, setResetResult] = useState(null);
  const [error,       setError]       = useState('');
  const [loading,     setLoading]     = useState(false);
  const [showPass,    setShowPass]    = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await api.login(email, password);
      if (data.token) {
        localStorage.setItem('token', data.token);
        onLogin(data.user);
      } else {
        setError(data.error || 'Invalid credentials. Please try again.');
      }
    } catch (err) {
      setError('Cannot connect to server. Please try again.');
    }
    setLoading(false);
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await api.forgotPassword(resetEmail);
      if (data.resetUrl) {
        setResetResult(data);
        setView('forgot-sent');
      } else {
        setError(data.error || 'Could not process request.');
      }
    } catch (err) {
      setError('Cannot connect to server. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>

        {/* ── LOGO HEADER ── */}
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

          {/* ── LOGIN VIEW ── */}
          {view === 'login' && (
            <>
              <div style={styles.welcomeText}>Welcome back</div>
              <div style={styles.welcomeSub}>Sign in to your account to continue</div>

              {error && (
                <div style={styles.errorBox}>{error}</div>
              )}

              <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={styles.formField}>
                  <label style={styles.fieldLabel}>Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="name@rakproperties.ae"
                    required
                    style={styles.input}
                  />
                </div>

                <div style={styles.formField}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label style={styles.fieldLabel}>Password</label>
                    <button
                      type="button"
                      onClick={() => { setView('forgot'); setError(''); setResetEmail(email); }}
                      style={styles.forgotLink}
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPass ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                      style={styles.input}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      style={styles.showPassBtn}
                    >
                      {showPass ? '🙈' : '👁'}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{ ...styles.submitBtn, opacity: loading ? 0.7 : 1 }}
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </button>
              </form>

              <div style={styles.domainNote}>
                🔒 Only @rakproperties.ae email addresses are permitted
              </div>
            </>
          )}

          {/* ── FORGOT PASSWORD VIEW ── */}
          {view === 'forgot' && (
            <>
              <button
                onClick={() => { setView('login'); setError(''); }}
                style={styles.backBtn}
              >
                ← Back to Sign In
              </button>

              <div style={styles.welcomeText}>Reset Password</div>
              <div style={styles.welcomeSub}>
                Enter your email address and we'll generate a password reset link.
              </div>

              {error && (
                <div style={styles.errorBox}>{error}</div>
              )}

              <form onSubmit={handleForgotPassword} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '20px' }}>
                <div style={styles.formField}>
                  <label style={styles.fieldLabel}>Email Address</label>
                  <input
                    type="email"
                    value={resetEmail}
                    onChange={e => setResetEmail(e.target.value)}
                    placeholder="name@rakproperties.ae"
                    required
                    style={styles.input}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{ ...styles.submitBtn, opacity: loading ? 0.7 : 1 }}
                >
                  {loading ? 'Processing...' : 'Generate Reset Link'}
                </button>
              </form>

              <div style={styles.domainNote}>
                🔒 Only @rakproperties.ae email addresses are permitted
              </div>
            </>
          )}

          {/* ── FORGOT PASSWORD SENT VIEW ── */}
          {view === 'forgot-sent' && resetResult && (
            <>
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>🔑</div>
                <div style={styles.welcomeText}>Reset Link Generated</div>
                <div style={styles.welcomeSub}>
                  Share this link with <strong>{resetResult.email}</strong> so they can set a new password.
                </div>
              </div>

              <div style={styles.resetLinkBox}>
                <div style={{ fontSize: '11px', fontWeight: '700', color: '#9baabb', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
                  Password Reset Link
                </div>
                <div style={styles.resetLinkText}>
                  {resetResult.resetUrl}
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(resetResult.resetUrl);
                    alert('Link copied to clipboard!');
                  }}
                  style={styles.copyBtn}
                >
                  📋 Copy Link
                </button>
              </div>

              <div style={{ background: '#fef9c3', border: '1px solid #fde68a', borderRadius: '8px', padding: '12px 14px', fontSize: '12px', color: '#92400e', marginBottom: '20px' }}>
                ⚠️ This link expires in <strong>1 hour</strong>. Share it securely via email or messaging.
              </div>

              <button
                onClick={() => { setView('login'); setError(''); setResetEmail(''); setResetResult(null); }}
                style={styles.submitBtn}
              >
                Back to Sign In
              </button>
            </>
          )}

        </div>
      </div>
    </div>
  );
}

const styles = {
  page:         { minHeight: '100vh', background: '#f2f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', fontFamily: 'Inter, sans-serif' },
  card:         { background: '#ffffff', borderRadius: '20px', width: '100%', maxWidth: '420px', boxShadow: '0 24px 64px rgba(5,28,44,0.12)', overflow: 'hidden' },
  header:       { background: '#051c2c', padding: '28px 32px' },
  logoBox:      { display: 'flex', alignItems: 'center', gap: '14px' },
  logoIcon:     { fontSize: '32px', color: '#A5C8D2' },
  logoTitle:    { fontSize: '18px', fontWeight: '700', color: '#ffffff' },
  logoSub:      { fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginTop: '2px', letterSpacing: '0.5px' },
  body:         { padding: '32px' },
  welcomeText:  { fontSize: '22px', fontWeight: '700', color: '#051c2c', marginBottom: '6px' },
  welcomeSub:   { fontSize: '13px', color: '#9baabb', marginBottom: '24px', lineHeight: 1.5 },
  errorBox:     { background: '#fee2e2', color: '#991b1b', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px', border: '1px solid #fca5a5' },
  formField:    { display: 'flex', flexDirection: 'column' },
  fieldLabel:   { fontSize: '12px', fontWeight: '600', color: '#5a6878', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' },
  input:        { padding: '12px 14px', border: '1.5px solid #e8ecf0', borderRadius: '10px', fontSize: '14px', outline: 'none', background: '#f8f9fa', color: '#051c2c', fontFamily: 'Inter, sans-serif', width: '100%', boxSizing: 'border-box' },
  forgotLink:   { background: 'none', border: 'none', fontSize: '12px', color: '#0369a1', cursor: 'pointer', fontFamily: 'Inter, sans-serif', textDecoration: 'underline', padding: 0 },
  showPassBtn:  { position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', padding: 0 },
  submitBtn:    { padding: '14px', background: '#051c2c', color: '#ffffff', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', fontFamily: 'Inter, sans-serif', marginTop: '4px' },
  domainNote:   { marginTop: '20px', padding: '10px 14px', background: '#f8f9fa', borderRadius: '8px', fontSize: '11px', color: '#9baabb', textAlign: 'center', border: '1px solid #e8ecf0' },
  backBtn:      { background: 'none', border: 'none', color: '#0369a1', fontSize: '13px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', padding: 0, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '4px' },
  resetLinkBox: { background: '#f8f9fa', border: '1px solid #e8ecf0', borderRadius: '10px', padding: '16px', marginBottom: '16px' },
  resetLinkText:{ fontSize: '11px', color: '#051c2c', wordBreak: 'break-all', fontFamily: 'monospace', background: '#ffffff', border: '1px solid #e8ecf0', borderRadius: '6px', padding: '10px 12px', marginBottom: '10px' },
  copyBtn:      { background: '#051c2c', color: '#ffffff', border: 'none', borderRadius: '6px', padding: '8px 16px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', fontFamily: 'Inter, sans-serif' },
};

export default LoginPage;