/* ==========================================================================
   AZURE — theme.js
   Vanilla JS only. No dependencies, no framework.
   Modules: scroll reveal, sticky header, drawers (menu/cart/search),
            AJAX cart, quick add, variant picker, accordions, quantity.
   ========================================================================== */
(function () {
  'use strict';

  document.documentElement.classList.remove('no-js');

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------------------------
     Helpers
     --------------------------------------------------------------------- */
  function $(selector, scope) { return (scope || document).querySelector(selector); }
  function $$(selector, scope) { return Array.prototype.slice.call((scope || document).querySelectorAll(selector)); }

  function formatMoney(cents) {
    var format = (window.AzureTheme && window.AzureTheme.moneyFormat) || '${{amount}}';
    var value = (cents / 100).toFixed(2);
    var parts = value.split('.');
    var whole = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');

    return format
      .replace(/\{\{\s*amount\s*\}\}/, whole + '.' + parts[1])
      .replace(/\{\{\s*amount_no_decimals\s*\}\}/, whole)
      .replace(/\{\{\s*amount_with_comma_separator\s*\}\}/, parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ',' + parts[1])
      .replace(/\{\{\s*amount_no_decimals_with_comma_separator\s*\}\}/, parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.'));
  }

  function t(key, fallback) {
    var strings = (window.AzureTheme && window.AzureTheme.strings) || {};
    return strings[key] || fallback;
  }

  /* ---------------------------------------------------------------------
     Scroll reveal
     Adds .is-visible when an element enters the viewport.
     --------------------------------------------------------------------- */
  var ScrollReveal = {
    observer: null,

    init: function () {
      if (reducedMotion || !('IntersectionObserver' in window)) {
        $$('.reveal').forEach(function (el) { el.classList.add('is-visible'); });
        return;
      }

      this.observer = new IntersectionObserver(function (entries, observer) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

      this.observe();
    },

    observe: function (scope) {
      if (!this.observer) {
        $$('.reveal', scope).forEach(function (el) { el.classList.add('is-visible'); });
        return;
      }
      var self = this;
      $$('.reveal', scope).forEach(function (el) {
        if (!el.classList.contains('is-visible')) self.observer.observe(el);
      });
    }
  };

  /* ---------------------------------------------------------------------
     Sticky header — adds .is-stuck once scrolled past the top
     --------------------------------------------------------------------- */
  function initStickyHeader() {
    var wrapper = $('[data-header-wrapper]');
    if (!wrapper) return;

    var ticking = false;
    function update() {
      wrapper.classList.toggle('is-stuck', window.scrollY > 8);
      ticking = false;
    }

    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    }, { passive: true });

    update();
  }

  /* ---------------------------------------------------------------------
     Overlay + focus-trapped panels (drawers and the search modal)
     --------------------------------------------------------------------- */
  var FOCUSABLE = 'a[href], button:not([disabled]), input:not([type="hidden"]), select, textarea, [tabindex]:not([tabindex="-1"])';

  var PanelManager = {
    active: null,
    lastFocused: null,

    overlay: function () { return $('[data-overlay]'); },

    open: function (panel) {
      if (!panel) return;
      if (this.active && this.active !== panel) this.close();

      this.lastFocused = document.activeElement;
      this.active = panel;

      panel.classList.add('is-active');
      panel.setAttribute('aria-hidden', 'false');
      var overlay = this.overlay();
      if (overlay) overlay.classList.add('is-active');
      document.body.classList.add('is-scroll-locked');

      var target = panel.querySelector('[data-autofocus]') || panel.querySelector(FOCUSABLE);
      if (target) window.setTimeout(function () { target.focus(); }, 120);
    },

    close: function () {
      var panel = this.active;
      if (!panel) return;

      panel.classList.remove('is-active');
      panel.setAttribute('aria-hidden', 'true');
      var overlay = this.overlay();
      if (overlay) overlay.classList.remove('is-active');
      document.body.classList.remove('is-scroll-locked');

      this.active = null;
      if (this.lastFocused && typeof this.lastFocused.focus === 'function') this.lastFocused.focus();
      this.lastFocused = null;
    },

    trap: function (event) {
      if (!this.active || event.key !== 'Tab') return;
      var items = $$(FOCUSABLE, this.active).filter(function (el) { return el.offsetParent !== null; });
      if (!items.length) return;

      var first = items[0];
      var last = items[items.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  };

  function initPanels() {
    document.addEventListener('click', function (event) {
      var opener = event.target.closest('[data-panel-open]');
      if (opener) {
        event.preventDefault();
        PanelManager.open($('#' + opener.getAttribute('data-panel-open')));
        return;
      }

      if (event.target.closest('[data-panel-close]') || event.target.closest('[data-overlay]')) {
        event.preventDefault();
        PanelManager.close();
      }
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') PanelManager.close();
      PanelManager.trap(event);
    });
  }

  /* ---------------------------------------------------------------------
     Cart — AJAX add / change / remove with Section Rendering API
     --------------------------------------------------------------------- */
  var Cart = {
    drawer: function () { return $('#cart-drawer'); },

    setLoading: function (state) {
      var drawer = this.drawer();
      if (drawer) drawer.classList.toggle('is-loading', !!state);
    },

    /** Re-render the drawer markup and cart count from the live cart. */
    refresh: function (openDrawer) {
      var drawer = this.drawer();
      var sectionId = drawer && drawer.getAttribute('data-section-id');
      if (!sectionId) return Promise.resolve();

      return fetch(window.Shopify.routes.root + '?sections=' + sectionId)
        .then(function (res) { return res.json(); })
        .then(function (data) {
          var html = data[sectionId];
          if (!html) return;

          var parsed = new DOMParser().parseFromString(html, 'text/html');
          var fresh = parsed.querySelector('[data-cart-drawer-content]');
          var current = $('[data-cart-drawer-content]');
          if (fresh && current) {
            current.innerHTML = fresh.innerHTML;
            ScrollReveal.observe(current);
          }

          var count = parsed.querySelector('[data-cart-count-source]');
          Cart.updateCount(count ? parseInt(count.getAttribute('data-cart-count-source'), 10) : null);

          if (openDrawer) PanelManager.open(drawer);
        })
        .catch(function (error) { console.error('[theme] cart refresh failed', error); });
    },

    updateCount: function (count) {
      if (count === null || isNaN(count)) return;
      $$('[data-cart-count]').forEach(function (badge) {
        badge.textContent = count > 99 ? '99+' : count;
        badge.hidden = count === 0;
        badge.classList.remove('is-bumped');
        void badge.offsetWidth; // restart the pop animation
        badge.classList.add('is-bumped');
      });
    },

    add: function (formData, button) {
      var original = button ? button.innerHTML : null;
      if (button) {
        button.setAttribute('aria-disabled', 'true');
        button.innerHTML = '<span class="loading-spinner"></span>';
      }

      return fetch(window.Shopify.routes.root + 'cart/add.js', {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: formData
      })
        .then(function (response) {
          return response.json().then(function (body) {
            if (!response.ok) throw new Error(body.description || body.message || 'Add to cart failed');
            return body;
          });
        })
        .then(function () { return Cart.refresh(true); })
        .catch(function (error) {
          window.alert(error.message);
        })
        .finally(function () {
          if (button) {
            button.removeAttribute('aria-disabled');
            button.innerHTML = original;
          }
        });
    },

    change: function (line, quantity) {
      this.setLoading(true);
      return fetch(window.Shopify.routes.root + 'cart/change.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ line: line, quantity: quantity })
      })
        .then(function () { return Cart.refresh(false); })
        .finally(function () { Cart.setLoading(false); });
    }
  };

  function initCart() {
    // Quick add + product form submissions
    document.addEventListener('submit', function (event) {
      var form = event.target.closest('[data-product-form]');
      if (!form) return;
      event.preventDefault();
      Cart.add(new FormData(form), form.querySelector('[data-add-to-cart]'));
    });

    document.addEventListener('click', function (event) {
      // Remove line item
      var remove = event.target.closest('[data-cart-remove]');
      if (remove) {
        event.preventDefault();
        Cart.change(parseInt(remove.getAttribute('data-cart-remove'), 10), 0);
        return;
      }

      // Quantity steppers inside the cart drawer
      var step = event.target.closest('[data-cart-step]');
      if (step) {
        event.preventDefault();
        var line = parseInt(step.getAttribute('data-line'), 10);
        var next = parseInt(step.getAttribute('data-quantity'), 10);
        if (next < 0) return;
        Cart.change(line, next);
      }
    });
  }

  /* ---------------------------------------------------------------------
     Generic quantity steppers (product page, cart page)
     --------------------------------------------------------------------- */
  function initQuantity() {
    document.addEventListener('click', function (event) {
      var button = event.target.closest('[data-qty-change]');
      if (!button) return;

      event.preventDefault();
      var input = button.parentElement.querySelector('input');
      if (!input) return;

      var min = parseInt(input.getAttribute('min'), 10) || 0;
      var delta = button.getAttribute('data-qty-change') === 'up' ? 1 : -1;
      var value = (parseInt(input.value, 10) || min) + delta;

      input.value = Math.max(min, value);
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });
  }

  /* ---------------------------------------------------------------------
     Accordions & mobile submenu toggles
     --------------------------------------------------------------------- */
  function initToggles() {
    document.addEventListener('click', function (event) {
      var toggle = event.target.closest('[data-toggle]');
      if (!toggle) return;

      event.preventDefault();
      toggle.setAttribute('aria-expanded', toggle.getAttribute('aria-expanded') === 'true' ? 'false' : 'true');
    });
  }

  /* ---------------------------------------------------------------------
     Product gallery thumbnails
     --------------------------------------------------------------------- */
  function initGallery() {
    document.addEventListener('click', function (event) {
      var thumb = event.target.closest('[data-gallery-thumb]');
      if (!thumb) return;

      var gallery = thumb.closest('[data-gallery]');
      var main = gallery && gallery.querySelector('[data-gallery-main]');
      var source = thumb.querySelector('img');
      if (!main || !source) return;

      $$('[data-gallery-thumb]', gallery).forEach(function (el) { el.classList.remove('is-active'); });
      thumb.classList.add('is-active');

      var full = source.getAttribute('data-full') || source.src;
      if (main.src === full) return;

      var frame = main.closest('.product__media-main') || main.parentElement;

      // Swap only once the replacement has decoded, so the fade never
      // lands on a half-loaded image.
      var swap = function () {
        main.src = full;
        main.srcset = source.getAttribute('data-full-srcset') || '';
        main.alt = source.alt;
        window.requestAnimationFrame(function () {
          if (frame) frame.classList.remove('is-swapping');
        });
      };

      if (reducedMotion) { swap(); return; }

      if (frame) frame.classList.add('is-swapping');

      var pre = new Image();
      pre.onload = function () { window.setTimeout(swap, 90); };
      pre.onerror = swap;
      pre.src = full;
    });
  }

  /* ---------------------------------------------------------------------
     Sticky buy bar — mirrors the real form rather than duplicating it
     --------------------------------------------------------------------- */
  function initBuyBar() {
    var bar = $('[data-buy-bar]');
    var anchor = $('[data-buy-anchor]');
    if (!bar || !anchor) return;

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        var inView = entries[0].isIntersecting;
        bar.classList.toggle('is-visible', !inView);
        bar.setAttribute('aria-hidden', inView ? 'true' : 'false');
      }, { rootMargin: '0px 0px -48px 0px' }).observe(anchor);
    }

    bar.addEventListener('click', function (event) {
      if (!event.target.closest('[data-buy-bar-add]')) return;

      var form = $('[data-product-form]');
      if (!form) return;

      if (form.requestSubmit) form.requestSubmit();
      else form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    });
  }

  /* ---------------------------------------------------------------------
     Variant picker — swaps price, availability and the variant id
     --------------------------------------------------------------------- */
  function initVariants() {
    $$('[data-variant-picker]').forEach(function (picker) {
      var form = picker.closest('[data-product-form]');
      var dataEl = $('[data-variant-json]', picker);
      if (!form || !dataEl) return;

      var variants;
      try {
        variants = JSON.parse(dataEl.textContent);
      } catch (error) {
        return;
      }

      picker.addEventListener('change', function () {
        var selected = $$('input:checked', picker).map(function (input) { return input.value; });

        var match = variants.find(function (variant) {
          return variant.options.every(function (option, index) { return option === selected[index]; });
        });

        var idInput = form.querySelector('[data-variant-id]');
        var button = form.querySelector('[data-add-to-cart]');
        var priceEl = $('[data-product-price]', form.closest('.product__info') || document);

        if (!match) {
          if (button) {
            button.setAttribute('disabled', 'disabled');
            button.textContent = t('unavailable', 'Unavailable');
          }
          return;
        }

        if (idInput) idInput.value = match.id;

        // Keep the URL shareable without adding a history entry per click.
        if (window.history.replaceState) {
          var url = new URL(window.location.href);
          url.searchParams.set('variant', match.id);
          window.history.replaceState({}, '', url.toString());
        }

        var onSale = !!(match.compare_at_price && match.compare_at_price > match.price);

        if (priceEl) {
          var html = '<span class="price__regular">' + formatMoney(match.price) + '</span>';
          if (onSale) {
            html += '<s class="price__compare">' + formatMoney(match.compare_at_price) + '</s>';
          }
          priceEl.innerHTML = html;
          priceEl.classList.toggle('price--on-sale', onSale);
        }

        var barPrice = $('[data-buy-bar-price]');
        if (barPrice) {
          barPrice.innerHTML = formatMoney(match.price) +
            (onSale ? ' <s class="price__compare">' + formatMoney(match.compare_at_price) + '</s>' : '');
        }

        if (button) {
          if (match.available) {
            button.removeAttribute('disabled');
            button.textContent = t('addToCart', 'Add to cart');
          } else {
            button.setAttribute('disabled', 'disabled');
            button.textContent = t('soldOut', 'Sold out');
          }
        }
      });
    });
  }

  /* ---------------------------------------------------------------------
     Collection sort — submit on change without a separate button
     --------------------------------------------------------------------- */
  function initSort() {
    document.addEventListener('change', function (event) {
      var select = event.target.closest('[data-sort-by]');
      if (select && select.form) select.form.submit();
    });
  }

  /* ---------------------------------------------------------------------
     Boot
     --------------------------------------------------------------------- */
  function init() {
    ScrollReveal.init();
    initStickyHeader();
    initPanels();
    initCart();
    initQuantity();
    initToggles();
    initGallery();
    initBuyBar();
    initVariants();
    initSort();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Re-bind after a theme-editor section reload.
  document.addEventListener('shopify:section:load', function (event) {
    ScrollReveal.observe(event.target);
    initStickyHeader();
  });

  window.AzureTheme = window.AzureTheme || {};
  window.AzureTheme.cart = Cart;
  window.AzureTheme.panels = PanelManager;
  window.AzureTheme.reveal = ScrollReveal;
})();
