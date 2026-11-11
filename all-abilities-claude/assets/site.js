/* All Abilities Sports Club: menu, sign-up buttons, forms, countdown, gallery photos and gentle reveals. No tracking, no cookies. */
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

  /* sign-up buttons: stay inactive until the club's form links are added in Pages CMS */
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

  /* gallery: tap a sport to see all of its photos. Swipe, arrows or thumbnails move between them. */
  var cards = Array.prototype.slice.call(document.querySelectorAll('button.sp-card'));
  if (cards.length){
    var lb = null, set = [], idx = 0, opener = null, lbImg, lbCount, lbCapt, lbThumbs;
    var ICON_X = '<svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>';
    var ICON_L = '<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    var ICON_R = '<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    function mk(tag, cls){ var e = document.createElement(tag); if (cls) e.className = cls; return e; }
    function btn(cls, label, icon){ var b = mk('button', 'lb-btn ' + cls); b.type = 'button'; b.setAttribute('aria-label', label); b.innerHTML = icon; return b; }
    function paint(){
      var s = set[idx];
      lbImg.src = s.src;
      lbImg.alt = s.cap || (lb.getAttribute('data-sport') + ' photo ' + (idx + 1));
      lbCapt.textContent = s.cap; lbCapt.hidden = !s.cap;
      lbCount.textContent = set.length > 1 ? (idx + 1) + ' of ' + set.length : '1 photo';
      if (lbThumbs) Array.prototype.forEach.call(lbThumbs.children, function(t, i){
        t.setAttribute('aria-current', i === idx ? 'true' : 'false');
        if (i === idx && t.scrollIntoView) t.scrollIntoView({block: 'nearest', inline: 'center'});
      });
    }
    function show(i){
      if (!set.length) return;
      var next = (i + set.length) % set.length;
      if (next === idx && lbImg.getAttribute('src')) return;
      idx = next;
      if (reduce){ paint(); return; }
      lbImg.classList.add('fading');
      setTimeout(function(){ if (!lb) return; paint(); lbImg.classList.remove('fading'); }, 160);
    }
    function closeLb(){
      if (!lb) return;
      lb.remove(); lb = null; doc.classList.remove('lb-open');
      document.removeEventListener('keydown', onLbKey);
      if (opener) opener.focus();
    }
    function onLbKey(e){
      if (!lb) return;
      if (e.key === 'Escape'){ e.preventDefault(); closeLb(); }
      else if (e.key === 'ArrowRight' && set.length > 1) show(idx + 1);
      else if (e.key === 'ArrowLeft' && set.length > 1) show(idx - 1);
      else if (e.key === 'Tab'){
        var f = Array.prototype.filter.call(lb.querySelectorAll('button'), function(b){ return b.offsetParent !== null; });
        var first = f[0], lastB = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first){ e.preventDefault(); lastB.focus(); }
        else if (!e.shiftKey && document.activeElement === lastB){ e.preventDefault(); first.focus(); }
      }
    }
    function openLb(card){
      var holder = card.parentNode.querySelector('.sp-set');
      set = holder ? Array.prototype.map.call(holder.children, function(s){ return {src: s.getAttribute('data-src'), cap: s.getAttribute('data-cap') || ''}; }).filter(function(s){ return s.src; }) : [];
      if (!set.length) return;
      opener = card; idx = 0;
      var sport = card.getAttribute('data-sport') || '';
      lb = mk('div', 'lb'); lb.setAttribute('data-sport', sport);
      lb.setAttribute('role', 'dialog'); lb.setAttribute('aria-modal', 'true'); lb.setAttribute('aria-label', sport + ' photos');
      var top = mk('div', 'lb-top'), title = mk('p', 'lb-title');
      title.textContent = sport; lbCount = mk('span'); lbCount.setAttribute('aria-live', 'polite'); title.appendChild(lbCount);
      var x = btn('lb-close', 'Close photos', ICON_X);
      top.appendChild(title); top.appendChild(x);
      var stage = mk('div', 'lb-stage');
      lbImg = mk('img'); lbImg.decoding = 'async';
      lbCapt = mk('p', 'lb-caption'); lbCapt.hidden = true;
      stage.appendChild(lbImg); stage.appendChild(lbCapt);
      lb.appendChild(top); lb.appendChild(stage);
      lbThumbs = null;
      if (set.length > 1){
        var prev = btn('lb-prev', 'Previous photo', ICON_L), next = btn('lb-next', 'Next photo', ICON_R);
        prev.addEventListener('click', function(){ show(idx - 1); });
        next.addEventListener('click', function(){ show(idx + 1); });
        stage.appendChild(prev); stage.appendChild(next);
        lbThumbs = mk('div', 'lb-thumbs');
        set.forEach(function(s, i){
          var t = mk('button'); t.type = 'button'; t.setAttribute('aria-label', 'Photo ' + (i + 1) + ' of ' + set.length);
          var ti = mk('img'); ti.src = s.src; ti.alt = ''; ti.loading = 'lazy'; t.appendChild(ti);
          t.addEventListener('click', function(){ show(i); });
          lbThumbs.appendChild(t);
        });
        lb.appendChild(lbThumbs);
      }
      x.addEventListener('click', closeLb);
      /* tap the dark area around the photo to close */
      lb.addEventListener('click', function(e){ if (e.target === lb || e.target === stage || e.target === top) closeLb(); });
      /* swipe left or right for the next photo, down to close */
      var sx = null, sy = null;
      stage.addEventListener('touchstart', function(e){ if (e.touches.length === 1){ sx = e.touches[0].clientX; sy = e.touches[0].clientY; } }, {passive: true});
      stage.addEventListener('touchend', function(e){
        if (sx === null) return;
        var dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy; sx = sy = null;
        if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) && set.length > 1) show(idx + (dx < 0 ? 1 : -1));
        else if (dy > 80 && Math.abs(dy) > Math.abs(dx)) closeLb();
      }, {passive: true});
      document.body.appendChild(lb);
      doc.classList.add('lb-open');
      lbImg.removeAttribute('src');
      paint();
      document.addEventListener('keydown', onLbKey);
      x.focus();
    }
    cards.forEach(function(c){ c.addEventListener('click', function(){ openLb(c); }); });
  }

  /* Some phones show a strip beside the page that Safari fills with the page's base colour.
     Keep that colour matched to the part of the page in the middle of the screen. */
  var themeMeta = document.querySelector('meta[name="theme-color"]');
  var NAVY = '#0A2342', edgeNow = '', edgeTick = false;
  function edgeColor(){
    if (doc.classList.contains('lb-open')) return null;
    if (window.innerHeight + window.pageYOffset >= doc.scrollHeight - 4) return NAVY;
    var hit = document.elementFromPoint(Math.round(window.innerWidth / 2), Math.round(window.innerHeight / 2));
    var sec = hit && hit.closest ? hit.closest('section, footer, .head') : null;
    if (!sec || sec.classList.contains('on-navy')) return NAVY;
    var m = (getComputedStyle(sec).backgroundColor || '').match(/[\d.]+/g);
    if (m && m.length >= 3 && (m.length < 4 || +m[3] > .5)) return 'rgb(' + m[0] + ', ' + m[1] + ', ' + m[2] + ')';
    return getComputedStyle(document.body).backgroundColor;
  }
  function paintEdge(){
    edgeTick = false;
    var c = edgeColor();
    if (!c || c === edgeNow) return;
    edgeNow = c; doc.style.backgroundColor = c;
    if (themeMeta) themeMeta.setAttribute('content', c);
  }
  function queueEdge(){ if (!edgeTick){ edgeTick = true; window.requestAnimationFrame(paintEdge); } }
  window.addEventListener('scroll', queueEdge, {passive: true});
  window.addEventListener('resize', queueEdge);
  window.addEventListener('load', queueEdge);
  queueEdge();

  /* gentle reveal as sections scroll into view */
  var rv = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window){
    var io = new IntersectionObserver(function(es){ es.forEach(function(en){ if (en.isIntersecting){ en.target.classList.add('in'); io.unobserve(en.target); } }); }, {rootMargin:'0px 0px -8% 0px', threshold:.08});
    Array.prototype.forEach.call(rv, function(el){ io.observe(el); });
  } else { Array.prototype.forEach.call(rv, function(el){ el.classList.add('in'); }); }
})();
