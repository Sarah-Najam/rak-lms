import React, { useState } from 'react';
import Sidebar         from './components/Sidebar';
import CheckinPage     from './pages/CheckinPage';
import FeedbackPage    from './pages/FeedbackPage';
import Topbar          from './components/Topbar';
import LoginPage       from './pages/LoginPage';
import DashboardPage   from './pages/DashboardPage';
import LearnersPage    from './pages/LearnersPage';
import CoursesPage     from './pages/CoursesPage';
import DepartmentsPage from './pages/DepartmentsPage';
import TrainersPage    from './pages/TrainersPage';
import CalendarPage    from './pages/CalendarPage';
import ReportsPage     from './pages/ReportsPage';
import SettingsPage    from './pages/SettingsPage';
import SetPasswordPage from './pages/SetPasswordPage';

function App() {

  const [currentUser, setCurrentUser] = useState(null);
  const [activePage,  setActivePage]  = useState('dashboard');

  const handleLogin  = (user) => { setCurrentUser(user); };
  const handleLogout = () => {
    localStorage.removeItem('token');
    setCurrentUser(null);
    setActivePage('dashboard');
  };

  React.useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.exp * 1000 > Date.now()) {
          setCurrentUser({
            name:  payload.name,
            email: payload.email,
            role:  payload.role,
          });
        } else {
          localStorage.removeItem('token');
        }
      } catch {
        localStorage.removeItem('token');
      }
    }
  }, []);

  const pageTitles = {
    dashboard:   'Dashboard',
    learners:    'Learners',
    courses:     'Courses',
    departments: 'Departments',
    trainers:    'Trainers',
    calendar:    'Training Calendar',
    reports:     'Reports',
    settings:    'Settings',
  };

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':   return <DashboardPage />;
      case 'learners':    return <LearnersPage />;
      case 'courses':     return <CoursesPage />;
      case 'departments': return <DepartmentsPage />;
      case 'trainers':    return <TrainersPage />;
      case 'calendar':    return <CalendarPage />;
      case 'reports':     return <ReportsPage />;
      case 'settings':    return <SettingsPage />;
      default:            return <DashboardPage />;
    }
  };

  // ── Check-in page (no login needed) ──
  if (window.location.pathname === '/checkin') {
    return <CheckinPage />;
  }

  // ── Feedback page (no login needed) ──
  if (window.location.pathname === '/feedback') {
    return <FeedbackPage />;
  }

  // ── Set password page (no login needed) ──
  if (window.location.search.includes('token=')) {
    return <SetPasswordPage />;
  }

  // ── Not logged in ──
  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} />;
  }

  // ── Logged in ──
  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'Inter, sans-serif' }}>
      <Sidebar
        activePage={activePage}
        onNavigate={(page) => setActivePage(page)}
        user={currentUser}
        onLogout={handleLogout}
      />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Topbar
          title={pageTitles[activePage] || 'Dashboard'}
          user={currentUser}
        />
        <div style={{ flex: 1, overflow: 'auto', background: '#f2f4f6' }}>
          {renderPage()}
        </div>
      </div>
    </div>
  );
}

export default App;