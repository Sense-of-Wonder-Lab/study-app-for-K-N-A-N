'use strict';
const APP_VERSION = '1.2.0';
const STORE_KEY = 'manabi_v1'; // 同じドメインの他ゲームと衝突しないよう接頭辞付き

/* ========== 保存データ ========== */
const COLORS = ['#ff9f2e', '#4aa8ff', '#ff6f91', '#3cc47c', '#9b7bff', '#f2c230'];
const AVATARS = ['🐱', '🐶', '🐰', '🐻', '🐼', '🦊'];
function defaultData() {
  return {
    pin: null,
    profiles: [
      { id: 'p1', name: '1ねんせい', grade: 1, limitMin: 30, avatar: 0 },
      { id: 'p2', name: '4ねんせい', grade: 4, limitMin: 30, avatar: 1 },
    ],
    usage: {},   // { profileId: { date, sec, bonusSec } }
    records: {}, // { profileId: { levelId: { best, time } } }
    lastDate: null,
  };
}
let DB;
function load() {
  try { DB = JSON.parse(localStorage.getItem(STORE_KEY)) || defaultData(); }
  catch (e) { DB = defaultData(); }
}
function save() {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(DB)); } catch (e) {}
}
function today() {
  const d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}
function usageOf(pid) {
  const t = today();
  let u = DB.usage[pid];
  if (!u || u.date !== t) { u = DB.usage[pid] = { date: t, sec: 0, bonusSec: 0 }; }
  return u;
}
function limitSec(p) { return p.limitMin * 60 + usageOf(p.id).bonusSec; }
function remainSec(p) { return Math.max(0, limitSec(p) - usageOf(p.id).sec); }
function fmt(sec) {
  sec = Math.ceil(sec);
  const m = Math.floor(sec / 60), s = sec % 60;
  return m + 'ふん' + String(s).padStart(2, '0') + 'びょう';
}
function profile(id) { return DB.profiles.find(p => p.id === id); }

/* ========== 画面切り替え ========== */
let current = null;      // 今あそんでいる子の id
let screen = 'profiles';
const COUNTED = new Set(['home', 'calc-menu', 'pref-menu', 'calc-play', 'pref-play', 'result']);
const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);
function go(name) {
  if (COUNTED.has(name) && current && remainSec(profile(current)) <= 0) name = 'timeup';
  screen = name;
  $$('.screen').forEach(el => el.classList.toggle('on', el.id === 's-' + name));
  const r = RENDER[name]; if (r) r();
  updateTimeUI();
  window.scrollTo(0, 0);
}
document.addEventListener('click', e => {
  const b = e.target.closest('[data-go]');
  if (b) { sound.tap(); go(b.dataset.go); }
});

/* ========== 時間制限 ========== */
let lastTick = performance.now();
let warned = false;
setInterval(() => {
  const now = performance.now();
  const dt = Math.min(2, (now - lastTick) / 1000); // 停止・スリープ中は数えない
  lastTick = now;
  if (document.visibilityState !== 'visible' || !current || !COUNTED.has(screen)) return;
  const p = profile(current);
  const u = usageOf(p.id);
  u.sec += dt;
  if (Math.floor(u.sec) % 5 === 0) save();
  const r = remainSec(p);
  if (r <= 60 && !warned && r > 0) { warned = true; flash('あと 1ぷん だよ'); }
  if (r <= 0) { save(); sound.end(); go('timeup'); return; }
  updateTimeUI();
}, 1000);
document.addEventListener('visibilitychange', () => { lastTick = performance.now(); save(); });
window.addEventListener('pagehide', save);

function updateTimeUI() {
  if (!current) return;
  const p = profile(current); if (!p) return;
  const r = remainSec(p), lim = limitSec(p);
  const pct = lim ? Math.max(0, r / lim * 100) : 0;
  $$('.remain').forEach(el => el.textContent = fmt(r));
  $$('.meter i').forEach(el => {
    el.style.width = pct + '%';
    el.className = r <= 60 ? 'crit' : r <= 300 ? 'low' : '';
  });
}
let flashTimer;
function flash(msg) {
  const t = $('#update-toast');
  if (t.dataset.update) return;
  t.querySelector('span').textContent = msg;
  t.querySelector('button').style.display = 'none';
  t.classList.add('on');
  clearTimeout(flashTimer);
  flashTimer = setTimeout(() => t.classList.remove('on'), 3500);
}

/* ========== 効果音(ファイル不要・オフラインOK) ========== */
const sound = (() => {
  let ctx;
  function ac() {
    if (!ctx) { const C = window.AudioContext || window.webkitAudioContext; if (C) ctx = new C(); }
    if (ctx && ctx.state === 'suspended') ctx.resume();
    return ctx;
  }
  function tone(freq, start, dur, type = 'sine', vol = 0.2) {
    const c = ac(); if (!c) return;
    const o = c.createOscillator(), g = c.createGain();
    o.type = type; o.frequency.value = freq;
    g.gain.setValueAtTime(vol, c.currentTime + start);
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + start + dur);
    o.connect(g); g.connect(c.destination);
    o.start(c.currentTime + start); o.stop(c.currentTime + start + dur + 0.05);
  }
  return {
    unlock: ac,
    tap: () => tone(660, 0, 0.06, 'triangle', 0.08),
    ok: () => { tone(880, 0, 0.12, 'triangle'); tone(1320, 0.1, 0.2, 'triangle'); },
    ng: () => { tone(220, 0, 0.25, 'square', 0.08); },
    fanfare: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.12, 0.25, 'triangle')),
    end: () => [784, 659, 523].forEach((f, i) => tone(f, i * 0.2, 0.35, 'sine')),
  };
})();
document.addEventListener('touchstart', () => sound.unlock(), { once: true, passive: true });
document.addEventListener('mousedown', () => sound.unlock(), { once: true });
// iOSのダブルタップ拡大を防ぐ
let lastTouch = 0;
document.addEventListener('touchend', e => {
  const n = Date.now();
  if (n - lastTouch < 350 && !e.target.closest('input,select')) e.preventDefault();
  lastTouch = n;
}, { passive: false });

/* ========== ユーティリティ ========== */
const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const pick = arr => arr[Math.floor(Math.random() * arr.length)];
function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
function esc(s) { return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }

/* ========== もんだい: けいさん ========== */
const CALC_LEVELS = [
  // 小1 レベル1: くりあがり(こたえ 10〜18)
  { id: 'g1L1a', grade: 1, emoji: '🚀', name: 'レベル1 くりあがり', note: '9 + 5 など(こたえ 10〜18)', gen() {
      const a = rnd(1, 9), b = rnd(10 - a, 9); return [`${a} + ${b}`, a + b]; } },
  // 小1 レベル1: くりさがり(こたえ 2〜9)
  { id: 'g1L1b', grade: 1, emoji: '🌈', name: 'レベル1 くりさがり', note: '13 − 6 など(こたえ 2〜9)', gen() {
      const a = rnd(10, 18), b = rnd(Math.max(a % 10 + 1, a - 9), Math.min(9, a - 2)); return [`${a} − ${b}`, a - b]; } },
  // 小1 レベル2: 2けたの たしざん(こたえ 10〜99、くりあがり 7わり)
  { id: 'g1L2a', grade: 1, emoji: '🦖', name: 'レベル2 たしざん', note: '2けた 38 + 27 など', gen() {
      const carry = Math.random() < 0.7;
      for (;;) {
        const a = rnd(10, 98), b = Math.random() < 0.4 ? rnd(1, 9) : rnd(10, 89);
        if (a + b > 99 || a + b < 10) continue;
        if ((a % 10 + b % 10 >= 10) !== carry) continue;
        return Math.random() < 0.3 && b < 10 ? [`${b} + ${a}`, a + b] : [`${a} + ${b}`, a + b];
      } } },
  // 小1 レベル2: 2けたの ひきざん(こたえ 2〜98、くりさがり 7わり)
  { id: 'g1L2b', grade: 1, emoji: '🐲', name: 'レベル2 ひきざん', note: '2けた 52 − 19 など', gen() {
      const borrow = Math.random() < 0.7;
      for (;;) {
        const a = rnd(11, 99), b = Math.random() < 0.4 ? rnd(1, 9) : rnd(10, 97);
        const d = a - b;
        if (d < 2 || d > 98) continue;
        if ((a % 10 < b % 10) !== borrow) continue;
        return [`${a} − ${b}`, d];
      } } },
  { id: 'c5', grade: 2, grades: [1, 2, 3, 4], emoji: '⭐', name: 'かけざん九九', note: '2〜9のだん', gen() { const a = rnd(2, 9), b = rnd(1, 9); return [`${a} × ${b}`, a * b]; } },
  { id: 'c6', grade: 3, emoji: '🍰', name: 'わりざん', note: '九九を つかう', gen() { const b = rnd(2, 9), q = rnd(1, 9); return [`${b * q} ÷ ${b}`, q]; } },
  { id: 'c7', grade: 3, emoji: '🧮', name: '3けたの たし算・ひき算', note: '352 + 478 など', gen() {
      if (Math.random() < 0.5) { const a = rnd(100, 899), b = rnd(100, 999 - a); return [`${a} + ${b}`, a + b]; }
      const a = rnd(200, 999), b = rnd(100, a - 1); return [`${a} − ${b}`, a - b]; } },
  { id: 'c8', grade: 4, emoji: '🏔️', name: '2けた × 1けた', note: '47 × 6 など', gen() { const a = rnd(12, 99), b = rnd(2, 9); return [`${a} × ${b}`, a * b]; } },
  { id: 'c9', grade: 4, emoji: '🐉', name: 'わり算の ひっ算', note: '3けた ÷ 1けた(わりきれる)', gen() {
      const b = rnd(2, 9), q = rnd(Math.ceil(100 / b), Math.floor(999 / b)); return [`${b * q} ÷ ${b}`, q]; } },
  { id: 'c10', grade: 4, emoji: '👑', name: 'ミックス', note: '4年の ぜんぶ', gen() { return pick([CALC_LEVELS[4], CALC_LEVELS[5], CALC_LEVELS[7], CALC_LEVELS[8]]).gen(); } },
];
const PREF_LEVELS = [
  { id: 'q1', emoji: '🔤', name: 'よみかた', note: 'けんの なまえを よもう', minGrade: 1 },
  { id: 'q2', emoji: '🧭', name: 'どこの ちほう?', note: '8つの ちほう', minGrade: 1 },
  { id: 'q3', emoji: '🏯', name: '県庁所在地', note: 'けんちょう しょざいち', minGrade: 3 },
  { id: 'q4', emoji: '🔁', name: 'ぎゃくから', note: '県庁所在地 → 県', minGrade: 3 },
];
const SET_SIZE = 10;

let showAllCalc = false;
const RENDER = {};
RENDER.profiles = () => {
  current = null;
  const box = $('#profile-list');
  box.innerHTML = '';
  DB.profiles.forEach(p => {
    const r = remainSec(p);
    const b = document.createElement('button');
    b.className = 'big' + (r <= 0 ? ' locked' : '');
    b.style.borderTop = `8px solid ${COLORS[p.avatar % COLORS.length]}`;
    b.innerHTML = `<span class="emoji">${AVATARS[p.avatar % AVATARS.length]}</span>${esc(p.name)}<span class="note">${r <= 0 ? 'きょうは おしまい' : 'のこり ' + fmt(r)}</span>`;
    b.onclick = () => {
      sound.tap();
      current = p.id; warned = remainSec(p) <= 60;
      go(r <= 0 ? 'timeup' : 'home');
    };
    box.appendChild(b);
  });
};
RENDER.home = () => { $('#home-name').textContent = profile(current).name; };
RENDER['calc-menu'] = () => {
  const p = profile(current);
  const box = $('#calc-levels'); box.innerHTML = '';
  const rec = DB.records[current] || {};
  // 基本は「その学年と、2学年下まで」の問題を表示(復習も含める)
  const list = showAllCalc ? CALC_LEVELS : CALC_LEVELS.filter(l => l.grades ? l.grades.includes(p.grade) : (l.grade <= p.grade && l.grade >= p.grade - 2));
  list.forEach(l => {
    const b = document.createElement('button');
    b.className = 'big';
    const best = rec[l.id];
    b.innerHTML = `<span class="emoji">${l.emoji}</span>${esc(l.name)}<span class="note">${esc(l.note)}</span><span class="best">${best ? '⭐'.repeat(stars(best.best)) + ' ' + best.best + '/' + SET_SIZE : ''}</span>`;
    b.onclick = () => { sound.tap(); startCalc(l); };
    box.appendChild(b);
  });
  $('#calc-all').textContent = showAllCalc ? 'じぶんの がくねんだけ みる' : 'ほかの がくねんの もんだいも みる';
};
$('#calc-all').onclick = () => { showAllCalc = !showAllCalc; RENDER['calc-menu'](); };
RENDER['pref-menu'] = () => {
  const p = profile(current);
  const box = $('#pref-levels'); box.innerHTML = '';
  const rec = DB.records[current] || {};
  PREF_LEVELS.forEach(l => {
    const b = document.createElement('button');
    b.className = 'big';
    const best = rec[l.id];
    b.innerHTML = `<span class="emoji">${l.emoji}</span>${esc(l.name)}<span class="note">${esc(l.note)}${p.grade < l.minGrade ? '(むずかしいよ)' : ''}</span><span class="best">${best ? '⭐'.repeat(stars(best.best)) + ' ' + best.best + '/' + SET_SIZE : ''}</span>`;
    b.onclick = () => { sound.tap(); startPref(l); };
    box.appendChild(b);
  });
};

/* ========== プレイ共通 ========== */
let game = null; // { kind, level, items, i, results[], startAt }
function stars(n) { return n >= SET_SIZE ? 3 : n >= SET_SIZE * 0.8 ? 2 : n >= SET_SIZE * 0.5 ? 1 : 0; }
function renderProgress(sel) {
  const box = $(sel); box.innerHTML = '';
  for (let k = 0; k < SET_SIZE; k++) {
    const s = document.createElement('span');
    if (game.results[k] === true) s.className = 'ok';
    else if (game.results[k] === false) s.className = 'ng';
    else if (k === game.i) s.className = 'now';
    box.appendChild(s);
  }
}
function showFb(sel, ok) {
  const el = $(sel);
  el.textContent = ok ? '⭕' : '❌';
  el.classList.remove('show'); void el.offsetWidth; el.classList.add('show');
}
// 画面を切り替えたとき前回の ⭕❌ が再生されないよう、終わったら外す
document.querySelectorAll('.feedback').forEach(el => el.addEventListener('animationend', () => el.classList.remove('show')));
function finish() {
  const n = game.results.filter(x => x).length;
  const time = Math.round((Date.now() - game.startAt) / 1000);
  const rec = DB.records[current] = DB.records[current] || {};
  const prev = rec[game.level.id];
  const isBest = !prev || n > prev.best || (n === prev.best && time < prev.time);
  if (isBest) rec[game.level.id] = { best: n, time };
  save();
  go('result');
  $('#r-stars').textContent = '⭐'.repeat(stars(n)) + '☆'.repeat(3 - stars(n));
  $('#r-score').textContent = `${n} / ${SET_SIZE} もん せいかい`;
  $('#r-detail').textContent = `${game.level.name}・${time} びょう`;
  $('#r-best').textContent = isBest && prev ? '🎉 じこベスト こうしん!' : prev ? `じこベスト ${prev.best}もん・${prev.time}びょう` : '';
  if (n >= SET_SIZE * 0.8) sound.fanfare();
}
$('#r-again').onclick = () => { sound.tap(); game.kind === 'calc' ? startCalc(game.level) : startPref(game.level); };
$('#r-menu').onclick = () => { sound.tap(); go(game.kind === 'calc' ? 'calc-menu' : 'pref-menu'); };
$('#calc-quit').onclick = () => { sound.tap(); go('calc-menu'); };
$('#pref-quit').onclick = () => { sound.tap(); go('pref-menu'); };

/* ========== けいさん プレイ ========== */
let typed = '', locked = false;
function startCalc(level) {
  const items = []; const seen = new Set();
  let guard = 0;
  while (items.length < SET_SIZE && guard++ < 500) {
    const [q, a] = level.gen();
    if (seen.has(q) && guard < 400) continue;
    seen.add(q); items.push({ q, a });
  }
  game = { kind: 'calc', level, items, i: 0, results: [], startAt: Date.now() };
  $('#calc-title').textContent = level.name;
  go('calc-play');
  showCalc();
}
function showCalc() {
  $('#calc-fb').classList.remove('show');
  typed = ''; locked = false; game.miss = 0;
  const it = game.items[game.i];
  $('#calc-q').textContent = it.q + ' =';
  $('#calc-a').textContent = '';
  $('#calc-correct').textContent = '';
  renderProgress('#calc-progress');
}
(function buildKeypad() {
  const box = $('#keypad');
  ['7', '8', '9', '4', '5', '6', '1', '2', '3', '', '0', 'del'].forEach(k => {
    const b = document.createElement('button');
    if (k === 'del') { b.textContent = 'けす'; b.className = 'del'; }
    else if (k === '') { b.style.visibility = 'hidden'; }
    else b.textContent = k;
    b.addEventListener('click', () => key(k));
    box.appendChild(b);
  });
})();
function key(k) {
  if (screen !== 'calc-play' || locked) return;
  if (k === 'del') { typed = typed.slice(0, -1); sound.tap(); }
  else if (k && typed.length < 5) { typed = (typed === '0' ? '' : typed) + k; sound.tap(); }
  $('#calc-a').textContent = typed;
  // こたえと同じ けたすう まで うったら 自動で はんてい
  if (typed.length >= String(game.items[game.i].a).length) answerCalc();
}
document.addEventListener('keydown', e => {
  if (screen !== 'calc-play') return;
  if (/^[0-9]$/.test(e.key)) key(e.key);
  else if (e.key === 'Backspace') key('del');
});
function answerCalc() {
  locked = true;
  const it = game.items[game.i];
  const ok = Number(typed) === it.a;
  showFb('#calc-fb', ok);
  if (ok) {
    // 1かいめで せいかい なら ⭕、まちがえてから せいかい は ❌ のまま
    if (game.results[game.i] === undefined) game.results[game.i] = true;
    sound.ok();
    renderProgress('#calc-progress');
    setTimeout(() => {
      if (screen !== 'calc-play') return;
      game.i++;
      if (game.i >= SET_SIZE) finish(); else showCalc();
    }, 600);
    return;
  }
  // まちがい: すすまない。けして やりなおし
  game.results[game.i] = false;
  game.miss = (game.miss || 0) + 1;
  sound.ng();
  renderProgress('#calc-progress');
  if (game.miss >= 3) $('#calc-correct').textContent = `ヒント: こたえは ${it.a}`;
  setTimeout(() => {
    if (screen !== 'calc-play') return;
    typed = ''; locked = false;
    $('#calc-a').textContent = '';
  }, 700);
}

/* ========== とどうふけん プレイ ========== */
function prefLabel(pr, withYomi) { return withYomi ? `${pr[0]}<small>${pr[1]}</small>` : pr[0]; }
function startPref(level) {
  const p = profile(current);
  const yomi = p.grade <= 3; // 低・中学年はふりがな付き
  let pool = shuffle(PREFS);
  if (level.id === 'q3' || level.id === 'q4') {
    // 県名と県庁所在地名がちがう県を多めに
    const diff = pool.filter(x => x[2].replace(/[市(].*$/, '') !== x[0].replace(/[都道府県]$/, ''));
    const same = pool.filter(x => !diff.includes(x));
    pool = shuffle(diff.slice(0, 7).concat(same.slice(0, 3)));
  }
  const items = pool.slice(0, SET_SIZE).map(pr => makePrefQ(level.id, pr, yomi));
  game = { kind: 'pref', level, items, i: 0, results: [], startAt: Date.now(), yomi };
  $('#pref-title').textContent = level.name;
  go('pref-play');
  showPref();
}
function makePrefQ(mode, pr, yomi) {
  const others = shuffle(PREFS.filter(x => x !== pr));
  if (mode === 'q1') {
    // 読みが似ないように別の県の読みを3つ
    const opts = shuffle([pr, ...others.slice(0, 3)]);
    return { prompt: 'なんて よむ?', q: pr[0], opts: opts.map(o => o[1]), ans: pr[1] };
  }
  if (mode === 'q2') {
    return { prompt: 'どこの ちほう?', q: yomi ? `${pr[0]}<br><span style="font-size:.5em">${pr[1]}</span>` : pr[0], opts: REGIONS.slice(), ans: pr[4], eight: true };
  }
  if (mode === 'q3') {
    const opts = shuffle([pr, ...others.slice(0, 3)]);
    return { prompt: 'けんちょう しょざいち は?', q: yomi ? `${pr[0]}<br><span style="font-size:.5em">${pr[1]}</span>` : pr[0],
      opts: opts.map(o => yomi ? `${o[2]}<small>${o[3]}</small>` : o[2]), keys: opts.map(o => o[2]), ans: pr[2] };
  }
  // q4: 県庁所在地 → 県
  const opts = shuffle([pr, ...others.slice(0, 3)]);
  return { prompt: 'どの けんの 県庁所在地?', q: yomi ? `${pr[2]}<br><span style="font-size:.5em">${pr[3]}</span>` : pr[2],
    opts: opts.map(o => prefLabel(o, yomi)), keys: opts.map(o => o[0]), ans: pr[0] };
}
function showPref() {
  $('#pref-fb').classList.remove('show');
  locked = false;
  const it = game.items[game.i];
  $('#pref-prompt').textContent = it.prompt;
  $('#pref-q').innerHTML = it.q;
  const box = $('#pref-choices');
  box.className = 'choices' + (it.eight ? ' eight' : '');
  box.innerHTML = '';
  it.opts.forEach((o, k) => {
    const b = document.createElement('button');
    b.innerHTML = it.keys ? o : esc(o);
    b.dataset.key = it.keys ? it.keys[k] : o;
    b.onclick = () => answerPref(b);
    box.appendChild(b);
  });
  renderProgress('#pref-progress');
}
function answerPref(btn) {
  if (locked) return;
  locked = true;
  const it = game.items[game.i];
  const ok = btn.dataset.key === it.ans;
  game.results[game.i] = ok;
  showFb('#pref-fb', ok);
  $$('#pref-choices button').forEach(b => { if (b.dataset.key === it.ans) b.classList.add('right'); });
  if (ok) sound.ok(); else { sound.ng(); btn.classList.add('wrong'); }
  renderProgress('#pref-progress');
  setTimeout(() => {
    if (screen !== 'pref-play') return;
    game.i++;
    if (game.i >= SET_SIZE) finish(); else showPref();
  }, ok ? 800 : 2000);
}

/* ========== おしまい画面 ========== */
RENDER.timeup = () => {
  const p = current && profile(current);
  $('#tu-title').textContent = p ? `${p.name}、きょうは ここまで!` : 'きょうは ここまで!';
  current = null;
};

/* ========== 保護者: 暗証番号 ========== */
let pinBuf = '', pinMode = 'check', pinFirst = '';
function openPin() {
  pinBuf = ''; pinFirst = '';
  pinMode = DB.pin ? 'check' : 'set1';
  go('pin');
}
RENDER.pin = () => {
  current = null;
  $('#pin-title').textContent = pinMode === 'check' ? '保護者の暗証番号' : '暗証番号を決めてください';
  $('#pin-sub').textContent = pinMode === 'set2' ? 'もう一度入力してください' : '4けたの数字(子どもに見られないように)';
  $('#pin-dots').textContent = '●'.repeat(pinBuf.length) + '○'.repeat(4 - pinBuf.length);
};
(function buildPinpad() {
  const box = $('#pinpad');
  ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'].forEach(k => {
    const b = document.createElement('button');
    b.textContent = k;
    if (!k) b.style.visibility = 'hidden';
    b.onclick = () => pinKey(k);
    box.appendChild(b);
  });
})();
function pinKey(k) {
  if (k === '⌫') pinBuf = pinBuf.slice(0, -1);
  else if (pinBuf.length < 4) pinBuf += k;
  RENDER.pin();
  if (pinBuf.length < 4) return;
  setTimeout(() => {
    if (pinMode === 'check') {
      if (pinBuf === DB.pin) { go('parent'); return; }
      $('#pin-sub').textContent = 'ちがいます';
    } else if (pinMode === 'set1') {
      pinFirst = pinBuf; pinMode = 'set2';
    } else {
      if (pinBuf === pinFirst) { DB.pin = pinBuf; save(); go('parent'); return; }
      pinMode = 'set1'; $('#pin-sub').textContent = '一致しませんでした。最初から入力してください';
    }
    pinBuf = '';
    $('#pin-dots').textContent = '○○○○';
    if (pinMode === 'set2') $('#pin-sub').textContent = 'もう一度入力してください';
    if (pinMode === 'set1' && !pinFirst) $('#pin-title').textContent = '暗証番号を決めてください';
  }, 150);
}
$('#open-parent').onclick = openPin;

/* ========== 保護者: 設定 ========== */
RENDER.parent = () => {
  current = null;
  const body = $('#parent-body');
  const limits = [5, 10, 15, 20, 25, 30, 40, 45, 50, 60, 75, 90, 120];
  body.innerHTML = DB.profiles.map(p => {
    const u = usageOf(p.id);
    return `<div class="panel" data-pid="${p.id}">
      <div class="row"><span style="font-size:36px">${AVATARS[p.avatar % AVATARS.length]}</span>
        <input type="text" class="f-name" value="${esc(p.name)}" maxlength="10">
        <select class="f-grade">${[1, 2, 3, 4, 5, 6].map(g => `<option value="${g}" ${g === p.grade ? 'selected' : ''}>小${g}</option>`).join('')}</select>
        <button class="sbtn f-avatar">アイコン変更</button></div>
      <div class="row">1日の上限
        <select class="f-limit">${limits.map(m => `<option value="${m}" ${m === p.limitMin ? 'selected' : ''}>${m}分</option>`).join('')}</select></div>
      <div class="row">今日の使用: <b>${Math.floor(u.sec / 60)}分${Math.floor(u.sec % 60)}秒</b> / 上限 ${Math.round(limitSec(p) / 60)}分${u.bonusSec ? `(延長 +${u.bonusSec / 60}分含む)` : ''}</div>
      <div class="row">
        <button class="sbtn primary f-ext">今日だけ +10分</button>
        <button class="sbtn f-reset">今日の使用時間を0に</button>
        ${DB.profiles.length > 1 ? '<button class="sbtn danger f-del">この子を削除</button>' : ''}
      </div>
    </div>`;
  }).join('') + `
    <div class="row"><button class="sbtn primary" id="f-add">+ 子どもを追加</button></div>
    <div class="panel"><h3>その他</h3>
      <div class="row"><button class="sbtn" id="f-pin">暗証番号を変更</button></div>
      <div class="row" style="color:var(--sub);font-size:15px">記録と設定はこの端末の中だけに保存されます。ブラウザのデータを消すとリセットされます。<br>
      時間制限はアプリ内の仕組みなので、確実に止めたい場合は iPad のスクリーンタイム / Android のファミリーリンクも併用してください。</div>
      <div class="row" style="color:var(--sub);font-size:14px">バージョン ${APP_VERSION}</div>
    </div>`;
  body.querySelectorAll('.panel[data-pid]').forEach(el => {
    const p = profile(el.dataset.pid);
    el.querySelector('.f-name').onchange = e => { p.name = e.target.value.trim() || p.name; save(); };
    el.querySelector('.f-grade').onchange = e => { p.grade = Number(e.target.value); save(); };
    el.querySelector('.f-limit').onchange = e => { p.limitMin = Number(e.target.value); save(); RENDER.parent(); };
    el.querySelector('.f-avatar').onclick = () => { p.avatar = (p.avatar + 1) % AVATARS.length; save(); RENDER.parent(); };
    el.querySelector('.f-ext').onclick = () => { usageOf(p.id).bonusSec += 600; save(); RENDER.parent(); };
    el.querySelector('.f-reset').onclick = () => { if (confirm(`${p.name}の今日の使用時間を0に戻しますか?`)) { usageOf(p.id).sec = 0; save(); RENDER.parent(); } };
    const del = el.querySelector('.f-del');
    if (del) del.onclick = () => {
      if (!confirm(`${p.name}を削除しますか?記録も消えます。`)) return;
      DB.profiles = DB.profiles.filter(x => x !== p); delete DB.usage[p.id]; delete DB.records[p.id]; save(); RENDER.parent();
    };
  });
  $('#f-add').onclick = () => {
    const id = 'p' + Date.now().toString(36);
    DB.profiles.push({ id, name: 'あたらしい子', grade: 1, limitMin: 30, avatar: DB.profiles.length % AVATARS.length });
    save(); RENDER.parent();
  };
  $('#f-pin').onclick = () => { pinBuf = ''; pinFirst = ''; pinMode = 'set1'; go('pin'); };
};

/* ========== オフライン(Service Worker)と更新通知 ========== */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').then(reg => {
      const offer = w => {
        const t = $('#update-toast');
        t.dataset.update = '1';
        t.querySelector('span').textContent = '新しいバージョンがあります';
        const b = t.querySelector('button');
        b.style.display = '';
        b.onclick = () => w.postMessage('SKIP_WAITING');
        t.classList.add('on');
      };
      if (reg.waiting && navigator.serviceWorker.controller) offer(reg.waiting);
      reg.addEventListener('updatefound', () => {
        const w = reg.installing;
        w.addEventListener('statechange', () => {
          if (w.state === 'installed' && navigator.serviceWorker.controller) offer(w);
        });
      });
      // 開くたび・画面に戻るたびに更新を確認(オフライン時は失敗するだけ)
      reg.update().catch(() => {});
      document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') reg.update().catch(() => {}); });
    }).catch(() => {});
    let reloaded = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (reloaded) return; reloaded = true; save(); location.reload();
    });
  });
}

/* ========== 起動 ========== */
load();
// iOS: ホーム画面アプリとして使うとデータが消されにくくなるよう永続化を要求
if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});
go('profiles');
