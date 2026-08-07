(function () {
  'use strict';

  var overlay = document.getElementById('shortcutsOverlay');
  var closeBtn = document.getElementById('shortcutsClose');

  function isTyping(e) {
    var t = e.target;
    if (!t) return false;
    var tag = (t.tagName || '').toLowerCase();
    return tag === 'input' || tag === 'textarea' || tag === 'select' || t.isContentEditable;
  }

  function isSearchOpen() {
    var overlaySearch = document.getElementById('searchOverlay');
    return overlaySearch && !overlaySearch.hidden;
  }

  function openShortcuts() {
    if (!overlay) return;
    overlay.classList.add('is-open');
    if (closeBtn) closeBtn.focus();
  }

  function closeShortcuts() {
    if (!overlay) return;
    overlay.classList.remove('is-open');
  }

  function toggleShortcuts() {
    if (overlay && overlay.classList.contains('is-open')) closeShortcuts();
    else openShortcuts();
  }

  function scrollToSection(dir) {
    var sections = Array.prototype.slice.call(document.querySelectorAll('.section[id]'));
    if (!sections.length) return;
    var currentId = null;
    var probe = window.scrollY + window.innerHeight * 0.32;
    sections.forEach(function (s) {
      if (s.offsetTop <= probe) currentId = s.id;
    });
    var idx = sections.findIndex(function (s) { return s.id === currentId; });
    if (idx === -1) idx = dir > 0 ? -1 : 0;
    var next = sections[Math.max(0, Math.min(sections.length - 1, idx + dir))];
    if (next) {
      next.scrollIntoView({ behavior: 'smooth', block: 'start' });
      if (window.UI && window.UI.flashSection) window.UI.flashSection(next.id);
    }
  }

  function openSearch() {
    var btn = document.querySelector('[data-search-open]');
    if (btn) btn.click();
  }

  function toggleTTS() {
    var btn = document.getElementById('ttsBtn');
    if (btn) btn.click();
  }

  function exportPDF() {
    var btn = document.getElementById('pdfBtn');
    if (btn) btn.click();
  }

  function exportMD() {
    if (window.ExportMD) window.ExportMD.run();
  }

  function toggleShare() {
    if (window.Share) {
      var pop = document.getElementById('sharePop');
      if (pop && pop.classList.contains('is-open')) window.Share.close();
      else window.Share.open();
    }
  }

  function scrollTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  document.addEventListener('keydown', function (event) {
    if (isTyping(event)) {
      if (event.key === 'Escape') closeShortcuts();
      return;
    }

    var k = event.key;

    if (k === '?') {
      event.preventDefault();
      toggleShortcuts();
      return;
    }

    if (k === 'Escape') {
      closeShortcuts();
      if (window.Share) window.Share.close();
      return;
    }

    if (event.ctrlKey || event.metaKey || event.altKey) return;

    if (isSearchOpen()) return;

    switch (k.toLowerCase()) {
      case '/':
      case 's':
        event.preventDefault();
        openSearch();
        break;
      case 't':
        toggleTTS();
        break;
      case 'p':
        event.preventDefault();
        exportPDF();
        break;
      case 'm':
        event.preventDefault();
        exportMD();
        break;
      case 'b':
        event.preventDefault();
        toggleShare();
        break;
      case '+':
      case '=':
        if (window.UI) window.UI.stepFont(1);
        break;
      case '-':
      case '_':
        if (window.UI) window.UI.stepFont(-1);
        break;
      case '0':
        if (window.UI) window.UI.resetFont();
        break;
      case 'k':
      case 'ArrowUp':
        scrollToSection(-1);
        break;
      case 'j':
      case 'ArrowDown':
        scrollToSection(1);
        break;
      case 'g':
        scrollTop();
        break;
    }
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', closeShortcuts);
  }

  window.Shortcuts = {
    open: openShortcuts,
    close: closeShortcuts
  };
})();
