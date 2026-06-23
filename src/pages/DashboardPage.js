import React, { useState, useEffect } from 'react';
import api from '../api';

function DashboardPage() {

  const [stats,   setStats]   = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [calView, setCalView] = useState('Monthly');
  const [satView, setSatView] = useState('Monthly');

  useEffect(() => {
    Promise.all([
      api.getReports(),
      api.getCourses(),
      api.getDepartments(),
    ]).then(([s, c]) => {
      setStats(s);
      if (Array.isArray(c)) setCourses(c);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const developmentalUpcoming = courses
    .filter(c => (c.status === 'Pending' || c.status === 'Ongoing') &&
      (c.training_type || 'Developmental') === 'Developmental')
    .slice(0, 5);

  const mandatoryUpcoming = courses
    .filter(c => (c.status === 'Pending' || c.status === 'Ongoing') &&
      c.training_type === 'Mandatory')
    .slice(0, 5);

  const fmtDate = d => d
    ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
    : '—';

  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun',
                  'Jul','Aug','Sep','Oct','Nov','Dec'];

  const coursesByMonth = MONTHS.map((month, i) => ({
    label: month,
    value: courses.filter(c => {
      const d = c.start_date || c.end_date;
      if (!d) return false;
      return new Date(d).getMonth() === i;
    }).length,
  }));

  const coursesByQuarter = ['Q1','Q2','Q3','Q4'].map((q, i) => ({
    label: q,
    value: courses.filter(c => {
      const d = c.start_date || c.end_date;
      if (!d) return false;
      return Math.floor(new Date(d).getMonth() / 3) === i;
    }).length,
  }));

  const calData  = calView === 'Monthly' ? coursesByMonth : coursesByQuarter;
  const maxCal   = Math.max(...calData.map(d => d.value), 1);

  const trendData  = satView === 'Monthly'
    ? (stats?.satisfactionTrend     || [])
    : (stats?.satisfactionQuarterly || []);
  const trendKey   = satView === 'Monthly' ? 'month' : 'quarter';
  const overallPct = stats?.overallSatisfaction || 0;
  const hasTrend   = trendData.some(d => d.score > 0);

  if (loading) return (
    <div style={{ padding: '40px', textAlign: 'center', color: '#9baabb', fontSize: '14px' }}>
      Loading dashboard...
    </div>
  );

  return (
    <div style={styles.page}>
      <div style={styles.mainGrid}>

        {/* ── LEFT COLUMN ── */}
        <div style={styles.leftCol}>

          <div style={{ fontSize: '20px', fontWeight: '700', color: '#051c2c' }}>
            Training Summary
          </div>

          {/* ── 2×2 STAT CARDS ── */}
          <div style={styles.statGrid}>

            <div style={{ ...styles.statCard, background: '#051C2C' }}>
              <div style={styles.statIcon}>🎓</div>
              <div style={styles.statNum}>{stats?.totalLearners || 0}</div>
              <div style={styles.statLabel}>Total Learners</div>
            </div>

            <div style={{ ...styles.statCard, background: '#AF5F46' }}>
              <div style={styles.statIcon}>📚</div>
              <div style={styles.statNum}>{stats?.totalCourses || 0}</div>
              <div style={styles.statLabel}>Total Courses</div>
            </div>

            <div style={{ ...styles.statCard, background: '#6a9ea8' }}>
              <div style={styles.statIcon}>🏆</div>
              <div style={styles.statNum}>{stats?.totalLearnersTrainedThisYear || 0}</div>
              <div style={styles.statLabel}>Learners Trained</div>
              <div style={styles.statSub}>Jan 1 – Today {new Date().getFullYear()}</div>
            </div>

            <div style={{ ...styles.statCard, background: '#7a9e7a' }}>
              <div style={styles.statIcon}>⏱️</div>
              <div style={styles.statNum}>{(stats?.totalCourses || 0) * 20}h</div>
              <div style={styles.statLabel}>Total Training Hours</div>
            </div>

          </div>

          {/* ── CHARTS ROW ── */}
          <div style={styles.chartsRow}>

            {/* Satisfaction Trend */}
            <div style={styles.chartCard}>
              <div style={styles.chartHeader}>
                <span style={styles.chartTitle}>Satisfaction Trend</span>
                <div style={styles.toggleGroup}>
                  {['Monthly','Quarterly'].map(v => (
                    <button
                      key={v}
                      onClick={() => setSatView(v)}
                      style={{
                        ...styles.toggleBtn,
                        ...(satView === v ? styles.toggleActive : {}),
                      }}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>
              {hasTrend ? (
                <MiniBarChart
                  data={trendData.map(d => ({
                    label: d[trendKey],
                    value: d.score,
                  }))}
                  maxVal={100}
                  color="#051c2c"
                  suffix="%"
                />
              ) : (
                <div style={styles.noData}>
                  No data yet.
                  <br />
                  <span style={{ fontSize: '11px' }}>
                    Rate courses on the Courses page to see the trend.
                  </span>
                </div>
              )}
              <div style={styles.chartSub}>
                Cumulative avg satisfaction % — {new Date().getFullYear()}
              </div>
            </div>

            {/* Satisfaction Analytics */}
            <div style={styles.chartCard}>
              <div style={styles.chartHeader}>
                <span style={styles.chartTitle}>Satisfaction Analytics</span>
              </div>
              {overallPct > 0 ? (
                <div style={{
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', gap: '10px', padding: '8px 0',
                }}>
                  <div style={{ position: 'relative', width: '110px', height: '110px' }}>
                    <svg
                      viewBox="0 0 110 110"
                      style={{ width: '110px', height: '110px', transform: 'rotate(-90deg)' }}
                    >
                      <circle
                        cx="55" cy="55" r="46"
                        fill="none" stroke="#e8ecf0" strokeWidth="10"
                      />
                      <circle
                        cx="55" cy="55" r="46"
                        fill="none" stroke="#051c2c" strokeWidth="10"
                        strokeDasharray={`${2 * Math.PI * 46 * overallPct / 100} ${2 * Math.PI * 46}`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div style={{
                      position: 'absolute', inset: 0,
                      display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'center',
                    }}>
                      <span style={{ fontSize: '20px', fontWeight: '800', color: '#051c2c', lineHeight: 1 }}>
                        {overallPct}%
                      </span>
                      <span style={{ fontSize: '12px', color: '#c8973a', marginTop: '2px' }}>
                        {'★'.repeat(Math.round(overallPct / 20))}
                      </span>
                    </div>
                  </div>
                  <div style={{ fontSize: '12px', fontWeight: '600', color: '#051c2c', textAlign: 'center' }}>
                    Overall Score
                  </div>
                  <div style={{ fontSize: '11px', color: '#9baabb', textAlign: 'center' }}>
                    {(overallPct / 100 * 5).toFixed(1)} / 5 stars — all rated courses
                  </div>
                </div>
              ) : (
                <div style={styles.noData}>
                  No data yet.
                  <br />
                  <span style={{ fontSize: '11px' }}>Rate courses to see the overall score.</span>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* ── RIGHT COLUMN ── */}
        <div style={styles.rightCol}>

          {/* Upcoming Developmental Trainings */}
          <div style={styles.calCard}>
            <div style={{
              fontSize: '14px', fontWeight: '700',
              color: '#ffffff', marginBottom: '14px',
            }}>
              📅 Upcoming Developmental Trainings
            </div>
            {developmentalUpcoming.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {developmentalUpcoming.map(course => (
                  <TrainingRow key={course.id} course={course} fmtDate={fmtDate} />
                ))}
              </div>
            ) : (
              <div style={{ color: 'rgba(182,189,194,0.6)', fontSize: '13px', textAlign: 'center', padding: '20px 0' }}>
                No upcoming developmental courses.
              </div>
            )}
          </div>

          {/* Mandatory Trainings */}
          <div style={{ ...styles.calCard, background: '#AF5F46' }}>
            <div style={{
              fontSize: '14px', fontWeight: '700',
              color: '#ffffff', marginBottom: '14px',
            }}>
              ⚠️ Mandatory Trainings — {new Date().getFullYear()}
            </div>
            {mandatoryUpcoming.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {mandatoryUpcoming.map(course => (
                  <TrainingRow key={course.id} course={course} fmtDate={fmtDate} />
                ))}
              </div>
            ) : (
              <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', textAlign: 'center', padding: '20px 0' }}>
                No mandatory training scheduled this year.
              </div>
            )}
          </div>

          {/* Courses by Period */}
          <div style={styles.chartCard}>
            <div style={styles.chartHeader}>
              <span style={styles.chartTitle}>Total Courses by Period</span>
              <div style={styles.toggleGroup}>
                {['Monthly','Quarterly'].map(v => (
                  <button
                    key={v}
                    onClick={() => setCalView(v)}
                    style={{
                      ...styles.toggleBtn,
                      ...(calView === v ? styles.toggleActive : {}),
                    }}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
            <MiniBarChart
              data={calData}
              maxVal={maxCal}
              color="#051c2c"
              suffix=""
            />
          </div>

        </div>
      </div>
    </div>
  );
}

function TrainingRow({ course, fmtDate }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '10px',
      padding: '9px 10px', borderRadius: '8px',
      background: 'rgba(255,255,255,0.08)',
      border: '1px solid rgba(255,255,255,0.1)',
    }}>
      <div style={{
        minWidth: '38px', height: '38px', borderRadius: '8px',
        background: 'rgba(255,255,255,0.12)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.7)', fontWeight: '600', lineHeight: 1 }}>
          {fmtDate(course.start_date).split(' ')[1] || '—'}
        </span>
        <span style={{ fontSize: '13px', color: '#ffffff', fontWeight: '700', lineHeight: 1.2 }}>
          {fmtDate(course.start_date).split(' ')[0] || '—'}
        </span>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: '12px', fontWeight: '600', color: '#ffffff',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {course.title}
        </div>
        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', marginTop: '2px' }}>
          {course.trainer_name || '—'}
        </div>
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div style={{ fontSize: '12px', fontWeight: '700', color: '#ffffff' }}>
          {course.enrolled_count || 0}
        </div>
        <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.6)' }}>
          enrolled
        </div>
      </div>
    </div>
  );
}

function MiniBarChart({ data, maxVal, color, suffix }) {
  const max = Math.max(maxVal, 1);
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-end',
      gap: '3px', height: '110px', padding: '0 2px',
    }}>
      {data.map((d, i) => {
        const pct = Math.round((d.value / max) * 100);
        return (
          <div
            key={i}
            style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              alignItems: 'center', gap: '3px',
              height: '100%', justifyContent: 'flex-end',
            }}
          >
            {d.value > 0 && (
              <div style={{ fontSize: '9px', fontWeight: '700', color: '#5a6878', lineHeight: 1 }}>
                {d.value}{suffix}
              </div>
            )}
            <div
              title={`${d.label}: ${d.value}${suffix}`}
              style={{
                width: '100%',
                borderRadius: '3px 3px 0 0',
                background: d.value > 0 ? color : '#e8ecf0',
                height: d.value > 0 ? `${Math.max(pct, 8)}%` : '4px',
                transition: 'height 0.3s ease',
                minHeight: '4px',
                cursor: 'default',
              }}
            />
            <div style={{
              fontSize: '9px', color: '#9baabb',
              whiteSpace: 'nowrap', overflow: 'hidden',
              textOverflow: 'ellipsis', maxWidth: '100%',
              textAlign: 'center',
            }}>
              {d.label}
            </div>
          </div>
        );
      })}
    </div>
  );
}

const styles = {
  page:        { padding: '30px', minHeight: '100vh', background: '#f2f4f6', fontFamily: 'Inter, sans-serif' },
  mainGrid:    { display: 'grid', gridTemplateColumns: '1fr 380px', gap: '24px', alignItems: 'start' },
  leftCol:     { display: 'flex', flexDirection: 'column', gap: '20px' },
  rightCol:    { display: 'flex', flexDirection: 'column', gap: '20px' },
  statGrid:    { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' },
  statCard:    { borderRadius: '14px', padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: '6px' },
  statIcon:    { fontSize: '22px', marginBottom: '2px' },
  statNum:     { fontSize: '36px', fontWeight: '800', color: '#ffffff', lineHeight: 1, letterSpacing: '-1px' },
  statLabel:   { fontSize: '13px', color: 'rgba(255,255,255,0.75)', fontWeight: '500' },
  statSub:     { fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginTop: '1px' },
  chartsRow:   { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  chartCard:   { background: '#ffffff', border: '1.5px solid #e8ecf0', borderRadius: '12px', padding: '18px 20px' },
  chartHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' },
  chartTitle:  { fontSize: '13px', fontWeight: '600', color: '#051c2c' },
  chartSub:    { fontSize: '11px', color: '#9baabb', textAlign: 'center', marginTop: '8px' },
  toggleGroup: { display: 'flex', background: '#f2f4f6', borderRadius: '6px', padding: '2px', gap: '2px' },
  toggleBtn:   { padding: '3px 10px', fontSize: '11px', fontWeight: '500', border: 'none', background: 'none', borderRadius: '4px', cursor: 'pointer', color: '#5a6878', fontFamily: 'Inter, sans-serif' },
  toggleActive:{ background: '#051c2c', color: '#ffffff' },
  calCard:     { background: '#051c2c', borderRadius: '12px', padding: '20px', color: '#ffffff' },
  noData:      { padding: '20px 16px', textAlign: 'center', color: '#9baabb', fontSize: '12px', lineHeight: 1.6, background: '#f8f9fa', borderRadius: '8px', border: '1px solid #e8ecf0' },
};

export default DashboardPage;