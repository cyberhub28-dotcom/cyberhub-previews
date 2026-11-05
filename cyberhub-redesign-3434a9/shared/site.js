// CyberHub preview: menu, before/after slider, reveal on scroll.
(function(){
  var d=document;
  d.documentElement.classList.add('js');
  var btn=d.querySelector('.menu-btn'),nav=d.getElementById('site-nav');
  if(btn&&nav){
    btn.addEventListener('click',function(){
      var open=nav.classList.toggle('open');
      btn.setAttribute('aria-expanded',open?'true':'false');
    });
    nav.addEventListener('click',function(e){
      if(e.target.tagName==='A'){nav.classList.remove('open');btn.setAttribute('aria-expanded','false')}
    });
    d.addEventListener('keydown',function(e){
      if(e.key==='Escape'&&nav.classList.contains('open')){nav.classList.remove('open');btn.setAttribute('aria-expanded','false');btn.focus()}
    });
  }
  d.querySelectorAll('.ba input').forEach(function(r){
    var box=r.closest('.ba');
    function set(){box.style.setProperty('--pos',r.value+'%');r.setAttribute('aria-valuetext',r.value+'% after')}
    r.addEventListener('input',set);set();
  });
  var els=d.querySelectorAll('.rv');
  if('IntersectionObserver' in window&&!/[?&]static\b/.test(location.search)){
    var io=new IntersectionObserver(function(es){
      es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}});
    },{rootMargin:'0px 0px -8% 0px'});
    els.forEach(function(el){io.observe(el)});
  }else{els.forEach(function(el){el.classList.add('in')})}
})();
