/*
 * ToolPitara — shared site script.
 * 1) Light/dark theme toggle, persisted in localStorage (this browser only).
 * 2) Homepage tool search: filters the tool cards as you type.
 * No data is sent anywhere; everything here runs on the visitor's device.
 */
(function () {
  'use strict';

  /* ---------- Theme ---------- */
  var root = document.documentElement;
  var toggle = document.getElementById('themeToggle');

  function currentTheme() {
    return root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  }
  function paintToggle() {
    if (!toggle) return;
    var dark = currentTheme() === 'dark';
    toggle.textContent = dark ? '☀️ Light mode' : '🌙 Dark mode';
    toggle.setAttribute('aria-pressed', dark ? 'true' : 'false');
  }
  if (toggle) {
    paintToggle();
    toggle.addEventListener('click', function () {
      var next = currentTheme() === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('tp-theme', next); } catch (e) { /* private mode */ }
      paintToggle();
      document.dispatchEvent(new CustomEvent('tp-theme-change'));
    });
  }

  /* ---------- Homepage search filter ---------- */
  var search = document.getElementById('toolSearch');
  if (search) {
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-tool-card]'));
    var sections = Array.prototype.slice.call(document.querySelectorAll('[data-category]'));
    var noResults = document.getElementById('noResults');

    search.addEventListener('input', function () {
      var q = search.value.trim().toLowerCase();
      var visibleCount = 0;
      cards.forEach(function (card) {
        var hay = (card.getAttribute('data-search') || card.textContent).toLowerCase();
        var show = !q || hay.indexOf(q) !== -1;
        card.style.display = show ? '' : 'none';
        if (show) visibleCount++;
      });
      sections.forEach(function (sec) {
        var any = Array.prototype.some.call(
          sec.querySelectorAll('[data-tool-card]'),
          function (c) { return c.style.display !== 'none'; }
        );
        sec.style.display = any ? '' : 'none';
      });
      if (noResults) noResults.hidden = visibleCount !== 0;
    });
  }
})();
