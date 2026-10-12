// Shared across every cipherpr.tech page.
// initBoot(displayPath) — full elaborate boot on first visit this session,
//   short flash on repeat visits (so it doesn't replay 100+ lines every click).
// initNavTransition() — intercepts internal nav clicks, shows a quick
//   "routing to X.exe" overlay before the browser actually navigates.
// initMarquee(items) — same as before.

const BOOTED_KEY = 'cipherpr_tech_booted';

function generateBootLines() {
  const verbs = ['Checking', 'Mounting', 'Verifying', 'Loading', 'Initializing', 'Allocating', 'Resolving', 'Syncing'];
  const modules = [
    'pr-engine', 'sponsorship-core', 'web-division', 'brand-kernel', 'live-index',
    'checkout-module', 'domain-router', 'cdn-edge-cache', 'auth-service', 'asset-pipeline',
    'analytics-relay', 'ticket-engine', 'realtime-socket', 'content-store', 'admin-bridge',
    'ghost-connector', 'supabase-link', 'dns-resolver', 'image-cache', 'font-loader',
    'session-manager', 'build-index', 'route-table', 'cipher-cli-stub', 'worker-proxy',
  ];
  const exts = ['.dll', '.sys', '.core', '.mod', '.cfg'];

  const lines = [];
  for (let i = 0; i < modules.length; i++) {
    const verb = verbs[i % verbs.length];
    const ext = exts[i % exts.length];
    lines.push(`${verb} ${modules[i]}${ext}... <span class="ok">OK</span>`);
  }
  for (let i = 0; i < modules.length; i++) {
    const verb = verbs[(i + 3) % verbs.length];
    const ext = exts[(i + 2) % exts.length];
    lines.push(`${verb} ${modules[modules.length - 1 - i]}${ext}... <span class="ok">OK</span>`);
  }
  return lines;
}

function buildFullBootHTML(displayPath) {
  const generated = generateBootLines();
  let html = '';
  html += `<div class="line">Microsoft Windows [Version 10.0.19045]</div>`;
  html += `<div class="line">(c) itz.sCipher Systems. All rights reserved.</div>`;
  html += `<div class="line rule-space"></div>`;
  html += `<div class="line prompt"><span class="path">C:\\Users\\daniel&gt;</span> whoami</div>`;
  html += `<div class="line resp">itz.scipher\\daniel.ozoemena</div>`;
  html += `<div class="line rule-space"></div>`;
  generated.forEach(l => { html += `<div class="line">${l}</div>`; });
  html += `<div class="line rule-space"></div>`;
  html += `<div class="line prompt">Locating executable...</div>`;
  html += `<div class="line">Checking cipherpr.live.exe... <span class="notfound">NOT FOUND</span></div>`;
  html += `<div class="line">Checking cipherpr.me.exe... <span class="notfound">NOT FOUND</span></div>`;
  html += `<div class="line">Checking cipherpr.tech.exe... <span class="ok">FOUND</span></div>`;
  html += `<div class="line prompt"><span class="path">C:\\Users\\daniel&gt;</span> call cipherpr.tech.exe</div>`;
  html += `<div class="line resp">Access granted.</div>`;
  html += `<div class="line rule-space"></div>`;
  html += `<div class="line resp">${displayPath} <span class="caret"></span></div>`;
  return html;
}

function initBoot(displayPath) {
  const bootScreen = document.getElementById('boot-screen');
  const bootWindow = document.getElementById('boot-text');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function revealSite() {
    document.body.classList.add('loaded');
    bootScreen.classList.add('hidden');
    setTimeout(() => bootScreen.remove(), 400);
  }

  if (reducedMotion) {
    sessionStorage.setItem(BOOTED_KEY, '1');
    revealSite();
    return;
  }

  const alreadyBooted = sessionStorage.getItem(BOOTED_KEY) === '1';

  if (alreadyBooted) {
    bootWindow.innerHTML = `<div class="line resp">${displayPath} <span class="caret"></span></div>`;
    setTimeout(revealSite, 220);
    return;
  }

  const fullHTML = buildFullBootHTML(displayPath);
  const wrapper = document.createElement('div');
  wrapper.innerHTML = fullHTML;
  const lineNodes = Array.from(wrapper.children);
  bootWindow.innerHTML = '';

  let i = 0;
  function appendNext() {
    if (i >= lineNodes.length) {
      sessionStorage.setItem(BOOTED_KEY, '1');
      setTimeout(revealSite, 350);
      return;
    }
    bootWindow.appendChild(lineNodes[i]);
    bootWindow.scrollTop = bootWindow.scrollHeight;
    i++;
    const remaining = lineNodes.length - i;
    const delay = remaining < 8 ? 160 : 22;
    setTimeout(appendNext, delay);
  }
  appendNext();
}

function initNavTransition() {
  const overlay = document.getElementById('route-transition');
  const box = document.getElementById('route-transition-text');
  if (!overlay || !box) return;

  const currentPage = window.location.pathname.split('/').pop() || 'index.html';

  document.querySelectorAll('nav .links a[href$=".html"]').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage) return;

    link.addEventListener('click', function (e) {
      e.preventDefault();
      const pageName = href.replace('.html', '') || 'index';
      box.innerHTML = `
        <div class="line prompt"><span class="path">C:\\Users\\daniel&gt;</span> route --to ${pageName}.exe</div>
        <div class="line resp" id="route-dots">Routing</div>
      `;
      overlay.classList.add('active');

      let dotCount = 0;
      const dotsEl = document.getElementById('route-dots');
      const dotInterval = setInterval(() => {
        dotCount = (dotCount + 1) % 4;
        dotsEl.textContent = 'Routing' + '.'.repeat(dotCount);
      }, 150);

      setTimeout(() => {
        clearInterval(dotInterval);
        window.location.href = href;
      }, 600);
    });
  });
}

function initMarquee(items) {
  const track = document.getElementById('marquee-track');
  if (!track) return;
  const loop = [...items, ...items].map(s => `<span>${s}</span>`).join('');
  track.innerHTML = loop + loop;
}

// ---------------------------------------------------------------
// Shared 3D + scroll-interactive layer — same components/fixes as
// the portfolio, cipherpr.me and cipherpr.live: Three.js (via Vanta)
// for the hero network, Zdog for wireframe icons/falling pieces,
// Vanilla-Tilt for card depth, GSAP/ScrollTrigger for reveals +
// count-up stats. Every piece checks for its target element before
// doing anything, so this is safe to call unconditionally on every
// page even though not every page has every element.
// ---------------------------------------------------------------
function initInteractive3D() {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = window.innerWidth < 780;

  ['THREE', 'VANTA', 'gsap', 'ScrollTrigger', 'Zdog', 'VanillaTilt'].forEach(function (name) {
    if (typeof window[name] === 'undefined') {
      console.warn('[cipherpr.tech 3D] ' + name + ' did not load — related effects will be skipped.');
    }
  });

  // ---- Hero 3D network (only present on index.html) ----
  (function () {
    if (reduced) return;
    if (typeof VANTA === 'undefined' || !VANTA.NET) return;
    if (!document.getElementById('vantaHero')) return;
    try {
      VANTA.NET({
        el: "#vantaHero",
        mouseControls: true, touchControls: true, gyroControls: false,
        minHeight: 200.00, minWidth: 200.00, scale: 1.00, scaleMobile: 1.00,
        color: 0x4a6b54, backgroundColor: 0x0d1410, backgroundAlpha: 0.0,
        points: isMobile ? 5.00 : 8.00,
        maxDistance: isMobile ? 16.00 : 22.00,
        spacing: isMobile ? 26.00 : 19.00,
        showDots: true
      });
    } catch (e) {}
  })();

  // ---- Cursor / touch light ----
  (function () {
    if (reduced) return;
    const light = document.getElementById('cursorLight');
    if (!light) return;
    const useGsapQuick = typeof gsap !== 'undefined';
    let moveX, moveY;
    if (useGsapQuick) {
      moveX = gsap.quickTo(light, 'x', { duration: 0.5, ease: 'power3.out' });
      moveY = gsap.quickTo(light, 'y', { duration: 0.5, ease: 'power3.out' });
    }
    function place(x, y) {
      light.classList.add('active');
      if (useGsapQuick) { moveX(x); moveY(y); }
      else { light.style.transform = 'translate(' + x + 'px,' + y + 'px) translate(-50%,-50%)'; }
    }
    window.addEventListener('pointermove', function (e) { place(e.clientX, e.clientY); }, { passive: true });
    window.addEventListener('touchmove', function (e) {
      if (e.touches && e.touches[0]) place(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: true });
  })();

  // ---- Falling 3D pieces: defined geometric solids, behind the text
  // layer, spread in even lanes, clickable via global hit-test ----
  (function () {
    if (typeof Zdog === 'undefined' || reduced) return;
    const layer = document.getElementById('falling3DLayer');
    if (!layer) return;
    try {
      const count = isMobile ? 6 : 13;
      const canvasSize = isMobile ? 26 : 34;
      const unit = isMobile ? 6 : 7.5;
      const colors = ['#f2c94c', '#8fdca0', '#cfa93a', '#6f8f77'];
      const skillPool = ["Node.js", "React", "Supabase", "Paystack", "Monnify", "TypeScript",
        "Socket.io", "Cipher PR", "QA Testing", "Cloudflare"];
      const shapeKinds = ['cube', 'pyramid', 'octagon'];

      function buildShape(illo, kind, color) {
        if (kind === 'cube') {
          const s = unit;
          const pts = [
            { x: -s, y: -s, z: -s }, { x: s, y: -s, z: -s }, { x: s, y: s, z: -s }, { x: -s, y: s, z: -s },
            { x: -s, y: -s, z: s }, { x: s, y: -s, z: s }, { x: s, y: s, z: s }, { x: -s, y: s, z: s }
          ];
          const edges = [[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]];
          const a = new Zdog.Anchor({ addTo: illo });
          edges.forEach(function (e) { new Zdog.Shape({ addTo: a, path: [pts[e[0]], pts[e[1]]], stroke: unit * 0.22, color: color }); });
        } else if (kind === 'pyramid') {
          const top = { x: 0, y: -unit * 1.3, z: 0 };
          const base = [
            { x: unit * 1.15, y: unit * 0.9, z: unit * 0.9 },
            { x: -unit * 1.15, y: unit * 0.9, z: unit * 0.9 },
            { x: 0, y: unit * 0.9, z: -unit * 1.3 }
          ];
          const a2 = new Zdog.Anchor({ addTo: illo });
          base.forEach(function (p, i) {
            const next = base[(i + 1) % base.length];
            new Zdog.Shape({ addTo: a2, path: [p, next], stroke: unit * 0.22, color: color });
            new Zdog.Shape({ addTo: a2, path: [top, p], stroke: unit * 0.22, color: color });
          });
        } else {
          const n = 8, r = unit * 1.1, depth = unit * 0.85;
          const top2 = [], bot = [];
          for (let i = 0; i < n; i++) {
            const ang = (i / n) * Math.PI * 2;
            top2.push({ x: Math.cos(ang) * r, y: -depth, z: Math.sin(ang) * r });
            bot.push({ x: Math.cos(ang) * r, y: depth, z: Math.sin(ang) * r });
          }
          const a3 = new Zdog.Anchor({ addTo: illo });
          for (let j = 0; j < n; j++) {
            const jn = (j + 1) % n;
            new Zdog.Shape({ addTo: a3, path: [top2[j], top2[jn]], stroke: unit * 0.16, color: color });
            new Zdog.Shape({ addTo: a3, path: [bot[j], bot[jn]], stroke: unit * 0.16, color: color });
            new Zdog.Shape({ addTo: a3, path: [top2[j], bot[j]], stroke: unit * 0.16, color: color });
          }
        }
      }

      const laneWidth = 92 / count;
      const lanes = [];
      for (let li = 0; li < count; li++) lanes.push(li);
      for (let lj = lanes.length - 1; lj > 0; lj--) {
        const swapIdx = Math.floor(Math.random() * (lj + 1));
        const tmp = lanes[lj]; lanes[lj] = lanes[swapIdx]; lanes[swapIdx] = tmp;
      }

      const pieces = [];
      const popupLayer = document.createElement('div');
      popupLayer.id = 'falling3DPopupLayer';
      popupLayer.style.cssText = 'position:fixed; inset:0; pointer-events:none; z-index:30;';
      document.body.appendChild(popupLayer);
      function popAt(x, y) {
        const el = document.createElement('div');
        el.className = 'falling-3d-popup show';
        el.style.left = x + 'px';
        el.style.top = (y - 10) + 'px';
        el.textContent = skillPool[Math.floor(Math.random() * skillPool.length)];
        popupLayer.appendChild(el);
        setTimeout(function () { el.remove(); }, 1500);
      }
      window.addEventListener('click', function (e) {
        for (let k = 0; k < pieces.length; k++) {
          const rect = pieces[k].canvas.getBoundingClientRect();
          if (e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom) {
            popAt(e.clientX, e.clientY);
            pieces[k].burst();
            return;
          }
        }
      });

      for (let i = 0; i < count; i++) {
        const outer = document.createElement('div');
        outer.className = 'falling3d-outer';
        outer.style.left = (4 + lanes[i] * laneWidth + Math.random() * laneWidth * 0.7) + 'vw';

        const item = document.createElement('div');
        item.className = 'falling3d-item';
        const dur = 30 + Math.random() * 30;
        item.style.animationDuration = dur + 's';
        item.style.animationDelay = (-Math.random() * dur) + 's';

        const canvas = document.createElement('canvas');
        canvas.width = canvasSize; canvas.height = canvasSize;

        item.appendChild(canvas);
        outer.appendChild(item);
        layer.appendChild(outer);

        (function (canvas, idx) {
          const illo = new Zdog.Illustration({ element: canvas, zoom: 1.0 });
          const color = colors[idx % colors.length];
          const kind = shapeKinds[idx % shapeKinds.length];
          buildShape(illo, kind, color);
          const spinSpeed = 0.006 + Math.random() * 0.006;
          let burstUntil = 0;
          (function animate() {
            const boost = Date.now() < burstUntil ? 6 : 1;
            illo.rotate.y += spinSpeed * boost;
            illo.rotate.x += spinSpeed * 0.6 * boost;
            illo.updateRenderGraph();
            requestAnimationFrame(animate);
          })();
          pieces.push({
            canvas: canvas,
            burst: function () {
              burstUntil = Date.now() + 550;
              canvas.classList.remove('pulse');
              void canvas.offsetWidth;
              canvas.classList.add('pulse');
            }
          });
        })(canvas, i);
      }
    } catch (e) {}
  })();

  // ---- Ambient decorative pieces near text-heavy editorial sections ----
  (function () {
    if (typeof Zdog === 'undefined' || reduced) return;
    try {
      const hosts = Array.prototype.slice.call(document.querySelectorAll('.editorial, .stats-row'));
      const shapeKinds = ['cube', 'pyramid', 'octagon'];
      const colors = ['#cfa93a', '#8fdca0', '#6f8f77'];
      // pick up to 2 hosts, spaced out, so it stays restrained rather than cluttering every section
      const picks = [];
      if (hosts.length) picks.push(hosts[Math.min(1, hosts.length - 1)]);
      if (hosts.length > 3) picks.push(hosts[hosts.length - 2]);
      picks.forEach(function (host, si) {
        if (!host) return;
        const canvas = document.createElement('canvas');
        canvas.width = 70; canvas.height = 70;
        canvas.className = 'ambient-3d';
        canvas.style.cssText = 'position:absolute; top:6px; right:20px; z-index:2;';
        host.style.position = 'relative';
        host.appendChild(canvas);
        const illo = new Zdog.Illustration({ element: canvas, zoom: 1.3 });
        const color = colors[si % colors.length];
        const kind = shapeKinds[si % shapeKinds.length];
        const anchor = new Zdog.Anchor({ addTo: illo });
        if (kind === 'cube') {
          const s = 16;
          const pts = [
            { x: -s, y: -s, z: -s }, { x: s, y: -s, z: -s }, { x: s, y: s, z: -s }, { x: -s, y: s, z: -s },
            { x: -s, y: -s, z: s }, { x: s, y: -s, z: s }, { x: s, y: s, z: s }, { x: -s, y: s, z: s }
          ];
          [[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]].forEach(function (e) {
            new Zdog.Shape({ addTo: anchor, path: [pts[e[0]], pts[e[1]]], stroke: 3, color: color });
          });
        } else if (kind === 'pyramid') {
          const top = { x: 0, y: -20, z: 0 };
          const base = [{ x: 18, y: 13, z: 13 }, { x: -18, y: 13, z: 13 }, { x: 0, y: 13, z: -20 }];
          base.forEach(function (p, i) {
            const next = base[(i + 1) % base.length];
            new Zdog.Shape({ addTo: anchor, path: [p, next], stroke: 3, color: color });
            new Zdog.Shape({ addTo: anchor, path: [top, p], stroke: 3, color: color });
          });
        } else {
          const n = 8, r = 16, depth = 12;
          const top2 = [], bot = [];
          for (let i = 0; i < n; i++) {
            const ang = (i / n) * Math.PI * 2;
            top2.push({ x: Math.cos(ang) * r, y: -depth, z: Math.sin(ang) * r });
            bot.push({ x: Math.cos(ang) * r, y: depth, z: Math.sin(ang) * r });
          }
          for (let j = 0; j < n; j++) {
            const jn = (j + 1) % n;
            new Zdog.Shape({ addTo: anchor, path: [top2[j], top2[jn]], stroke: 2.5, color: color });
            new Zdog.Shape({ addTo: anchor, path: [bot[j], bot[jn]], stroke: 2.5, color: color });
            new Zdog.Shape({ addTo: anchor, path: [top2[j], bot[j]], stroke: 2.5, color: color });
          }
        }
        const t0 = Date.now() + si * 400;
        (function bob() {
          const t = (Date.now() - t0) / 1000;
          illo.rotate.y = t * 0.6;
          illo.translate.y = Math.sin(t * 1.6) * 5;
          illo.updateRenderGraph();
          requestAnimationFrame(bob);
        })();
      });
    } catch (e) {}
  })();

  // ---- Card tilt ----
  (function () {
    if (reduced || typeof VanillaTilt === 'undefined') return;
    try {
      VanillaTilt.init(document.querySelectorAll('.service-card, .case-study, .blog-card'), {
        max: 6, speed: 400, glare: true, 'max-glare': 0.1, scale: 1.015
      });
    } catch (e) {}
  })();

  // ---- Stats count-up: reads the real number straight out of the markup
  // (handles "500+", "6", "1", etc.) so nothing needs separate data attrs ----
  (function () {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      // still show the final values even without GSAP
      document.querySelectorAll('.stat-block b').forEach(function (el) { el.dataset.done = '1'; });
      return;
    }
    try {
      gsap.registerPlugin(ScrollTrigger);
      document.querySelectorAll('.stat-block b').forEach(function (el) {
        const raw = el.textContent.trim();
        const match = raw.match(/[\d,]+/);
        if (!match) return;
        const target = parseInt(match[0].replace(/,/g, ''), 10);
        const suffix = raw.replace(match[0], '');
        if (reduced) { el.textContent = target.toLocaleString() + suffix; return; }
        gsap.set(el, { opacity: 0 });
        ScrollTrigger.create({
          trigger: el, start: 'top 90%', once: true,
          onEnter: function () {
            gsap.to(el, { opacity: 1, duration: 0.3 });
            const counter = { val: 0 };
            gsap.to(counter, {
              val: target, duration: 1.3, ease: 'power1.out',
              onUpdate: function () { el.textContent = Math.floor(counter.val).toLocaleString() + suffix; }
            });
          }
        });
      });

      // Bounce-pop entrances for grids, matching the portfolio's physics feel
      ['.service-card', '.blog-card', '.process-item'].forEach(function (sel) {
        ScrollTrigger.batch(sel, {
          start: 'top 90%', once: true,
          onEnter: function (batch) { gsap.from(batch, { opacity: 0, y: 24, scale: 0.96, duration: 0.6, stagger: 0.08, ease: 'back.out(1.5)' }); }
        });
      });
      gsap.utils.toArray('.case-study').forEach(function (el) {
        gsap.from(el, { opacity: 0, y: 24, duration: 0.6, ease: 'power2.out', scrollTrigger: { trigger: el, start: 'top 88%' } });
      });
    } catch (e) {}
  })();
}
