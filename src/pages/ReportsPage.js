import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import api from '../api';

function ReportsPage({ user }) {

  const isHod = user?.role === 'hod';

  const [stats,        setStats]        = useState(null);
  const [departments,  setDepartments]  = useState([]);
  const [learners,     setLearners]     = useState([]);
  const [courses,      setCourses]      = useState([]);
  const [calEntries,   setCalEntries]   = useState([]);
  const [budget,       setBudget]       = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [exporting,    setExporting]    = useState(false);
  const [drillDown,    setDrillDown]    = useState(null);
  const [drillLoading, setDrillLoading] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

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
    api.getReports({ startDate, endDate })
      .then(s => setStats(s))
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate]);

  useEffect(() => {
    api.getBudget(selectedYear)
      .then(b => setBudget(b))
      .catch(() => setBudget(null));
    api.getCalendar()
      .then(data => { if (Array.isArray(data)) setCalEntries(data); })
      .catch(() => {});
  }, [selectedYear]);

  const loadData = () => {
    Promise.all([
      api.getDepartments(),
      api.getLearners(),
      api.getCourses(),
      api.getCalendar(),
    ]).then(([d, l, c, cal]) => {
      if (Array.isArray(d))   setDepartments(d);
      if (Array.isArray(l))   setLearners(l);
      if (Array.isArray(c))   setCourses(c);
      if (Array.isArray(cal)) setCalEntries(cal);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  const filteredCourses = courses.filter(c => {
    const d = c.end_date || c.start_date;
    if (!d) return true;
    return new Date(d) >= new Date(startDate) && new Date(d) <= new Date(endDate);
  });

  // Calendar entries filtered by selected year
  const yearCalEntries = calEntries.filter(e => {
    const d = e.start_date || e.end_date;
    if (!d) return false;
    return new Date(d).getFullYear() === selectedYear;
  });

  const fmtAED = (n) => {
    if (!n && n !== 0) return '—';
    return 'AED ' + Math.abs(+n).toLocaleString('en-AE', { minimumFractionDigits: 0 });
  };

  const variance     = budget?.budgetVariance || 0;
  const isOverBudget = variance < 0;
  const isNoBudget   = !budget?.annualBudget;

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
        ['Total Learners',            stats?.totalLearners    || 0],
        ['Active Learners',           stats?.activeLearners   || 0],
        ['Inactive Learners',         stats?.inactiveLearners || 0],
        ['Total Courses',             filteredCourses.length],
        ['Total Enrolled (records)',  stats?.totalEnrolled    || 0],
        ['Total Attended (records)',  stats?.totalAttended    || 0],
        ['Participation Rate',        (stats?.participationRate || 0) + '%'],
        ['Total Training Hours',      stats?.totalTrainingHours || 0],
        ['Learners Trained (unique)', stats?.totalLearnersTrainedThisYear || 0],
        ['Satisfaction Score',        (stats?.overallSatisfaction || 0) + '%'],
        [],
        ['BUDGET — ' + selectedYear],
        ['Annual Budget',     budget?.annualBudget   ? fmtAED(budget.annualBudget)   : 'Not set'],
        ['Spent To Date',     fmtAED(budget?.spentToDate || 0)],
        ['Remaining Budget',  isNoBudget ? '—' : fmtAED(budget.remainingBudget)],
        ['Budget Utilization',isNoBudget ? '—' : (budget.budgetUtilization + '%')],
        ['Budget Variance',   isNoBudget ? '—' : ((isOverBudget ? '(-) ' : '(+) ') + fmtAED(Math.abs(variance)))],
      ];
      const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
      wsSummary['!cols'] = [{ wch: 30 }, { wch: 20 }];
      XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');

      const learnersHeaders = ['Emp ID', 'Name', 'Gender', 'Nationality', 'Department', 'Designation', 'Status'];
      const learnersRows = learners.map(l => [l.emp_id || '', l.name || '', l.gender || '', l.nationality || '', l.department_name || '', l.designation || '', l.status || '']);
      const wsLearners = XLSX.utils.aoa_to_sheet([learnersHeaders, ...learnersRows]);
      XLSX.utils.book_append_sheet(wb, wsLearners, 'Learners');

      const coursesHeaders = ['Title', 'Training Type', 'Status', 'Start Date', 'End Date', 'Duration (Hours)', 'Enrolled', 'Attended', 'Participation Rate', 'Satisfaction Rate'];
      const coursesRows = filteredCourses.map(c => {
        const enrolled = +c.enrolled_count || 0;
        const attended = +c.attended_count || 0;
        return [
          c.title || '', c.training_type || 'Developmental', c.status || '',
          c.start_date ? new Date(c.start_date).toLocaleDateString('en-GB') : '',
          c.end_date   ? new Date(c.end_date).toLocaleDateString('en-GB')   : '',
          c.duration_hours || 0, enrolled, attended,
          enrolled > 0 ? Math.round(attended / enrolled * 100) + '%' : '—',
          +c.stars > 0 ? Math.round((+c.stars / 5) * 100) + '%' : '—',
        ];
      });
      const wsCourses = XLSX.utils.aoa_to_sheet([coursesHeaders, ...coursesRows]);
      XLSX.utils.book_append_sheet(wb, wsCourses, 'Courses');

      // Calendar / Budget sheet
      const calHeaders = ['Training Name', 'Department', 'Type', 'Status', 'Start Date', 'End Date', 'Training Hours', 'Cost (AED)'];
      const calRows = yearCalEntries.map(e => [
        e.training_name || '',
        e.department_name || '—',
        e.type || '—',
        e.status || '—',
        e.start_date ? new Date(e.start_date).toLocaleDateString('en-GB') : '',
        e.end_date   ? new Date(e.end_date).toLocaleDateString('en-GB')   : '',
        e.training_hours || 0,
        +e.cost || 0,
      ]);
      const wsCal = XLSX.utils.aoa_to_sheet([calHeaders, ...calRows]);
      wsCal['!cols'] = [{ wch: 35 }, { wch: 22 }, { wch: 16 }, { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 16 }, { wch: 14 }];
      XLSX.utils.book_append_sheet(wb, wsCal, `Calendar ${selectedYear}`);

      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, `RAK_LMS_Report_${startDate}_to_${endDate}.xlsx`);
    } catch (err) {
      alert('Error generating Excel: ' + err.message);
    }
    setExporting(false);
  };

  const getDrillDownData = () => ({
    totalLearners: {
      title: 'Total Learners',
      headers: ['Name', 'Emp ID', 'Department', 'Status'],
      rows: learners.map(l => [l.name, l.emp_id || '—', l.department_name || '—', l.status]),
    },
    activeLearners: {
      title: 'Active Learners',
      headers: ['Name', 'Emp ID', 'Department'],
      rows: learners.filter(l => l.status === 'Active').map(l => [l.name, l.emp_id || '—', l.department_name || '—']),
    },
    inactiveLearners: {
      title: 'Inactive Learners',
      headers: ['Name', 'Emp ID', 'Department', 'Status'],
      rows: learners.filter(l => l.status !== 'Active').map(l => [l.name, l.emp_id || '—', l.department_name || '—', l.status]),
    },
    totalCourses: {
      title: 'Total Courses',
      headers: ['Course', 'Training Type', 'Status'],
      rows: filteredCourses.map(c => [c.title, c.training_type || 'Developmental', c.status]),
    },
    totalDepts: {
      title: 'Total Departments',
      headers: ['Department', 'Head', 'Learners'],
      rows: departments.map(d => [d.name, d.hod || '—', d.learner_count || 0]),
    },
    emiratiLearners: {
      title: 'Emirati Learners',
      headers: ['Name', 'Emp ID', 'Department'],
      rows: learners.filter(l => l.nationality === 'Emirati').map(l => [l.name, l.emp_id || '—', l.department_name || '—']),
    },
    trainingHours: {
      title: 'Training Hours Breakdown',
      headers: ['Course Name', 'Duration (hrs)', 'Attended', 'Total Hours'],
      rows: filteredCourses
        .filter(c => +c.duration_hours > 0)
        .map(c => [c.title, c.duration_hours || 0, c.attended_count || 0, ((+c.duration_hours || 0) * (+c.attended_count || 0)) + 'h'])
        .sort((a, b) => parseInt(b[3]) - parseInt(a[3])),
    },
    completedCourses: {
      title: 'Completed Courses',
      headers: ['Course', 'Training Type', 'Attended'],
      rows: filteredCourses.filter(c => c.status === 'Completed').map(c => [c.title, c.training_type || 'Developmental', c.attended_count || 0]),
    },
    ongoingCourses: {
      title: 'Ongoing Courses',
      headers: ['Course', 'Training Type', 'Enrolled'],
      rows: filteredCourses.filter(c => c.status === 'Ongoing').map(c => [c.title, c.training_type || 'Developmental', c.enrolled_count || 0]),
    },
    pendingCourses: {
      title: 'Pending Courses',
      headers: ['Course', 'Training Type', 'Max Learners'],
      rows: filteredCourses.filter(c => c.status === 'Pending').map(c => [c.title, c.training_type || 'Developmental', c.max_learners || '—']),
    },
    satisfactionScore: {
      title: 'Course Satisfaction Scores',
      headers: ['Course', 'Stars', 'Satisfaction %'],
      rows: filteredCourses
        .filter(c => +c.stars > 0)
        .sort((a, b) => b.stars - a.stars)
        .map(c => [c.title, '★'.repeat(Math.round(+c.stars)) + '☆'.repeat(5 - Math.round(+c.stars)), Math.round((+c.stars / 5) * 100) + '%']),
    },
    // Budget drill-downs
    spentToDate: {
      title: `Training Spend — ${selectedYear}`,
      headers: ['Training Name', 'Department', 'Type', 'Cost (AED)'],
      rows: calEntries
        .filter(e => {
          const d = e.start_date || e.end_date;
          if (!d) return false;
          return new Date(d).getFullYear() === selectedYear
            && +e.cost > 0
            && e.status === 'Completed';
        })
        .sort((a, b) => (+b.cost || 0) - (+a.cost || 0))
        .map(e => [
          e.training_name,
          e.department_name || '—',
          e.type || '—',
          'AED ' + (+e.cost).toLocaleString(),
        ]),
    },
    calendarEntries: {
      title: `All Training Calendar Entries — ${selectedYear}`,
      headers: ['Training Name', 'Department', 'Type', 'Status', 'Start Date', 'Hours', 'Cost (AED)'],
      rows: yearCalEntries.map(e => [
        e.training_name,
        e.department_name || '—',
        e.type || '—',
        e.status || '—',
        e.start_date ? new Date(e.start_date).toLocaleDateString('en-GB') : '—',
        (e.training_hours || 0) + 'h',
        e.cost ? 'AED ' + (+e.cost).toLocaleString() : '—',
      ]),
    },
  });

  const openDrillDown = async (key, overrideData) => {
    if (overrideData) {
      setDrillDown(overrideData);
      return;
    }

    const allData = getDrillDownData();

    if (key === 'enrolled' || key === 'attended' || key === 'participationRate') {
      const titles  = { enrolled: 'Enrolled Learners', attended: 'Attended Learners', participationRate: 'Participation Breakdown' };
      const headers = { enrolled: ['Learner Name', 'Course'], attended: ['Learner Name', 'Course'], participationRate: ['Learner Name', 'Status'] };

      setDrillDown({ title: titles[key], headers: headers[key], rows: [] });
      setDrillLoading(true);

      try {
        const allEnrollments = [];
        for (const course of filteredCourses) {
          try {
            const enrollments = await api.getEnrollmentsByCourse(course.id);
            if (Array.isArray(enrollments)) {
              enrollments.forEach(e => {
                allEnrollments.push({ learnerName: e.name, courseName: course.title, attended: e.attended });
              });
            }
          } catch (err) {}
        }

        let rows = [];
        if (key === 'enrolled') {
          rows = allEnrollments.map(e => [e.learnerName, e.courseName]);
        } else if (key === 'attended') {
          rows = allEnrollments.filter(e => e.attended).map(e => [e.learnerName, e.courseName]);
        } else if (key === 'participationRate') {
          const attended = allEnrollments.filter(e => e.attended).map(e => [e.learnerName, '✅ Attended']);
          const absent   = allEnrollments.filter(e => !e.attended).map(e => [e.learnerName, '⏳ Enrolled (Absent)']);
          rows = [...attended, ...absent];
        }

        setDrillDown({ title: titles[key], headers: headers[key], rows });
      } catch (err) {
        setDrillDown({ title: titles[key], headers: headers[key], rows: [] });
      }
      setDrillLoading(false);
      return;
    }

    if (allData[key]) setDrillDown(allData[key]);
  };

  if (loading || !stats) return (
    <div style={{ padding: '40px', textAlign: 'center', color: '#9baabb' }}>Loading reports...</div>
  );

  const mostActiveDepartments = stats.mostActiveDepartments || [];

  return (
    <div style={styles.page}>

      {isHod && (
        <div style={styles.hodBanner}>
          👁 You are viewing your department's reports in read-only mode.
        </div>
      )}

      {/* ── HEADER ── */}
      <div style={styles.pageHeader}>
        <div style={{ fontSize: '20px', fontWeight: '700', color: '#051c2c' }}>Reports</div>
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

      {/* ── ROW 1 STAT CARDS ── */}
      <div style={styles.statGrid}>
        <StatCard icon="🎓" num={stats.totalLearners}    label="Total Learners"    color="#051C2C" onClick={() => openDrillDown('totalLearners')} />
        <StatCard icon="✅" num={stats.activeLearners}   label="Active Learners"   color="#A5C8D2" onClick={() => openDrillDown('activeLearners')} textDark />
        <StatCard icon="⛔" num={stats.inactiveLearners} label="Inactive Learners" color="#AF5F46" onClick={() => openDrillDown('inactiveLearners')} />
        <StatCard icon="📚" num={stats.totalCourses}     label="Total Courses"     color="#BEC8BE" onClick={() => openDrillDown('totalCourses')} textDark />
      </div>

      <div style={styles.statGrid}>
        <StatCard icon="📝" num={stats.totalEnrolled}             label="Enrolled"             color="#051C2C" sub="click to see who"     onClick={() => openDrillDown('enrolled')} />
        <StatCard icon="🎯" num={stats.totalAttended}             label="Attended"             color="#A5C8D2" sub="click to see who"     onClick={() => openDrillDown('attended')} textDark />
        <StatCard icon="📊" num={stats.participationRate + '%'}   label="Participation Rate"   color="#AF5F46" sub="enrolled vs attended" onClick={() => openDrillDown('participationRate')} />
        <StatCard icon="⏱️" num={stats.totalTrainingHours + 'h'} label="Total Training Hours" color="#BEC8BE" sub="click for breakdown"  onClick={() => openDrillDown('trainingHours')} textDark />
      </div>

      {/* ── BUDGET SECTION ── */}
      <div style={styles.sectionHeader}>
        <div style={{ fontSize: '16px', fontWeight: '700', color: '#051c2c' }}>
          Budget Overview
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#ffffff', border: '1.5px solid #e8ecf0', borderRadius: '8px', padding: '6px 12px' }}>
          <span style={{ fontSize: '11px', color: '#5a6878', fontWeight: '600' }}>Year</span>
          <select
            value={selectedYear}
            onChange={e => setSelectedYear(+e.target.value)}
            style={{ border: 'none', outline: 'none', fontSize: '13px', fontWeight: '700', color: '#051c2c', background: 'transparent', fontFamily: 'Inter, sans-serif', cursor: 'pointer' }}
          >
            {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      <div style={styles.budgetGrid}>

        {/* Annual Budget */}
        <button
          onClick={() => openDrillDown('calendarEntries')}
          style={{ ...styles.budgetCard, cursor: 'pointer', textAlign: 'left', border: '1px solid #e8ecf0' }}
        >
          <div style={styles.budgetLabel}>Annual Budget</div>
          <div style={styles.budgetValue}>
            {isNoBudget
              ? <span style={{ fontSize: '13px', color: '#9baabb' }}>Not set</span>
              : fmtAED(budget.annualBudget)
            }
          </div>
          <div style={{ fontSize: '10px', color: '#9baabb', marginTop: '6px' }}>
            {yearCalEntries.length} calendar entries · click to view →
          </div>
        </button>

        {/* Spent To Date */}
        <button
          onClick={() => openDrillDown('spentToDate')}
          style={{ ...styles.budgetCard, cursor: 'pointer', textAlign: 'left', border: '1px solid #e8ecf0' }}
        >
          <div style={styles.budgetLabel}>Spent To Date</div>
          <div style={styles.budgetValue}>
            {fmtAED(budget?.spentToDate || 0)}
          </div>
          <div style={{ fontSize: '10px', color: '#9baabb', marginTop: '6px' }}>
            {yearCalEntries.filter(e => +e.cost > 0 && e.status === 'Completed').length} completed entries · click to view →
          </div>
        </button>

        {/* Remaining Budget */}
        <div style={styles.budgetCard}>
          <div style={styles.budgetLabel}>Remaining Budget</div>
          <div style={{
            ...styles.budgetValue,
            color: isNoBudget ? '#9baabb' : isOverBudget ? '#dc2626' : '#15803d',
          }}>
            {isNoBudget ? '—' : fmtAED(budget.remainingBudget)}
          </div>
          {!isNoBudget && (
            <div style={{ marginTop: '8px' }}>
              <div style={{ height: '4px', background: '#e8ecf0', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: Math.min(budget.budgetUtilization, 100) + '%',
                  background: budget.budgetUtilization >= 100 ? '#dc2626' : budget.budgetUtilization >= 80 ? '#f59e0b' : '#16a34a',
                  borderRadius: '2px',
                }} />
              </div>
              <div style={{ fontSize: '10px', color: '#9baabb', marginTop: '4px' }}>
                {budget.budgetUtilization}% utilized
              </div>
            </div>
          )}
        </div>

        {/* Budget Utilization */}
        <div style={styles.budgetCard}>
          <div style={styles.budgetLabel}>Budget Utilization</div>
          <div style={{
            ...styles.budgetValue,
            color: isNoBudget ? '#9baabb'
              : budget.budgetUtilization >= 100 ? '#dc2626'
              : budget.budgetUtilization >= 80  ? '#f59e0b'
              : '#051c2c',
          }}>
            {isNoBudget ? '—' : budget.budgetUtilization + '%'}
          </div>
          {!isNoBudget && (
            <div style={{ marginTop: '6px', fontSize: '11px', color: '#9baabb' }}>
              of annual budget
            </div>
          )}
        </div>

        {/* Budget Variance */}
        <div style={{
          ...styles.budgetCard,
          background: isNoBudget ? '#f8f9fa' : isOverBudget ? '#fee2e2' : '#f0fdf4',
          border: isNoBudget ? '1px solid #e8ecf0' : isOverBudget ? '1px solid #fca5a5' : '1px solid #86efac',
        }}>
          <div style={styles.budgetLabel}>Budget Variance</div>
          <div style={{
            ...styles.budgetValue,
            color: isNoBudget ? '#9baabb' : isOverBudget ? '#dc2626' : '#15803d',
          }}>
            {isNoBudget ? '—' : (
              <span>
                <span style={{ fontSize: '13px', marginRight: '4px' }}>
                  {isOverBudget ? '(-)' : '(+)'}
                </span>
                {fmtAED(Math.abs(variance))}
              </span>
            )}
          </div>
          {!isNoBudget && (
            <div style={{
              fontSize: '11px', fontWeight: '600', marginTop: '6px',
              color: isOverBudget ? '#dc2626' : '#15803d',
            }}>
              {isOverBudget ? '⚠️ Over Budget' : '✅ Under Budget'}
            </div>
          )}
        </div>

      </div>

      {/* ── ROW 2 ── */}
      <div style={styles.row2}>

        <div style={styles.card}>
          <div style={styles.cardTitle}>Emirati Learners</div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
            <button onClick={() => openDrillDown('emiratiLearners')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
              <div style={{ position: 'relative', width: '130px', height: '130px' }}>
                <svg viewBox="0 0 130 130" style={{ width: '130px', height: '130px', transform: 'rotate(-90deg)' }}>
                  <circle cx="65" cy="65" r="54" fill="none" stroke="#e8ecf0" strokeWidth="12" />
                  <circle cx="65" cy="65" r="54" fill="none" stroke="#051c2c" strokeWidth="12"
                    strokeDasharray={`${2 * Math.PI * 54 * (stats.totalLearners > 0 ? stats.emiratiLearners / stats.totalLearners : 0)} ${2 * Math.PI * 54}`}
                    strokeLinecap="round" />
                </svg>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: '26px', fontWeight: '800', color: '#051c2c' }}>{stats.emiratiLearners}</span>
                </div>
              </div>
            </button>
            <div style={{ fontSize: '11px', color: '#9baabb' }}>
              {stats.totalLearners > 0 ? Math.round((stats.emiratiLearners / stats.totalLearners) * 100) : 0}% of total · click to view
            </div>
          </div>
        </div>

        <div style={styles.card}>
          <div style={styles.cardTitle}>Course Status Breakdown</div>
          <div style={{ fontSize: '32px', fontWeight: '800', color: '#051c2c', lineHeight: 1, marginBottom: '14px' }}>{stats.totalCourses}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {[
              ['Completed', stats.completedCourses, '#051c2c', 'completedCourses'],
              ['Ongoing',   stats.ongoingCourses,   '#5a6878', 'ongoingCourses'],
              ['Pending',   stats.pendingCourses,   '#b6bdc2', 'pendingCourses'],
            ].map(([l, v, c, key]) => (
              <button key={l} onClick={() => openDrillDown(key)}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', borderBottom: '1px solid #f0f2f4', cursor: 'pointer', padding: '6px 0', width: '100%', textAlign: 'left', fontFamily: 'Inter, sans-serif' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: c, flexShrink: 0 }} />
                <span style={{ fontSize: '12px', color: '#5a6878', flex: 1 }}>{l}</span>
                <span style={{ fontSize: '13px', fontWeight: '700', color: '#051c2c' }}>{v} →</span>
              </button>
            ))}
          </div>
        </div>

        <div style={styles.card}>
          <div style={styles.cardTitle}>Satisfaction Score</div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '6px 0' }}>
            <button onClick={() => openDrillDown('satisfactionScore')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
              <div style={{ position: 'relative', width: '110px', height: '110px' }}>
                <svg viewBox="0 0 110 110" style={{ width: '110px', height: '110px', transform: 'rotate(-90deg)' }}>
                  <circle cx="55" cy="55" r="46" fill="none" stroke="#e8ecf0" strokeWidth="10" />
                  <circle cx="55" cy="55" r="46" fill="none" stroke="#051c2c" strokeWidth="10"
                    strokeDasharray={`${2 * Math.PI * 46 * stats.overallSatisfaction / 100} ${2 * Math.PI * 46}`}
                    strokeLinecap="round" />
                </svg>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: '20px', fontWeight: '800', color: '#051c2c', lineHeight: 1 }}>{stats.overallSatisfaction}%</span>
                  <span style={{ fontSize: '12px', color: '#c8973a', marginTop: '2px' }}>{'★'.repeat(Math.round(stats.overallSatisfaction / 20))}</span>
                </div>
              </div>
            </button>
            <div style={{ fontSize: '11px', color: '#9baabb' }}>Click to see course breakdown</div>
          </div>
        </div>

        <div style={styles.card}>
          <button onClick={() => openDrillDown('totalDepts')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, width: '100%', textAlign: 'left' }}>
            <div style={styles.cardTitle}>{isHod ? 'My Department' : 'Total Departments'}</div>
            <div style={{ fontSize: '32px', fontWeight: '800', color: '#051c2c', lineHeight: 1, marginBottom: '8px' }}>{stats.totalDepts} →</div>
          </button>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '90px', overflowY: 'auto' }}>
            {departments.slice(0, 4).map(d => (
              <div key={d.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                <span style={{ color: '#5a6878', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '140px' }}>{d.name}</span>
                <span style={{ color: '#051c2c', fontWeight: '700', flexShrink: 0 }}>{d.learner_count || 0}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ── ROW 3 ── */}
      <div style={styles.row3}>

        <div style={styles.card}>
          <div style={styles.cardTitle}>{isHod ? 'My Department Activity' : 'Most Active Departments'}</div>
          <div style={{ fontSize: '10px', color: '#9baabb', marginBottom: '12px' }}>Click a department to see its learners</div>
          {mostActiveDepartments.slice(0, 6).map((d, i) => (
            <button key={d.id}
              onClick={() => openDrillDown(null, {
                title:   `${d.name} — Learners`,
                headers: ['Name', 'Emp ID', 'Status'],
                rows:    learners.filter(l => l.department_name === d.name).map(l => [l.name, l.emp_id || '—', l.status]),
              })}
              style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 0', background: 'none', border: 'none', borderBottom: '1px solid #f0f2f4', cursor: 'pointer', width: '100%', textAlign: 'left', fontFamily: 'Inter, sans-serif' }}>
              <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: i === 0 ? '#fef9c3' : '#f2f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '700', color: i === 0 ? '#a16207' : '#5a6878', flexShrink: 0 }}>
                {i + 1}
              </span>
              <span style={{ fontSize: '13px', fontWeight: '500', color: '#051c2c', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.name}</span>
              <span style={{ fontSize: '11px', fontWeight: '700', color: '#15803d' }}>{d.attended_count} attended →</span>
            </button>
          ))}
          {mostActiveDepartments.length === 0 && (
            <div style={{ padding: '20px', textAlign: 'center', color: '#9baabb', fontSize: '13px' }}>No department activity in this range.</div>
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
        <div style={styles.overlay} onClick={() => { setDrillDown(null); setDrillLoading(false); }}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <span style={styles.modalTitle}>{drillDown.title}</span>
              <button style={styles.modalClose} onClick={() => { setDrillDown(null); setDrillLoading(false); }}>×</button>
            </div>
            <div style={styles.modalBody}>
              {drillLoading ? (
                <div style={{ padding: '60px', textAlign: 'center', color: '#9baabb', fontSize: '14px' }}>⏳ Loading data...</div>
              ) : (
                <>
                  <div style={{ fontSize: '12px', color: '#9baabb', marginBottom: '12px' }}>
                    {drillDown.rows.length} record{drillDown.rows.length !== 1 ? 's' : ''}
                  </div>
                  <div style={{ overflowX: 'auto', maxHeight: '420px', overflowY: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ background: '#f8f9fa', borderBottom: '1px solid #e8ecf0' }}>
                          {drillDown.headers.map(h => (
                            <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontSize: '10px', fontWeight: '700', color: '#9baabb', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {drillDown.rows.map((row, i) => (
                          <tr key={i} style={{ borderBottom: '1px solid #f0f2f4' }}>
                            {row.map((cell, j) => (
                              <td key={j} style={{ padding: '9px 12px', fontSize: '13px', color: '#051c2c' }}>{cell}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {drillDown.rows.length === 0 && (
                      <div style={{ padding: '30px', textAlign: 'center', color: '#9baabb', fontSize: '13px' }}>No records found.</div>
                    )}
                  </div>
                </>
              )}
            </div>
            <div style={styles.modalFooter}>
              <button style={styles.cancelBtn} onClick={() => { setDrillDown(null); setDrillLoading(false); }}>Close</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

function StatCard({ icon, num, label, color, sub, onClick, textDark }) {
  const Wrapper = onClick ? 'button' : 'div';
  return (
    <Wrapper onClick={onClick} style={{ background: color, borderRadius: '14px', padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '6px', border: 'none', cursor: onClick ? 'pointer' : 'default', textAlign: 'left', fontFamily: 'Inter, sans-serif', width: '100%' }}>
      <div style={{ fontSize: '20px', marginBottom: '2px' }}>{icon}</div>
      <div style={{ fontSize: '30px', fontWeight: '800', color: textDark ? '#051C2C' : '#ffffff', lineHeight: 1, letterSpacing: '-1px' }}>{num}</div>
      <div style={{ fontSize: '12.5px', color: textDark ? '#1f3a45' : 'rgba(255,255,255,0.8)', fontWeight: '500' }}>{label}</div>
      {sub && <div style={{ fontSize: '10.5px', color: textDark ? '#3a5560' : 'rgba(255,255,255,0.55)' }}>{sub}</div>}
      {onClick && <div style={{ fontSize: '10px', color: textDark ? '#3a5560' : 'rgba(255,255,255,0.5)', marginTop: '2px' }}>Click to view details →</div>}
    </Wrapper>
  );
}

function MiniLineChart({ data }) {
  const hasData = data.some(d => d.score > 0);

  // Chart dimensions
  const W         = 600;
  const H         = 200;
  const padLeft   = 44;
  const padRight  = 16;
  const padTop    = 16;
  const padBottom = 28;
  const chartW    = W - padLeft - padRight;
  const chartH    = H - padTop - padBottom;

  // Y axis labels
  const yLabels = [0, 25, 50, 75, 100];

  // Plot points
  const points = data.map((d, i) => {
    const x = padLeft + (i / (data.length - 1)) * chartW;
    const y = padTop  + chartH - (d.score / 100) * chartH;
    return { x, y, score: d.score, month: d.month || d.quarter };
  });

  const polylinePoints = points.map(p => `${p.x},${p.y}`).join(' ');

  return (
    <div style={{ width: '100%', overflowX: 'auto' }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        style={{ width: '100%', height: '220px', fontFamily: 'Inter, sans-serif' }}
      >
        {/* ── Y AXIS GRID LINES + LABELS ── */}
        {yLabels.map(label => {
          const y = padTop + chartH - (label / 100) * chartH;
          return (
            <g key={label}>
              {/* Grid line */}
              <line
                x1={padLeft} y1={y}
                x2={padLeft + chartW} y2={y}
                stroke="#e8ecf0" strokeWidth="1"
                strokeDasharray={label === 0 ? 'none' : '4,3'}
              />
              {/* Y axis label */}
              <text
                x={padLeft - 8} y={y + 4}
                textAnchor="end"
                fontSize="10"
                fill="#9baabb"
                fontFamily="Inter, sans-serif"
              >
                {label}%
              </text>
            </g>
          );
        })}

        {/* ── Y AXIS LINE ── */}
        <line
          x1={padLeft} y1={padTop}
          x2={padLeft} y2={padTop + chartH}
          stroke="#e8ecf0" strokeWidth="1.5"
        />

        {/* ── AREA FILL UNDER LINE ── */}
        {hasData && (
          <polygon
            points={[
              ...points.map(p => `${p.x},${p.y}`),
              `${points[points.length - 1].x},${padTop + chartH}`,
              `${points[0].x},${padTop + chartH}`,
            ].join(' ')}
            fill="rgba(5,28,44,0.06)"
          />
        )}

        {/* ── POLYLINE ── */}
        {hasData && (
          <polyline
            points={polylinePoints}
            fill="none"
            stroke="#051c2c"
            strokeWidth="2"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        )}

        {/* ── DATA POINTS + SCORE LABELS ── */}
        {points.map((p, i) => (
          <g key={i}>
            {p.score > 0 && (
              <>
                {/* Dot */}
                <circle
                  cx={p.x} cy={p.y}
                  r="4"
                  fill="#051c2c"
                  stroke="#ffffff"
                  strokeWidth="2"
                />
                {/* Score label above dot */}
                <text
                  x={p.x}
                  y={p.y - 10}
                  textAnchor="middle"
                  fontSize="10"
                  fontWeight="700"
                  fill="#051c2c"
                  fontFamily="Inter, sans-serif"
                >
                  {p.score}%
                </text>
              </>
            )}
            {/* Month label below X axis */}
            <text
              x={p.x}
              y={padTop + chartH + 18}
              textAnchor="middle"
              fontSize="10"
              fill="#9baabb"
              fontFamily="Inter, sans-serif"
            >
              {p.month}
            </text>
          </g>
        ))}

      </svg>
    </div>
  );
}

const styles = {
  page:           { padding: '30px', minHeight: '100vh', background: '#f2f4f6', fontFamily: 'Inter, sans-serif' },
  hodBanner:      { background: '#fef9c3', border: '1px solid #fde68a', color: '#92400e', padding: '10px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: '500', marginBottom: '16px' },
  pageHeader:     { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' },
  headerControls: { display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' },
  dateFilterPair: { display: 'flex', alignItems: 'center', gap: '8px', background: '#ffffff', border: '1.5px solid #e8ecf0', borderRadius: '8px', padding: '8px 12px' },
  dateInput:      { border: 'none', outline: 'none', fontSize: '12px', fontFamily: 'Inter, sans-serif', color: '#051c2c', background: 'transparent' },
  exportBtn:      { background: '#051c2c', color: '#ffffff', border: 'none', borderRadius: '8px', padding: '10px 20px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'Inter, sans-serif' },
  statGrid:       { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '14px' },
  sectionHeader:  { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', marginTop: '6px' },
  budgetGrid:     { display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px', marginBottom: '20px' },
  budgetCard:     { background: '#ffffff', borderRadius: '10px', border: '1px solid #e8ecf0', padding: '16px', fontFamily: 'Inter, sans-serif' },
  budgetLabel:    { fontSize: '11px', fontWeight: '700', color: '#9baabb', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' },
  budgetValue:    { fontSize: '15px', fontWeight: '800', color: '#051c2c', lineHeight: 1.3 },
  row2:           { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '20px' },
  row3:           { display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '16px' },
  card:           { background: '#ffffff', borderRadius: '12px', border: '1px solid #e8ecf0', padding: '20px' },
  cardTitle:      { fontSize: '14px', fontWeight: '700', color: '#051c2c', marginBottom: '14px', paddingBottom: '10px', borderBottom: '1px solid #f0f2f4' },
  overlay:        { position: 'fixed', inset: 0, background: 'rgba(5,28,44,0.55)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' },
  modal:          { background: '#ffffff', borderRadius: '16px', width: '100%', maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 64px rgba(5,28,44,0.25)' },
  modalHeader:    { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid #e8ecf0', position: 'sticky', top: 0, background: '#ffffff', zIndex: 1 },
  modalTitle:     { fontSize: '18px', fontWeight: '700', color: '#051c2c' },
  modalClose:     { background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#9baabb' },
  modalBody:      { padding: '20px 24px' },
  modalFooter:    { padding: '14px 24px', borderTop: '1px solid #e8ecf0', display: 'flex', justifyContent: 'flex-end' },
  cancelBtn:      { padding: '9px 20px', background: 'none', border: '1.5px solid #e8ecf0', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', fontFamily: 'Inter, sans-serif' },
};

export default ReportsPage;