/* ═══════════════════════════════════════════════════════════
   HNX FRAMES — main.js  (final with real images)
═══════════════════════════════════════════════════════════ */
(() => {
  'use strict';

  /* ── CURSOR ──────────────────────────────────────────────── */
  const cursor   = document.getElementById('cursor');
  const follower = document.getElementById('cursor-follower');
  let mx = 0, my = 0, fx = 0, fy = 0;
  if (cursor && follower && window.matchMedia('(pointer:fine)').matches) {
    document.addEventListener('mousemove', e => {
      mx = e.clientX; my = e.clientY;
      cursor.style.left = mx + 'px';
      cursor.style.top  = my + 'px';
    });
    const tick = () => {
      fx += (mx - fx) * 0.1;
      fy += (my - fy) * 0.1;
      follower.style.left = fx + 'px';
      follower.style.top  = fy + 'px';
      requestAnimationFrame(tick);
    };
    tick();
  }

  /* ── NAV SCROLL ──────────────────────────────────────────── */
  const nav = document.getElementById('nav');
  const syncNav = () => nav.classList.toggle('scrolled', window.scrollY > 40);
  window.addEventListener('scroll', syncNav, { passive: true });
  syncNav();

  /* ── MOBILE NAV ──────────────────────────────────────────── */
  const toggle   = document.getElementById('nav-toggle');
  const navLinks = document.getElementById('nav-links');
  toggle?.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
    const [s0, s1, s2] = toggle.querySelectorAll('span');
    if (open) {
      s0.style.cssText = 'transform:translateY(6.5px) rotate(45deg)';
      s1.style.cssText = 'opacity:0';
      s2.style.cssText = 'transform:translateY(-6.5px) rotate(-45deg)';
    } else { [s0, s1, s2].forEach(s => s.style.cssText = ''); }
  });
  navLinks?.querySelectorAll('a').forEach(a =>
    a.addEventListener('click', () => {
      navLinks.classList.remove('open');
      toggle.querySelectorAll('span').forEach(s => s.style.cssText = '');
    })
  );

  /* ── REVEAL ──────────────────────────────────────────────── */
  const revealEls = document.querySelectorAll('.reveal');
  const revealIO = new IntersectionObserver(
    entries => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); revealIO.unobserve(e.target); } }),
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );
  revealEls.forEach(el => revealIO.observe(el));

  /* ── COUNTERS ────────────────────────────────────────────── */
  document.querySelectorAll('.stat-num[data-count]').forEach(el => {
    new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      const end = +el.dataset.count, dur = 1800, t0 = performance.now();
      const step = now => {
        const p = Math.min((now - t0) / dur, 1);
        el.textContent = Math.floor((1 - Math.pow(1 - p, 3)) * end);
        p < 1 ? requestAnimationFrame(step) : (el.textContent = end);
      };
      requestAnimationFrame(step);
      e.target._io?.disconnect();
    }, { threshold: 0.5 }).observe(el);
  });

  /* ── GALLERY FILTER ──────────────────────────────────────── */
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const f = btn.dataset.filter;
      document.querySelectorAll('.gallery-item').forEach(item => {
        const show = f === 'all' || item.dataset.category === f;
        item.style.transition = 'opacity .4s, transform .4s';
        item.style.opacity    = show ? '1' : '0.12';
        item.style.transform  = show ? 'scale(1)' : 'scale(0.97)';
        item.style.pointerEvents = show ? 'all' : 'none';
      });
    });
  });

  /* ── BUILD MASTER IMAGE LIST (gallery + hidden) ──────────── */
  const buildImageList = () => {
    const list = [];
    document.querySelectorAll('.gallery-item[data-index]').forEach(item => {
      const img = item.querySelector('img');
      list.push({
        src:   img?.src || '',
        alt:   img?.alt || '',
        title: item.dataset.title || '',
        sub:   item.dataset.sub   || '',
        tag:   item.dataset.tag   || '',
        index: +item.dataset.index
      });
    });
    document.querySelectorAll('.gallery-hidden [data-index]').forEach(item => {
      const img = item.querySelector('img');
      list.push({
        src:   img?.src || '',
        alt:   img?.alt || '',
        title: item.dataset.title || '',
        sub:   item.dataset.sub   || '',
        tag:   item.dataset.tag   || '',
        index: +item.dataset.index
      });
    });
    return list.sort((a, b) => a.index - b.index);
  };

  /* ── LIGHTBOX ────────────────────────────────────────────── */
  const lightbox  = document.getElementById('lightbox');
  const lbContent = document.getElementById('lightbox-content');
  const lbCaption = document.getElementById('lightbox-caption');
  const lbClose   = document.getElementById('lightbox-close');
  const lbPrev    = document.getElementById('lightbox-prev');
  const lbNext    = document.getElementById('lightbox-next');
  let allImages = [], currentIdx = 0;

  const openLightbox = idx => {
    allImages = buildImageList();
    currentIdx = Math.max(0, Math.min(idx, allImages.length - 1));
    const item = allImages[currentIdx];
    lbContent.innerHTML = '';
    if (item?.src) {
      const img = document.createElement('img');
      img.src = item.src;
      img.alt = item.alt;
      img.style.cssText = 'max-width:90vw;max-height:82vh;object-fit:contain;border-radius:4px;display:block;';
      lbContent.appendChild(img);
    }
    lbCaption.textContent = [item?.tag, item?.title, item?.sub].filter(Boolean).join(' · ');
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  const step = dir => openLightbox((currentIdx + dir + allImages.length) % allImages.length);

  // Open on gallery item click or zoom button
  document.querySelectorAll('.gallery-item').forEach((item, i) => {
    const open = () => openLightbox(+item.dataset.index || i);
    item.addEventListener('click', open);
    item.querySelector('.gallery-zoom')?.addEventListener('click', e => { e.stopPropagation(); open(); });
  });

  lbClose?.addEventListener('click', closeLightbox);
  lbPrev?.addEventListener('click',  () => step(-1));
  lbNext?.addEventListener('click',  () => step(1));
  lightbox?.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', e => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape')     closeLightbox();
    if (e.key === 'ArrowLeft')  step(-1);
    if (e.key === 'ArrowRight') step(1);
  });
  let tsX = 0;
  lightbox?.addEventListener('touchstart', e => tsX = e.touches[0].clientX, { passive: true });
  lightbox?.addEventListener('touchend',   e => { const dx = e.changedTouches[0].clientX - tsX; if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1); });

  /* ── HERO PARALLAX ───────────────────────────────────────── */
  const heroBg = document.querySelector('.hero-bg');
  if (heroBg && window.matchMedia('(prefers-reduced-motion:no-preference)').matches) {
    window.addEventListener('scroll', () => {
      if (window.scrollY < window.innerHeight)
        heroBg.style.transform = `translateY(${window.scrollY * 0.28}px)`;
    }, { passive: true });
  }

  /* ── SMOOTH ANCHOR SCROLL ────────────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const t = document.querySelector(a.getAttribute('href'));
      if (!t) return;
      e.preventDefault();
      const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 72;
      window.scrollTo({ top: t.getBoundingClientRect().top + window.scrollY - navH, behavior: 'smooth' });
    });
  });

  /* ── CONTACT FORM ────────────────────────────────────────── */
  const form    = document.getElementById('contact-form');
  const btnText = form?.querySelector('.btn-text');
  const btnLoad = form?.querySelector('.btn-loading');
  form?.addEventListener('submit', async e => {
    e.preventDefault();
    if (!form.name.value.trim() || !form.email.value.trim()) return;
    btnText.hidden = true; btnLoad.hidden = false;
    form.querySelector('button[type=submit]').disabled = true;
    await new Promise(r => setTimeout(r, 1200));
    // ← swap line above with real Formspree fetch when ready:
    // await fetch('https://formspree.io/f/YOUR_ID', { method:'POST', headers:{'Accept':'application/json'}, body: new FormData(form) });
    form.innerHTML = `
      <div style="text-align:center;padding:48px 0">
        <div style="font-size:36px;margin-bottom:16px;color:var(--gold)">✦</div>
        <h3 style="font-family:'Cormorant Garamond',serif;font-size:26px;color:#fafafa;margin-bottom:10px">Message Sent</h3>
        <p style="font-size:13px;color:rgba(250,250,250,0.4);letter-spacing:.1em">I'll be in touch within 24 hours.</p>
        <p style="margin-top:12px;font-size:12px;color:rgba(250,250,250,0.25)">Or reach me directly on WhatsApp: +971 54 273 3164</p>
      </div>`;
  });

  /* ── CARD TILT ───────────────────────────────────────────── */
  document.querySelectorAll('.reel-card,.service-card,.testimonial-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      if (window.innerWidth < 768) return;
      const r = card.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width  - 0.5) * 5;
      const y = ((e.clientY - r.top)  / r.height - 0.5) * 5;
      card.style.transform = `perspective(900px) rotateY(${x}deg) rotateX(${-y}deg) translateY(-4px)`;
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  });

  /* ── MARQUEE PAUSE ───────────────────────────────────────── */
  const track = document.querySelector('.marquee-track');
  track?.addEventListener('mouseenter', () => track.style.animationPlayState = 'paused');
  track?.addEventListener('mouseleave', () => track.style.animationPlayState = 'running');

  /* ── ACTIVE NAV HIGHLIGHT ────────────────────────────────── */
  const sections   = document.querySelectorAll('section[id]');
  const navAnchors = document.querySelectorAll('.nav-link:not(.nav-cta)');
  new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        navAnchors.forEach(a => {
          a.style.color = a.getAttribute('href') === `#${e.target.id}` ? 'var(--gold)' : '';
        });
      }
    });
  }, { threshold: 0.4 }).observe;
  sections.forEach(s => {
    new IntersectionObserver(([e]) => {
      if (e.isIntersecting)
        navAnchors.forEach(a => { a.style.color = a.getAttribute('href') === `#${s.id}` ? 'var(--gold)' : ''; });
    }, { threshold: 0.4 }).observe(s);
  });

  /* ── PAGE FADE IN ────────────────────────────────────────── */
  document.body.style.opacity = '0';
  document.body.style.transition = 'opacity 0.5s ease';
  window.addEventListener('load', () => {
    document.body.style.opacity = '1';
    revealEls.forEach(el => {
      if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add('visible');
    });
  });

})();
