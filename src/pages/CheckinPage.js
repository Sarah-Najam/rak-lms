import React, { useState, useEffect } from 'react';

const BASE_URL = process.env.NODE_ENV === 'production'
  ? 'http://localhost:5000/api'
  : 'http://localhost:5000/';

function CheckinPage() {
  const [status,  setStatus]  = useState('loading');
  const [name,    setName]    = useState('');
  const [course,  setCourse]  = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token  = params.get('token');

    if (!token) {
      setStatus('error');
      setMessage('Invalid check-in link. No token found.');
      return;
    }

    fetch(`${BASE_URL}/enrollments/checkin`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ token }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.error) {
          setStatus('error');
          setMessage(data.error);
        } else if (data.message === 'already_checked_in') {
          setStatus('already');
          setName(data.name);
          setCourse(data.course_title);
        } else {
          setStatus('success');
          setName(data.name);
          setCourse(data.course_title);
        }
      })
      .catch(() => {
        setStatus('error');
        setMessage('Could not connect to server. Please try again.');
      });
  }, []);

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
            <div style={styles.title}>Verifying your check-in link...</div>
          </div>
        )}

        {status === 'success' && (
          <div style={styles.section}>
            <div style={{ fontSize: '56px' }}>✅</div>
            <div style={styles.title}>Attendance Confirmed!</div>
            <div style={styles.nameBox}>
              <div style={styles.nameLabel}>Welcome</div>
              <div style={styles.nameValue}>{name}</div>
            </div>
            <div style={styles.courseBox}>
              <div style={styles.courseLabel}>Course</div>
              <div style={styles.courseValue}>{course}</div>
            </div>
            <div style={styles.successMsg}>
              Your attendance has been recorded successfully.
              You may now close this page.
            </div>
          </div>
        )}

        {status === 'already' && (
          <div style={styles.section}>
            <div style={{ fontSize: '56px' }}>ℹ️</div>
            <div style={styles.title}>Already Checked In</div>
            <div style={styles.nameBox}>
              <div style={styles.nameValue}>{name}</div>
            </div>
            <div style={styles.courseBox}>
              <div style={styles.courseValue}>{course}</div>
            </div>
            <div style={styles.infoMsg}>
              Your attendance was already recorded for this course.
            </div>
          </div>
        )}

        {status === 'error' && (
          <div style={styles.section}>
            <div style={{ fontSize: '56px' }}>❌</div>
            <div style={styles.title}>Check-in Failed</div>
            <div style={styles.errorMsg}>{message}</div>
            <div style={styles.helpMsg}>
              Please contact your training coordinator for assistance.
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
  logo:       { marginBottom: '32px', paddingBottom: '24px', borderBottom: '1px solid #e8ecf0' },
  logoText:   { fontSize: '20px', fontWeight: '800', color: '#051c2c' },
  logoSub:    { fontSize: '12px', color: '#9baabb', marginTop: '4px' },
  section:    { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' },
  title:      { fontSize: '22px', fontWeight: '700', color: '#051c2c' },
  nameBox:    { background: '#f8f9fa', borderRadius: '10px', padding: '16px 24px', width: '100%', border: '1px solid #e8ecf0', boxSizing: 'border-box' },
  nameLabel:  { fontSize: '11px', color: '#9baabb', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' },
  nameValue:  { fontSize: '18px', fontWeight: '700', color: '#051c2c' },
  courseBox:  { background: '#f0f9ff', borderRadius: '10px', padding: '14px 24px', width: '100%', border: '1px solid #bfdbfe', boxSizing: 'border-box' },
  courseLabel:{ fontSize: '11px', color: '#0369a1', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' },
  courseValue:{ fontSize: '15px', fontWeight: '600', color: '#0369a1' },
  successMsg: { fontSize: '13px', color: '#15803d', background: '#dcfce7', padding: '12px 16px', borderRadius: '8px', lineHeight: 1.6, width: '100%', boxSizing: 'border-box' },
  infoMsg:    { fontSize: '13px', color: '#1d4ed8', background: '#dbeafe', padding: '12px 16px', borderRadius: '8px', lineHeight: 1.6, width: '100%', boxSizing: 'border-box' },
  errorMsg:   { fontSize: '14px', color: '#991b1b', background: '#fee2e2', padding: '12px 16px', borderRadius: '8px', lineHeight: 1.6, width: '100%', boxSizing: 'border-box' },
  helpMsg:    { fontSize: '12px', color: '#9baabb' },
};

export default CheckinPage;