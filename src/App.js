import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import LearnersPage from './pages/LearnersPage';
import CoursesPage from './pages/CoursesPage';
import DepartmentsPage from './pages/DepartmentsPage';
import TrainersPage from './pages/TrainersPage';
import CalendarPage from './pages/CalendarPage';
import ReportsPage from './pages/ReportsPage';
import Topbar from './components/Topbar';

function App() {

  // null = not logged in → show Login page
  // object = logged in → show the main app
  const [currentUser, setCurrentUser] = useState(null);
  const [activePage, setActivePage]   = useState('dashboard');
  const pageTitles = {
  dashboard:   'Dashboard',
  learners:    'Learners',
  courses:     'Courses',
  departments: 'Departments',
  trainers:    'Trainers',
  calendar:    'Training Calendar',
  reports:     'Reports',
};

  const handleLogin  = (user) => { setCurrentUser(user); };
  const handleLogout = () => {
    setCurrentUser(null);
    setActivePage('dashboard');
  };

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':   return <DashboardPage />;
      case 'learners':    return <LearnersPage />;
      case 'courses':    return <CoursesPage />;
      case 'departments': return <DepartmentsPage />;
      case 'trainers':    return <TrainersPage />;      
      case 'calendar':    return <CalendarPage />;
      case 'reports':     return <ReportsPage />;
      default:            return <DashboardPage />;
    }
  };

  // ── NOT logged in → show Login page only ──
  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} />;
  }

  // ── Logged in → show full app ──
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

function PlaceholderPage({ title }) {
  return (
    <div style={{ padding: '40px' }}>
      <h1 style={{ color: '#051c2c', fontSize: '28px', fontWeight: '700' }}>{title}</h1>
      <p style={{ color: '#5a6878', marginTop: '8px', fontSize: '14px' }}>
        This page is being built. Check back soon! 🚀
      </p>
    </div>
  );
}

export default App;