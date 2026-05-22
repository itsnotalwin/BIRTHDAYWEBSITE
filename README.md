# 22 — Memory Vault
### A birthday website for Tannie, built with love by Alwin 🌹

---

## Files

```
/
├── index.html       — All the HTML. Structure only, no logic here.
├── styles.css       — All the CSS. Animations, themes, layout.
├── script.js        — All the JS. Secrets, interactions, audio, effects.
├── assets/
│   ├── polaroids/
│   │   ├── p01.jpg – p05.jpg   ← Replace with your actual photos
│   │   └── p06.jpg – p09.jpg   ← Replace with your actual photos
│   ├── room/
│   │   └── r01.jpg – r10.jpg   ← Photos for the secret room wall
│   └── final/
│       └── her.jpg             ← Full-screen photo for the final reveal
└── README.md        — This file
```

---

## How it works

### Boot Screen
The page opens with a retro terminal boot sequence. She clicks **[ OPEN IT ]** to enter the vault.

### The Vault
Everything lives in `#vault`. It contains:
- A fixed **star field** background (decorative + floating compliment stars)
- **Floating petals** drifting down
- **Dust particles** rising
- A **film grain** canvas overlay
- The scrollable **desktop** with all content

---

## The 22 Secrets

Each secret is an HTML element with `class="secret"` and a `data-secret` attribute. When found, `markFound(id)` is called in `script.js`, which:
- Adds it to `STATE.found`
- Updates the progress bar and floating counter
- Unlocks the room door at **10 secrets**
- Triggers the final reveal at **22 secrets**

| # | Element | How to find |
|---|---------|-------------|
| 1 | `#s1` polaroid | Click it |
| 2 | `#s2` polaroid | Double-click to flip |
| 3 | `#s3` polaroid | Click → VHS glitch |
| 4 | `#s4` polaroid | Click → chime |
| 5 | `#s5` polaroid | Click → shakes |
| 6–10 | `#s6–s10` folders | Click to open |
| 11 | `#s11` invisible note | Hover reveals text, click marks |
| 12 | `#s12` typewriter sticky | Click → types out message |
| 13 | `#s13` password input | Type a food answer (chips, pizza, etc.) |
| 14 | `#s14` draggable sticky | Drag 80px in any direction |
| 15 | `#s15` file icon | Click → Win98 error popup |
| 16 | `#s16` file icon | Click → cycles visual theme |
| 17 | `#s17` file icon | Click → distortion effect |
| 18 | `#s18` file icon | Click → cinematic overlay |
| 19 | `#s19` file icon | Click → background colour bleed |
| 20 | `#s20` file icon | Click → chaos mode (everything flies) |
| 21 | `#s21` corrupted file | Click → corrupted message |
| 21b | `#s21b` chain icon | Click → cinematic then unlocks s22 zone |
| 22 | `#s22-dot` | Tiny dot at the bottom of the page |

---

## The Floating Compliment Stars ★

50 pink stars float around the star field in `#star-field`. They:
- **Appear and disappear** on their own — not all on screen at once
- **Drift gently** using CSS keyframe animation (`fcs-drift`)
- **Pulse softly** in brightness (`fcs-pulse`)
- When **clicked** → show a floating compliment toast near the star, then the star fades away and respawns elsewhere later

The messages cycle randomly from `COMPLIMENT_MESSAGES` in `script.js`. Add or change them there.

---

## The Room 🌹

The secret room (`#the-room`) is:
- Hidden by default
- **Unlocked at 10 secrets** — `#room-door` appears
- She doesn't know it requires 10 secrets — if she clicks it early she just gets a cryptic "still locked" message
- Inside: a wall of polaroids (`assets/room/r01–r10.jpg`)
- After **60 seconds** in the room, the wall fades and a final letter slides in

---

## The Final Reveal

Once all 22 secrets are found, `triggerFinalReveal()` runs:
- `#final-reveal` fades in fullscreen over `assets/final/her.jpg`
- Text lines (`#fl1–fl8`) appear with timed delays
- Confetti fires multiple times
- Click anywhere to dismiss after everything has played

---

## The Confetti

`fireConfetti()` in `script.js` randomly picks one of four launch modes each time:
- **Top fall** — rains down from random X positions at the top
- **Mid burst** — explodes from a random point in the middle of the screen
- **Low pop** — bursts upward from the lower portion of the screen
- **Corner cannon** — fires from a corner area

Fires automatically every **5–20 seconds** while the vault is open (via `scheduleConfetti()`). Also fires during the final reveal.

---

## Visual Themes

Secret 16 (`#s16`) cycles through 5 themes applied to `<body>`:
- Default (no class)
- `theme-warm` — sepia warmth
- `theme-cold` — cool blue desaturated
- `theme-void` — nearly grayscale
- `theme-bloom` — oversaturated bloom

---

## Sound

Web Audio API only — no external files needed. Toggle with the speaker button top-right. Sounds:
- `playPing()` — secret found
- `playChime()` — special moments
- `playTick()` — folder clicks
- `playRumble()` — shake/chaos
- `playError()` — wrong password / locked room
- `startAmbient()` — very soft background hum when sound is on

---

## Adding Your Photos

1. Drop photos into `assets/polaroids/` named `p01.jpg` through `p09.jpg`
2. Drop room wall photos into `assets/room/` named `r01.jpg` through `r10.jpg`
3. Drop the full-screen final reveal photo at `assets/final/her.jpg`

If any image is missing, the placeholder gracefully shows the filename instead.

---

## CSS Variables (styles.css)

Key colours you might want to tweak at the top of `styles.css` under `:root`:

| Variable | What it controls |
|---|---|
| `--c-bg` | Main background colour |
| `--c-cream` | Paper / letter background |
| `--c-gold` | Primary accent (pink-rose) |
| `--c-rust` | Secondary accent (deeper rose) |
| `--c-muted` | Subdued text |
| `--f-hand` | Handwritten font (Caveat) |
| `--f-mono` | Monospace font (Space Mono) |
| `--f-big` | Big display font (Bebas Neue) |

---

*Built by Alwin for Paige. Happy birthday, tannie. 🌹*
