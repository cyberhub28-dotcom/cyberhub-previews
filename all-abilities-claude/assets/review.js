/* PREVIEW ONLY. Lets Amber approve each page or ask for changes, then email all notes in one go.
   Notes stay in this browser until sent. Remove this file and its <script> tag at launch. */
(function(){
  var SEND_TO = 'support@cyberhubsoftware.com';
  var KEY = 'aasc-review-v1';
  var PAGES = [['home','Home','index.html'],['programs','Programs','programs.html'],['about','Our Story','about.html'],['signup','Get Involved','get-involved.html'],['gallery','Gallery','gallery.html'],['donate','Donate','donate.html'],['contact','Contact','contact.html'],['privacy','Privacy','privacy.html']];
  var LABELS = {ok:'Looks good', small:'Small changes', work:'Needs work'};
  var page = document.body.getAttribute('data-page');
  var meta = PAGES.filter(function(p){ return p[0] === page; })[0];
  if (!meta) return;

  var mem = {};
  function load(){ try { return JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch(e){ return mem; } }
  function save(d){ mem = d; try { localStorage.setItem(KEY, JSON.stringify(d)); } catch(e){} }
  function count(d){ return PAGES.filter(function(p){ return d[p[0]] && d[p[0]].s; }).length; }

  var fab = document.createElement('button');
  fab.type = 'button'; fab.className = 'rv-fab'; fab.setAttribute('aria-haspopup','dialog');
  document.body.appendChild(fab);
  function paintFab(){ var n = count(load()); fab.innerHTML = 'Review <b>' + n + '/' + PAGES.length + '</b>'; fab.setAttribute('aria-label','Review this page. ' + n + ' of ' + PAGES.length + ' pages reviewed'); }
  paintFab();

  var scrim, sheet, last;
  function close(){ if (!sheet) return; sheet.remove(); scrim.remove(); sheet = null; document.removeEventListener('keydown', onKey); paintFab(); if (last) last.focus(); }
  function onKey(e){
    if (e.key === 'Escape'){ close(); return; }
    if (e.key === 'Tab' && sheet){
      var f = sheet.querySelectorAll('button, a[href], input, textarea'); var a = f[0], b = f[f.length - 1];
      if (e.shiftKey && document.activeElement === a){ e.preventDefault(); b.focus(); }
      else if (!e.shiftKey && document.activeElement === b){ e.preventDefault(); a.focus(); }
    }
  }
  function esc(s){ return String(s).replace(/[&<>"]/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }

  function open(){
    last = document.activeElement;
    var d = load(), mine = d[page] || {};
    scrim = document.createElement('div'); scrim.className = 'rv-scrim'; scrim.addEventListener('click', close);
    sheet = document.createElement('div'); sheet.className = 'rv-sheet';
    sheet.setAttribute('role','dialog'); sheet.setAttribute('aria-modal','true'); sheet.setAttribute('aria-labelledby','rv-h');
    var list = PAGES.map(function(p){ var r = d[p[0]]; return '<li><a href="' + p[2] + '">' + p[1] + '</a><span>' + (r && r.s ? LABELS[r.s] : 'Not yet') + '</span></li>'; }).join('');
    sheet.innerHTML =
      '<button type="button" class="rv-close" aria-label="Close">Close</button>' +
      '<h2 id="rv-h">Review: ' + esc(meta[1]) + ' page</h2>' +
      '<p class="rv-sub">Pick one, add any changes or fixes, then save. When you\'ve looked at every page, tap Send all notes.</p>' +
      '<fieldset class="rv-choices"><legend>How does this page look?</legend>' +
        ['ok','small','work'].map(function(k){ return '<label><input type="radio" name="rv-s" value="' + k + '"' + (mine.s === k ? ' checked' : '') + '><span>' + LABELS[k] + '</span></label>'; }).join('') +
      '</fieldset>' +
      '<label for="rv-n" style="font-weight:700">Changes, fixes or ideas <span class="rv-sub">(optional)</span></label>' +
      '<textarea id="rv-n" placeholder="For example: use this photo, change this wording, add our Facebook link.">' + esc(mine.n || '') + '</textarea>' +
      '<p class="rv-status" role="status" aria-live="polite"></p>' +
      '<div class="rv-row"><button type="button" class="btn btn-navy" data-act="save">Save note</button><button type="button" class="btn btn-line-dark" data-act="send">Send all notes</button></div>' +
      '<p class="rv-sub">Pages reviewed: ' + count(d) + ' of ' + PAGES.length + '</p><ul class="rv-list">' + list + '</ul>' +
      '<p class="rv-sub">Notes stay on this phone or computer until you send them. Sending opens your email app with every note filled in.</p>';
    document.body.appendChild(scrim); document.body.appendChild(sheet);
    sheet.querySelector('.rv-close').addEventListener('click', close);
    var status = sheet.querySelector('.rv-status');
    function current(){ var c = sheet.querySelector('input[name="rv-s"]:checked'); return {s: c ? c.value : '', n: sheet.querySelector('#rv-n').value.trim()}; }
    sheet.querySelector('[data-act="save"]').addEventListener('click', function(){
      var cur = current();
      if (!cur.s && !cur.n){ status.textContent = 'Pick an option or type a note first.'; return; }
      var d2 = load(); d2[page] = cur; save(d2); paintFab();
      status.textContent = 'Saved. ' + count(d2) + ' of ' + PAGES.length + ' pages reviewed.';
    });
    sheet.querySelector('[data-act="send"]').addEventListener('click', function(){
      var cur = current(), d2 = load();
      if (cur.s || cur.n){ d2[page] = cur; save(d2); }
      var body = ['Website review notes for All Abilities Sports Club', ''];
      PAGES.forEach(function(p){ var r = d2[p[0]]; body.push(p[1] + ': ' + (r && r.s ? LABELS[r.s] : 'Not reviewed yet')); if (r && r.n) body.push('  ' + r.n.replace(/\n/g, '\n  ')); body.push(''); });
      window.location.href = 'mailto:' + SEND_TO + '?subject=' + encodeURIComponent('All Abilities website review notes') + '&body=' + encodeURIComponent(body.join('\n'));
      status.textContent = 'Your email app should open with all your notes. Press Send there.';
    });
    var first = sheet.querySelector('input[name="rv-s"]:checked') || sheet.querySelector('input[name="rv-s"]');
    first.focus();
    document.addEventListener('keydown', onKey);
  }
  fab.addEventListener('click', open);
})();
