(function () {
  'use strict';

  var btn = document.getElementById('pdfBtn');

  function exportPDF() {
    var title = document.documentElement.getAttribute('lang') === 'en'
      ? 'Feasibility Study - Escrow Platform'
      : '\u062f\u0631\u0627\u0633\u0629 \u062c\u062f\u0648\u0649 - \u0645\u0646\u0635\u0629 \u0627\u0644\u0636\u0645\u0627\u0646';
    document.title = title;
    window.print();
  }

  if (btn) {
    btn.addEventListener('click', exportPDF);
  }

  window.PDF = {
    exportPDF: exportPDF
  };
})();
