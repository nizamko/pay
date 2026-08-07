(function () {
  'use strict';

  var THEME_KEY = 'escrow-theme';
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var progressBar = document.getElementById('readingProgress');
  var themeBtn = document.getElementById('themeBtn');
  var tocToggle = document.getElementById('tocToggle');
  var sidebar = document.getElementById('sidebar');
  var backToTop = document.getElementById('backToTop');
  var tocLinks = Array.prototype.slice.call(document.querySelectorAll('.toc__list a'));
  var sections = Array.prototype.slice.call(document.querySelectorAll('.section[id]'));

  function initTheme() {
    var saved = null;
    try { saved = localStorage.getItem(THEME_KEY); } catch (e) {}
    var theme = saved || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', theme);
    if (themeBtn) {
      themeBtn.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
    }
  }

  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      var next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      themeBtn.setAttribute('aria-pressed', next === 'dark' ? 'true' : 'false');
      try { localStorage.setItem(THEME_KEY, next); } catch (e) {}
    });
  }

  function updateProgress() {
    if (!progressBar) return;
    var doc = document.documentElement;
    var total = doc.scrollHeight - window.innerHeight;
    var ratio = total > 0 ? window.scrollY / total : 0;
    progressBar.style.width = (ratio * 100).toFixed(2) + '%';
  }

  function toggleBackToTop() {
    if (!backToTop) return;
    if (window.scrollY > 480) {
      backToTop.classList.remove('is-hidden');
    } else {
      backToTop.classList.add('is-hidden');
    }
  }

  function setActiveLink(id) {
    tocLinks.forEach(function (link) {
      link.classList.toggle('is-active', link.getAttribute('href') === '#' + id);
    });
  }

  function scrollSpy() {
    var probe = window.scrollY + window.innerHeight * 0.32;
    var current = sections[0] ? sections[0].id : null;
    sections.forEach(function (section) {
      if (section.offsetTop <= probe) current = section.id;
    });
    setActiveLink(current);
  }

  function onScroll() {
    updateProgress();
    toggleBackToTop();
    scrollSpy();
  }

  if (backToTop) {
    backToTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    });
  }

  if (tocToggle && sidebar) {
    tocToggle.addEventListener('click', function () {
      var expanded = tocToggle.getAttribute('aria-expanded') === 'true';
      tocToggle.setAttribute('aria-expanded', String(!expanded));
      sidebar.classList.toggle('is-open', !expanded);
    });
  }

  document.addEventListener('click', function (event) {
    var anchor = event.target.closest('a[href^="#"]');
    if (!anchor || !sidebar || !tocToggle) return;
    if (window.innerWidth <= 1023) {
      tocToggle.setAttribute('aria-expanded', 'false');
      sidebar.classList.remove('is-open');
    }
  });

  window.addEventListener('scroll', onScroll, { passive: true });

  function initReveal() {
    var targets = document.querySelectorAll('.section');
    if (prefersReducedMotion) {
      targets.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }
    if ('IntersectionObserver' in window) {
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.08, rootMargin: '0px 0px -60px 0px' });
      targets.forEach(function (el) { observer.observe(el); });
    } else {
      targets.forEach(function (el) { el.classList.add('is-visible'); });
    }
  }

  window.UI = {
    init: function () {
      initTheme();
      initReveal();
      onScroll();
      scrollSpy();
    },
    flashSection: function (id) {
      var section = document.getElementById(id);
      if (!section) return;
      if (prefersReducedMotion) return;
      section.classList.add('is-visible');
      section.classList.remove('is-highlighted');
      void section.offsetWidth;
      section.classList.add('is-highlighted');
    }
  };
})();
