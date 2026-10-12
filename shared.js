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
        color: (window.FACET && FACET.vanta) || 0x4a6b54, backgroundColor: 0x0d1410, backgroundAlpha: 0.0,
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

    // ---- Falling 3D pieces: shared facet implementation (see FACET-FX) ----
    if (window.FacetFX) FacetFX.falling3D();

  // ---- Ambient decorative pieces near text-heavy editorial sections ----
  (function () {
    if (typeof Zdog === 'undefined' || reduced) return;
    try {
      const hosts = Array.prototype.slice.call(document.querySelectorAll('.editorial, .stats-row'));
      const shapeKinds = ['cube', 'pyramid', 'octagon'];
      const colors = (window.FACET && FACET.palette) || ['#cfa93a', '#8fdca0', '#6f8f77'];
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
          illo.rotate.y = t * 0.6; illo.rotate.x = 0.5;
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

      // Bounce-pop entrances for grids, matching the portfolio's physics feel.
      // NOTE: ScrollTrigger.batch can call onEnter twice for elements that are
      // already in view on load. A plain gsap.from() run twice records the
      // half-faded opacity from the first run as its END state, which left cards
      // permanently semi-transparent. So: each element is only ever animated
      // once (guard), and the tween uses explicit start AND end values (fromTo),
      // so the end state can never be corrupted.
      ['.service-card', '.blog-card', '.process-item'].forEach(function (sel) {
        ScrollTrigger.batch(sel, {
          start: 'top 90%', once: true,
          onEnter: function (batch) {
            const fresh = batch.filter(function (el) { return !el._revealed; });
            if (!fresh.length) return;
            fresh.forEach(function (el) { el._revealed = true; });
            gsap.fromTo(fresh,
              { opacity: 0, y: 24, scale: 0.96 },
              { opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.08, ease: 'back.out(1.5)',
                overwrite: true, clearProps: 'opacity,transform' });
          }
        });
      });
      gsap.utils.toArray('.case-study').forEach(function (el) {
        gsap.fromTo(el, { opacity: 0, y: 24 },
          { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out', clearProps: 'opacity,transform',
            scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
      });
    } catch (e) {}
  })();
}

window.FACET_ID = 'company';

window.FACET_ID = 'company';

window.FACET_ID = 'company';
/* ==FACET-FX START== generated from chrome/fx.js — shared by cipherpr.me / .tech / .live.
   Set window.FACET_ID = 'person' | 'company' | 'persona' BEFORE this runs. */
(function () {
  var FACETS = {
    person:  { name: 'Daniel',      role: 'the person',  url: 'https://cipherpr.me',   color: '#8fdca0', rgb: '143,220,160' },
    company: { name: 'Cipher PR',   role: 'the company', url: 'https://cipherpr.tech', color: '#f2c94c', rgb: '242,201,76'  },
    persona: { name: 'itz.sCipher', role: 'the persona', url: 'https://cipherpr.live', color: '#b9a3ff', rgb: '185,163,255' }
  };
  var SITES = {
    person: {
      palette: ['#8fdca0', '#6fbf88', '#cfe9d6', '#6f8f77'], vanta: 0x4a6b54, sig: 'cube', emblem: 'person', placement: 'center',
      rain: '143,220,160',
      tokens: ['$ whoami', 'SIWES', '300L', 'LASU', 'QA ✓', 'git commit', 'npm run dev', 'Ikeja', 'MERN', 'console.log()', 'React ⚛', 'ISC² CC', 'ctrl+s'],
      skills: ['Node.js', 'React', 'MongoDB', 'QA Testing', 'ISC² CC', 'Project Mgmt', 'Express', 'TypeScript']
    },
    company: {
      palette: ['#f2c94c', '#cfa93a', '#ffe18a', '#a8893a'], vanta: 0x8a7536, sig: 'pyramid', emblem: 'shield', placement: 'corner',
      rain: '242,201,76',
      tokens: ['sponsor deck', 'PR strategy', 'brand kit', 'Paystack', 'outreach', 'case study', 'press kit', 'SEO', 'DNS', 'Cloudflare', 'webmaster', 'ticketing', 'follow-up'],
      skills: ['PR Strategy', 'Sponsorship', 'Brand Kit', 'Paystack', 'Cloudflare', 'SEO', 'Webmaster', 'Event Systems']
    },
    persona: {
      palette: ['#b9a3ff', '#8a74d8', '#dcd2ff', '#6f8f77'], vanta: 0x6a5aa8, sig: 'gem', emblem: 'gem', placement: 'center',
      rain: '185,163,255',
      tokens: ['itz.sCipher', 'npm run build', 'deploy ✓', 'git push', 'live', 'ls ~/projects', 'socket.emit', 'chmod +x', 'ssh', 'cipher.exe', '#itzscipher', 'sudo build', 'ship it'],
      skills: ['Socket.io', 'Supabase', 'Flutter', 'TypeScript', 'Monnify', 'Deployed ✓', 'Real-time', 'Node.js']
    }
  };
  var ID = window.FACET_ID || 'person';
  var F = FACETS[ID], S = SITES[ID];
  window.FACET = { id: ID, name: F.name, role: F.role, accent: F.color, rgb: F.rgb, palette: S.palette, vanta: S.vanta, sig: S.sig, rain: S.rain };

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isMobile = window.innerWidth < 780;

  /* ---------- chrome: facet tag in the nav + the fixed facet strip ---------- */
  function chrome() {
    var nav = document.querySelector('nav');
    if (!nav || document.querySelector('.facet-strip')) return;
    var brand = nav.querySelector('.brand');
    if (brand) {
      var tag = document.createElement('span');
      tag.className = 'facet-tag';
      tag.textContent = F.role;
      brand.appendChild(tag);
    }
    var strip = document.createElement('div');
    strip.className = 'facet-strip';
    strip.setAttribute('role', 'navigation');
    strip.setAttribute('aria-label', 'The three facets of the brand');
    strip.innerHTML = ['person', 'company', 'persona'].map(function (k) {
      var f = FACETS[k], cur = k === ID;
      return '<a href="' + f.url + '"' + (cur ? ' class="current" aria-current="page"' : '') +
             ' style="--c:' + f.color + ';--c-rgb:' + f.rgb + '">' +
             '<span class="dot"></span><span class="name">' + f.name + '</span><span class="role">' + f.role + '</span></a>';
    }).join('');
    nav.insertAdjacentElement('afterend', strip);
  }

  /* ---------- falling code tokens (the portfolio's signature layer), facet-flavoured ---------- */
  function fallingText() {
    if (reduced) return;
    var layer = document.getElementById('fallingText');
    if (!layer) { layer = document.createElement('div'); layer.id = 'fallingText'; layer.setAttribute('aria-hidden', 'true'); document.body.insertBefore(layer, document.body.firstChild); }
    var count = isMobile ? 9 : 18;
    for (var i = 0; i < count; i++) {
      var outer = document.createElement('div'); outer.className = 'ftok-outer';
      outer.style.left = (6 + Math.random() * 88) + 'vw';
      var span = document.createElement('span'); span.className = 'ftok';
      span.textContent = S.tokens[i % S.tokens.length];
      var dur = 16 + Math.random() * 20;
      span.style.animationDuration = dur + 's';
      span.style.animationDelay = (-Math.random() * dur) + 's';
      span.style.fontSize = (11 + Math.random() * 5) + 'px';
      outer.appendChild(span); layer.appendChild(outer);
    }
  }

  /* ---------- shared wireframe builders (all straight edges, no circles) ---------- */
  function edge(addTo, a, b, stroke, color) { return new Zdog.Shape({ addTo: addTo, path: [a, b], stroke: stroke, color: color }); }
  function cube(addTo, s, stroke, color) {
    var p = [{x:-s,y:-s,z:-s},{x:s,y:-s,z:-s},{x:s,y:s,z:-s},{x:-s,y:s,z:-s},{x:-s,y:-s,z:s},{x:s,y:-s,z:s},{x:s,y:s,z:s},{x:-s,y:s,z:s}];
    [[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]].forEach(function (e) { edge(addTo, p[e[0]], p[e[1]], stroke, color); });
  }
  function pyramid(addTo, u, stroke, color) {
    var top = { x: 0, y: -u * 1.3, z: 0 };
    var base = [{ x: u * 1.15, y: u * .9, z: u * .9 }, { x: -u * 1.15, y: u * .9, z: u * .9 }, { x: 0, y: u * .9, z: -u * 1.3 }];
    base.forEach(function (p, i) { edge(addTo, p, base[(i + 1) % 3], stroke, color); edge(addTo, top, p, stroke, color); });
  }
  function prism(addTo, n, r, depth, stroke, color) {
    var t = [], b = [], i;
    for (i = 0; i < n; i++) { var a = i / n * Math.PI * 2; t.push({ x: Math.cos(a) * r, y: -depth, z: Math.sin(a) * r }); b.push({ x: Math.cos(a) * r, y: depth, z: Math.sin(a) * r }); }
    for (i = 0; i < n; i++) { var j = (i + 1) % n; edge(addTo, t[i], t[j], stroke, color); edge(addTo, b[i], b[j], stroke, color); edge(addTo, t[i], b[i], stroke, color); }
  }
  function gem(addTo, r, h, stroke, c1, c2) {   // hexagonal bipyramid
    var ring = [], i, n = 6;
    for (i = 0; i < n; i++) { var a = i / n * Math.PI * 2; ring.push({ x: Math.cos(a) * r, y: 0, z: Math.sin(a) * r }); }
    var top = { x: 0, y: -h, z: 0 }, bot = { x: 0, y: h, z: 0 };
    for (i = 0; i < n; i++) { edge(addTo, ring[i], ring[(i + 1) % n], stroke, c1); edge(addTo, top, ring[i], stroke, c2); edge(addTo, bot, ring[i], stroke, c1); }
  }
  function buildSolid(kind, illo, u, color) {
    var a = new Zdog.Anchor({ addTo: illo });
    if (kind === 'cube') cube(a, u, u * .22, color);
    else if (kind === 'pyramid') pyramid(a, u, u * .22, color);
    else if (kind === 'gem') gem(a, u * 1.05, u * 1.4, u * .2, color, color);
    else prism(a, 8, u * 1.1, u * .85, u * .16, color);
  }

  /* ---------- falling 3D pieces: this facet's signature solid, plus a few of the others ---------- */
  function falling3D() {
    if (typeof Zdog === 'undefined' || reduced) return;
    var layer = document.getElementById('falling3DLayer');
    if (!layer) { layer = document.createElement('div'); layer.id = 'falling3DLayer'; layer.setAttribute('aria-hidden', 'true'); document.body.insertBefore(layer, document.body.firstChild); }
    try {
      var count = isMobile ? 6 : 13, size = isMobile ? 26 : 34, unit = isMobile ? 6 : 7.5;
      var others = ['cube', 'pyramid', 'gem', 'octagon'].filter(function (k) { return k !== S.sig; });
      var kinds = [S.sig, S.sig, S.sig, others[0], S.sig, others[1], S.sig, others[2]];
      var lw = 92 / count, lanes = [], i;
      for (i = 0; i < count; i++) lanes.push(i);
      for (i = lanes.length - 1; i > 0; i--) { var k = Math.floor(Math.random() * (i + 1)), t = lanes[i]; lanes[i] = lanes[k]; lanes[k] = t; }
      var pieces = [];
      var pop = document.createElement('div');
      pop.style.cssText = 'position:fixed; inset:0; pointer-events:none; z-index:30;';
      document.body.appendChild(pop);
      window.addEventListener('click', function (e) {
        for (var q = 0; q < pieces.length; q++) {
          var r = pieces[q].canvas.getBoundingClientRect();
          if (e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom) {
            var el = document.createElement('div'); el.className = 'falling-3d-popup show';
            el.style.left = e.clientX + 'px'; el.style.top = (e.clientY - 10) + 'px';
            el.textContent = S.skills[Math.floor(Math.random() * S.skills.length)];
            pop.appendChild(el); setTimeout(function () { el.remove(); }, 1500);
            pieces[q].burst(); return;
          }
        }
      });
      for (i = 0; i < count; i++) {
        var outer = document.createElement('div'); outer.className = 'falling3d-outer';
        outer.style.left = (4 + lanes[i] * lw + Math.random() * lw * .7) + 'vw';
        var item = document.createElement('div'); item.className = 'falling3d-item';
        var dur = 30 + Math.random() * 30;
        item.style.animationDuration = dur + 's'; item.style.animationDelay = (-Math.random() * dur) + 's';
        var canvas = document.createElement('canvas'); canvas.width = size; canvas.height = size;
        item.appendChild(canvas); outer.appendChild(item); layer.appendChild(outer);
        (function (canvas, idx) {
          var illo = new Zdog.Illustration({ element: canvas, zoom: 1 });
          buildSolid(kinds[idx % kinds.length], illo, unit, S.palette[idx % S.palette.length]);
          var spin = .006 + Math.random() * .006, burstUntil = 0;
          (function loop() { var b = Date.now() < burstUntil ? 6 : 1; illo.rotate.y += spin * b; illo.rotate.x += spin * .6 * b; illo.updateRenderGraph(); requestAnimationFrame(loop); })();
          pieces.push({ canvas: canvas, burst: function () { burstUntil = Date.now() + 550; canvas.classList.remove('pulse'); void canvas.offsetWidth; canvas.classList.add('pulse'); } });
        })(canvas, i);
      }
    } catch (e) {}
  }

  /* ---------- the facet emblem: person / shield / gem — same icons as the portfolio's identity cards ---------- */
  function emblem() {
    if (typeof Zdog === 'undefined' || reduced) return;
    try {
      var hero = document.querySelector('header.hero') || document.querySelector('header.page-header');
      if (!hero) return;
      var placement = S.placement;
      var px = isMobile ? 76 : 104;
      var canvas = document.createElement('canvas');
      canvas.width = px; canvas.height = px; canvas.className = 'facet-emblem ' + placement; canvas.setAttribute('aria-hidden', 'true');
      if (placement === 'center') {
        var host = hero.querySelector('.hero-inner') || hero;
        host.insertBefore(canvas, host.firstChild);
      } else {
        hero.style.position = 'relative'; hero.insertBefore(canvas, hero.firstChild);
      }
      var illo = new Zdog.Illustration({ element: canvas, zoom: isMobile ? 1.15 : 1.5 });
      var c1 = S.palette[0], c2 = S.palette[2], ivory = '#f4f1e8';
      if (S.emblem === 'person') {
        new Zdog.Ellipse({ addTo: illo, diameter: 14, stroke: 5, color: c1, translate: { y: -20 } });
        var P = function (a, b, w) { edge(illo, a, b, w, c1); };
        P({x:0,y:-10,z:0},{x:0,y:16,z:0},6); P({x:0,y:-2,z:0},{x:16,y:6,z:0},4); P({x:0,y:-2,z:0},{x:-16,y:6,z:0},4);
        P({x:0,y:16,z:0},{x:10,y:30,z:0},4); P({x:0,y:16,z:0},{x:-10,y:30,z:0},4);
      } else if (S.emblem === 'shield') {
        var sp = [{x:0,y:-26,z:0},{x:18,y:-14,z:0},{x:18,y:10,z:0},{x:0,y:28,z:0},{x:-18,y:10,z:0},{x:-18,y:-14,z:0}];
        sp.forEach(function (p, i) { edge(illo, p, sp[(i + 1) % sp.length], 3.5, c1); });
        var lp = [{x:-6,y:-8,z:0},{x:6,y:-8,z:0},{x:6,y:4,z:0},{x:-6,y:4,z:0}];
        lp.forEach(function (p, i) { edge(illo, p, lp[(i + 1) % 4], 2.5, c2); });
        edge(illo, { x: 0, y: 4, z: 0 }, { x: 0, y: 12, z: 0 }, 4, c2);
      } else {
        gem(illo, 17, 22, 3, c1, c2);
      }
      var tx = .25, ty = 0, cx = .25, cy = 0, idle = Math.random() * 6, burst = 0;
      window.addEventListener('pointermove', function (e) {
        var r = canvas.getBoundingClientRect();
        var nx = (e.clientX - (r.left + r.width / 2)) / 420, ny = (e.clientY - (r.top + r.height / 2)) / 420;
        ty = Math.max(-1.1, Math.min(1.1, nx)); tx = .25 - Math.max(-.8, Math.min(.8, ny)) * .7;
      }, { passive: true });
      window.addEventListener('click', function (e) {
        var r = canvas.getBoundingClientRect();
        if (e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom) burst = 1;
      });
      (function loop() {
        idle += .012; burst *= .94;
        cx += (tx - cx) * .09; cy += (ty + Math.sin(idle) * .12 - cy) * .09;
        illo.rotate.x = cx; illo.rotate.y = cy + burst * 6.28;
        illo.updateRenderGraph(); requestAnimationFrame(loop);
      })();
      canvas.style.pointerEvents = 'none';
    } catch (e) {}
  }

  window.FacetFX = { chrome: chrome, fallingText: fallingText, falling3D: falling3D, emblem: emblem };
  chrome();                                           // immediately, so there is no layout jump
  window.addEventListener('load', function () { fallingText(); emblem(); });
})();
/* ==FACET-FX END== */
