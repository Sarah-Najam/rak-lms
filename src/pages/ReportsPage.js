// ============================================================
// ReportsPage.js
//
// WHAT THIS PAGE HAS (from the wireframe):
// 1. Search by month + Search by date filters
// 2. 4 stat cards — Population, Learners, Male, Female
// 3. Emirati Learners donut chart (male/female)
// 4. Total Courses breakdown card
// 5. NPS Score card
// 6. Total Departments number
// 7. Department ratings bar chart
// 8. Most Popular Courses list
// 9. Satisfaction Score line chart (Jan-Dec)
// 10. Overall Ratings %
//
// NEW THINGS YOU LEARN:
// 1. PieChart from Recharts — for the donut
// 2. BarChart horizontal — for department ratings
// 3. AreaChart — for satisfaction trend (filled line chart)
// ============================================================

import React, { useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, BarChart, Bar,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { LEARNERS, COURSES, DEPARTMENTS } from '../data/sampleData';

// ── CHART DATA ───────────────────────────────────────────────
const satisfactionData = [
  { month: 'Jan', score: 40 },
  { month: 'Feb', score: 45 },
  { month: 'Mar', score: 42 },
  { month: 'Apr', score: 44 },
  { month: 'May', score: 55 },
  { month: 'Jun', score: 52 },
  { month: 'Jul', score: 58 },
  { month: 'Aug', score: 54 },
  { month: 'Sep', score: 60 },
  { month: 'Oct', score: 62 },
  { month: 'Nov', score: 65 },
  { month: 'Dec', score: 70 },
];

function ReportsPage() {

  const [searchMonth, setSearchMonth] = useState('');
  const [searchDate,  setSearchDate]  = useState('');

  // ── COMPUTED STATS ─────────────────────────────────────────
  const totalLearners   = LEARNERS.length;
  const maleLearners    = LEARNERS.filter(l => l.gender === 'Male').length;
  const femaleLearners  = LEARNERS.filter(l => l.gender === 'Female').length;
  const totalPopulation = DEPARTMENTS.reduce((s, d) => s + (d.learners * 8), 0);
  const emiratiLearners = LEARNERS.filter(l => l.nationality === 'Emirati');
  const emiratiMale     = emiratiLearners.filter(l => l.gender === 'Male').length;
  const emiratiFemale   = emiratiLearners.filter(l => l.gender === 'Female').length;
  const totalDepts      = DEPARTMENTS.length;

  const completedCourses = COURSES.filter(c => c.status === 'Completed').length;
  const ongoingCourses   = COURSES.filter(c => c.status === 'Ongoing').length;
  const upcomingCourses  = COURSES.filter(c => c.status === 'Pending').length;

  const avgRating = (
    DEPARTMENTS.reduce((s, d) => s + d.score, 0) / DEPARTMENTS.length
  );
  const ratingsPercent = Math.round((avgRating / 5) * 100);

  // NPS Score — calculated from course satisfaction
  const npsScore = COURSES
    .filter(c => c.nps > 0)
    .reduce((s, c, _, arr) => s + c.nps / arr.length, 0);

  // Most popular courses — sorted by enrolled
  const popularCourses = [...COURSES]
    .sort((a, b) => b.enrolled - a.enrolled)
    .slice(0, 5);

  // Donut chart data for Emirati learners
  const emiratiDonutData = [
    { name: 'Male',   value: emiratiMale   || 2 },
    { name: 'Female', value: emiratiFemale || 1 },
  ];

  // Department ratings bar chart data
  const deptRatingsData = DEPARTMENTS.map(d => ({
    name: d.name.split(' ')[0], // short name for chart
    score: d.score,
  }));

  return (
    <div style={styles.page}>

      {/* ── PAGE HEADER ── */}
      <div style={styles.pageHeader}>
        <h1 style={styles.pageTitle}>Reports</h1>
        <div style={styles.searchRow}>
          <div style={styles.searchWrap}>
            <span>🔍</span>
            <input
              style={styles.searchInput}
              placeholder="Search by month"
              value={searchMonth}
              onChange={e => setSearchMonth(e.target.value)}
            />
          </div>
          <div style={styles.searchWrap}>
            <span>🔍</span>
            <input
              style={styles.searchInput}
              placeholder="Search by Date"
              value={searchDate}
              type="date"
              onChange={e => setSearchDate(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* ── ROW 1: 4 BIG STAT CARDS ── */}
      <div style={styles.statGrid}>
        <StatCard label="Total Population" value={totalPopulation} />
        <StatCard label="Total Learners"   value={totalLearners}   />
        <StatCard label="Male Learners"    value={maleLearners}    />
        <StatCard label="Female Learners"  value={femaleLearners}  />
      </div>

      {/* ── ROW 2: Emirati Donut + Courses + NPS + Departments ── */}
      <div style={styles.row2}>

        {/* Emirati Learners Donut */}
        <div style={styles.card}>
          <div style={styles.cardTitle}>Emirati Learners</div>
          <div style={styles.donutWrap}>
            {/* WHY PieChart with innerRadius? */}
            {/* innerRadius makes it a donut instead of a full pie. */}
            {/* The hole in the middle shows the total number. */}
            <div style={{ position: 'relative' }}>
              <PieChart width={160} height={160}>
                <Pie
                  data={emiratiDonutData}
                  cx={75} cy={75}
                  innerRadius={50}
                  outerRadius={75}
                  dataKey="value"
                  startAngle={90}
                  endAngle={-270}
                >
                  <Cell fill="#051c2c" />
                  <Cell fill="#b6bdc2" />
                </Pie>
              </PieChart>
              {/* Center number overlay */}
              <div style={styles.donutCenter}>
                <span style={styles.donutNum}>{emiratiLearners.length}</span>
              </div>
            </div>
            <div style={styles.donutLegend}>
              <div style={styles.legendRow}>
                <span style={{ ...styles.legendDot, background: '#051c2c' }} />
                <span style={styles.legendText}>{emiratiMale || 2} Male</span>
              </div>
              <div style={styles.legendRow}>
                <span style={{ ...styles.legendDot, background: '#b6bdc2' }} />
                <span style={styles.legendText}>{emiratiFemale || 1} Female</span>
              </div>
            </div>
          </div>
        </div>

        {/* Total Courses Breakdown */}
        <div style={styles.card}>
          <div style={styles.cardTitle}>Total Courses</div>
          <div style={styles.bigNum}>{COURSES.length}</div>
          <div style={styles.courseBreakdown}>
            {[
              { label: 'Completed',             value: completedCourses, color: '#051c2c' },
              { label: 'Ongoing',               value: ongoingCourses,   color: '#5a6878' },
              { label: 'Upcoming (Next 30 Days)',value: upcomingCourses,  color: '#b6bdc2' },
            ].map(item => (
              <div key={item.label} style={styles.breakdownRow}>
                <span style={{
                  ...styles.breakdownDot,
                  background: item.color,
                }} />
                <span style={styles.breakdownLabel}>{item.label}</span>
                <span style={styles.breakdownValue}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* NPS Score */}
        <div style={styles.card}>
          <div style={styles.cardTitle}>NPS Score</div>
          {/* Custom circular NPS display */}
          <div style={styles.npsWrap}>
            <div style={styles.npsCircle}>
              <div style={styles.npsInner}>
                <span style={styles.npsNum}>
                  +{Math.round(npsScore) || 45}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Total Departments */}
        <div style={styles.card}>
          <div style={styles.cardTitle}>Total Departments</div>
          <div style={styles.bigNum}>{totalDepts}</div>

          {/* Department ratings mini bar chart */}
          <ResponsiveContainer width="100%" height={100}>
            <BarChart
              data={deptRatingsData}
              layout="vertical"
              barSize={8}
              margin={{ left: 0, right: 10, top: 0, bottom: 0 }}
            >
              <XAxis type="number" hide domain={[0, 5]} />
              <YAxis
                type="category" dataKey="name"
                tick={{ fontSize: 10, fill: '#9baabb' }}
                axisLine={false} tickLine={false} width={40}
              />
              <Bar dataKey="score" fill="#051c2c" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>

          <div style={styles.ratingsWrap}>
            <span style={styles.ratingsLabel}>Ratings</span>
            <span style={styles.ratingsValue}>{ratingsPercent}%</span>
          </div>
        </div>

      </div>

      {/* ── ROW 3: Popular Courses + Satisfaction Chart ── */}
      <div style={styles.row3}>

        {/* Most Popular Courses */}
        <div style={styles.card}>
          <div style={styles.cardTitle}>Most Popular Courses</div>
          {popularCourses.map((course, i) => (
            <div key={course.id} style={styles.popularRow}>
              <span style={styles.popularNum}>{i + 1}</span>
              <span style={styles.popularName}>{course.title}</span>
              <span style={styles.popularEnrolled}>
                {course.enrolled} enrolled
              </span>
            </div>
          ))}
        </div>

        {/* Satisfaction Score Line Chart */}
        <div style={{ ...styles.card, flex: 2 }}>
          <div style={styles.cardTitle}>Satisfaction Score</div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={satisfactionData}>
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11, fill: '#9baabb' }}
                axisLine={false} tickLine={false}
              />
              <YAxis
                domain={[20, 80]}
                tick={{ fontSize: 11, fill: '#9baabb' }}
                axisLine={false} tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  fontSize: '12px', borderRadius: '8px',
                  border: '1px solid #e8ecf0',
                }}
              />
              {/* WHY type="monotone"? */}
              {/* This makes the line curve smoothly between points */}
              {/* instead of making sharp angular turns. */}
              <Line
                type="monotone"
                dataKey="score"
                stroke="#051c2c"
                strokeWidth={2.5}
                dot={{ fill: '#051c2c', r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

      </div>

    </div>
  );
}

// ── STAT CARD ────────────────────────────────────────────────
function StatCard({ label, value }) {
  return (
    <div style={styles.statCard}>
      <div style={styles.statLabel}>{label}</div>
      <div style={styles.statValue}>{value}</div>
    </div>
  );
}

// ── STYLES ───────────────────────────────────────────────────
const styles = {
  page: {
    padding: '30px', minHeight: '100vh',
    background: '#f2f4f6', fontFamily: 'Inter, sans-serif',
  },
  pageHeader: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: '22px', flexWrap: 'wrap', gap: '12px',
  },
  pageTitle: {
    fontSize: '26px', fontWeight: '700',
    color: '#051c2c', letterSpacing: '-0.3px', margin: 0,
  },
  searchRow: { display: 'flex', gap: '10px' },
  searchWrap: {
    display: 'flex', alignItems: 'center',
    background: '#ffffff', border: '1.5px solid #e8ecf0',
    borderRadius: '8px', padding: '0 12px', gap: '6px',
  },
  searchInput: {
    border: 'none', outline: 'none', fontSize: '13px',
    padding: '9px 0', width: '160px', background: 'transparent',
    fontFamily: 'Inter, sans-serif',
  },

  // Stat cards
  statGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '14px', marginBottom: '20px',
  },
  statCard: {
    background: '#ffffff', borderRadius: '12px',
    border: '1px solid #e8ecf0', padding: '20px 22px',
  },
  statLabel: {
    fontSize: '13px', fontWeight: '600',
    color: '#051c2c', marginBottom: '8px',
  },
  statValue: {
    fontSize: '36px', fontWeight: '800',
    color: '#051c2c', lineHeight: 1, letterSpacing: '-1px',
  },

  // Row 2 — 4 cards
  row2: {
    display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '16px', marginBottom: '20px',
  },

  // Row 3 — popular courses + chart
  row3: {
    display: 'grid', gridTemplateColumns: '1fr 2fr',
    gap: '16px',
  },

  // Generic card
  card: {
    background: '#ffffff', borderRadius: '12px',
    border: '1px solid #e8ecf0', padding: '20px',
  },
  cardTitle: {
    fontSize: '14px', fontWeight: '700',
    color: '#051c2c', marginBottom: '14px',
    paddingBottom: '10px', borderBottom: '1px solid #f0f2f4',
  },
  bigNum: {
    fontSize: '36px', fontWeight: '800',
    color: '#051c2c', lineHeight: 1, marginBottom: '14px',
  },

  // Donut chart
  donutWrap: {
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', gap: '10px',
  },
  donutCenter: {
    position: 'absolute', top: '50%', left: '50%',
    transform: 'translate(-50%, -50%)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  donutNum: {
    fontSize: '22px', fontWeight: '800', color: '#051c2c',
  },
  donutLegend: { display: 'flex', gap: '16px' },
  legendRow: { display: 'flex', alignItems: 'center', gap: '5px' },
  legendDot: {
    width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0,
  },
  legendText: { fontSize: '11px', color: '#5a6878', fontWeight: '500' },

  // Courses breakdown
  courseBreakdown: { display: 'flex', flexDirection: 'column', gap: '8px' },
  breakdownRow: {
    display: 'flex', alignItems: 'center', gap: '8px',
  },
  breakdownDot: {
    width: '10px', height: '10px', borderRadius: '50%', flexShrink: 0,
  },
  breakdownLabel: { fontSize: '12px', color: '#5a6878', flex: 1 },
  breakdownValue: { fontSize: '13px', fontWeight: '700', color: '#051c2c' },

  // NPS
  npsWrap: {
    display: 'flex', justifyContent: 'center',
    alignItems: 'center', padding: '10px 0',
  },
  npsCircle: {
    width: '100px', height: '100px', borderRadius: '50%',
    background: 'conic-gradient(#051c2c 0% 75%, #e8ecf0 75% 100%)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  npsInner: {
    width: '74px', height: '74px', borderRadius: '50%',
    background: '#ffffff', display: 'flex',
    alignItems: 'center', justifyContent: 'center',
  },
  npsNum: {
    fontSize: '20px', fontWeight: '800', color: '#051c2c',
  },

  // Department ratings
  ratingsWrap: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', marginTop: '8px',
    paddingTop: '8px', borderTop: '1px solid #f0f2f4',
  },
  ratingsLabel: { fontSize: '12px', color: '#5a6878', fontWeight: '500' },
  ratingsValue: {
    fontSize: '20px', fontWeight: '800', color: '#051c2c',
  },

  // Popular courses
  popularRow: {
    display: 'flex', alignItems: 'center', gap: '10px',
    padding: '8px 0', borderBottom: '1px solid #f0f2f4',
  },
  popularNum: {
    width: '20px', height: '20px', borderRadius: '50%',
    background: '#f2f4f6', display: 'flex', alignItems: 'center',
    justifyContent: 'center', fontSize: '11px', fontWeight: '700',
    color: '#5a6878', flexShrink: 0,
  },
  popularName: {
    fontSize: '13px', fontWeight: '500',
    color: '#051c2c', flex: 1,
  },
  popularEnrolled: { fontSize: '11px', color: '#9baabb' },
};

export default ReportsPage;