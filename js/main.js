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
  var WA_NUMBER = '';
  if (phoneEl) {
    var cc = phoneEl.getAttribute('data-cc');
    var digits = phoneEl.getAttribute('data-a') + phoneEl.getAttribute('data-b');
    WA_NUMBER = cc + digits;
    phoneEl.textContent = '+' + cc + ' ' + phoneEl.getAttribute('data-a') + ' ' + phoneEl.getAttribute('data-b');
    phoneEl.href = 'tel:+' + WA_NUMBER;
    var wa = $('#whatsapp-link');
    if (wa) wa.href = 'https://wa.me/' + WA_NUMBER;
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

  // ---------- Book an appointment ----------
  // Builds a booking request and opens it in WhatsApp (or the visitor's email app),
  // addressed to Asia, with every detail filled in.
  var book = $('#booking-form');
  var bookStatus = $('#book-status');
  if (book) {
    var dateInput = $('#b-date');
    var pad = function (n) { return (n < 10 ? '0' : '') + n; };
    var now = new Date();
    dateInput.min = now.getFullYear() + '-' + pad(now.getMonth() + 1) + '-' + pad(now.getDate());

    var via = 'whatsapp';
    $$('button[data-via]', book).forEach(function (b) {
      b.addEventListener('click', function () { via = b.getAttribute('data-via'); });
    });

    book.addEventListener('submit', function (e) {
      e.preventDefault();
      if (e.submitter && e.submitter.getAttribute('data-via')) via = e.submitter.getAttribute('data-via');

      var d = new FormData(book);
      var get = function (k) { return (d.get(k) || '').toString().trim(); };
      var name = get('name');
      var date = get('date');

      if (!name) { bookStatus.textContent = 'Please add your name.'; $('#b-name').focus(); return; }
      if (!date) { bookStatus.textContent = 'Please choose a preferred date.'; dateInput.focus(); return; }
      if (date < dateInput.min) { bookStatus.textContent = 'Please choose a date from today onwards.'; dateInput.focus(); return; }

      var niceDate = new Date(date + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
      var lines = [
        "Hi Asia, I'd like to book an appointment.",
        '',
        'Service: ' + get('service'),
        'Name: ' + name
      ];
      if (get('brand')) lines.push('Brand / company: ' + get('brand'));
      lines.push('Preferred date: ' + niceDate, 'Preferred time: ' + get('time'), 'Meeting type: ' + get('mode'));
      if (get('budget')) lines.push('Budget: ' + get('budget'));
      if (get('brief')) lines.push('', 'About the project: ' + get('brief'));
      var text = lines.join('\n');

      if (via === 'email') {
        var subject = 'Appointment request: ' + get('service') + ' (' + name + ')';
        window.location.href = 'mailto:' + EMAIL + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(text);
        bookStatus.textContent = 'Your email app is opening with the request. Press send to confirm. If nothing opens, email ' + EMAIL + '.';
      } else {
        var url = 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(text);
        var win = window.open(url, '_blank');
        if (win) { win.opener = null; } else { window.location.href = url; }
        bookStatus.textContent = 'WhatsApp is opening with your request. Press send to confirm your booking.';
      }
    });
  }
})();
