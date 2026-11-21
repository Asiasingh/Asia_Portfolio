(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  // Footer year
  var year = $('#year');
  if (year) year.textContent = new Date().getFullYear();

  // ---------- Contact details ----------
  // Put together here so spam bots that scrape the HTML don't find a plain email or phone number.
  var emailEl = $('#email-text');
  var EMAIL = emailEl ? emailEl.getAttribute('data-user') + '@' + emailEl.getAttribute('data-domain') : '';
  if (emailEl) emailEl.textContent = EMAIL;
  var phoneEl = $('#phone-link');
  if (phoneEl) {
    var cc = phoneEl.getAttribute('data-cc');
    var digits = phoneEl.getAttribute('data-a') + phoneEl.getAttribute('data-b');
    phoneEl.textContent = '+' + cc + ' ' + phoneEl.getAttribute('data-a') + ' ' + phoneEl.getAttribute('data-b');
    phoneEl.href = 'tel:+' + cc + digits;
    var wa = $('#whatsapp-link');
    if (wa) wa.href = 'https://wa.me/' + cc + digits;
  }

  // ---------- Modals ----------
  function closeOnBackdrop(dialog, onClose) {
    dialog.addEventListener('click', function (e) { if (e.target === dialog) dialog.close(); });
    $('.modal-close', dialog).addEventListener('click', function () { dialog.close(); });
    if (onClose) dialog.addEventListener('close', onClose);
  }

  // ---------- Video player ----------
  // Accepts normal YouTube Shorts / TikTok / Instagram / Vimeo links and turns them into embed URLs.
  function toEmbed(url) {
    if (!url) return '';
    var yt = url.match(/(?:youtu\.be\/|[?&]v=|shorts\/|embed\/)([\w-]{11})/);
    if (yt) return 'https://www.youtube-nocookie.com/embed/' + yt[1] + '?autoplay=1&rel=0';
    var tt = url.match(/tiktok\.com\/.*video\/(\d+)/);
    if (tt) return 'https://www.tiktok.com/embed/v2/' + tt[1];
    var ig = url.match(/instagram\.com\/(?:reel|reels|p)\/([\w-]+)/);
    if (ig) return 'https://www.instagram.com/reel/' + ig[1] + '/embed';
    var vm = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
    if (vm) return 'https://player.vimeo.com/video/' + vm[1] + '?autoplay=1';
    return url;
  }

  function isFile(url) { return /\.(mp4|webm|mov|m4v)(\?|#|$)/i.test(url); }

  // Hover preview: on devices with a mouse, play local videos silently on hover.
  if (window.matchMedia('(hover: hover) and (prefers-reduced-motion: no-preference)').matches) {
    $$('.reel[data-video]').forEach(function (card) {
      var url = card.getAttribute('data-video');
      if (!isFile(url)) return;
      var preview = null;
      card.addEventListener('mouseenter', function () {
        if (!preview) {
          preview = document.createElement('video');
          preview.src = url;
          preview.muted = true;
          preview.loop = true;
          preview.playsInline = true;
          preview.className = 'reel-preview';
          card.appendChild(preview);
        }
        card.classList.add('is-previewing');
        var p = preview.play();
        if (p && p.catch) p.catch(function () {});
      });
      card.addEventListener('mouseleave', function () {
        card.classList.remove('is-previewing');
        if (preview) preview.pause();
      });
    });
  }

  var player = $('#player');
  var frame = $('#player-frame');
  var ptitle = $('#player-title');
  closeOnBackdrop(player, function () { frame.innerHTML = ''; });

  document.addEventListener('click', function (e) {
    var trigger = e.target.closest('[data-play]');
    if (!trigger) return;
    var raw = trigger.getAttribute('data-video') || '';
    var src = toEmbed(raw);
    frame.innerHTML = '';
    if (isFile(raw)) {
      var video = document.createElement('video');
      video.src = raw;
      video.controls = true;
      video.autoplay = true;
      video.playsInline = true;
      var cover = trigger.querySelector('img');
      if (cover) video.poster = cover.src;
      frame.appendChild(video);
    } else if (src) {
      var iframe = document.createElement('iframe');
      iframe.src = src;
      iframe.title = trigger.getAttribute('data-title') || 'Video';
      iframe.allow = 'autoplay; fullscreen; picture-in-picture';
      iframe.allowFullscreen = true;
      frame.appendChild(iframe);
    } else {
      var p = document.createElement('p');
      p.className = 'player-empty';
      p.textContent = 'Video coming soon.';
      frame.appendChild(p);
    }
    ptitle.textContent = trigger.getAttribute('data-title') || '';
    player.showModal();
  });

  // ---------- Before / after ----------
  $$('.compare').forEach(function (c) {
    var range = $('.compare-range', c);
    var set = function () { c.style.setProperty('--pos', range.value + '%'); };
    range.addEventListener('input', set);
    set();
  });

  // ---------- Lightbox ----------
  var lightbox = $('#lightbox');
  var lbImg = $('#lightbox-img');
  var lbCap = $('#lightbox-caption');
  closeOnBackdrop(lightbox);
  $$('[data-lightbox]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var img = $('img', btn);
      lbImg.src = btn.getAttribute('data-full') || img.src;
      lbImg.alt = img.alt;
      lbCap.textContent = btn.getAttribute('data-caption') || '';
      lightbox.showModal();
    });
  });

  // ---------- Roll credits (slow auto-scroll; any input stops it) ----------
  var roll = $('#roll');
  var rolling = false, raf = 0, last = 0, pos = 0;
  var SPEED = 70; // pixels per second
  var stopEvents = ['wheel', 'touchstart', 'keydown', 'mousedown'];

  function stop() {
    if (!rolling) return;
    rolling = false;
    cancelAnimationFrame(raf);
    roll.textContent = 'Roll credits';
    stopEvents.forEach(function (ev) { window.removeEventListener(ev, stop); });
  }
  function step(now) {
    var dt = Math.min(now - last, 50);
    last = now;
    pos += SPEED * dt / 1000;
    window.scrollTo({ top: Math.round(pos), behavior: 'instant' });
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) return stop();
    raf = requestAnimationFrame(step);
  }
  if (roll) {
    roll.addEventListener('click', function () {
      if (rolling) return stop();
      rolling = true;
      roll.textContent = 'Stop';
      pos = window.scrollY;
      last = performance.now();
      setTimeout(function () {
        stopEvents.forEach(function (ev) { window.addEventListener(ev, stop, { passive: true }); });
      }, 0);
      raf = requestAnimationFrame(step);
    });
  }

  // ---------- Copy email ----------
  var copyBtn = $('#copy-email');
  if (copyBtn) {
    copyBtn.addEventListener('click', function () {
      var text = $('#email-text').textContent.trim();
      var done = function () { copyBtn.textContent = 'Copied'; setTimeout(function () { copyBtn.textContent = 'Copy email'; }, 1800); };
      if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(done, function () { selectText($('#email-text')); });
      } else {
        selectText($('#email-text'));
      }
    });
  }
  function selectText(el) {
    var r = document.createRange();
    r.selectNodeContents(el);
    var s = window.getSelection();
    s.removeAllRanges();
    s.addRange(r);
  }

  // ---------- Contact form ----------
  var form = $('#contact-form');
  var status = $('#form-status');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.checkValidity()) {
        status.textContent = 'Please fill in your name, a valid email and a message.';
        form.reportValidity();
        return;
      }
      var data = new FormData(form);
      var endpoint = form.getAttribute('action') || '';

      // No form service set up yet: open the visitor's email app instead.
      if (!endpoint || endpoint.indexOf('YOUR_FORM_ID') !== -1) {
        var to = EMAIL;
        var subject = encodeURIComponent(data.get('service') + ' inquiry from ' + data.get('name'));
        var body = encodeURIComponent(data.get('message') + '\n\n' + data.get('name') + '\n' + data.get('email'));
        window.location.href = 'mailto:' + to + '?subject=' + subject + '&body=' + body;
        status.textContent = 'Opening your email app. If nothing happens, email ' + to + ' directly.';
        return;
      }

      status.textContent = 'Sending…';
      fetch(endpoint, { method: 'POST', body: data, headers: { Accept: 'application/json' } })
        .then(function (res) {
          if (!res.ok) throw new Error();
          form.reset();
          status.textContent = 'Thanks! Your message is in. I usually reply within a day.';
        })
        .catch(function () {
          status.textContent = 'That didn\'t send. Please try again, or email ' + EMAIL + ' directly.';
        });
    });
  }
})();
