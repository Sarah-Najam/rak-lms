import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import api from '../api';

function ReportsPage() {

  const [stats,       setStats]       = useState(null);
  const [departments, setDepartments] = useState([]);
  const [learners,    setLearners]    = useState([]);
  const [courses,     setCourses]     = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [exporting,   setExporting]   = useState(false);
  const [drillDown,   setDrillDown]   = useState(null);

  const [startDate, setStartDate] = useState(
    new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split('T')[0]
  );

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadStats();
  }, [startDate, endDate]);

  const loadData = () => {
    Promise.all([
      api.getDepartments(),
      api.getLearners(),
      api.getCourses(),
    ]).then(([d, l, c]) => {
      if (Array.isArray(d)) setDepartments(d);
      if (Array.isArray(l)) setLearners(l);
      if (Array.isArray(c)) setCourses(c);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  const loadStats = () => {
    api.getReports({ startDate, endDate })
      .then(s => setStats(s))
      .catch(() => {});
  };

  // Filter courses by date range for display
  const filteredCourses = courses.filter(c => {
    const d = c.end_date || c.start_date;
    if (!d) return true;
    const date = new Date(d);
    return date >= new Date(startDate) && date <= new Date(endDate);
  });

  const handleExportExcel = async () => {
    setExporting(true);
    try {
      const wb = XLSX.utils.book_new();

      const summaryData = [
        ['RAK Properties LMS — Report Export'],
        ['Generated on', new Date().toLocaleDateString('en-GB')],
        ['Date Range', `${startDate} to ${endDate}`],
        [],
        ['METRIC', 'VALUE'],
        ['Total Population',           stats?.totalPopulation  || 0],
        ['Total Learners',             stats?.totalLearners    || 0],
        ['Active Learners',            stats?.activeLearners   || 0],
        ['Inactive Learners',          stats?.inactiveLearners || 0],
        ['Male Learners',              stats?.maleLearners     || 0],
        ['Female Learners',            stats?.femaleLearners   || 0],
        ['Emirati Learners',           stats?.emiratiLearners  || 0],
        ['Total Departments',          stats?.totalDepts       || 0],
        ['Total Courses',              filteredCourses.length],
        ['Total Enrolled (records)',   stats?.totalEnrolled    || 0],
        ['Total Attended (records)',   stats?.totalAttended    || 0],
        ['Participation Rate',         (stats?.participationRate || 0) + '%'],
        ['Total Training Hours',       stats?.totalTrainingHours || 0],
        ['Learners Trained (unique)',  stats?.totalLearnersTrainedThisYear || 0],
        ['Satisfaction Score',         (stats?.overallSatisfaction || 0) + '%'],
      ];
      const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
      wsSummary['!cols'] = [{ wch: 30 }, { wch: 20 }];
      XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');

      const learnersHeaders = ['Emp ID', 'Name', 'Gender', 'Nationality', 'Department', 'Designation', 'Email', 'Status', 'Joined'];
      const learnersRows = learners.map(l => [
        l.emp_id || '', l.name || '', l.gender || '', l.nationality || '',
        l.department_name || '', l.designation || '', l.email || '', l.status || '',
        l.created_at ? new Date(l.created_at).toLocaleDateString('en-GB') : '',
      ]);
      const wsLearners = XLSX.utils.aoa_to_sheet([learnersHeaders, ...learnersRows]);
      wsLearners['!cols'] = [{ wch: 12 }, { wch: 25 }, { wch: 10 }, { wch: 15 }, { wch: 22 }, { wch: 25 }, { wch: 30 }, { wch: 12 }, { wch: 12 }];
      XLSX.utils.book_append_sheet(wb, wsLearners, 'Learners');

      const coursesHeaders = ['Title', 'Training Type', 'Institute', 'Trainer', 'Type', 'Status', 'Start Date', 'End Date', 'Duration (Hours)', 'Enrolled', 'Attended', 'Participation Rate', 'Satisfaction Rate'];
      const coursesRows = filteredCourses.map(c => {
        const enrolled = +c.enrolled_count || 0;
        const attended = +c.attended_count || 0;
        const rate     = enrolled > 0 ? Math.round(attended / enrolled * 100) + '%' : '—';
        const sat      = +c.stars > 0 ? Math.round((+c.stars / 5) * 100) + '%' : '—';
        return [
          c.title || '', c.training_type || 'Developmental', c.institute || '', c.trainer_name || '',
          c.type || '', c.status || '',
          c.start_date ? new Date(c.start_date).toLocaleDateString('en-GB') : '',
          c.end_date ? new Date(c.end_date).toLocaleDateString('en-GB') : '',
          c.duration_hours || 0, enrolled, attended, rate, sat,
        ];
      });
      const wsCourses = XLSX.utils.aoa_to_sheet([coursesHeaders, ...coursesRows]);
      wsCourses['!cols'] = [{ wch: 35 }, { wch: 16 }, { wch: 20 }, { wch: 20 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 16 }, { wch: 10 }, { wch: 10 }, { wch: 18 }, { wch: 18 }];
      XLSX.utils.book_append_sheet(wb, wsCourses, 'Courses');

      const deptsHeaders = ['Department', 'Active Learners', 'Enrolled Records', 'Attended Records'];
      const deptsRows = (stats?.mostActiveDepartments || []).map(d => [
        d.name || '', d.learner_count || 0, d.enrolled_count || 0, d.attended_count || 0,
      ]);
      const wsDepts = XLSX.utils.aoa_to_sheet([deptsHeaders, ...deptsRows]);
      wsDepts['!cols'] = [{ wch: 25 }, { wch: 16 }, { wch: 18 }, { wch: 18 }];
      XLSX.utils.book_append_sheet(wb, wsDepts, 'Departments');

      const emiratiLearners = learners.filter(l => l.nationality === 'Emirati');
      const emiratiHeaders  = ['Emp ID', 'Name', 'Gender', 'Department', 'Designation', 'Status'];
      const emiratiRows = emiratiLearners.map(l => [
        l.emp_id || '', l.name || '', l.gender || '', l.department_name || '', l.designation || '', l.status || '',
      ]);
      const wsEmirati = XLSX.utils.aoa_to_sheet([emiratiHeaders, ...emiratiRows]);
      wsEmirati['!cols'] = [{ wch: 12 }, { wch: 25 }, { wch: 10 }, { wch: 22 }, { wch: 25 }, { wch: 12 }];
      XLSX.utils.book_append_sheet(wb, wsEmirati, 'Emirati Learners');

      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, `RAK_LMS_Report_${startDate}_to_${endDate}.xlsx`);
    } catch (err) {
      alert('Error generating Excel: ' + err.message);
    }
    setExporting(false);
  };

  if (loading || !stats) return (
    <div style={{ padding: '40px', textAlign: 'center', color: '#9baabb' }}>
      Loading reports...
    </div>
  );

  const mostActiveDepartments = stats.mostActiveDepartments || [];

  // Drill-down data resolvers
  const drillDownData = {
    totalLearners:    { title: 'Total Learners', rows: learners.map(l => [l.name, l.emp_id, l.department_name || '—', l.status]) , headers: ['Name', 'Emp ID', 'Department', 'Status'] },
    activeLearners:   { title: 'Active Learners', rows: learners.filter(l => l.status === 'Active').map(l => [l.name, l.emp_id, l.department_name || '—']), headers: ['Name', 'Emp ID', 'Department'] },
    inactiveLearners: { title: 'Inactive Learners', rows: learners.filter(l => l.status !== 'Active').map(l => [l.name, l.emp_id, l.department_name || '—', l.status]), headers: ['Name', 'Emp ID', 'Department', 'Status'] },
    totalCourses:     { title: 'Total Courses', rows: filteredCourses.map(c => [c.title, c.training_type || 'Developmental', c.status]), headers: ['Course', 'Training Type', 'Status'] },
    totalDepts:       { title: 'Total Departments', rows: departments.map(d => [d.name, d.hod || '—', d.learner_count || 0]), headers: ['Department', 'Head', 'Learners'] },
    emiratiLearners:  { title: 'Emirati Learners', rows: learners.filter(l => l.nationality === 'Emirati').map(l => [l.name, l.emp_id, l.department_name || '—']), headers: ['Name', 'Emp ID', 'Department'] },
  };

  const openDrillDown = (key) => {
    if (drillDownData[key]) setDrillDown(drillDownData[key]);
  };

  return (
    <div style={styles.page}>

      {/* ── HEADER ── */}
      <div style={styles.pageHeader}>
        <div style={{ fontSize: '20px', fontWeight: '700', color: '#051c2c' }}>
          Reports
        </div>
        <div style={styles.headerControls}>
          <div style={styles.dateFilterPair}>
            <span style={{ fontSize: '11px', color: '#5a6878', fontWeight: '600' }}>From</span>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={styles.dateInput} />
            <span style={{ fontSize: '11px', color: '#5a6878', fontWeight: '600' }}>To</span>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} style={styles.dateInput} />
          </div>
          <button style={styles.exportBtn} onClick={handleExportExcel} disabled={exporting}>
            {exporting ? '⏳ Exporting...' : '📥 Export to Excel'}
          </button>
        </div>
      </div>

      {/* ── ROW 1: PRIMARY STAT CARDS (clickable) ── */}
      <div style={styles.statGrid}>
        <StatCard icon="🎓" num={stats.totalLearners} label="Total Learners" color="#051C2C" onClick={() => openDrillDown('totalLearners')} />
        <StatCard icon="✅" num={stats.activeLearners} label="Active Learners" color="#7a9e7a" onClick={() => openDrillDown('activeLearners')} />
        <StatCard icon="⛔" num={stats.inactiveLearners} label="Inactive Learners" color="#AF5F46" onClick={() => openDrillDown('inactiveLearners')} />
        <StatCard icon="📚" num={stats.totalCourses} label="Total Courses" color="#6a9ea8" onClick={() => openDrillDown('totalCourses')} />
      </div>

      <div style={styles.statGrid}>
        <StatCard icon="📝" num={stats.totalEnrolled} label="Enrolled" color="#0369a1" sub="assigned to a course" />
        <StatCard icon="🎯" num={stats.totalAttended} label="Attended" color="#15803d" sub="completed training" />
        <StatCard icon="📊" num={stats.participationRate + '%'} label="Participation Rate" color="#a16207" sub="attended ÷ enrolled" />
        <StatCard icon="⏱️" num={stats.totalTrainingHours + 'h'} label="Total Training Hours" color="#7c3aed" />
      </div>

      {/* ── ROW 2 ── */}
      <div style={styles.row2}>

        <div style={styles.card}>
          <div style={styles.cardTitle}>Emirati Learners</div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={() => openDrillDown('emiratiLearners')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            >
              <div style={{ position: 'relative', width: '130px', height: '130px' }}>
                <svg viewBox="0 0 130 130" style={{ width: '130px', height: '130px', transform: 'rotate(-90deg)' }}>
                  <circle cx="65" cy="65" r="54" fill="none" stroke="#e8ecf0" strokeWidth="12" />
                  <circle
                    cx="65" cy="65" r="54" fill="none" stroke="#051c2c" strokeWidth="12"
                    strokeDasharray={`${2 * Math.PI * 54 * (stats.totalLearners > 0 ? stats.emiratiLearners / stats.totalLearners : 0)} ${2 * Math.PI * 54}`}
                    strokeLinecap="round"
                  />
                </svg>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: '26px', fontWeight: '800', color: '#051c2c' }}>{stats.emiratiLearners}</span>
                </div>
              </div>
            </button>
            <div style={{ fontSize: '11px', color: '#9baabb' }}>
              {stats.totalLearners > 0 ? Math.round((stats.emiratiLearners / stats.totalLearners) * 100) : 0}% of total learners
            </div>
          </div>
        </div>

        <div style={styles.card}>
          <div style={styles.cardTitle}>Course Status Breakdown</div>
          <div style={{ fontSize: '32px', fontWeight: '800', color: '#051c2c', lineHeight: 1, marginBottom: '14px' }}>
            {stats.totalCourses}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              ['Completed', stats.completedCourses, '#051c2c'],
              ['Ongoing',   stats.ongoingCourses,   '#5a6878'],
              ['Pending',   stats.pendingCourses,   '#b6bdc2'],
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
          <div style={styles.cardTitle}>Satisfaction Score</div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '6px 0' }}>
            <div style={{ position: 'relative', width: '110px', height: '110px' }}>
              <svg viewBox="0 0 110 110" style={{ width: '110px', height: '110px', transform: 'rotate(-90deg)' }}>
                <circle cx="55" cy="55" r="46" fill="none" stroke="#e8ecf0" strokeWidth="10" />
                <circle
                  cx="55" cy="55" r="46" fill="none" stroke="#051c2c" strokeWidth="10"
                  strokeDasharray={`${2 * Math.PI * 46 * stats.overallSatisfaction / 100} ${2 * Math.PI * 46}`}
                  strokeLinecap="round"
                />
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '20px', fontWeight: '800', color: '#051c2c', lineHeight: 1 }}>
                  {stats.overallSatisfaction}%
                </span>
                <span style={{ fontSize: '12px', color: '#c8973a', marginTop: '2px' }}>
                  {'★'.repeat(Math.round(stats.overallSatisfaction / 20))}
                </span>
              </div>
            </div>
            <div style={{ fontSize: '11px', color: '#9baabb' }}>Avg of all rated courses in range</div>
          </div>
        </div>

        <div style={styles.card}>
          <button
            onClick={() => openDrillDown('totalDepts')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, width: '100%', textAlign: 'left' }}
          >
            <div style={styles.cardTitle}>Total Departments</div>
            <div style={{ fontSize: '32px', fontWeight: '800', color: '#051c2c', lineHeight: 1, marginBottom: '8px' }}>
              {stats.totalDepts}
            </div>
          </button>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '90px', overflowY: 'auto' }}>
            {departments.slice(0, 4).map(d => (
              <div key={d.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                <span style={{ color: '#5a6878', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '140px' }}>
                  {d.name}
                </span>
                <span style={{ color: '#051c2c', fontWeight: '700', flexShrink: 0 }}>
                  {d.learner_count || 0}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ── ROW 3: MOST ACTIVE DEPARTMENTS + SATISFACTION TREND ── */}
      <div style={styles.row3}>

        <div style={styles.card}>
          <div style={styles.cardTitle}>Most Active Departments</div>
          <div style={{ fontSize: '10px', color: '#9baabb', marginBottom: '12px' }}>
            Sorted by attended courses
          </div>
          {mostActiveDepartments.slice(0, 6).map((d, i) => (
            <div key={d.id} style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '9px 0', borderBottom: '1px solid #f0f2f4',
            }}>
              <span style={{
                width: '22px', height: '22px', borderRadius: '50%',
                background: i === 0 ? '#fef9c3' : '#f2f4f6',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '11px', fontWeight: '700',
                color: i === 0 ? '#a16207' : '#5a6878', flexShrink: 0,
              }}>
                {i + 1}
              </span>
              <span style={{ fontSize: '13px', fontWeight: '500', color: '#051c2c', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {d.name}
              </span>
              <span style={{ fontSize: '11px', fontWeight: '700', color: '#15803d' }}>
                {d.attended_count} attended
              </span>
            </div>
          ))}
          {mostActiveDepartments.length === 0 && (
            <div style={{ padding: '20px', textAlign: 'center', color: '#9baabb', fontSize: '13px' }}>
              No department activity in this range.
            </div>
          )}
        </div>

        <div style={{ ...styles.card, flex: 2 }}>
          <div style={styles.cardTitle}>Satisfaction Score Trend</div>
          {(stats.satisfactionTrend || []).some(d => d.score > 0) ? (
            <MiniLineChart data={stats.satisfactionTrend} />
          ) : (
            <div style={{ padding: '40px', textAlign: 'center', color: '#9baabb', fontSize: '13px' }}>
              No satisfaction data yet. Rate courses to see the trend.
            </div>
          )}
        </div>

      </div>

      {/* ── DRILL DOWN POPUP ── */}
      {drillDown && (
        <div style={styles.overlay} onClick={() => setDrillDown(null)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <span style={styles.modalTitle}>{drillDown.title}</span>
              <button style={styles.modalClose} onClick={() => setDrillDown(null)}>×</button>
            </div>
            <div style={styles.modalBody}>
              <div style={{ fontSize: '12px', color: '#9baabb', marginBottom: '12px' }}>
                {drillDown.rows.length} record{drillDown.rows.length !== 1 ? 's' : ''}
              </div>
              <div style={{ overflowX: 'auto', maxHeight: '420px', overflowY: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#f8f9fa', borderBottom: '1px solid #e8ecf0' }}>
                      {drillDown.headers.map(h => (
                        <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontSize: '10px', fontWeight: '700', color: '#9baabb', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {drillDown.rows.map((row, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #f0f2f4' }}>
                        {row.map((cell, j) => (
                          <td key={j} style={{ padding: '9px 12px', fontSize: '13px', color: '#051c2c' }}>
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {drillDown.rows.length === 0 && (
                  <div style={{ padding: '30px', textAlign: 'center', color: '#9baabb', fontSize: '13px' }}>
                    No records found.
                  </div>
                )}
              </div>
            </div>
            <div style={styles.modalFooter}>
              <button style={styles.cancelBtn} onClick={() => setDrillDown(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

function StatCard({ icon, num, label, color, sub, onClick }) {
  const Wrapper = onClick ? 'button' : 'div';
  return (
    <Wrapper
      onClick={onClick}
      style={{
        background: color, borderRadius: '14px', padding: '18px 20px',
        display: 'flex', flexDirection: 'column', gap: '6px',
        border: 'none', cursor: onClick ? 'pointer' : 'default',
        textAlign: 'left', fontFamily: 'Inter, sans-serif', width: '100%',
      }}
    >
      <div style={{ fontSize: '20px', marginBottom: '2px' }}>{icon}</div>
      <div style={{ fontSize: '30px', fontWeight: '800', color: '#ffffff', lineHeight: 1, letterSpacing: '-1px' }}>
        {num}
      </div>
      <div style={{ fontSize: '12.5px', color: 'rgba(255,255,255,0.8)', fontWeight: '500' }}>
        {label}
      </div>
      {sub && (
        <div style={{ fontSize: '10.5px', color: 'rgba(255,255,255,0.55)' }}>{sub}</div>
      )}
      {onClick && (
        <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', marginTop: '2px' }}>
          Click to view details →
        </div>
      )}
    </Wrapper>
  );
}

function MiniLineChart({ data }) {
  const max = 100;
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = 100 - (d.score / max) * 100;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ width: '100%', height: '180px' }}>
        <polyline points={points} fill="none" stroke="#051c2c" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
        {data.map((d, i) => {
          const x = (i / (data.length - 1)) * 100;
          const y = 100 - (d.score / max) * 100;
          return d.score > 0 ? (
            <circle key={i} cx={x} cy={y} r="1.6" fill="#051c2c" vectorEffect="non-scaling-stroke" />
          ) : null;
        })}
      </svg>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
        {data.map((d, i) => (
          <span key={i} style={{ fontSize: '10px', color: '#9baabb', flex: 1, textAlign: 'center' }}>
            {d.month || d.quarter}
          </span>
        ))}
      </div>
    </div>
  );
}

const styles = {
  page:           { padding: '30px', minHeight: '100vh', background: '#f2f4f6', fontFamily: 'Inter, sans-serif' },
  pageHeader:     { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' },
  headerControls: { display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' },
  dateFilterPair: { display: 'flex', alignItems: 'center', gap: '8px', background: '#ffffff', border: '1.5px solid #e8ecf0', borderRadius: '8px', padding: '8px 12px' },
  dateInput:      { border: 'none', outline: 'none', fontSize: '12px', fontFamily: 'Inter, sans-serif', color: '#051c2c', background: 'transparent' },
  exportBtn:      { background: '#051c2c', color: '#ffffff', border: 'none', borderRadius: '8px', padding: '10px 20px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'Inter, sans-serif' },
  statGrid:       { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '14px' },
  row2:           { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '20px' },
  row3:           { display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '16px' },
  card:           { background: '#ffffff', borderRadius: '12px', border: '1px solid #e8ecf0', padding: '20px' },
  cardTitle:      { fontSize: '14px', fontWeight: '700', color: '#051c2c', marginBottom: '14px', paddingBottom: '10px', borderBottom: '1px solid #f0f2f4' },
  overlay:        { position: 'fixed', inset: 0, background: 'rgba(5,28,44,0.55)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' },
  modal:          { background: '#ffffff', borderRadius: '16px', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 64px rgba(5,28,44,0.25)' },
  modalHeader:    { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid #e8ecf0', position: 'sticky', top: 0, background: '#ffffff', zIndex: 1 },
  modalTitle:     { fontSize: '18px', fontWeight: '700', color: '#051c2c' },
  modalClose:     { background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#9baabb' },
  modalBody:      { padding: '20px 24px' },
  modalFooter:    { padding: '14px 24px', borderTop: '1px solid #e8ecf0', display: 'flex', justifyContent: 'flex-end' },
  cancelBtn:      { padding: '9px 20px', background: 'none', border: '1.5px solid #e8ecf0', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', fontFamily: 'Inter, sans-serif' },
};

export default ReportsPage;