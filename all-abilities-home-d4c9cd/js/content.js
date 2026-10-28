// Renders Sponsors, Events and News from /content/*.json (edited in Pages CMS).
(function(){const e=s=>String(s||'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const fd=d=>{const t=new Date(d+'T12:00:00');return isNaN(t)?e(d):t.toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'})};
const get=f=>fetch('content/'+f+'.json',{cache:'no-store'}).then(r=>r.json());
const sw=document.querySelector('[data-sponsors]');if(sw)get('sponsors').then(d=>{if(d.sponsors.length)sw.innerHTML=d.sponsors.map(s=>`<a class="slot" href="${e(s.link)||'#'}" rel="noopener">${s.logo?`<img src="${e(s.logo)}" alt="${e(s.name)}">`:`<strong>${e(s.name)}</strong>`}${s.level?`<small>${e(s.level)}</small>`:''}</a>`).join('')});
const ev=document.querySelector('[data-events]');if(ev)get('events').then(d=>{ev.innerHTML=d.events.map(x=>`<div class="card"><p class="ev-date">${fd(x.date)}</p><h3>${e(x.title)}</h3><p><strong>${e(x.place)}</strong></p><p>${e(x.details)}</p></div>`).join('')||'<p>No events yet.</p>'});
const nw=document.querySelector('[data-news]');if(nw)get('news').then(d=>{nw.innerHTML=d.news.map(x=>`<div class="card"><p class="ev-date">${fd(x.date)}</p><h3>${e(x.title)}</h3><p>${e(x.body)}</p></div>`).join('')||'<p>No news yet.</p>'});})();
