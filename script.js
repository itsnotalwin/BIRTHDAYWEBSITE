/* ═══════════════════════════════════════════════════════════
   22 — MEMORY VAULT  |  script.js
   All interactions, secrets, audio, animations, room
═══════════════════════════════════════════════════════════ */

'use strict';

/* ── STATE ── */
const STATE = {
  found: new Set(),
  total: 22,
  soundOn: false,
  theme: 0,
  themes: ['', 'theme-warm', 'theme-cold', 'theme-void', 'theme-bloom'],
  themeIdx: 0,
  roomUnlocked: false,
  audioCtx: null,
};

/* ── DOM SHORTCUTS ── */
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => [...document.querySelectorAll(sel)];

/* ══════════════════════════════════════
   BOOT SEQUENCE
══════════════════════════════════════ */
function runBoot() {
  const lines = $$('.boot-line');
  lines.forEach(line => {
    const d = parseInt(line.getAttribute('data-d') || 0);
    setTimeout(() => line.classList.add('show'), d);
  });

  $('#open-vault-btn').addEventListener('click', enterVault);
}

function enterVault() {
  // Trigger glitch
  const g = $('#glitch-overlay');
  g.classList.add('go');

  // Fade out boot
  const boot = $('#boot-screen');
  setTimeout(() => {
    boot.classList.add('out');
    setTimeout(() => {
      boot.style.display = 'none';
      g.classList.remove('go');
    }, 700);
  }, 100);

  // Show vault
  const vault = $('#vault');
  vault.classList.remove('hidden');
  setTimeout(() => vault.classList.add('show'), 200);

  // Show progress bar
  setTimeout(() => $('#progress-bar-wrap').classList.add('show'), 600);
  // Show floating secret counter
  setTimeout(() => {
    const counter = $('#secret-counter');
    if (counter) counter.classList.add('show');
  }, 900);

  // Start timestamp
  startTimestamp();

  // Build stars
  buildStarField();

  // Build particles
  buildParticles();

  // Build floating petals
  buildPetals();

  // Random confetti cannon
  scheduleConfetti();

  // Draw grain
  drawGrain();

  // Build room wall (empty until images added)
  buildRoomWall();

  // Init scroll observer
  initScrollObserver();

  // Init all secrets
  initSecrets();

  // Init draggable
  initDraggable();

  // Init sound
  initSound();
}

/* ── TIMESTAMP ── */
function startTimestamp() {
  const el = $('#timestamp');
  function tick() {
    const n = new Date();
    const pad = x => String(x).padStart(2,'0');
    el.textContent = `${n.getFullYear()}.${pad(n.getMonth()+1)}.${pad(n.getDate())} ${pad(n.getHours())}:${pad(n.getMinutes())}:${pad(n.getSeconds())}`;
  }
  tick();
  setInterval(tick, 1000);
}

/* ══════════════════════════════════════
   GRAIN CANVAS
══════════════════════════════════════ */
function drawGrain() {
  const canvas = $('#grain-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let frame;

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  function renderGrain() {
    const { width, height } = canvas;
    const img = ctx.createImageData(width, height);
    const d = img.data;
    for (let i = 0; i < d.length; i += 4) {
      const v = Math.random() * 255 | 0;
      d[i] = d[i+1] = d[i+2] = v;
      d[i+3] = 12; // very subtle
    }
    ctx.putImageData(img, 0, 0);
    frame = requestAnimationFrame(renderGrain);
  }
  renderGrain();
}

/* ══════════════════════════════════════
   STAR FIELD (hidden clickable stars)
══════════════════════════════════════ */
const STAR_COMPLIMENTS = [
  "oh my god you look SO good today. like actually??",
  "your eyes are genuinely gorgeous. criminal.",
  "you have THE best laugh. it makes everyone else laugh too.",
  "okay but can we talk about how pretty you are?? hello??",
  "your smile literally lights up every single room. not exaggerating.",
  "you have such a good heart. genuinely one of the best people i know.",
  "the way you carry yourself?? confident energy. obsessed.",
  "you're THAT girl and i need you to know it.",
  "your vibe is immaculate. everyone feels it when you walk in.",
  "you smell good and your hair always looks great and it's annoying.",
  "your taste in everything is just... chef's kiss. impeccable.",
  "you make being you look so effortless. iconic behaviour.",
  "i love the way your brain works. genuinely so interesting to talk to.",
  "you are so much funnier than most people. unfair advantage.",
  "your skin is glowing and you need to take that compliment.",
  "the way you dress?? always. every time. nailed it.",
  "you have such a warm presence. people feel safe around you.",
  "best friend of the century. not up for debate.",
  "you are literally so beautiful it's embarrassing for the rest of us.",
  "the world is genuinely better with you in it. i mean every word.",
  "you've grown so much and you still don't fully see it. i do.",
  "your confidence lately? everything. we love to see it.",
  "okay but your personality is actually unmatched. where did you come from.",
  "you are SO loved. by so many people. don't forget that.",
  "there is genuinely nobody like you and that's the highest compliment.",
  "you give the best hugs and that's a skill not everyone has.",
  "the way you care about people? rare. really genuinely rare.",
  "you are that girl. you have always been that girl.",
  "every single person who gets to know you is lucky. including me.",
  "i think about how proud i am of you more than you know.",
  "you turned your worst chapters into your best traits. that's everything.",
  "your energy is addictive. people want to be around you always.",
  "you are beautiful on your worst days too. just so you know.",
  "i could brag about you to strangers and honestly? i have.",
  "you have main character energy and i will not be taking questions.",
  "the version of you right now? my favourite era so far.",
  "you deserve every good thing that's coming. and a lot is coming.",
  "your determination is actually kind of terrifying. in the best way.",
  "god i'm so glad you exist. genuinely. what a world with you in it.",
  "you are too hard on yourself. the rest of us can see how amazing you are.",
  "that thing you're insecure about? nobody else even notices. they're too busy thinking you're gorgeous.",
  "you radiate warmth and people are drawn to it. it's a superpower.",
  "okay but real talk — you're one of the most beautiful people i've ever met.",
  "the way you love people? it changes them. it changed me.",
  "you have no idea the impact you have. i wish you could see what i see.",
  "soft and strong at the same time. that's hard to pull off. you do it.",
  "i am so honoured to know you. i don't say that lightly.",
  "you're going to look back at this chapter and realise how much you were glowing.",
  "cuteness.exe is running perfectly. zero errors detected. 🌹",
  "paige. you are so incredibly loved. i hope you feel it today.",
];

function buildStarField() {
  const field = $('#star-field');
  if (!field) return;

  // 50 big dark floating clickable compliment stars
  const positions = [];
  for (let i = 0; i < 50; i++) {
    // Spread them across the full scroll height (300vh) and full width
    let x, y, attempts = 0;
    do {
      x = 3 + Math.random() * 94;
      y = 2 + Math.random() * 296;
      attempts++;
    } while (attempts < 20 && positions.some(p => Math.abs(p.x-x)<6 && Math.abs(p.y-y)<6));
    positions.push({x, y});

    const star = document.createElement('div');
    star.className = 'star clickable-star';
    const size = 5 + Math.random() * 5;
    const compliment = STAR_COMPLIMENTS[i % STAR_COMPLIMENTS.length];
    star.style.cssText = `
      width:${size}px; height:${size}px;
      left:${x}%;
      top:${y}vh;
      --star-dur:${3 + Math.random()*4}s;
      --star-delay:${-Math.random()*4}s;
      --star-drift:${(Math.random()-0.5)*12}px;
    `;
    star.addEventListener('click', (e) => {
      e.stopPropagation();
      handleStarClick(compliment, star);
    });
    field.appendChild(star);
  }
}

function handleStarClick(compliment, starEl) {
  if (starEl.classList.contains('used')) return;
  starEl.classList.add('used');
  playChime();
  emitParticleBurst(
    starEl.getBoundingClientRect().left + starEl.offsetWidth/2,
    starEl.getBoundingClientRect().top  + starEl.offsetHeight/2
  );
  showModal(`<span class="m-label">🌟 just for you</span><p>${compliment}</p>`);
  setTimeout(() => starEl.classList.remove('used'), 5000);
}

/* ══════════════════════════════════════
   PARTICLES
══════════════════════════════════════ */
function buildParticles() {
  const field = $('#particles');
  for (let i = 0; i < 20; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const size = Math.random() * 2 + 0.5;
    p.style.cssText = `
      width:${size}px; height:${size}px;
      left:${Math.random()*100}%;
      bottom: ${Math.random()*30}px;
      --pd:${7 + Math.random()*8}s;
      --pdelay:${-Math.random()*8}s;
      --px-drift:${(Math.random()-0.5)*40}px;
    `;
    field.appendChild(p);
  }
}

function emitParticleBurst(x, y) {
  const field = $('#particles');
  for (let i = 0; i < 8; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const size = Math.random() * 3 + 1;
    p.style.cssText = `
      width:${size}px; height:${size}px;
      left:${x}px; top:${y}px; bottom:auto;
      position:fixed; z-index:9100;
      --pd:${1 + Math.random()}s;
      --pdelay:0s;
      --px-drift:${(Math.random()-0.5)*60}px;
    `;
    field.appendChild(p);
    setTimeout(() => p.remove(), 2000);
  }
}

/* ══════════════════════════════════════
   FLOATING PETALS
══════════════════════════════════════ */
const PETAL_COLORS = ['#f5c2d3','#e8a5b8','#ffd6e8','#ffb3cc','#f9d4e1','#fce4ec'];
const PETAL_SVG = (color) => `<svg viewBox="0 0 20 24" xmlns="http://www.w3.org/2000/svg">
  <path d="M10 2 C14 2, 18 6, 18 11 C18 17, 14 22, 10 22 C6 22, 2 17, 2 11 C2 6, 6 2, 10 2Z"
    fill="${color}" opacity="0.85"/>
  <path d="M10 2 C10 2, 10 12, 10 22" stroke="${color}" stroke-width="0.5" opacity="0.4" fill="none"/>
</svg>`;

function buildPetals() {
  const field = $('#petal-field');
  if (!field) return;
  const count = 18;
  for (let i = 0; i < count; i++) {
    spawnPetal(field, i * (14000 / count));
  }
}

function spawnPetal(field, initialDelay) {
  const color = PETAL_COLORS[Math.floor(Math.random() * PETAL_COLORS.length)];
  const size  = 10 + Math.random() * 14;
  const left  = Math.random() * 100;
  const dur   = 9 + Math.random() * 10;
  const sway  = (Math.random() - 0.5) * 100;
  const rot0  = Math.random() * 360;
  const rot1  = rot0 + 180 + Math.random() * 180;
  const op    = 0.35 + Math.random() * 0.35;

  const petal = document.createElement('div');
  petal.className = 'petal';
  petal.innerHTML = PETAL_SVG(color);
  petal.style.cssText = `
    --ps:${size}px;
    --pf-dur:${dur}s;
    --pf-delay:${initialDelay}ms;
    --pf-sway:${dur * 0.4}s;
    --pf-swing:${sway}px;
    --pr0:${rot0}deg;
    --pr1:${rot1}deg;
    --pf-op:${op};
    left:${left}%;
  `;
  field.appendChild(petal);

  // Recycle petal after each cycle
  petal.addEventListener('animationiteration', () => {
    petal.style.left = Math.random() * 100 + '%';
  });
}

/* ══════════════════════════════════════
   CONFETTI CANNON
══════════════════════════════════════ */
const CONFETTI_COLORS = [
  '#f5c2d3','#e8a5b8','#d97b99','#c4668a',
  '#ffd6e8','#ffb3cc','#a8d5ba','#c9f0d8',
  '#ffe8cc','#ffd4e5','#f9d4e1'
];

function fireConfetti(originX) {
  const cx = originX !== undefined ? originX : (30 + Math.random() * 40);
  const count = 38 + Math.floor(Math.random() * 22);

  for (let i = 0; i < count; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    const color = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
    const isCircle = Math.random() > 0.6;
    const w = isCircle ? 6 + Math.random() * 5 : 5 + Math.random() * 8;
    const h = isCircle ? w : 4 + Math.random() * 7;
    const vx = (Math.random() - 0.5) * 260;
    const rot = (Math.random() - 0.5) * 900;
    const dur = 1.8 + Math.random() * 1.2;
    const delay = Math.random() * 0.25;

    piece.style.cssText = `
      --cy: -5px;
      --cx: ${cx}%;
      --cw: ${w}px;
      --ch: ${h}px;
      --cc: ${color};
      --cbr: ${isCircle ? '50%' : '2px'};
      --cvx: ${vx}px;
      --crot: ${rot}deg;
      --cd: ${dur}s;
      --cdelay: ${delay}s;
    `;
    document.body.appendChild(piece);
    setTimeout(() => piece.remove(), (dur + delay + 0.3) * 1000);
  }
}

function scheduleConfetti() {
  // Fire once shortly after vault opens
  setTimeout(() => fireConfetti(50), 3500);

  // Then randomly every 35-65 seconds
  function randomFire() {
    fireConfetti(20 + Math.random() * 60);
    setTimeout(randomFire, 35000 + Math.random() * 30000);
  }
  setTimeout(randomFire, 40000);
}

/* ══════════════════════════════════════
   PROGRESS SYSTEM
══════════════════════════════════════ */
function markFound(id) {
  const key = String(id);
  if (STATE.found.has(key)) return;
  STATE.found.add(key);

  // Mark DOM element
  const el = $(`#s${key}`) || $(`[data-secret="${key}"]`);
  if (el) el.classList.add('found');

  // Update progress bar
  const count = STATE.found.size;
  const pct   = (count / STATE.total) * 100;
  $('#progress-fill').style.width = pct + '%';
  $('#progress-count').textContent = `${count} / ${STATE.total}`;

  // Update floating secret counter
  const scFound = $('#sc-found');
  const counter = $('#secret-counter');
  if (scFound) scFound.textContent = count;
  if (counter) {
    counter.classList.remove('pop');
    void counter.offsetWidth; // reflow to restart animation
    counter.classList.add('pop');
    counter.classList.add('show');
  }

  // Warmth level
  const warm = Math.min(4, Math.floor(count / 6));
  document.body.className = document.body.className.replace(/warmth-\d/,'');
  if (warm > 0) document.body.classList.add(`warmth-${warm}`);

  // Unlock room door at 10 secrets
  if (count >= 10 && !STATE.roomUnlocked) {
    STATE.roomUnlocked = true;
    const door = $('#room-door');
    if (door) {
      door.classList.add('show');
      // little pulse to draw attention
      setTimeout(() => door.classList.add('pulse'), 800);
    }
  }

  // All 22 found — counter only, room triggers the actual reveal

  playPing();
}

/* ══════════════════════════════════════
   SECRET INITIALISATION
══════════════════════════════════════ */
function initSecrets() {

  /* ── S1: Hover caption reveal → click for modal ── */
  const s1 = $('#s1');
  if (s1) s1.addEventListener('click', () => {
    markFound(1);
    showModal(`<span class="m-label">memory_01 / observation</span>
    <p>the version of you that existed before you stopped apologising for taking up space was already incredible.<br><br>the version after? unfair.</p>`);
  });

  /* ── S2: Double-click to flip (single tap on touch) ── */
  const s2 = $('#s2');
  if (s2) {
    const isTouchDevice = () => window.matchMedia('(hover: none)').matches;
    s2.addEventListener('dblclick', (e) => {
      e.preventDefault();
      s2.classList.toggle('flipped');
      markFound(2);
    });
    s2.addEventListener('click', () => {
      if (isTouchDevice()) {
        s2.classList.toggle('flipped');
        markFound(2);
      } else if (!s2.classList.contains('flipped') && !STATE.found.has('2')) {
        s2.querySelector('.pol-caption').textContent = 'double-click me! ↺';
      }
    });
  }

  /* ── S3: VHS glitch + secret ── */
  const s3 = $('#s3');
  if (s3) s3.addEventListener('click', () => {
    markFound(3);
    triggerVHS();
    setTimeout(() => {
      showModal(`<span class="m-label">fragment_03 / vhs_recovered</span>
      <p>you in your era of giving zero f*cks was one of the best things i've ever watched happen to a person in real time.</p>`);
    }, 800);
  });

  /* ── S4: Float + audio ping on click ── */
  const s4 = $('#s4');
  if (s4) s4.addEventListener('click', () => {
    markFound(4);
    playChime();
    showModal(`<span class="m-label">memory_04 / sound</span>
    <p>the laugh that makes other people start laughing. you don't realise you do it. you've never realised.</p>`);
  });

  /* ── S5: Shake then reveal note ── */
  const s5 = $('#s5');
  if (s5) s5.addEventListener('click', () => {
    s5.classList.add('pol-shaking');
    playRumble();
    setTimeout(() => {
      s5.classList.remove('pol-shaking');
      markFound(5);
      showModal(`<span class="m-label">memory_05 / shaken_loose</span>
      <p>you've shaken off more than i know about. i know that much. and you still show up every time. still you.</p>`);
    }, 550);
  });

  /* ── S6–S10: Folder open/close ── */
  ['s6','s7','s8','s9','s10'].forEach(id => {
    const el = $(`#${id}`);
    if (!el) return;
    el.addEventListener('click', () => {
      const wasOpen = el.classList.contains('open');
      el.classList.toggle('open');
      if (!wasOpen) { markFound(id.replace('s','')); playTick(); }
    });
  });

  /* ── S11: Invisible note — hover reveals, click marks ── */
  const s11 = $('#s11');
  if (s11) s11.addEventListener('click', () => { markFound(11); playTick(); });

  /* ── S12: Typewriter on click ── */
  const s12 = $('#s12');
  if (s12) s12.addEventListener('click', () => {
    if (!STATE.found.has('12')) {
      markFound(12);
      typewrite(s12.querySelector('.tw-output'),
        "you have this thing where you make everyone around you feel like the most important person in the room. you do it without trying. it's a gift and you give it for free.",
        38
      );
    }
  });

  /* ── S13: Password unlock ── */
  const s13input = $('#s13-input');
  const ANSWERS_13 = ['chips', 'fries', 'mcdonalds', 'mcdonald', 'mcds', 'kfc', 'pizza', 'nandos', 'nando', 'nuggets', 'burger', 'pap', 'ramen', 'sushi', 'bunny chow', 'bunny'];
  if (s13input) {
    s13input.addEventListener('keydown', e => {
      if (e.key === 'Enter') checkPassword13();
    });
    s13input.addEventListener('click', e => e.stopPropagation());
  }
  function checkPassword13() {
    const val = (s13input.value || '').toLowerCase().trim();
    if (ANSWERS_13.some(a => val.includes(a))) {
      markFound(13);
      const locked   = document.querySelector('#s13 .s13-locked');
      const unlocked = document.querySelector('#s13 .s13-unlocked');
      if (locked)   locked.classList.add('hidden');
      if (unlocked) unlocked.classList.remove('hidden');
      playChime();
    } else {
      s13input.style.borderBottomColor = '#c43030';
      setTimeout(() => s13input.style.borderBottomColor = '', 800);
      playError();
    }
  }
  const s13 = $('#s13');
  if (s13) s13.addEventListener('click', e => {
    if (e.target !== s13input) s13input && s13input.focus();
  });

  /* ── S14: Draggable — drag 80px to unlock ── */
  // Handled by initDraggable()

  /* ── S15: Triggers Win98 error popup ── */
  const s15 = $('#s15');
  if (s15) s15.addEventListener('click', () => {
    markFound(15);
    showWin98Error("cuteness.exe has encountered a fatal error.\n\n\"Paige overflow detected.\nSystem cannot process this level\nof charm and resilience.\"\n\nPlease restart your heart.\nError code: TOO_MUCH_HER");
  });

  /* ── S16: Theme changer ── */
  const s16 = $('#s16');
  if (s16) s16.addEventListener('click', () => {
    markFound(16);
    STATE.themeIdx = (STATE.themeIdx + 1) % STATE.themes.length;
    const body = document.body;
    STATE.themes.forEach(t => { if (t) body.classList.remove(t); });
    if (STATE.themes[STATE.themeIdx]) body.classList.add(STATE.themes[STATE.themeIdx]);
    playPing();
  });

  /* ── S17: Distortion ── */
  const s17 = $('#s17');
  if (s17) s17.addEventListener('click', () => {
    markFound(17);
    triggerDistortion();
    setTimeout(() => {
      showModal(`<span class="m-label">observation_17 / verified</span>
      <p>you are not who you were two years ago. not even close. the glow-up has been physical, mental, emotional, and honestly a little bit rude to the rest of us.</p>`);
    }, 900);
  });

  /* ── S18: Cinematic overlay ── */
  const s18 = $('#s18');
  if (s18) s18.addEventListener('click', () => {
    markFound(18);
    showCinematic("i don't know when exactly you went from figuring it out\n\nto actually living it.\n\nbut i was there.\n\nand it looked like something worth remembering.");
  });

  /* ── S19: Background colour bleed ── */
  const s19 = $('#s19');
  if (s19) s19.addEventListener('click', () => {
    markFound(19);
    triggerBgBleed();
    showModal(`<span class="m-label">memory_bleed.tmp</span>
    <p>i don't know exactly when it happened. the shift. but one day you just... landed. you became someone who felt settled in themselves. watching that happen from the outside? quietly one of my favourite things.</p>`);
  });

  /* ── S20: Chaos — everything flies ── */
  const s20 = $('#s20');
  if (s20) s20.addEventListener('click', () => {
    markFound(20);
    triggerChaos();
  });

  /* ── S21: Corrupted file icon ── */
  const s21 = $('#s21');
  if (s21) s21.addEventListener('click', () => {
    markFound(21);
    playError();
    setTimeout(() => {
      showModal(`<span class="m-label">UNKNOWN_DATA.fragment / decrypted</span>
      <p>this file was corrupted. but the core message survived:<br><br>you are not a work in progress. you are already the work. you are already the point.</p>`);
    }, 600);
    // glitch the icon
    s21.querySelector('.fi-icon').style.animation = 'corrupt 0.3s steps(2) 4';
    setTimeout(() => s21.querySelector('.fi-icon').style.animation = '', 1500);
  });

  /* ── S21b (chain): Cinematic → unlocks s22 zone ── */
  const s21b = $('#s21b');
  if (s21b) s21b.addEventListener('click', () => {
    markFound('21b');
    showCinematic("there was a moment.\n\nyou probably don't even remember it.\n\nbut everything changed.\n\nand i saw it.");
  });

  /* ── S22: The tiny dot — opens the room ── */
  const s22 = $('#s22-dot');
  if (s22) s22.addEventListener('click', () => {
    markFound(22);
    playChime();
    setTimeout(() => openRoom(), 600);
  });

  /* ── Scroll-triggered poems ── */
  initScrollObserver();
}

/* ══════════════════════════════════════
   DRAGGABLE (S14)
══════════════════════════════════════ */
function initDraggable() {
  const el = $('#s14');
  if (!el) return;

  let isDragging = false;
  let startX, startY, origX, origY, moved = false;

  function getPos(e) {
    return e.touches ? { x: e.touches[0].clientX, y: e.touches[0].clientY }
                     : { x: e.clientX, y: e.clientY };
  }

  el.addEventListener('mousedown', startDrag);
  el.addEventListener('touchstart', startDrag, { passive: false });

  function startDrag(e) {
    if (e.target.tagName === 'INPUT') return;
    isDragging = true;
    const pos = getPos(e);
    startX = pos.x; startY = pos.y;
    const rect = el.getBoundingClientRect();
    origX = rect.left; origY = rect.top;
    el.style.zIndex = 500;
    el.style.transition = 'none';
    e.preventDefault();
  }

  document.addEventListener('mousemove', onDrag);
  document.addEventListener('touchmove', onDrag, { passive: false });

  function onDrag(e) {
    if (!isDragging) return;
    e.preventDefault();
    const pos = getPos(e);
    const dx = pos.x - startX;
    const dy = pos.y - startY;
    el.style.transform = `rotate(calc(var(--sr, 0deg) + ${dx * 0.05}deg)) translate(${dx}px, ${dy}px)`;

    const dist = Math.sqrt(dx*dx + dy*dy);
    if (dist > 80 && !moved) {
      moved = true;
      markFound(14);
      playPing();
      const hidden = el.querySelector('.s14-hidden');
      if (hidden) hidden.classList.remove('hidden');
      el.querySelector('.s-label').textContent = 'found it.';
    }
  }

  document.addEventListener('mouseup',  stopDrag);
  document.addEventListener('touchend', stopDrag);

  function stopDrag() {
    if (!isDragging) return;
    isDragging = false;
    el.style.transition = '';
    el.style.zIndex = '';
    // Snap back if not far enough
    if (!moved) {
      el.style.transform = `rotate(var(--sr, 0deg))`;
    }
  }
}

/* ══════════════════════════════════════
   TYPEWRITER
══════════════════════════════════════ */
function typewrite(el, text, speed = 35) {
  if (!el) return;
  el.textContent = '';
  let i = 0;
  const timer = setInterval(() => {
    if (i < text.length) {
      el.textContent += text[i++];
    } else {
      clearInterval(timer);
    }
  }, speed);
}

/* ══════════════════════════════════════
   SCROLL OBSERVER
══════════════════════════════════════ */
function initScrollObserver() {
  const items = $$('.reveal-scroll');
  if (!items.length) return;

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.25 });

  items.forEach(el => obs.observe(el));

  // Also alias sp to reveal-scroll
  $$('.sp').forEach(el => {
    el.classList.add('reveal-scroll');
    obs.observe(el);
  });
}

/* ══════════════════════════════════════
   MODAL
══════════════════════════════════════ */
function showModal(html) {
  const overlay = $('#modal-overlay');
  const content = $('#modal-content');
  if (!overlay || !content) return;

  // Save scroll position so page doesn't jump
  const scrollY = window.scrollY;
  content.innerHTML = html;
  overlay.classList.remove('hidden');
  // Restore scroll position after DOM update
  requestAnimationFrame(() => window.scrollTo(0, scrollY));

  $('#modal-close').onclick = closeModal;
  overlay.onclick = (e) => { if (e.target === overlay) closeModal(); };
  document.addEventListener('keydown', escModal);
}

function closeModal() {
  const scrollY = window.scrollY;
  $('#modal-overlay').classList.add('hidden');
  requestAnimationFrame(() => window.scrollTo(0, scrollY));
  document.removeEventListener('keydown', escModal);
}

function escModal(e) { if (e.key === 'Escape') closeModal(); }

/* ══════════════════════════════════════
   VHS EFFECT
══════════════════════════════════════ */
function triggerVHS() {
  const overlay = $('#vhs-overlay');
  if (!overlay) return;
  overlay.classList.remove('hidden');
  document.body.classList.add('vhs-active');

  let tc = 0;
  const tcEl = $('#vhs-tc');
  const tcTimer = setInterval(() => {
    tc++;
    if (tcEl) tcEl.textContent = `00:00:${String(tc).padStart(2,'0')}`;
  }, 200);

  setTimeout(() => {
    overlay.classList.add('hidden');
    document.body.classList.remove('vhs-active');
    clearInterval(tcTimer);
  }, 1800);
}

/* ══════════════════════════════════════
   CINEMATIC OVERLAY
══════════════════════════════════════ */
function showCinematic(text) {
  const overlay  = $('#cinematic-overlay');
  const textEl   = $('#cinematic-text');
  if (!overlay || !textEl) return;

  const scrollY = window.scrollY;
  textEl.innerHTML = text.split('\n').map(l => l ? `<span>${l}</span>` : `<br>`).join('');
  overlay.classList.remove('hidden');
  requestAnimationFrame(() => window.scrollTo(0, scrollY));

  setTimeout(() => {
    overlay.classList.add('hidden');
    requestAnimationFrame(() => window.scrollTo(0, scrollY));
  }, 5800);
}

/* ══════════════════════════════════════
   WIN98 ERROR
══════════════════════════════════════ */
function showWin98Error(msg) {
  const popup = $('#win98-error');
  const msgEl = $('#w98-msg');
  if (!popup || !msgEl) return;

  msgEl.innerHTML = msg.replace(/\n/g, '<br>');
  popup.classList.remove('hidden');
  playError();

  const closeIt = () => popup.classList.add('hidden');
  $('#w98-close').onclick = closeIt;
  $('#w98-ok').onclick    = closeIt;
}

/* ══════════════════════════════════════
   DISTORTION
══════════════════════════════════════ */
function triggerDistortion() {
  document.body.classList.add('distorting');
  setTimeout(() => document.body.classList.remove('distorting'), 800);
}

/* ══════════════════════════════════════
   BG COLOUR BLEED
══════════════════════════════════════ */
function triggerBgBleed() {
  document.body.style.transition = 'background-color 0.5s ease';
  document.body.style.backgroundColor = '#f0c8d8';
  setTimeout(() => {
    document.body.style.backgroundColor = '';
    setTimeout(() => document.body.style.transition = '', 1000);
  }, 2500);
}

/* ══════════════════════════════════════
   CHAOS (everything flies)
══════════════════════════════════════ */
function triggerChaos() {
  const chaosable = $$('.polaroid.secret, .sticky, .folder, .file-icon');
  chaosable.forEach(el => {
    const fx = (Math.random() - 0.5) * 120;
    const fy = (Math.random() - 0.5) * 80;
    el.style.setProperty('--cfx', fx + 'px');
    el.style.setProperty('--cfy', fy + 'px');
    el.classList.add('chaosing');
  });

  playRumble();

  // Shake screen
  triggerDistortion();

  setTimeout(() => {
    chaosable.forEach(el => el.classList.remove('chaosing'));
    showModal(`<span class="m-label">chaos / survived</span>
    <p>see? even when everything flies around and nothing makes sense — you still come back to exactly where you're supposed to be.<br><br>that's you. every time.</p>`);
  }, 1500);
}

/* ══════════════════════════════════════
   THE ROOM
══════════════════════════════════════ */
function buildRoomWall() {
  const wall = $('#room-wall');
  if (!wall) return;

  // Images: assets/room/r01.jpg through r10.jpg
  // If image fails to load, show placeholder
  const count = 10;
  const rotations = [-4, 3, -2, 5, -6, 2, -3, 4, -1, 3];

  for (let i = 1; i <= count; i++) {
    const num   = String(i).padStart(2, '0');
    const rot   = rotations[i - 1] || 0;
    const pol   = document.createElement('div');
    pol.className = 'room-pol';
    pol.style.setProperty('--rp-r', rot + 'deg');

    pol.innerHTML = `
      <div class="room-tape" style="--rt-r:${(Math.random()-0.5)*3}deg"></div>
      <img src="assets/room/r${num}.jpg" alt="photo ${i}"
           onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'"/>
      <div class="room-placeholder" style="display:none">
        <span>r${num}.jpg</span>
      </div>
    `;

    pol.addEventListener('click', () => {
      // Lightbox-style zoom
      pol.style.zIndex = '999';
    });

    wall.appendChild(pol);
  }
}

$('#room-door') && $('#room-door').addEventListener('click', openRoom);
$('#close-room') && $('#close-room').addEventListener('click', closeRoom);

function openRoom() {
  const room = $('#the-room');
  if (!room) return;
  // Two-step for iOS: remove hidden first, then add open after a frame
  room.classList.remove('hidden');
  room.style.opacity = '0';
  room.style.display = 'block';
  setTimeout(() => {
    room.style.transition = 'opacity 0.9s ease';
    room.style.opacity = '1';
    room.classList.add('open');
  }, 30);
  document.body.style.overflow = 'hidden';
  document.body.style.position = 'fixed';
  document.body.style.width = '100%';

  // Trigger the final reveal after she has a moment in the room
  setTimeout(() => triggerFinalReveal(), 3500);
}
function closeRoom() {
  const room = $('#the-room');
  if (!room) return;
  room.style.opacity = '0';
  room.classList.remove('open');
  setTimeout(() => {
    room.style.display = 'none';
    room.classList.add('hidden');
    room.style.opacity = '';
    room.style.transition = '';
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.width = '';
  }, 900);
}

/* ══════════════════════════════════════
   SOUND ENGINE (Web Audio API — no files)
══════════════════════════════════════ */
function initSound() {
  const btn = $('#sound-toggle');
  if (!btn) return;
  btn.addEventListener('click', toggleSound);
}

function toggleSound() {
  STATE.soundOn = !STATE.soundOn;
  const btn = $('#sound-toggle');
  btn.classList.toggle('muted', !STATE.soundOn);
  $('#sound-on-icon').classList.toggle('hidden', !STATE.soundOn);
  $('#sound-off-icon').classList.toggle('hidden', STATE.soundOn);

  if (STATE.soundOn && !STATE.audioCtx) {
    STATE.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    startAmbient();
  } else if (STATE.soundOn && STATE.audioCtx?.state === 'suspended') {
    STATE.audioCtx.resume();
  } else if (!STATE.soundOn && STATE.audioCtx) {
    STATE.audioCtx.suspend();
  }
}

function getAudio() {
  if (!STATE.soundOn) return null;
  if (!STATE.audioCtx) STATE.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return STATE.audioCtx;
}

function startAmbient() {
  const ctx = getAudio();
  if (!ctx) return;
  // Very soft ambient hum
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.value = 60;
  gain.gain.setValueAtTime(0, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(0.025, ctx.currentTime + 3);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
}

function playPing() {
  const ctx = getAudio();
  if (!ctx) return;
  const osc  = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.frequency.value = 880;
  osc.type = 'sine';
  gain.gain.setValueAtTime(0.15, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.65);
}

function playChime() {
  const ctx = getAudio();
  if (!ctx) return;
  [523, 659, 784, 1047].forEach((freq, i) => {
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.value = freq;
    const t = ctx.currentTime + i * 0.12;
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.12, t + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.8);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.85);
  });
}

function playTick() {
  const ctx = getAudio();
  if (!ctx) return;
  const buf = ctx.createBuffer(1, ctx.sampleRate * 0.04, ctx.sampleRate);
  const d   = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
  const src  = ctx.createBufferSource();
  const gain = ctx.createGain();
  src.buffer = buf;
  gain.gain.value = 0.25;
  src.connect(gain);
  gain.connect(ctx.destination);
  src.start();
}

function playRumble() {
  const ctx = getAudio();
  if (!ctx) return;
  const buf = ctx.createBuffer(1, ctx.sampleRate * 0.3, ctx.sampleRate);
  const d   = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length) * 0.5;
  const src    = ctx.createBufferSource();
  const gain   = ctx.createGain();
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 200;
  gain.gain.value = 0.4;
  src.buffer = buf;
  src.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  src.start();
}

function playError() {
  const ctx = getAudio();
  if (!ctx) return;
  [200, 180].forEach((freq, i) => {
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.value = freq;
    const t = ctx.currentTime + i * 0.18;
    gain.gain.setValueAtTime(0.18, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.22);
  });
}

/* ══════════════════════════════════════
   FINAL REVEAL
══════════════════════════════════════ */
function triggerFinalReveal() {
  const rev = $('#final-reveal');
  if (!rev) return;

  rev.classList.remove('hidden');
  requestAnimationFrame(() => rev.classList.add('show'));

  playChime();

  // Confetti celebration!
  setTimeout(() => fireConfetti(50), 800);
  setTimeout(() => fireConfetti(20), 1400);
  setTimeout(() => fireConfetti(80), 1900);

  const lines = [
    { id:'fl1', delay: 1200 },
    { id:'fl2', delay: 2600 },
    { id:'fl3', delay: 3800 },
    { id:'fl4', delay: 4800 },
    { id:'fl5', delay: 6000 },
    { id:'fl6', delay: 7400 },
    { id:'fl7', delay: 8600 },
    { id:'fl8', delay:10200 },
  ];

  lines.forEach(({ id, delay }) => {
    setTimeout(() => {
      const el = $(`#${id}`);
      if (el) {
        el.classList.remove('hidden');
        requestAnimationFrame(() => el.classList.add('show'));
        if (id === 'fl5') playChime();
        if (id === 'fl7') playChime();
      }
    }, delay);
  });

  // Click anywhere to close (after it's all shown)
  setTimeout(() => {
    rev.addEventListener('click', () => {
      rev.style.opacity = '0';
      setTimeout(() => rev.classList.add('hidden'), 2000);
    }, { once: true });
  }, 12000);
}

/* ══════════════════════════════════════
   INIT
══════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  runBoot();

  // Sound toggle defaults to off visual state
  $('#sound-off-icon').classList.remove('hidden');
  $('#sound-on-icon').classList.add('hidden');
});

/* Handle AudioContext resume on first interaction */
document.addEventListener('click', () => {
  if (STATE.audioCtx && STATE.audioCtx.state === 'suspended' && STATE.soundOn) {
    STATE.audioCtx.resume();
  }
}, { once: false });
