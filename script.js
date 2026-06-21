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
const phrases = ['AI • Linux • Development', 'Automation • System Computing','⏪Reverse Engineering','🏗️Building the Future'];
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
const bloom = document.getElementById('hamburger-bloom');

hamburger.addEventListener('click', () => {
  const isOpen = mobileMenu.classList.toggle('open');
  hamburger.classList.toggle('open');
  document.body.classList.toggle('menu-open', isOpen);

  // Bloom burst — restart animation on every click
  if (bloom) {
    bloom.classList.remove('burst');
    void bloom.offsetWidth; // force reflow to restart
    bloom.classList.add('burst');
  }
});

// Close menu when a link is tapped
document.querySelectorAll('.mobile-link').forEach(l => {
  l.addEventListener('click', () => {
    mobileMenu.classList.remove('open');
    hamburger.classList.remove('open');
    document.body.classList.remove('menu-open');
  });
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
    if (isNaN(target)) return;
    let cur = 0;
    el.textContent = '0';
    const delay = 500; // 500ms pause on each number
    const step = () => {
      cur++;
      el.textContent = cur;
      if (cur < target) setTimeout(step, delay);
    };
    setTimeout(step, delay); // wait 700ms before going from 0 → 1
  });
}
const achObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) { animateCounters(); achObs.disconnect(); }
  });
}, { threshold: .1 });
const achSection = document.getElementById('achievements');
if (achSection) achObs.observe(achSection);

// ── TERMINAL TYPEWRITER ON SCROLL ──
const terminalBody = document.getElementById('terminal-body');
const terminalSequence = [
  { type: 'cmd', text: 'whoami' },
  { type: 'out', html: '<span class="term-cyan">naveen_rg</span> — tech enthusiast &amp; builder' },
  { type: 'cmd', text: 'cat interests.txt' },
  { type: 'out', html: 'AI · Linux · Development · Automation · System Computing' },
  { type: 'cmd', text: 'ls projects/' },
  { type: 'out', html: '<span class="term-cyan">trading-app/</span>  <span class="term-cyan">spotify-clone/</span>  <span class="term-cyan">portfolio/</span>' },
  { type: 'cmd', text: 'echo $STATUS' },
  { type: 'out', html: '<span style="color:var(--green)">open_to_opportunities=true ✓</span>' },
];

let terminalPlayed = false;

function typeCommand(cmdSpan, text, cb) {
  let i = 0;
  function tick() {
    if (i <= text.length) {
      cmdSpan.textContent = text.slice(0, i);
      i++;
      setTimeout(tick, 45 + Math.random() * 35);
    } else {
      if (cb) cb();
    }
  }
  tick();
}

function playTerminal() {
  if (terminalPlayed || !terminalBody) return;
  terminalPlayed = true;

  let stepIndex = 0;

  function nextStep() {
    if (stepIndex >= terminalSequence.length) {
      return;
    }

    const step = terminalSequence[stepIndex];

    if (step.type === 'cmd') {
      const line = document.createElement('div');
      line.className = 'term-line';
      if (stepIndex > 0) line.style.marginTop = '8px';
      const prompt = document.createElement('span');
      prompt.className = 'term-prompt';
      prompt.textContent = '❯';
      const cmdSpan = document.createElement('span');
      cmdSpan.className = 'term-cmd';
      line.appendChild(prompt);
      line.appendChild(cmdSpan);
      terminalBody.appendChild(line);

      typeCommand(cmdSpan, step.text, () => {
        stepIndex++;
        setTimeout(nextStep, 200);
      });
    } else if (step.type === 'out') {
      const line = document.createElement('div');
      line.className = 'term-line term-out';
      line.style.opacity = '0';
      line.style.transform = 'translateY(4px)';
      line.innerHTML = step.html;
      terminalBody.appendChild(line);

      // Fade in the output
      requestAnimationFrame(() => {
        line.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        line.style.opacity = '1';
        line.style.transform = 'translateY(0)';
      });

      stepIndex++;
      setTimeout(nextStep, 400);
    }
  }

  nextStep();
}

const termObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting && !terminalPlayed) {
      playTerminal();
      termObs.disconnect();
    }
  });
}, { threshold: 0.4 });

const termCard = document.querySelector('.terminal-card');
if (termCard) termObs.observe(termCard);

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

// ── LUFFY PARALLAX SCROLL ──
const luffyEl = document.getElementById('luffy-float');
const timeline = document.getElementById('timeline');
let isGear5 = false;
if (luffyEl && timeline) {
  window.addEventListener('scroll', () => {
    const rect = timeline.getBoundingClientRect();
    const timelineH = timeline.offsetHeight;
    const viewH = window.innerHeight;

    // Calculate how far through the timeline we've scrolled (0 to 1)
    const progress = Math.min(Math.max((viewH - rect.top) / (timelineH + viewH), 0), 1);

    // Move Luffy from top (0) to bottom of timeline
    const luffyTop = progress * (timelineH - 40);
    luffyEl.style.top = luffyTop + 'px';

    // Swap to Gear 5 at ~80% scroll
    if (progress >= 0.8 && !isGear5) {
      isGear5 = true;
      luffyEl.classList.add('gear5');
      luffyEl.style.transform = 'scale(0)';
      setTimeout(() => {
        luffyEl.src = 'luffy_gear5.jpg';
        luffyEl.style.transform = 'scale(1.3)';
        setTimeout(() => { luffyEl.style.transform = 'scale(1)'; }, 200);
      }, 150);
    } else if (progress < 0.8 && isGear5) {
      isGear5 = false;
      luffyEl.classList.remove('gear5');
      luffyEl.style.transform = 'scale(0)';
      setTimeout(() => {
        luffyEl.src = 'luffy.jpg';
        luffyEl.style.transform = 'scale(1)';
      }, 150);
    }
  });
}

// ── SMOOTH SCROLL ──
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();
    const target = document.querySelector(a.getAttribute('href'));
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

// ── BACKGROUND MUSIC + SONG PICKER ──
const bgm = document.getElementById('bgm');
const bgmBtn = document.getElementById('bgm-btn');
const bgmIcon = document.getElementById('bgm-icon');
const songPicker = document.getElementById('song-picker');

if (bgm && bgmBtn && bgmIcon && songPicker) {
  let isPlaying = false;
  let longPressTimer = null;
  let didLongPress = false;

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

  function openPicker() {
    songPicker.classList.add('open');
  }

  function closePicker() {
    songPicker.classList.remove('open');
  }

  // ── Long-press detection (works for mouse + touch) ──
  function startPress(e) {
    didLongPress = false;
    longPressTimer = setTimeout(() => {
      didLongPress = true;
      openPicker();
    }, 500);
  }

  function endPress(e) {
    clearTimeout(longPressTimer);
    // If it was a short tap (not long-press), toggle play/pause
    if (!didLongPress) {
      toggleBgm();
    }
  }

  function cancelPress() {
    clearTimeout(longPressTimer);
  }

  // Mouse events
  bgmBtn.addEventListener('mousedown', startPress);
  bgmBtn.addEventListener('mouseup', endPress);
  bgmBtn.addEventListener('mouseleave', cancelPress);

  // Touch events (mobile)
  bgmBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    startPress(e);
  }, { passive: false });
  bgmBtn.addEventListener('touchend', endPress);
  bgmBtn.addEventListener('touchcancel', cancelPress);

  // ── Song picker item clicks ──
  document.querySelectorAll('.song-picker-item').forEach(item => {
    item.addEventListener('click', () => {
      const src = item.dataset.src;
      if (!src) return;

      // Update active state
      document.querySelectorAll('.song-picker-item').forEach(i => {
        i.classList.remove('active');
        i.classList.remove('wave-active');
        const oldWave = i.querySelector('.song-picker-wave');
        if (oldWave) oldWave.remove();
      });
      item.classList.add('active');

      // Wave effect for 1.5s
      item.classList.add('wave-active');
      const wave = document.createElement('div');
      wave.className = 'song-picker-wave';
      for (let i = 0; i < 5; i++) {
        const bar = document.createElement('div');
        bar.className = 'wave-bar';
        wave.appendChild(bar);
      }
      item.appendChild(wave);

      // Switch track
      const wasPlaying = isPlaying;
      bgm.pause();
      bgm.src = src;
      bgm.load();

      if (wasPlaying) {
        bgm.play().then(() => {
          isPlaying = true;
          bgmIcon.textContent = '⏸️';
        }).catch(e => console.log('Playback prevented', e));
      }

      closePicker();
    });
  });

  // Close picker when clicking outside
  document.addEventListener('click', (e) => {
    if (!songPicker.contains(e.target) && !bgmBtn.contains(e.target)) {
      closePicker();
    }
  });

  // Autoplay on load
  window.addEventListener('load', () => {
    bgm.play().then(() => {
      isPlaying = true;
      bgmIcon.textContent = '⏸️';
    }).catch(e => {
      console.log('Autoplay prevented by browser policy. Waiting for user interaction.');
    });
  });
}