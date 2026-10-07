/* Plays product videos inside the gallery frame (snippets/gallery-video.liquid).
   theme.js still handles the thumbnail swap; this only shows, plays and stops
   the matching video on top of the image. */
(function () {
  if (window.__piloGalleryVideo) return;
  window.__piloGalleryVideo = true;

  var reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function frameOf(gallery) { return gallery.querySelector('.product__media-main'); }

  function setSound(wrap, on) {
    var video = wrap.querySelector('video');
    var btn = wrap.querySelector('[data-gallery-sound]');
    if (!video) return;
    video.muted = !on;
    if (btn) {
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
      btn.querySelector('[data-sound-off]').hidden = on;
      btn.querySelector('[data-sound-on]').hidden = !on;
    }
  }

  function play(video) {
    var p = video.play();
    if (p && p.catch) p.catch(function () {});
  }

  function stopAll(gallery) {
    gallery.querySelectorAll('[data-gallery-video]').forEach(function (wrap) {
      if (wrap.hidden) return;
      wrap.hidden = true;
      var video = wrap.querySelector('video');
      if (video) { video.pause(); setSound(wrap, false); }
      var frame = wrap.querySelector('iframe');
      if (frame) frame.src = frame.src; // reload = stop
    });
  }

  function show(gallery, id) {
    var frame = frameOf(gallery);
    stopAll(gallery);
    var wrap = id && gallery.querySelector('[data-gallery-video="' + id + '"]');
    if (!wrap) { if (frame) frame.classList.remove('is-video'); return; }
    wrap.hidden = false;
    if (frame) frame.classList.add('is-video');
    var video = wrap.querySelector('video');
    if (video) { setSound(wrap, false); play(video); }
  }

  document.addEventListener('click', function (event) {
    var thumb = event.target.closest('[data-gallery-thumb]');
    if (thumb) {
      var gallery = thumb.closest('[data-gallery]');
      if (gallery) show(gallery, thumb.getAttribute('data-media-id'));
      return;
    }

    var wrap = event.target.closest('[data-gallery-video]');
    if (!wrap) return;
    var video = wrap.querySelector('video');
    if (!video) return;
    // Tapping the video or the pill toggles sound; a paused video starts too.
    var on = video.muted || video.paused;
    setSound(wrap, on);
    if (video.paused) play(video);
  });

  function init() {
    document.querySelectorAll('[data-gallery]').forEach(function (gallery) {
      var wrap = gallery.querySelector('[data-gallery-video]:not([hidden])');
      if (!wrap) return;
      var frame = frameOf(gallery);
      if (frame) frame.classList.add('is-video');
      var video = wrap.querySelector('video');
      if (video && !reducedMotion) play(video);
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
