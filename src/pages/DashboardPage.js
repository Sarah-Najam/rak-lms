import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, BarChart, Bar,
} from 'recharts';
import api from '../api';

const satisfactionTrendData = [
  { month: 'Jan', score: 4.2 }, { month: 'Feb', score: 4.3 },
  { month: 'Mar', score: 4.3 }, { month: 'Apr', score: 4.5 },
  { month: 'May', score: 4.4 }, { month: 'Jun', score: 4.6 },
  { month: 'Jul', score: 4.5 }, { month: 'Aug', score: 4.7 },
  { month: 'Sep', score: 4.6 }, { month: 'Oct', score: 4.8 },
  { month: 'Nov', score: 4.7 }, { month: 'Dec', score: 4.9 },
];

const satisfactionQuarterData = [
  { month: 'Q1', score: 4.3 },
  { month: 'Q2', score: 4.5 },
  { month: 'Q3', score: 4.6 },
  { month: 'Q4', score: 4.8 },
];

const coursesByMonthData = [
  { month: 'Jan', courses: 5 },  { month: 'Feb', courses: 9 },
  { month: 'Mar', courses: 5 },  { month: 'Apr', courses: 4 },
  { month: 'May', courses: 7 },  { month: 'Jun', courses: 6 },
  { month: 'Jul', courses: 3 },  { month: 'Aug', courses: 8 },
  { month: 'Sep', courses: 4 },  { month: 'Oct', courses: 9 },
  { month: 'Nov', courses: 6 },  { month: 'Dec', courses: 5 },
];

const coursesByQuarterData = [
  { month: 'Q1', courses: 19 },
  { month: 'Q2', courses: 17 },
  { month: 'Q3', courses: 15 },
  { month: 'Q4', courses: 20 },
];

function DashboardPage() {

  const [stats,   setStats]   = useState(null);
  const [courses, setCourses] = useState([]);
  const [depts,   setDepts]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [calView, setCalView] = useState('Monthly');
  const [satView, setSatView] = useState('Monthly');

  const upcomingTraining = [
    { date: '14 June', title: 'Fire Safety',   trainer: 'Sarah L.',    dept: 'Operations', enrolled: 25 },
    { date: '16 June', title: 'CS',            trainer: 'Fatema K.',   dept: 'HR',         enrolled: 56 },
    { date: '18 June', title: 'Management',    trainer: 'Muhammad M.', dept: 'Sales',      enrolled: 56 },
    { date: '20 June', title: 'Leadership',    trainer: 'Ahmad F.',    dept: 'Finance',    enrolled: 67 },
  ];

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

  const avgSatisfaction = depts.length > 0 ? '4.4' : '—';

  const deptColor = dept => {
    const map = {
      Operations: { bg: '#dbeafe', text: '#1d4ed8' },
      HR:         { bg: '#dcfce7', text: '#15803d' },
      Sales:      { bg: '#fef9c3', text: '#a16207' },
      Finance:    { bg: '#f3e8ff', text: '#7c3aed' },
    };
    return map[dept] || { bg: '#f1f5f9', text: '#475569' };
  };

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

          <div style={styles.statGrid}>
            <StatCard label="Total Learners"       value={stats?.totalLearners || 0} />
            <StatCard label="Total Courses"        value={stats?.totalCourses  || 0} />
            <StatCard label="Total Training Hours" value={(stats?.totalCourses || 0) * 20 + 'h'} wide />
          </div>

          <div style={styles.chartsRow}>

            {/* Satisfaction Trend */}
            <div style={styles.chartCard}>
              <div style={styles.chartHeader}>
                <span style={styles.chartTitle}>Satisfaction Trend</span>
                <div style={styles.toggleGroup}>
                  {['Monthly', 'Quarterly'].map(v => (
                    <button key={v} onClick={() => setSatView(v)}
                      style={{ ...styles.toggleBtn, ...(satView === v ? styles.toggleBtnActive : {}) }}>
                      {v}
                    </button>
                  ))}
                </div>
              </div>
              <ResponsiveContainer width="100%" height={160}>
                <LineChart data={satView === 'Monthly' ? satisfactionTrendData : satisfactionQuarterData}>
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9baabb' }} axisLine={false} tickLine={false} />
                  <YAxis domain={[3.5, 5]} tick={{ fontSize: 11, fill: '#9baabb' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ fontSize: '12px', borderRadius: '8px', border: '1px solid #e8ecf0' }} />
                  <Line type="monotone" dataKey="score" stroke="#051c2c" strokeWidth={2}
                    dot={{ fill: '#051c2c', r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
              <div style={{ fontSize: '11px', color: '#9baabb', textAlign: 'center', marginTop: '6px' }}>
                Satisfaction Trend
              </div>
            </div>

            {/* Satisfaction Analytics Donut */}
            <div style={styles.chartCard}>
              <div style={styles.chartHeader}>
                <span style={styles.chartTitle}>Satisfaction Analytics</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '10px 0', gap: '8px' }}>
                <div style={{
                  width: '110px', height: '110px', borderRadius: '50%',
                  background: 'conic-gradient(#051c2c 0% 84%, #e8ecf0 84% 100%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <div style={{
                    width: '82px', height: '82px', borderRadius: '50%',
                    background: '#ffffff', display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                  }}>
                    <span style={{ fontSize: '22px', fontWeight: '800', color: '#051c2c', lineHeight: 1 }}>
                      {avgSatisfaction}
                    </span>
                    <span style={{ fontSize: '14px', color: '#c8973a', marginTop: '2px' }}>★</span>
                  </div>
                </div>
                <div style={{ fontSize: '12px', fontWeight: '600', color: '#051c2c', textAlign: 'center' }}>
                  Overall Satisfaction Score
                </div>
                <div style={{ fontSize: '11px', color: '#9baabb', textAlign: 'center' }}>
                  Based on {depts.length * 68} feedbacks
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ── RIGHT COLUMN ── */}
        <div style={styles.rightCol}>

          {/* Upcoming Training Calendar */}
          <div style={styles.calendarCard}>
            <div style={{ fontSize: '14px', fontWeight: '700', color: '#ffffff', marginBottom: '14px' }}>
              Upcoming Training Calendar
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead>
                <tr>
                  {['Date', 'Course Title', 'Trainer', 'Department', 'Enrolled'].map(h => (
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
                {upcomingTraining.map((row, i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? 'rgba(255,255,255,0.03)' : 'transparent' }}>
                    <td style={styles.calTd}>{row.date}</td>
                    <td style={styles.calTd}>{row.title}</td>
                    <td style={styles.calTd}>{row.trainer}</td>
                    <td style={{ ...styles.calTd }}>
                      <span style={{
                        background: deptColor(row.dept).bg,
                        color: deptColor(row.dept).text,
                        padding: '2px 8px', borderRadius: '12px',
                        fontSize: '10px', fontWeight: '600',
                      }}>
                        {row.dept}
                      </span>
                    </td>
                    <td style={{ ...styles.calTd, fontWeight: 600 }}>{row.enrolled}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Total Courses by Month — WITH WORKING TOGGLE */}
          <div style={styles.chartCard}>
            <div style={styles.chartHeader}>
              <span style={styles.chartTitle}>Total Courses by Month</span>
              <div style={styles.toggleGroup}>
                {['Monthly', 'Quarterly'].map(v => (
                  <button key={v} onClick={() => setCalView(v)}
                    style={{ ...styles.toggleBtn, ...(calView === v ? styles.toggleBtnActive : {}) }}>
                    {v}
                  </button>
                ))}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart
                data={calView === 'Monthly' ? coursesByMonthData : coursesByQuarterData}
                barSize={calView === 'Monthly' ? 16 : 40}
              >
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9baabb' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#9baabb' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ fontSize: '12px', borderRadius: '8px', border: '1px solid #e8ecf0' }} />
                <Bar dataKey="courses" fill="#051c2c" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, wide }) {
  return (
    <div style={{ ...styles.statCard, ...(wide ? styles.statCardWide : {}) }}>
      <div style={styles.statLabel}>{label}</div>
      <div style={styles.statValue}>{value}</div>
    </div>
  );
}

const styles = {
  page:           { padding: '30px', minHeight: '100vh', background: '#f2f4f6', fontFamily: 'Inter, sans-serif' },
  mainGrid:       { display: 'grid', gridTemplateColumns: '1fr 420px', gap: '24px', alignItems: 'start' },
  leftCol:        { display: 'flex', flexDirection: 'column', gap: '20px' },
  rightCol:       { display: 'flex', flexDirection: 'column', gap: '20px' },
  statGrid:       { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' },
  statCard:       { background: '#ffffff', border: '1.5px solid #e8ecf0', borderRadius: '12px', padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: '8px' },
  statCardWide:   { gridColumn: 'span 2' },
  statLabel:      { fontSize: '13px', color: '#5a6878', fontWeight: '500' },
  statValue:      { fontSize: '42px', fontWeight: '800', color: '#051c2c', lineHeight: 1, letterSpacing: '-1px' },
  chartsRow:      { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  chartCard:      { background: '#ffffff', border: '1.5px solid #e8ecf0', borderRadius: '12px', padding: '18px 20px' },
  chartHeader:    { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' },
  chartTitle:     { fontSize: '13px', fontWeight: '600', color: '#051c2c' },
  toggleGroup:    { display: 'flex', background: '#f2f4f6', borderRadius: '6px', padding: '2px', gap: '2px' },
  toggleBtn:      { padding: '3px 10px', fontSize: '11px', fontWeight: '500', border: 'none', background: 'none', borderRadius: '4px', cursor: 'pointer', color: '#5a6878', fontFamily: 'Inter, sans-serif' },
  toggleBtnActive:{ background: '#051c2c', color: '#ffffff' },
  calendarCard:   { background: '#051c2c', borderRadius: '12px', padding: '18px 20px', color: '#ffffff' },
  calTd:          { padding: '9px 8px', color: 'rgba(255,255,255,0.85)', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '12px' },
};

export default DashboardPage;