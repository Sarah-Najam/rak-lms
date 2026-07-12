import React, { useState } from 'react';
import Sidebar         from './components/Sidebar';
import CheckinPage     from './pages/CheckinPage';
import CourseCheckinPage from './pages/CourseCheckinPage';
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
import CompliancePage  from './pages/CompliancePage';
import SetPasswordPage from './pages/SetPasswordPage';

// Pages HOD is NOT allowed to access
const HOD_BLOCKED_PAGES = ['departments', 'trainers', 'calendar', 'settings'];
function App() {

  const [currentUser, setCurrentUser] = useState(null);
  const [activePage,  setActivePage]  = useState(
    localStorage.getItem('activePage') || 'dashboard'
  );

  const handleLogin = (user) => {
    setCurrentUser(user);
    // If HOD lands on a blocked page, redirect to dashboard
    const savedPage = localStorage.getItem('activePage') || 'dashboard';
    if (user.role === 'hod' && HOD_BLOCKED_PAGES.includes(savedPage)) {
      setActivePage('dashboard');
      localStorage.setItem('activePage', 'dashboard');
    }
  };

  const navigateTo = (page) => {
    // Prevent HOD from navigating to blocked pages
    if (currentUser?.role === 'hod' && HOD_BLOCKED_PAGES.includes(page)) {
      return;
    }
    setActivePage(page);
    localStorage.setItem('activePage', page);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('activePage');
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
            name:          payload.name,
            email:         payload.email,
            role:          payload.role,
            department_id: payload.department_id || null,
          });
          // Redirect HOD away from blocked pages on refresh
          const savedPage = localStorage.getItem('activePage') || 'dashboard';
          if (payload.role === 'hod' && HOD_BLOCKED_PAGES.includes(savedPage)) {
            setActivePage('dashboard');
            localStorage.setItem('activePage', 'dashboard');
          }
        } else {
          localStorage.removeItem('token');
        }
      } catch {
        localStorage.removeItem('token');
      }
    }
  }, []);
  // ── SESSION TIMEOUT WARNING ──
React.useEffect(() => {
  if (!currentUser) return;

  const token = localStorage.getItem('token');
  if (!token) return;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expiresAt = payload.exp * 1000;
    const warningAt = expiresAt - 5 * 60 * 1000; // 5 min before expiry
    const now = Date.now();

    if (warningAt <= now) return; // already past warning time

    const warningTimeout = setTimeout(() => {
      const extend = window.confirm(
        '⚠️ Your session will expire in 5 minutes.\n\nClick OK to stay logged in, or Cancel to log out now.'
      );
      if (!extend) {
        handleLogout();
      }
    }, warningAt - now);

    const logoutTimeout = setTimeout(() => {
      alert('Your session has expired. Please log in again.');
      handleLogout();
    }, expiresAt - now);

    return () => {
      clearTimeout(warningTimeout);
      clearTimeout(logoutTimeout);
    };
  } catch {
    return;
  }
}, [currentUser]);

  const pageTitles = {
    dashboard:   'Dashboard',
    learners:    'Learners',
    courses:     'Courses',
    departments: 'Departments',
    trainers:    'Trainers',
    calendar:    'Training Calendar',
    reports:     'Reports',
    settings:    'Settings',
    compliance:  'Mandatory Training Compliance',
  };

  const renderPage = () => {
    const isHod = currentUser?.role === 'hod';

    // Block HOD from restricted pages
    if (isHod && HOD_BLOCKED_PAGES.includes(activePage)) {
      return <DashboardPage user={currentUser} />;
    }

    switch (activePage) {
      case 'dashboard':   return <DashboardPage   user={currentUser} />;
      case 'learners':    return <LearnersPage     user={currentUser} />;
      case 'courses':     return <CoursesPage      user={currentUser} />;
      case 'departments': return <DepartmentsPage  user={currentUser} />;
      case 'trainers':    return <TrainersPage     user={currentUser} />;
      case 'calendar':    return <CalendarPage     user={currentUser} />;
      case 'reports':     return <ReportsPage      user={currentUser} />;
      case 'settings':    return <SettingsPage     user={currentUser} />;
      case 'compliance':  return <CompliancePage   user={currentUser} />;
      default:            return <DashboardPage    user={currentUser} />;
    }
  };

  // ── Check-in page (no login needed) ──
  if (window.location.pathname === '/checkin') {
    return <CheckinPage />;
  }
  // ── Course check-in page (no login needed) ──
  if (window.location.pathname === '/course-checkin') {
    return <CourseCheckinPage />;
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
        onNavigate={navigateTo}
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