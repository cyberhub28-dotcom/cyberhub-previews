document.documentElement.classList.add('js');
document.addEventListener('DOMContentLoaded',function(){
  var b=document.querySelector('.menu-btn'),n=document.getElementById('site-nav');
  if(b&&n){b.addEventListener('click',function(){var o=n.classList.toggle('open');b.setAttribute('aria-expanded',o)});
  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&n.classList.contains('open')){n.classList.remove('open');b.setAttribute('aria-expanded','false');b.focus()}})}
  document.querySelectorAll('form[data-placeholder]').forEach(function(f){f.addEventListener('submit',function(e){e.preventDefault();
    var m=f.querySelector('.form-msg');if(f.checkValidity()){m.textContent='Thanks! This is a draft form and nothing was sent. The club’s own form service will be connected before launch.';}m.focus()})});
});
/* Home intro (added only by JS; once per session; skipped for reduced motion) */
(function(){
  var KEY='aascIntroSeen';
  function seen(){try{return sessionStorage.getItem(KEY)}catch(e){return 1}}
  function mark(){try{sessionStorage.setItem(KEY,'1')}catch(e){}}
  if(seen()||!window.matchMedia||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  function run(){
    var hero=document.querySelector('section.hero');if(!hero)return;mark();
    var o=document.createElement('div');o.className='intro';o.setAttribute('aria-hidden','true');
    var balls=hero.querySelectorAll('.ball-float svg'),bh='';
    for(var i=0;i<balls.length;i++)bh+='<span class="ib ib'+i+'">'+balls[i].outerHTML+'</span>';
    var conf='';for(var j=0;j<18;j++)conf+='<i style="--a:'+(j*20)+'deg;--d:'+(120+(j%3)*50)+'px;--c:'+['#F08A24','#A9DB86','#8FD0EE','#FFD166'][j%4]+'"></i>';
    o.innerHTML='<div class="intro-balls">'+bh+'</div><div class="intro-logo"><img src="assets/img/logo-full.webp" alt=""><div class="intro-burst">'+conf+'</div></div>';
    var s=document.createElement('button');s.type='button';s.className='intro-skip';s.textContent='Skip intro';
    document.body.appendChild(o);document.body.appendChild(s);
    var done=false,t;
    function end(fast){if(done)return;done=true;clearTimeout(t);
      document.removeEventListener('keydown',kd);
      if(fast){o.remove();s.remove();return}
      o.classList.add('out');s.remove();setTimeout(function(){o.remove()},650)}
    function kd(e){if(e.key==='Escape')end(true)}
    s.addEventListener('click',function(){end(true)});o.addEventListener('click',function(){end(true)});
    document.addEventListener('keydown',kd);
    t=setTimeout(function(){end(false)},1750);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run);else run();
})();
/* Round 2: reveals, scroll progress, countdown ball (JS-only; no-ops for reduced motion) */
document.addEventListener('DOMContentLoaded',function(){
  if(!window.matchMedia||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  var ball=(document.querySelector('.ball-float svg')||{}).outerHTML||'<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="28" fill="#F08A24" stroke="#fff" stroke-width="3"/><path d="M4 32h56M32 4v56" stroke="#fff" stroke-width="3"/></svg>';
  if('IntersectionObserver' in window){
    var els=document.querySelectorAll('main h2, main .page-hero h1, main .page-hero p, main .grid>*, main .notice, main .sponsors>*, main fieldset, main .btns'),io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{threshold:.12,rootMargin:'0px 0px -40px 0px'});
    els.forEach(function(el){var p=el.parentElement,i=Array.prototype.indexOf.call(p.children,el);el.style.setProperty('--rd',Math.min(i,5)*0.08+'s');el.classList.add('rv');io.observe(el)});
  }
  var bar=document.createElement('div');bar.className='scroll-bar';bar.setAttribute('aria-hidden','true');
  var sb=document.createElement('div');sb.className='scroll-ball';sb.setAttribute('aria-hidden','true');sb.innerHTML=ball;
  document.body.appendChild(bar);document.body.appendChild(sb);
  var tick=false;function upd(){var h=document.documentElement,m=h.scrollHeight-h.clientHeight,p=m>0?h.scrollTop/m:0;bar.style.setProperty('--p',p);sb.style.setProperty('--p',p);tick=false}
  addEventListener('scroll',function(){if(!tick){tick=true;requestAnimationFrame(upd)}},{passive:true});upd();
  var sc=document.querySelector('.score-in');if(sc){var s=document.createElement('span');s.className='score-ball';s.setAttribute('aria-hidden','true');s.innerHTML=ball;sc.appendChild(s)}
});
// prefill contact message from ?subject=sponsor
(function(){var m=document.getElementById('cmsg');if(m&&/[?&]subject=sponsor\b/.test(location.search)&&!m.value){m.value='Sponsorship inquiry: ';}})();
