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

  /* gallery: tap a sport with photos to open them full screen.
     Swipe sideways for the next or previous photo (it stops at the ends), swipe down to close,
     pinch or double-tap to zoom, one tap hides or shows the bars, and the phone's back gesture closes it.
     No download or share buttons: these are photos of children. */
  var reduceMQ = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  function reduced(){ return !!(reduceMQ && reduceMQ.matches); }
  var EASE = 'cubic-bezier(.2,.8,.2,1)';
  var spCards = Array.prototype.slice.call(document.querySelectorAll('button.sp-card'));
  if (spCards.length){
    var lb = null, bg, track, topBar, botBar, countEl, captEl, thumbs, prevB, nextB, closeB;
    var set = [], slides = [], idx = 0, opener = null, savedY = 0, pushed = false, closing = false;
    var z = {s: 1, x: 0, y: 0};
    var pts = {}, g = null, lastTap = null, tapTimer = null;
    var ICON_X = '<svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>';
    var ICON_L = '<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    var ICON_R = '<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    function mk(tag, cls){ var e = document.createElement(tag); if (cls) e.className = cls; return e; }
    function btn(cls, label, icon){ var b = mk('button', 'lb-btn ' + cls); b.type = 'button'; b.setAttribute('aria-label', label); b.innerHTML = icon; return b; }
    function W(){ return lb ? lb.clientWidth : window.innerWidth; }
    function H(){ return lb ? lb.clientHeight : window.innerHeight; }
    function curImg(){ return slides[idx] && slides[idx].img; }
    function load(i){ var s = slides[i]; if (s && !s.img.getAttribute('src')) s.img.src = set[i].src; }

    function setTrack(off, animate){
      track.style.transition = animate && !reduced() ? 'transform .3s ' + EASE : 'none';
      track.style.transform = 'translate3d(' + (-idx * W() + off) + 'px,0,0)';
    }
    function applyZoom(animate){
      var im = curImg(); if (!im) return;
      im.style.transition = animate && !reduced() ? 'transform .3s ' + EASE : 'none';
      im.style.transform = z.s === 1 && !z.x && !z.y ? '' : 'translate3d(' + z.x + 'px,' + z.y + 'px,0) scale(' + z.s + ')';
    }
    function clampZoom(){
      var im = curImg(); if (!im) return;
      var sl = slides[idx].el, cs = getComputedStyle(sl);
      var cw = sl.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      var ch = sl.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
      var mx = Math.max(0, (im.offsetWidth * z.s - cw) / 2), my = Math.max(0, (im.offsetHeight * z.s - ch) / 2);
      z.x = Math.max(-mx, Math.min(mx, z.x)); z.y = Math.max(-my, Math.min(my, z.y));
    }
    function resetZoom(animate){ z = {s: 1, x: 0, y: 0}; applyZoom(animate); }
    function stageCenter(){
      var sl = slides[idx].el, cs = getComputedStyle(sl), r = sl.getBoundingClientRect();
      return {x: r.left + parseFloat(cs.paddingLeft) + (sl.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight)) / 2,
              y: r.top + parseFloat(cs.paddingTop) + (sl.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom)) / 2};
    }
    function layoutBars(){
      if (!lb) return;
      lb.style.setProperty('--lb-t', topBar.offsetHeight + 'px');
      lb.style.setProperty('--lb-b', (botBar.hidden ? 16 : botBar.offsetHeight + 8) + 'px');
    }
    function paint(){
      var n = set.length, s = set[idx];
      countEl.textContent = (idx + 1) + ' of ' + n;
      captEl.textContent = s.cap; captEl.hidden = !s.cap;
      botBar.hidden = !s.cap && !thumbs;
      slides.forEach(function(sl, i){ sl.el.setAttribute('aria-hidden', i === idx ? 'false' : 'true'); });
      load(idx); load(idx + 1); load(idx - 1);
      if (thumbs) Array.prototype.forEach.call(thumbs.children, function(t, i){
        t.setAttribute('aria-current', i === idx ? 'true' : 'false');
        if (i === idx){ var l = t.offsetLeft - (thumbs.clientWidth - t.offsetWidth) / 2; thumbs.scrollTo ? thumbs.scrollTo({left: l, behavior: reduced() ? 'auto' : 'smooth'}) : (thumbs.scrollLeft = l); }
      });
      if (prevB){ prevB.disabled = idx === 0; nextB.disabled = idx === n - 1; }
      layoutBars();
    }
    function go(i, animate){
      i = Math.max(0, Math.min(set.length - 1, i));
      if (i !== idx){ resetZoom(false); idx = i; paint(); }
      setTrack(0, animate !== false);
    }
    function toggleBars(){ lb.classList.toggle('bars-off'); }

    function lock(){
      savedY = window.pageYOffset;
      var b = document.body.style;
      b.position = 'fixed'; b.top = -savedY + 'px'; b.left = '0'; b.right = '0'; b.width = '100%';
      doc.classList.add('lb-open'); doc.style.backgroundColor = '#06101F';
      if (themeMeta) themeMeta.setAttribute('content', '#06101F');
    }
    function unlock(){
      var b = document.body.style;
      b.position = b.top = b.left = b.right = b.width = '';
      doc.classList.remove('lb-open');
      doc.style.scrollBehavior = 'auto'; window.scrollTo(0, savedY); doc.style.scrollBehavior = '';
      edgeNow = ''; queueEdge();
    }
    function cardRect(){
      if (!opener) return null;
      var art = opener.querySelector('.sp-art') || opener, r = art.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight || !r.width) return null;
      return r;
    }
    function flipFrom(im, r){
      var ir = im.getBoundingClientRect(); if (!ir.width) return;
      var k = Math.min(r.width / ir.width, r.height / ir.height);
      var dx = r.left + r.width / 2 - (ir.left + ir.width / 2), dy = r.top + r.height / 2 - (ir.top + ir.height / 2);
      im.style.transition = 'none'; im.style.opacity = '0.3';
      im.style.transform = 'translate3d(' + dx + 'px,' + dy + 'px,0) scale(' + k + ')';
      im.getBoundingClientRect();
      im.style.transition = 'transform .3s ' + EASE + ', opacity .3s ' + EASE;
      im.style.transform = ''; im.style.opacity = '';
    }

    function openLb(card){
      var holder = card.parentNode.querySelector('.sp-set');
      var sport = card.getAttribute('data-sport') || 'Club';
      set = holder ? Array.prototype.map.call(holder.children, function(s, i){
        return {src: s.getAttribute('data-src'), cap: s.getAttribute('data-cap') || '', alt: s.getAttribute('data-alt') || s.getAttribute('data-cap') || (sport + ' photo ' + (i + 1))};
      }).filter(function(s){ return s.src; }) : [];
      if (!set.length || lb) return;
      opener = card; idx = 0; z = {s: 1, x: 0, y: 0}; closing = false; pts = {}; g = null;
      lb = mk('div', 'lb'); lb.setAttribute('role', 'dialog'); lb.setAttribute('aria-modal', 'true'); lb.setAttribute('aria-label', sport + ' photos');
      bg = mk('div', 'lb-bg'); track = mk('div', 'lb-track');
      slides = set.map(function(s, i){
        var f = mk('figure', 'lb-slide'), im = mk('img');
        im.alt = s.alt; im.decoding = 'async'; im.draggable = false;
        f.appendChild(im); track.appendChild(f);
        return {el: f, img: im};
      });
      topBar = mk('div', 'lb-bar lb-top');
      var titles = mk('div', 'lb-titles'), title = mk('p', 'lb-title');
      title.textContent = sport; countEl = mk('p', 'lb-count'); countEl.setAttribute('aria-live', 'polite');
      titles.appendChild(title); titles.appendChild(countEl);
      closeB = btn('lb-close', 'Close photos', ICON_X);
      topBar.appendChild(titles); topBar.appendChild(closeB);
      botBar = mk('div', 'lb-bar lb-bottom'); captEl = mk('p', 'lb-caption'); botBar.appendChild(captEl);
      thumbs = null; prevB = nextB = null;
      if (set.length > 1){
        thumbs = mk('div', 'lb-thumbs');
        set.forEach(function(s, i){
          var t = mk('button'); t.type = 'button'; t.setAttribute('aria-label', 'Photo ' + (i + 1) + ' of ' + set.length);
          var ti = mk('img'); ti.src = s.src; ti.alt = ''; ti.loading = 'lazy'; ti.draggable = false; t.appendChild(ti);
          t.addEventListener('click', function(){ go(i); });
          thumbs.appendChild(t);
        });
        botBar.appendChild(thumbs);
        prevB = btn('lb-nav lb-prev', 'Previous photo', ICON_L); nextB = btn('lb-nav lb-next', 'Next photo', ICON_R);
        prevB.addEventListener('click', function(){ go(idx - 1); });
        nextB.addEventListener('click', function(){ go(idx + 1); });
      }
      lb.appendChild(bg); lb.appendChild(track); lb.appendChild(topBar); lb.appendChild(botBar);
      if (prevB){ lb.appendChild(prevB); lb.appendChild(nextB); }
      closeB.addEventListener('click', requestClose);
      lb.addEventListener('pointerdown', onDown);
      lb.addEventListener('pointermove', onMove);
      lb.addEventListener('pointerup', onUp);
      lb.addEventListener('pointercancel', onUp);
      lb.addEventListener('contextmenu', function(e){ e.preventDefault(); });
      lb.addEventListener('dragstart', function(e){ e.preventDefault(); });
      lock();
      document.body.appendChild(lb);
      paint(); setTrack(0, false);
      document.addEventListener('keydown', onKey);
      window.addEventListener('resize', onResize);
      try { history.pushState({aascViewer: true}, ''); pushed = true; } catch (e){ pushed = false; }
      window.addEventListener('popstate', onPop);
      closeB.focus({preventScroll: true});
      if (!reduced()){
        var r = cardRect(), im = curImg();
        bg.style.opacity = '0'; topBar.style.opacity = botBar.style.opacity = '0';
        bg.getBoundingClientRect();
        bg.style.transition = topBar.style.transition = botBar.style.transition = 'opacity .3s ' + EASE;
        bg.style.opacity = topBar.style.opacity = botBar.style.opacity = '';
        if (r){
          var run = function(){ if (lb && curImg() === im) flipFrom(im, r); };
          if (im.complete && im.naturalWidth) run();
          else { im.style.opacity = '0'; im.addEventListener('load', function(){ im.style.opacity = ''; run(); }, {once: true}); }
        }
      }
    }
    function finishClose(){
      if (!lb) return;
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('popstate', onPop);
      lb.remove(); lb = null; clearTimeout(tapTimer);
      unlock();
      if (opener) opener.focus({preventScroll: true});
    }
    function closeLb(){
      if (!lb || closing) return;
      closing = true;
      var r = cardRect(), im = curImg();
      if (reduced()){ finishClose(); return; }
      bg.style.transition = topBar.style.transition = botBar.style.transition = 'opacity .3s ' + EASE;
      bg.style.opacity = topBar.style.opacity = botBar.style.opacity = '0';
      if (prevB){ prevB.style.opacity = nextB.style.opacity = '0'; }
      if (im){
        var ir = im.getBoundingClientRect();
        im.style.transition = 'transform .3s ' + EASE + ', opacity .3s ' + EASE;
        if (r && ir.width){
          var k = Math.min(r.width / ir.width, r.height / ir.height);
          var dx = r.left + r.width / 2 - (ir.left + ir.width / 2), dy = r.top + r.height / 2 - (ir.top + ir.height / 2);
          var cur = new DOMMatrix(getComputedStyle(im).transform === 'none' ? undefined : getComputedStyle(im).transform);
          im.style.transform = 'translate3d(' + (cur.m41 + dx) + 'px,' + (cur.m42 + dy) + 'px,0) scale(' + (cur.a * k) + ')';
        }
        im.style.opacity = '0';
      }
      setTimeout(finishClose, 300);
    }
    function requestClose(){
      if (!lb || closing) return;
      if (pushed){ pushed = false; history.back(); setTimeout(function(){ if (lb && !closing) closeLb(); }, 400); }
      else closeLb();
    }
    function onPop(){ if (lb){ pushed = false; closeLb(); } }
    function onResize(){ if (!lb) return; layoutBars(); resetZoom(false); setTrack(0, false); }
    function onKey(e){
      if (!lb) return;
      if (e.key === 'Escape'){ e.preventDefault(); requestClose(); }
      else if (e.key === 'ArrowRight'){ e.preventDefault(); go(idx + 1); }
      else if (e.key === 'ArrowLeft'){ e.preventDefault(); go(idx - 1); }
      else if (e.key === 'Tab'){
        var f = Array.prototype.filter.call(lb.querySelectorAll('button'), function(b){ return b.offsetParent !== null && !b.disabled; });
        var first = f[0], lastB = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first){ e.preventDefault(); lastB.focus(); }
        else if (!e.shiftKey && document.activeElement === lastB){ e.preventDefault(); first.focus(); }
      }
    }

    function count(){ return Object.keys(pts).length; }
    function two(){ var k = Object.keys(pts); return [pts[k[0]], pts[k[1]]]; }
    function onDown(e){
      if (closing || e.target.closest('button, .lb-thumbs')) return;
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      pts[e.pointerId] = {x: e.clientX, y: e.clientY};
      try { lb.setPointerCapture(e.pointerId); } catch (err){}
      var n = count();
      if (n === 1){
        g = {type: 'pending', sx: e.clientX, sy: e.clientY, t: Date.now(), lx: e.clientX, ly: e.clientY, lt: Date.now(), vx: 0, vy: 0, z0: {s: z.s, x: z.x, y: z.y}};
      } else if (n === 2){
        clearTimeout(tapTimer); lastTap = null;
        if (g && g.type === 'swipe') setTrack(0, true);
        if (g && g.type === 'down') snapBack();
        var p = two(), c = stageCenter();
        g = {type: 'pinch', d0: Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y) || 1, s0: z.s, x0: z.x, y0: z.y,
             cx: (p[0].x + p[1].x) / 2, cy: (p[0].y + p[1].y) / 2, ox: c.x, oy: c.y};
      }
    }
    function onMove(e){
      if (!pts[e.pointerId] || !g) return;
      pts[e.pointerId] = {x: e.clientX, y: e.clientY};
      if (g.type === 'pinch'){
        if (count() < 2) return;
        var p = two(), d = Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y);
        var s = Math.max(1, Math.min(4, g.s0 * d / g.d0)), cx = (p[0].x + p[1].x) / 2, cy = (p[0].y + p[1].y) / 2;
        var rx = g.cx - g.ox, ry = g.cy - g.oy;
        z.s = s; z.x = rx + (g.x0 - rx) * (s / g.s0) + (cx - g.cx); z.y = ry + (g.y0 - ry) * (s / g.s0) + (cy - g.cy);
        applyZoom(false); return;
      }
      var now = Date.now(), dt = Math.max(1, now - g.lt);
      g.vx = (e.clientX - g.lx) / dt; g.vy = (e.clientY - g.ly) / dt; g.lx = e.clientX; g.ly = e.clientY; g.lt = now;
      var dx = e.clientX - g.sx, dy = e.clientY - g.sy;
      if (g.type === 'pending'){
        if (Math.hypot(dx, dy) < 8) return;
        if (z.s > 1) g.type = 'pan';
        else if (Math.abs(dx) > Math.abs(dy)) g.type = set.length > 1 ? 'swipe' : 'still';
        else g.type = dy > 0 ? 'down' : 'still';
      }
      if (g.type === 'pan'){ z.x = g.z0.x + dx; z.y = g.z0.y + dy; clampZoom(); applyZoom(false); }
      else if (g.type === 'swipe'){
        var off = dx;
        if ((idx === 0 && dx > 0) || (idx === set.length - 1 && dx < 0)) off = dx * 0.3;
        setTrack(off, false);
      } else if (g.type === 'down'){
        var dd = Math.max(0, dy), im = curImg(), f = Math.min(dd / H(), 1);
        if (im){ im.style.transition = 'none'; im.style.transform = 'translate3d(' + dx * 0.4 + 'px,' + dd + 'px,0) scale(' + (1 - f * 0.25) + ')'; }
        bg.style.transition = 'none'; bg.style.opacity = String(1 - Math.min(dd / (H() * 0.6), 1) * 0.85);
        topBar.style.transition = botBar.style.transition = 'none'; topBar.style.opacity = botBar.style.opacity = String(Math.max(0, 1 - dd / 80));
      }
    }
    function snapBack(){
      var im = curImg(), t = reduced() ? 'none' : 'opacity .3s ' + EASE;
      if (im){ im.style.transition = reduced() ? 'none' : 'transform .3s ' + EASE; im.style.transform = ''; }
      bg.style.transition = topBar.style.transition = botBar.style.transition = t;
      bg.style.opacity = topBar.style.opacity = botBar.style.opacity = '';
    }
    function onUp(e){
      if (!pts[e.pointerId]) return;
      delete pts[e.pointerId];
      if (!g) return;
      var n = count();
      if (g.type === 'pinch'){
        if (n === 0){ if (z.s < 1.05) resetZoom(true); else { clampZoom(); applyZoom(true); } g = null; }
        else g = {type: 'still'};
        return;
      }
      if (n > 0) return;
      var dx = e.clientX - g.sx, dy = e.clientY - g.sy, type = g.type, vx = g.vx, vy = g.vy, dur = Date.now() - g.t;
      g = null;
      if (type === 'pending' && dur < 350){
        var now = Date.now(), x = e.clientX, y = e.clientY;
        if (lastTap && now - lastTap.t < 300 && Math.hypot(x - lastTap.x, y - lastTap.y) < 40){
          clearTimeout(tapTimer); lastTap = null;
          if (z.s > 1) resetZoom(true);
          else { var c = stageCenter(); z.s = 2.5; z.x = -(x - c.x) * 1.5; z.y = -(y - c.y) * 1.5; clampZoom(); applyZoom(true); }
        } else {
          lastTap = {t: now, x: x, y: y};
          clearTimeout(tapTimer); tapTimer = setTimeout(function(){ lastTap = null; if (lb && !closing) toggleBars(); }, 280);
        }
      } else if (type === 'swipe'){
        var w = W();
        if ((dx < -w * 0.18 || vx < -0.45) && idx < set.length - 1) go(idx + 1);
        else if ((dx > w * 0.18 || vx > 0.45) && idx > 0) go(idx - 1);
        else setTrack(0, true);
      } else if (type === 'down'){
        if (dy > 110 || (vy > 0.6 && dy > 30)) requestClose(); else snapBack();
      } else if (type === 'pan'){ clampZoom(); applyZoom(true); }
    }
    spCards.forEach(function(c){ c.addEventListener('click', function(){ openLb(c); }); });
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

  /* hero label: if it has to wrap, it breaks after "Soccer" and drops the middle dot */
  var hk = document.querySelector('.hero-kicker');
  if (hk){
    var fitKicker = function(){
      hk.classList.remove('wrapped');
      var a = hk.querySelector('.hk-a'), b = hk.querySelector('.hk-b');
      if (a && b && b.getBoundingClientRect().top - a.getBoundingClientRect().top > 2) hk.classList.add('wrapped');
    };
    fitKicker(); window.addEventListener('resize', fitKicker);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitKicker);
  }

  /* Gentle animations. Everything is visible without them, and Reduce Motion turns them all off. */

  /* sections rise 12px and fade in once, as they scroll into view */
  var rv = document.querySelectorAll('.reveal');
  if (rv.length && 'IntersectionObserver' in window && !reduced()){
    var io = new IntersectionObserver(function(es){ es.forEach(function(en){ if (en.isIntersecting){ en.target.classList.add('in'); io.unobserve(en.target); } }); }, {rootMargin: '0px 0px -6% 0px', threshold: 0});
    Array.prototype.forEach.call(rv, function(el){ io.observe(el); });
    doc.classList.add('rv-on');
  }

  /* drawings say hello: one small move the first time each scrolls into view, and again when tapped */
  function hello(svg){
    if (reduced()) return;
    svg.classList.remove('hi'); svg.getBoundingClientRect(); svg.classList.add('hi');
    clearTimeout(svg._hiT); svg._hiT = setTimeout(function(){ svg.classList.remove('hi'); }, 700);
  }
  var pgs = Array.prototype.slice.call(document.querySelectorAll('svg.pg.hello'));
  if (pgs.length){
    if ('IntersectionObserver' in window){
      var pio = new IntersectionObserver(function(es){ es.forEach(function(en){ if (en.isIntersecting){ pio.unobserve(en.target); var t = en.target; setTimeout(function(){ hello(t); }, 150); } }); }, {threshold: 0.6});
      pgs.forEach(function(s){ pio.observe(s); });
    }
    pgs.forEach(function(s){
      var host = s.closest('.sp-card, .path, .sport, .art') || s;
      host.addEventListener('click', function(){ hello(s); });
    });
  }

  /* the period after "Everybody plays" is a little ball: it drops in, then every 7 seconds hops and changes sport */
  var bd = document.querySelector('.ball-dot');
  if (bd){
    var bds = bd.querySelectorAll('.bd'), bi = 0;
    var hop = function(){
      if (document.hidden || reduced()) return;
      bd.classList.remove('hop'); bd.getBoundingClientRect(); bd.classList.add('hop');
      setTimeout(function(){ bds[bi].classList.remove('on'); bi = (bi + 1) % bds.length; bds[bi].classList.add('on'); }, 300);
      setTimeout(function(){ bd.classList.remove('hop'); }, 650);
    };
    setTimeout(function(){ setInterval(hop, 7000); }, 1750);
  }

  /* the word strip under the hero holds still while touched */
  var tk = document.querySelector('.ticker');
  if (tk){
    tk.addEventListener('touchstart', function(){ tk.classList.add('held'); }, {passive: true});
    ['touchend', 'touchcancel'].forEach(function(ev){ tk.addEventListener(ev, function(){ tk.classList.remove('held'); }, {passive: true}); });
  }
})();
