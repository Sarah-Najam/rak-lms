import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, BarChart, Bar,
  PieChart, Pie, Cell,
} from 'recharts';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import api from '../api';

const satisfactionData = [
  { month: 'Jan', score: 40 }, { month: 'Feb', score: 45 },
  { month: 'Mar', score: 42 }, { month: 'Apr', score: 44 },
  { month: 'May', score: 55 }, { month: 'Jun', score: 52 },
  { month: 'Jul', score: 58 }, { month: 'Aug', score: 54 },
  { month: 'Sep', score: 60 }, { month: 'Oct', score: 62 },
  { month: 'Nov', score: 65 }, { month: 'Dec', score: 70 },
];

function ReportsPage() {

  const [stats,        setStats]        = useState(null);
  const [departments,  setDepartments]  = useState([]);
  const [learners,     setLearners]     = useState([]);
  const [courses,      setCourses]      = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [exporting,    setExporting]    = useState(false);
  const [searchMonth,  setSearchMonth]  = useState('');

  useEffect(() => {
    Promise.all([
      api.getReports(),
      api.getDepartments(),
      api.getLearners(),
      api.getCourses(),
    ]).then(([s, d, l, c]) => {
      setStats(s);
      if (Array.isArray(d)) setDepartments(d);
      if (Array.isArray(l)) setLearners(l);
      if (Array.isArray(c)) setCourses(c);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleExportExcel = async () => {
    setExporting(true);
    try {
      const wb = XLSX.utils.book_new();

      // ── SHEET 1: Summary ──────────────────────────────────
      const summaryData = [
        ['RAK Properties LMS — Report Export'],
        ['Generated on', new Date().toLocaleDateString('en-GB')],
        [],
        ['METRIC', 'VALUE'],
        ['Total Population',    stats?.totalPopulation  || 0],
        ['Total Learners',      stats?.totalLearners    || 0],
        ['Male Learners',       stats?.maleLearners     || 0],
        ['Female Learners',     stats?.femaleLearners   || 0],
        ['Emirati Learners',    stats?.emiratiLearners  || 0],
        ['Total Departments',   stats?.totalDepts       || 0],
        ['Total Courses',       stats?.totalCourses     || 0],
        ['Completed Courses',   stats?.completedCourses || 0],
        ['Ongoing Courses',     stats?.ongoingCourses   || 0],
        ['Pending Courses',     stats?.pendingCourses   || 0],
        ['Average NPS Score',   stats?.avgNps           || 0],
      ];
      const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
      wsSummary['!cols'] = [{ wch: 30 }, { wch: 20 }];
      XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');

      // ── SHEET 2: Learners ─────────────────────────────────
      const learnersHeaders = [
        'Emp ID', 'Name', 'Gender', 'Nationality',
        'Department', 'Designation', 'Email', 'Status', 'Joined',
      ];
      const learnersRows = learners.map(l => [
        l.emp_id        || '',
        l.name          || '',
        l.gender        || '',
        l.nationality   || '',
        l.department_name || '',
        l.designation   || '',
        l.email         || '',
        l.status        || '',
        l.created_at
          ? new Date(l.created_at).toLocaleDateString('en-GB') : '',
      ]);
      const wsLearners = XLSX.utils.aoa_to_sheet([learnersHeaders, ...learnersRows]);
      wsLearners['!cols'] = [
        { wch: 12 }, { wch: 25 }, { wch: 10 }, { wch: 15 },
        { wch: 22 }, { wch: 25 }, { wch: 30 }, { wch: 12 }, { wch: 12 },
      ];
      XLSX.utils.book_append_sheet(wb, wsLearners, 'Learners');

      // ── SHEET 3: Courses ──────────────────────────────────
      const coursesHeaders = [
        'Title', 'Institute', 'Trainer', 'Type', 'Status',
        'Start Date', 'End Date', 'Duration (Hours)', 'Duration (Days)',
        'Max Learners', 'Enrolled', 'Attended', 'Participation Rate',
        'Cost Estimated (AED)', 'Budget Realized (AED)',
        'PO #', 'PR #', 'Venue',
      ];
      const coursesRows = courses.map(c => {
        const enrolled = +c.enrolled_count || 0;
        const attended = +c.attended_count || 0;
        const rate     = enrolled > 0
          ? Math.round(attended / enrolled * 100) + '%' : '—';
        return [
          c.title              || '',
          c.institute          || '',
          c.trainer_name       || '',
          c.type               || '',
          c.status             || '',
          c.start_date
            ? new Date(c.start_date).toLocaleDateString('en-GB') : '',
          c.end_date
            ? new Date(c.end_date).toLocaleDateString('en-GB') : '',
          c.duration_hours     || 0,
          c.duration_days      || 0,
          c.max_learners       || '',
          enrolled,
          attended,
          rate,
          +c.cost_estimated    || 0,
          +c.budget_realized   || 0,
          c.po_number          || '',
          c.pr_number          || '',
          c.venue              || '',
        ];
      });
      const wsCourses = XLSX.utils.aoa_to_sheet([coursesHeaders, ...coursesRows]);
      wsCourses['!cols'] = [
        { wch: 35 }, { wch: 20 }, { wch: 20 }, { wch: 12 }, { wch: 12 },
        { wch: 12 }, { wch: 12 }, { wch: 18 }, { wch: 16 }, { wch: 14 },
        { wch: 10 }, { wch: 10 }, { wch: 18 }, { wch: 22 }, { wch: 22 },
        { wch: 15 }, { wch: 15 }, { wch: 25 },
      ];
      XLSX.utils.book_append_sheet(wb, wsCourses, 'Courses');

      // ── SHEET 4: Departments ──────────────────────────────
      const deptsHeaders = [
        'Department', 'Head of Department', 'Designation',
        'Population', 'Active Learners', 'Total Enrollments',
      ];
      const deptsRows = departments.map(d => [
        d.name          || '',
        d.hod           || '',
        d.designation   || '',
        d.population    || 0,
        d.learner_count || 0,
        d.course_count  || 0,
      ]);
      const wsDepts = XLSX.utils.aoa_to_sheet([deptsHeaders, ...deptsRows]);
      wsDepts['!cols'] = [
        { wch: 25 }, { wch: 25 }, { wch: 20 },
        { wch: 12 }, { wch: 16 }, { wch: 20 },
      ];
      XLSX.utils.book_append_sheet(wb, wsDepts, 'Departments');

      // ── SHEET 5: Emirati Learners ─────────────────────────
      const emiratiLearners = learners.filter(l => l.nationality === 'Emirati');
      const emiratiHeaders  = [
        'Emp ID', 'Name', 'Gender', 'Department', 'Designation', 'Status',
      ];
      const emiratiRows = emiratiLearners.map(l => [
        l.emp_id          || '',
        l.name            || '',
        l.gender          || '',
        l.department_name || '',
        l.designation     || '',
        l.status          || '',
      ]);
      const wsEmirati = XLSX.utils.aoa_to_sheet([emiratiHeaders, ...emiratiRows]);
      wsEmirati['!cols'] = [
        { wch: 12 }, { wch: 25 }, { wch: 10 },
        { wch: 22 }, { wch: 25 }, { wch: 12 },
      ];
      XLSX.utils.book_append_sheet(wb, wsEmirati, 'Emirati Learners');

      // ── Save the file ─────────────────────────────────────
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob        = new Blob([excelBuffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const fileName = `RAK_LMS_Report_${new Date().toLocaleDateString('en-GB').replace(/\//g, '-')}.xlsx`;
      saveAs(blob, fileName);

    } catch (err) {
      alert('Error generating Excel file: ' + err.message);
    }
    setExporting(false);
  };

  if (loading) return (
    <div style={{ padding: '40px', textAlign: 'center', color: '#9baabb', fontSize: '14px' }}>
      Loading reports...
    </div>
  );

  const emiratiDonutData = [
    { name: 'Male',   value: Math.ceil((stats?.emiratiLearners  || 0) * 0.6) || 1 },
    { name: 'Female', value: Math.floor((stats?.emiratiLearners || 0) * 0.4) || 1 },
  ];

  const deptRatingsData = departments.map(d => ({
    name:  d.name.split(' ')[0],
    count: +d.learner_count || 0,
  }));

  return (
    <div style={styles.page}>

      {/* ── PAGE HEADER ── */}
      <div style={styles.pageHeader}>
        <div style={{ display: 'flex', gap: '10px' }}>
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
            <input style={styles.searchInput} placeholder="Search by Date" type="date" />
          </div>
        </div>
        <button
          style={styles.exportBtn}
          onClick={handleExportExcel}
          disabled={exporting}
        >
          {exporting ? '⏳ Exporting...' : '📥 Export to Excel'}
        </button>
      </div>

      {/* ── STAT CARDS ── */}
      <div style={styles.statGrid}>
        <StatCard label="Total Population"  value={stats?.totalPopulation  || 0} />
        <StatCard label="Total Learners"    value={stats?.totalLearners    || 0} />
        <StatCard label="Male Learners"     value={stats?.maleLearners     || 0} />
        <StatCard label="Female Learners"   value={stats?.femaleLearners   || 0} />
      </div>

      {/* ── ROW 2 ── */}
      <div style={styles.row2}>

        <div style={styles.card}>
          <div style={styles.cardTitle}>Emirati Learners</div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
            <div style={{ position: 'relative' }}>
              <PieChart width={160} height={160}>
                <Pie
                  data={emiratiDonutData} cx={75} cy={75}
                  innerRadius={50} outerRadius={75}
                  dataKey="value" startAngle={90} endAngle={-270}
                >
                  <Cell fill="#051c2c" />
                  <Cell fill="#b6bdc2" />
                </Pie>
              </PieChart>
              <div style={{
                position: 'absolute', top: '50%', left: '50%',
                transform: 'translate(-50%,-50%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ fontSize: '22px', fontWeight: '800', color: '#051c2c' }}>
                  {stats?.emiratiLearners || 0}
                </span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: '#5a6878' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#051c2c', display: 'inline-block' }} />
                {emiratiDonutData[0].value} Male
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: '#5a6878' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#b6bdc2', display: 'inline-block' }} />
                {emiratiDonutData[1].value} Female
              </div>
            </div>
          </div>
        </div>

        <div style={styles.card}>
          <div style={styles.cardTitle}>Total Courses</div>
          <div style={{ fontSize: '36px', fontWeight: '800', color: '#051c2c', lineHeight: 1, marginBottom: '14px' }}>
            {stats?.totalCourses || 0}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              ['Completed', stats?.completedCourses || 0, '#051c2c'],
              ['Ongoing',   stats?.ongoingCourses   || 0, '#5a6878'],
              ['Upcoming',  stats?.pendingCourses   || 0, '#b6bdc2'],
            ].map(([l, v, c]) => (
              <div key={l} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: c, flexShrink: 0 }} />
                <span style={{ fontSize: '12px', color: '#5a6878', flex: 1 }}>{l}</span>
                <span style={{ fontSize: '13px', fontWeight: '700', color: '#051c2c' }}>{v}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={styles.card}>
          <div style={styles.cardTitle}>NPS Score</div>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '10px 0' }}>
            <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'conic-gradient(#051c2c 0% 75%, #e8ecf0 75% 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: '74px', height: '74px', borderRadius: '50%', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '20px', fontWeight: '800', color: '#051c2c' }}>
                  +{stats?.avgNps || 0}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div style={styles.card}>
          <div style={styles.cardTitle}>Total Departments</div>
          <div style={{ fontSize: '36px', fontWeight: '800', color: '#051c2c', lineHeight: 1, marginBottom: '8px' }}>
            {stats?.totalDepts || 0}
          </div>
          <ResponsiveContainer width="100%" height={100}>
            <BarChart data={deptRatingsData} layout="vertical" barSize={8}
              margin={{ left: 0, right: 10, top: 0, bottom: 0 }}>
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="name"
                tick={{ fontSize: 10, fill: '#9baabb' }}
                axisLine={false} tickLine={false} width={40} />
              <Bar dataKey="count" fill="#051c2c" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

      </div>

      {/* ── ROW 3 ── */}
      <div style={styles.row3}>

        <div style={styles.card}>
          <div style={styles.cardTitle}>Most Active Departments</div>
          {departments.slice(0, 5).map((d, i) => (
            <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0', borderBottom: '1px solid #f0f2f4' }}>
              <span style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#f2f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '700', color: '#5a6878', flexShrink: 0 }}>
                {i + 1}
              </span>
              <span style={{ fontSize: '13px', fontWeight: '500', color: '#051c2c', flex: 1 }}>
                {d.name}
              </span>
              <span style={{ fontSize: '11px', color: '#9baabb' }}>
                {d.learner_count || 0} learners
              </span>
            </div>
          ))}
        </div>

        <div style={{ ...styles.card, flex: 2 }}>
          <div style={styles.cardTitle}>Satisfaction Score Trend</div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={satisfactionData}>
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9baabb' }} axisLine={false} tickLine={false} />
              <YAxis domain={[20, 80]} tick={{ fontSize: 11, fill: '#9baabb' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontSize: '12px', borderRadius: '8px', border: '1px solid #e8ecf0' }} />
              <Line type="monotone" dataKey="score" stroke="#051c2c" strokeWidth={2.5}
                dot={{ fill: '#051c2c', r: 3 }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

      </div>

    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e8ecf0', padding: '20px 22px' }}>
      <div style={{ fontSize: '13px', fontWeight: '600', color: '#051c2c', marginBottom: '8px' }}>{label}</div>
      <div style={{ fontSize: '36px', fontWeight: '800', color: '#051c2c', lineHeight: 1, letterSpacing: '-1px' }}>{value}</div>
    </div>
  );
}

const styles = {
  page:       { padding: '30px', minHeight: '100vh', background: '#f2f4f6', fontFamily: 'Inter, sans-serif' },
  pageHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px', flexWrap: 'wrap', gap: '12px' },
  searchWrap: { display: 'flex', alignItems: 'center', background: '#ffffff', border: '1.5px solid #e8ecf0', borderRadius: '8px', padding: '0 12px', gap: '6px' },
  searchInput:{ border: 'none', outline: 'none', fontSize: '13px', padding: '9px 0', width: '160px', background: 'transparent', fontFamily: 'Inter, sans-serif' },
  exportBtn:  { background: '#051c2c', color: '#ffffff', border: 'none', borderRadius: '8px', padding: '10px 20px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'Inter, sans-serif', display: 'flex', alignItems: 'center', gap: '6px' },
  statGrid:   { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '20px' },
  row2:       { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '20px' },
  row3:       { display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '16px' },
  card:       { background: '#ffffff', borderRadius: '12px', border: '1px solid #e8ecf0', padding: '20px' },
  cardTitle:  { fontSize: '14px', fontWeight: '700', color: '#051c2c', marginBottom: '14px', paddingBottom: '10px', borderBottom: '1px solid #f0f2f4' },
};

export default ReportsPage;