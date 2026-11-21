/* WIZMINAR — Issue #1 */
(() => {
  const root = document.documentElement;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ---------- intro: kick off once fonts + hero images are ready ---------- */
  const heroImgs = [...document.querySelectorAll('.splash img')];
  const imgReady = heroImgs.map(img => img.complete ? Promise.resolve() : new Promise(r => { img.onload = img.onerror = r; }));
  const fontsReady = document.fonts ? document.fonts.ready : Promise.resolve();
  const timeout = new Promise(r => setTimeout(r, 1800));   // never wait forever
  Promise.race([Promise.all([...imgReady, fontsReady]), timeout])
    .then(() => requestAnimationFrame(() => root.classList.add('ready')));

  /* ---------- hero parallax ---------- */
  const splash = document.querySelector('.splash');
  const layers = [...document.querySelectorAll('.splash [data-depth]')];
  if (splash && finePointer && !reduceMotion) {
    let tx = 0, ty = 0, cx = 0, cy = 0, raf = null;
    const tick = () => {
      cx += (tx - cx) * 0.08;
      cy += (ty - cy) * 0.08;
      layers.forEach(el => {
        const d = parseFloat(el.dataset.depth);
        el.style.translate = `${(cx * d * 18).toFixed(2)}px ${(cy * d * 14).toFixed(2)}px`;
      });
      raf = (Math.abs(tx - cx) > 0.001 || Math.abs(ty - cy) > 0.001) ? requestAnimationFrame(tick) : null;
    };
    splash.addEventListener('pointermove', e => {
      const r = splash.getBoundingClientRect();
      tx = (e.clientX - r.left) / r.width - 0.5;
      ty = (e.clientY - r.top) / r.height - 0.5;
      if (!raf) raf = requestAnimationFrame(tick);
    });
    splash.addEventListener('pointerleave', () => { tx = 0; ty = 0; if (!raf) raf = requestAnimationFrame(tick); });
  }

  /* ---------- hero bubble: click to make Wiz say something else ---------- */
  const bubble = document.querySelector('.bubble--hero');
  if (bubble) {
    const lines = ["yo. i'm wiz.", 'i build stuff.', 'mostly at 3am.', 'cybersec @ iitk.', 'scroll down. go on.'];
    let i = 0;
    const text = bubble.querySelector('p');
    bubble.setAttribute('role', 'button');
    bubble.setAttribute('tabindex', '0');
    bubble.setAttribute('aria-label', 'Make Wiz say something else');
    const next = () => {
      i = (i + 1) % lines.length;
      text.textContent = lines[i];
      if (reduceMotion) return;
      bubble.style.animation = 'none';
      void bubble.offsetWidth;                     // restart the pop
      bubble.style.animation = 'pop .45s var(--ease-pop) both';
    };
    bubble.addEventListener('click', next);
    bubble.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); next(); }
    });
  }

  /* ---------- cipher card: shuffle passwords + entropy meter on hover ---------- */
  const cipherCard = document.querySelector('.card--b');
  const code = document.querySelector('[data-entropy]');
  const meter = document.querySelector('.meter');
  if (cipherCard && code && meter) {
    const samples = ['password123', 'k#9vQ!r2&Lp', 'iitk2030', 'Tr0ub4dor&3', 'v8$Ne!q2zR@m7xW', 'wizminar'];
    const entropy = s => {
      let pool = 0;
      if (/[a-z]/.test(s)) pool += 26;
      if (/[A-Z]/.test(s)) pool += 26;
      if (/\d/.test(s)) pool += 10;
      if (/[^a-zA-Z0-9]/.test(s)) pool += 33;
      return s.length * Math.log2(pool || 1);
    };
    const show = s => {
      code.textContent = s;
      const bits = entropy(s);
      meter.style.setProperty('--strength', `${Math.min(100, (bits / 100) * 100).toFixed(0)}%`);
    };
    show(samples[1]);
    let n = 1, timer = null;
    const start = () => {
      if (timer || reduceMotion) return;
      timer = setInterval(() => { n = (n + 1) % samples.length; show(samples[n]); }, 900);
    };
    const stop = () => { clearInterval(timer); timer = null; };
    cipherCard.addEventListener('pointerenter', start);
    cipherCard.addEventListener('pointerleave', stop);
    cipherCard.addEventListener('focusin', start);
    cipherCard.addEventListener('focusout', stop);
  }

  /* ---------- custom cursor ---------- */
  const cursor = document.querySelector('.cursor');
  if (cursor && finePointer) {
    root.classList.add('has-cursor');
    let x = -100, y = -100;
    window.addEventListener('pointermove', e => {
      x = e.clientX; y = e.clientY;
      cursor.style.transform = `translate(${x}px, ${y}px)`;
    }, { passive: true });
    document.addEventListener('pointerover', e => {
      cursor.classList.toggle('is-hover', !!e.target.closest('a, button, [role="button"]'));
    });
    document.addEventListener('pointerleave', () => { cursor.style.opacity = '0'; });
    document.addEventListener('pointerenter', () => { cursor.style.opacity = ''; });
  }

  /* ---------- copy email ---------- */
  const copyBtn = document.querySelector('[data-copy]');
  const status = document.querySelector('.copy__status');
  if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
      const value = copyBtn.dataset.copy;
      try {
        await navigator.clipboard.writeText(value);
        copyBtn.textContent = 'Copied';
        copyBtn.classList.add('is-done');
        status.textContent = 'Email copied to your clipboard.';
      } catch {
        status.textContent = `Couldn't copy automatically. Select the address above instead.`;
      }
      setTimeout(() => {
        copyBtn.textContent = 'Copy email';
        copyBtn.classList.remove('is-done');
        status.textContent = '';
      }, 2400);
    });
  }

  /* ---------- nav: mark the section you're reading ---------- */
  const navLinks = [...document.querySelectorAll('.nav nav a[href^="#"]')];
  // the splash (#top) has no link, so reaching it clears the highlight
  const sections = ['#top', ...navLinks.map(a => a.getAttribute('href'))]
    .map(sel => document.querySelector(sel)).filter(Boolean);
  if ('IntersectionObserver' in window && sections.length) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        navLinks.forEach(a => {
          if (a.getAttribute('href') === `#${entry.target.id}`) a.setAttribute('aria-current', 'true');
          else a.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(s => io.observe(s));
  }

  /* ---------- year ---------- */
  const year = document.querySelector('[data-year]');
  if (year) year.textContent = new Date().getFullYear();
})();
