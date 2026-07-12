import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import api from '../api';

function CompliancePage({ user }) {

  const isHod = user?.role === 'hod';

  const [data,          setData]          = useState(null);
  const [loading,       setLoading]       = useState(true);
  const [selectedYear,  setSelectedYear]  = useState(new Date().getFullYear());
  const [filterDept,    setFilterDept]    = useState('');
  const [filterStatus,  setFilterStatus]  = useState('all'); // all | compliant | non-compliant
  const [searchName,    setSearchName]    = useState('');
  const [exporting,     setExporting]     = useState(false);

  useEffect(() => {
    loadCompliance(selectedYear);
  }, [selectedYear]);

  const loadCompliance = (year) => {
    setLoading(true);
    api.getCompliance(year)
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  };

  const handleExport = async () => {
    if (!data) return;
    setExporting(true);
    try {
      const wb = XLSX.utils.book_new();

      // Summary sheet
      const summaryRows = [
        ['RAK Properties LMS — Mandatory Training Compliance Report'],
        ['Year', selectedYear],
        ['Generated', new Date().toLocaleDateString('en-GB')],
        [],
        ['METRIC', 'VALUE'],
        ['Total Active Learners', data.totalLearners],
        ['Fully Compliant',       data.compliantCount],
        ['Non-Compliant',         data.nonCompliantCount],
        ['Overall Compliance %',  data.overallPct + '%'],
        [],
        ['DEPARTMENT SUMMARY'],
        ['Department', 'Total Learners', 'Compliant', 'Compliance %'],
        ...data.departmentSummary.map(d => [d.name, d.total, d.compliant, d.pct + '%']),
      ];
      const wsSummary = XLSX.utils.aoa_to_sheet(summaryRows);
      wsSummary['!cols'] = [{ wch: 35 }, { wch: 20 }, { wch: 15 }, { wch: 15 }];
      XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');

      // Detail sheet
      const courseHeaders = data.mandatoryCourses.map(c => c.title);
      const detailHeaders = ['Emp ID', 'Name', 'Department', 'Attended', 'Total', 'Compliance %', 'Status', ...courseHeaders];
      const detailRows = data.learnerCompliance.map(l => [
        l.emp_id || '—',
        l.name,
        l.department || '—',
        l.attended,
        l.total,
        l.pct + '%',
        l.compliant ? '✅ Compliant' : '❌ Non-Compliant',
        ...l.courseStatus.map(cs =>
          cs.status === 'attended' ? '✅ Attended' :
          cs.status === 'enrolled' ? '⏳ Enrolled' : '❌ Not Enrolled'
        ),
      ]);
      const wsDetail = XLSX.utils.aoa_to_sheet([detailHeaders, ...detailRows]);
      wsDetail['!cols'] = [{ wch: 12 }, { wch: 25 }, { wch: 22 }, { wch: 10 }, { wch: 8 }, { wch: 14 }, { wch: 16 }, ...courseHeaders.map(() => ({ wch: 20 }))];
      XLSX.utils.book_append_sheet(wb, wsDetail, 'Learner Detail');

      const buf  = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, `Compliance_Report_${selectedYear}.xlsx`);
    } catch (err) {
      alert('Error generating Excel: ' + err.message);
    }
    setExporting(false);
  };

  if (loading) return (
    <div style={{ padding: '40px', textAlign: 'center', color: '#9baabb' }}>
      Loading compliance data...
    </div>
  );

  if (!data) return (
    <div style={{ padding: '40px', textAlign: 'center', color: '#9baabb' }}>
      Could not load compliance data.
    </div>
  );

  // Get unique departments for filter
  const departments = [...new Set(
    data.learnerCompliance.map(l => l.department).filter(Boolean)
  )].sort();

  // Filter learners
  const filteredLearners = data.learnerCompliance.filter(l => {
    const matchDept   = !filterDept   || l.department === filterDept;
    const matchStatus = filterStatus === 'all'
      ? true
      : filterStatus === 'compliant' ? l.compliant : !l.compliant;
    const matchSearch = !searchName ||
      l.name.toLowerCase().includes(searchName.toLowerCase()) ||
      (l.emp_id || '').toLowerCase().includes(searchName.toLowerCase());
    return matchDept && matchStatus && matchSearch;
  });

  const getCellColor = (status) => {
    if (status === 'attended')     return { bg: '#dcfce7', color: '#15803d', label: '✅' };
    if (status === 'enrolled')     return { bg: '#fef9c3', color: '#a16207', label: '⏳' };
    return                                { bg: '#fee2e2', color: '#991b1b', label: '✗' };
  };

  return (
    <div style={styles.page}>

      {/* ── HOD BANNER ── */}
      {isHod && (
        <div style={styles.hodBanner}>
          👁 You are viewing your department's compliance data in read-only mode.
        </div>
      )}

      {/* ── PAGE HEADER ── */}
      <div style={styles.pageHeader}>
        <div>
          <div style={{ fontSize: '20px', fontWeight: '700', color: '#051c2c' }}>
            Mandatory Training Compliance
          </div>
          <div style={{ fontSize: '13px', color: '#9baabb', marginTop: '4px' }}>
            Track mandatory training completion for {selectedYear}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <div style={styles.yearSelectWrap}>
            <span style={{ fontSize: '12px', color: '#5a6878', fontWeight: '600' }}>Year</span>
            <select
              value={selectedYear}
              onChange={e => setSelectedYear(+e.target.value)}
              style={styles.yearSelect}
            >
              {(data.availableYears || []).map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
          <button style={styles.exportBtn} onClick={handleExport} disabled={exporting}>
            {exporting ? '⏳ Exporting...' : '📥 Export Excel'}
          </button>
        </div>
      </div>

      {/* ── STAT CARDS ── */}
      <div style={styles.statGrid}>
        <div style={{ ...styles.statCard, background: '#051C2C' }}>
          <div style={styles.statIcon}>👥</div>
          <div style={styles.statNum}>{data.totalLearners}</div>
          <div style={styles.statLbl}>Active Learners</div>
        </div>
        <div style={{ ...styles.statCard, background: '#A5C8D2' }}>
          <div style={styles.statIcon}>✅</div>
          <div style={{ ...styles.statNum, color: '#051C2C' }}>{data.compliantCount}</div>
          <div style={{ ...styles.statLbl, color: '#1f3a45' }}>Fully Compliant</div>
        </div>
        <div style={{ ...styles.statCard, background: '#AF5F46' }}>
          <div style={styles.statIcon}>❌</div>
          <div style={styles.statNum}>{data.nonCompliantCount}</div>
          <div style={styles.statLbl}>Non-Compliant</div>
        </div>
        <div style={{ ...styles.statCard, background: data.overallPct >= 80 ? '#7a9e7a' : data.overallPct >= 60 ? '#BEC8BE' : '#AF5F46' }}>
          <div style={styles.statIcon}>📊</div>
          <div style={{ ...styles.statNum, color: data.overallPct >= 60 ? '#051C2C' : '#ffffff' }}>
            {data.overallPct}%
          </div>
          <div style={{ ...styles.statLbl, color: data.overallPct >= 60 ? '#1f3a45' : 'rgba(255,255,255,0.8)' }}>
            Overall Compliance
          </div>
        </div>
      </div>

      {/* ── DEPARTMENT SUMMARY ── */}
      <div style={styles.deptGrid}>
        {data.departmentSummary.map(dept => (
          <div key={dept.name} style={styles.deptCard}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
              <div style={{ fontSize: '13px', fontWeight: '700', color: '#051c2c', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {dept.name}
              </div>
              <span style={{
                fontSize: '12px', fontWeight: '700', padding: '2px 8px', borderRadius: '10px', marginLeft: '8px', flexShrink: 0,
                background: dept.pct === 100 ? '#dcfce7' : dept.pct >= 60 ? '#fef9c3' : '#fee2e2',
                color:      dept.pct === 100 ? '#15803d' : dept.pct >= 60 ? '#a16207' : '#991b1b',
              }}>
                {dept.pct}%
              </span>
            </div>
            <div style={{ height: '6px', background: '#e8ecf0', borderRadius: '3px', overflow: 'hidden', marginBottom: '8px' }}>
              <div style={{
                height: '100%', borderRadius: '3px', transition: 'width 0.3s ease',
                width: `${dept.pct}%`,
                background: dept.pct === 100 ? '#16a34a' : dept.pct >= 60 ? '#c8973a' : '#dc2626',
              }} />
            </div>
            <div style={{ fontSize: '11px', color: '#9baabb' }}>
              {dept.compliant} of {dept.total} learners compliant
            </div>
          </div>
        ))}
      </div>

      {/* ── FILTERS ── */}
      <div style={styles.controls}>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={styles.searchWrap}>
            <span>🔍</span>
            <input
              style={styles.searchInput}
              placeholder="Search by name or ID"
              value={searchName}
              onChange={e => setSearchName(e.target.value)}
            />
          </div>
          {!isHod && (
            <select value={filterDept} onChange={e => setFilterDept(e.target.value)} style={styles.filterSelect}>
              <option value="">All Departments</option>
              {departments.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          )}
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={styles.filterSelect}>
            <option value="all">All Learners</option>
            <option value="compliant">✅ Compliant Only</option>
            <option value="non-compliant">❌ Non-Compliant Only</option>
          </select>
          {(filterDept || filterStatus !== 'all' || searchName) && (
            <button onClick={() => { setFilterDept(''); setFilterStatus('all'); setSearchName(''); }} style={styles.clearBtn}>
              ✕ Clear
            </button>
          )}
        </div>
        <div style={{ fontSize: '13px', color: '#9baabb' }}>
          {filteredLearners.length} learner{filteredLearners.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* ── COMPLIANCE TABLE ── */}
      {data.mandatoryCourses.length === 0 ? (
        <div style={styles.emptyState}>
          No mandatory courses found for {selectedYear}.
          Add mandatory courses on the Courses page.
        </div>
      ) : (
        <div style={styles.tableWrap}>
          <div style={{ overflowX: 'auto' }}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.theadRow}>
                  <th style={{ ...styles.th, minWidth: '180px', position: 'sticky', left: 0, background: '#051c2c', zIndex: 2 }}>
                    Learner
                  </th>
                  <th style={{ ...styles.th, minWidth: '140px', position: 'sticky', left: '180px', background: '#051c2c', zIndex: 2 }}>
                    Department
                  </th>
                  <th style={{ ...styles.th, minWidth: '100px' }}>Compliance</th>
                  {data.mandatoryCourses.map(c => (
                    <th key={c.id} style={{ ...styles.th, minWidth: '140px', maxWidth: '180px' }}>
                      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '160px' }} title={c.title}>
                        {c.title}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredLearners.map(learner => (
                  <tr key={learner.id} style={styles.tr}>
                    {/* Learner name — sticky */}
                    <td style={{ ...styles.td, position: 'sticky', left: 0, background: '#ffffff', zIndex: 1, borderRight: '1px solid #e8ecf0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={styles.avatar}>
                          {learner.name.split(' ').slice(0,2).map(w => w[0]).join('')}
                        </div>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: '600', color: '#051c2c' }}>{learner.name}</div>
                          <div style={{ fontSize: '11px', color: '#9baabb', fontFamily: 'monospace' }}>{learner.emp_id || '—'}</div>
                        </div>
                      </div>
                    </td>
                    {/* Department — sticky */}
                    <td style={{ ...styles.td, position: 'sticky', left: '180px', background: '#ffffff', zIndex: 1, borderRight: '1px solid #e8ecf0', fontSize: '12px', color: '#5a6878' }}>
                      {learner.department || '—'}
                    </td>
                    {/* Compliance % */}
                    <td style={{ ...styles.td, textAlign: 'center' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                        <span style={{
                          fontSize: '13px', fontWeight: '700', padding: '3px 10px', borderRadius: '20px',
                          background: learner.compliant ? '#dcfce7' : learner.pct >= 60 ? '#fef9c3' : '#fee2e2',
                          color:      learner.compliant ? '#15803d' : learner.pct >= 60 ? '#a16207' : '#991b1b',
                        }}>
                          {learner.pct}%
                        </span>
                        <span style={{ fontSize: '10px', color: '#9baabb' }}>
                          {learner.attended}/{learner.total}
                        </span>
                      </div>
                    </td>
                    {/* Course status cells */}
                    {learner.courseStatus.map(cs => {
                      const cell = getCellColor(cs.status);
                      return (
                        <td key={cs.courseId} style={{ ...styles.td, textAlign: 'center', padding: '8px' }}>
                          <span style={{
                            display: 'inline-block', padding: '4px 10px', borderRadius: '8px',
                            background: cell.bg, color: cell.color,
                            fontSize: '12px', fontWeight: '600',
                          }} title={cs.status === 'attended' ? 'Attended' : cs.status === 'enrolled' ? 'Enrolled (Not Yet Attended)' : 'Not Enrolled'}>
                            {cell.label}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredLearners.length === 0 && (
            <div style={styles.emptyState}>
              No learners match your filters.
            </div>
          )}
        </div>
      )}

      {/* ── LEGEND ── */}
      <div style={styles.legend}>
        <span style={{ fontSize: '12px', fontWeight: '600', color: '#5a6878' }}>Legend:</span>
        <span style={styles.legendItem}>
          <span style={{ background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '600' }}>✅ Attended</span>
        </span>
        <span style={styles.legendItem}>
          <span style={{ background: '#fef9c3', color: '#a16207', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '600' }}>⏳ Enrolled</span>
          <span style={{ fontSize: '11px', color: '#9baabb' }}>(not yet attended)</span>
        </span>
        <span style={styles.legendItem}>
          <span style={{ background: '#fee2e2', color: '#991b1b', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '600' }}>✗ Not Enrolled</span>
        </span>
      </div>

    </div>
  );
}

const styles = {
  page:           { padding: '30px', minHeight: '100vh', background: '#f2f4f6', fontFamily: 'Inter, sans-serif' },
  hodBanner:      { background: '#fef9c3', border: '1px solid #fde68a', color: '#92400e', padding: '10px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: '500', marginBottom: '16px' },
  pageHeader:     { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' },
  yearSelectWrap: { display: 'flex', alignItems: 'center', gap: '8px', background: '#ffffff', border: '1.5px solid #e8ecf0', borderRadius: '8px', padding: '6px 12px' },
  yearSelect:     { border: 'none', outline: 'none', fontSize: '14px', fontWeight: '700', color: '#051c2c', background: 'transparent', fontFamily: 'Inter, sans-serif', cursor: 'pointer' },
  exportBtn:      { background: '#051c2c', color: '#ffffff', border: 'none', borderRadius: '8px', padding: '10px 20px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'Inter, sans-serif' },
  statGrid:       { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '20px' },
  statCard:       { borderRadius: '12px', padding: '18px 16px', display: 'flex', flexDirection: 'column', gap: '4px' },
  statIcon:       { fontSize: '20px', marginBottom: '4px' },
  statNum:        { fontSize: '28px', fontWeight: '800', color: '#ffffff', lineHeight: 1 },
  statLbl:        { fontSize: '12px', fontWeight: '600', color: 'rgba(255,255,255,0.8)' },
  deptGrid:       { display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px', marginBottom: '20px' },
  deptCard:       { background: '#ffffff', borderRadius: '10px', border: '1px solid #e8ecf0', padding: '14px' },
  controls:       { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' },
  searchWrap:     { display: 'flex', alignItems: 'center', background: '#ffffff', border: '1.5px solid #e8ecf0', borderRadius: '8px', padding: '0 12px', gap: '6px' },
  searchInput:    { border: 'none', outline: 'none', fontSize: '13px', padding: '9px 0', width: '180px', fontFamily: 'Inter, sans-serif', background: 'transparent' },
  filterSelect:   { padding: '9px 12px', border: '1.5px solid #e8ecf0', borderRadius: '8px', fontSize: '13px', outline: 'none', background: '#ffffff', color: '#051c2c', fontFamily: 'Inter, sans-serif', cursor: 'pointer' },
  clearBtn:       { background: '#fee2e2', color: '#991b1b', border: 'none', borderRadius: '8px', padding: '9px 14px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', fontFamily: 'Inter, sans-serif' },
  tableWrap:      { background: '#ffffff', borderRadius: '12px', border: '1px solid #e8ecf0', overflow: 'hidden', marginBottom: '16px' },
  table:          { width: '100%', borderCollapse: 'collapse' },
  theadRow:       { background: '#051c2c' },
  th:             { padding: '11px 14px', textAlign: 'left', fontSize: '10px', fontWeight: '700', color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' },
  tr:             { borderBottom: '1px solid #f0f2f4' },
  td:             { padding: '12px 14px', fontSize: '13px', color: '#051c2c', verticalAlign: 'middle' },
  avatar:         { width: '30px', height: '30px', borderRadius: '50%', background: '#051c2c', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '700', flexShrink: 0 },
  emptyState:     { padding: '40px', textAlign: 'center', color: '#9baabb', fontSize: '14px', background: '#ffffff', borderRadius: '12px', border: '1px solid #e8ecf0' },
  legend:         { display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', padding: '12px 16px', background: '#ffffff', borderRadius: '8px', border: '1px solid #e8ecf0' },
  legendItem:     { display: 'flex', alignItems: 'center', gap: '6px' },
};

export default CompliancePage;