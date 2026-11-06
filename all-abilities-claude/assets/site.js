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

  /* registration countdown, in the visitor's local time */
  var num = document.getElementById('rc-num'), txt = document.getElementById('rc-text');
  if (num && txt){
    var now = new Date();
    var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    var open = new Date(2026, 10, 20), close = new Date(2026, 11, 19);
    var days = Math.round((open - today) / 86400000);
    if (today < open){
      num.textContent = days;
      num.insertAdjacentHTML('beforeend', days === 1 ? '<small>day</small>' : '<small>days</small>');
      txt.textContent = days === 1 ? 'until registration opens tomorrow, November 20' : 'until registration opens November 20';
      num.hidden = false;
    } else if (now < close){
      num.innerHTML = '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>';
      num.hidden = false;
      txt.textContent = 'Registration is open now, until December 18 or all 48 spots are filled';
    } else {
      txt.textContent = 'Winter registration has closed. Contact us about the next season.';
    }
  }

  /* gentle reveal as sections scroll into view */
  var rv = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window){
    var io = new IntersectionObserver(function(es){ es.forEach(function(en){ if (en.isIntersecting){ en.target.classList.add('in'); io.unobserve(en.target); } }); }, {rootMargin:'0px 0px -8% 0px', threshold:.08});
    Array.prototype.forEach.call(rv, function(el){ io.observe(el); });
  } else { Array.prototype.forEach.call(rv, function(el){ el.classList.add('in'); }); }
})();
