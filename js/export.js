(function () {
  'use strict';

  function textOf(el) {
    if (!el) return '';
    return (el.textContent || '').replace(/\s+/g, ' ').trim();
  }

  function esc(value) {
    return (value || '').replace(/\|/g, '\\|').replace(/\n/g, ' ');
  }

  function sectionToMarkdown(section) {
    var lines = [];
    var title = textOf(section.querySelector('.section__head h2'));
    var num = section.querySelector('.section__head .section__num');
    var heading = '# ' + (num ? textOf(num) + ' — ' : '') + title;
    lines.push(heading, '');

    var blocks = Array.prototype.slice.call(section.querySelectorAll(':scope > *:not(.section__head)'));
    blocks.forEach(function (block) {
      var tag = block.tagName.toLowerCase();

      if (block.classList.contains('fee-calc')) {
        lines.push(textOf(block.querySelector('.fee-calc__title')));
        lines.push('');
        lines.push('> ' + textOf(block.querySelector('.fee-calc__desc')));
        lines.push('');
        return;
      }

      if (tag === 'p') {
        lines.push(textOf(block), '');
        return;
      }

      if (tag === 'h3') {
        lines.push('## ' + textOf(block), '');
        return;
      }
      if (tag === 'h4') {
        lines.push('### ' + textOf(block), '');
        return;
      }

      if (block.classList.contains('callout')) {
        var icon = '';
        var t = textOf(block.querySelector('h4'));
        if (t) lines.push('> **' + t + '**');
        var p = block.querySelectorAll('p');
        for (var i = 0; i < p.length; i++) lines.push('> ' + textOf(p[i]));
        if (t || p.length) lines.push('');
        return;
      }

      if (block.classList.contains('table-wrap') || tag === 'table') {
        var table = block.tagName.toLowerCase() === 'table' ? block : block.querySelector('table');
        if (!table) return;
        var rows = Array.prototype.slice.call(table.querySelectorAll('tr'));
        rows.forEach(function (row, idx) {
          var cells = Array.prototype.slice.call(row.querySelectorAll('th,td')).map(function (c) {
            return esc(textOf(c));
          });
          lines.push('| ' + cells.join(' | ') + ' |');
          if (idx === 0) {
            lines.push('| ' + cells.map(function () { return '---'; }).join(' | ') + ' |');
          }
        });
        lines.push('');
        return;
      }

      if (tag === 'ul' || tag === 'ol') {
        var items = Array.prototype.slice.call(block.querySelectorAll(':scope > li'));
        items.forEach(function (li) {
          var marker = tag === 'ul' ? '- ' : '1. ';
          lines.push(marker + textOf(li));
        });
        lines.push('');
        return;
      }

      if (block.classList.contains('stats-grid')) {
        var stats = Array.prototype.slice.call(block.querySelectorAll('.stat'));
        stats.forEach(function (stat) {
          var v = textOf(stat.querySelector('.stat__value'));
          var l = textOf(stat.querySelector('.stat__label'));
          lines.push('- **' + v + '** — ' + l);
        });
        lines.push('');
        return;
      }

      if (block.classList.contains('flow')) {
        var steps = Array.prototype.slice.call(block.querySelectorAll('.step'));
        steps.forEach(function (step, i) {
          lines.push('**' + (i + 1) + '. ' + textOf(step.querySelector('.step__body b')) + '**');
          var rest = step.querySelector('.step__body');
          if (rest) {
            var b = rest.querySelector('b');
            var span = rest.querySelector('span');
            if (span) lines.push(textOf(span));
            else if (b) lines.push(textOf(b).replace(textOf(b).split(':')[0] + ':', ''));
          }
          lines.push('');
        });
        return;
      }

      if (block.classList.contains('cards-grid')) {
        var cards = Array.prototype.slice.call(block.querySelectorAll('.card'));
        cards.forEach(function (card) {
          lines.push('**' + textOf(card.querySelector('h4')) + '** — ' + textOf(card.querySelector('p')));
        });
        lines.push('');
        return;
      }
    });

    return lines.join('\n').trim() + '\n\n';
  }

  function buildMarkdown() {
    var sections = document.querySelectorAll('.content .section');
    var parts = [];
    parts.push('# ' + textOf(document.querySelector('.hero h1')));
    parts.push('');
    parts.push('> ' + textOf(document.querySelector('.hero__desc')));
    parts.push('');
    Array.prototype.forEach.call(sections, function (section) {
      parts.push(sectionToMarkdown(section));
    });
    return parts.join('\n').trim();
  }

  function download(filename, content, mime) {
    var blob = new Blob([content], { type: mime || 'text/markdown;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }

  function filename() {
    var lang = document.documentElement.getAttribute('lang');
    return 'feasibility-study-escrow-egypt-' + (lang || 'ar') + '.md';
  }

  function run() {
    var md = buildMarkdown();
    if (!md) return;
    download(filename(), md);
  }

  var mdBtn = document.getElementById('mdBtn');
  if (mdBtn) {
    mdBtn.addEventListener('click', run);
  }

  window.ExportMD = {
    run: run,
    buildMarkdown: buildMarkdown
  };
})();
