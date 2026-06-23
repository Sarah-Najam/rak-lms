import React, { useState, useEffect } from 'react';
import api from '../api';

function FeedbackPage() {

  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState('');
  const [info,       setInfo]       = useState(null);
  const [alreadyDone,setAlreadyDone]= useState(false);
  const [submitted,  setSubmitted]  = useState(false);
  const [satisfaction, setSatisfaction] = useState(0);
  const [recommend,    setRecommend]    = useState(0);
  const [testimonial,  setTestimonial]  = useState('');
  const [hoverSat,    setHoverSat]    = useState(0);
  const [hoverRec,    setHoverRec]    = useState(0);
  const [submitting, setSubmitting]  = useState(false);

  const token = new URLSearchParams(window.location.search).get('token');

  useEffect(() => {
    if (!token) {
      setError('No feedback token provided.');
      setLoading(false);
      return;
    }
    api.verifyFeedbackToken(token)
      .then(data => {
        if (data.error) {
          setError(data.error);
        } else if (data.already_submitted) {
          setAlreadyDone(true);
          setInfo(data);
        } else {
          setInfo(data);
        }
        setLoading(false);
      })
      .catch(() => {
        setError('Could not verify feedback link.');
        setLoading(false);
      });
  }, [token]);

  const handleSubmit = async () => {
    if (satisfaction === 0 || recommend === 0) {
      alert('Please rate both questions before submitting.');
      return;
    }
    setSubmitting(true);
    try {
      const result = await api.submitFeedback({
        token,
        satisfaction,
        would_recommend: recommend,
        testimonial,
      });
      if (result.message === 'success') {
        setSubmitted(true);
      } else {
        alert(result.error || 'Could not submit feedback.');
      }
    } catch (err) {
      alert('Error connecting to server.');
    }
    setSubmitting(false);
  };

  const StarInput = ({ value, hover, setHover, onChange }) => (
    <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
      {[1,2,3,4,5].map(star => (
        <button
          key={star}
          type="button"
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: '38px', padding: '4px',
            color: star <= (hover || value) ? '#c8973a' : '#d4d9dd',
            transition: 'color 0.1s',
          }}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(star)}
        >
          ★
        </button>
      ))}
    </div>
  );

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <div style={{ textAlign: 'center', color: '#9baabb', padding: '40px 0' }}>
            Loading...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <div style={{ fontSize: '48px', textAlign: 'center', marginBottom: '12px' }}>⚠️</div>
          <div style={{ fontSize: '16px', fontWeight: '700', color: '#991b1b', textAlign: 'center' }}>
            {error}
          </div>
        </div>
      </div>
    );
  }

  if (alreadyDone) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <div style={{ fontSize: '48px', textAlign: 'center', marginBottom: '12px' }}>✅</div>
          <div style={{ fontSize: '16px', fontWeight: '700', color: '#051c2c', textAlign: 'center' }}>
            You already submitted feedback for this course.
          </div>
          <div style={{ fontSize: '13px', color: '#5a6878', textAlign: 'center', marginTop: '8px' }}>
            Thank you, {info.learner_name}!
          </div>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <div style={{ fontSize: '48px', textAlign: 'center', marginBottom: '12px' }}>🎉</div>
          <div style={{ fontSize: '18px', fontWeight: '700', color: '#051c2c', textAlign: 'center' }}>
            Thank you for your feedback!
          </div>
          <div style={{ fontSize: '13px', color: '#5a6878', textAlign: 'center', marginTop: '8px' }}>
            Your response has been recorded for {info.course_title}.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', fontWeight: '600' }}>
            RAK Properties LMS
          </div>
          <div style={{ fontSize: '18px', fontWeight: '700', color: '#ffffff', marginTop: '4px' }}>
            Course Feedback
          </div>
        </div>

        <div style={styles.body}>
          <div style={{ fontSize: '13px', color: '#5a6878', marginBottom: '4px' }}>
            Hi <strong>{info.learner_name}</strong>, please share your feedback for:
          </div>
          <div style={{ fontSize: '16px', fontWeight: '700', color: '#051c2c', marginBottom: '24px' }}>
            {info.course_title}
          </div>

          <div style={{ marginBottom: '28px' }}>
            <div style={{ fontSize: '14px', fontWeight: '600', color: '#051c2c', textAlign: 'center', marginBottom: '12px' }}>
              1. How satisfied were you with this course overall?
            </div>
            <StarInput value={satisfaction} hover={hoverSat} setHover={setHoverSat} onChange={setSatisfaction} />
          </div>

          <div style={{ marginBottom: '28px' }}>
            <div style={{ fontSize: '14px', fontWeight: '600', color: '#051c2c', textAlign: 'center', marginBottom: '12px' }}>
              2. Would you recommend this course to others?
            </div>
            <StarInput value={recommend} hover={hoverRec} setHover={setHoverRec} onChange={setRecommend} />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '12px', fontWeight: '600', color: '#5a6878', display: 'block', marginBottom: '8px' }}>
              Additional comments (optional)
            </label>
            <textarea
              value={testimonial}
              onChange={e => setTestimonial(e.target.value)}
              placeholder="Tell us more about your experience..."
              style={{
                width: '100%', padding: '10px 12px', border: '1.5px solid #e8ecf0',
                borderRadius: '8px', fontSize: '13px', outline: 'none',
                background: '#f8f9fa', minHeight: '80px', resize: 'vertical',
                fontFamily: 'Inter, sans-serif', boxSizing: 'border-box',
              }}
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={submitting}
            style={{
              width: '100%', padding: '14px', background: '#051c2c',
              color: '#ffffff', border: 'none', borderRadius: '10px',
              fontSize: '14px', fontWeight: '700', cursor: 'pointer',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            {submitting ? 'Submitting...' : 'Submit Feedback'}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page:   { minHeight: '100vh', background: '#f2f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', fontFamily: 'Inter, sans-serif' },
  card:   { background: '#ffffff', borderRadius: '16px', width: '100%', maxWidth: '480px', boxShadow: '0 24px 64px rgba(5,28,44,0.15)', overflow: 'hidden' },
  header: { background: '#051c2c', padding: '24px 28px' },
  body:   { padding: '28px' },
};

export default FeedbackPage;