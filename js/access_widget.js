/**
 * @file access_widget.js
 * Builds and wires up the Access Widget toolbar.
 */

(function (Drupal, drupalSettings) {
  'use strict';

  Drupal.behaviors.accessWidget = {
    attach: function (context, settings) {
      // Run only once on the full document.
      if (context !== document || document.getElementById('access-widget')) {
        return;
      }

      var cfg = Object.assign(
        {
          position:        'top-left',
          offsetX:         20,
          offsetY:         20,
          enableFontSize:  true,
          fontSizeDefault: 100,
          fontSizeMin:     80,
          fontSizeMax:     130,
          fontSizeStep:    10,
          enableDarkMode:  true,
          darkModeDefault: 'light',
          persistPrefs:    true,
        },
        drupalSettings.accessWidget || {}
      );

      // ── Resolve initial values ──────────────────────────────────────────────

      var fontSize = cfg.fontSizeDefault;
      var darkMode = cfg.darkModeDefault === 'dark';

      if (cfg.darkModeDefault === 'system') {
        darkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
      }

      if (cfg.persistPrefs) {
        var savedSize = localStorage.getItem('accessWidget_fontSize');
        var savedDark = localStorage.getItem('accessWidget_darkMode');
        if (savedSize !== null) {
          fontSize = parseInt(savedSize, 10);
        }
        if (savedDark !== null) {
          darkMode = savedDark === 'true';
        }
      }

      // ── Build widget HTML ───────────────────────────────────────────────────

      var widget = document.createElement('div');
      widget.id = 'access-widget';
      widget.setAttribute('role', 'toolbar');
      widget.setAttribute('aria-label', Drupal.t('Accessibility controls'));

      var html = '';

      if (cfg.enableFontSize) {
        html +=
          '<div class="access-widget__font-size" role="group" aria-label="' + Drupal.t('Font size') + '">' +
            '<button class="access-widget__btn access-widget__btn--decrease"' +
              ' aria-label="' + Drupal.t('Decrease font size') + '"' +
              ' title="' + Drupal.t('Decrease font size') + '">A-</button>' +
            '<span class="access-widget__size-label" aria-live="polite" aria-atomic="true">' + fontSize + '%</span>' +
            '<button class="access-widget__btn access-widget__btn--reset"' +
              ' aria-label="' + Drupal.t('Reset font size') + '"' +
              ' title="' + Drupal.t('Reset font size') + '">A</button>' +
            '<button class="access-widget__btn access-widget__btn--increase"' +
              ' aria-label="' + Drupal.t('Increase font size') + '"' +
              ' title="' + Drupal.t('Increase font size') + '">A+</button>' +
          '</div>';
      }

      if (cfg.enableFontSize && cfg.enableDarkMode) {
        html += '<span class="access-widget__divider" aria-hidden="true"></span>';
      }

      if (cfg.enableDarkMode) {
        html +=
          '<button class="access-widget__btn access-widget__btn--darkmode"' +
            ' aria-label="' + Drupal.t('Toggle dark mode') + '"' +
            ' aria-pressed="' + darkMode + '"' +
            ' title="' + Drupal.t('Toggle dark mode') + '">' +
            '<span class="access-widget__icon access-widget__icon--sun"  aria-hidden="true">☀️</span>' +
            '<span class="access-widget__icon access-widget__icon--moon" aria-hidden="true">🌙</span>' +
          '</button>';
      }

      widget.innerHTML = html;

      // ── Position (fixed) ────────────────────────────────────────────────────

      widget.style.position = 'fixed';
      widget.style.zIndex   = '9999';

      var pos = cfg.position || 'top-left';
      var ox  = parseInt(cfg.offsetX, 10) || 20;
      var oy  = parseInt(cfg.offsetY, 10) || 20;

      if (pos.indexOf('top')    !== -1) { widget.style.top    = oy + 'px'; }
      if (pos.indexOf('bottom') !== -1) { widget.style.bottom = oy + 'px'; }
      if (pos.indexOf('left')   !== -1) { widget.style.left   = ox + 'px'; }
      if (pos.indexOf('right')  !== -1) { widget.style.right  = ox + 'px'; }

      document.body.appendChild(widget);

      // ── Apply initial state ─────────────────────────────────────────────────

      applyFontSize(fontSize);
      applyDarkMode(darkMode);

      // ── Font size listeners ─────────────────────────────────────────────────

      if (cfg.enableFontSize) {
        var btnDec   = widget.querySelector('.access-widget__btn--decrease');
        var btnInc   = widget.querySelector('.access-widget__btn--increase');
        var btnReset = widget.querySelector('.access-widget__btn--reset');
        var label    = widget.querySelector('.access-widget__size-label');

        btnDec.addEventListener('click', function () {
          if (fontSize > cfg.fontSizeMin) {
            fontSize = Math.max(cfg.fontSizeMin, fontSize - cfg.fontSizeStep);
            updateFontSize();
          }
        });

        btnInc.addEventListener('click', function () {
          if (fontSize < cfg.fontSizeMax) {
            fontSize = Math.min(cfg.fontSizeMax, fontSize + cfg.fontSizeStep);
            updateFontSize();
          }
        });

        btnReset.addEventListener('click', function () {
          fontSize = cfg.fontSizeDefault;
          updateFontSize();
        });

        function updateFontSize() {
          label.textContent = fontSize + '%';
          applyFontSize(fontSize);
          if (cfg.persistPrefs) {
            localStorage.setItem('accessWidget_fontSize', fontSize);
          }
        }
      }

      // ── Dark mode listener ──────────────────────────────────────────────────

      if (cfg.enableDarkMode) {
        var btnDark = widget.querySelector('.access-widget__btn--darkmode');

        btnDark.addEventListener('click', function () {
          darkMode = !darkMode;
          applyDarkMode(darkMode);
          btnDark.setAttribute('aria-pressed', darkMode);
          if (cfg.persistPrefs) {
            localStorage.setItem('accessWidget_darkMode', darkMode);
          }
        });

        // Keep in sync when OS preference changes (only if no saved preference).
        if (cfg.darkModeDefault === 'system' && cfg.persistPrefs === false) {
          window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
            darkMode = e.matches;
            applyDarkMode(darkMode);
            btnDark.setAttribute('aria-pressed', darkMode);
          });
        }
      }

      // ── Helpers ─────────────────────────────────────────────────────────────

      function applyFontSize(size) {
        document.documentElement.style.fontSize = size + '%';
      }

      function applyDarkMode(isDark) {
        if (isDark) {
          document.documentElement.setAttribute('data-access-widget-theme', 'dark');
        }
        else {
          document.documentElement.removeAttribute('data-access-widget-theme');
        }
      }
    }
  };

})(Drupal, drupalSettings);
