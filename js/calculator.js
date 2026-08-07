(function () {
  'use strict';

  var form = document.getElementById('feeCalcForm');
  var input = document.getElementById('feeCalcAmount');
  var error = document.getElementById('feeCalcError');
  var results = document.getElementById('feeCalcResults');
  var tierEl = document.getElementById('calcTier');
  var rateEl = document.getElementById('calcRate');
  var feeEl = document.getElementById('calcFee');
  var gatewayEl = document.getElementById('calcGateway');
  var netEl = document.getElementById('calcNet');

  var TIERS = [
    { max: 500, rate: 0.05, minFee: 10 },
    { max: 3000, rate: 0.04, minFee: 0 },
    { max: Infinity, rate: 0.03, minFee: 0 }
  ];

  var GATEWAY_RATE = 0.0275;
  var GATEWAY_FIXED = 3;

  function tierFor(amount) {
    for (var i = 0; i < TIERS.length; i++) {
      if (amount <= TIERS[i].max) return { index: i, tier: TIERS[i] };
    }
    return { index: TIERS.length - 1, tier: TIERS[TIERS.length - 1] };
  }

  function fmt(v) {
    var rounded = Math.round(v * 100) / 100;
    var str = rounded.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 });
    return str;
  }

  function translate(key) {
    if (window.I18n) return window.I18n.translate(key);
    return key;
  }

  var TIER_AR = ['\u062d\u062a\u0649 500 \u062c', '500 \u2013 3,000 \u062c', '\u0623\u0643\u062b\u0631 \u0645\u0646 3,000 \u062c'];

  function applyTierText(index) {
    if (!tierEl) return;
    var isAr = document.documentElement.getAttribute('lang') === 'ar';
    if (isAr) {
      tierEl.textContent = TIER_AR[index] || '';
      return;
    }
    var key = 'calc.tier' + index;
    if (window.I18n) {
      var t = window.I18n.translate(key);
      tierEl.textContent = t === key ? '' : t;
    }
  }

  function render(amount) {
    var res = tierFor(amount);
    var tier = res.tier;
    var fee = amount * tier.rate;
    if (tier.minFee) fee = Math.max(fee, tier.minFee);
    var gateway = amount * GATEWAY_RATE + GATEWAY_FIXED;
    var net = fee - gateway;

    applyTierText(res.index);
    if (rateEl) rateEl.textContent = (tier.rate * 100) + '%';
    if (feeEl) feeEl.textContent = fmt(fee) + ' ' + currency();
    if (gatewayEl) gatewayEl.textContent = fmt(gateway) + ' ' + currency();
    if (netEl) netEl.textContent = fmt(net) + ' ' + currency();
    if (netEl) netEl.style.color = net < 0 ? 'var(--red-500)' : '';
  }

  function currency() {
    return document.documentElement.getAttribute('lang') === 'en' ? 'EGP' : '\u062c';
  }

  function showError(msg) {
    if (error) {
      error.textContent = msg;
      error.classList.add('is-visible');
    }
  }

  function clearError() {
    if (error) error.classList.remove('is-visible');
  }

  function onLangChange() {
    clearError();
    var value = input ? input.value.trim() : '';
    if (!value) return;
    var amount = parseFloat(value);
    if (isNaN(amount) || amount <= 0) return;
    render(amount);
  }

  function onSubmit(event) {
    event.preventDefault();
    var value = input ? input.value.trim() : '';
    if (!value) {
      showError(translate('calc.errEmpty'));
      return;
    }
    var amount = parseFloat(value);
    if (isNaN(amount) || amount <= 0) {
      showError(translate('calc.errInvalid'));
      return;
    }
    clearError();
    render(amount);
    if (results) results.classList.add('is-visible');
  }

  if (form) {
    form.addEventListener('submit', onSubmit);
  }
  if (input) {
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        form.dispatchEvent(new Event('submit'));
      }
    });
  }

  document.addEventListener('i18n:changed', function () {
    if (results && results.classList.contains('is-visible')) {
      var value = input ? input.value.trim() : '';
      if (value) render(parseFloat(value));
    }
  });

  window.Calculator = {
    init: function () {
      if (input && results && window.I18n) {
        var value = input.value.trim();
        if (value && !isNaN(parseFloat(value))) {
          render(parseFloat(value));
          results.classList.add('is-visible');
        }
      }
      onLangChange();
    }
  };
})();
