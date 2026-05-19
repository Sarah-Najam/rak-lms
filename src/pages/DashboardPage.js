// ============================================================
// DashboardPage.js — Matches the wireframe exactly
//
// NEW THINGS YOU WILL LEARN IN THIS FILE:
// 1. Recharts — a React library for drawing charts
// 2. LineChart — the satisfaction trend line graph
// 3. BarChart  — total courses by month
// 4. How to structure a complex page into sections
// ============================================================

import React, { useState } from 'react';

// WHY IMPORT FROM RECHARTS?
// Recharts is a library that draws charts using React components.
// Instead of writing hundreds of lines of complex SVG math,
// we just write <LineChart data={...}> and it handles everything.
// Each import is a specific chart piece we need:
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar,
} from 'recharts';

// WHY IMPORT DATA?
// For now data comes from our sample file.
// In Phase 3 this becomes an API call to the backend.
import { LEARNERS, COURSES, DEPARTMENTS } from '../data/sampleData';

// ── SAMPLE CHART DATA ────────────────────────────────────────
// WHY DEFINED OUTSIDE THE COMPONENT?
// This data doesn't change, so it doesn't need to be
// inside the component. Putting it outside means React
// doesn't recreate it every time the component re-renders.
// In Phase 3 this will come from the backend API.

const satisfactionTrendData = [
  { month: 'Jan', score: 4.2 },
  { month: 'Feb', score: 4.3 },
  { month: 'Mar', score: 4.3 },
  { month: 'Apr', score: 4.5 },
];

const coursesByMonthData = [
  { month: 'Jan', courses: 5 },
  { month: 'Feb', courses: 9 },
  { month: 'Mar', courses: 5 },
  { month: 'Apr', courses: 4 },
];

const upcomingTraining = [
  { date: '14 June', title: 'Fire Safety',  trainer: 'Sarah L.',     dept: 'Operations', enrolled: 25  },
  { date: '16 June', title: 'CS',           trainer: 'Fatema K.',    dept: 'HR',         enrolled: 56  },
  { date: '18 June', title: 'Management',   trainer: 'Muhammad M.',  dept: 'Sales',      enrolled: 56  },
  { date: '20 June', title: 'Leadership',   trainer: 'Ahmad F.',     dept: 'Finance',    enrolled: 67  },
];

// ── MAIN COMPONENT ───────────────────────────────────────────
function DashboardPage() {

  // WHY calendarView state?
  // The "Total Courses by Month" chart has two buttons:
  // Monthly and Quarterly. This tracks which is selected.
  const [calendarView, setCalendarView] = useState('Monthly');

  // WHY satisfactionView state?
  // The Satisfaction Trend chart also has Monthly/Quarterly toggle
  const [satisfactionView, setSatisfactionView] = useState('Monthly');

  // Calculate stats from our data
  const totalLearners = LEARNERS.length;
  const totalCourses  = COURSES.length;
  const totalHours    = COURSES.reduce((sum, c) => sum + c.hours, 0);

  // Overall satisfaction score — average of all department scores
  const avgSatisfaction = (
    DEPARTMENTS.reduce((sum, d) => sum + d.score, 0) / DEPARTMENTS.length
  ).toFixed(1);

  return (
    <div style={styles.page}>

      

      {/* ── MAIN GRID: left content + right calendar ── */}
      <div style={styles.mainGrid}>

        {/* ── LEFT COLUMN ── */}
        <div style={styles.leftCol}>

          {/* Training Summary Section */}
          <div style={styles.sectionHeader}>
            <span style={styles.sectionTitle}>Training Summary</span>
          </div>

          {/* Stat Cards */}
          <div style={styles.statGrid}>
            <StatCard label="Total Learners" value={totalLearners} />
            <StatCard label="Total Courses"  value={totalCourses}  />
            <StatCard
              label="Total Training Hours"
              value={totalHours}
              wide={true}
            />
          </div>

          {/* Charts Row */}
          <div style={styles.chartsRow}>

            {/* Satisfaction Trend Line Chart */}
            <div style={styles.chartCard}>
              <div style={styles.chartHeader}>
                <span style={styles.chartTitle}>Satisfaction Trend</span>
                <div style={styles.toggleGroup}>
                  {['Monthly', 'Quarterly'].map(v => (
                    <button
                      key={v}
                      onClick={() => setSatisfactionView(v)}
                      style={{
                        ...styles.toggleBtn,
                        ...(satisfactionView === v ? styles.toggleBtnActive : {}),
                      }}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              {/* WHY ResponsiveContainer? */}
              {/* Charts need a fixed width to render. */}
              {/* ResponsiveContainer makes the chart fill */}
              {/* whatever space is available automatically. */}
              <ResponsiveContainer width="100%" height={160}>
                <LineChart data={satisfactionTrendData}>
                  {/* XAxis = the horizontal labels (Jan, Feb...) */}
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 11, fill: '#9baabb' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  {/* YAxis = the vertical numbers (4.1, 4.2...) */}
                  <YAxis
                    domain={[3.5, 4.5]}
                    tick={{ fontSize: 11, fill: '#9baabb' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  {/* Tooltip = the popup when you hover a point */}
                  <Tooltip
                    contentStyle={{
                      fontSize: '12px',
                      borderRadius: '8px',
                      border: '1px solid #dde1e5',
                    }}
                  />
                  {/* Line = the actual line drawn on the chart */}
                  {/* dataKey="score" means: use the 'score' */}
                  {/* property from each data object */}
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#051c2c"
                    strokeWidth={2}
                    dot={{ fill: '#051c2c', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
              <div style={styles.chartLabel}>Satisfaction Trend</div>
            </div>

            {/* Satisfaction Analytics Donut */}
            <div style={styles.chartCard}>
              <div style={styles.chartHeader}>
                <span style={styles.chartTitle}>Satisfaction Analytics</span>
              </div>
              <div style={styles.donutWrap}>
                {/* WHY a custom donut instead of a chart library? */}
                {/* For a simple single-value donut, CSS is cleaner */}
                {/* and easier to control than a full chart library */}
                <div style={styles.donut}>
                  <div style={styles.donutInner}>
                    <span style={styles.donutScore}>{avgSatisfaction}</span>
                    <span style={styles.donutStar}>★</span>
                  </div>
                </div>
                <div style={styles.donutLabel}>Overall Satisfaction Score</div>
                <div style={styles.donutSub}>
                  Based on {DEPARTMENTS.length * 68} feedbacks
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ── RIGHT COLUMN ── */}
        <div style={styles.rightCol}>

          {/* Upcoming Training Calendar */}
          <div style={styles.calendarCard}>
            <div style={styles.calendarHeader}>
              <span style={styles.calendarTitle}>Upcoming Training Calendar</span>
            </div>
            <table style={styles.calTable}>
              <thead>
                <tr>
                  {['Date', 'Course Title', 'Trainer', 'Department', 'Enrolled'].map(h => (
                    <th key={h} style={styles.calTh}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {upcomingTraining.map((row, i) => (
                  <tr key={i} style={i % 2 === 0 ? styles.calRowEven : {}}>
                    <td style={styles.calTd}>{row.date}</td>
                    <td style={styles.calTd}>{row.title}</td>
                    <td style={styles.calTd}>{row.trainer}</td>
                    <td style={styles.calTd}>
                      <span style={{
                        ...styles.deptBadge,
                        background: deptColor(row.dept).bg,
                        color:      deptColor(row.dept).text,
                      }}>
                        {row.dept}
                      </span>
                    </td>
                    <td style={{ ...styles.calTd, fontWeight: 600 }}>
                      {row.enrolled}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Total Courses by Month Bar Chart */}
          <div style={styles.chartCard}>
            <div style={styles.chartHeader}>
              <span style={styles.chartTitle}>Total Courses by Month</span>
              <div style={styles.toggleGroup}>
                {['Monthly', 'Quarterly'].map(v => (
                  <button
                    key={v}
                    onClick={() => setCalendarView(v)}
                    style={{
                      ...styles.toggleBtn,
                      ...(calendarView === v ? styles.toggleBtnActive : {}),
                    }}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={coursesByMonthData} barSize={28}>
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: '#9baabb' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#9baabb' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    fontSize: '12px',
                    borderRadius: '8px',
                    border: '1px solid #dde1e5',
                  }}
                />
                {/* Bar = the actual bars. fill = their color */}
                <Bar dataKey="courses" fill="#051c2c" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

        </div>
      </div>
    </div>
  );
}

// ── HELPER: department badge colors ──────────────────────────
// WHY A FUNCTION?
// Each department gets a different colored badge.
// Instead of writing if/else everywhere,
// one function handles all department colors cleanly.
function deptColor(dept) {
  const map = {
    Operations: { bg: '#dbeafe', text: '#1d4ed8' },
    HR:         { bg: '#dcfce7', text: '#15803d' },
    Sales:      { bg: '#fef9c3', text: '#a16207' },
    Finance:    { bg: '#f3e8ff', text: '#7c3aed' },
    IT:         { bg: '#e0f2fe', text: '#0369a1' },
  };
  return map[dept] || { bg: '#f1f5f9', text: '#475569' };
}

// ── STAT CARD COMPONENT ──────────────────────────────────────
function StatCard({ label, value, wide }) {
  return (
    <div style={{ ...styles.statCard, ...(wide ? styles.statCardWide : {}) }}>
      <div style={styles.statLabel}>{label}</div>
      <div style={styles.statValue}>{value}</div>
    </div>
  );
}

// ── STYLES ───────────────────────────────────────────────────
const styles = {
  page: {
    padding: '30px',
    minHeight: '100vh',
    background: '#f2f4f6',
    fontFamily: 'Inter, sans-serif',
  },
  pageTitle: {
    fontSize: '26px',
    fontWeight: '700',
    color: '#051c2c',
    marginBottom: '24px',
    letterSpacing: '-0.3px',
  },
  mainGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 420px',
    gap: '24px',
    alignItems: 'start',
  },
  leftCol: { display: 'flex', flexDirection: 'column', gap: '20px' },
  rightCol: { display: 'flex', flexDirection: 'column', gap: '20px' },

  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#051c2c',
  },

  // Stat cards
  statGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '14px',
  },
  statCard: {
    background: '#ffffff',
    border: '1.5px solid #e8ecf0',
    borderRadius: '12px',
    padding: '22px 24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  statCardWide: {
    gridColumn: 'span 2',
  },
  statLabel: {
    fontSize: '13px',
    color: '#5a6878',
    fontWeight: '500',
  },
  statValue: {
    fontSize: '42px',
    fontWeight: '800',
    color: '#051c2c',
    lineHeight: 1,
    letterSpacing: '-1px',
  },

  // Charts
  chartsRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
  },
  chartCard: {
    background: '#ffffff',
    border: '1.5px solid #e8ecf0',
    borderRadius: '12px',
    padding: '18px 20px',
  },
  chartHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '14px',
  },
  chartTitle: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#051c2c',
  },
  chartLabel: {
    fontSize: '11px',
    color: '#9baabb',
    textAlign: 'center',
    marginTop: '6px',
  },
  toggleGroup: {
    display: 'flex',
    background: '#f2f4f6',
    borderRadius: '6px',
    padding: '2px',
    gap: '2px',
  },
  toggleBtn: {
    padding: '3px 10px',
    fontSize: '11px',
    fontWeight: '500',
    border: 'none',
    background: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    color: '#5a6878',
    fontFamily: 'Inter, sans-serif',
  },
  toggleBtnActive: {
    background: '#051c2c',
    color: '#ffffff',
  },

  // Donut chart
  donutWrap: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '10px 0',
    gap: '8px',
  },
  donut: {
    width: '110px',
    height: '110px',
    borderRadius: '50%',
    background: 'conic-gradient(#051c2c 0% 84%, #e8ecf0 84% 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  donutInner: {
    width: '82px',
    height: '82px',
    borderRadius: '50%',
    background: '#ffffff',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  donutScore: {
    fontSize: '22px',
    fontWeight: '800',
    color: '#051c2c',
    lineHeight: 1,
  },
  donutStar: {
    fontSize: '14px',
    color: '#c8973a',
    marginTop: '2px',
  },
  donutLabel: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#051c2c',
    textAlign: 'center',
  },
  donutSub: {
    fontSize: '11px',
    color: '#9baabb',
    textAlign: 'center',
  },

  // Calendar
  calendarCard: {
    background: '#051c2c',
    borderRadius: '12px',
    padding: '18px 20px',
    color: '#ffffff',
  },
  calendarHeader: {
    marginBottom: '14px',
  },
  calendarTitle: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#ffffff',
  },
  calTable: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '12px',
  },
  calTh: {
    padding: '6px 8px',
    textAlign: 'left',
    color: 'rgba(182,189,194,0.6)',
    fontWeight: '600',
    fontSize: '10px',
    textTransform: 'uppercase',
    letterSpacing: '0.4px',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
  },
  calTd: {
    padding: '9px 8px',
    color: 'rgba(255,255,255,0.85)',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
    fontSize: '12px',
  },
  calRowEven: {
    background: 'rgba(255,255,255,0.03)',
  },
  deptBadge: {
    padding: '2px 8px',
    borderRadius: '12px',
    fontSize: '10px',
    fontWeight: '600',
  },
};

export default DashboardPage;