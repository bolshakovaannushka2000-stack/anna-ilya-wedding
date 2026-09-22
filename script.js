// ================================================================
// АННА & ИЛЬЯ — свадебное приглашение
// Все ключевые настройки для будущих изменений собраны ниже.
// ================================================================

const CONFIG = {
  // ДАТА СВАДЬБЫ. Формат ISO с часовым поясом Москвы.
  weddingDate: '2027-02-14T15:00:00+03:00',

  // RSVP: вставьте сюда URL опубликованного Google Apps Script Web App.
  // Ответы отправляются в Google Apps Script: таблица + Telegram.
  rsvpEndpoint: 'https://script.google.com/macros/s/AKfycby7JGVFu_VE_teYmrRs39bFLHeBq-CzicK9kIVn1rSwjIMLj3Kf9Xix29FfA0RlHPAF/exec',

  // Фото: просто положите изображения в папку assets с этими именами.
  // МОЖНО МЕНЯТЬ ПУТИ, ЕСЛИ ВЫ ПЕРЕИМЕНУЕТЕ ФАЙЛЫ.
  photos: {
    'couple-hero': 'assets/embedded-05-afc38c87d318.jpg',
    'couple-story': 'assets/embedded-06-243384b6f43a.jpg',
    'venue': 'assets/venue-winter-1.jpg',
    'venue-alt': 'assets/venue-winter-2.jpg',
    'dress-women': 'assets/embedded-09-e05d8d5b3196.jpg',
    'dress-men': 'assets/embedded-10-29de64f0167e.jpg'
  }
};

const intro = document.getElementById('intro');
const stage = document.getElementById('envelopeStage');
const openBtn = document.getElementById('openInvitation');
const openHint = document.getElementById('openHint');
const main = document.getElementById('mainContent');
const weddingMusic = document.getElementById('weddingMusic');
const musicToggle = document.getElementById('musicToggle');
const musicLabel = document.getElementById('musicLabel');
let musicStarted = false;

function updateMusicUI() {
  const playing = weddingMusic && !weddingMusic.paused;
  musicToggle?.classList.toggle('is-playing', playing);
}

function startWeddingMusic() {
  if (!weddingMusic) return;
  weddingMusic.volume = 0.42;
  musicToggle?.classList.add('is-visible');
  musicLabel?.classList.add('is-visible');
  const promise = weddingMusic.play();
  if (promise && typeof promise.then === 'function') {
    promise.then(() => { musicStarted = true; updateMusicUI(); })
      .catch(() => { updateMusicUI(); });
  }
  setTimeout(() => musicLabel?.classList.remove('is-visible'), 5200);
}

musicToggle?.addEventListener('click', () => {
  if (!weddingMusic) return;
  if (weddingMusic.paused) {
    weddingMusic.play().then(updateMusicUI).catch(updateMusicUI);
  } else {
    weddingMusic.pause();
    updateMusicUI();
  }
});
weddingMusic?.addEventListener('play', updateMusicUI);
weddingMusic?.addEventListener('pause', updateMusicUI);

document.body.classList.add('locked');

function openInvitation() {
  if (stage.classList.contains('opening')) return;
  stage.classList.add('opening');
  startWeddingMusic();
  snowIntro.boost = 2.1;
  snowIntro.burst(window.innerWidth < 700 ? 54 : 96);

  setTimeout(() => snowIntro.burst(window.innerWidth < 700 ? 34 : 64), 420);
  setTimeout(() => stage.classList.add('zooming'), 1550);
  setTimeout(() => {
    main.classList.add('is-visible');
    main.setAttribute('aria-hidden', 'false');
    intro.classList.add('is-gone');
    snowIntro.active = false;
    snowIntro.ctx.clearRect(0, 0, snowIntro.w, snowIntro.h);
    document.body.classList.remove('locked');
    window.scrollTo({ top: 0, behavior: 'auto' });
    revealObserver();
  }, 2550);
}
openBtn.addEventListener('click', openInvitation);
openHint.addEventListener('click', openInvitation);

// ---------- Более лёгкий и плавный снег на Canvas ----------
class Snowfall {
  constructor(canvas, count = 40, subtle = false) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: true });
    this.count = count;
    this.subtle = subtle;
    this.flakes = [];
    this.bursts = [];
    this.boost = 1;
    this.active = true;
    this.last = 0;
    this.interval = 1000 / 30; // ограничиваем до ~30 FPS для плавности без лагов
    this.dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    this.resize = this.resize.bind(this);
    this.tick = this.tick.bind(this);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.active = false;
      }
    });
    window.addEventListener('resize', this.resize, { passive: true });
    this.resize();
    requestAnimationFrame(this.tick);
  }
  resize() {
    const rect = this.canvas.getBoundingClientRect();
    this.w = Math.max(1, rect.width);
    this.h = Math.max(1, rect.height);
    this.canvas.width = this.w * this.dpr;
    this.canvas.height = this.h * this.dpr;
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    const mobileFactor = window.innerWidth < 700 ? 0.58 : 1;
    const targetCount = Math.max(12, Math.round(this.count * mobileFactor));
    this.flakes = Array.from({ length: targetCount }, () => this.createFlake(true));
  }
  createFlake(randomY = false) {
    const depth = Math.random();
    return {
      x: Math.random() * this.w,
      y: randomY ? Math.random() * this.h : -20,
      r: 0.8 + depth * (this.subtle ? 1.8 : 2.8),
      vy: 0.3 + depth * (this.subtle ? 0.55 : 0.78),
      vx: (Math.random() - 0.5) * (this.subtle ? 0.16 : 0.22),
      sway: Math.random() * Math.PI * 2,
      alpha: (this.subtle ? 0.2 : 0.28) + depth * (this.subtle ? 0.22 : 0.38)
    };
  }
  burst(amount = 28) {
    for (let i = 0; i < amount; i += 1) {
      this.bursts.push({
        x: this.w * (0.34 + Math.random() * 0.32),
        y: this.h * (0.28 + Math.random() * 0.1),
        vx: (Math.random() - 0.5) * 2.4,
        vy: -1.5 - Math.random() * 1.6,
        r: 1 + Math.random() * 2.8,
        alpha: 0.45 + Math.random() * 0.35,
        life: 22 + Math.random() * 12,
        age: 0
      });
    }
  }
  drawCircle(x, y, r, alpha) {
    this.ctx.globalAlpha = alpha;
    this.ctx.beginPath();
    this.ctx.arc(x, y, r, 0, Math.PI * 2);
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fill();
    this.ctx.globalAlpha = 1;
  }
  tick(ts) {
    requestAnimationFrame(this.tick);
    if (!this.active) return;
    if (ts - this.last < this.interval) return;
    this.last = ts;

    this.ctx.clearRect(0, 0, this.w, this.h);

    for (const f of this.flakes) {
      f.sway += 0.012;
      f.y += f.vy * this.boost;
      f.x += (f.vx + Math.sin(f.sway) * 0.14) * this.boost;
      if (f.y > this.h + 24 || f.x < -24 || f.x > this.w + 24) Object.assign(f, this.createFlake(false));
      this.drawCircle(f.x, f.y, f.r, f.alpha);
    }

    this.bursts = this.bursts.filter(p => {
      p.age += 1;
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.04;
      const a = p.alpha * (1 - p.age / p.life);
      if (a > 0) this.drawCircle(p.x, p.y, p.r, a);
      return p.age < p.life;
    });

    this.boost += (1 - this.boost) * 0.06;
  }
}

const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const snowIntro = new Snowfall(document.getElementById('snowCanvas'), prefersReduced ? 22 : 72);
const snowFinal = new Snowfall(document.getElementById('finalSnowCanvas'), prefersReduced ? 8 : 20, true);
snowFinal.active = false;

const finaleSection = document.getElementById('finale');
if ('IntersectionObserver' in window && finaleSection) {
  const finalObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      snowFinal.active = entry.isIntersecting && !document.hidden;
      if (!snowFinal.active) snowFinal.ctx.clearRect(0, 0, snowFinal.w, snowFinal.h);
    });
  }, { threshold: 0.12 });
  finalObserver.observe(finaleSection);
}

// ---------- Countdown ----------
const weddingMs = new Date(CONFIG.weddingDate).getTime();
function updateCountdown() {
  const diff = Math.max(0, weddingMs - Date.now());
  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  document.getElementById('days').textContent = String(days).padStart(3,'0');
  document.getElementById('hours').textContent = String(hours).padStart(2,'0');
  document.getElementById('minutes').textContent = String(minutes).padStart(2,'0');
  document.getElementById('seconds').textContent = String(seconds).padStart(2,'0');
}
updateCountdown();
setInterval(updateCountdown, 1000);

// ---------- Reveal on scroll ----------
let observer;
function revealObserver() {
  if (observer) return;
  observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: .12, rootMargin: '0px 0px -5% 0px' });
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

// ---------- Автоподстановка фотографий, если файлы добавлены ----------
Object.entries(CONFIG.photos).forEach(([key, src]) => {
  document.querySelectorAll(`[data-photo="${key}"]`).forEach(slot => {
    const img = new Image();
    img.onload = () => {
      slot.style.backgroundImage = `url("${src}")`;
      slot.classList.add('is-loaded');
    };
    img.src = src;
  });
});

// ---------- История: интерактивные вкладки ----------
const storyTabs = document.querySelectorAll('.story-tab');
const storyPanels = document.querySelectorAll('.story-panel');
storyTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    const target = tab.dataset.story;
    storyTabs.forEach(btn => {
      const active = btn === tab;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-selected', active ? 'true' : 'false');
    });
    storyPanels.forEach(panel => {
      const active = panel.dataset.panel === target;
      panel.classList.toggle('is-active', active);
      panel.hidden = !active;
    });
  });
});

// ---------- RSVP dynamic fields ----------
const form = document.getElementById('rsvpForm');
const otherAlcoholField = document.getElementById('otherAlcoholField');
const meatField = document.getElementById('meatField');
const otherAlcohol = document.getElementById('otherAlcohol');
const noAlcohol = document.getElementById('noAlcohol');

form.addEventListener('change', (e) => {
  if (e.target === otherAlcohol) {
    otherAlcoholField.classList.toggle('show', otherAlcohol.checked);
  }
  if (e.target.name === 'mainDish') {
    meatField.classList.toggle('show', e.target.value === 'Мясо');
  }
  if (e.target === noAlcohol && noAlcohol.checked) {
    form.querySelectorAll('input[name="alcohol"]').forEach(box => {
      if (box !== noAlcohol) box.checked = false;
    });
    otherAlcoholField.classList.remove('show');
  }
  if (e.target.name === 'alcohol' && e.target !== noAlcohol && e.target.checked) {
    noAlcohol.checked = false;
  }
});

function serializeForm(formEl) {
  const fd = new FormData(formEl);
  const raw = {};
  for (const [key, value] of fd.entries()) {
    if (Object.prototype.hasOwnProperty.call(raw, key)) {
      raw[key] = Array.isArray(raw[key]) ? [...raw[key], value] : [raw[key], value];
    } else raw[key] = value;
  }

  // Названия ниже совпадают с полями Google Apps Script.
  return {
    name: raw.guestName || '',
    attendance: raw.attendance || '',
    companion: '',
    companionName: '',
    alcohol: raw.alcohol || [],
    otherAlcohol: raw.otherAlcoholText || '',
    mainDish: raw.mainDish || '',
    meatType: raw.meatPreference || '',
    otherMeat: '',
    allergies: raw.allergies || '',
    notEat: raw.avoidFoods || '',
    transfer: '',
    lodging: raw.stayHelp || '',
    track: raw.favoriteTrack || '',
    comment: raw.comment || '',
    submittedAt: new Date().toISOString()
  };
}

async function submitRSVP(data) {
  if (!CONFIG.rsvpEndpoint) {
    throw new Error('RSVP endpoint is not configured');
  }

  // Apps Script Web App is on another domain. no-cors lets the browser
  // send the POST reliably without exposing Telegram secrets to guests.
  await fetch(CONFIG.rsvpEndpoint, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(data)
  });

  localStorage.setItem('annaIlyaWeddingRSVP', JSON.stringify(data));
  return { ok: true };
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const submit = form.querySelector('button[type="submit"]');
  const original = submit.textContent;
  submit.disabled = true;
  submit.textContent = 'Сохраняем…';
  try {
    await submitRSVP(serializeForm(form));
    form.style.display = 'none';
    document.getElementById('successMessage').classList.add('show');
  } catch (err) {
    alert('Не получилось отправить ответ. Пожалуйста, попробуйте ещё раз.');
    console.error(err);
  } finally {
    submit.disabled = false;
    submit.textContent = original;
  }
});

document.getElementById('editResponse').addEventListener('click', () => {
  document.getElementById('successMessage').classList.remove('show');
  form.style.display = 'grid';
});

// Ответ хранится локально только как резервная копия после успешной отправки.