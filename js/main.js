(function () {
  'use strict';

  document.documentElement.classList.add('js');

  function init() {
    window.I18n.init();
    window.UI.init();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
