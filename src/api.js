const BASE_URL = 'http://localhost:5000/api';

const getToken = () => localStorage.getItem('token');

const headers = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${getToken()}`,
});

const api = {
  login: (email, password) =>
    fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    }).then(r => r.json()),

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

  getDepartments: () =>
    fetch(`${BASE_URL}/departments`, { headers: headers() }).then(r => r.json()),

  addDepartment: (data) =>
    fetch(`${BASE_URL}/departments`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(data),
    }).then(r => r.json()),

  getTrainers: () =>
    fetch(`${BASE_URL}/trainers`, { headers: headers() }).then(r => r.json()),

  addTrainer: (data) =>
    fetch(`${BASE_URL}/trainers`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(data),
    }).then(r => r.json()),

  getCalendar: (year, quarter) =>
    fetch(`${BASE_URL}/calendar?year=${year}&quarter=${quarter}`,
      { headers: headers() }).then(r => r.json()),

  addCalendarEntry: (data) =>
    fetch(`${BASE_URL}/calendar`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(data),
    }).then(r => r.json()),

  getReports: () =>
    fetch(`${BASE_URL}/reports`, { headers: headers() }).then(r => r.json()),

  inviteUser: (data) =>
    fetch(`${BASE_URL}/auth/invite`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(data),
    }).then(r => r.json()),
};

export default api;