// main.js - simplified per user request
// Handles palette persistence, starfield, favicon/cursor assets, CRT toggle, and UI audio


// Force sage palette irrespective of prior choices
function applyDefaultPalette() {
  const p = 'sage';
  document.body.classList.remove('theme-sage', 'theme-pink', 'theme-pixel', 'theme-bw');
  document.body.classList.add('theme-sage');
  document.body.dataset.palette = p;
  localStorage.setItem('palette', p);
  setPaletteAssets(p);
}



function startStarfield() {
  const canvas = document.getElementById('starfield');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
  resize(); window.addEventListener('resize', resize);

  const stars = Array.from({length: 120}).map(() => ({
    x: Math.random()*canvas.width,
    y: Math.random()*canvas.height,
    z: Math.random()*1.2 + 0.2,
    size: Math.random()*1.2 + 0.2
  }));

  function draw() {
    ctx.clearRect(0,0,canvas.width,canvas.height);
    stars.forEach(s => {
      s.x -= s.z*0.6; if (s.x < 0) s.x = canvas.width;
      ctx.fillStyle = 'rgba(255,255,255,' + (0.6*s.z) + ')';
      ctx.fillRect(s.x, s.y, s.size, s.size);
    });
    requestAnimationFrame(draw);
  }
  draw();
}
startStarfield();

// Dynamic favicon & cursor per palette (softer stardew-like accents)
function setPaletteAssets(palette) {
  const colorMap = { sage: '#8FBF8F', pink: '#E89ABF', pixel: '#9AE66E', bw: '#111111' };
  const accent = colorMap[palette] || '#8FBF8F';

  const bg = (palette === 'bw') ? '#ffffff' : '#f0efe6';
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' fill='${bg}'/><text x='6' y='22' font-family='Press Start 2P' font-size='10' fill='${accent}'>A</text></svg>`;
  const url = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  let link = document.querySelector("link[rel*='icon']");
  if (!link) { link = document.createElement('link'); link.rel = 'icon'; document.head.appendChild(link); }
  link.href = url;
  // use hand cursor asset site-wide for a pixel-pointer feel
  try {
    document.body.style.cursor = 'url("assets/cursor.svg") 6 6, auto';
  } catch (e) {
    /* fallback: do nothing */
  }
}

const initialPalette = localStorage.getItem('palette') || document.body.dataset.palette;
if (initialPalette) setPaletteAssets(initialPalette);
else applyDefaultPalette();

const obs = new MutationObserver(() => {
  const p = document.body.dataset.palette || localStorage.getItem('palette');
  if (p) setPaletteAssets(p);
});
obs.observe(document.body, { attributes: true, attributeFilter: ['data-palette'] });


function playClick() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'sine';
    o.frequency.value = 880;
    g.gain.value = 0.03;
    o.connect(g);
    g.connect(ctx.destination);
    o.start();
    setTimeout(() => { o.stop(); ctx.close(); }, 60);
  } catch (err) {}
}

document.querySelectorAll('nav a, nav button').forEach(el => el.addEventListener('click', () => playClick()));

// richer SFX generators
function sfx(startFreq, type = 'sine', duration = 120, vol = 0.04) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(startFreq, ctx.currentTime);
    g.gain.value = vol;
    o.connect(g); g.connect(ctx.destination);
    o.start();
    // simple decay
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration/1000);
    setTimeout(() => { try { o.stop(); ctx.close(); } catch(e){} }, duration + 20);
  } catch (e) {}
}

// hooks for common UI elements (no landing play button)

// CRT controls removed; no bindings to .crt-toggle remain
document.querySelectorAll('.project-links a, .project-links button').forEach(b => b.addEventListener('click', () => sfx(660, 'sawtooth', 140, 0.035)));
document.querySelectorAll('nav a').forEach(a => a.addEventListener('click', () => sfx(720, 'sine', 100, 0.02)));

// Trigger entrance animations after DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // small delay so animations stage nicely
  setTimeout(() => document.body.classList.add('site-loaded'), 120);
});

// Resume viewer toggle (about page)
const resumeToggle = document.getElementById('resumeToggle');
const resumeViewer = document.getElementById('resumeViewer');
if (resumeToggle && resumeViewer) {
  resumeToggle.addEventListener('click', () => {
    const open = resumeViewer.classList.toggle('open');
    resumeViewer.setAttribute('aria-hidden', !open);
    resumeToggle.textContent = open ? 'Hide inline' : 'View inline';
  });
}
