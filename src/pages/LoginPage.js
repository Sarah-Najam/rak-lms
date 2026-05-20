import React, { useState } from 'react';
import api from '../api';
import { FaUser, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';

function LoginPage({ onLogin }) {

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  const handleLogin = async () => {
  setError('');
  if (!email || !password) {
    setError('Please enter your email and password.');
    return;
  }
  if (!email.endsWith('@rakproperties.ae')) {
    setError('Please use your @rakproperties.ae email address.');
    return;
  }
  setLoading(true);
  try {
    const data = await api.login(email, password);
    if (data.error) {
      setError(data.error);
      setLoading(false);
    } else {
      localStorage.setItem('token', data.token);
      onLogin(data.user);
    }
  } catch (err) {
    setError('Cannot connect to server. Please try again.');
    setLoading(false);
  }
};

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleLogin();
  };

  return (
    <div style={styles.page}>

      {/* LEFT SIDE */}
      <div style={styles.leftPanel}>

        <div style={styles.logoRow}>
          <img src="/rak-logo.svg" alt="RAK Properties" style={{ width: '42px', height: 'auto' }} />
          <span style={styles.logoTitle}>Learning Management System</span>
        </div>

        <div style={styles.formBox}>
          <h1 style={styles.heading}>Log in</h1>

          {error && <div style={styles.errorBox}>{error}</div>}

          {/* Email */}
          <div style={styles.inputWrapper}>
            <div style={styles.inputIcon}><FaUser size={13} color="#9baabb" /></div>
            <input
              type="email"
              placeholder="Username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyDown}
              style={styles.input}
            />
          </div>

          {/* Password */}
          <div style={styles.inputWrapper}>
            <div style={styles.inputIcon}><FaLock size={13} color="#9baabb" /></div>
            <input
              type={showPass ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              style={{ ...styles.input, paddingRight: '42px' }}
            />
            <button style={styles.eyeBtn} onClick={() => setShowPass(!showPass)} tabIndex={-1}>
              {showPass ? <FaEyeSlash size={14} color="#9baabb" /> : <FaEye size={14} color="#9baabb" />}
            </button>
          </div>

          {/* Remember Me + Forgot Password */}
          <div style={styles.optionsRow}>
            <label style={styles.rememberMe}>
              <input type="checkbox" style={{ marginRight: '6px', accentColor: '#051c2c' }} />
              Remember Me
            </label>
            <button style={styles.forgotBtn}>Forgot Password?</button>
          </div>

          {/* Login Button */}
          <button
            style={{ ...styles.loginBtn, opacity: loading ? 0.7 : 1 }}
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Log in'}
          </button>

        </div>
      </div>

      {/* RIGHT SIDE — branded panel */}
      <div style={styles.rightPanel}>
        <div style={styles.shape1} />
        <div style={styles.shape2} />
        <div style={styles.shape3} />
        <div style={styles.rightLogoWrap}>
          <img src="/rak-logo.svg" alt="RAK Properties" style={{ width: '160px', height: 'auto' }} />
        </div>
      </div>

    </div>
  );
}

const styles = {
  page: {
    display: 'flex',
    height: '100vh',
    width: '100vw',
    background: '#f0f2f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  leftPanel: {
    width: '520px',
    minHeight: '560px',
    background: '#ffffff',
    borderRadius: '20px 0 0 20px',
    padding: '40px 48px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    boxShadow: '0 20px 60px rgba(5,28,44,0.12)',
  },
  rightPanel: {
    width: '320px',
    minHeight: '560px',
    background: 'linear-gradient(160deg, #0a2d45 0%, #051c2c 60%, #0d3b5e 100%)',
    borderRadius: '0 20px 20px 0',
    position: 'relative',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingBottom: '40px',
    boxShadow: '0 20px 60px rgba(5,28,44,0.2)',
  },
  shape1: {
    position: 'absolute', width: '260px', height: '260px',
    borderRadius: '50%', background: 'rgba(255,255,255,0.05)',
    top: '-60px', right: '-60px',
  },
  shape2: {
    position: 'absolute', width: '200px', height: '200px',
    borderRadius: '50%', background: 'rgba(255,255,255,0.04)',
    top: '80px', left: '-40px',
  },
  shape3: {
    position: 'absolute', width: '150px', height: '150px',
    borderRadius: '50%', background: 'rgba(255,255,255,0.06)',
    bottom: '100px', right: '-30px',
  },
  rightLogoWrap: {
    position: 'relative', zIndex: 1,
  },
  logoRow: {
    display: 'flex', alignItems: 'center',
    gap: '12px', marginBottom: '48px',
  },
  logoTitle: {
    fontSize: '16px', fontWeight: '600',
    color: '#051c2c', letterSpacing: '-0.2px',
  },
  formBox: { width: '100%' },
  heading: {
    fontSize: '32px', fontWeight: '700',
    color: '#051c2c', marginBottom: '28px', letterSpacing: '-0.5px',
  },
  errorBox: {
    background: '#fce8e8', border: '1px solid #f5c0c0',
    borderRadius: '8px', padding: '10px 14px',
    fontSize: '13px', color: '#9b2020', marginBottom: '16px',
  },
  inputWrapper: { position: 'relative', marginBottom: '14px' },
  inputIcon: {
    position: 'absolute', left: '14px', top: '50%',
    transform: 'translateY(-50%)', pointerEvents: 'none',
  },
  input: {
    width: '100%', padding: '13px 14px 13px 40px',
    border: '1.5px solid #e0e4ea', borderRadius: '10px',
    fontSize: '14px', outline: 'none', background: '#f5f7fa',
    color: '#051c2c', fontFamily: 'Inter, sans-serif',
  },
  eyeBtn: {
    position: 'absolute', right: '12px', top: '50%',
    transform: 'translateY(-50%)', background: 'none',
    border: 'none', cursor: 'pointer', padding: '4px',
    display: 'flex', alignItems: 'center',
  },
  optionsRow: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: '24px', marginTop: '4px',
  },
  rememberMe: {
    fontSize: '13px', color: '#5a6878',
    display: 'flex', alignItems: 'center',
    cursor: 'pointer', fontStyle: 'italic',
  },
  forgotBtn: {
    background: 'none', border: 'none', fontSize: '13px',
    color: '#5a6878', cursor: 'pointer', fontStyle: 'italic',
    fontFamily: 'Inter, sans-serif',
  },
  loginBtn: {
    width: '100%', padding: '14px',
    background: '#051c2c', color: '#ffffff',
    border: 'none', borderRadius: '50px',
    fontSize: '15px', fontWeight: '600',
    cursor: 'pointer', fontFamily: 'Inter, sans-serif',
  },
};

export default LoginPage;