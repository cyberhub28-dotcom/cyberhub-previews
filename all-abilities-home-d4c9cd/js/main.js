document.documentElement.classList.add('js');

var EMAIL = 'amber.davidson@allabilitiessportsclub.com';

document.addEventListener('DOMContentLoaded', function () {
  setupMenu();
  setupForms();
  setupPrefill();
  setupSticky();
  setupIntro();
});

function setupMenu() {
  var button = document.querySelector('.menu-btn');
  var nav = document.getElementById('site-nav');
  if (!button || !nav) return;

  function setOpen(open) {
    nav.classList.toggle('open', open);
    button.setAttribute('aria-expanded', open ? 'true' : 'false');
    button.textContent = open ? 'Close' : 'Menu';
  }

  button.addEventListener('click', function () {
    setOpen(!nav.classList.contains('open'));
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && nav.classList.contains('open')) {
      setOpen(false);
      button.focus();
    }
  });
}

function setupForms() {
  document.querySelectorAll('form[data-mail]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var status = form.querySelector('.form-msg');
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      var subject = form.getAttribute('data-subject') || 'All Abilities Sports Club';
      var interest = valueOf(form, 'interest');
      if (interest) subject = 'All Abilities Sports Club: ' + labelInterest(interest);
      var topic = valueOf(form, 'topic');
      if (topic) subject = 'All Abilities Sports Club: ' + topic;

      var lines = [];
      Array.prototype.forEach.call(form.elements, function (field) {
        if (!field.name || field.type === 'submit' || field.type === 'button') return;
        if ((field.type === 'checkbox' || field.type === 'radio') && !field.checked) return;
        var label = field.name.replace(/[-_]/g, ' ');
        lines.push(label + ': ' + field.value.trim());
      });

      var href = 'mailto:' + EMAIL + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(lines.join('\n'));
      if (status) {
        status.textContent = 'Your email app should open with this message addressed to ' + EMAIL + '. If it does not, copy your note and email the club directly.';
        status.focus();
      }
      window.location.href = href;
    });
  });
}

function valueOf(form, name) {
  var field = form.elements[name];
  if (!field) return '';
  if (field.value != null) return String(field.value).trim();
  return '';
}

function labelInterest(value) {
  if (value === 'athlete') return 'athlete sign-up';
  if (value === 'volunteer') return 'volunteer';
  if (value === 'both') return 'sign-up and volunteer';
  return value;
}

function setupPrefill() {
  var params = new URLSearchParams(window.location.search);
  var message = document.getElementById('message');
  var topic = document.getElementById('topic');
  if (params.get('subject') === 'sponsor') {
    if (topic) topic.value = 'Sponsorship';
    if (message && !message.value) message.value = 'Sponsorship inquiry: ';
  }
  if (window.location.hash === '#volunteer') {
    var volunteer = document.querySelector('input[name="interest"][value="volunteer"]');
    if (volunteer) volunteer.checked = true;
  }
  if (window.location.hash === '#athlete') {
    var athlete = document.querySelector('input[name="interest"][value="athlete"]');
    if (athlete) athlete.checked = true;
  }
}

function setupSticky() {
  var sticky = document.querySelector('.sticky-cta');
  var footer = document.querySelector('.site-foot');
  if (!sticky) return;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function update() {
    var show = window.scrollY > window.innerHeight * 0.55;
    if (footer) {
      var rect = footer.getBoundingClientRect();
      if (rect.top < window.innerHeight - 20) show = false;
    }
    sticky.classList.toggle('on', show);
    if (reduce) sticky.style.transition = 'none';
  }

  update();
  window.addEventListener('scroll', update, { passive: true });
}

function setupIntro() {
  if (document.body.getAttribute('data-page') !== 'home') return;
  var key = 'aascKickoffIntro';
  var reduce = false;
  try {
    reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch (error) {
    reduce = true;
  }
  var seen = '1';
  try { seen = sessionStorage.getItem(key); } catch (error) { seen = '1'; }
  if (seen || reduce) return;
  try { sessionStorage.setItem(key, '1'); } catch (error) { return; }

  var intro = document.createElement('div');
  intro.className = 'intro';
  intro.setAttribute('aria-hidden', 'true');
  intro.innerHTML =
    '<svg class="intro-field" viewBox="0 0 1500 900" aria-hidden="true">' +
    '<rect class="stripe" width="1500" height="900" fill="#1f4a3a"/>' +
    '<g fill="#275743"><rect width="150" height="900"/><rect x="300" width="150" height="900"/><rect x="600" width="150" height="900"/><rect x="900" width="150" height="900"/><rect x="1200" width="150" height="900"/></g>' +
    '<g fill="none" stroke="rgba(255,255,255,.55)" stroke-width="4"><rect x="60" y="60" width="1380" height="780"/><path d="M750 60V840"/><circle cx="750" cy="450" r="130"/></g></svg>' +
    '<div><div class="intro-ball"><svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="28" fill="#fff"/><path d="M32 18l10 7-4 12H26l-4-12z" fill="#13294B"/><path d="M32 4v14M42 25l13-4M38 37l8 12M26 37l-8 12M22 25L9 21" stroke="#13294B" stroke-width="3" fill="none"/></svg></div>' +
    '<div class="intro-copy"><p>Everybody <span>plays.</span></p></div></div>';

  var skip = document.createElement('button');
  skip.type = 'button';
  skip.className = 'intro-skip';
  skip.textContent = 'Skip intro';

  var locked = [];
  document.querySelectorAll('.draft-flag, .site-head, main, .site-foot, .sticky-cta').forEach(function (el) {
    el.setAttribute('inert', '');
    locked.push(el);
  });
  document.body.classList.add('intro-lock');
  document.body.appendChild(intro);
  document.body.appendChild(skip);
  skip.focus();

  var done = false;
  var timer;
  function end(fast) {
    if (done) return;
    done = true;
    clearTimeout(timer);
    document.removeEventListener('keydown', onKey);
    locked.forEach(function (el) { el.removeAttribute('inert'); });
    document.body.classList.remove('intro-lock');
    skip.remove();
    if (fast) {
      intro.remove();
    } else {
      intro.classList.add('out');
      setTimeout(function () { intro.remove(); }, 520);
    }
    var main = document.getElementById('main');
    if (main) main.focus();
  }
  function onKey(event) {
    if (event.key === 'Escape') end(true);
  }
  skip.addEventListener('click', function () { end(true); });
  intro.addEventListener('click', function () { end(true); });
  document.addEventListener('keydown', onKey);
  timer = setTimeout(function () { end(false); }, 2300);
}
