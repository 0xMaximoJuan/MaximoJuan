(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Tema ---------- */
  const root = document.documentElement;
  const setTheme = t => {
    root.dataset.theme = t;
    try { localStorage.setItem('theme', t); } catch (e) {}
    $$('.dot').forEach(d => d.setAttribute('aria-pressed', d.dataset.t === t));
    drawColor();
  };
  $$('.dot').forEach(d => d.addEventListener('click', () => setTheme(d.dataset.t)));

  /* ---------- Fondo de píxeles ---------- */
  const cv = $('#bg'), cx = cv.getContext('2d');
  let W, H, cells = [], color = '47,139,255';
  const SZ = 36;
  function drawColor() {
    const hex = getComputedStyle(root).getPropertyValue('--a').trim();
    const n = parseInt(hex.slice(1), 16);
    color = `${n >> 16},${(n >> 8) & 255},${n & 255}`;
  }
  function resize() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    W = cv.width = innerWidth * dpr; H = cv.height = innerHeight * dpr;
    cx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const cols = Math.ceil(innerWidth / SZ), rows = Math.ceil(innerHeight / SZ);
    cells = Array.from({ length: Math.floor(cols * rows * 0.05) }, () => ({
      x: Math.floor(Math.random() * cols) * SZ, y: Math.floor(Math.random() * rows) * SZ,
      p: Math.random() * Math.PI * 2, v: .004 + Math.random() * .012
    }));
  }
  function frame() {
    cx.clearRect(0, 0, innerWidth, innerHeight);
    cx.strokeStyle = 'rgba(255,255,255,.035)'; cx.lineWidth = 1; cx.beginPath();
    for (let x = 0; x < innerWidth; x += SZ) { cx.moveTo(x + .5, 0); cx.lineTo(x + .5, innerHeight); }
    for (let y = 0; y < innerHeight; y += SZ) { cx.moveTo(0, y + .5); cx.lineTo(innerWidth, y + .5); }
    cx.stroke();
    for (const c of cells) {
      c.p += c.v;
      const a = (Math.sin(c.p) + 1) / 2 * .22;
      cx.fillStyle = `rgba(${color},${a})`;
      cx.fillRect(c.x + 2, c.y + 2, SZ - 4, SZ - 4);
    }
    if (!reduce) requestAnimationFrame(frame);
  }
  addEventListener('resize', resize);

  /* ---------- Navbar, scroll, progreso, scrollspy ---------- */
  const nav = $('#nav'), bar = $('#progressBar');
  const links = $$('.nav__links a[href^="#"]');
  const secs = links.map(a => $(a.getAttribute('href'))).filter(Boolean);
  function onScroll() {
    const y = scrollY, h = document.documentElement.scrollHeight - innerHeight;
    nav.classList.toggle('is-stuck', y > 20);
    bar.style.width = (h > 0 ? y / h * 100 : 0) + '%';
  }
  addEventListener('scroll', onScroll, { passive: true });
  const spy = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) links.forEach(a => a.classList.toggle('is-active', a.getAttribute('href') === '#' + e.target.id));
  }), { rootMargin: '-45% 0px -50% 0px' });
  secs.forEach(s => spy.observe(s));

  /* menú móvil */
  const burger = $('#burger'), menu = $('#navLinks');
  const closeMenu = () => { menu.classList.remove('open'); burger.setAttribute('aria-expanded', 'false'); };
  burger.addEventListener('click', () => {
    const o = menu.classList.toggle('open');
    burger.setAttribute('aria-expanded', o);
  });
  links.forEach(a => a.addEventListener('click', closeMenu));
  addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });

  /* ---------- Reveal ---------- */
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { threshold: .12 });
  $$('.reveal').forEach((el, i) => { el.style.transitionDelay = (i % 3) * 80 + 'ms'; io.observe(el); });

  /* ---------- Contadores ---------- */
  const co = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    co.unobserve(e.target);
    const el = e.target, end = +el.dataset.count, t0 = performance.now(), d = 1400;
    if (reduce) { el.textContent = end; return; }
    (function tick(t) {
      const p = Math.min((t - t0) / d, 1);
      el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(tick);
    })(t0);
  }), { threshold: .6 });
  $$('[data-count]').forEach(el => co.observe(el));

  /* ---------- Texto que cambia en el título ---------- */
  const words = ['servidores', 'plugins de Java', 'bots de Discord', 'modalidades'];
  const typed = $('#typed');
  if (!reduce) {
    let w = 0, c = 0, del = false;
    (function loop() {
      const word = words[w];
      typed.textContent = word.slice(0, c);
      if (!del && c === word.length) { del = true; return setTimeout(loop, 1700); }
      if (del && c === 0) { del = false; w = (w + 1) % words.length; return setTimeout(loop, 300); }
      c += del ? -1 : 1;
      setTimeout(loop, del ? 40 : 80);
    })();
  }

  /* ---------- Terminal ---------- */
  const lines = [
    ['p', '$ whoami'], ['', 'MaximoJuan — Minecraft Developer'], ['', ''],
    ['p', '$ cat experiencia.txt'], ['s', '+2 años · plugins · bots · modalidades'], ['', ''],
    ['p', '$ ls trayectoria/'], ['', 'CandyMC  Fenixen  PandaMC'], ['', 'NightBox  MineNinja  OjoLatam'], ['', ''],
    ['p', '$ ./deploy.sh --target production'], ['c', '# build ok · servidor en línea'], ['p', '$ ▍']
  ];
  const code = $('#term code');
  function esc(s) { return s.replace(/[&<>]/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[m])); }
  if (reduce) {
    code.innerHTML = lines.map(([k, t]) => `<span class="${k}">${esc(t)}</span>`).join('\n');
  } else {
    let li = 0, ci = 0, html = '';
    (function type() {
      if (li >= lines.length) return;
      const [k, t] = lines[li];
      if (ci <= t.length) {
        code.innerHTML = html + `<span class="${k}">${esc(t.slice(0, ci))}</span>`;
        ci++; setTimeout(type, k === 'p' ? 38 : 14);
      } else {
        html += `<span class="${k}">${esc(t)}</span>\n`; li++; ci = 0; setTimeout(type, 160);
      }
    })();
  }

  /* ---------- Filtro de proyectos ---------- */
  $$('.chip').forEach(ch => ch.addEventListener('click', () => {
    $$('.chip').forEach(x => { x.classList.remove('is-on'); x.setAttribute('aria-pressed', 'false'); });
    ch.classList.add('is-on'); ch.setAttribute('aria-pressed', 'true');
    $$('.proj').forEach(p => { p.hidden = ch.dataset.f !== 'all' && p.dataset.k !== ch.dataset.f; });
  }));

  /* ---------- Copiar contacto ---------- */
  const toast = $('#toast');
  $$('.copy').forEach(b => b.addEventListener('click', async () => {
    const v = b.dataset.copy;
    try { await navigator.clipboard.writeText(v); } catch (e) {
      const t = document.createElement('textarea'); t.value = v; document.body.append(t); t.select(); document.execCommand('copy'); t.remove();
    }
    toast.textContent = 'Copiado: ' + v; toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 1800);
  }));

  /* ---------- Init ---------- */
  let saved = 'azul';
  try { saved = localStorage.getItem('theme') || 'azul'; } catch (e) {}
  setTheme(saved);
  resize(); frame(); onScroll();
})();
