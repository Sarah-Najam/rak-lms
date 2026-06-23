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
  getReports: (year) =>
    fetch(`${BASE_URL}/reports${year ? `?year=${year}` : ''}`, {
      headers: headers(),
    }).then(r => r.json()),

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
};

export default api;