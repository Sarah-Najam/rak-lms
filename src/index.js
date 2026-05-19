// ============================================================
// index.js — The Entry Point
//
// WHY THIS FILE?
// This is the FIRST file React runs.
// Its only job is to find the <div id="root"> in index.html
// and inject our entire App component inside it.
//
// Every website has an index.html with this div:
// <div id="root"></div>
// React fills that empty div with our entire application.
// ============================================================

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// WHY createRoot?
// This is React 18's way of starting the app.
// It finds the <div id="root"> in public/index.html
// and renders our <App /> component inside it.
const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  // WHY <React.StrictMode>?
  // StrictMode is a helper that shows extra warnings
  // during development to help you write better code.
  // It has NO effect on the final production build.
  <React.StrictMode>
    <App />
  </React.StrictMode>
);