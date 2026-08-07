(function (global) {
  'use strict';

  var STORAGE_KEY = 'escrow-lang';
  var DEFAULT_LANG = 'ar';
  var current = DEFAULT_LANG;
  var dict = {};
  var originals = new Map();
  var langBtn = document.getElementById('langBtn');

  function getPath(obj, path) {
    return path.split('.').reduce(function (acc, part) {
      return acc && typeof acc === 'object' ? acc[part] : undefined;
    }, obj);
  }

  function snapshot() {
    var els = document.querySelectorAll('[data-i18n],[data-i18n-html],[data-i18n-placeholder],[data-i18n-aria]');
    els.forEach(function (el) {
      if (originals.has(el)) return;
      originals.set(el, {
        text: el.textContent,
        html: el.innerHTML,
        placeholder: el.getAttribute('placeholder') || '',
        aria: el.getAttribute('aria-label') || ''
      });
    });
  }

  function applyValue(el, attr, value) {
    if (value === undefined || value === null) return;
    if (attr === 'data-i18n-placeholder') {
      el.setAttribute('placeholder', value);
    } else if (attr === 'data-i18n-aria') {
      el.setAttribute('aria-label', value);
    } else {
      el.innerHTML = value;
    }
  }

  function updateLangButton() {
    if (!langBtn) return;
    if (current === 'ar') {
      langBtn.textContent = 'English';
    } else {
      langBtn.textContent = '\u0627\u0644\u0639\u0631\u0628\u064a\u0629';
    }
  }

  function applyLang(lang) {
    current = lang;
    document.documentElement.setAttribute('lang', lang);
    document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
    snapshot();

    var useDict = lang === 'ar' ? null : dict[lang] || null;
    var keys = ['data-i18n', 'data-i18n-html', 'data-i18n-placeholder', 'data-i18n-aria'];

    originals.forEach(function (orig, el) {
      keys.forEach(function (attr) {
        var key = el.getAttribute(attr);
        if (!key) return;
        if (useDict) {
          var value = getPath(useDict, key);
          if (value !== undefined) applyValue(el, attr, value);
        } else {
          if (attr === 'data-i18n-placeholder') el.setAttribute('placeholder', orig.placeholder);
          else if (attr === 'data-i18n-aria') el.setAttribute('aria-label', orig.aria);
          else el.innerHTML = orig.html;
        }
      });
    });

    var titleKey = getPath(useDict || {}, 'meta.title');
    if (titleKey) document.title = titleKey;

    var descKey = getPath(useDict || {}, 'meta.desc');
    var metaDesc = document.querySelector('meta[name="description"]');
    if (descKey && metaDesc) metaDesc.setAttribute('content', descKey);

    updateLangButton();
    document.dispatchEvent(new CustomEvent('i18n:changed', { detail: { lang: lang } }));
  }

  function setLang(lang, silent) {
    if (lang !== 'ar' && lang !== 'en') lang = DEFAULT_LANG;
    try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) {}
    if (lang === 'ar' || dict[lang] || silent) {
      applyLang(lang);
      return;
    }
    fetch('i18n/' + lang + '.json')
      .then(function (res) {
        if (!res.ok) throw new Error('dict not found');
        return res.json();
      })
      .then(function (data) {
        dict[lang] = data;
        applyLang(lang);
      })
      .catch(function () {
        applyLang(DEFAULT_LANG);
      });
  }

  function init() {
    var stored = DEFAULT_LANG;
    try { stored = localStorage.getItem(STORAGE_KEY) || DEFAULT_LANG; } catch (e) {}
    if (stored !== 'ar') {
      setLang(stored);
    } else {
      applyLang(stored);
    }
    if (langBtn) {
      langBtn.addEventListener('click', function () {
        setLang(current === 'ar' ? 'en' : 'ar');
      });
    }
  }

  global.I18n = {
    init: init,
    setLang: setLang,
    getLang: function () { return current; },
    translate: function (key) {
      var value = getPath(dict[current] || {}, key);
      return value !== undefined ? value : key;
    }
  };
})(window);
