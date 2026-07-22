// ── CONFIG & UTILITIES ──
const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const IS_TOUCH = window.matchMedia('(pointer: coarse)').matches;
const lerp = (a, b, t) => a + (b - a) * t;

// ── LOADER ──
document.body.classList.add('hide-cursor');
let pct = 0;
const loader = document.getElementById('loader');
const loaderNum = document.getElementById('loader-num');
let loaded = false;
window.addEventListener('load', () => { loaded = true; });
const loadIv = setInterval(() => {
  if (!loaded && pct > 90) return;
  pct = Math.min(pct + Math.random() * 18, 100);
  loaderNum.textContent = Math.floor(pct) + '%';
  if (pct >= 100) {
    clearInterval(loadIv);
    setTimeout(() => loader.classList.add('hidden'), 250);
    setTimeout(() => {
      document.body.classList.remove('hide-cursor');
    }, 1300);
  }
}, 80);

// ── CURSOR — spring-damped dual element ──
const cur = document.getElementById('cursor');
const ring = document.getElementById('cursor-ring');

const mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
const dotPos = { x: mouse.x, y: mouse.y };
const ringPos = { x: mouse.x, y: mouse.y };

document.addEventListener('mousemove', e => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});

document.addEventListener('mousedown', () => document.body.classList.add('cursor-press'));
document.addEventListener('mouseup', () => document.body.classList.remove('cursor-press'));

function animCursor() {
  // Snappy dot
  dotPos.x = lerp(dotPos.x, mouse.x, 0.55);
  dotPos.y = lerp(dotPos.y, mouse.y, 0.55);
  // Lagging ring
  ringPos.x = lerp(ringPos.x, mouse.x, 0.15);
  ringPos.y = lerp(ringPos.y, mouse.y, 0.15);

  cur.style.transform = `translate3d(${dotPos.x}px, ${dotPos.y}px, 0) translate(-50%, -50%)`;
  ring.style.transform = `translate3d(${ringPos.x}px, ${ringPos.y}px, 0) translate(-50%, -50%)`;

  requestAnimationFrame(animCursor);
}
if (!IS_TOUCH) animCursor();

// ── GLOW-FOLLOW for cards (radial gradient tracking cursor) ──
function makeGlowFollow(el) {
  if (IS_TOUCH) return;
  el.addEventListener('mousemove', e => {
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    el.style.setProperty('--mx', x + '%');
    el.style.setProperty('--my', y + '%');
  });
  el.addEventListener('mouseleave', () => {
    el.style.setProperty('--mx', '50%');
    el.style.setProperty('--my', '0%');
  });
}
document.querySelectorAll('.project-card').forEach(makeGlowFollow);

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
let ticking = false;

window.addEventListener('scroll', () => {
  lastScroll = window.scrollY;
  if (!ticking) {
    window.requestAnimationFrame(() => {
      nav.classList.toggle('scrolled', lastScroll > 20);
      nav.classList.toggle('hidden-nav', lastScroll > 200 && lastScroll > nav.dataset.prevScroll + 5);
      if (lastScroll < nav.dataset.prevScroll - 5) nav.classList.remove('hidden-nav');
      nav.dataset.prevScroll = lastScroll;
      ticking = false;
    });
    ticking = true;
  }
});

const navLinksObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      document.querySelectorAll('.nav-links a').forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === '#' + e.target.id);
      });
    }
  });
}, { threshold: 0.2, rootMargin: "-100px 0px -50% 0px" });
document.querySelectorAll('section[id]').forEach(sec => navLinksObs.observe(sec));

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
      e.target.querySelectorAll('.skill-fill:not(.gauge-fill)').forEach(bar => {
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
    if (tiltCard.classList.contains('spin-3d')) return; // Don't tilt during spin
    const rect = tiltCard.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - .5;
    const y = (e.clientY - rect.top) / rect.height - .5;
    tiltCard.style.transform = `translateY(-8px) rotateY(${x*16}deg) rotateX(${-y*16}deg)`;
  });
  tiltCard.addEventListener('mouseleave', () => {
    if (tiltCard.classList.contains('spin-3d')) return;
    tiltCard.style.transform = '';
  });

  // ── 3-CLICK DIMENSION TOGGLE ──
  let cardClickCount = 0;
  let cardClickTimer = null;
  let isDimensionY = false;
  const clickHint = document.getElementById('card-click-hint');

  tiltCard.addEventListener('click', () => {
    cardClickCount++;

    // Reset timer — clicks must happen within 2s of each other
    clearTimeout(cardClickTimer);
    cardClickTimer = setTimeout(() => {
      cardClickCount = 0;
      tiltCard.classList.remove('click-1', 'click-2', 'click-3', 'click-4');
      if (clickHint) { clickHint.classList.remove('visible'); clickHint.textContent = ''; }
    }, 2000);

    // Remove previous glow classes
    tiltCard.classList.remove('click-1', 'click-2', 'click-3', 'click-4');

    if (cardClickCount < 3) {
      // Add escalating glow
      tiltCard.classList.add('click-' + cardClickCount);
      
      // Show hint
      if (clickHint) {
        clickHint.textContent = cardClickCount === 1 ? 'Switching...' : 'Keep going...';
        clickHint.classList.add('visible');
      }
    } else {
      // 3 clicks reached!
      cardClickCount = 0;
      clearTimeout(cardClickTimer);
      tiltCard.classList.remove('click-1', 'click-2', 'click-3', 'click-4');
      
      // Trigger interstellar effect
      document.body.classList.add('interstellar-active');
      
      // Wait for the singularity flash (around 2050ms) to swap backgrounds
      setTimeout(() => {
        if (isDimensionY) {
          document.body.classList.remove('dimension-y');
          isDimensionY = false;
          if (clickHint) { clickHint.textContent = 'Dimension X (Normal)'; }
        } else {
          document.body.classList.add('dimension-y');
          isDimensionY = true;
          if (clickHint) { clickHint.textContent = 'Dimension Y (Image)'; }
        }
        
        if (clickHint) {
          clickHint.classList.add('visible');
          setTimeout(() => {
            clickHint.classList.remove('visible');
          }, 1500);
        }
      }, 2050); // Swap background at the exact flash moment

      setTimeout(() => {
        document.body.classList.remove('interstellar-active');
      }, 3100);
    }
  });


  async function downloadSourceCode() {
    const overlay = document.getElementById('source-download-overlay');
    const bar = document.getElementById('source-download-bar');
    const status = document.getElementById('source-download-status');

    if (!overlay || typeof JSZip === 'undefined') {
      // Fallback if JSZip didn't load
      alert('Source code download is being prepared... Please try again.');
      isSpinning = false;
      return;
    }

    // Show overlay
    overlay.classList.add('active');

    const zip = new JSZip();
    const totalFiles = portfolioFiles.length;
    let fetched = 0;

    // Get the base URL of the current page
    const baseUrl = window.location.href.replace(/\/[^/]*$/, '/');

    for (const file of portfolioFiles) {
      try {
        if (status) status.textContent = `Fetching ${file.path}...`;

        const response = await fetch(baseUrl + encodeURIComponent(file.path));
        if (!response.ok) throw new Error(`Failed to fetch ${file.path}`);

        if (file.type === 'text') {
          const text = await response.text();
          zip.file(file.path, text);
        } else {
          const blob = await response.blob();
          zip.file(file.path, blob);
        }

        fetched++;
        const progress = Math.round((fetched / totalFiles) * 80); // 80% for fetching
        if (bar) bar.style.width = progress + '%';
      } catch (err) {
        console.warn(`Skipped ${file.path}:`, err.message);
        fetched++;
        const progress = Math.round((fetched / totalFiles) * 80);
        if (bar) bar.style.width = progress + '%';
      }
    }

    // Generate ZIP
    if (status) status.textContent = 'Compressing into ZIP...';
    if (bar) bar.style.width = '90%';

    try {
      const content = await zip.generateAsync({
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: { level: 6 }
      });

      if (bar) bar.style.width = '100%';
      if (status) status.textContent = 'Download starting...';

      // Trigger download
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'naveen-rg-portfolio-source.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Update overlay to show success
      if (status) status.textContent = '✓ Download complete!';
      const title = overlay.querySelector('.source-download-title');
      if (title) title.textContent = 'Source Code Downloaded!';
      const icon = overlay.querySelector('.source-download-icon');
      if (icon) icon.textContent = '✅';

    } catch (err) {
      console.error('ZIP generation failed:', err);
      if (status) status.textContent = 'Error generating ZIP. Try again.';
    }

    // Hide overlay after a moment
    setTimeout(() => {
      overlay.classList.remove('active');
      // Reset overlay text for next time
      setTimeout(() => {
        if (bar) bar.style.width = '0%';
        if (status) status.textContent = 'Fetching assets...';
        const title = overlay.querySelector('.source-download-title');
        if (title) title.textContent = 'Packaging Source Code...';
        const icon = overlay.querySelector('.source-download-icon');
        if (icon) icon.textContent = '📦';
        isSpinning = false;
      }, 500);
    }, 2000);
  }
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
if (luffyEl && timeline) {
  let timelineH = timeline.offsetHeight;
  window.addEventListener('resize', () => { timelineH = timeline.offsetHeight; });
  let luffyTicking = false;

  window.addEventListener('scroll', () => {
    if (!luffyTicking) {
      window.requestAnimationFrame(() => {
        const rect = timeline.getBoundingClientRect();
        const viewH = window.innerHeight;
        const progress = Math.min(Math.max((viewH - rect.top) / (timelineH + viewH), 0), 1);
        const luffyTop = progress * (timelineH - 40);
        luffyEl.style.top = luffyTop + 'px';

        luffyTicking = false;
      });
      luffyTicking = true;
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
      bgmIcon.innerHTML = '🎵';
    } else {
      bgm.play().catch(e => console.log('Playback prevented', e));
      bgmIcon.innerHTML = '<img src="assets/images/play_button_ncs.gif" alt="Playing" class="bgm-playing-gif">';
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

      // Switch track and ensure it plays when selected
      bgm.pause();
      bgm.src = src;
      bgm.load();

      bgm.play().then(() => {
        isPlaying = true;
        bgmIcon.innerHTML = '<img src="assets/images/play_button_ncs.gif" alt="Playing" class="bgm-playing-gif">';
      }).catch(e => console.log('Playback prevented', e));

      // Show the wave for 1.5s before closing
      setTimeout(() => {
        closePicker();
      }, 1500);
    });
  });

  // Close picker when clicking outside
  document.addEventListener('click', (e) => {
    if (!songPicker.contains(e.target) && !bgmBtn.contains(e.target)) {
      closePicker();
    }
  });
}

// ── RESUME MODAL ──
const resumeBtn = document.getElementById('resume-btn');
const resumeModal = document.getElementById('resume-modal');
const resumeModalClose = document.getElementById('resume-modal-close');

if (resumeBtn && resumeModal && resumeModalClose) {
  resumeBtn.addEventListener('click', (e) => {
    e.preventDefault();
    resumeModal.classList.add('active');
  });

  resumeModalClose.addEventListener('click', () => {
    resumeModal.classList.remove('active');
  });

  resumeModal.addEventListener('click', (e) => {
    if (e.target === resumeModal) {
      resumeModal.classList.remove('active');
    }
  });
}

// ── PROJECT CARD 3D TILT — subtle ──
if (!IS_TOUCH && !REDUCED_MOTION) {
  document.querySelectorAll('.project-card').forEach(card => {
    let raf = null;
    let tRX = 0, tRY = 0, cRX = 0, cRY = 0;
    let active = false;

    function loop() {
      cRX = lerp(cRX, tRX, 0.1);
      cRY = lerp(cRY, tRY, 0.1);
      card.style.transform = `translateY(-10px) perspective(800px) rotateY(${cRY}deg) rotateX(${cRX}deg)`;
      if (active || Math.abs(tRX - cRX) > 0.01 || Math.abs(tRY - cRY) > 0.01) {
        raf = requestAnimationFrame(loop);
      } else {
        raf = null;
        card.style.transform = '';
      }
    }

    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      tRY = x * 6;
      tRX = -y * 6;
      active = true;
      if (!raf) loop();
    });

    card.addEventListener('mouseleave', () => {
      tRX = 0; tRY = 0; active = false;
      if (!raf) loop();
    });
  });
}