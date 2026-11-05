/* Fills sponsor, event, and news slots from content/*.json when a list exists.
   Static HTML stays in place if the file is missing or empty. */
(function () {
  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"]/g, function (ch) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch];
    });
  }

  function safeUrl(value) {
    var url = String(value || '').trim();
    if (/^https:\/\//i.test(url) || /^http:\/\//i.test(url)) return url;
    return '';
  }

  function safeSrc(value) {
    var url = String(value || '').trim();
    if (/^https:\/\//i.test(url)) return url;
    if (/^assets\/[\w./-]+$/.test(url)) return url;
    return '';
  }

  function formatDate(value) {
    var date = new Date(value + 'T12:00:00');
    if (isNaN(date)) return esc(value);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  }

  function load(name) {
    return fetch('content/' + name + '.json', { cache: 'no-store' }).then(function (response) {
      if (!response.ok) throw new Error(name);
      return response.json();
    });
  }

  var sponsors = document.querySelector('[data-sponsors]');
  if (sponsors) {
    load('sponsors').then(function (data) {
      if (!data.sponsors || !data.sponsors.length) return;
      sponsors.innerHTML = data.sponsors.map(function (item) {
        var href = safeUrl(item.link);
        var logo = safeSrc(item.logo);
        var inner = (logo
          ? '<img src="' + esc(logo) + '" alt="' + esc(item.name) + '">'
          : '<strong>' + esc(item.name) + '</strong>') +
          (item.level ? '<small>' + esc(item.level) + '</small>' : '');
        if (href) return '<a class="slot" href="' + esc(href) + '" rel="noopener noreferrer">' + inner + '</a>';
        return '<div class="slot">' + inner + '</div>';
      }).join('');
    }).catch(function () {});
  }

  var events = document.querySelector('[data-events]');
  if (events) {
    load('events').then(function (data) {
      if (!data.events || !data.events.length) return;
      events.innerHTML = data.events.map(function (item) {
        return '<article class="card"><p class="ev-date"><time datetime="' + esc(item.date) + '">' + formatDate(item.date) + '</time></p><h3>' + esc(item.title) + '</h3><p><strong>' + esc(item.place) + '</strong></p><p>' + esc(item.details) + '</p></article>';
      }).join('');
    }).catch(function () {});
  }

  var news = document.querySelector('[data-news]');
  if (news) {
    load('news').then(function (data) {
      if (!data.news || !data.news.length) return;
      news.innerHTML = data.news.map(function (item) {
        return '<article class="card"><p class="ev-date"><time datetime="' + esc(item.date) + '">' + formatDate(item.date) + '</time></p><h3>' + esc(item.title) + '</h3><p>' + esc(item.body) + '</p></article>';
      }).join('');
    }).catch(function () {});
  }
})();
