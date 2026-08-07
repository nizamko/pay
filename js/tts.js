(function () {
  'use strict';

  var btn = document.getElementById('ttsBtn');
  var tip = btn ? btn.querySelector('.toolbar__tip') : null;
  var speaking = false;
  var started = false;

  function getText() {
    var content = document.querySelector('.content');
    return content ? content.innerText.replace(/\s+/g, ' ').trim() : '';
  }

  function getLangCode() {
    return document.documentElement.getAttribute('lang') === 'en' ? 'en-US' : 'ar-EG';
  }

  function pickVoice(lang) {
    var voices = window.speechSynthesis.getVoices();
    if (!voices.length) return null;
    var preferred = lang === 'ar-EG' ? 'ar' : 'en';
    var exact = voices.find(function (v) {
      return v.lang && v.lang.toLowerCase() === lang.toLowerCase();
    });
    if (exact) return exact;
    return voices.find(function (v) {
      return v.lang && v.lang.toLowerCase().indexOf(preferred) === 0;
    }) || null;
  }

  function speak() {
    var text = getText();
    if (!text || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();
    var utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = getLangCode();
    utterance.rate = 1;
    utterance.pitch = 1;
    var voice = pickVoice(utterance.lang);
    if (voice) utterance.voice = voice;

    utterance.onend = stop;
    utterance.onerror = stop;
    window.speechSynthesis.speak(utterance);
    speaking = true;
    started = true;
    setState(true);
  }

  function stop() {
    window.speechSynthesis.cancel();
    speaking = false;
    setState(false);
  }

  function setState(active) {
    if (!btn) return;
    btn.classList.toggle('is-active', active);
    btn.setAttribute('aria-pressed', String(active));
    if (tip) {
      var isAr = document.documentElement.getAttribute('lang') === 'ar';
      if (active) {
        tip.textContent = isAr ? '\u0625\u064a\u0642\u0627\u0641 \u0627\u0644\u0642\u0631\u0627\u0621\u0629' : window.I18n.translate('toolbar.ttsStopTip');
      } else {
        tip.textContent = isAr ? '\u0627\u0633\u062a\u0645\u0627\u0639 \u0644\u0644\u062f\u0631\u0627\u0633\u0629' : window.I18n.translate('toolbar.ttsTip');
      }
    }
  }

  if (btn) {
    btn.addEventListener('click', function () {
      if (speaking) {
        stop();
      } else {
        speak();
      }
    });
  }

  document.addEventListener('i18n:changed', function () {
    if (speaking) stop();
  });

  if (window.speechSynthesis) {
    window.speechSynthesis.onvoiceschanged = function () {};
  }

  window.TTS = {
    stop: stop
  };
})();
