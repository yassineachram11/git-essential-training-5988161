/* ==========================================================================
   Pilo Night — scroll engine for the pn-* sections.

   One rAF loop for the whole page. Every element with [data-pn-track] gets a
   --p custom property between 0 and 1 that says how far through it the
   visitor has scrolled; the sections turn that into motion in CSS, so the
   script never touches layout.

     data-pn-track="sticky"  0 when the element's top reaches the top of the
                             screen, 1 when its bottom reaches the bottom.
                             For tall wrappers around a position: sticky stage.
     data-pn-track="pass"    0 when the element enters at the bottom of the
                             screen, 1 when it leaves at the top.
     data-pn-steps="4"       also sets data-step="0..3" from --p.

   Also: [data-pn-reveal] fades in once, [data-pn-words] splits a heading into
   words that rise in one after another, [data-pn-count] counts up to a number.
   With reduced motion everything is shown in its final state.
   ========================================================================== */
(function () {
  'use strict';
  if (window.PiloNight) return;

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var tracked = [];
  var listeners = [];
  var ticking = false;

  function clamp(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }

  function measure() {
    var vh = window.innerHeight;
    for (var i = 0; i < tracked.length; i++) {
      var el = tracked[i];
      var r = el.getBoundingClientRect();
      if (r.bottom < -vh || r.top > vh * 2) continue;
      var p;
      if (el.getAttribute('data-pn-track') === 'sticky') {
        var span = r.height - vh;
        // No room to stick (e.g. a one-screen hero): 0 at the top of the
        // page, 1 once it has scrolled fully away.
        p = span > 8 ? clamp(-r.top / span) : clamp(-r.top / r.height);
      } else {
        p = clamp((vh - r.top) / (vh + r.height));
      }
      if (reduced) p = 1;
      if (el.__pnP === p) continue;
      el.__pnP = p;
      el.style.setProperty('--p', p.toFixed(4));
      var steps = parseInt(el.getAttribute('data-pn-steps'), 10);
      if (steps) {
        var s = Math.min(steps - 1, Math.floor(p * steps * 0.999));
        if (String(s) !== el.getAttribute('data-step')) el.setAttribute('data-step', s);
      }
      for (var j = 0; j < listeners.length; j++) {
        if (listeners[j].el === el) listeners[j].fn(p);
      }
    }
    ticking = false;
  }

  function request() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(measure);
  }

  function scan(root) {
    (root || document).querySelectorAll('[data-pn-track]').forEach(function (el) {
      if (tracked.indexOf(el) === -1) tracked.push(el);
    });

    (root || document).querySelectorAll('[data-pn-words]:not([data-pn-split])').forEach(function (el) {
      el.setAttribute('data-pn-split', '');
      var i = 0;
      (function walk(node) {
        Array.prototype.slice.call(node.childNodes).forEach(function (child) {
          if (child.nodeType === 3) {
            var frag = document.createDocumentFragment();
            child.textContent.split(/(\s+)/).forEach(function (part) {
              if (!part) return;
              if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
              var w = document.createElement('span');
              w.className = 'pn-w';
              w.style.setProperty('--i', i++);
              var inner = document.createElement('span');
              inner.textContent = part;
              w.appendChild(inner);
              frag.appendChild(w);
            });
            node.replaceChild(frag, child);
          } else if (child.nodeType === 1) {
            walk(child);
          }
        });
      })(el);
    });

    var reveal = (root || document).querySelectorAll('[data-pn-reveal], [data-pn-words], [data-pn-count]');
    if (reduced || !('IntersectionObserver' in window)) {
      reveal.forEach(function (el) { el.classList.add('is-in'); finishCount(el); });
    } else {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          e.target.classList.add('is-in');
          if (e.target.hasAttribute('data-pn-count')) count(e.target);
          io.unobserve(e.target);
        });
      }, { rootMargin: '0px 0px -10% 0px', threshold: 0.15 });
      reveal.forEach(function (el) { io.observe(el); });
    }
    request();
  }

  function finishCount(el) {
    if (el.hasAttribute('data-pn-count')) el.textContent = el.getAttribute('data-pn-count');
  }

  function count(el) {
    var target = parseFloat(el.getAttribute('data-pn-count'));
    if (isNaN(target)) { finishCount(el); return; }
    var start = null;
    var prefix = el.getAttribute('data-prefix') || '';
    (function frame(t) {
      if (!start) start = t;
      var k = Math.min(1, (t - start) / 1200);
      var eased = 1 - Math.pow(1 - k, 3);
      el.textContent = prefix + Math.round(target * eased);
      if (k < 1) window.requestAnimationFrame(frame);
    })(performance.now());
  }

  window.addEventListener('scroll', request, { passive: true });
  window.addEventListener('resize', request);

  window.PiloNight = {
    reduced: reduced,
    scan: scan,
    on: function (el, fn) { listeners.push({ el: el, fn: fn }); if (el.__pnP != null) fn(el.__pnP); request(); }
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { scan(); });
  else scan();

  document.addEventListener('shopify:section:load', function (e) { scan(e.target); });

  /* The sticky buy bar is for people who have seen the offer. Keep it out of
     the way while the hero is on screen. */
  function watchHero() {
    var hero = document.querySelector('[data-pn-hero]');
    if (!hero || !('IntersectionObserver' in window)) return;
    document.body.classList.add('pn-at-top');
    new IntersectionObserver(function (entries) {
      document.body.classList.toggle('pn-at-top', entries[0].isIntersecting);
    }, { threshold: 0.25 }).observe(hero);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', watchHero);
  else watchHero();
})();
