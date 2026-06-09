import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, BarChart, Bar,
} from 'recharts';
import api from '../api';

function DashboardPage() {

  const [stats,   setStats]   = useState(null);
  const [courses, setCourses] = useState([]);
  const [depts,   setDepts]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [calView, setCalView] = useState('Monthly');
  const [satView, setSatView] = useState('Monthly');

  useEffect(() => {
    Promise.all([
      api.getReports(),
      api.getCourses(),
      api.getDepartments(),
    ]).then(([s, c, d]) => {
      setStats(s);
      if (Array.isArray(c)) setCourses(c);
      if (Array.isArray(d)) setDepts(d);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  // Upcoming courses from real data
  const upcomingCourses = courses
    .filter(c => c.status === 'Pending' || c.status === 'Ongoing')
    .slice(0, 5);

  const fmtDate = d => d
    ? new Date(d).toLocaleDateString('en-GB', {
        day: '2-digit', month: 'short',
      })
    : '—';

  const deptColor = dept => {
    const colors = [
      { bg: '#dbeafe', text: '#1d4ed8' },
      { bg: '#dcfce7', text: '#15803d' },
      { bg: '#fef9c3', text: '#a16207' },
      { bg: '#f3e8ff', text: '#7c3aed' },
      { bg: '#fee2e2', text: '#991b1b' },
    ];
    const idx = dept ? dept.charCodeAt(0) % colors.length : 0;
    return colors[idx];
  };

  // Chart data from real backend
  const trendData = satView === 'Monthly'
    ? (stats?.satisfactionTrend     || [])
    : (stats?.satisfactionQuarterly || []);

  const trendKey   = satView === 'Monthly' ? 'month'   : 'quarter';
  const overallPct = stats?.overallSatisfaction || 0;
  const overallStars = overallPct > 0
    ? (overallPct / 100 * 5).toFixed(1)
    : null;

  // Courses by month from real data
  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const coursesByMonth = MONTHS.map((month, i) => ({
    month,
    courses: courses.filter(c => {
      const d = c.start_date || c.end_date;
      if (!d) return false;
      return new Date(d).getMonth() === i &&
             new Date(d).getFullYear() === new Date().getFullYear();
    }).length,
  }));

  const coursesByQuarter = ['Q1','Q2','Q3','Q4'].map((q, i) => ({
    quarter: q,
    courses: courses.filter(c => {
      const d = c.start_date || c.end_date;
      if (!d) return false;
      const month = new Date(d).getMonth();
      return Math.floor(month / 3) === i &&
             new Date(d).getFullYear() === new Date().getFullYear();
    }).length,
  }));

  const calData    = calView === 'Monthly' ? coursesByMonth : coursesByQuarter;
  const calKey     = calView === 'Monthly' ? 'month'        : 'quarter';

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

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '18px', fontWeight: '700', color: '#051c2c' }}>
              Training Summary
            </span>
          </div>

          {/* Stat Cards */}
          <div style={styles.statGrid}>
            <StatCard label="Total Learners"  value={stats?.totalLearners || 0} />
            <StatCard label="Total Courses"   value={stats?.totalCourses  || 0} />
            <StatCard
              label="Learners Trained This Year"
              value={stats?.totalLearnersTrainedThisYear || 0}
              sub={`Jan 1 – Today ${new Date().getFullYear()}`}
            />
            <StatCard
              label="Total Training Hours"
              value={(stats?.totalCourses || 0) * 20 + 'h'}
              wide
            />
          </div>

          {/* Charts Row */}
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
                      style={{ ...styles.toggleBtn, ...(satView === v ? styles.toggleBtnActive : {}) }}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>
              {trendData.some(d => d.score > 0) ? (
                <ResponsiveContainer width="100%" height={160}>
                  <LineChart data={trendData}>
                    <XAxis
                      dataKey={trendKey}
                      tick={{ fontSize: 11, fill: '#9baabb' }}
                      axisLine={false} tickLine={false}
                    />
                    <YAxis
                      domain={[0, 100]}
                      tick={{ fontSize: 11, fill: '#9baabb' }}
                      axisLine={false} tickLine={false}
                      tickFormatter={v => v + '%'}
                    />
                    <Tooltip
                      formatter={v => v + '%'}
                      contentStyle={{ fontSize: '12px', borderRadius: '8px', border: '1px solid #e8ecf0' }}
                    />
                    <Line
                      type="monotone" dataKey="score"
                      stroke="#051c2c" strokeWidth={2}
                      dot={{ fill: '#051c2c', r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div style={styles.noDataBox}>
                  No satisfaction data yet.
                  <br />
                  <span style={{ fontSize: '11px' }}>
                    Rate courses on the Courses page to see the trend.
                  </span>
                </div>
              )}
              <div style={{ fontSize: '11px', color: '#9baabb', textAlign: 'center', marginTop: '6px' }}>
                Cumulative avg satisfaction % — {new Date().getFullYear()}
              </div>
            </div>

            {/* Satisfaction Analytics */}
            <div style={styles.chartCard}>
              <div style={styles.chartHeader}>
                <span style={styles.chartTitle}>Satisfaction Analytics</span>
              </div>
              {overallPct > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '10px 0', gap: '8px' }}>
                  <div style={{
                    width: '110px', height: '110px', borderRadius: '50%',
                    background: `conic-gradient(#051c2c 0% ${overallPct}%, #e8ecf0 ${overallPct}% 100%)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <div style={{
                      width: '82px', height: '82px', borderRadius: '50%',
                      background: '#ffffff', display: 'flex',
                      flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <span style={{ fontSize: '20px', fontWeight: '800', color: '#051c2c', lineHeight: 1 }}>
                        {overallPct}%
                      </span>
                      <span style={{ fontSize: '11px', color: '#c8973a', marginTop: '2px' }}>
                        {'★'.repeat(Math.round(overallPct / 20))}
                      </span>
                    </div>
                  </div>
                  <div style={{ fontSize: '12px', fontWeight: '600', color: '#051c2c', textAlign: 'center' }}>
                    Overall Satisfaction Score
                  </div>
                  <div style={{ fontSize: '11px', color: '#9baabb', textAlign: 'center' }}>
                    Avg of all rated courses — {new Date().getFullYear()}
                  </div>
                  {overallStars && (
                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#c8973a' }}>
                      {overallStars} / 5 stars
                    </div>
                  )}
                </div>
              ) : (
                <div style={styles.noDataBox}>
                  No satisfaction data yet.
                  <br />
                  <span style={{ fontSize: '11px' }}>
                    Rate courses to see the overall score.
                  </span>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* ── RIGHT COLUMN ── */}
        <div style={styles.rightCol}>

          {/* Upcoming Training Calendar */}
          <div style={styles.calendarCard}>
            <div style={{ fontSize: '14px', fontWeight: '700', color: '#ffffff', marginBottom: '14px' }}>
              Upcoming Training
            </div>
            {upcomingCourses.length > 0 ? (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <thead>
                  <tr>
                    {['Date', 'Course', 'Trainer', 'Enrolled'].map(h => (
                      <th key={h} style={{
                        padding: '6px 8px', textAlign: 'left',
                        color: 'rgba(182,189,194,0.6)', fontWeight: '600',
                        fontSize: '10px', textTransform: 'uppercase',
                        letterSpacing: '0.4px',
                        borderBottom: '1px solid rgba(255,255,255,0.08)',
                      }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {upcomingCourses.map((course, i) => (
                    <tr key={course.id} style={{ background: i % 2 === 0 ? 'rgba(255,255,255,0.03)' : 'transparent' }}>
                      <td style={styles.calTd}>{fmtDate(course.start_date)}</td>
                      <td style={{ ...styles.calTd, maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {course.title}
                      </td>
                      <td style={styles.calTd}>
                        {course.trainer_name
                          ? course.trainer_name.split(' ')[0]
                          : '—'}
                      </td>
                      <td style={{ ...styles.calTd, fontWeight: 600 }}>
                        {course.enrolled_count || 0}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={{ color: 'rgba(182,189,194,0.6)', fontSize: '13px', textAlign: 'center', padding: '20px 0' }}>
                No upcoming courses.
              </div>
            )}
          </div>

          {/* Courses by Month chart */}
          <div style={styles.chartCard}>
            <div style={styles.chartHeader}>
              <span style={styles.chartTitle}>Total Courses by Period</span>
              <div style={styles.toggleGroup}>
                {['Monthly','Quarterly'].map(v => (
                  <button
                    key={v}
                    onClick={() => setCalView(v)}
                    style={{ ...styles.toggleBtn, ...(calView === v ? styles.toggleBtnActive : {}) }}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={calData} barSize={calView === 'Monthly' ? 16 : 28}>
                <XAxis
                  dataKey={calKey}
                  tick={{ fontSize: 11, fill: '#9baabb' }}
                  axisLine={false} tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#9baabb' }}
                  axisLine={false} tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{ fontSize: '12px', borderRadius: '8px', border: '1px solid #e8ecf0' }}
                />
                <Bar dataKey="courses" fill="#051c2c" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, wide, sub }) {
  return (
    <div style={{ ...styles.statCard, ...(wide ? styles.statCardWide : {}) }}>
      <div style={styles.statLabel}>{label}</div>
      <div style={styles.statValue}>{value}</div>
      {sub && (
        <div style={{ fontSize: '11px', color: '#9baabb', marginTop: '4px' }}>{sub}</div>
      )}
    </div>
  );
}

const styles = {
  page:            { padding: '30px', minHeight: '100vh', background: '#f2f4f6', fontFamily: 'Inter, sans-serif' },
  mainGrid:        { display: 'grid', gridTemplateColumns: '1fr 400px', gap: '24px', alignItems: 'start' },
  leftCol:         { display: 'flex', flexDirection: 'column', gap: '20px' },
  rightCol:        { display: 'flex', flexDirection: 'column', gap: '20px' },
  statGrid:        { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' },
  statCard:        { background: '#ffffff', border: '1.5px solid #e8ecf0', borderRadius: '12px', padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: '6px' },
  statCardWide:    { gridColumn: 'span 2' },
  statLabel:       { fontSize: '13px', color: '#5a6878', fontWeight: '500' },
  statValue:       { fontSize: '38px', fontWeight: '800', color: '#051c2c', lineHeight: 1, letterSpacing: '-1px' },
  chartsRow:       { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  chartCard:       { background: '#ffffff', border: '1.5px solid #e8ecf0', borderRadius: '12px', padding: '18px 20px' },
  chartHeader:     { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' },
  chartTitle:      { fontSize: '13px', fontWeight: '600', color: '#051c2c' },
  toggleGroup:     { display: 'flex', background: '#f2f4f6', borderRadius: '6px', padding: '2px', gap: '2px' },
  toggleBtn:       { padding: '3px 10px', fontSize: '11px', fontWeight: '500', border: 'none', background: 'none', borderRadius: '4px', cursor: 'pointer', color: '#5a6878', fontFamily: 'Inter, sans-serif' },
  toggleBtnActive: { background: '#051c2c', color: '#ffffff' },
  calendarCard:    { background: '#051c2c', borderRadius: '12px', padding: '18px 20px', color: '#ffffff' },
  calTd:           { padding: '9px 8px', color: 'rgba(255,255,255,0.85)', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '12px' },
  noDataBox:       { padding: '24px', textAlign: 'center', color: '#9baabb', fontSize: '13px', lineHeight: 1.6, background: '#f8f9fa', borderRadius: '8px', border: '1px solid #e8ecf0' },
};

export default DashboardPage;