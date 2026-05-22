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
  roomLetterShown: false,
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
const STAR_SECRETS_POOL = [
  "you're so beautiful 🌹",
  "your eyes are gorgeous omg",
  "CRAZY bestie energy. off the charts.",
  "literally that girl. no debate. 🌹",
  "you walked in and the whole room felt it 💕",
  "ur so pretty it should be illegal",
  "main character behaviour. always.",
  "ur smile?? devastating. in the best way.",
  "stunning. genuinely stunning.",
  "the confidence arc?? ICONIC. 🌹",
  "ur giving everything rn and I'm obsessed",
  "so beautiful it's actually unfair to others",
  "bestie ur glowing and you don't even know it",
  "ur literally gorgeous wtf",
  "that girl energy: confirmed 💕",
  "your vibe is immaculate. always.",
  "prettiest person in any room. facts.",
  "ur so effortlessly you and it's everything 🌹",
  "the way you exist?? a gift honestly.",
  "obsessed with you. not taking questions.",
  "the kindness you carry around?? unmatched 💕",
  "smartest person in the chat. always has been.",
  "ur laugh is literally contagious, just so you know 🌹",
  "the way people light up around you?? that's all you.",
  "ur brain AND ur heart?? unfair combo honestly.",
  "radiating goodness 24/7 and you don't even notice 🌹",
  "so funny. so real. zero competition.",
  "ur the person everyone wants at their table 💕",
  "genuine queen behaviour. no notes.",
  "ur actually that rare person who makes everything better 🌹",
  "just the most magnetic, incredible person. it's a fact.",
  "everything about you is giving main character and best friend simultaneously 🌹",
  "ur heart is so big it's actually a lot to handle (in the best way) 💕",
  "the way you love people?? the world doesn't deserve you.",
  "certified iconic. laminated. framed. 🌹",
  "OMG ur eyes are actually insane stop it 😭",
  "your eyes?? two of the prettiest things I've ever seen. not up for debate.",
  "those eyes are genuinely unfair to the rest of us 🌹",
  "ur eyes are doing WAY too much rn and I'm not okay",
  "bestie ur eyes could end wars. this is a fact.",
  "ur ass looks INCREDIBLE today omg 💕",
  "the way u look today should be a crime honestly",
  "ur body is immaculate. I said what I said. 🌹",
  "ur literally built different and I mean that in every way",
  "everything about the way u look today?? A SERVE. 💕",
  "ur so gorgeous it's actually making me unwell 😭🌹",
  "I'm normal about u. I'm SO normal about u. (I'm not normal about u)",
  "bestie I would DIE for you and ur also just really hot so",
  "ur giving FACE. always giving face. 💕",
  "the audacity to be that pretty AND that funny. who gave u permission.",
  "OMG STOP UR SO PRETTY IT'S SENDING ME 😭🌹",
  "ur literally so hot it's actually annoying at this point",
  "I love u so much and also ur so attractive it's genuinely offensive 🌹",
  "bestie ur GLOWING today what is ur secret",
  "ur so pretty I have to look away sometimes. genuinely. 💕",
  "ur outfit + ur face + ur energy today?? LETHAL COMBINATION 🌹",
  "the way u exist is genuinely my favourite thing. also ur hot.",
  "ur literally that girl and also ur ass looks amazing so 💕",
  "I am UNWELL because of how good u look. unwell. 🌹",
  "you make every room better just by walking into it. every single one.",
  "ur that person people write songs about. genuinely.",
  "the way you carry yourself?? an entire era. I'm taking notes. 🌹",
  "u have no idea how much people think about u after they meet u.",
  "everything about you is intentional and it shows. 💕",
  "ur honestly one of the most real people I know and that's rare.",
  "the way ur energy is completely yours and no one else's?? iconic.",
  "ur not just pretty ur the kind of pretty that makes people trip on things. 🌹",
  "ur so gorgeous it genuinely interrupts my thoughts sometimes.",
  "bestie you deserve every good thing that's ever been said about you. all of it. 💕",
  "you're the kind of person people hope to be when they grow up. 🌹",
];

// Secret stars pick a random compliment on every click
const STAR_SECRETS = [
  { id:'star1' }, { id:'star2' }, { id:'star3' },
  { id:'star4' }, { id:'star5' },
];

function randomCompliment() {
  return STAR_SECRETS_POOL[Math.floor(Math.random() * STAR_SECRETS_POOL.length)];
}

function spawnDecorativeStar(field) {
  const star = document.createElement('div');
  star.className = 'star deco-star';
  const size = Math.random() * 2.5 + 0.8;
  const peakOpacity = Math.random() > 0.5 ? 0.55 : 0.28;
  const lingerMs = 3500 + Math.random() * 5000;
  const fadeMs   = 1200;

  star.style.cssText = `
    width:${size}px; height:${size}px;
    left:${Math.random()*100}%;
    top:${Math.random()*100}%;
    background: hsl(${40 + Math.random()*20}, 60%, ${45 + Math.random()*20}%);
    opacity: 0;
    transition: opacity ${fadeMs}ms ease;
    pointer-events: none;
  `;
  field.appendChild(star);

  // Fade in
  requestAnimationFrame(() => {
    requestAnimationFrame(() => { star.style.opacity = peakOpacity; });
  });

  // Fade out then remove
  setTimeout(() => {
    star.style.opacity = 0;
    setTimeout(() => star.remove(), fadeMs + 50);
  }, lingerMs);
}

function runLivingStarField(field) {
  const MAX_LIVE = 2;
  const live = () => field.querySelectorAll('.deco-star').length;

  function maybeSpawn() {
    if (live() < MAX_LIVE) spawnDecorativeStar(field);
    setTimeout(maybeSpawn, 1500 + Math.random() * 3500);
  }

  // Seed with 1-2 stars immediately
  spawnDecorativeStar(field);
  setTimeout(() => spawnDecorativeStar(field), 800 + Math.random() * 1200);
  setTimeout(maybeSpawn, 4000);
}

function buildStarField() {
  const field = $('#star-field');

  // Living decorative star system — fades in/out randomly, max ~2 at a time
  runLivingStarField(field);

  // Hidden secret stars — random positions, pop in/out over time
  STAR_SECRETS.forEach((ss, idx) => {
    function placeSecretStar() {
      const star = document.createElement('div');
      star.className = 'star secret-star';
      star.id = ss.id;
      star.dataset.secretStar = idx;
      const left = 5 + Math.random() * 88;
      const top  = 5 + Math.random() * 88;
      star.style.cssText = `
        width: 9px; height: 9px;
        left: ${left}%;
        top:  ${top}%;
        background: #cc001e;
        opacity: 0;
        box-shadow: 0 0 8px 3px rgba(200,0,30,0.55);
        transition: opacity 1s ease;
      `;
      star.addEventListener('click', () => handleStarSecret(ss, star));
      field.appendChild(star);

      // Fade in after short delay
      setTimeout(() => { star.style.opacity = '0.65'; }, 100);

      if (!star.classList.contains('discovered')) {
        // Fade out and relocate after random interval
        const linger = 5000 + Math.random() * 8000;
        setTimeout(() => {
          if (star.classList.contains('discovered')) return;
          star.style.opacity = '0';
          setTimeout(() => {
            if (star.classList.contains('discovered')) return;
            star.remove();
            // Reappear after random gap
            setTimeout(placeSecretStar, 2000 + Math.random() * 6000);
          }, 1100);
        }, linger);
      }
    }

    // Stagger initial appearances
    setTimeout(placeSecretStar, idx * 800 + Math.random() * 1500);
  });
}

function handleStarSecret(ss, starEl) {
  if (starEl.classList.contains('discovered')) return;
  starEl.classList.add('discovered');
  playPing();

  // Show a random compliment toast each time
  showStarCompliment(randomCompliment(), starEl);

  emitParticleBurst(
    parseFloat(starEl.style.left) / 100 * window.innerWidth,
    parseFloat(starEl.style.top)  / 100 * window.innerHeight
  );

  // Fade out and remove after the toast has gone (≈6s), then reappear elsewhere
  setTimeout(() => {
    starEl.style.transition = 'opacity 1.2s ease';
    starEl.style.opacity = '0';
    setTimeout(() => {
      starEl.remove();
    }, 1300);
  }, 5800);
}

function showStarCompliment(msg, starEl) {
  const toast = document.createElement('div');
  toast.className = 'star-toast';
  toast.textContent = msg;

  // Position near the star
  const x = parseFloat(starEl.style.left);
  const y = parseFloat(starEl.style.top);
  toast.style.left = Math.min(Math.max(x, 5), 60) + '%';
  toast.style.top  = Math.max(y - 12, 5) + '%';

  document.body.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('show'));

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 500);
  }, 5000);
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
const PETAL_COLORS = [
  '#9b2d46','#7d1e35','#b8405a','#c25570',
  '#8c2a42','#a33350','#6b1a2e','#be4d65',
  '#7a243c','#a63048'
];
const PETAL_SVG = (color) => `<svg viewBox="0 0 20 24" xmlns="http://www.w3.org/2000/svg">
  <path d="M10 1 C15 1, 19 6, 19 11 C19 18, 14 23, 10 23 C6 23, 1 18, 1 11 C1 6, 5 1, 10 1Z"
    fill="${color}" opacity="1"/>
  <path d="M10 1 C10 1, 10 12, 10 23" stroke="rgba(255,255,255,0.25)" stroke-width="0.8" fill="none"/>
</svg>`;

function buildPetals() {
  const field = $('#petal-field');
  if (!field) return;
  const count = 30;
  for (let i = 0; i < count; i++) {
    spawnPetal(field, i * (20000 / count));
  }
}

function spawnPetal(field, initialDelay) {
  const color = PETAL_COLORS[Math.floor(Math.random() * PETAL_COLORS.length)];
  const size  = 12 + Math.random() * 16;
  const left  = Math.random() * 100;
  const dur   = 8 + Math.random() * 10;
  const sway  = (Math.random() > 0.5 ? 1 : -1) * (50 + Math.random() * 80);
  const rot0  = Math.random() * 360;
  const rot1  = rot0 + 180 + Math.random() * 200;
  const op    = 0.70 + Math.random() * 0.20;

  const petal = document.createElement('div');
  petal.className = 'petal';
  petal.innerHTML = PETAL_SVG(color);
  petal.style.cssText = `
    --ps:${size}px;
    --pf-dur:${dur}s;
    --pf-delay:${initialDelay}ms;
    --pf-sway:${dur * 0.45}s;
    --pf-swing:${sway}px;
    --pr0:${rot0}deg;
    --pr1:${rot1}deg;
    --pf-op:${op};
    left:${left}%;
    filter: drop-shadow(0 1px 3px rgba(80,0,20,0.25));
  `;
  field.appendChild(petal);
  // No animationiteration listener — CSS infinite loop handles recycling cleanly
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
    $('#room-door').classList.add('show');
  }

  // All 22 found
  if (count >= STATE.total) {
    setTimeout(triggerFinalReveal, 800);
  }

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
    <p>The version of you that existed before you stopped apologising for taking up space was already incredible.<br><br>The version after?Unfair.</p>`);
  });

  /* ── S2: Double-click to flip ── */
  const s2 = $('#s2');
  if (s2) {
    s2.addEventListener('dblclick', (e) => {
      e.preventDefault();
      s2.classList.toggle('flipped');
      markFound(2);
    });
    // Also single click reminder
    s2.addEventListener('click', () => {
      if (!s2.classList.contains('flipped') && !STATE.found.has('2')) {
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
      <p>You in your era of giving zero f*cks was one of the best things I've ever watched happen.</p>`);
    }, 800);
  });

  /* ── S4: Float + audio ping on click ── */
  const s4 = $('#s4');
  if (s4) s4.addEventListener('click', () => {
    markFound(4);
    playChime();
    showModal(`<span class="m-label">memory_04 / sound</span>
    <p>Your hyena laugh the one that sets everyone else off without you even trying.</p>`);
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
      <p>You’ve shaken off more than I know about.I know that much. and you still show up every time still you, just a little more gentle than before..</p>`);
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
        "You have this thing where you make everyone around you feel like the most important person in the room.You do it without trying. it's a gift and you give it for free.",
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
    showWin98Error("cuteness.exe has encountered a fatal error.\n\n\"Cuteness overflow detectedfrom user.\nSystem cannot process this level\nof charm and resilience.\"\n\nPlease restart your heart.\nError code: TOO_MUCH_HER");
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
      <p>You are not who you were two years ago. Not even close. The glow-up has been physical, mental, emotional, and honestly a little bit rude to the rest of us.</p>`);
    }, 900);
  });

  /* ── S18: Cinematic overlay ── */
  const s18 = $('#s18');
  if (s18) s18.addEventListener('click', () => {
    markFound(18);
    showCinematic("I don't know when exactly you went from figuring it out\n\nto actually living it.\n\nbut I was there.\n\nand it looked like something worth remembering.");
  });

  /* ── S19: Background colour bleed ── */
  const s19 = $('#s19');
  if (s19) s19.addEventListener('click', () => {
    markFound(19);
    triggerBgBleed();
    showModal(`<span class="m-label">memory_bleed.tmp</span>
    <p>I don't know exactly when it happened. the shift. but one day you just... landed. You became someone who felt settled in themselves. Watching that happen from the outside.</p>`);
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
      <p>this file was corrupted. but the core message survived:<br><br>You are not a work in progress. You are already the work. you are already the point. Nothing about you is unfinished.</p>`);
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

  /* ── S22: The tiny dot — FINAL ── */
  const s22 = $('#s22-dot');
  if (s22) s22.addEventListener('click', () => {
    markFound(22);
    // delay then final
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
  // Secret lock check — she doesn't know, just gets a hint if not enough
  if (!STATE.roomUnlocked) {
    showModal(`<span class="m-label">locked 🌹</span><p>some things aren't ready yet.<br><br>keep looking. you'll know when.</p>`);
    playError();
    return;
  }

  const room = $('#the-room');
  if (!room) return;
  room.classList.remove('hidden');
  requestAnimationFrame(() => room.classList.add('open'));
  document.body.style.overflow = 'hidden';

  // After 60 seconds, fade out polaroids and reveal the final letter
  if (!STATE.roomLetterShown) {
    STATE.roomLetterShown = true;
    setTimeout(() => revealRoomLetter(), 60000);
  }
}

function revealRoomLetter() {
  const wall = $('#room-wall');
  const existing = $('#room-final-letter');
  if (existing) return; // already shown

  // Fade out the wall
  if (wall) {
    wall.style.transition = 'opacity 2s ease';
    wall.style.opacity = '0';
  }

  // Create and show the letter
  const letter = document.createElement('div');
  letter.id = 'room-final-letter';
  letter.innerHTML = `
    <div class="rfl-tape"></div>
    <div class="rfl-body">
      <p class="rfl-to">to: tannie 🌹</p>
      <p>if you found this room it means you looked for everything.</p>
      <p>that's so you.</p>
      <p>you don't half-do anything. never have. that's the thing about you that I've always loved most.</p>
      <p>you show up fully. for everything. for everyone.</p>
      <p class="rfl-big">show up for yourself that way too. 💕</p>
      <p>happy birthday, tannie.</p>
      <p class="rfl-sig">— oomie 🌹<br><span>(your biggest fan. still denying it.)</span></p>
    </div>
  `;

  const roomInner = $('#room-inner');
  if (roomInner) {
    roomInner.appendChild(letter);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => letter.classList.add('show'));
    });
  }

  playChime();
  setTimeout(() => fireConfetti(50), 600);
}

function closeRoom() {
  const room = $('#the-room');
  if (!room) return;
  room.classList.remove('open');
  setTimeout(() => {
    room.classList.add('hidden');
    document.body.style.overflow = '';
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
