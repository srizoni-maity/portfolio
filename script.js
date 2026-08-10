document.getElementById('year').textContent = new Date().getFullYear();

/* ---------------------------------------------------------
   NAV: scroll state, mobile toggle, active link, smooth close
--------------------------------------------------------- */
const nav = document.getElementById('nav');
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

window.addEventListener('scroll', () => {
  nav.classList.toggle('is-scrolled', window.scrollY > 40);
}, { passive:true });

navToggle.addEventListener('click', () => {
  navLinks.classList.toggle('is-open');
  document.body.classList.toggle('nav-open');
});
navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  navLinks.classList.remove('is-open');
  document.body.classList.remove('nav-open');
}));

const sections = document.querySelectorAll('section[id]');
const navLinkEls = document.querySelectorAll('[data-nav]');
const navObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.getAttribute('id');
      navLinkEls.forEach(l => l.classList.toggle('is-active', l.getAttribute('href') === `#${id}`));
    }
  });
}, { rootMargin: '-45% 0px -50% 0px' });
sections.forEach(s => navObserver.observe(s));

/* ---------------------------------------------------------
   Cursor glow (desktop only)
--------------------------------------------------------- */
const glow = document.getElementById('cursorGlow');
if (window.matchMedia('(hover: hover)').matches) {
  window.addEventListener('mousemove', (e) => {
    glow.style.opacity = '1';
    glow.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%,-50%)`;
  });
  window.addEventListener('mouseleave', () => glow.style.opacity = '0');
}

/* ---------------------------------------------------------
   Reveal-on-scroll
--------------------------------------------------------- */
const revealEls = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });
revealEls.forEach(el => revealObserver.observe(el));

/* ---------------------------------------------------------
   Hero synapse network canvas (signature motif)
--------------------------------------------------------- */
(function synapseCanvas(){
  const canvas = document.getElementById('synapseCanvas');
  const ctx = canvas.getContext('2d');
  const hero = document.querySelector('.hero');
  let w, h, points = [];
  const COUNT = 46;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function resize(){
    w = canvas.width = hero.offsetWidth;
    h = canvas.height = hero.offsetHeight;
    points = Array.from({length: COUNT}, () => ({
      x: Math.random()*w, y: Math.random()*h,
      vx: (Math.random()-0.5)*0.25, vy: (Math.random()-0.5)*0.25,
      r: Math.random()*1.6+0.6
    }));
  }
  window.addEventListener('resize', resize);
  resize();

  function frame(){
    ctx.clearRect(0,0,w,h);
    for (const p of points){
      if (!reduceMotion){ p.x += p.vx; p.y += p.vy; }
      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h) p.vy *= -1;
    }
    for (let i=0;i<points.length;i++){
      for (let j=i+1;j<points.length;j++){
        const a = points[i], b = points[j];
        const dx = a.x-b.x, dy = a.y-b.y;
        const dist = Math.sqrt(dx*dx+dy*dy);
        if (dist < 140){
          ctx.strokeStyle = `rgba(255,47,135,${(1-dist/140)*0.18})`;
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke();
        }
      }
    }
    for (const p of points){
      ctx.beginPath();
      ctx.fillStyle = 'rgba(255,255,255,0.55)';
      ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fill();
    }
    if (!reduceMotion) requestAnimationFrame(frame);
  }
  frame();
})();

/* ---------------------------------------------------------
   About: CGPA counter + bar
--------------------------------------------------------- */
(function cgpa(){
  const el = document.querySelector('.about');
  const numEl = document.getElementById('cgpaCount');
  const barEl = document.getElementById('cgpaBar');
  const target = 8.17;
  let done = false;
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !done){
        done = true;
        barEl.style.width = (target/10*100) + '%';
        const start = performance.now();
        const dur = 1400;
        function step(t){
          const p = Math.min(1,(t-start)/dur);
          numEl.textContent = (target*p).toFixed(2);
          if (p<1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
        obs.disconnect();
      }
    });
  }, { threshold:0.4 });
  obs.observe(el);
})();

/* ---------------------------------------------------------
   About: research-interest orbit connecting lines
--------------------------------------------------------- */
(function orbit(){
  const wrap = document.getElementById('orbit');
  const svg = wrap.querySelector('.orbit-lines');
  const nodes = wrap.querySelectorAll('.orbit-node');
  const NS = 'http://www.w3.org/2000/svg';

  function draw(){
    svg.innerHTML = '';
    const rect = wrap.getBoundingClientRect();
    const cx = rect.width/2, cy = rect.height/2;
    svg.setAttribute('viewBox', `0 0 ${rect.width} ${rect.height}`);
    nodes.forEach((node, idx) => {
      const nr = node.getBoundingClientRect();
      const nx = nr.left - rect.left + nr.width/2;
      const ny = nr.top - rect.top + nr.height/2;
      const line = document.createElementNS(NS,'line');
      line.setAttribute('x1', cx); line.setAttribute('y1', cy);
      line.setAttribute('x2', nx); line.setAttribute('y2', ny);
      line.dataset.idx = idx;
      svg.appendChild(line);
    });
  }
  window.addEventListener('resize', draw);
  setTimeout(draw, 300);

  nodes.forEach((node, idx) => {
    node.addEventListener('mouseenter', () => {
      const line = svg.querySelector(`line[data-idx="${idx}"]`);
      if (line) line.classList.add('is-active');
    });
    node.addEventListener('mouseleave', () => {
      const line = svg.querySelector(`line[data-idx="${idx}"]`);
      if (line) line.classList.remove('is-active');
    });
  });
})();

/* ---------------------------------------------------------
   Experience: staggered tag delays
--------------------------------------------------------- */
document.querySelectorAll('.timeline-card__tags').forEach(group => {
  [...group.children].forEach((tag, i) => tag.style.setProperty('--d', i));
});

/* ---------------------------------------------------------
   Projects carousel
--------------------------------------------------------- */
(function carousel(){
  const track = document.getElementById('projTrack');
  const cards = [...track.children];
  const prev = document.getElementById('projPrev');
  const next = document.getElementById('projNext');
  const dotsWrap = document.getElementById('projDots');

  cards.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.addEventListener('click', () => cards[i].scrollIntoView({behavior:'smooth', inline:'start', block:'nearest'}));
    dotsWrap.appendChild(dot);
  });
  const dots = [...dotsWrap.children];

  function cardWidth(){ return cards[0].getBoundingClientRect().width + 24; }
  prev.addEventListener('click', () => track.scrollBy({ left: -cardWidth(), behavior:'smooth' }));
  next.addEventListener('click', () => track.scrollBy({ left: cardWidth(), behavior:'smooth' }));

  function updateDots(){
    const scrollLeft = track.scrollLeft;
    let closest = 0, min = Infinity;
    cards.forEach((c,i) => {
      const d = Math.abs(c.offsetLeft - track.offsetLeft - scrollLeft);
      if (d < min){ min = d; closest = i; }
    });
    dots.forEach((d,i) => d.classList.toggle('is-active', i === closest));
  }
  track.addEventListener('scroll', () => requestAnimationFrame(updateDots), { passive:true });
  updateDots();
})();

/* ---------------------------------------------------------
   Stack filter chips
--------------------------------------------------------- */
(function stackFilter(){
  const chips = document.querySelectorAll('.stack-chip');
  const nodes = document.querySelectorAll('.tech-node');
  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chips.forEach(c => c.classList.remove('is-active'));
      chip.classList.add('is-active');
      const cat = chip.dataset.cat;
      nodes.forEach(node => {
        const show = cat === 'all' || node.dataset.cat === cat;
        node.classList.toggle('is-hidden', !show);
      });
    });
  });
})();
