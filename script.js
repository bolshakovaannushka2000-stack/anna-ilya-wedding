(function () {
  'use strict';

  var CONFIG = {
    weddingDate: '2027-02-14T15:00:00+03:00',
    rsvpEndpoint: 'https://script.google.com/macros/s/AKfycby7JGVFu_VE_teYmrRs39bFLHeBq-CzicK9kIVn1rSwjIMLj3Kf9Xix29FfA0RlHPAF/exec',
    photos: {
      'couple-hero': 'assets/embedded-05-afc38c87d318.jpg',
      'couple-story': 'assets/embedded-06-243384b6f43a.jpg',
      'venue': 'assets/venue-winter-1.jpg',
      'venue-alt': 'assets/venue-winter-2.jpg',
      'dress-women': 'assets/embedded-09-e05d8d5b3196.jpg',
      'dress-men': 'assets/embedded-10-29de64f0167e.jpg'
    }
  };

  function byId(id) { return document.getElementById(id); }
  function addClass(el, cls) { if (el && el.classList) el.classList.add(cls); }
  function removeClass(el, cls) { if (el && el.classList) el.classList.remove(cls); }
  function toggleClass(el, cls, state) { if (el && el.classList) el.classList.toggle(cls, !!state); }
  function each(list, fn) { for (var i = 0; i < list.length; i += 1) fn(list[i], i); }
  function pad(n, len) { var s = String(n); while (s.length < len) s = '0' + s; return s; }

  var intro = byId('intro');
  var stage = byId('envelopeStage');
  var openBtn = byId('openInvitation');
  var openHint = byId('openHint');
  var main = byId('mainContent');
  var weddingMusic = byId('weddingMusic');
  var musicToggle = byId('musicToggle');
  var musicLabel = byId('musicLabel');
  var isAndroid = /Android/i.test(navigator.userAgent || '');

  function updateMusicUI() {
    toggleClass(musicToggle, 'is-playing', !!(weddingMusic && !weddingMusic.paused));
  }

  function startWeddingMusic() {
    if (!weddingMusic) return;
    weddingMusic.volume = 0.42;
    addClass(musicToggle, 'is-visible');
    addClass(musicLabel, 'is-visible');
    try {
      var p = weddingMusic.play();
      if (p && typeof p.then === 'function') p.then(updateMusicUI, updateMusicUI);
    } catch (e) { updateMusicUI(); }
    window.setTimeout(function () { removeClass(musicLabel, 'is-visible'); }, 5200);
  }

  if (musicToggle) {
    musicToggle.addEventListener('click', function () {
      if (!weddingMusic) return;
      if (weddingMusic.paused) {
        try {
          var p = weddingMusic.play();
          if (p && typeof p.then === 'function') p.then(updateMusicUI, updateMusicUI);
        } catch (e) { updateMusicUI(); }
      } else {
        weddingMusic.pause();
        updateMusicUI();
      }
    });
  }
  if (weddingMusic) {
    weddingMusic.addEventListener('play', updateMusicUI);
    weddingMusic.addEventListener('pause', updateMusicUI);
  }

  addClass(document.body, 'locked');

  function Snowfall(canvas, count, subtle) {
    this.canvas = canvas;
    this.ctx = canvas && canvas.getContext ? canvas.getContext('2d') : null;
    this.count = count || 30;
    this.subtle = !!subtle;
    this.flakes = [];
    this.bursts = [];
    this.boost = 1;
    this.active = !!this.ctx;
    this.last = 0;
    this.interval = 1000 / (isAndroid ? 20 : 30);
    this.dpr = Math.min(window.devicePixelRatio || 1, isAndroid ? 1 : 1.5);
    var self = this;
    this.resizeHandler = function () { self.resize(); };
    this.tickHandler = function (ts) { self.tick(ts); };
    if (this.ctx) {
      window.addEventListener('resize', this.resizeHandler, false);
      this.resize();
      if (window.requestAnimationFrame) window.requestAnimationFrame(this.tickHandler);
    }
  }
  Snowfall.prototype.resize = function () {
    if (!this.ctx || !this.canvas) return;
    var rect = this.canvas.getBoundingClientRect();
    this.w = Math.max(1, rect.width || window.innerWidth || 1);
    this.h = Math.max(1, rect.height || window.innerHeight || 1);
    this.canvas.width = Math.round(this.w * this.dpr);
    this.canvas.height = Math.round(this.h * this.dpr);
    if (this.ctx.setTransform) this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    var mobileFactor = window.innerWidth < 700 ? (isAndroid ? 0.35 : 0.58) : 1;
    var target = Math.max(8, Math.round(this.count * mobileFactor));
    this.flakes = [];
    for (var i = 0; i < target; i += 1) this.flakes.push(this.createFlake(true));
  };
  Snowfall.prototype.createFlake = function (randomY) {
    var depth = Math.random();
    return {
      x: Math.random() * (this.w || 1),
      y: randomY ? Math.random() * (this.h || 1) : -20,
      r: 0.8 + depth * (this.subtle ? 1.8 : 2.8),
      vy: 0.3 + depth * (this.subtle ? 0.55 : 0.78),
      vx: (Math.random() - 0.5) * (this.subtle ? 0.16 : 0.22),
      sway: Math.random() * Math.PI * 2,
      alpha: (this.subtle ? 0.2 : 0.28) + depth * (this.subtle ? 0.22 : 0.38)
    };
  };
  Snowfall.prototype.burst = function (amount) {
    if (!this.ctx) return;
    var safeAmount = isAndroid ? Math.min(amount || 20, 22) : (amount || 28);
    for (var i = 0; i < safeAmount; i += 1) {
      this.bursts.push({
        x: this.w * (0.34 + Math.random() * 0.32), y: this.h * (0.28 + Math.random() * 0.1),
        vx: (Math.random() - 0.5) * 2.4, vy: -1.5 - Math.random() * 1.6,
        r: 1 + Math.random() * 2.8, alpha: 0.45 + Math.random() * 0.35,
        life: 22 + Math.random() * 12, age: 0
      });
    }
  };
  Snowfall.prototype.drawCircle = function (x, y, r, alpha) {
    this.ctx.globalAlpha = alpha;
    this.ctx.beginPath(); this.ctx.arc(x, y, r, 0, Math.PI * 2);
    this.ctx.fillStyle = '#ffffff'; this.ctx.fill(); this.ctx.globalAlpha = 1;
  };
  Snowfall.prototype.tick = function (ts) {
    var self = this;
    if (window.requestAnimationFrame) window.requestAnimationFrame(function (t) { self.tick(t); });
    if (!this.active || !this.ctx) return;
    if (ts - this.last < this.interval) return;
    this.last = ts;
    this.ctx.clearRect(0, 0, this.w, this.h);
    var i, f;
    for (i = 0; i < this.flakes.length; i += 1) {
      f = this.flakes[i];
      f.sway += 0.012; f.y += f.vy * this.boost; f.x += (f.vx + Math.sin(f.sway) * 0.14) * this.boost;
      if (f.y > this.h + 24 || f.x < -24 || f.x > this.w + 24) this.flakes[i] = f = this.createFlake(false);
      this.drawCircle(f.x, f.y, f.r, f.alpha);
    }
    var kept = [];
    for (i = 0; i < this.bursts.length; i += 1) {
      var p = this.bursts[i]; p.age += 1; p.x += p.vx; p.y += p.vy; p.vy += 0.04;
      var a = p.alpha * (1 - p.age / p.life);
      if (a > 0) this.drawCircle(p.x, p.y, p.r, a);
      if (p.age < p.life) kept.push(p);
    }
    this.bursts = kept;
    this.boost += (1 - this.boost) * 0.06;
  };

  var reduced = false;
  try { reduced = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches); } catch (e) {}
  var snowIntro = new Snowfall(byId('snowCanvas'), reduced ? 16 : 54, false);
  var snowFinal = new Snowfall(byId('finalSnowCanvas'), reduced ? 6 : 14, true);
  snowFinal.active = false;

  function showMain() {
    addClass(main, 'is-visible');
    if (main) main.setAttribute('aria-hidden', 'false');
    addClass(intro, 'is-gone');
    snowIntro.active = false;
    if (snowIntro.ctx) snowIntro.ctx.clearRect(0, 0, snowIntro.w, snowIntro.h);
    removeClass(document.body, 'locked');
    window.scrollTo(0, 0);
    revealObserver();
  }

  function openInvitation() {
    if (!stage || stage.classList.contains('opening')) return;
    addClass(stage, 'opening');
    startWeddingMusic();
    snowIntro.boost = 1.7;
    snowIntro.burst(window.innerWidth < 700 ? 20 : 70);
    window.setTimeout(function () { snowIntro.burst(window.innerWidth < 700 ? 14 : 42); }, 420);
    window.setTimeout(function () { addClass(stage, 'zooming'); }, 1400);
    window.setTimeout(showMain, isAndroid ? 2050 : 2350);
  }
  if (openBtn) openBtn.addEventListener('click', openInvitation);
  if (openHint) openHint.addEventListener('click', openInvitation);

  var finaleSection = byId('finale');
  if ('IntersectionObserver' in window && finaleSection) {
    var finalObserver = new IntersectionObserver(function (entries) {
      each(entries, function (entry) {
        snowFinal.active = !!(entry.isIntersecting && !document.hidden);
        if (!snowFinal.active && snowFinal.ctx) snowFinal.ctx.clearRect(0, 0, snowFinal.w, snowFinal.h);
      });
    }, { threshold: 0.12 });
    finalObserver.observe(finaleSection);
  }

  var weddingMs = new Date(CONFIG.weddingDate).getTime();
  function updateCountdown() {
    var diff = Math.max(0, weddingMs - new Date().getTime());
    var totalSeconds = Math.floor(diff / 1000);
    var days = Math.floor(totalSeconds / 86400);
    var hours = Math.floor((totalSeconds % 86400) / 3600);
    var minutes = Math.floor((totalSeconds % 3600) / 60);
    var seconds = totalSeconds % 60;
    if (byId('days')) byId('days').textContent = pad(days, 3);
    if (byId('hours')) byId('hours').textContent = pad(hours, 2);
    if (byId('minutes')) byId('minutes').textContent = pad(minutes, 2);
    if (byId('seconds')) byId('seconds').textContent = pad(seconds, 2);
  }
  updateCountdown(); window.setInterval(updateCountdown, 1000);

  var observer = null;
  function revealObserver() {
    var items = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window)) {
      each(items, function (el) { addClass(el, 'visible'); });
      return;
    }
    if (observer) return;
    observer = new IntersectionObserver(function (entries) {
      each(entries, function (entry) {
        if (entry.isIntersecting) { addClass(entry.target, 'visible'); observer.unobserve(entry.target); }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -3% 0px' });
    each(items, function (el) { observer.observe(el); });
  }

  for (var photoKey in CONFIG.photos) {
    if (Object.prototype.hasOwnProperty.call(CONFIG.photos, photoKey)) {
      (function (key, src) {
        var slots = document.querySelectorAll('[data-photo="' + key + '"]');
        each(slots, function (slot) {
          var img = new Image();
          img.onload = function () { slot.style.backgroundImage = 'url("' + src + '")'; addClass(slot, 'is-loaded'); };
          img.src = src;
        });
      }(photoKey, CONFIG.photos[photoKey]));
    }
  }

  var storyTabs = document.querySelectorAll('.story-tab');
  var storyPanels = document.querySelectorAll('.story-panel');
  each(storyTabs, function (tab) {
    tab.addEventListener('click', function () {
      var target = tab.getAttribute('data-story');
      each(storyTabs, function (btn) {
        var active = btn === tab; toggleClass(btn, 'is-active', active); btn.setAttribute('aria-selected', active ? 'true' : 'false');
      });
      each(storyPanels, function (panel) {
        var active = panel.getAttribute('data-panel') === target; toggleClass(panel, 'is-active', active); panel.hidden = !active;
      });
    });
  });

  var form = byId('rsvpForm');
  var otherAlcoholField = byId('otherAlcoholField');
  var meatField = byId('meatField');
  var otherAlcohol = byId('otherAlcohol');
  var noAlcohol = byId('noAlcohol');

  if (form) {
    form.addEventListener('change', function (e) {
      var t = e.target;
      if (t === otherAlcohol) toggleClass(otherAlcoholField, 'show', !!otherAlcohol.checked);
      if (t && t.name === 'mainDish') toggleClass(meatField, 'show', t.value === 'Мясо');
      if (t === noAlcohol && noAlcohol.checked) {
        each(form.querySelectorAll('input[name="alcohol"]'), function (box) { if (box !== noAlcohol) box.checked = false; });
        removeClass(otherAlcoholField, 'show');
      }
      if (t && t.name === 'alcohol' && t !== noAlcohol && t.checked && noAlcohol) noAlcohol.checked = false;
    });
  }

  function formValue(name) {
    if (!form) return '';
    var el = form.querySelector('[name="' + name + '"]:checked') || form.querySelector('[name="' + name + '"]');
    return el ? el.value : '';
  }
  function serializeForm() {
    var alcohol = [];
    each(form.querySelectorAll('input[name="alcohol"]:checked'), function (el) { alcohol.push(el.value); });
    return {
      name: formValue('guestName'), attendance: formValue('attendance'), companion: '', companionName: '', alcohol: alcohol,
      otherAlcohol: formValue('otherAlcoholText'), mainDish: formValue('mainDish'), meatType: formValue('meatPreference'), otherMeat: '',
      allergies: formValue('allergies'), notEat: formValue('avoidFoods'), transfer: '', lodging: formValue('stayHelp'),
      track: formValue('favoriteTrack'), comment: formValue('comment'), submittedAt: new Date().toISOString()
    };
  }

  function submitRSVP(data, done, fail) {
    if (!CONFIG.rsvpEndpoint) { fail(); return; }
    var payload = JSON.stringify(data);
    if (window.fetch) {
      fetch(CONFIG.rsvpEndpoint, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: payload })
        .then(function () { try { localStorage.setItem('annaIlyaWeddingRSVP', payload); } catch (e) {} done(); })
        .catch(fail);
    } else {
      try {
        var xhr = new XMLHttpRequest();
        xhr.open('POST', CONFIG.rsvpEndpoint, true);
        xhr.setRequestHeader('Content-Type', 'text/plain;charset=utf-8');
        xhr.onload = function () { try { localStorage.setItem('annaIlyaWeddingRSVP', payload); } catch (e) {} done(); };
        xhr.onerror = fail; xhr.send(payload);
      } catch (e) { fail(); }
    }
  }

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var submit = form.querySelector('button[type="submit"]');
      var original = submit ? submit.textContent : '';
      if (submit) { submit.disabled = true; submit.textContent = 'Сохраняем…'; }
      submitRSVP(serializeForm(), function () {
        form.style.display = 'none'; addClass(byId('successMessage'), 'show');
        if (submit) { submit.disabled = false; submit.textContent = original; }
      }, function () {
        alert('Не получилось отправить ответ. Пожалуйста, попробуйте ещё раз.');
        if (submit) { submit.disabled = false; submit.textContent = original; }
      });
    });
  }

  var editResponse = byId('editResponse');
  if (editResponse) editResponse.addEventListener('click', function () { removeClass(byId('successMessage'), 'show'); if (form) form.style.display = 'grid'; });

  // Safety net: if a browser/webview delays animations, never leave the page locked forever.
  window.setTimeout(function () {
    if (document.body.classList.contains('locked') && !intro) removeClass(document.body, 'locked');
  }, 5000);
}());
