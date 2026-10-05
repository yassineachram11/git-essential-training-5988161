(() => {
  document.documentElement.classList.add('js');

  // Announcement rotator
  document.querySelectorAll('[data-rotator]').forEach((track) => {
    const items = track.querySelectorAll('.announce__item');
    if (items.length < 2 || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let i = 0;
    setInterval(() => {
      items[i].classList.remove('is-active');
      i = (i + 1) % items.length;
      items[i].classList.add('is-active');
    }, 4000);
  });

  // Exploded layers: animate when visible
  const svgs = document.querySelectorAll('.layers-svg');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } });
    }, { threshold: 0.35 });
    svgs.forEach((s) => io.observe(s));
  } else {
    svgs.forEach((s) => s.classList.add('is-in'));
  }

  // Tabs
  document.querySelectorAll('[data-tabs]').forEach((tabs) => {
    const btns = [...tabs.querySelectorAll('[role=tab]')];
    const select = (btn) => {
      btns.forEach((b) => {
        const on = b === btn;
        b.setAttribute('aria-selected', on);
        b.tabIndex = on ? 0 : -1;
        document.getElementById(b.getAttribute('aria-controls')).hidden = !on;
      });
    };
    btns.forEach((b, idx) => {
      b.addEventListener('click', () => select(b));
      b.addEventListener('keydown', (e) => {
        const dir = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
        if (!dir) return;
        const next = btns[(idx + dir + btns.length) % btns.length];
        next.focus();
        select(next);
      });
    });
  });

  // Product: gallery + pack picker + sticky bar
  document.querySelectorAll('[data-product]').forEach((root) => {
    root.querySelectorAll('[data-thumb]').forEach((thumb) => {
      thumb.addEventListener('click', () => {
        const id = thumb.dataset.thumb;
        root.querySelectorAll('.gallery__slide').forEach((s) => {
          const on = s.dataset.mediaId === id;
          s.hidden = !on;
          s.classList.toggle('is-active', on);
        });
        root.querySelectorAll('[data-thumb]').forEach((t) => t.classList.toggle('is-active', t === thumb));
      });
    });

    const idInput = root.querySelector('[data-variant-id]');
    const price = root.querySelector('[data-price]');
    const compare = root.querySelector('[data-compare]');
    const save = root.querySelector('[data-save]');
    const stickyPrice = root.querySelector('[data-sticky-price]');
    root.querySelectorAll('input[name="pilo-variant"]').forEach((radio) => {
      radio.addEventListener('change', () => {
        if (!radio.checked) return;
        idInput.value = radio.value;
        if (price) price.textContent = radio.dataset.price;
        if (stickyPrice) stickyPrice.textContent = radio.dataset.price;
        if (compare) { compare.textContent = radio.dataset.compare; compare.hidden = !radio.dataset.compare; }
        if (save) { save.textContent = radio.dataset.save; save.hidden = !radio.dataset.save; }
        const wa = root.querySelector('[data-wa-order]');
        if (wa) {
          const msg = wa.dataset.waTemplate.replace('[pack]', radio.dataset.title);
          wa.href = `${wa.dataset.waBase}?text=${encodeURIComponent(msg)}`;
        }
        if (document.body.classList.contains('template-product')) {
          const url = new URL(location.href);
          url.searchParams.set('variant', radio.value);
          history.replaceState(null, '', url);
        }
      });
    });

    const sticky = root.querySelector('[data-sticky-buy]');
    const form = root.querySelector('[data-product-form]');
    if (sticky && form && 'IntersectionObserver' in window) {
      new IntersectionObserver(([e]) => {
        sticky.hidden = e.isIntersecting || e.boundingClientRect.top > 0;
      }).observe(form);
      sticky.querySelector('[data-sticky-trigger]').addEventListener('click', () => {
        form.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
    }
  });

  // Dispatch cutoff countdown (Beirut time)
  document.querySelectorAll('[data-dispatch]').forEach((el) => {
    const out = el.querySelector('[data-dispatch-text]');
    const cutoff = Number(el.dataset.cutoff);
    const closed = (el.dataset.closed || '').split(',').map((d) => d.trim()).filter(Boolean).map(Number);
    const tick = () => {
      let parts;
      try {
        parts = Object.fromEntries(new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Beirut', weekday: 'short', hour: 'numeric', minute: 'numeric', hourCycle: 'h23' })
          .formatToParts(new Date()).map((x) => [x.type, x.value]));
      } catch (e) { return; }
      const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(parts.weekday);
      const mins = cutoff * 60 - (Number(parts.hour) * 60 + Number(parts.minute));
      if (!closed.includes(day) && mins > 0) {
        const h = Math.floor(mins / 60), m = mins % 60;
        out.textContent = el.dataset.before.replace('[time]', h ? `${h}h ${m}m` : `${m}m`);
      } else {
        out.textContent = el.dataset.after.replace('[time]', '');
      }
    };
    tick();
    setInterval(tick, 30000);
  });

  // Sticky header shadow
  const hdr = document.querySelector('[data-sticky-header]');
  if (hdr) {
    addEventListener('scroll', () => hdr.classList.toggle('is-scrolled', scrollY > 8), { passive: true });
  }
})();
