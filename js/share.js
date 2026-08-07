(function () {
  'use strict';

  var shareBtn = document.getElementById('shareBtn');
  var pop = document.getElementById('sharePop');
  var waBtn = document.getElementById('shareWhatsapp');
  var copyBtn = document.getElementById('shareCopy');
  var mdBtn = document.getElementById('shareMd');
  var copied = document.getElementById('shareCopied');
  var copyTimer = null;

  function pageUrl() {
    return window.location.href;
  }

  function pageTitle() {
    return document.title || 'Feasibility Study';
  }

  function open() {
    if (!pop) return;
    pop.classList.add('is-open');
    if (shareBtn) shareBtn.setAttribute('aria-expanded', 'true');
  }

  function close() {
    if (!pop) return;
    pop.classList.remove('is-open');
    if (shareBtn) shareBtn.setAttribute('aria-expanded', 'false');
  }

  function toggle() {
    if (pop && pop.classList.contains('is-open')) close();
    else open();
  }

  function copyLink() {
    var url = pageUrl();
    var done = function () {
      if (copied) copied.classList.add('is-visible');
      clearTimeout(copyTimer);
      copyTimer = setTimeout(function () {
        if (copied) copied.classList.remove('is-visible');
      }, 2000);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(done, done);
    } else {
      var ta = document.createElement('textarea');
      ta.value = url;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); } catch (e) {}
      document.body.removeChild(ta);
      done();
    }
  }

  function shareWhatsapp() {
    var text = encodeURIComponent(pageTitle() + ' — ' + pageUrl());
    window.open('https://wa.me/?text=' + text, '_blank', 'noopener');
  }

  function exportMarkdown() {
    if (window.ExportMD) window.ExportMD.run();
  }

  function onDocClick(event) {
    if (!pop) return;
    var t = event.target;
    if (!pop.contains(t) && t !== shareBtn && !(shareBtn && shareBtn.contains(t))) {
      close();
    }
  }

  if (shareBtn) {
    shareBtn.addEventListener('click', toggle);
  }
  if (waBtn) waBtn.addEventListener('click', shareWhatsapp);
  if (copyBtn) copyBtn.addEventListener('click', copyLink);
  if (mdBtn) mdBtn.addEventListener('click', exportMarkdown);

  document.addEventListener('click', onDocClick);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') close();
  });

  window.Share = {
    open: open,
    close: close
  };
})();
