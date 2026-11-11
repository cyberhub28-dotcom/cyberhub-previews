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

  /* gallery: tap a photo to see it larger. Swipe or use the arrows when there are several. */
  var shots = Array.prototype.slice.call(document.querySelectorAll('.g-open'));
  if (shots.length){
    var lb = null, idx = 0, opener = null, lbImg, lbCap, lbPrev, lbNext;
    var ICON_X = '<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>';
    var ICON_L = '<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    var ICON_R = '<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    function btn(cls, label, icon){ var b = document.createElement('button'); b.type = 'button'; b.className = 'lb-btn ' + cls; b.setAttribute('aria-label', label); b.innerHTML = icon; return b; }
    function show(i){
      idx = (i + shots.length) % shots.length;
      var src = shots[idx].querySelector('img'), fig = shots[idx].closest('figure');
      var cat = fig && fig.querySelector('figcaption') ? fig.querySelector('figcaption').textContent : '';
      lbImg.src = src.currentSrc || src.src; lbImg.alt = src.alt;
      lbCap.textContent = cat;
      if (shots.length > 1){ var n = document.createElement('span'); n.textContent = (idx + 1) + ' of ' + shots.length; lbCap.appendChild(n); }
    }
    function closeLb(){
      if (!lb) return;
      lb.remove(); lb = null; doc.classList.remove('lb-open');
      document.removeEventListener('keydown', onLbKey);
      if (opener) opener.focus();
    }
    function onLbKey(e){
      if (e.key === 'Escape'){ e.preventDefault(); closeLb(); }
      else if (e.key === 'ArrowRight' && shots.length > 1) show(idx + 1);
      else if (e.key === 'ArrowLeft' && shots.length > 1) show(idx - 1);
      else if (e.key === 'Tab'){
        var f = lb.querySelectorAll('button'), first = f[0], lastB = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first){ e.preventDefault(); lastB.focus(); }
        else if (!e.shiftKey && document.activeElement === lastB){ e.preventDefault(); first.focus(); }
      }
    }
    function openLb(i){
      opener = shots[i];
      lb = document.createElement('div'); lb.className = 'lb';
      lb.setAttribute('role', 'dialog'); lb.setAttribute('aria-modal', 'true'); lb.setAttribute('aria-label', 'Photo');
      var top = document.createElement('div'); top.className = 'lb-top';
      lbCap = document.createElement('p'); lbCap.className = 'lb-cap'; lbCap.setAttribute('aria-live', 'polite');
      var x = btn('lb-close', 'Close photo', ICON_X);
      top.appendChild(lbCap); top.appendChild(x);
      var stage = document.createElement('div'); stage.className = 'lb-stage';
      lbImg = document.createElement('img'); lbImg.decoding = 'async';
      stage.appendChild(lbImg);
      if (shots.length > 1){
        lbPrev = btn('lb-prev', 'Previous photo', ICON_L); lbNext = btn('lb-next', 'Next photo', ICON_R);
        lbPrev.addEventListener('click', function(){ show(idx - 1); });
        lbNext.addEventListener('click', function(){ show(idx + 1); });
        stage.appendChild(lbPrev); stage.appendChild(lbNext);
      }
      lb.appendChild(top); lb.appendChild(stage);
      x.addEventListener('click', closeLb);
      /* tap the dark area around the photo to close */
      lb.addEventListener('click', function(e){ if (e.target === lb || e.target === stage || e.target === top) closeLb(); });
      /* swipe left or right for the next photo, down to close */
      var sx = null, sy = null;
      stage.addEventListener('touchstart', function(e){ if (e.touches.length === 1){ sx = e.touches[0].clientX; sy = e.touches[0].clientY; } }, {passive: true});
      stage.addEventListener('touchend', function(e){
        if (sx === null) return;
        var dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy; sx = sy = null;
        if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) && shots.length > 1) show(idx + (dx < 0 ? 1 : -1));
        else if (dy > 80 && Math.abs(dy) > Math.abs(dx)) closeLb();
      }, {passive: true});
      document.body.appendChild(lb);
      doc.classList.add('lb-open');
      show(i);
      document.addEventListener('keydown', onLbKey);
      x.focus();
    }
    shots.forEach(function(s, i){ s.addEventListener('click', function(){ openLb(i); }); });
  }

  /* gentle reveal as sections scroll into view */
  var rv = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window){
    var io = new IntersectionObserver(function(es){ es.forEach(function(en){ if (en.isIntersecting){ en.target.classList.add('in'); io.unobserve(en.target); } }); }, {rootMargin:'0px 0px -8% 0px', threshold:.08});
    Array.prototype.forEach.call(rv, function(el){ io.observe(el); });
  } else { Array.prototype.forEach.call(rv, function(el){ el.classList.add('in'); }); }
})();
