/**
 * mzo_executive_briefing.js — phone hub: puts the number of critical items from
 * /api/executive/briefing into the title of the header's Critical Analytics button.
 */
(function () {
  'use strict';

  function update() {
    var btn = document.getElementById('btnExecutiveBriefingHeader');
    if (!btn) return;
    fetch('/api/executive/briefing', { credentials: 'same-origin' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (json) {
        var counts = json && json.briefing && json.briefing.summaryCounts;
        if (counts) btn.title = 'Critical Analytics (' + (counts.critical || 0) + ' priority bottlenecks)';
      })
      .catch(function () {});
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', update);
  else update();
})();
