(function () {
  'use strict';

  var overlay = document.getElementById('searchOverlay');
  var input = document.getElementById('searchInput');
  var results = document.getElementById('searchResults');
  var empty = document.getElementById('searchEmpty');
  var openBtns = document.querySelectorAll('[data-search-open]');
  var closeBtns = document.querySelectorAll('[data-search-close]');
  var index = [];
  var focusedIndex = -1;

  function normalize(text) {
    return text.replace(/\s+/g, ' ').trim();
  }

  function buildIndex() {
    index = Array.prototype.map.call(document.querySelectorAll('.section[id]'), function (section) {
      var head = section.querySelector('.section__head h2');
      var num = section.querySelector('.section__num');
      return {
        id: section.id,
        num: num ? num.textContent.trim() : '',
        title: head ? normalize(head.textContent) : '',
        text: normalize(section.textContent)
      };
    });
  }

  function escapeHtml(value) {
    return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function highlight(text, query) {
    if (!query) return escapeHtml(text);
    var safe = escapeHtml(text);
    var idx = safe.toLowerCase().indexOf(query.toLowerCase());
    if (idx === -1) return safe;
    var end = idx + query.length;
    return safe.slice(0, idx) + '<mark>' + safe.slice(idx, end) + '</mark>' + safe.slice(end);
  }

  function render(items, query) {
    results.innerHTML = '';
    empty.hidden = true;
    focusedIndex = -1;

    if (!items.length) {
      empty.hidden = false;
      return;
    }

    items.forEach(function (item, i) {
      var li = document.createElement('li');
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'search-result';
      btn.setAttribute('data-index', String(i));

      var title = document.createElement('span');
      title.className = 'search-result__title';
      title.innerHTML = '<span class="search-result__num">' + escapeHtml(item.num) + '</span>' + highlight(item.title, query);

      var snippet = document.createElement('span');
      snippet.className = 'search-result__snippet';
      snippet.innerHTML = highlight(item.snippet, query);

      btn.appendChild(title);
      btn.appendChild(snippet);
      li.appendChild(btn);
      results.appendChild(li);

      btn.addEventListener('click', function () {
        goTo(item.id);
      });
    });
  }

  function buildSnippets(query) {
    var q = query.trim().toLowerCase();
    index.forEach(function (item) {
      var pos = item.text.toLowerCase().indexOf(q);
      if (pos === -1) {
        item.snippet = item.text.slice(0, 120);
        return;
      }
      var start = Math.max(0, pos - 60);
      var slice = item.text.slice(start, pos + q.length + 80);
      item.snippet = (start > 0 ? '\u2026 ' : '') + slice;
    });
  }

  function runSearch() {
    var query = input.value.trim();
    if (!query) {
      render([], query);
      return;
    }
    buildSnippets(query);
    var matches = index.filter(function (item) {
      return item.text.toLowerCase().indexOf(query.toLowerCase()) !== -1;
    });
    render(matches, query);
  }

  function goTo(id) {
    var target = document.getElementById(id);
    if (!target) return;
    overlay.hidden = true;
    input.value = '';
    render([], '');
    window.scrollTo({
      top: target.getBoundingClientRect().top + window.scrollY - 96,
      behavior: 'smooth'
    });
    window.UI.flashSection(id);
  }

  function open() {
    buildIndex();
    overlay.hidden = false;
    render([], '');
    setTimeout(function () { input.focus(); }, 60);
  }

  function close() {
    overlay.hidden = true;
    input.blur();
  }

  openBtns.forEach(function (btn) {
    btn.addEventListener('click', open);
  });

  closeBtns.forEach(function (btn) {
    btn.addEventListener('click', close);
  });

  input.addEventListener('input', runSearch);

  input.addEventListener('keydown', function (event) {
    var items = results.querySelectorAll('.search-result');
    if (!items.length) return;
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      focusedIndex += event.key === 'ArrowDown' ? 1 : -1;
      if (focusedIndex < 0) focusedIndex = items.length - 1;
      if (focusedIndex >= items.length) focusedIndex = 0;
      items.forEach(function (el, i) {
        el.classList.toggle('is-focused', i === focusedIndex);
      });
    } else if (event.key === 'Enter') {
      event.preventDefault();
      var target = results.querySelector('.search-result.is-focused') || items[0];
      if (target) target.click();
    } else if (event.key === 'Escape') {
      close();
    }
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && !overlay.hidden) close();
  });

  overlay.addEventListener('click', function (event) {
    if (event.target === overlay) close();
  });

  document.addEventListener('i18n:changed', function () {
    buildIndex();
    runSearch();
  });

  window.Search = {
    open: open,
    close: close
  };
})();
