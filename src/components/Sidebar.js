// Sidebar.js — The navigation panel on the left
//

import React, { useState } from 'react';

const NAV_LINKS = [
  { id: 'dashboard',   label: 'Dashboard',         icon: '◈' },
  { id: 'learners',    label: 'Learners',           icon: '◉' },
  { id: 'courses',     label: 'Courses',            icon: '◫' },
  { id: 'departments', label: 'Departments',        icon: '⬡' },
  { id: 'trainers',    label: 'Trainers',           icon: '◎' },
  { id: 'calendar',    label: 'Training Calendar',  icon: '▦' },
  { id: 'reports',     label: 'Reports',            icon: '◧' },
];


function Sidebar({ activePage, onNavigate, user, onLogout }) {

  const [logoutOpen, setLogoutOpen] = useState(false);
  return (
    <div style={styles.sidebar}>

      {/* ── LOGO AREA ── */}
      {/* WHY <div style={styles.logoArea}>? */}
      {/* We apply styles using a JavaScript object. */}
      {/* This is called "inline styles" in React. */}
      <div style={styles.logoArea}>

        {/* The RAK Properties Logo built with SVG */}
        {/* SVG = Scalable Vector Graphics */}
        {/* It draws shapes using math, so it looks sharp at any size */}
        {/* Unlike a .png image which gets blurry when you zoom in */}
        
        <img
  src="/rak-logo.svg"
  alt="RAK Properties"
style={{ width: '190px', height: 'auto', display: 'block' }}/>

        {/* Subtitle below the logo */}
        <div style={styles.logoSub}>Learning Management System</div>
      </div>

      {/* ── NAVIGATION LINKS ── */}
      <nav style={styles.nav}>

        {/* WHY .map()? */}
        {/* .map() loops through the NAV_LINKS array and */}
        {/* creates one <button> for each item. */}
        {/* It is like saying: "for each link, draw a button." */}
        {/* This replaces writing 6 separate <button> tags by hand. */}
        {NAV_LINKS.map((link) => (

          // WHY key={link.id}? */
          // When React loops and creates multiple elements, */
          // it needs a unique "key" on each one. */
          // This helps React know which item changed */
          // when it needs to re-draw the list. */
          <button
            key={link.id}
            onClick={() => onNavigate(link.id)}
            style={{
              ...styles.navItem,
              // WHY this line?
              // If this link's id matches the currently active page,
              // apply the "active" style (white text + white left border)
              // Otherwise apply the default style.
              ...(activePage === link.id ? styles.navItemActive : {}),
            }}
          >
            <span style={styles.navIcon}>{link.icon}</span>
            {link.label}
          </button>
        ))}
      </nav>

      {/* ── USER AREA (bottom of sidebar) ── */}
      <div style={styles.userArea}>
        <button
          style={styles.userRow}
          onClick={() => setLogoutOpen(!logoutOpen)}
        >
          {/* WHY !logoutOpen ? */}
          {/* ! means "NOT" in JavaScript. */}
          {/* So !logoutOpen means: */}
          {/* If it was false → make it true (open the menu) */}
          {/* If it was true  → make it false (close the menu) */}

          {/* Avatar circle with initials */}
          <div style={styles.avatar}>TM</div>
          <div>
<div style={styles.userName}>{user?.name || 'Training Manager'}</div>            <div style={styles.userRole}>LMS Administrator</div>
          </div>
        </button>

        {/* WHY {logoutOpen && ...}? */}
        {/* This is called "conditional rendering". */}
        {/* The && means: ONLY show what comes after */}
        {/* IF logoutOpen is true. */}
        {/* When logoutOpen is false, nothing is shown. */}
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

// ── STYLES ────────────────────────────────────────────────────
// WHY at the bottom?
// Keeping styles separate from the JSX makes the component
// easier to read. You read the structure first, then the styles.
//
// WHY a JavaScript object instead of a CSS file?
// This is called "CSS-in-JS". The styles live with the component.
// If you delete Sidebar.js, the styles go with it — no orphan CSS.
const styles = {
  sidebar: {
    width: '230px',
    minWidth: '230px',
    backgroundColor: '#051c2c',   // RAK Navy — official brand color
    display: 'flex',
    flexDirection: 'column',      // Stack children top to bottom
    height: '100vh',              // 100vh = full height of the screen
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
  nav: {
    flex: 1,               // WHY flex:1? Takes up all remaining space
    padding: '14px 0',     // between logo and user area
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
    borderLeft: '3px solid transparent',  // invisible border (placeholder)
    color: 'rgba(182,189,194,0.7)',        // RAK Silver, slightly dim
    fontSize: '13px',
    fontWeight: '400',
    textAlign: 'left',
    cursor: 'pointer',                     // shows hand cursor on hover
    fontFamily: 'Inter, sans-serif',
  },
  navItemActive: {
    color: '#ffffff',                      // bright white when active
    fontWeight: '600',
    background: 'rgba(182,189,194,0.1)',
    borderLeft: '3px solid #ffffff',       // white line on the left edge
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

// WHY export default?
// This makes Sidebar available to be imported in other files.
// "default" means: when someone imports this file,
// THIS is what they get — the Sidebar function.
export default Sidebar;