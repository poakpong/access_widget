/**
 * @file access_widget-nofouc.js
 * Pre-paint dark mode application to prevent flash of light mode.
 * Loaded in <head> with negative weight so it runs before <body> renders.
 * CSP-safe (no inline script).
 */
(function () {
  'use strict';
  try {
    var v = localStorage.getItem('accessWidget_darkMode');
    if (v === 'true') {
      document.documentElement.classList.add('dark-mode');
      document.addEventListener('DOMContentLoaded', function () {
        document.body.classList.add('dark-mode');
      });
    }
  } catch (e) {
    // localStorage unavailable (private browsing, blocked, quota) — ignore.
  }
})();
