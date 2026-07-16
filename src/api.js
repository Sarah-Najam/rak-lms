const BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://rak-lms-backend.onrender.com/api'
  : 'http://localhost:5000/api';

const getToken = () => localStorage.getItem('token');

const headers = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${getToken()}`,
});

const api = {

  // ── AUTH ──────────────────────────────────────────────────
  login: (email, password) =>
    fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    }).then(r => r.json()),

  getUsers: () =>
    fetch(`${BASE_URL}/auth/users`, { headers: headers() }).then(r => r.json()),

  inviteUser: (data) =>
    fetch(`${BASE_URL}/auth/invite`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(data),
    }).then(r => r.json()),

  verifyInvite: (token) =>
    fetch(`${BASE_URL}/auth/verify-invite/${token}`).then(r => r.json()),
forgotPassword: (email) =>
    fetch(`${BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    }).then(r => r.json()),

  verifyReset: (token) =>
    fetch(`${BASE_URL}/auth/verify-reset/${token}`).then(r => r.json()),
  setPassword: (token, password) =>
    fetch(`${BASE_URL}/auth/set-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password }),
    }).then(r => r.json()),

  // ── LEARNERS ──────────────────────────────────────────────
  getLearners: () =>
    fetch(`${BASE_URL}/learners`, { headers: headers() }).then(r => r.json()),

  addLearner: (data) =>
    fetch(`${BASE_URL}/learners`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(data),
    }).then(r => r.json()),

  updateLearner: (id, data) =>
    fetch(`${BASE_URL}/learners/${id}`, {
      method: 'PUT',
      headers: headers(),
      body: JSON.stringify(data),
    }).then(r => r.json()),

  deleteLearner: (id) =>
    fetch(`${BASE_URL}/learners/${id}`, {
      method: 'DELETE',
      headers: headers(),
    }).then(r => r.json()),

  // ── COURSES ───────────────────────────────────────────────
  getCourses: () =>
    fetch(`${BASE_URL}/courses`, { headers: headers() }).then(r => r.json()),

  addCourse: (data) =>
    fetch(`${BASE_URL}/courses`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(data),
    }).then(r => r.json()),

  updateCourse: (id, data) =>
    fetch(`${BASE_URL}/courses/${id}`, {
      method: 'PUT',
      headers: headers(),
      body: JSON.stringify(data),
    }).then(r => r.json()),

  deleteCourse: (id) =>
    fetch(`${BASE_URL}/courses/${id}`, {
      method: 'DELETE',
      headers: headers(),
    }).then(r => r.json()),

  // ── DEPARTMENTS ───────────────────────────────────────────
  getDepartments: () =>
    fetch(`${BASE_URL}/departments`, { headers: headers() }).then(r => r.json()),

  addDepartment: (data) =>
    fetch(`${BASE_URL}/departments`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(data),
    }).then(r => r.json()),

  updateDepartment: (id, data) =>
    fetch(`${BASE_URL}/departments/${id}`, {
      method: 'PUT',
      headers: headers(),
      body: JSON.stringify(data),
    }).then(r => r.json()),

  deleteDepartment: (id) =>
    fetch(`${BASE_URL}/departments/${id}`, {
      method: 'DELETE',
      headers: headers(),
    }).then(r => r.json()),

  // ── TRAINERS ──────────────────────────────────────────────
  getTrainers: () =>
    fetch(`${BASE_URL}/trainers`, { headers: headers() }).then(r => r.json()),

  addTrainer: (data) =>
    fetch(`${BASE_URL}/trainers`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(data),
    }).then(r => r.json()),

  updateTrainer: (id, data) =>
    fetch(`${BASE_URL}/trainers/${id}`, {
      method: 'PUT',
      headers: headers(),
      body: JSON.stringify(data),
    }).then(r => r.json()),

  deleteTrainer: (id) =>
    fetch(`${BASE_URL}/trainers/${id}`, {
      method: 'DELETE',
      headers: headers(),
    }).then(r => r.json()),

  getTrainerSatisfactionById: (id, period) =>
    fetch(`${BASE_URL}/trainers/${id}/satisfaction?period=${period}`, {
      headers: headers(),
    }).then(r => r.json()),

  getTrainerSatisfactionByName: (name, period) =>
    fetch(`${BASE_URL}/trainers/by-name/satisfaction?name=${encodeURIComponent(name)}&period=${period}`, {
      headers: headers(),
    }).then(r => r.json()),

  // ── CALENDAR ──────────────────────────────────────────────
  getCalendar: () =>
    fetch(`${BASE_URL}/calendar`, { headers: headers() }).then(r => r.json()),

  addCalendarEntry: (data) =>
    fetch(`${BASE_URL}/calendar`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(data),
    }).then(r => r.json()),

  updateCalendarEntry: (id, data) =>
    fetch(`${BASE_URL}/calendar/${id}`, {
      method: 'PUT',
      headers: headers(),
      body: JSON.stringify(data),
    }).then(r => r.json()),

  deleteCalendarEntry: (id) =>
    fetch(`${BASE_URL}/calendar/${id}`, {
      method: 'DELETE',
      headers: headers(),
    }).then(r => r.json()),

  // ── REPORTS ───────────────────────────────────────────────
  getReports: (params = {}) => {
    const query = new URLSearchParams();
    if (params.year)      query.append('year', params.year);
    if (params.startDate) query.append('startDate', params.startDate);
    if (params.endDate)   query.append('endDate', params.endDate);
    const qs = query.toString();
    return fetch(`${BASE_URL}/reports${qs ? `?${qs}` : ''}`, {
      headers: headers(),
    }).then(r => r.json());
  },

  // ── ENROLLMENTS ───────────────────────────────────────────
  getEnrollmentsByLearner: (id) =>
    fetch(`${BASE_URL}/enrollments/learner/${id}`, {
      headers: headers(),
    }).then(r => r.json()),

  getEnrollmentsByCourse: (id) =>
    fetch(`${BASE_URL}/enrollments/course/${id}`, {
      headers: headers(),
    }).then(r => r.json()),

  enrollLearner: (learner_id, course_id) =>
    fetch(`${BASE_URL}/enrollments`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ learner_id, course_id }),
    }).then(r => r.json()),

  unenrollLearner: (learner_id, course_id) =>
    fetch(`${BASE_URL}/enrollments`, {
      method: 'DELETE',
      headers: headers(),
      body: JSON.stringify({ learner_id, course_id }),
    }).then(r => r.json()),

  sendCheckinLinks: (courseId) =>
    fetch(`${BASE_URL}/enrollments/send-checkin/${courseId}`, {
      method: 'POST',
      headers: headers(),
    }).then(r => r.json()),

  // ── FEEDBACK ──────────────────────────────────────────────
  sendFeedbackLinks: (courseId) =>
    fetch(`${BASE_URL}/enrollments/send-feedback/${courseId}`, {
      method: 'POST',
      headers: headers(),
    }).then(r => r.json()),

  verifyFeedbackToken: (token) =>
    fetch(`${BASE_URL}/enrollments/feedback/${token}`).then(r => r.json()),

  submitFeedback: (data) =>
    fetch(`${BASE_URL}/enrollments/feedback/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(r => r.json()),

  getFeedbackByCourse: (courseId) =>
    fetch(`${BASE_URL}/enrollments/feedback/course/${courseId}`, {
      headers: headers(),
    }).then(r => r.json()),

  toggleManualSatisfaction: (courseId, is_manual, manual_value) =>
    fetch(`${BASE_URL}/enrollments/feedback/toggle-manual/${courseId}`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ is_manual, manual_value }),
    }).then(r => r.json()),

    getCourseCheckinInfo: (courseId) =>
    fetch(`${BASE_URL}/enrollments/course-checkin/${courseId}`).then(r => r.json()),

  submitCourseCheckin: (courseId, empId) =>
    fetch(`${BASE_URL}/enrollments/course-checkin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ course_id: courseId, emp_id: empId }),
    }).then(r => r.json()),
// ── UPLOAD ────────────────────────────────────────────────
  uploadFile: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch(`${BASE_URL}/upload`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${getToken()}` },
      body: formData,
    });
    return response.json();
  },

  uploadLearnerPhoto: async (learnerId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch(`${BASE_URL}/upload/learner/${learnerId}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${getToken()}` },
      body: formData,
    });
    return response.json();
  },

  uploadTrainerPhoto: async (trainerId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch(`${BASE_URL}/upload/trainer/${trainerId}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${getToken()}` },
      body: formData,
    });
    return response.json();
  },

  uploadCoursePhoto: async (courseId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch(`${BASE_URL}/upload/course/${courseId}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${getToken()}` },
      body: formData,
    });
    return response.json();
  },
  getCourseMaterials: (courseId) =>
  fetch(`${BASE_URL}/upload/course/${courseId}/materials`, {
    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
  }).then(r => r.json()),

uploadCourseMaterials: (courseId, files) => {
  const formData = new FormData();
  Array.from(files).forEach(file => formData.append('files', file));
  return fetch(`${BASE_URL}/upload/course/${courseId}/materials`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
    body: formData,
  }).then(r => r.json());
},

deleteCourseMaterial: (materialId) =>
  fetch(`${BASE_URL}/upload/materials/${materialId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
  }).then(r => r.json()),
  removeLearnerPhoto: (learnerId) =>
    fetch(`${BASE_URL}/upload/learner/${learnerId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${getToken()}` },
    }).then(r => r.json()),

  removeTrainerPhoto: (trainerId) =>
    fetch(`${BASE_URL}/upload/trainer/${trainerId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${getToken()}` },
    }).then(r => r.json()),

  removeCoursePhoto: (courseId) =>
    fetch(`${BASE_URL}/upload/course/${courseId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${getToken()}` },
    }).then(r => r.json()),
  // ── COMPLIANCE ────────────────────────────────────────────
  getCompliance: (year) =>
    fetch(`${BASE_URL}/compliance${year ? `?year=${year}` : ''}`, {
      headers: headers(),
    }).then(r => r.json()),
    // ── MATERIALS ─────────────────────────────────────────────
  getMaterials: (courseId) =>
    fetch(`${BASE_URL}/materials/${courseId}`, {
      headers: headers(),
    }).then(r => r.json()),

  uploadMaterial: async (courseId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch(`${BASE_URL}/materials/${courseId}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${getToken()}` },
      body: formData,
    });
    return response.json();
  },
  // ── CERTIFICATES ──────────────────────────────────────────
  getCertificatesByCourse: (courseId) =>
    fetch(`${BASE_URL}/certificates/course/${courseId}`, {
      headers: headers(),
    }).then(r => r.json()),

  getCertificatesByLearner: (learnerId) =>
    fetch(`${BASE_URL}/certificates/learner/${learnerId}`, {
      headers: headers(),
    }).then(r => r.json()),

  issueCertificate: (learnerId, courseId) =>
    fetch(`${BASE_URL}/certificates`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ learner_id: learnerId, course_id: courseId }),
    }).then(r => r.json()),

  regenerateCertificate: (learnerId, courseId) =>
    fetch(`${BASE_URL}/certificates/regenerate`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ learner_id: learnerId, course_id: courseId }),
    }).then(r => r.json()),

  deleteMaterial: (materialId) =>
    fetch(`${BASE_URL}/materials/${materialId}`, {
      method: 'DELETE',
      headers: headers(),
    }).then(r => r.json()),

    // ── BUDGET ────────────────────────────────────────────────
  getBudget: (year) =>
    fetch(`${BASE_URL}/budget${year ? `?year=${year}` : ''}`, {
      headers: headers(),
    }).then(r => r.json()),

  setBudget: (year, amount, notes) =>
    fetch(`${BASE_URL}/budget`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ year, amount, notes }),
    }).then(r => r.json()),
};


export default api;