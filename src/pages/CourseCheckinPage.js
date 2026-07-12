import React, { useState, useEffect } from 'react';
import api from '../api';

function CourseCheckinPage() {

  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState('');
  const [courseInfo, setCourseInfo] = useState(null);
  const [empId,      setEmpId]      = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result,     setResult]     = useState(null);

  const courseId = new URLSearchParams(window.location.search).get('course');

  useEffect(() => {
    if (!courseId) {
      setError('Invalid check-in link. No course specified.');
      setLoading(false);
      return;
    }
    api.getCourseCheckinInfo(courseId)
      .then(data => {
        if (data.error) {
          setError(data.error);
        } else {
          setCourseInfo(data);
        }
        setLoading(false);
      })
      .catch(() => {
        setError('Could not load course information.');
        setLoading(false);
      });
  }, [courseId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!empId.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      const data = await api.submitCourseCheckin(courseId, empId.trim());
      if (data.message === 'success' || data.message === 'already_checked_in') {
        setResult(data);
      } else {
        setError(data.error || 'Could not process check-in.');
      }
    } catch (err) {
      setError('Could not connect to server. Please try again.');
    }
    setSubmitting(false);
  };

  const fmtDate = d => d
    ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—';

  if (loading) return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={{ textAlign: 'center', padding: '40px', color: '#9baabb' }}>Loading...</div>
      </div>
    </div>
  );

  if (error && !courseInfo) return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.logoTitle}>RAK Properties LMS</div>
        </div>
        <div style={styles.body}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>⚠️</div>
            <div style={{ fontSize: '16px', fontWeight: '700', color: '#991b1b' }}>{error}</div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div style={styles.page}>
      <div style={styles.card}>

        {/* Header */}
        <div style={styles.header}>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '4px' }}>
            RAK Properties LMS
          </div>
          <div style={styles.logoTitle}>Training Check-In</div>
        </div>

        <div style={styles.body}>

          {/* Course Info */}
          {courseInfo && (
            <div style={styles.courseBox}>
              <div style={{ fontSize: '11px', fontWeight: '700', color: '#9baabb', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                Course
              </div>
              <div style={{ fontSize: '16px', fontWeight: '700', color: '#051c2c', marginBottom: '8px' }}>
                {courseInfo.title}
              </div>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '12px', color: '#5a6878' }}>
                {courseInfo.start_date && (
                  <span>📅 {fmtDate(courseInfo.start_date)}{courseInfo.end_date && courseInfo.end_date !== courseInfo.start_date ? ` – ${fmtDate(courseInfo.end_date)}` : ''}</span>
                )}
                {courseInfo.venue && <span>📍 {courseInfo.venue}</span>}
                {courseInfo.trainer_name && <span>👤 {courseInfo.trainer_name}</span>}
              </div>
            </div>
          )}

          {/* Result */}
          {result ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              {result.message === 'success' ? (
                <>
                  <div style={{ fontSize: '56px', marginBottom: '16px' }}>✅</div>
                  <div style={{ fontSize: '20px', fontWeight: '800', color: '#15803d', marginBottom: '8px' }}>
                    Check-In Successful!
                  </div>
                  <div style={{ fontSize: '15px', color: '#051c2c', fontWeight: '600', marginBottom: '4px' }}>
                    Welcome, {result.name}
                  </div>
                  {result.course_title && (
                    <div style={{ fontSize: '13px', color: '#5a6878' }}>
                      Your attendance has been recorded for<br />
                      <strong>{result.course_title}</strong>
                    </div>
                  )}
                  <button
                    onClick={() => { setResult(null); setEmpId(''); }}
                    style={{ ...styles.submitBtn, marginTop: '24px', background: '#f2f4f6', color: '#051c2c' }}
                  >
                    Check In Another Person
                  </button>
                </>
              ) : (
                <>
                  <div style={{ fontSize: '56px', marginBottom: '16px' }}>ℹ️</div>
                  <div style={{ fontSize: '18px', fontWeight: '700', color: '#051c2c', marginBottom: '8px' }}>
                    Already Checked In
                  </div>
                  <div style={{ fontSize: '13px', color: '#5a6878', marginBottom: '20px' }}>
                    {result.name} has already been marked as attended.
                  </div>
                  <button
                    onClick={() => { setResult(null); setEmpId(''); }}
                    style={{ ...styles.submitBtn, background: '#f2f4f6', color: '#051c2c' }}
                  >
                    Check In Another Person
                  </button>
                </>
              )}
            </div>
          ) : (
            /* Check-in form */
            <>
              <div style={{ fontSize: '15px', fontWeight: '600', color: '#051c2c', marginBottom: '6px', marginTop: '8px' }}>
                Enter Your Employee ID
              </div>
              <div style={{ fontSize: '13px', color: '#9baabb', marginBottom: '20px' }}>
                Type your Employee ID (e.g. RAK-001) to record your attendance.
              </div>

              {error && (
                <div style={styles.errorBox}>{error}</div>
              )}

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <input
                  type="text"
                  value={empId}
                  onChange={e => setEmpId(e.target.value)}
                  placeholder="e.g. RAK-001"
                  required
                  autoFocus
                  style={styles.input}
                />
                <button
                  type="submit"
                  disabled={submitting || !empId.trim()}
                  style={{ ...styles.submitBtn, opacity: submitting || !empId.trim() ? 0.6 : 1 }}
                >
                  {submitting ? 'Checking in...' : 'Submit Check-In ✅'}
                </button>
              </form>

              <div style={{ marginTop: '16px', padding: '10px 14px', background: '#f8f9fa', borderRadius: '8px', fontSize: '11px', color: '#9baabb', textAlign: 'center', border: '1px solid #e8ecf0' }}>
                Your Employee ID can be found on your ID card or HR records
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}

const styles = {
  page:      { minHeight: '100vh', background: '#f2f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', fontFamily: 'Inter, sans-serif' },
  card:      { background: '#ffffff', borderRadius: '20px', width: '100%', maxWidth: '440px', boxShadow: '0 24px 64px rgba(5,28,44,0.12)', overflow: 'hidden' },
  header:    { background: '#051c2c', padding: '28px 32px' },
  logoTitle: { fontSize: '20px', fontWeight: '700', color: '#ffffff' },
  body:      { padding: '28px 32px' },
  courseBox: { background: '#f8f9fa', border: '1px solid #e8ecf0', borderRadius: '10px', padding: '16px', marginBottom: '24px' },
  errorBox:  { background: '#fee2e2', color: '#991b1b', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '12px', border: '1px solid #fca5a5' },
  input:     { padding: '14px 16px', border: '1.5px solid #e8ecf0', borderRadius: '10px', fontSize: '16px', outline: 'none', background: '#f8f9fa', color: '#051c2c', fontFamily: 'Inter, sans-serif', textAlign: 'center', letterSpacing: '2px', textTransform: 'uppercase', width: '100%', boxSizing: 'border-box' },
  submitBtn: { padding: '14px', background: '#051c2c', color: '#ffffff', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', fontFamily: 'Inter, sans-serif' },
};

export default CourseCheckinPage;