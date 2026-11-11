/* All Abilities Sports Club: menu, tabs, forms, countdown and gentle reveals. No tracking, no cookies. */
(function(){
  var doc = document.documentElement;
  doc.classList.add('js');

  /* menu */
  var nav = document.getElementById('site-nav');
  var menuBtn = document.querySelector('.menu-btn');
  function closeMenu(){ if (!nav) return; nav.classList.remove('open'); if (menuBtn) menuBtn.setAttribute('aria-expanded','false'); }
  if (nav && menuBtn){
    menuBtn.addEventListener('click', function(){
      var open = nav.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    document.addEventListener('keydown', function(e){ if (e.key === 'Escape' && nav.classList.contains('open')){ closeMenu(); menuBtn.focus(); } });
    nav.addEventListener('click', function(e){ if (e.target.closest('a')) closeMenu(); });
  }

  /* get involved tabs: register an athlete or volunteer */
  var tabA = document.getElementById('tab-athlete'), tabV = document.getElementById('tab-volunteer');
  var fA = document.getElementById('form-athlete'), fV = document.getElementById('form-volunteer');
  function selectTab(which, focus){
    if (!tabA || !tabV) return;
    var isA = which === 'athlete';
    tabA.setAttribute('aria-selected', isA ? 'true' : 'false'); tabV.setAttribute('aria-selected', isA ? 'false' : 'true');
    tabA.tabIndex = isA ? 0 : -1; tabV.tabIndex = isA ? -1 : 0;
    fA.hidden = !isA; fV.hidden = isA;
    if (focus) (isA ? tabA : tabV).focus();
  }
  if (tabA && tabV){
    tabA.addEventListener('click', function(){ selectTab('athlete', false); });
    tabV.addEventListener('click', function(){ selectTab('volunteer', false); });
    [tabA, tabV].forEach(function(t){ t.addEventListener('keydown', function(e){
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft'){ e.preventDefault(); selectTab(t === tabA ? 'volunteer' : 'athlete', true); }
    }); });
    function fromHash(){ if (location.hash === '#volunteer') selectTab('volunteer', false); }
    fromHash(); window.addEventListener('hashchange', fromHash);
  }

  /* registration link: stays inactive until the club's Google Form link is added */
  Array.prototype.forEach.call(document.querySelectorAll('[data-form-link]'), function(a){
    a.addEventListener('click', function(e){
      if (a.getAttribute('href') === '#'){
        e.preventDefault();
        var n = a.closest('.handoff') && a.closest('.handoff').querySelector('.ph-note');
        if (n){ n.style.outline = '3px solid #C98A3E'; setTimeout(function(){ n.style.outline = ''; }, 1200); }
      }
    });
  });

  /* forms: check, then open the visitor's email app with the message filled in */
  Array.prototype.forEach.call(document.querySelectorAll('form[data-mailto]'), function(f){
    var err = f.querySelector('.err'), done = f.querySelector('.form-done');
    f.addEventListener('submit', function(e){
      e.preventDefault();
      var missing = [];
      Array.prototype.forEach.call(f.querySelectorAll('[required]'), function(el){
        var ok = el.type === 'checkbox' ? el.checked : (el.value.trim() !== '' && (el.type !== 'email' || /.+@.+\..+/.test(el.value.trim())));
        el.setAttribute('aria-invalid', ok ? 'false' : 'true');
        if (!ok) missing.push(el);
      });
      if (missing.length){
        err.textContent = missing.length === 1 ? 'One thing is missing. Please check the highlighted field.' : missing.length + ' things are missing. Please check the highlighted fields.';
        err.hidden = false; done.hidden = true; missing[0].focus(); return;
      }
      err.hidden = true;
      var lines = [];
      Array.prototype.forEach.call(f.querySelectorAll('input, select, textarea'), function(el){
        var lab = f.querySelector('label[for="'+el.id+'"]');
        var name = lab ? lab.textContent.replace(/\*|\(optional\)/g,'').trim() : (el.value || el.name);
        if (el.type === 'checkbox'){
          if (el.checked) lines.push((el.closest('fieldset') ? '' : '') + name + ': yes');
        } else if (el.value.trim()){
          lines.push(name + ': ' + el.value.trim());
        }
      });
      var url = 'mailto:' + f.getAttribute('data-mailto') + '?subject=' + encodeURIComponent(f.getAttribute('data-subject') || 'Website message') + '&body=' + encodeURIComponent(lines.join('\n'));
      done.hidden = false;
      window.location.href = url;
    });
  });

  /* copy the club email */
  var copyBtn = document.getElementById('copy-email');
  if (copyBtn){
    copyBtn.addEventListener('click', function(){
      var el = document.getElementById('club-email');
      function fallback(){ var r = document.createRange(); r.selectNodeContents(el); var s = getSelection(); s.removeAllRanges(); s.addRange(r); copyBtn.textContent = 'Selected'; }
      try { navigator.clipboard.writeText(el.textContent).then(function(){ copyBtn.textContent = 'Copied'; }, fallback); } catch(e){ fallback(); }
      setTimeout(function(){ copyBtn.textContent = 'Copy'; }, 2200);
    });
  }

  /* registration countdown, in the visitor's local time. Dates come from the page (set in Pages CMS). */
  var rc = document.getElementById('reg-count'), num = document.getElementById('rc-num'), txt = document.getElementById('rc-text');
  function ymd(v){ var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(v || ''); return m ? new Date(+m[1], +m[2] - 1, +m[3]) : null; }
  var open = rc && ymd(rc.getAttribute('data-open')), last = rc && ymd(rc.getAttribute('data-close'));
  if (num && txt && open && last){
    var MNAME = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    var now = new Date();
    var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    var close = new Date(last.getFullYear(), last.getMonth(), last.getDate() + 1);
    var spots = rc.getAttribute('data-spots');
    var openTxt = MNAME[open.getMonth()] + ' ' + open.getDate(), lastTxt = MNAME[last.getMonth()] + ' ' + last.getDate();
    var days = Math.round((open - today) / 86400000);
    if (today < open){
      num.textContent = days;
      num.insertAdjacentHTML('beforeend', days === 1 ? '<small>day</small>' : '<small>days</small>');
      txt.textContent = days === 1 ? 'until registration opens tomorrow, ' + openTxt : 'until registration opens ' + openTxt;
      num.hidden = false;
    } else if (now < close){
      num.innerHTML = '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>';
      num.hidden = false;
      txt.textContent = 'Registration is open now, until ' + lastTxt + (spots ? ' or all ' + spots + ' spots are filled' : '');
    } else {
      txt.textContent = 'Winter registration has closed. Contact us about the next season.';
    }
  }

  /* upcoming events: read from content/events.json (edited in Pages CMS). Past events hide themselves. */
  var evList = document.querySelector('[data-events]');
  if (evList && window.fetch){
    var MON = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    var MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    var DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    function el(tag, cls, text){ var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
    function parseDay(v){ var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(v || '')); return m ? new Date(+m[1], +m[2] - 1, +m[3]) : null; }
    function showEmpty(){ evList.textContent = ''; evList.appendChild(el('p', 'ev-empty muted', 'No events on the calendar right now. New ones are posted on our Facebook page first.')); }
    fetch(evList.getAttribute('data-events'), {cache: 'no-cache'}).then(function(r){ if (!r.ok) throw 0; return r.json(); }).then(function(list){
      var today = new Date(); today.setHours(0,0,0,0);
      var items = (Array.isArray(list) ? list : []).map(function(e){ return {e: e, d: parseDay(e && e.date)}; })
        .filter(function(x){ return x.e && x.e.title && x.d && x.d >= today; })
        .sort(function(a, b){ return a.d - b.d; });
      if (!items.length) return showEmpty();
      evList.textContent = '';
      items.forEach(function(x){
        var e = x.e, d = x.d;
        var card = el('article', 'ev');
        var badge = el('div', 'ev-date'); badge.setAttribute('aria-hidden', 'true');
        badge.appendChild(el('span', null, MON[d.getMonth()])); badge.appendChild(el('b', null, String(d.getDate())));
        var body = el('div', 'ev-body');
        body.appendChild(el('h3', null, e.title));
        body.appendChild(el('p', 'ev-when', DAYS[d.getDay()] + ', ' + MONTHS[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear() + (e.time ? ' · ' + e.time : '')));
        if (e.place) body.appendChild(el('p', null, e.place));
        var det = (Array.isArray(e.details) ? e.details : []).filter(Boolean);
        if (det.length){ var ul = el('ul'); det.forEach(function(t){ ul.appendChild(el('li', null, t)); }); body.appendChild(ul); }
        if (e.note) body.appendChild(el('p', 'muted', e.note));
        if (/^https:\/\/[^\s"<>]+$/.test(e.link || '')){
          var btns = el('div', 'btns'), a = el('a', 'btn btn-navy', e.button || 'Details');
          a.href = e.link; a.target = '_blank'; a.rel = 'noopener';
          var arr = el('span', 'arr', ' ↗'); arr.setAttribute('aria-hidden', 'true'); a.appendChild(arr);
          btns.appendChild(a); body.appendChild(btns);
        }
        card.appendChild(badge); card.appendChild(body); evList.appendChild(card);
      });
    }).catch(showEmpty);
  }

  /* gentle reveal as sections scroll into view */
  var rv = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window){
    var io = new IntersectionObserver(function(es){ es.forEach(function(en){ if (en.isIntersecting){ en.target.classList.add('in'); io.unobserve(en.target); } }); }, {rootMargin:'0px 0px -8% 0px', threshold:.08});
    Array.prototype.forEach.call(rv, function(el){ io.observe(el); });
  } else { Array.prototype.forEach.call(rv, function(el){ el.classList.add('in'); }); }
})();
