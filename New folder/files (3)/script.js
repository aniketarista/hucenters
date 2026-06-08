/* =====================================================
   HealingUS Centers — Interactions (optimized)
   Lenis · GSAP/ScrollTrigger · Swiper · AOS · Vanilla Tilt
   ===================================================== */
(function () {
  'use strict';
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = window.matchMedia('(hover: none)').matches;

  /* ---------- Loader ---------- */
  window.addEventListener('load', () => {
    const l = document.getElementById('loader');
    setTimeout(() => l && l.classList.add('done'), 900);
  });

  /* ---------- AOS ---------- */
  if (window.AOS) AOS.init({ duration: 750, easing: 'ease-out-cubic', once: true, offset: 90, disable: reduce });

  /* ---------- Lenis smooth scroll ---------- */
  let lenis = null;
  if (window.Lenis && !reduce) {
    lenis = new Lenis({ duration: 1.05, smoothWheel: true, lerp: 0.1 });
    const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
    if (window.ScrollTrigger) {
      lenis.on('scroll', ScrollTrigger.update);
    }
  }

  /* ---------- Anchor smooth scrolling ---------- */
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id.length < 2) return;
      const t = document.querySelector(id);
      if (!t) return;
      e.preventDefault();
      closeMenu();
      const y = t.getBoundingClientRect().top + window.pageYOffset - 70;
      if (lenis) lenis.scrollTo(y, { duration: 1.15 });
      else window.scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  /* ---------- Nav scrolled state + scroll progress bar (rAF-batched) ---------- */
  const nav = document.getElementById('nav');
  const bar = document.getElementById('scrollProgress');
  let ticking = false;
  function onScrollFrame() {
    const y = window.scrollY;
    if (nav) nav.classList.toggle('scrolled', y > 30);
    if (bar) {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = (h > 0 ? (y / h) * 100 : 0) + '%';
    }
    ticking = false;
  }
  window.addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(onScrollFrame); }
  }, { passive: true });
  onScrollFrame();

  /* ---------- Mobile menu ---------- */
  const burger = document.getElementById('burger');
  const links = document.getElementById('navLinks');
  function closeMenu() {
    if (!burger) return;
    burger.classList.remove('open');
    links.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
  }
  burger && burger.addEventListener('click', () => {
    const open = burger.classList.toggle('open');
    links.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', String(open));
  });

  /* ---------- Hero particles (lighter count) ---------- */
  const pc = document.getElementById('particles');
  if (pc && !reduce && !isTouch) {
    const frag = document.createDocumentFragment();
    for (let i = 0; i < 16; i++) {
      const p = document.createElement('span');
      p.className = 'particle';
      const s = Math.random() * 5 + 2;
      p.style.width = p.style.height = s + 'px';
      p.style.left = Math.random() * 100 + '%';
      p.style.top = Math.random() * 100 + '%';
      p.style.animationDuration = (Math.random() * 8 + 6) + 's';
      p.style.animationDelay = (Math.random() * 6) + 's';
      frag.appendChild(p);
    }
    pc.appendChild(frag);
  }

  /* ---------- Mouse parallax — chips only, rAF-throttled ----------
     (Hero/section background images are owned by GSAP scroll-parallax;
      keeping them off the mouse handler avoids transform thrashing.) */
  const mouseLayers = document.querySelectorAll('[data-parallax-layer]');
  if (!isTouch && !reduce && mouseLayers.length) {
    let mx = 0, my = 0, mTick = false;
    const apply = () => {
      mouseLayers.forEach((el) => {
        const d = parseFloat(el.dataset.parallaxLayer) || 0.05;
        el.style.transform = `translate3d(${mx * d * 60}px, ${my * d * 60}px, 0)`;
      });
      mTick = false;
    };
    window.addEventListener('mousemove', (e) => {
      mx = e.clientX / window.innerWidth - 0.5;
      my = e.clientY / window.innerHeight - 0.5;
      if (!mTick) { mTick = true; requestAnimationFrame(apply); }
    }, { passive: true });
  }

  /* ---------- Vanilla Tilt — curated, no glare (cheaper) ---------- */
  if (window.VanillaTilt && !isTouch && !reduce) {
    const tiltEls = document.querySelectorAll(
      '.verify-card[data-tilt], .amenities__img[data-tilt], .condition-card[data-tilt], .therapies__photo[data-tilt]'
    );
    VanillaTilt.init(tiltEls, { max: 5, speed: 500, glare: false, scale: 1.01 });
  }

  /* ---------- GSAP ScrollTrigger ---------- */
  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);

    if (!reduce) {
      // 1. Background scroll-parallax (single owner of these transforms)
      gsap.utils.toArray('.hero__bg, .conditions__bg').forEach((bg) => {
        gsap.to(bg, {
          yPercent: 12, ease: 'none',
          scrollTrigger: { trigger: bg.parentElement, start: 'top top', end: 'bottom top', scrub: true }
        });
      });

      // 2. Aurora drift on dark sections
      gsap.utils.toArray('.journey__aurora, .impact__aurora').forEach((a) => {
        gsap.fromTo(a, { yPercent: -8 }, {
          yPercent: 8, ease: 'none',
          scrollTrigger: { trigger: a.parentElement, start: 'top bottom', end: 'bottom top', scrub: true }
        });
      });

      // 3. Image scroll-parallax inside fixed frames (transform-only, clipped)
      gsap.utils.toArray('.therapies__photo, .amenities__img').forEach((frame) => {
        const img = frame.querySelector('img');
        if (!img) return;
        frame.classList.add('par-frame');
        img.classList.add('par-img');
        gsap.set(img, { scale: 1.16 });
        gsap.fromTo(img, { yPercent: -7 }, {
          yPercent: 7, ease: 'none',
          scrollTrigger: { trigger: frame, start: 'top bottom', end: 'bottom top', scrub: true }
        });
      });

      // 4. Floating hero chips drift away on scroll (depth)
      gsap.utils.toArray('.hero__float').forEach((chip, i) => {
        gsap.to(chip, {
          yPercent: (i % 2 === 0 ? -40 : 40), opacity: 0, ease: 'none',
          scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
        });
      });

      // 5. Section heading rise-in (subtle)
      gsap.utils.toArray('.section-title').forEach((el) => {
        gsap.from(el, {
          y: 28, opacity: 0, duration: .9, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 90%' }
        });
      });
    }

    // 7. Animated timeline progress line
    const tl = document.getElementById('timeline');
    const prog = document.getElementById('timelineProgress');
    if (tl && prog) {
      const horizontal = window.innerWidth > 860;
      ScrollTrigger.create({
        trigger: tl, start: 'top 75%', end: 'bottom 60%', scrub: 0.6,
        onUpdate: (self) => {
          const v = (self.progress * 100).toFixed(1) + '%';
          if (horizontal) prog.style.width = (self.progress * 78).toFixed(1) + '%';
          else prog.style.height = v;
        }
      });
      gsap.utils.toArray('.tl-step__num').forEach((n, i) => {
        gsap.from(n, {
          scale: 0, opacity: 0, duration: .5, ease: 'back.out(1.7)',
          scrollTrigger: { trigger: n, start: 'top 85%' }, delay: i * 0.04
        });
      });
    }

    // keep triggers accurate after images/fonts settle
    window.addEventListener('load', () => ScrollTrigger.refresh());

    // 8. Pinned showcase — switch panels/media by scroll progress
    const scTrack = document.getElementById('scTrack');
    if (scTrack) {
      const panels = document.querySelectorAll('.sc-panel');
      const medias = document.querySelectorAll('.sc-media');
      const steps = document.querySelectorAll('.sc-step');
      const countEl = document.getElementById('scCount');
      const progEl = document.getElementById('scProgress');
      const N = panels.length;
      let current = -1;

      const setActive = (i) => {
        if (i === current) return;
        current = i;
        panels.forEach((p, k) => p.classList.toggle('is-active', k === i));
        medias.forEach((m, k) => m.classList.toggle('is-active', k === i));
        steps.forEach((s, k) => s.classList.toggle('is-active', k === i));
        if (countEl) countEl.textContent = String(i + 1).padStart(2, '0');
      };
      setActive(0);

      const st = ScrollTrigger.create({
        trigger: scTrack, start: 'top top', end: 'bottom bottom', scrub: true,
        onUpdate: (self) => {
          const idx = Math.min(N - 1, Math.floor(self.progress * N));
          setActive(idx);
          if (progEl) progEl.style.width = (self.progress * 100) + '%';
        }
      });

      // click a step -> jump to that segment
      steps.forEach((s, k) => {
        s.addEventListener('click', () => {
          const r = scTrack.getBoundingClientRect();
          const top = r.top + window.pageYOffset;
          const seg = scTrack.offsetHeight - window.innerHeight;
          const y = top + seg * ((k + 0.5) / N);
          if (lenis) lenis.scrollTo(y, { duration: 1 });
          else window.scrollTo({ top: y, behavior: 'smooth' });
        });
      });
    }
  }

  /* ---------- Animated counters ---------- */
  const counters = document.querySelectorAll('[data-count]');
  const animateCount = (el) => {
    const target = parseFloat(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    const dur = 1600, start = performance.now();
    const step = (now) => {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { animateCount(en.target); io.unobserve(en.target); }
      });
    }, { threshold: 0.5 });
    counters.forEach((c) => io.observe(c));
  } else counters.forEach(animateCount);

  /* ---------- Swiper testimonials (Coverflow) ---------- */
  if (window.Swiper) {
    const slideCount = document.querySelectorAll('.storiesSwiper .swiper-slide').length;
    const nextBtn = document.querySelector('.swiper-button-next');
    const prevBtn = document.querySelector('.swiper-button-prev');
    const storiesSwiper = new Swiper('.storiesSwiper', {
      effect: 'coverflow',
      grabCursor: true,
      centeredSlides: true,
      slidesPerView: 'auto',
      loop: slideCount > 2,
      loopAdditionalSlides: 2,
      speed: 650,
      coverflowEffect: { rotate: 0, stretch: 0, depth: 160, modifier: 1.8, slideShadows: false },
      autoplay: reduce ? false : { delay: 3500, disableOnInteraction: false, pauseOnMouseEnter: true },
      pagination: { el: '.swiper-pagination', clickable: true }
      // navigation handled manually below so the external buttons always work
    });
    // Bind arrows directly to the instance — guaranteed to work even though
    // the buttons live outside the .swiper container.
    nextBtn && nextBtn.addEventListener('click', (e) => {
      e.preventDefault();
      storiesSwiper.slideNext();
      if (storiesSwiper.autoplay) storiesSwiper.autoplay.start();
    });
    prevBtn && prevBtn.addEventListener('click', (e) => {
      e.preventDefault();
      storiesSwiper.slidePrev();
      if (storiesSwiper.autoplay) storiesSwiper.autoplay.start();
    });
  }

  /* ---------- Logo / badge slots: show name text until real image is added ---------- */
  document.querySelectorAll('img[data-fallback="logo"], img[data-fallback="badge"]').forEach((img) => {
    img.addEventListener('error', function handle() {
      img.removeEventListener('error', handle);
      const span = document.createElement('span');
      span.className = img.dataset.fallback === 'badge' ? 'badge-name' : 'logo-name';
      span.textContent = img.alt || '';
      img.replaceWith(span);
    });
  });

  /* ---------- Image fallback: paint a brand-gradient tile (never raw alt text) ---------- */
  const GRAD_SVG = "data:image/svg+xml," + encodeURIComponent(
    "<svg xmlns='http://www.w3.org/2000/svg' width='40' height='50'>" +
    "<defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>" +
    "<stop offset='0' stop-color='#0F4C81'/><stop offset='0.55' stop-color='#1E88E5'/>" +
    "<stop offset='1' stop-color='#00C896'/></linearGradient></defs>" +
    "<rect width='40' height='50' fill='url(#g)'/>" +
    "<circle cx='20' cy='25' r='9' fill='none' stroke='rgba(255,255,255,.5)' stroke-width='1.4'/>" +
    "<path d='M20 19c-1.4-1.8-4-1.2-4 1 0 1.9 2.6 3.5 4 4.6 1.4-1.1 4-2.7 4-4.6 0-2.2-2.6-2.8-4-1z' fill='rgba(255,255,255,.6)'/>" +
    "</svg>"
  );
  document.querySelectorAll('img[data-fallback="grad"]').forEach((img) => {
    img.addEventListener('error', function handle() {
      img.removeEventListener('error', handle);
      const host = img.closest('.hero__bg, .conditions__bg');
      if (host) { host.classList.add('grad-fallback'); return; }
      img.alt = '';
      img.src = GRAD_SVG;        // tasteful gradient, fills via object-fit:cover
      img.style.objectFit = 'cover';
      img.classList.add('img-broken');
    });
  });

  /* ---------- Lightbox ---------- */
  const lb = document.getElementById('lightbox');
  const lbImg = document.getElementById('lightboxImg');
  document.querySelectorAll('.masonry__item img').forEach((img) => {
    img.closest('.masonry__item').addEventListener('click', () => {
      if (!img.currentSrc && !img.src) return;
      lbImg.src = img.currentSrc || img.src;
      lbImg.alt = img.alt || '';
      lb.classList.add('open');
      lb.setAttribute('aria-hidden', 'false');
    });
  });
  const closeLb = () => { lb.classList.remove('open'); lb.setAttribute('aria-hidden', 'true'); };
  lb && lb.addEventListener('click', (e) => { if (e.target === lb || e.target.classList.contains('lightbox__close')) closeLb(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { closeLb(); closeMenu(); } });

  /* ---------- Magnetic buttons (rAF-friendly, transform only) ---------- */
  if (!isTouch && !reduce) {
    document.querySelectorAll('.magnetic').forEach((btn) => {
      btn.addEventListener('mousemove', (e) => {
        const r = btn.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        btn.style.transform = `translate(${x * 0.18}px, ${y * 0.28}px)`;
      });
      btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
    });
  }

  /* ---------- Custom cursor ---------- */
  const dot = document.querySelector('.cursor-dot');
  const ring = document.querySelector('.cursor-ring');
  if (dot && ring && !isTouch && !reduce) {
    let rx = 0, ry = 0, x = 0, y = 0, active = false;
    window.addEventListener('mousemove', (e) => {
      x = e.clientX; y = e.clientY; active = true;
      dot.style.transform = `translate(${x}px,${y}px) translate(-50%,-50%)`;
    }, { passive: true });
    const loop = () => {
      if (active) {
        rx += (x - rx) * 0.16; ry += (y - ry) * 0.16;
        ring.style.transform = `translate(${rx}px,${ry}px) translate(-50%,-50%)`;
      }
      requestAnimationFrame(loop);
    };
    loop();
    document.querySelectorAll('a,button,[data-tilt],.masonry__item,input,label').forEach((el) => {
      el.addEventListener('mouseenter', () => ring.classList.add('is-hover'));
      el.addEventListener('mouseleave', () => ring.classList.remove('is-hover'));
    });
  } else {
    document.body.classList.add('no-cursor');
  }

  /* ---------- Form validation + success ---------- */
  function wireForm(form, onSuccess) {
    if (!form) return;
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let valid = true;
      form.querySelectorAll('input[required]').forEach((inp) => {
        const field = inp.closest('.field') || inp.parentElement;
        const ok = inp.type === 'checkbox' ? inp.checked : inp.value.trim() !== '';
        field.classList.toggle('error', !ok);
        if (!ok) valid = false;
      });
      if (!valid) {
        const first = form.querySelector('.error input');
        first && first.focus();
        return;
      }
      onSuccess(form);
    });
    form.querySelectorAll('input').forEach((inp) => {
      inp.addEventListener('input', () => {
        const f = inp.closest('.field') || inp.parentElement;
        f.classList.remove('error');
      });
    });
  }

  wireForm(document.querySelector('[data-mini]'), () => {
    const t = document.getElementById('verify');
    const yy = t.getBoundingClientRect().top + window.pageYOffset - 60;
    if (lenis) lenis.scrollTo(yy, { duration: 1.15 }); else window.scrollTo({ top: yy, behavior: 'smooth' });
  });

  const mainForm = document.getElementById('mainForm');
  const success = document.getElementById('formSuccess');
  wireForm(mainForm, () => {
    if (mainForm && success) {
      mainForm.style.display = 'none';
      success.hidden = false;
      success.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
    }
  });

})();
