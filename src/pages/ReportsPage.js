import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
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

  const [stats,       setStats]       = useState(null);
  const [departments, setDepartments] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [searchMonth, setSearchMonth] = useState('');

  useEffect(() => {
    api.getReports()
      .then(data => { setStats(data); setLoading(false); })
      .catch(() => setLoading(false));

    api.getDepartments()
      .then(data => { if (Array.isArray(data)) setDepartments(data); });
  }, []);

  if (loading) return (
    <div style={{ padding: '40px', textAlign: 'center', color: '#9baabb', fontSize: '14px' }}>
      Loading reports...
    </div>
  );

  const emiratiDonutData = [
    { name: 'Male',   value: Math.ceil((stats?.emiratiLearners || 0) * 0.6) || 1 },
    { name: 'Female', value: Math.floor((stats?.emiratiLearners || 0) * 0.4) || 1 },
  ];

  const deptRatingsData = departments.map(d => ({
    name:  d.name.split(' ')[0],
    count: +d.learner_count || 0,
  }));

  return (
    <div style={styles.page}>

      <div style={styles.pageHeader}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <div style={styles.searchWrap}>
            <span>🔍</span>
            <input style={styles.searchInput} placeholder="Search by month"
              value={searchMonth} onChange={e => setSearchMonth(e.target.value)} />
          </div>
          <div style={styles.searchWrap}>
            <span>🔍</span>
            <input style={styles.searchInput} placeholder="Search by Date" type="date" />
          </div>
        </div>
      </div>

      <div style={styles.statGrid}>
        <StatCard label="Total Population"  value={stats?.totalPopulation  || 0} />
        <StatCard label="Total Learners"    value={stats?.totalLearners    || 0} />
        <StatCard label="Male Learners"     value={stats?.maleLearners     || 0} />
        <StatCard label="Female Learners"   value={stats?.femaleLearners   || 0} />
      </div>

      <div style={styles.row2}>

        <div style={styles.card}>
          <div style={styles.cardTitle}>Emirati Learners</div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
            <div style={{ position: 'relative' }}>
              <PieChart width={160} height={160}>
                <Pie data={emiratiDonutData} cx={75} cy={75} innerRadius={50} outerRadius={75} dataKey="value" startAngle={90} endAngle={-270}>
                  <Cell fill="#051c2c" />
                  <Cell fill="#b6bdc2" />
                </Pie>
              </PieChart>
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '22px', fontWeight: '800', color: '#051c2c' }}>{stats?.emiratiLearners || 0}</span>
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
          <div style={{ fontSize: '36px', fontWeight: '800', color: '#051c2c', lineHeight: 1, marginBottom: '14px' }}>{stats?.totalCourses || 0}</div>
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
                <span style={{ fontSize: '20px', fontWeight: '800', color: '#051c2c' }}>+{stats?.avgNps || 0}</span>
              </div>
            </div>
          </div>
        </div>

        <div style={styles.card}>
          <div style={styles.cardTitle}>Total Departments</div>
          <div style={{ fontSize: '36px', fontWeight: '800', color: '#051c2c', lineHeight: 1, marginBottom: '8px' }}>{stats?.totalDepts || 0}</div>
          <ResponsiveContainer width="100%" height={100}>
            <BarChart data={deptRatingsData} layout="vertical" barSize={8} margin={{ left: 0, right: 10, top: 0, bottom: 0 }}>
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#9baabb' }} axisLine={false} tickLine={false} width={40} />
              <Bar dataKey="count" fill="#051c2c" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

      </div>

      <div style={styles.row3}>
        <div style={styles.card}>
          <div style={styles.cardTitle}>Most Active Departments</div>
          {departments.slice(0, 5).map((d, i) => (
            <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0', borderBottom: '1px solid #f0f2f4' }}>
              <span style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#f2f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '700', color: '#5a6878', flexShrink: 0 }}>{i + 1}</span>
              <span style={{ fontSize: '13px', fontWeight: '500', color: '#051c2c', flex: 1 }}>{d.name}</span>
              <span style={{ fontSize: '11px', color: '#9baabb' }}>{d.learner_count || 0} learners</span>
            </div>
          ))}
        </div>

        <div style={{ ...styles.card, flex: 2 }}>
          <div style={styles.cardTitle}>Satisfaction Score</div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={satisfactionData}>
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9baabb' }} axisLine={false} tickLine={false} />
              <YAxis domain={[20, 80]} tick={{ fontSize: 11, fill: '#9baabb' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontSize: '12px', borderRadius: '8px', border: '1px solid #e8ecf0' }} />
              <Line type="monotone" dataKey="score" stroke="#051c2c" strokeWidth={2.5} dot={{ fill: '#051c2c', r: 3 }} activeDot={{ r: 5 }} />
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
  pageHeader: { display: 'flex', justifyContent: 'flex-end', marginBottom: '22px' },
  searchWrap: { display: 'flex', alignItems: 'center', background: '#ffffff', border: '1.5px solid #e8ecf0', borderRadius: '8px', padding: '0 12px', gap: '6px' },
  searchInput:{ border: 'none', outline: 'none', fontSize: '13px', padding: '9px 0', width: '160px', background: 'transparent', fontFamily: 'Inter, sans-serif' },
  statGrid:   { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '20px' },
  row2:       { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '20px' },
  row3:       { display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '16px' },
  card:       { background: '#ffffff', borderRadius: '12px', border: '1px solid #e8ecf0', padding: '20px' },
  cardTitle:  { fontSize: '14px', fontWeight: '700', color: '#051c2c', marginBottom: '14px', paddingBottom: '10px', borderBottom: '1px solid #f0f2f4' },
};

export default ReportsPage;