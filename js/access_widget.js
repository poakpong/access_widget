/**
 * @file access_widget.js
 * Builds and wires up the Access Widget toolbar.
 * Collapsed: small "A+" button. Click to expand panel. X (or Esc) to close.
 */

(function (Drupal, drupalSettings) {
  'use strict';

  // ── Safe localStorage helpers ────────────────────────────────────────────────

  function lsGet(key) {
    try { return localStorage.getItem(key); }
    catch (e) { return null; }
  }

  function lsSet(key, value) {
    try { localStorage.setItem(key, value); }
    catch (e) { /* quota / private browsing / blocked — ignore */ }
  }

  // ── DOM helpers (avoid innerHTML, no string concatenation of attributes) ─────

  function el(tag, className, attrs) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (attrs) {
      for (var k in attrs) {
        if (Object.prototype.hasOwnProperty.call(attrs, k)) {
          node.setAttribute(k, attrs[k]);
        }
      }
    }
    return node;
  }

  function makeBtn(className, text, attrs) {
    var btn = el('button', className, attrs);
    btn.type = 'button';
    if (text != null) btn.textContent = text;
    return btn;
  }

  function makeSpan(className, text, attrs) {
    var span = el('span', className, attrs);
    if (text != null) span.textContent = text;
    return span;
  }

  function makeIcon(className, ch) {
    return makeSpan(className, ch, { 'aria-hidden': 'true' });
  }

  // ── Behavior ────────────────────────────────────────────────────────────────

  Drupal.behaviors.accessWidget = {
    attach: function (context) {
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

      // ── State helpers ─────────────────────────────────────────────────────────

      function applyFontSize(size) {
        document.documentElement.style.fontSize = size + '%';
      }

      function applyDarkMode(isDark) {
        document.documentElement.classList.toggle('dark-mode', isDark);
        document.body.classList.toggle('dark-mode', isDark);
      }

      // ── Resolve initial values ────────────────────────────────────────────────

      var fontSize = cfg.fontSizeDefault;
      var darkMode = cfg.darkModeDefault === 'dark';

      if (cfg.darkModeDefault === 'system') {
        darkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
      }

      if (cfg.persistPrefs) {
        var savedSize = lsGet('accessWidget_fontSize');
        var savedDark = lsGet('accessWidget_darkMode');

        if (savedSize !== null) {
          var parsed = parseInt(savedSize, 10);
          if (Number.isFinite(parsed)) {
            fontSize = Math.max(cfg.fontSizeMin, Math.min(cfg.fontSizeMax, parsed));
          }
        }

        if (savedDark !== null) {
          darkMode = savedDark === 'true';
        }
      }

      // ── Build trigger (collapsed state) ───────────────────────────────────────

      var trigger = makeBtn('access-widget__trigger', null, {
        'aria-label':    Drupal.t('Open accessibility controls'),
        'aria-expanded': 'false',
        'aria-controls': 'access-widget-panel',
        'title':         Drupal.t('Accessibility controls')
      });
      // Two baseline-aligned "A"s — small then large, both aria-hidden.
      var triggerLabel = el('span', 'access-widget__trigger-label', { 'aria-hidden': 'true' });
      triggerLabel.appendChild(makeSpan('access-widget__trigger-a--sm', 'A'));
      triggerLabel.appendChild(makeSpan('access-widget__trigger-a--lg', 'A'));
      trigger.appendChild(triggerLabel);

      // ── Build panel (expanded state) ──────────────────────────────────────────

      var panel = el('div', 'access-widget__panel', {
        'id':         'access-widget-panel',
        'role':       'group',
        'aria-label': Drupal.t('Accessibility controls')
      });

      var btnDec, btnInc, btnReset, sizeLabel, btnDark;

      if (cfg.enableFontSize) {
        var fsGroup = el('div', 'access-widget__font-size', {
          'role':       'group',
          'aria-label': Drupal.t('Font size')
        });

        btnDec = makeBtn('access-widget__btn access-widget__btn--decrease', 'A-', {
          'aria-label': Drupal.t('Decrease font size'),
          'title':      Drupal.t('Decrease font size')
        });

        sizeLabel = makeSpan('access-widget__size-label', fontSize + '%', {
          'aria-live':   'polite',
          'aria-atomic': 'true'
        });

        btnReset = makeBtn('access-widget__btn access-widget__btn--reset', 'A', {
          'aria-label': Drupal.t('Reset font size'),
          'title':      Drupal.t('Reset font size')
        });

        btnInc = makeBtn('access-widget__btn access-widget__btn--increase', 'A+', {
          'aria-label': Drupal.t('Increase font size'),
          'title':      Drupal.t('Increase font size')
        });

        fsGroup.appendChild(btnDec);
        fsGroup.appendChild(sizeLabel);
        fsGroup.appendChild(btnReset);
        fsGroup.appendChild(btnInc);
        panel.appendChild(fsGroup);
      }

      if (cfg.enableFontSize && cfg.enableDarkMode) {
        panel.appendChild(makeSpan('access-widget__divider', null, { 'aria-hidden': 'true' }));
      }

      if (cfg.enableDarkMode) {
        btnDark = makeBtn('access-widget__btn access-widget__btn--darkmode', null, {
          'aria-label':   Drupal.t('Toggle dark mode'),
          'aria-pressed': String(darkMode),
          'title':        Drupal.t('Toggle dark mode')
        });
        btnDark.appendChild(makeIcon('access-widget__icon access-widget__icon--sun',  '☀️'));
        btnDark.appendChild(makeIcon('access-widget__icon access-widget__icon--moon', '🌙'));
        panel.appendChild(btnDark);
      }

      if (cfg.enableFontSize || cfg.enableDarkMode) {
        panel.appendChild(makeSpan('access-widget__divider', null, { 'aria-hidden': 'true' }));
      }

      var btnClose = makeBtn('access-widget__btn access-widget__btn--close', '✕', {
        'aria-label': Drupal.t('Close accessibility controls'),
        'title':      Drupal.t('Close')
      });
      panel.appendChild(btnClose);

      // ── Assemble widget ───────────────────────────────────────────────────────

      var widget = el('div', null, { 'id': 'access-widget' });
      widget.appendChild(trigger);
      widget.appendChild(panel);

      // ── Position (fixed) — Number.isFinite so offset 0 works ─────────────────

      widget.style.position = 'fixed';
      widget.style.zIndex   = '9999';

      var pos = cfg.position || 'top-left';

      var ox = parseInt(cfg.offsetX, 10);
      if (!Number.isFinite(ox)) ox = 20;
      var oy = parseInt(cfg.offsetY, 10);
      if (!Number.isFinite(oy)) oy = 20;

      if (pos.indexOf('top')    !== -1) { widget.style.top    = oy + 'px'; }
      if (pos.indexOf('bottom') !== -1) { widget.style.bottom = oy + 'px'; }
      if (pos.indexOf('left')   !== -1) { widget.style.left   = ox + 'px'; }
      if (pos.indexOf('right')  !== -1) { widget.style.right  = ox + 'px'; }

      document.body.appendChild(widget);

      // ── Apply initial dark mode / font size ──────────────────────────────────

      applyFontSize(fontSize);
      applyDarkMode(darkMode);

      // ── Collapse / Expand ─────────────────────────────────────────────────────

      // Initial display — explicit inline styles win over any theme CSS.
      trigger.style.display = 'flex';
      panel.style.display   = 'none';

      function openPanel() {
        trigger.style.display = 'none';
        panel.style.display   = 'flex';
        widget.classList.add('is-open');
        trigger.setAttribute('aria-expanded', 'true');
        // Move focus into the panel for keyboard / screen reader users.
        var firstFocusable = panel.querySelector('button');
        if (firstFocusable) firstFocusable.focus();
      }

      function closePanel() {
        panel.style.display   = 'none';
        trigger.style.display = 'flex';
        widget.classList.remove('is-open');
        trigger.setAttribute('aria-expanded', 'false');
        // Return focus to the trigger so keyboard users don't get lost.
        trigger.focus();
      }

      trigger.addEventListener('click', openPanel);
      btnClose.addEventListener('click', closePanel);

      // Esc anywhere inside the panel closes it.
      panel.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' || e.keyCode === 27) {
          e.stopPropagation();
          closePanel();
        }
      });

      // ── Font size listeners ──────────────────────────────────────────────────

      if (cfg.enableFontSize) {
        btnDec.addEventListener('click', function () {
          if (fontSize > cfg.fontSizeMin) {
            fontSize = Math.max(cfg.fontSizeMin, fontSize - cfg.fontSizeStep);
            sizeLabel.textContent = fontSize + '%';
            applyFontSize(fontSize);
            if (cfg.persistPrefs) lsSet('accessWidget_fontSize', String(fontSize));
          }
        });

        btnInc.addEventListener('click', function () {
          if (fontSize < cfg.fontSizeMax) {
            fontSize = Math.min(cfg.fontSizeMax, fontSize + cfg.fontSizeStep);
            sizeLabel.textContent = fontSize + '%';
            applyFontSize(fontSize);
            if (cfg.persistPrefs) lsSet('accessWidget_fontSize', String(fontSize));
          }
        });

        btnReset.addEventListener('click', function () {
          fontSize = cfg.fontSizeDefault;
          sizeLabel.textContent = fontSize + '%';
          applyFontSize(fontSize);
          if (cfg.persistPrefs) lsSet('accessWidget_fontSize', String(fontSize));
        });
      }

      // ── Dark mode listener ───────────────────────────────────────────────────

      if (cfg.enableDarkMode) {
        btnDark.addEventListener('click', function () {
          darkMode = !darkMode;
          applyDarkMode(darkMode);
          btnDark.setAttribute('aria-pressed', String(darkMode));
          if (cfg.persistPrefs) lsSet('accessWidget_darkMode', String(darkMode));
        });

        // Keep in sync when OS preference changes (only if no saved preference).
        if (cfg.darkModeDefault === 'system' && !cfg.persistPrefs) {
          window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
            darkMode = e.matches;
            applyDarkMode(darkMode);
            btnDark.setAttribute('aria-pressed', String(darkMode));
          });
        }
      }
    }
  };

})(Drupal, drupalSettings);
