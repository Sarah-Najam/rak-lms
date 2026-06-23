import React, { useState, useEffect } from 'react';
import api from '../api';
import Pagination from '../components/Pagination';

const ITEMS_PER_PAGE = 20;

function CoursesPage() {

  const [courses,          setCourses]          = useState([]);
  const [trainers,         setTrainers]         = useState([]);
  const [departments,      setDepartments]      = useState([]);
  const [showAdd,          setShowAdd]          = useState(false);
  const [selected,         setSelected]         = useState(null);
  const [editCourse,       setEditCourse]       = useState(null);
  const [searchTitle,      setSearchTitle]      = useState('');
  const [filterDept,       setFilterDept]       = useState('');
  const [filterStartDate,  setFilterStartDate]  = useState('');
  const [filterEndDate,    setFilterEndDate]    = useState('');
  const [loading,          setLoading]          = useState(true);
  const [currentPage,      setCurrentPage]      = useState(1);
  const [enrolledLearners, setEnrolledLearners] = useState([]);
  const [enrollLoading,    setEnrollLoading]    = useState(false);
  const [profileLearner,   setProfileLearner]   = useState(null);
  const [trainerPopup,     setTrainerPopup]     = useState(null);
  const [deptFilter,       setDeptFilter]       = useState('');
  const [feedbackPopup,    setFeedbackPopup]    = useState(null);
  const [feedbackList,     setFeedbackList]     = useState([]);
  const [feedbackLoading,  setFeedbackLoading]  = useState(false);
  const [manualOverride,   setManualOverride]   = useState(false);
  const [manualValue,      setManualValue]      = useState(0);

  const emptyForm = {
    title: '', description: '', duration: '', institute: '',
    hours: '', cost: '', budgetRealized: '', startDate: '',
    endDate: '', type: 'External', status: 'Pending',
    tableOfContents: '', maxLearners: '', trainer: '',
    po: '', pr: '', venue: '', stars: 0, trainingType: 'Developmental',
  };
  const [form,     setForm]     = useState(emptyForm);
  const [editForm, setEditForm] = useState(emptyForm);

  useEffect(() => {
    loadCourses();
    api.getTrainers().then(data => { if (Array.isArray(data)) setTrainers(data); });
    api.getDepartments().then(data => { if (Array.isArray(data)) setDepartments(data); });
  }, []);

  const loadCourses = () => {
    api.getCourses()
      .then(data => {
        if (Array.isArray(data)) setCourses(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const upcomingDevelopmental = courses.filter(c =>
    (c.status === 'Pending' || c.status === 'Ongoing') &&
    (c.training_type || 'Developmental') === 'Developmental'
  );

  const upcomingMandatory = courses.filter(c =>
    (c.status === 'Pending' || c.status === 'Ongoing') &&
    c.training_type === 'Mandatory'
  );

  const totalCourses     = courses.length;
  const ongoingCourses   = courses.filter(c => c.status === 'Ongoing').length;
  const completedCourses = courses.filter(c => c.status === 'Completed').length;
  const avgParticipation = courses.length > 0
    ? Math.round(
        courses.reduce((s, c) => {
          const enr = +c.enrolled_count || 0;
          const att = +c.attended_count || 0;
          return s + (enr > 0 ? att / enr : 0);
        }, 0) / courses.length * 100
      )
    : 0;

  const filtered = courses.filter(c => {
    const matchSearch = c.title.toLowerCase().includes(searchTitle.toLowerCase());
    const courseDate   = c.start_date || c.end_date;
    let matchDateRange = true;
    if (filterStartDate && courseDate) {
      matchDateRange = matchDateRange && new Date(courseDate) >= new Date(filterStartDate);
    }
    if (filterEndDate && courseDate) {
      matchDateRange = matchDateRange && new Date(courseDate) <= new Date(filterEndDate);
    }
    return matchSearch && matchDateRange;
  });

  const totalFiltered = filtered.length;
  const paginated = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleSearch = (val) => {
    setSearchTitle(val);
    setCurrentPage(1);
  };

  const openDetail = async (course) => {
    setSelected(course);
    setDeptFilter('');
    setEnrollLoading(true);
    setEnrolledLearners([]);
    try {
      const data = await api.getEnrollmentsByCourse(course.id);
      if (Array.isArray(data)) setEnrolledLearners(data);
    } catch (err) {
      setEnrolledLearners([]);
    }
    setEnrollLoading(false);
  };

  const openTrainerPopup = (trainerName) => {
    if (!trainerName) return;
    const trainer = trainers.find(t =>
      t.name.toLowerCase() === trainerName.toLowerCase()
    );
    if (trainer) setTrainerPopup(trainer);
    else setTrainerPopup({ name: trainerName, notFound: true });
  };

  const openFeedbackPopup = async (course) => {
    setFeedbackPopup(course);
    setFeedbackLoading(true);
    setManualOverride(course.stars_is_manual !== false);
    setManualValue(course.stars || 0);
    try {
      const data = await api.getFeedbackByCourse(course.id);
      if (Array.isArray(data)) setFeedbackList(data);
    } catch (err) {
      setFeedbackList([]);
    }
    setFeedbackLoading(false);
  };

  const handleSendFeedback = async (course) => {
    const result = await api.sendFeedbackLinks(course.id);
    if (result.links && result.links.length > 0) {
      const linkList = result.links.map(l => `${l.name}: ${l.url}`).join('\n\n');
      alert(`✅ Feedback links generated for ${result.links.length} learners!\n\nLinks:\n\n${linkList}`);
    } else {
      alert(result.message || 'No attended learners pending feedback.');
    }
  };

  const handleToggleManual = async (isManual) => {
    const result = await api.toggleManualSatisfaction(
      feedbackPopup.id, isManual, isManual ? manualValue : null
    );
    if (result.id) {
      setManualOverride(isManual);
      loadCourses();
      setFeedbackPopup(result);
    }
  };

  const handleSaveManualValue = async () => {
    const result = await api.toggleManualSatisfaction(feedbackPopup.id, true, manualValue);
    if (result.id) {
      loadCourses();
      setFeedbackPopup(result);
      alert('Satisfaction rate updated.');
    }
  };

  const handleSave = async () => {
    if (!form.title) { alert('Course title is required.'); return; }
    try {
      const newCourse = await api.addCourse({
        title:             form.title,
        description:       form.description,
        institute:         form.institute,
        trainer_name:      form.trainer,
        venue:             form.venue,
        start_date:        form.startDate || null,
        end_date:          form.endDate   || null,
        duration_hours:    +form.hours    || 0,
        duration_days:     +form.duration || 0,
        cost_estimated:    +form.cost     || 0,
        budget_realized:   +form.budgetRealized || 0,
        type:              form.type,
        status:            form.status,
        max_learners:      +form.maxLearners || null,
        po_number:         form.po,
        pr_number:         form.pr,
        table_of_contents: form.tableOfContents,
        stars:             +form.stars || 0,
        training_type:     form.trainingType,
      });
      if (newCourse.id) {
        loadCourses();
        setForm(emptyForm);
        setShowAdd(false);
      } else {
        alert(newCourse.error || 'Could not save course.');
      }
    } catch (err) {
      alert('Error connecting to server.');
    }
  };

  const handleEditSave = async () => {
    if (!editForm.title) { alert('Course title is required.'); return; }
    try {
      const updated = await api.updateCourse(editCourse.id, {
        title:             editForm.title,
        description:       editForm.description,
        institute:         editForm.institute,
        trainer_name:      editForm.trainer,
        venue:             editForm.venue,
        start_date:        editForm.startDate || null,
        end_date:          editForm.endDate   || null,
        duration_hours:    +editForm.hours    || 0,
        duration_days:     +editForm.duration || 0,
        cost_estimated:    +editForm.cost     || 0,
        budget_realized:   +editForm.budgetRealized || 0,
        type:              editForm.type,
        status:            editForm.status,
        max_learners:      +editForm.maxLearners || null,
        po_number:         editForm.po,
        pr_number:         editForm.pr,
        table_of_contents: editForm.tableOfContents,
        stars:             +editForm.stars || 0,
        training_type:     editForm.trainingType,
      });
      if (updated.id) {
        loadCourses();
        setEditCourse(null);
      } else {
        alert(updated.error || 'Could not update course.');
      }
    } catch (err) {
      alert('Error connecting to server.');
    }
  };

  const openEdit = (course) => {
    setEditForm({
      title:           course.title             || '',
      description:     course.description       || '',
      duration:        course.duration_days     || '',
      institute:       course.institute         || '',
      hours:           course.duration_hours    || '',
      cost:            course.cost_estimated    || '',
      budgetRealized:  course.budget_realized   || '',
      startDate:       course.start_date ? course.start_date.split('T')[0] : '',
      endDate:         course.end_date   ? course.end_date.split('T')[0]   : '',
      type:            course.type              || 'External',
      status:          course.status            || 'Pending',
      tableOfContents: course.table_of_contents || '',
      maxLearners:     course.max_learners      || '',
      trainer:         course.trainer_name      || '',
      po:              course.po_number         || '',
      pr:              course.pr_number         || '',
      venue:           course.venue             || '',
      stars:           course.stars             || 0,
      trainingType:    course.training_type     || 'Developmental',
    });
    setEditCourse(course);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this course?')) return;
    try {
      await api.deleteCourse(id);
      loadCourses();
    } catch (err) {
      alert('Error deleting course.');
    }
  };

  const fmtDate = d => d
    ? new Date(d).toLocaleDateString('en-GB', {
        day: '2-digit', month: '2-digit', year: 'numeric'
      })
    : '—';

  const enrolledDepts = [...new Set(
    enrolledLearners.map(l => l.department_name).filter(Boolean)
  )];

  const filteredEnrolled = deptFilter
    ? enrolledLearners.filter(l => l.department_name === deptFilter)
    : enrolledLearners;

  const deptBreakdown = enrolledDepts.map(dept => {
    const deptLearners = enrolledLearners.filter(l => l.department_name === dept);
    const attended     = deptLearners.filter(l => l.attended).length;
    return { dept, total: deptLearners.length, attended };
  }).sort((a, b) => b.total - a.total);

  const StatusBadge = ({ status }) => {
    const colors = {
      Completed:   { bg: '#dcfce7', color: '#15803d' },
      Ongoing:     { bg: '#dbeafe', color: '#1d4ed8' },
      Pending:     { bg: '#fef9c3', color: '#a16207' },
      Deactivated: { bg: '#fee2e2', color: '#991b1b' },
      Attended:    { bg: '#dcfce7', color: '#15803d' },
      Enrolled:    { bg: '#f0f9ff', color: '#0369a1' },
    };
    const c = colors[status] || { bg: '#f1f5f9', color: '#475569' };
    return (
      <span style={{
        background: c.bg, color: c.color,
        padding: '3px 10px', borderRadius: '20px',
        fontSize: '11px', fontWeight: '600',
      }}>
        {status}
      </span>
    );
  };

  const TrainingTypeBadge = ({ type }) => (
    <span style={{
      background: type === 'Mandatory' ? '#fee2e2' : '#f0f9ff',
      color:      type === 'Mandatory' ? '#991b1b' : '#0369a1',
      padding: '3px 10px', borderRadius: '20px',
      fontSize: '11px', fontWeight: '600',
    }}>
      {type === 'Mandatory' ? '⚠️ Mandatory' : '📘 Developmental'}
    </span>
  );

  const Stars = ({ value, showPct = false }) => {
    const pct = Math.round((+value / 5) * 100);
    if (showPct) {
      return (
        <span style={{
          background: pct >= 80 ? '#dcfce7' : pct >= 60 ? '#fef9c3' : '#fee2e2',
          color:      pct >= 80 ? '#15803d' : pct >= 60 ? '#a16207' : '#991b1b',
          padding: '2px 8px', borderRadius: '10px',
          fontSize: '11px', fontWeight: '700',
        }}>
          {pct}%
        </span>
      );
    }
    return (
      <span>
        {[1,2,3,4,5].map(i => (
          <span key={i} style={{
            color: i <= Math.round(value) ? '#c8973a' : '#d4d9dd',
            fontSize: '13px',
          }}>★</span>
        ))}
        {+value > 0 && (
          <span style={{ fontSize: '11px', color: '#9baabb', marginLeft: '3px' }}>
            {value}/5
          </span>
        )}
      </span>
    );
  };

  const renderUpcomingCard = (course) => (
    <div key={course.id} style={styles.upcomingCard}>
      <div style={styles.upcomingCardHeader}>
        <span style={{
          padding: '3px 10px', borderRadius: '20px',
          fontSize: '11px', fontWeight: '600',
          background: course.status === 'Ongoing' ? '#dbeafe' : '#fef9c3',
          color:      course.status === 'Ongoing' ? '#1d4ed8' : '#a16207',
        }}>
          {course.status}
        </span>
        <span style={{ fontSize: '11px', color: '#9baabb' }}>
          {course.type || 'External'}
        </span>
      </div>
      <div style={styles.upcomingCardTitle}>{course.title}</div>
      <div style={styles.upcomingCardMeta}>
        <div style={styles.upcomingMetaItem}>
          <span style={styles.upcomingMetaIcon}>👤</span>
          <button
            style={{
              background: 'none', border: 'none', padding: 0,
              fontSize: '12px', color: '#0369a1', cursor: 'pointer',
              fontFamily: 'Inter, sans-serif', textDecoration: 'underline',
            }}
            onClick={() => openTrainerPopup(course.trainer_name)}
          >
            {course.trainer_name || '—'}
          </button>
        </div>
        <div style={styles.upcomingMetaItem}>
          <span style={styles.upcomingMetaIcon}>📅</span>
          <span>{fmtDate(course.start_date)}</span>
        </div>
        <div style={styles.upcomingMetaItem}>
          <span style={styles.upcomingMetaIcon}>📍</span>
          <span>{course.venue || '—'}</span>
        </div>
        <div style={styles.upcomingMetaItem}>
          <span style={styles.upcomingMetaIcon}>👥</span>
          <span>{course.enrolled_count || 0} enrolled</span>
        </div>
      </div>
      <button
        style={styles.upcomingViewBtn}
        onClick={() => openDetail(course)}
      >
        View Details →
      </button>
    </div>
  );

  return (
    <div style={styles.page}>

      {/* ── STAT CARDS ── */}
      <div style={styles.statGrid}>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>📚</div>
          <div style={styles.statNum}>{totalCourses}</div>
          <div style={styles.statLbl}>Total Courses</div>
          <div style={styles.statSub}>Including active, completed</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>⏳</div>
          <div style={styles.statNum}>{ongoingCourses}</div>
          <div style={styles.statLbl}>Ongoing Courses</div>
          <div style={styles.statSub}>{ongoingCourses} in session now</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>✅</div>
          <div style={styles.statNum}>{completedCourses}</div>
          <div style={styles.statLbl}>Completed Courses</div>
          <div style={styles.statSub}>&nbsp;</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>📅</div>
          <div style={styles.statNum}>{upcomingDevelopmental.length + upcomingMandatory.length}</div>
          <div style={styles.statLbl}>Upcoming Courses</div>
          <div style={styles.statSub}>
            {upcomingDevelopmental.length} Dev · {upcomingMandatory.length} Mandatory
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>👥</div>
          <div style={styles.statNum}>{avgParticipation}%</div>
          <div style={styles.statLbl}>Participation Rate</div>
          <div style={styles.statSub}>Attended ÷ Enrolled</div>
        </div>
      </div>

      {/* ── UPCOMING COURSES — SIDE BY SIDE ── */}
      <div style={styles.upcomingSplitGrid}>

        <div style={styles.upcomingSection}>
          <div style={styles.upcomingHeader}>
            <span style={styles.upcomingTitle}>📘 Upcoming Developmental Courses</span>
            <span style={{ fontSize: '12px', color: '#9baabb' }}>
              {upcomingDevelopmental.length}
            </span>
          </div>
          {upcomingDevelopmental.length > 0 ? (
            <div style={styles.upcomingGridSingle}>
              {upcomingDevelopmental.map(renderUpcomingCard)}
            </div>
          ) : (
            <div style={styles.upcomingEmpty}>No upcoming developmental courses.</div>
          )}
        </div>

        <div style={{ ...styles.upcomingSection, borderColor: '#fecaca' }}>
          <div style={styles.upcomingHeader}>
            <span style={styles.upcomingTitle}>⚠️ Upcoming Mandatory Courses</span>
            <span style={{ fontSize: '12px', color: '#9baabb' }}>
              {upcomingMandatory.length}
            </span>
          </div>
          {upcomingMandatory.length > 0 ? (
            <div style={styles.upcomingGridSingle}>
              {upcomingMandatory.map(renderUpcomingCard)}
            </div>
          ) : (
            <div style={styles.upcomingEmpty}>No upcoming mandatory courses.</div>
          )}
        </div>

      </div>

      {/* ── CONTROLS ── */}
      <div style={styles.controls}>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={styles.searchWrap}>
            <span>🔍</span>
            <input
              style={styles.searchInput}
              placeholder="Search by Course Title"
              value={searchTitle}
              onChange={e => handleSearch(e.target.value)}
            />
          </div>

          <select
            value={filterDept}
            onChange={e => { setFilterDept(e.target.value); setCurrentPage(1); }}
            style={styles.filterSelect}
          >
            <option value="">All Departments</option>
            {departments.map(d => (
              <option key={d.id} value={d.name}>{d.name}</option>
            ))}
          </select>

          <div style={styles.dateFilterPair}>
            <input
              type="date"
              value={filterStartDate}
              onChange={e => { setFilterStartDate(e.target.value); setCurrentPage(1); }}
              style={styles.dateInputSmall}
              title="Filter from date"
            />
            <span style={{ fontSize: '12px', color: '#9baabb' }}>to</span>
            <input
              type="date"
              value={filterEndDate}
              onChange={e => { setFilterEndDate(e.target.value); setCurrentPage(1); }}
              style={styles.dateInputSmall}
              title="Filter to date"
            />
          </div>

          {(filterDept || filterStartDate || filterEndDate) && (
            <button
              onClick={() => {
                setFilterDept(''); setFilterStartDate(''); setFilterEndDate('');
                setCurrentPage(1);
              }}
              style={styles.clearFilterBtn}
            >
              ✕ Clear Filters
            </button>
          )}
        </div>
        <button style={styles.addBtn} onClick={() => setShowAdd(true)}>
          Add Course
        </button>
      </div>

      {/* ── TABLE ── */}
      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#9baabb' }}>
          Loading courses...
        </div>
      ) : (
        <div style={styles.tableWrap}>
          <div style={styles.tableTitle}>
            Courses
            {(filterStartDate || filterEndDate) && (
              <span style={{ fontSize: '13px', color: '#0369a1', fontWeight: '500', marginLeft: '8px' }}>
                — {filterStartDate || '...'} to {filterEndDate || '...'}
              </span>
            )}
            {searchTitle && (
              <span style={{ fontSize: '13px', color: '#9baabb', fontWeight: '400', marginLeft: '8px' }}>
                {totalFiltered} result{totalFiltered !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ ...styles.table, minWidth: '1180px' }}>
              <thead>
                <tr style={styles.theadRow}>
                  {['No.', 'Name', 'Training Type', 'Institute', 'Trainer', 'Start Date', 'End Date',
                    'Type', 'Status', 'Enrolled', 'Attended',
                    'Participation Rate', 'Total Learning Hours',
                    'Satisfaction Rate', ''].map(h => (
                    <th key={h} style={styles.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.map((course, i) => {
                  const enrolled   = +course.enrolled_count || 0;
                  const attended   = +course.attended_count || 0;
                  const hours      = +course.duration_hours || 0;
                  const totalHours = hours * attended;
                  const attRate    = enrolled > 0
                    ? Math.round(attended / enrolled * 100) + '%'
                    : '—';

                  return (
                    <tr key={course.id} style={styles.tr}>
                      <td style={styles.td}>
                        {(currentPage - 1) * ITEMS_PER_PAGE + i + 1}
                      </td>
                      <td style={{ ...styles.td, minWidth: '180px' }}>
                        <button
                          style={styles.courseNameBtn}
                          onClick={() => openDetail(course)}
                        >
                          {course.title}
                        </button>
                      </td>
                      <td style={styles.td}>
                        <TrainingTypeBadge type={course.training_type || 'Developmental'} />
                      </td>
                      <td style={{ ...styles.td, color: '#5a6878', fontSize: '12px', minWidth: '120px' }}>
                        {course.institute || '—'}
                      </td>
                      <td style={{ ...styles.td, minWidth: '130px' }}>
                        {course.trainer_name ? (
                          <button
                            style={styles.trainerNameBtn}
                            onClick={() => openTrainerPopup(course.trainer_name)}
                          >
                            {course.trainer_name}
                          </button>
                        ) : '—'}
                      </td>
                      <td style={{ ...styles.td, fontSize: '12px', color: '#5a6878', whiteSpace: 'nowrap' }}>
                        {fmtDate(course.start_date)}
                      </td>
                      <td style={{ ...styles.td, fontSize: '12px', color: '#5a6878', whiteSpace: 'nowrap' }}>
                        {fmtDate(course.end_date)}
                      </td>
                      <td style={styles.td}>
                        <span style={{
                          ...styles.typeBadge,
                          background: course.type === 'Internal' ? '#f0f9ff' : '#fdf4ff',
                          color:      course.type === 'Internal' ? '#0369a1' : '#7c3aed',
                        }}>
                          {course.type || 'External'}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <StatusBadge status={course.status} />
                      </td>
                      <td style={{ ...styles.td, fontWeight: 600 }}>{enrolled}</td>
                      <td style={{ ...styles.td, fontWeight: 600, color: '#15803d' }}>{attended}</td>
                      <td style={styles.td}>
                        <span style={{
                          background: attended === 0 ? '#f1f5f9'
                            : attended / Math.max(enrolled, 1) >= 0.9 ? '#dcfce7'
                            : attended / Math.max(enrolled, 1) >= 0.7 ? '#fef9c3' : '#fee2e2',
                          color: attended === 0 ? '#475569'
                            : attended / Math.max(enrolled, 1) >= 0.9 ? '#15803d'
                            : attended / Math.max(enrolled, 1) >= 0.7 ? '#a16207' : '#991b1b',
                          padding: '2px 8px', borderRadius: '10px',
                          fontSize: '11px', fontWeight: '700',
                        }}>
                          {attRate}
                        </span>
                      </td>
                      <td style={{ ...styles.td, fontWeight: 600 }}>
                        {totalHours > 0 ? totalHours + 'h' : '—'}
                      </td>
                      <td style={styles.td}>
                        <button
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                          onClick={() => openFeedbackPopup(course)}
                          title="View feedback / satisfaction details"
                        >
                          {+course.stars > 0
                            ? <Stars value={course.stars} showPct={true} />
                            : <span style={{ color: '#9baabb', fontSize: '12px', textDecoration: 'underline' }}>Rate now</span>
                          }
                        </button>
                      </td>
                      <td style={{ ...styles.td, whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            style={styles.actionBtn}
                            onClick={() => openEdit(course)}
                            title="Edit"
                          >✏️</button>
                          <button
                            style={{ ...styles.actionBtn, background: '#fee2e2' }}
                            onClick={() => handleDelete(course.id)}
                            title="Delete"
                          >🗑️</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filtered.length === 0 && (
            <div style={{ padding: '40px', textAlign: 'center', color: '#9baabb', fontSize: '14px' }}>
              {courses.length === 0
                ? 'No courses yet. Click "Add Course" to get started.'
                : 'No courses found.'
              }
            </div>
          )}

          <Pagination
            currentPage={currentPage}
            totalItems={totalFiltered}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* ── ADD COURSE MODAL ── */}
      {showAdd && (
        <div style={styles.overlay} onClick={() => setShowAdd(false)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <span style={styles.modalTitle}>Add Course</span>
              <button style={styles.modalClose} onClick={() => setShowAdd(false)}>×</button>
            </div>
            <div style={styles.modalBody}>
              <CourseForm f={form} setF={setForm} trainers={trainers} />
            </div>
            <div style={styles.modalFooter}>
              <button style={styles.cancelBtn} onClick={() => setShowAdd(false)}>Cancel</button>
              <button style={styles.saveBtn} onClick={handleSave}>Add</button>
            </div>
          </div>
        </div>
      )}

      {/* ── EDIT COURSE MODAL ── */}
      {editCourse && (
        <div style={styles.overlay} onClick={() => setEditCourse(null)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <span style={styles.modalTitle}>Edit Course</span>
              <button style={styles.modalClose} onClick={() => setEditCourse(null)}>×</button>
            </div>
            <div style={styles.modalBody}>
              <CourseForm f={editForm} setF={setEditForm} trainers={trainers} />
            </div>
            <div style={styles.modalFooter}>
              <button style={styles.cancelBtn} onClick={() => setEditCourse(null)}>Cancel</button>
              <button style={styles.saveBtn} onClick={handleEditSave}>Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* ── COURSE DETAIL POPUP ── */}
      {selected && (
        <div style={styles.overlay} onClick={() => {
          setSelected(null); setProfileLearner(null); setDeptFilter('');
        }}>
          <div style={{ ...styles.modal, maxWidth: '860px' }}
            onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <div>
                <span style={styles.modalTitle}>{selected.title}</span>
                <div style={{ marginTop: '4px' }}>
                  <TrainingTypeBadge type={selected.training_type || 'Developmental'} />
                </div>
              </div>
              <button style={styles.modalClose} onClick={() => {
                setSelected(null); setProfileLearner(null); setDeptFilter('');
              }}>×</button>
            </div>
            <div style={styles.modalBody}>

              <div style={styles.coverImg}>
                <div style={{ fontSize: '40px' }}>📚</div>
              </div>

              <div style={styles.infoBar}>
                {[
                  ['Start Date',           fmtDate(selected.start_date)],
                  ['End Date',             fmtDate(selected.end_date)],
                  ['Training Hours',       (selected.duration_hours || 0) + 'h'],
                  ['Enrolled',             selected.enrolled_count  || 0],
                  ['Attended',             selected.attended_count  || 0],
                  ['Participation Rate',   selected.enrolled_count > 0
                    ? Math.round((+selected.attended_count || 0) /
                      (+selected.enrolled_count) * 100) + '%' : '—'],
                  ['Total Learning Hours', ((+selected.duration_hours || 0) *
                    (+selected.attended_count || 0)) + 'h'],
                  ['Status',               selected.status],
                ].map(([k, v]) => (
                  <div key={k} style={styles.infoBarItem}>
                    <div style={styles.infoBarLabel}>{k}</div>
                    <div style={{
                      ...styles.infoBarValue,
                      color: k === 'Attended' ? '#15803d' : '#051c2c',
                    }}>
                      {v}
                    </div>
                  </div>
                ))}
              </div>

              {(+selected.enrolled_count || 0) > 0 && (
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '12px', fontWeight: '600', color: '#051c2c' }}>
                      Enrolled vs Attended
                    </span>
                    <span style={{ fontSize: '12px', color: '#5a6878' }}>
                      {selected.attended_count || 0} of {selected.enrolled_count} attended
                    </span>
                  </div>
                  <div style={{ height: '8px', background: '#e8ecf0', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      width: Math.round((+selected.attended_count || 0) /
                        (+selected.enrolled_count) * 100) + '%',
                      background: '#051c2c', borderRadius: '4px',
                    }} />
                  </div>
                </div>
              )}

              <div style={styles.detailGrid}>
                {[
                  ['Description',     selected.description || '—'],
                  ['Duration',        (selected.duration_days || '—') + ' days'],
                  ['Type',            selected.type || 'External'],
                  ['Max Learners',    selected.max_learners || '—'],
                  ['Cost (AED)',      'AED ' + (+selected.cost_estimated || 0).toLocaleString()],
                  ['Budget Realized', selected.budget_realized
                    ? 'AED ' + (+selected.budget_realized).toLocaleString() : '—'],
                  ['Venue',           selected.venue || '—'],
                  ['PO #',            selected.po_number || '—'],
                  ['PR #',            selected.pr_number || '—'],
                  ['Institute',       selected.institute || '—'],
                ].map(([k, v]) => (
                  <div key={k}>
                    <div style={{ fontSize: '10px', fontWeight: '700', color: '#9baabb', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
                      {k}
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: '500', color: '#051c2c' }}>{v}</div>
                  </div>
                ))}
                <div>
                  <div style={{ fontSize: '10px', fontWeight: '700', color: '#9baabb', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
                    Trainer
                  </div>
                  {selected.trainer_name ? (
                    <button
                      style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontSize: '13px', fontWeight: '600', color: '#0369a1', fontFamily: 'Inter, sans-serif', textDecoration: 'underline' }}
                      onClick={() => openTrainerPopup(selected.trainer_name)}
                    >
                      {selected.trainer_name}
                    </button>
                  ) : '—'}
                </div>
                <div>
                  <div style={{ fontSize: '10px', fontWeight: '700', color: '#9baabb', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
                    Satisfaction Rate
                  </div>
                  <button
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                    onClick={() => openFeedbackPopup(selected)}
                  >
                    {+selected.stars > 0
                      ? <Stars value={selected.stars} showPct={true} />
                      : <span style={{ color: '#9baabb', fontSize: '13px', textDecoration: 'underline' }}>Rate now</span>
                    }
                  </button>
                </div>
              </div>

              {!enrollLoading && deptBreakdown.length > 0 && (
                <div style={{ marginTop: '20px' }}>
                  <div style={styles.sectionLabel}>
                    Department Breakdown
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '14px' }}>
                    <button
                      onClick={() => setDeptFilter('')}
                      style={{
                        padding: '5px 12px', borderRadius: '20px', border: 'none',
                        fontSize: '12px', fontWeight: '600', cursor: 'pointer',
                        fontFamily: 'Inter, sans-serif',
                        background: deptFilter === '' ? '#051c2c' : '#f2f4f6',
                        color:      deptFilter === '' ? '#ffffff' : '#5a6878',
                      }}
                    >
                      All ({enrolledLearners.length})
                    </button>
                    {deptBreakdown.map(({ dept, total, attended }) => (
                      <button
                        key={dept}
                        onClick={() => setDeptFilter(dept === deptFilter ? '' : dept)}
                        style={{
                          padding: '5px 12px', borderRadius: '20px', border: 'none',
                          fontSize: '12px', fontWeight: '600', cursor: 'pointer',
                          fontFamily: 'Inter, sans-serif',
                          background: deptFilter === dept ? '#051c2c' : '#f2f4f6',
                          color:      deptFilter === dept ? '#ffffff' : '#5a6878',
                        }}
                      >
                        {dept} ({total}) {attended > 0 && `· ${attended} attended`}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ marginTop: '8px' }}>
                <div style={styles.sectionLabel}>
                  Enrolled Learners
                  <span style={{ fontSize: '11px', color: '#9baabb', fontWeight: '400', marginLeft: '8px' }}>
                    {filteredEnrolled.length} {deptFilter ? `from ${deptFilter}` : 'total'} ·{' '}
                    {filteredEnrolled.filter(l => l.attended).length} attended
                  </span>
                </div>

                {enrollLoading ? (
                  <div style={{ padding: '24px', textAlign: 'center', color: '#9baabb', fontSize: '13px' }}>
                    Loading learners...
                  </div>
                ) : filteredEnrolled.length > 0 ? (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '550px' }}>
                      <thead>
                        <tr style={{ background: '#f8f9fa', borderBottom: '1px solid #e8ecf0' }}>
                          {['Name', 'Emp ID', 'Department', 'Status', 'Feedback', 'Enrolled On'].map(h => (
                            <th key={h} style={{
                              padding: '10px 12px', textAlign: 'left',
                              fontSize: '10px', fontWeight: '700',
                              color: '#9baabb', textTransform: 'uppercase',
                              letterSpacing: '0.5px', whiteSpace: 'nowrap',
                            }}>
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {filteredEnrolled.map(learner => (
                          <tr key={learner.id} style={{ borderBottom: '1px solid #f0f2f4' }}>
                            <td style={{ padding: '10px 12px' }}>
                              <button
                                style={{
                                  background: 'none', border: 'none', cursor: 'pointer',
                                  fontSize: '13px', fontWeight: '600', color: '#051c2c',
                                  padding: 0, fontFamily: 'Inter, sans-serif',
                                  display: 'flex', alignItems: 'center', gap: '8px',
                                }}
                                onClick={() => setProfileLearner(learner)}
                              >
                                <div style={{
                                  width: '26px', height: '26px', borderRadius: '50%',
                                  background: '#051c2c', color: '#ffffff',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  fontSize: '9px', fontWeight: '700', flexShrink: 0,
                                }}>
                                  {learner.name.split(' ').slice(0,2).map(w => w[0]).join('')}
                                </div>
                                {learner.name}
                              </button>
                            </td>
                            <td style={{ padding: '10px 12px', fontSize: '12px', fontFamily: 'monospace', color: '#5a6878' }}>
                              {learner.emp_id || '—'}
                            </td>
                            <td style={{ padding: '10px 12px', fontSize: '12px', color: '#5a6878' }}>
                              {learner.department_name
                                ? (
                                  <span style={{
                                    background: '#f0f9ff', color: '#0369a1',
                                    padding: '2px 8px', borderRadius: '10px',
                                    fontSize: '11px', fontWeight: '600',
                                  }}>
                                    {learner.department_name}
                                  </span>
                                ) : '—'}
                            </td>
                            <td style={{ padding: '10px 12px' }}>
                              <span style={{
                                background: learner.attended ? '#dcfce7' : '#f0f9ff',
                                color:      learner.attended ? '#15803d' : '#0369a1',
                                padding: '2px 8px', borderRadius: '10px',
                                fontSize: '11px', fontWeight: '600',
                              }}>
                                {learner.attended ? 'Attended' : 'Enrolled'}
                              </span>
                            </td>
                            <td style={{ padding: '10px 12px' }}>
                              {learner.attended ? (
                                <span style={{
                                  background: learner.feedback_submitted ? '#dcfce7' : '#fef9c3',
                                  color:      learner.feedback_submitted ? '#15803d' : '#a16207',
                                  padding: '2px 8px', borderRadius: '10px',
                                  fontSize: '11px', fontWeight: '600',
                                }}>
                                  {learner.feedback_submitted ? '✓ Submitted' : 'Pending'}
                                </span>
                              ) : (
                                <span style={{ color: '#9baabb', fontSize: '11px' }}>—</span>
                              )}
                            </td>
                            <td style={{ padding: '10px 12px', fontSize: '12px', color: '#9baabb', whiteSpace: 'nowrap' }}>
                              {learner.enrolled_at
                                ? new Date(learner.enrolled_at).toLocaleDateString('en-GB')
                                : '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div style={{ padding: '20px', background: '#f8f9fa', borderRadius: '8px', border: '1px solid #e8ecf0', textAlign: 'center', fontSize: '13px', color: '#9baabb' }}>
                    {deptFilter
                      ? `No learners from ${deptFilter} enrolled in this course.`
                      : 'No learners enrolled in this course yet.'
                    }
                  </div>
                )}
              </div>

            </div>
            <div style={styles.modalFooter}>
              <button style={styles.cancelBtn} onClick={() => {
                setSelected(null); setProfileLearner(null); setDeptFilter('');
              }}>
                Close
              </button>
              <button
                style={{ ...styles.cancelBtn, background: '#dbeafe', color: '#1d4ed8', border: 'none' }}
                onClick={async () => {
                  const result = await api.sendCheckinLinks(selected.id);
                  if (result.links && result.links.length > 0) {
                    const linkList = result.links.map(l => `${l.name}: ${l.url}`).join('\n\n');
                    alert(`✅ Check-in links generated for ${result.links.length} learners!\n\nLinks:\n\n${linkList}`);
                  } else {
                    alert(result.message || 'No learners found.');
                  }
                }}
              >
                📧 Send Check-in Links
              </button>
              <button
                style={{
                  ...styles.cancelBtn,
                  background: (+selected.attended_count || 0) > 0 ? '#dcfce7' : '#f1f5f9',
                  color:      (+selected.attended_count || 0) > 0 ? '#15803d' : '#9baabb',
                  border: 'none',
                  cursor: (+selected.attended_count || 0) > 0 ? 'pointer' : 'not-allowed',
                }}
                disabled={(+selected.attended_count || 0) === 0}
                onClick={() => handleSendFeedback(selected)}
                title={(+selected.attended_count || 0) === 0 ? 'No attended learners yet' : 'Send feedback form'}
              >
                📝 Send Feedback Form
              </button>
              <button style={styles.saveBtn} onClick={() => {
                setSelected(null);
                openEdit(selected);
              }}>
                Edit Course
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── LEARNER MINI PROFILE ── */}
      {profileLearner && (
        <div style={{ ...styles.overlay, zIndex: 1100 }} onClick={() => setProfileLearner(null)}>
          <div style={{ ...styles.modal, maxWidth: '420px' }} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <span style={styles.modalTitle}>Learner Profile</span>
              <button style={styles.modalClose} onClick={() => setProfileLearner(null)}>×</button>
            </div>
            <div style={styles.modalBody}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px', background: '#f8f9fa', borderRadius: '10px', border: '1px solid #e8ecf0', marginBottom: '16px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#051c2c', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: '700', flexShrink: 0 }}>
                  {profileLearner.name.split(' ').slice(0,2).map(w => w[0]).join('').toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: '16px', fontWeight: '700', color: '#051c2c' }}>
                    {profileLearner.name}
                  </div>
                  <div style={{ fontSize: '12px', color: '#5a6878', marginTop: '2px' }}>
                    {profileLearner.designation || '—'}
                  </div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                {[
                  ['Emp ID',      profileLearner.emp_id          || '—'],
                  ['Department',  profileLearner.department_name || '—'],
                  ['Email',       profileLearner.email           || '—'],
                  ['Nationality', profileLearner.nationality     || '—'],
                  ['Gender',      profileLearner.gender          || '—'],
                  ['Status',      profileLearner.enrollment_status || '—'],
                ].map(([k, v]) => (
                  <div key={k}>
                    <div style={{ fontSize: '10px', fontWeight: '700', color: '#9baabb', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>{k}</div>
                    <div style={{ fontSize: '13px', fontWeight: '500', color: '#051c2c' }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={styles.modalFooter}>
              <button style={styles.cancelBtn} onClick={() => setProfileLearner(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* ── TRAINER POPUP ── */}
      {trainerPopup && (
        <div style={{ ...styles.overlay, zIndex: 1100 }} onClick={() => setTrainerPopup(null)}>
          <div style={{ ...styles.modal, maxWidth: '500px' }} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <span style={styles.modalTitle}>Trainer Profile</span>
              <button style={styles.modalClose} onClick={() => setTrainerPopup(null)}>×</button>
            </div>
            <div style={styles.modalBody}>
              {trainerPopup.notFound ? (
                <div style={{ padding: '20px', textAlign: 'center', color: '#9baabb' }}>
                  Trainer <strong>{trainerPopup.name}</strong> is not in the system yet.
                  Add them on the Trainers page.
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', background: '#f8f9fa', borderRadius: '10px', border: '1px solid #e8ecf0', marginBottom: '16px' }}>
                    <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: '#051c2c', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: '700', flexShrink: 0 }}>
                      {trainerPopup.name.split(' ').slice(0,2).map(w => w[0]).join('').toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '16px', fontWeight: '700', color: '#051c2c' }}>{trainerPopup.name}</div>
                      <div style={{ fontSize: '12px', color: '#5a6878', marginTop: '2px' }}>{trainerPopup.institute || '—'}</div>
                      <div style={{ marginTop: '6px' }}><Stars value={trainerPopup.rating} /></div>
                    </div>
                    <span style={{
                      padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600',
                      background: trainerPopup.type === 'Internal' ? '#f0f9ff' : '#fdf4ff',
                      color:      trainerPopup.type === 'Internal' ? '#0369a1' : '#7c3aed',
                    }}>
                      {trainerPopup.type || 'External'}
                    </span>
                  </div>
                  {trainerPopup.bio && (
                    <div style={{ fontSize: '13px', color: '#5a6878', lineHeight: 1.65, padding: '12px 16px', background: '#f8f9fa', borderRadius: '8px', borderLeft: '3px solid #051c2c', marginBottom: '16px' }}>
                      {trainerPopup.bio}
                    </div>
                  )}
                  {trainerPopup.expertise && trainerPopup.expertise.length > 0 && (
                    <div style={{ marginBottom: '16px' }}>
                      <div style={{ fontSize: '11px', fontWeight: '700', color: '#5a6878', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
                        Areas of Expertise
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {(Array.isArray(trainerPopup.expertise) ? trainerPopup.expertise : [trainerPopup.expertise]).map((e, i) => (
                          <span key={i} style={{ background: '#f2f4f6', border: '1px solid #e8ecf0', borderRadius: '20px', padding: '3px 10px', fontSize: '12px', color: '#051c2c' }}>
                            {e}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    {[
                      ['Phone', trainerPopup.phone || '—'],
                      ['Email', trainerPopup.email || '—'],
                    ].map(([k, v]) => (
                      <div key={k}>
                        <div style={{ fontSize: '10px', fontWeight: '700', color: '#9baabb', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>{k}</div>
                        <div style={{ fontSize: '13px', fontWeight: '500', color: '#051c2c' }}>{v}</div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
            <div style={styles.modalFooter}>
              <button style={styles.cancelBtn} onClick={() => setTrainerPopup(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* ── FEEDBACK / SATISFACTION POPUP ── */}
      {feedbackPopup && (
        <div style={{ ...styles.overlay, zIndex: 1100 }} onClick={() => setFeedbackPopup(null)}>
          <div style={{ ...styles.modal, maxWidth: '620px' }} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <span style={styles.modalTitle}>Satisfaction Rate — {feedbackPopup.title}</span>
              <button style={styles.modalClose} onClick={() => setFeedbackPopup(null)}>×</button>
            </div>
            <div style={styles.modalBody}>

              {/* Manual vs Auto toggle */}
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '14px 16px', background: '#f8f9fa', borderRadius: '10px',
                border: '1px solid #e8ecf0', marginBottom: '18px',
              }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#051c2c' }}>
                    {manualOverride ? 'Manually Set' : 'Auto-calculated from feedback'}
                  </div>
                  <div style={{ fontSize: '11px', color: '#9baabb', marginTop: '2px' }}>
                    {manualOverride
                      ? 'Admin has overridden the satisfaction rate'
                      : `Based on ${feedbackList.length} feedback response${feedbackList.length !== 1 ? 's' : ''}`
                    }
                  </div>
                </div>
                <div style={styles.periodToggleSmall}>
                  <button
                    onClick={() => handleToggleManual(false)}
                    style={{
                      ...styles.periodBtnSmall,
                      ...(!manualOverride ? styles.periodBtnActiveSmall : {}),
                    }}
                  >
                    Auto
                  </button>
                  <button
                    onClick={() => handleToggleManual(true)}
                    style={{
                      ...styles.periodBtnSmall,
                      ...(manualOverride ? styles.periodBtnActiveSmall : {}),
                    }}
                  >
                    Manual
                  </button>
                </div>
              </div>

              {manualOverride && (
                <div style={{ marginBottom: '18px', padding: '14px 16px', background: '#fef9c3', borderRadius: '10px', border: '1px solid #fde68a' }}>
                  <div style={{ fontSize: '12px', fontWeight: '600', color: '#92400e', marginBottom: '8px' }}>
                    Set Manual Satisfaction Rate
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {[1,2,3,4,5].map(star => (
                        <button
                          key={star}
                          style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            fontSize: '26px', padding: '2px',
                            color: star <= manualValue ? '#c8973a' : '#d4d9dd',
                          }}
                          onClick={() => setManualValue(star)}
                        >★</button>
                      ))}
                    </div>
                    <span style={{ fontSize: '14px', fontWeight: '700', color: '#c8973a' }}>
                      {Math.round((manualValue / 5) * 100)}%
                    </span>
                    <button
                      onClick={handleSaveManualValue}
                      style={{
                        marginLeft: 'auto', background: '#051c2c', color: '#ffffff',
                        border: 'none', borderRadius: '6px', padding: '6px 14px',
                        fontSize: '12px', fontWeight: '600', cursor: 'pointer',
                        fontFamily: 'Inter, sans-serif',
                      }}
                    >
                      Save
                    </button>
                  </div>
                </div>
              )}

              {/* Current rate display */}
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <Stars value={feedbackPopup.stars} size={20} />
                <div style={{ fontSize: '28px', fontWeight: '800', color: '#c8973a', marginTop: '6px' }}>
                  {Math.round((+feedbackPopup.stars / 5) * 100)}%
                </div>
              </div>

              {/* Feedback responses list */}
              <div style={styles.sectionLabel}>
                Feedback Responses ({feedbackList.length})
              </div>

              {feedbackLoading ? (
                <div style={{ padding: '20px', textAlign: 'center', color: '#9baabb', fontSize: '13px' }}>
                  Loading...
                </div>
              ) : feedbackList.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '300px', overflowY: 'auto' }}>
                  {feedbackList.map((f, i) => (
                    <div key={i} style={{
                      padding: '12px 14px', borderRadius: '8px',
                      border: '1px solid #e8ecf0', background: '#f8f9fa',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{ fontSize: '13px', fontWeight: '600', color: '#051c2c' }}>
                          {f.learner_name}
                        </span>
                        <span style={{ fontSize: '11px', color: '#9baabb' }}>
                          {f.submitted_at ? new Date(f.submitted_at).toLocaleDateString('en-GB') : '—'}
                        </span>
                      </div>
                      <div style={{ fontSize: '11px', color: '#5a6878', marginBottom: '6px' }}>
                        {f.department_name || '—'} · {f.emp_id || '—'}
                      </div>
                      <div style={{ display: 'flex', gap: '16px', fontSize: '12px' }}>
                        <span>Satisfaction: <strong style={{ color: '#c8973a' }}>{f.satisfaction}/5</strong></span>
                        <span>Recommend: <strong style={{ color: '#c8973a' }}>{f.would_recommend}/5</strong></span>
                      </div>
                      {f.testimonial && (
                        <div style={{ fontSize: '12px', color: '#5a6878', marginTop: '8px', fontStyle: 'italic', borderTop: '1px solid #e8ecf0', paddingTop: '8px' }}>
                          "{f.testimonial}"
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ padding: '20px', background: '#f8f9fa', borderRadius: '8px', border: '1px solid #e8ecf0', textAlign: 'center', fontSize: '13px', color: '#9baabb' }}>
                  No feedback responses yet. Send the feedback form to attended learners.
                </div>
              )}

            </div>
            <div style={styles.modalFooter}>
              <button style={styles.cancelBtn} onClick={() => setFeedbackPopup(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

function CourseForm({ f, setF, trainers }) {
  const [hoverStar, setHoverStar] = React.useState(0);
  return (
    <>
      <div style={styles.photoRow}>
        <div style={styles.photoBox}>
          <div style={{ fontSize: '24px' }}>🖼</div>
          <div style={{ fontSize: '10px', color: '#9baabb', marginTop: '4px' }}>Photo</div>
        </div>
        <div style={{ flex: 1 }}>
          <F label="Course Title *" value={f.title} onChange={v => setF({...f, title: v})} placeholder="e.g. Advanced Negotiation Skills" />
        </div>
      </div>
      <div style={{ marginBottom: '14px' }}>
        <label style={{ fontSize: '11px', fontWeight: '700', color: '#5a6878', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '5px' }}>
          Description
        </label>
        <textarea
          value={f.description}
          onChange={e => setF({...f, description: e.target.value})}
          placeholder="What will participants learn?"
          style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #e8ecf0', borderRadius: '8px', fontSize: '13px', outline: 'none', background: '#f8f9fa', color: '#051c2c', fontFamily: 'Inter, sans-serif', minHeight: '70px', resize: 'vertical', boxSizing: 'border-box' }}
        />
      </div>

      <div style={{ marginBottom: '14px' }}>
        <F label="Training Type *" value={f.trainingType} onChange={v => setF({...f, trainingType: v})}
          type="select" options={['Developmental', 'Mandatory']} />
      </div>

      <div style={styles.formGrid}>
        <F label="Duration (Days)"       value={f.duration}       onChange={v => setF({...f, duration: v})}       placeholder="e.g. 3"     type="number" />
        <F label="Institute"             value={f.institute}      onChange={v => setF({...f, institute: v})}      placeholder="e.g. RERA Academy" />
        <F label="Training Hours *"      value={f.hours}          onChange={v => setF({...f, hours: v})}          placeholder="e.g. 24"    type="number" />
        <F label="Cost (AED) Estimated"  value={f.cost}           onChange={v => setF({...f, cost: v})}           placeholder="e.g. 15000" type="number" />
        <F label="Budget Realized (AED)" value={f.budgetRealized} onChange={v => setF({...f, budgetRealized: v})} placeholder="e.g. 13000" type="number" />
        <F label="Start Date"            value={f.startDate}      onChange={v => setF({...f, startDate: v})}      type="date" />
        <F label="End Date"              value={f.endDate}        onChange={v => setF({...f, endDate: v})}        type="date" />
        <F label="External / Internal"   value={f.type}           onChange={v => setF({...f, type: v})}           type="select" options={['External','Internal']} />
        <F label="Status"                value={f.status}         onChange={v => setF({...f, status: v})}         type="select" options={['Pending','Ongoing','Completed','Deactivated']} />
        <F label="No. of Learners"       value={f.maxLearners}    onChange={v => setF({...f, maxLearners: v})}    placeholder="e.g. 20"    type="number" />
        <F label="Trainer"               value={f.trainer}        onChange={v => setF({...f, trainer: v})}
          type="select"
          options={trainers.length > 0
            ? trainers.map(t => ({ label: t.name, value: t.name }))
            : [{ label: 'No trainers yet', value: '' }]
          }
        />
        <F label="PO #"                  value={f.po}             onChange={v => setF({...f, po: v})}             placeholder="e.g. PO-2025-001" />
        <F label="Purchase Request #"    value={f.pr}             onChange={v => setF({...f, pr: v})}             placeholder="e.g. PR-2025-001" />
        <F label="Venue"                 value={f.venue}          onChange={v => setF({...f, venue: v})}          placeholder="e.g. Dubai HQ" />
      </div>

      <div style={{ marginTop: '16px', padding: '16px', background: '#f8f9fa', borderRadius: '10px', border: '1px solid #e8ecf0' }}>
        <label style={{ fontSize: '11px', fontWeight: '700', color: '#5a6878', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '10px' }}>
          Satisfaction Rate (initial — will switch to auto once feedback is received)
        </label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ display: 'flex', gap: '4px' }}>
            {[1,2,3,4,5].map(star => (
              <button
                key={star}
                type="button"
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: '30px', padding: '2px', lineHeight: 1,
                  color: star <= (hoverStar || +f.stars || 0) ? '#c8973a' : '#d4d9dd',
                  transition: 'color 0.1s',
                }}
                onMouseEnter={() => setHoverStar(star)}
                onMouseLeave={() => setHoverStar(0)}
                onClick={() => setF({...f, stars: star})}
              >
                ★
              </button>
            ))}
          </div>
          {+f.stars > 0 && (
            <span style={{ fontSize: '15px', fontWeight: '700', color: '#c8973a' }}>
              {Math.round((+f.stars / 5) * 100)}%
            </span>
          )}
          {+f.stars > 0 && (
            <button
              type="button"
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '11px', color: '#9baabb', textDecoration: 'underline', fontFamily: 'Inter, sans-serif' }}
              onClick={() => setF({...f, stars: 0})}
            >
              Clear
            </button>
          )}
        </div>
      </div>
    </>
  );
}

function F({ label, value, onChange, placeholder, type = 'text', options = [] }) {
  const inputStyle = {
    width: '100%', padding: '9px 12px', border: '1.5px solid #e8ecf0',
    borderRadius: '8px', fontSize: '13px', outline: 'none',
    background: '#f8f9fa', color: '#051c2c', fontFamily: 'Inter, sans-serif',
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
      <label style={{ fontSize: '11px', fontWeight: '700', color: '#5a6878', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        {label}
      </label>
      {type === 'select' ? (
        <select value={value} onChange={e => onChange(e.target.value)} style={inputStyle}>
          <option value="">Select...</option>
          {options.map(o =>
            typeof o === 'object'
              ? <option key={o.value} value={o.value}>{o.label}</option>
              : <option key={o} value={o}>{o}</option>
          )}
        </select>
      ) : (
        <input type={type} value={value} placeholder={placeholder}
          onChange={e => onChange(e.target.value)} style={inputStyle} />
      )}
    </div>
  );
}

const styles = {
  page:                 { padding: '30px', minHeight: '100vh', background: '#f2f4f6', fontFamily: 'Inter, sans-serif' },
  statGrid:             { display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '14px', marginBottom: '20px' },
  statCard:             { background: '#051c2c', color: '#ffffff', borderRadius: '12px', padding: '18px 16px', display: 'flex', flexDirection: 'column', gap: '4px' },
  statIcon:             { fontSize: '20px', marginBottom: '4px' },
  statNum:              { fontSize: '28px', fontWeight: '800', color: '#ffffff', lineHeight: 1 },
  statLbl:              { fontSize: '12px', fontWeight: '600', color: '#b6bdc2' },
  statSub:              { fontSize: '11px', color: 'rgba(182,189,194,0.6)' },
  upcomingSplitGrid:    { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' },
  upcomingSection:      { background: '#ffffff', borderRadius: '12px', border: '1px solid #e8ecf0', padding: '18px' },
  upcomingHeader:       { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' },
  upcomingTitle:        { fontSize: '14px', fontWeight: '700', color: '#051c2c' },
  upcomingGridSingle:   { display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '420px', overflowY: 'auto' },
  upcomingEmpty:        { padding: '24px', textAlign: 'center', color: '#9baabb', fontSize: '13px' },
  upcomingCard:         { background: '#f8f9fa', borderRadius: '10px', border: '1px solid #e8ecf0', padding: '14px', display: 'flex', flexDirection: 'column', gap: '8px' },
  upcomingCardHeader:   { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  upcomingCardTitle:    { fontSize: '13px', fontWeight: '700', color: '#051c2c', lineHeight: 1.4 },
  upcomingCardMeta:     { display: 'flex', flexDirection: 'column', gap: '5px' },
  upcomingMetaItem:     { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#5a6878' },
  upcomingMetaIcon:     { fontSize: '12px', flexShrink: 0 },
  upcomingViewBtn:      { background: 'none', border: '1px solid #e8ecf0', borderRadius: '6px', padding: '6px 12px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', color: '#051c2c', fontFamily: 'Inter, sans-serif', alignSelf: 'flex-start' },
  controls:             { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' },
  searchWrap:           { display: 'flex', alignItems: 'center', background: '#ffffff', border: '1.5px solid #e8ecf0', borderRadius: '8px', padding: '0 12px', gap: '6px' },
  searchInput:          { border: 'none', outline: 'none', fontSize: '13px', padding: '9px 0', width: '200px', fontFamily: 'Inter, sans-serif', background: 'transparent' },
  filterSelect:         { padding: '9px 12px', border: '1.5px solid #e8ecf0', borderRadius: '8px', fontSize: '13px', outline: 'none', background: '#ffffff', color: '#051c2c', fontFamily: 'Inter, sans-serif', cursor: 'pointer' },
  dateFilterPair:       { display: 'flex', alignItems: 'center', gap: '8px', background: '#ffffff', border: '1.5px solid #e8ecf0', borderRadius: '8px', padding: '0 10px' },
  dateInputSmall:       { border: 'none', outline: 'none', fontSize: '12px', padding: '8px 0', fontFamily: 'Inter, sans-serif', color: '#051c2c', background: 'transparent' },
  clearFilterBtn:       { background: '#fee2e2', color: '#991b1b', border: 'none', borderRadius: '8px', padding: '9px 14px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', fontFamily: 'Inter, sans-serif' },
  addBtn:               { background: '#051c2c', color: '#ffffff', border: 'none', borderRadius: '8px', padding: '10px 20px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'Inter, sans-serif' },
  tableWrap:            { background: '#ffffff', borderRadius: '12px', border: '1px solid #e8ecf0', overflow: 'hidden' },
  tableTitle:           { fontSize: '16px', fontWeight: '700', color: '#051c2c', padding: '16px 20px', borderBottom: '1px solid #e8ecf0' },
  table:                { width: '100%', borderCollapse: 'collapse' },
  theadRow:             { background: '#051c2c' },
  th:                   { padding: '11px 14px', textAlign: 'left', fontSize: '10px', fontWeight: '700', color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' },
  tr:                   { borderBottom: '1px solid #f0f2f4' },
  td:                   { padding: '12px 14px', fontSize: '13px', color: '#051c2c', verticalAlign: 'middle' },
  courseNameBtn:        { background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '600', color: '#051c2c', textAlign: 'left', padding: 0, fontFamily: 'Inter, sans-serif', textDecoration: 'underline', textDecorationColor: '#e8ecf0' },
  trainerNameBtn:       { background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: '500', color: '#0369a1', textAlign: 'left', padding: 0, fontFamily: 'Inter, sans-serif', textDecoration: 'underline' },
  typeBadge:            { padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600' },
  actionBtn:            { background: '#051c2c', border: 'none', borderRadius: '6px', padding: '5px 8px', cursor: 'pointer', fontSize: '13px' },
  overlay:              { position: 'fixed', inset: 0, background: 'rgba(5,28,44,0.55)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' },
  modal:                { background: '#ffffff', borderRadius: '16px', width: '100%', maxWidth: '660px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 64px rgba(5,28,44,0.25)' },
  modalHeader:          { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '20px 24px', borderBottom: '1px solid #e8ecf0', position: 'sticky', top: 0, background: '#ffffff', zIndex: 1 },
  modalTitle:           { fontSize: '18px', fontWeight: '700', color: '#051c2c' },
  modalClose:           { background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#9baabb' },
  modalBody:            { padding: '20px 24px' },
  photoRow:             { display: 'flex', gap: '16px', marginBottom: '16px', alignItems: 'flex-start' },
  photoBox:             { width: '90px', height: '90px', border: '2px dashed #e8ecf0', borderRadius: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  formGrid:             { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' },
  modalFooter:          { padding: '14px 24px', borderTop: '1px solid #e8ecf0', display: 'flex', justifyContent: 'flex-end', gap: '8px', flexWrap: 'wrap' },
  cancelBtn:            { padding: '9px 16px', background: 'none', border: '1.5px solid #e8ecf0', borderRadius: '8px', fontSize: '12.5px', cursor: 'pointer', fontFamily: 'Inter, sans-serif' },
  saveBtn:              { padding: '9px 20px', background: '#051c2c', border: 'none', borderRadius: '8px', fontSize: '12.5px', fontWeight: '600', cursor: 'pointer', color: '#ffffff', fontFamily: 'Inter, sans-serif' },
  coverImg:             { width: '100%', height: '100px', background: '#f2f4f6', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' },
  infoBar:              { display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: '8px', background: '#f8f9fa', borderRadius: '10px', padding: '14px', marginBottom: '16px', border: '1px solid #e8ecf0' },
  infoBarItem:          { textAlign: 'center' },
  infoBarLabel:         { fontSize: '9px', color: '#9baabb', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: '4px' },
  infoBarValue:         { fontSize: '13px', fontWeight: '700', color: '#051c2c' },
  detailGrid:           { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' },
  sectionLabel:         { fontSize: '12px', fontWeight: '700', color: '#051c2c', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid #e8ecf0' },
  periodToggleSmall:    { display: 'flex', background: '#f2f4f6', borderRadius: '6px', padding: '2px', gap: '2px' },
  periodBtnSmall:       { padding: '5px 12px', fontSize: '11px', fontWeight: '600', border: 'none', background: 'none', borderRadius: '4px', cursor: 'pointer', color: '#5a6878', fontFamily: 'Inter, sans-serif' },
  periodBtnActiveSmall: { background: '#051c2c', color: '#ffffff' },
};

export default CoursesPage;