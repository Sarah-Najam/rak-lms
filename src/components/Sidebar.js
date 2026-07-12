import React, { useState } from 'react';

// Admin sees all pages
const ADMIN_LINKS = [
  { id: 'dashboard',   label: 'Dashboard',        icon: '◈' },
  { id: 'learners',    label: 'Learners',          icon: '◉' },
  { id: 'courses',     label: 'Courses',           icon: '◫' },
  { id: 'departments', label: 'Departments',       icon: '⬡' },
  { id: 'trainers',    label: 'Trainers',          icon: '◎' },
  { id: 'calendar',    label: 'Training Calendar', icon: '▦' },
  { id: 'reports',     label: 'Reports',           icon: '◧' },
  { id: 'compliance',  label: 'Compliance',        icon: '✅' },
  { id: 'settings',    label: 'Settings',          icon: '⚙' },
];

const HOD_LINKS = [
  { id: 'dashboard',  label: 'Dashboard',  icon: '◈' },
  { id: 'learners',   label: 'Learners',   icon: '◉' },
  { id: 'courses',    label: 'Courses',    icon: '◫' },
  { id: 'reports',    label: 'Reports',    icon: '◧' },
  { id: 'compliance', label: 'Compliance', icon: '✅' },
];

function Sidebar({ activePage, onNavigate, user, onLogout }) {

  const [logoutOpen, setLogoutOpen] = useState(false);

  const isHod    = user?.role === 'hod';
  const navLinks = isHod ? HOD_LINKS : ADMIN_LINKS;

  // Generate initials from user name
  const initials = user?.name
    ? user.name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
    : 'TM';

  return (
    <div style={styles.sidebar}>

      {/* ── LOGO AREA ── */}
      <div style={styles.logoArea}>
        <img
          src="/rak-logo.svg"
          alt="RAK Properties"
          style={{ width: '190px', height: 'auto', display: 'block' }}
        />
        <div style={styles.logoSub}>Learning Management System</div>
      </div>

      {/* ── HOD BADGE ── */}
      {isHod && (
        <div style={styles.hodBadge}>
          <span style={styles.hodBadgeText}>
            👁 Read-Only Access
          </span>
        </div>
      )}

      {/* ── NAVIGATION LINKS ── */}
      <nav style={styles.nav}>
        {navLinks.map((link) => (
          <button
            key={link.id}
            onClick={() => onNavigate(link.id)}
            style={{
              ...styles.navItem,
              ...(activePage === link.id ? styles.navItemActive : {}),
            }}
          >
            <span style={styles.navIcon}>{link.icon}</span>
            {link.label}
          </button>
        ))}
      </nav>

      {/* ── USER AREA ── */}
      <div style={styles.userArea}>
        <button
          style={styles.userRow}
          onClick={() => setLogoutOpen(!logoutOpen)}
        >
          <div style={styles.avatar}>{initials}</div>
          <div>
            <div style={styles.userName}>{user?.name || 'User'}</div>
            <div style={styles.userRole}>
              {isHod ? 'Head of Department' : 'LMS Administrator'}
            </div>
          </div>
        </button>

        {logoutOpen && (
          <div style={styles.logoutMenu}>
            <button style={styles.logoutBtn} onClick={onLogout}>
              ⬤&nbsp; Sign Out
            </button>
          </div>
        )}
      </div>

    </div>
  );
}

const styles = {
  sidebar: {
    width: '230px',
    minWidth: '230px',
    backgroundColor: '#051c2c',
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    overflow: 'hidden',
  },
  logoArea: {
    padding: '24px 18px 18px',
    borderBottom: '1px solid rgba(182,189,194,0.15)',
  },
  logoSub: {
    fontSize: '9px',
    color: 'rgba(182,189,194,0.45)',
    letterSpacing: '2.5px',
    textTransform: 'uppercase',
    marginTop: '14px',
    paddingTop: '12px',
    borderTop: '1px solid rgba(182,189,194,0.12)',
  },
  hodBadge: {
    margin: '10px 12px 0',
    padding: '6px 12px',
    background: 'rgba(175,95,70,0.2)',
    border: '1px solid rgba(175,95,70,0.4)',
    borderRadius: '6px',
  },
  hodBadgeText: {
    fontSize: '10px',
    color: '#AF5F46',
    fontWeight: '600',
    letterSpacing: '0.5px',
  },
  nav: {
    flex: 1,
    padding: '14px 0',
    overflowY: 'auto',
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '11px',
    width: '100%',
    padding: '11px 22px',
    background: 'none',
    border: 'none',
    borderLeft: '3px solid transparent',
    color: 'rgba(182,189,194,0.7)',
    fontSize: '13px',
    fontWeight: '400',
    textAlign: 'left',
    cursor: 'pointer',
    fontFamily: 'Inter, sans-serif',
  },
  navItemActive: {
    color: '#ffffff',
    fontWeight: '600',
    background: 'rgba(182,189,194,0.1)',
    borderLeft: '3px solid #ffffff',
  },
  navIcon: {
    fontSize: '14px',
    width: '18px',
    textAlign: 'center',
  },
  userArea: {
    padding: '16px 20px',
    borderTop: '1px solid rgba(182,189,194,0.15)',
    position: 'relative',
  },
  userRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    background: 'none',
    border: 'none',
    width: '100%',
    cursor: 'pointer',
    textAlign: 'left',
  },
  avatar: {
    width: '34px',
    height: '34px',
    borderRadius: '50%',
    background: 'rgba(182,189,194,0.15)',
    border: '1.5px solid rgba(182,189,194,0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '11px',
    fontWeight: '700',
    color: '#ffffff',
    flexShrink: 0,
  },
  userName: {
    fontSize: '12.5px',
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
  },
  userRole: {
    fontSize: '10px',
    color: 'rgba(182,189,194,0.5)',
    marginTop: '1px',
  },
  logoutMenu: {
    position: 'absolute',
    bottom: '100%',
    left: '12px',
    right: '12px',
    background: '#ffffff',
    borderRadius: '8px',
    border: '1px solid #dde1e5',
    boxShadow: '0 4px 20px rgba(5,28,44,0.18)',
    overflow: 'hidden',
  },
  logoutBtn: {
    width: '100%',
    padding: '11px 14px',
    background: 'none',
    border: 'none',
    fontSize: '13px',
    color: '#9b2020',
    textAlign: 'left',
    cursor: 'pointer',
    fontFamily: 'Inter, sans-serif',
  },
};

export default Sidebar;