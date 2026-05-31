// ── LOADER ──
let pct = 0;
const loader = document.getElementById('loader');
const loaderNum = document.getElementById('loader-num');
const iv = setInterval(() => {
  pct = Math.min(pct + Math.random() * 18, 100);
  loaderNum.textContent = Math.floor(pct) + '%';
  if (pct >= 100) {
    clearInterval(iv);
    setTimeout(() => loader.classList.add('hidden'), 200);
  }
}, 80);

// ── CURSOR ──
const cur = document.getElementById('cursor');
const ring = document.getElementById('cursor-ring');
let mx = 0, my = 0, rx = 0, ry = 0;
document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
function animCursor() {
  cur.style.left = mx + 'px'; cur.style.top = my + 'px';
  rx += (mx - rx) * .14; ry += (my - ry) * .14;
  ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
  requestAnimationFrame(animCursor);
}
animCursor();

// ── TYPING ANIMATION ──
const phrases = ['AI • Linux • Development', 'Automation • System Computing','Reverse Engineering','Building the Future'];
let pi = 0, ci = 0, del = false;
const typEl = document.getElementById('typing-el');
function type() {
  const phrase = phrases[pi];
  if (!del) {
    typEl.textContent = phrase.slice(0, ++ci);
    if (ci === phrase.length) { del = true; setTimeout(type, 2000); return; }
  } else {
    typEl.textContent = phrase.slice(0, --ci);
    if (ci === 0) { del = false; pi = (pi + 1) % phrases.length; }
  }
  setTimeout(type, del ? 40 : 80);
}
setTimeout(type, 1500);

// ── PARTICLE CANVAS ──
const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');
let W, H, particles = [];
function resize() { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }
window.addEventListener('resize', resize); resize();
for (let i = 0; i < 80; i++) particles.push({
  x: Math.random()*1920, y: Math.random()*1080,
  vx: (Math.random()-.5)*.3, vy: (Math.random()-.5)*.3,
  r: Math.random()*1.5+.5, a: Math.random()*.5+.1
});
function drawParticles() {
  ctx.clearRect(0,0,W,H);
  particles.forEach(p => {
    p.x += p.vx; p.y += p.vy;
    if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
    if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
    ctx.fillStyle = `rgba(0,212,255,${p.a})`;
    ctx.fill();
  });
  // connections
  for (let i = 0; i < particles.length; i++) {
    for (let j = i+1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const d = Math.sqrt(dx*dx+dy*dy);
      if (d < 120) {
        ctx.beginPath();
        ctx.strokeStyle = `rgba(0,212,255,${.06*(1-d/120)})`;
        ctx.lineWidth = .5;
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.stroke();
      }
    }
  }
  requestAnimationFrame(drawParticles);
}
drawParticles();

// ── NAV SCROLL ──
const nav = document.getElementById('nav');
let lastScroll = 0;
window.addEventListener('scroll', () => {
  const s = window.scrollY;
  nav.classList.toggle('scrolled', s > 20);
  nav.classList.toggle('hidden-nav', s > lastScroll + 5 && s > 200);
  if (s < lastScroll - 5) nav.classList.remove('hidden-nav');
  lastScroll = s;
  // Active section
  document.querySelectorAll('section[id]').forEach(sec => {
    const top = sec.offsetTop - 100;
    const bot = top + sec.offsetHeight;
    const link = document.querySelector(`.nav-links a[href="#${sec.id}"]`);
    if (link) link.classList.toggle('active', s >= top && s < bot);
  });
});

// ── MOBILE MENU ──
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobile-menu');
hamburger.addEventListener('click', () => mobileMenu.classList.toggle('open'));
document.querySelectorAll('.mobile-link').forEach(l => {
  l.addEventListener('click', () => mobileMenu.classList.remove('open'));
});

// ── SCROLL REVEAL ──
const ro = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); } });
}, { threshold: .1, rootMargin: '0px 0px -40px 0px' });
document.querySelectorAll('.reveal').forEach(el => ro.observe(el));

// ── SKILL BARS ──
const skillObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.querySelectorAll('.skill-fill').forEach(bar => {
        bar.style.width = bar.dataset.w + '%';
      });
      skillObs.unobserve(e.target);
    }
  });
}, { threshold: .3 });
document.querySelectorAll('.skill-group').forEach(g => skillObs.observe(g));

// ── COUNTER ANIMATION ──
function animateCounters() {
  document.querySelectorAll('.achievement-val[data-count]').forEach(el => {
    const target = parseInt(el.dataset.count);
    let cur = 0;
    const step = () => {
      cur = Math.min(cur + 1, target);
      el.textContent = cur;
      if (cur < target) setTimeout(step, 200);
    };
    step();
  });
}
const achObs = new IntersectionObserver((e) => {
  if (e[0].isIntersecting) { animateCounters(); achObs.disconnect(); }
}, { threshold: .4 });
const achSection = document.getElementById('achievements');
if (achSection) achObs.observe(achSection);

// ── TILT CARD ──
const tiltCard = document.getElementById('tilt-card');
if (tiltCard) {
  tiltCard.addEventListener('mousemove', e => {
    const rect = tiltCard.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - .5;
    const y = (e.clientY - rect.top) / rect.height - .5;
    tiltCard.style.transform = `translateY(-8px) rotateY(${x*16}deg) rotateX(${-y*16}deg)`;
  });
  tiltCard.addEventListener('mouseleave', () => {
    tiltCard.style.transform = '';
  });
}

// ── CONTACT SEND ──
function handleSend() {
  const name = document.getElementById('fname').value;
  const email = document.getElementById('femail').value;
  const msg = document.getElementById('fmsg').value;
  if (!name || !email || !msg) { alert('Please fill all fields.'); return; }
  window.location.href = `mailto:naveen.132414@gmail.com?subject=Portfolio Contact from ${name}&body=${encodeURIComponent(msg + '\n\nFrom: ' + name + ' <' + email + '>')}`;
}

// ── SMOOTH SCROLL ──
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();
    const target = document.querySelector(a.getAttribute('href'));
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

// ── BACKGROUND MUSIC ──
const bgm = document.getElementById('bgm');
const bgmBtn = document.getElementById('bgm-btn');
const bgmIcon = document.getElementById('bgm-icon');

if (bgm && bgmBtn && bgmIcon) {
  let isPlaying = false;

  function toggleBgm() {
    if (isPlaying) {
      bgm.pause();
      bgmIcon.textContent = '🎵';
    } else {
      bgm.play().catch(e => console.log('Playback prevented', e));
      bgmIcon.textContent = '⏸️';
    }
    isPlaying = !isPlaying;
  }

  bgmBtn.addEventListener('click', toggleBgm);

  // Attempt autoplay on load
  window.addEventListener('load', () => {
    bgm.play().then(() => {
      isPlaying = true;
      bgmIcon.textContent = '⏸️';
    }).catch(e => {
      console.log('Autoplay prevented by browser policy. Waiting for user interaction.');
    });
  });
}
