// ============================================================
// Topbar.js — The top bar that appears on every page
//
// WHAT IT HAS (from the wireframe):
// 1. Page title on the left
// 2. Search bar in the center
// 3. User name + designation + profile photo on the right
//
// WHY A SEPARATE COMPONENT?
// The topbar appears on ALL pages.
// Building it once here means we never repeat code.
// If we want to change it, we change ONE file.
// ============================================================

import React, { useState } from 'react';

function Topbar({ title, user }) {

  const [search, setSearch] = useState('');

  return (
    <div style={styles.topbar}>

      {/* ── LEFT: Page Title ── */}
      <div style={styles.titleWrap}>
        <h2 style={styles.title}>{title}</h2>
      </div>

      {/* ── CENTER: Search Bar ── */}
      <div style={styles.searchWrap}>
        <span style={styles.searchIcon}>🔍</span>
        <input
          style={styles.searchInput}
          placeholder="Search here"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* ── RIGHT: User Info ── */}
      <div style={styles.userWrap}>

        {/* Notification bell */}
        <button style={styles.iconBtn} title="Notifications">
          <span style={styles.bellIcon}>🔔</span>
          {/* Red dot for unread notifications */}
          <span style={styles.notifDot} />
        </button>

        {/* User name + designation */}
        <div style={styles.userInfo}>
          <div style={styles.userName}>
            {user?.name || 'Training Manager'}
          </div>
          <div style={styles.userDesig}>
            {/* Small person icon + designation */}
            <span style={styles.desigIcon}>👤</span>
            <span style={styles.desigText}>
              {user?.role || 'Administrator'}
            </span>
          </div>
        </div>

        {/* Profile photo circle */}
        {/* WHY a circle with initials? */}
        {/* We don't have real photos yet (Phase 3). */}
        {/* Initials look professional and are common in */}
        {/* enterprise apps like Slack, Notion, Gmail. */}
        <div style={styles.avatar}>
          {(user?.name || 'TM')
            .split(' ')
            .slice(0, 2)
            .map(w => w[0])
            .join('')
            .toUpperCase()
          }
        </div>

      </div>
    </div>
  );
}

const styles = {
  topbar: {
    height: '64px',
    background: '#ffffff',
    borderBottom: '1px solid #e8ecf0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 28px',
    flexShrink: 0,
    // WHY flexShrink: 0?
    // The topbar should never shrink when the page content
    // is tall. It stays a fixed height always.
    gap: '16px',
  },

  // Left
  titleWrap: { minWidth: '160px' },
  title: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#051c2c',
    margin: 0,
    letterSpacing: '-0.3px',
  },

  // Center search
  searchWrap: {
    flex: 1,
    maxWidth: '420px',
    display: 'flex',
    alignItems: 'center',
    background: '#f2f4f6',
    border: '1.5px solid #e8ecf0',
    borderRadius: '10px',
    padding: '0 14px',
    gap: '8px',
    transition: 'border-color 0.15s',
  },
  searchIcon: { fontSize: '14px', flexShrink: 0 },
  searchInput: {
    flex: 1,
    border: 'none',
    outline: 'none',
    background: 'transparent',
    fontSize: '13.5px',
    color: '#051c2c',
    padding: '10px 0',
    fontFamily: 'Inter, sans-serif',
  },

  // Right user section
  userWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    minWidth: '220px',
    justifyContent: 'flex-end',
  },
  iconBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    position: 'relative',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
  },
  bellIcon: { fontSize: '18px' },
  notifDot: {
    position: 'absolute',
    top: '2px',
    right: '2px',
    width: '8px',
    height: '8px',
    background: '#dc2626',
    borderRadius: '50%',
    border: '1.5px solid #ffffff',
  },
  userInfo: { textAlign: 'right' },
  userName: {
    fontSize: '13.5px',
    fontWeight: '700',
    color: '#051c2c',
    lineHeight: 1.2,
  },
  userDesig: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: '4px',
    marginTop: '3px',
  },
  desigIcon: { fontSize: '10px' },
  desigText: {
    fontSize: '11px',
    color: '#ffffff',
    background: '#051c2c',
    padding: '2px 8px',
    borderRadius: '4px',
    fontWeight: '500',
  },
  avatar: {
    width: '38px',
    height: '38px',
    borderRadius: '50%',
    background: '#051c2c',
    border: '2px solid #e8ecf0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '13px',
    fontWeight: '700',
    color: '#ffffff',
    flexShrink: 0,
    cursor: 'pointer',
    // WHY cursor pointer?
    // In Phase 3, clicking the avatar will open
    // a profile/settings dropdown.
  },
};

export default Topbar;