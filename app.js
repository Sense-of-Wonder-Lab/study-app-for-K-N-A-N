'use strict';
const APP_VERSION = '2.0.0';
const STORE_KEY = 'manabi_v1'; // 同じドメインの他ゲームと衝突しないよう接頭辞付き

/* ========== テーマ(子どもごとの見た目) ========== */
const THEMES = {
  ohisama: { name: 'おひさま', bg: '#fff8ec', card: '#ffffff', ink: '#3b2f2a', sub: '#8a7a70', line: '#f0e2cf', accent: '#ff9f2e', accent2: '#4aa8ff' },
  sora:    { name: 'そら',     bg: '#eaf5ff', card: '#ffffff', ink: '#1d3557', sub: '#6b8199', line: '#cfe3f5', accent: '#2f8de4', accent2: '#ff8a3d' },
  sakura:  { name: 'さくら',   bg: '#fff0f5', card: '#ffffff', ink: '#4a2635', sub: '#9a7584', line: '#f6d6e2', accent: '#ff5d8f', accent2: '#9b7bff' },
  mori:    { name: 'もり',     bg: '#eef9ee', card: '#ffffff', ink: '#23402a', sub: '#6f8a74', line: '#cfe9cf', accent: '#2fae63', accent2: '#ff9f2e' },
  yume:    { name: 'ゆめ',     bg: '#f4effe', card: '#ffffff', ink: '#33265a', sub: '#7f74a3', line: '#e1d8f7', accent: '#8b63f5', accent2: '#ff6f91' },
  uchu:    { name: 'うちゅう', bg: '#1d2042', card: '#2c305f', ink: '#f4f1ff', sub: '#a9aed8', line: '#14173a', accent: '#ffc83d', accent2: '#5fd0ff' },
};
function applyTheme(p) {
  const t = THEMES[(p && p.theme) || 'ohisama'] || THEMES.ohisama;
  const r = document.documentElement.style;
  ['bg', 'card', 'ink', 'sub', 'line', 'accent', 'accent2'].forEach(k => r.setProperty('--' + k, t[k]));
  const meta = document.querySelector('meta[name=theme-color]'); if (meta) meta.content = t.bg;
}

/* ========== 保存データ ========== */
const AVATARS = ['🐱', '🐶', '🐰', '🐻', '🐼', '🦊', '🐸', '🐧'];
function defaultData() {
  return {
    pin: null,
    profiles: [
      { id: 'p1', name: '1ねんせい', grade: 1, limitMin: 30, avatar: 0, theme: 'sora', title: 'けいさん ロケット' },
      { id: 'p2', name: '4ねんせい', grade: 4, limitMin: 30, avatar: 1, theme: 'sakura', title: 'マジカル けいさん' },
    ],
    usage: {},   // { profileId: { date, sec, bonusSec } }
    records: {}, // { profileId: { levelId: { best, time } } }
    zukan: {},   // { profileId: { monsterId: { n, kira, first } } }
    ta: {},      // { profileId: { levelId: best } }
  };
}
let DB;
function load() {
  try { DB = JSON.parse(localStorage.getItem(STORE_KEY)) || defaultData(); }
  catch (e) { DB = defaultData(); }
  // 古いバージョンのデータに足りない項目を補う
  DB.zukan = DB.zukan || {}; DB.ta = DB.ta || {}; DB.records = DB.records || {}; DB.usage = DB.usage || {};
  DB.profiles.forEach((p, i) => { if (!p.theme) p.theme = ['sora', 'sakura', 'mori', 'yume'][i % 4]; if (p.title === undefined) p.title = ''; });
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
function zukanOf(pid) { return DB.zukan[pid] = DB.zukan[pid] || {}; }

/* ========== 画面切り替え ========== */
let current = null;      // 今あそんでいる子の id
let screen = 'profiles';
const COUNTED = new Set(['home', 'calc-menu', 'pref-menu', 'calc-play', 'pref-play', 'result', 'zukan']);
const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);
function go(name) {
  if (COUNTED.has(name) && current && remainSec(profile(current)) <= 0) name = 'timeup';
  screen = name;
  $('#zk-modal').classList.remove('on');
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
  function tone(freq, start, dur, type = 'sine', vol = 0.2, slide) {
    const c = ac(); if (!c) return;
    const o = c.createOscillator(), g = c.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, c.currentTime + start);
    if (slide) o.frequency.exponentialRampToValueAtTime(slide, c.currentTime + start + dur);
    g.gain.setValueAtTime(vol, c.currentTime + start);
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + start + dur);
    o.connect(g); g.connect(c.destination);
    o.start(c.currentTime + start); o.stop(c.currentTime + start + dur + 0.05);
  }
  return {
    unlock: ac,
    tap: () => tone(660, 0, 0.06, 'triangle', 0.08),
    ok: () => { tone(880, 0, 0.12, 'triangle'); tone(1320, 0.1, 0.2, 'triangle'); },
    hit: () => { tone(300, 0, 0.18, 'square', 0.12, 80); tone(1200, 0.02, 0.12, 'triangle', 0.15); },
    ng: () => { tone(220, 0, 0.25, 'square', 0.08); },
    roar: () => { tone(140, 0, 0.4, 'sawtooth', 0.1, 70); },
    down: () => { tone(800, 0, 0.6, 'triangle', 0.15, 100); },
    fanfare: () => [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, i * 0.12, 0.3, 'triangle')),
    end: () => [784, 659, 523].forEach((f, i) => tone(f, i * 0.2, 0.35, 'sine')),
    beep: () => tone(1000, 0, 0.08, 'square', 0.06),
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
function replay(el, cls) { el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); }

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
const ALL_LEVELS = [...CALC_LEVELS, ...PREF_LEVELS];
const SET_SIZE = 10;
const TA_SEC = 60;

/* ========== メニュー ========== */
let showAllCalc = false;
let calcMode = 'battle';
const RENDER = {};
RENDER.profiles = () => {
  current = null;
  applyTheme(null);
  const box = $('#profile-list');
  box.innerHTML = '';
  DB.profiles.forEach(p => {
    const r = remainSec(p);
    const t = THEMES[p.theme] || THEMES.ohisama;
    const b = document.createElement('button');
    b.className = 'big' + (r <= 0 ? ' locked' : '');
    b.style.borderTop = `10px solid ${t.accent}`;
    b.innerHTML = `<span class="emoji">${AVATARS[p.avatar % AVATARS.length]}</span>${esc(p.name)}<span class="note">${r <= 0 ? 'きょうは おしまい' : 'のこり ' + fmt(r)}</span>`;
    b.onclick = () => {
      sound.tap();
      current = p.id; warned = remainSec(p) <= 60;
      applyTheme(p);
      go(r <= 0 ? 'timeup' : 'home');
    };
    box.appendChild(b);
  });
};
RENDER.home = () => {
  const p = profile(current);
  applyTheme(p);
  $('#home-name').textContent = p.name;
  $('#home-title').textContent = p.title || 'まなびランド';
  const n = Object.keys(zukanOf(current)).length;
  $('#home-zk').textContent = `${n} / ${MONSTERS.length} たい あつめた`;
};
function miniMonsters(levelId) {
  const z = zukanOf(current);
  return MONSTERS.filter(m => m.level === levelId).map(m => monsterSVG(m, { silhouette: !z[m.id], kira: z[m.id] && z[m.id].kira })).join('');
}
function levelButton(l, onClick, extra) {
  const b = document.createElement('button');
  b.className = 'big';
  b.innerHTML = `<span class="emoji">${l.emoji}</span>${esc(l.name)}<span class="note">${esc(l.note)}${extra || ''}</span>`;
  b.onclick = () => { sound.tap(); onClick(); };
  return b;
}
RENDER['calc-menu'] = () => {
  const p = profile(current);
  const box = $('#calc-levels'); box.innerHTML = '';
  $$('#mode-seg button').forEach(b => b.classList.toggle('on', b.dataset.mode === calcMode));
  // 基本は「その学年と、2学年下まで」の問題を表示(復習も含める)
  const list = showAllCalc ? CALC_LEVELS : CALC_LEVELS.filter(l => l.grades ? l.grades.includes(p.grade) : (l.grade <= p.grade && l.grade >= p.grade - 2));
  const ta = DB.ta[current] || {};
  list.forEach(l => {
    const b = levelButton(l, () => calcMode === 'ta' ? startTA(l) : startCalc(l));
    if (calcMode === 'ta') b.insertAdjacentHTML('beforeend', `<span class="best">${ta[l.id] ? '🏆 ベスト ' + ta[l.id] + 'もん' : 'まだ きろく なし'}</span>`);
    else b.insertAdjacentHTML('beforeend', `<span class="mini">${miniMonsters(l.id)}</span>`);
    box.appendChild(b);
  });
  $('#calc-all').textContent = showAllCalc ? 'じぶんの がくねんだけ みる' : 'ほかの がくねんの もんだいも みる';
};
$('#calc-all').onclick = () => { showAllCalc = !showAllCalc; RENDER['calc-menu'](); };
$$('#mode-seg button').forEach(b => b.onclick = () => { sound.tap(); calcMode = b.dataset.mode; RENDER['calc-menu'](); });
RENDER['pref-menu'] = () => {
  const p = profile(current);
  const box = $('#pref-levels'); box.innerHTML = '';
  PREF_LEVELS.forEach(l => {
    const b = levelButton(l, () => startPref(l), p.grade < l.minGrade ? '(むずかしいよ)' : '');
    b.insertAdjacentHTML('beforeend', `<span class="mini">${miniMonsters(l.id)}</span>`);
    box.appendChild(b);
  });
};

/* ========== バトル共通 ========== */
let game = null;
function stars(n) { return n >= SET_SIZE ? 3 : n >= SET_SIZE * 0.8 ? 2 : n >= SET_SIZE * 0.5 ? 1 : 0; }
function pickMonster(levelId) {
  const z = zukanOf(current);
  const pool = MONSTERS.filter(m => m.level === levelId);
  const normals = pool.filter(m => !m.boss), boss = pool.find(m => m.boss);
  const notYet = normals.filter(m => !z[m.id]);
  if (notYet.length) return pick(notYet);          // まだ あっていない子から
  if (!z[boss.id]) return boss;                     // 3たい あつめたら ボス登場
  return pick(pool);                                // あとは キラキラねらい
}
function arena() { return $('#' + game.kind.replace('ta', 'calc') + '-arena'); }
function renderArena() {
  // もう一方の画面に のこった かいじゅうを けす(同じ id が ふたつ あると まちがった ほうが うごくため)
  $('#calc-arena').innerHTML = ''; $('#pref-arena').innerHTML = '';
  const a = arena();
  if (game.kind === 'ta') {
    a.innerHTML = `<div class="ta"><div class="t"><b id="ta-t">${Math.ceil(game.left)}</b><span>のこり びょう</span></div><div><b id="ta-n">${game.count}</b><span>もん せいかい</span></div></div><div class="dmg" id="dmg"></div>`;
    return;
  }
  const m = game.mon;
  a.innerHTML = `<div class="mon-head"><span class="mon-name">${m.boss ? '<span class="boss">ボス</span>' : ''}${esc(m.name)}</span><div class="hp"><i id="hp"></i></div><span class="hpnum" id="hpnum"></span></div>
    <div class="mon" id="mon">${monsterSVG(m)}</div><div class="dmg" id="dmg"></div>`;
  updateHP();
}
function updateHP() {
  const left = SET_SIZE - game.i;
  $('#hp').style.width = (left / SET_SIZE * 100) + '%';
  $('#hpnum').textContent = `HP ${left}`;
}
function popDmg(text, color) {
  const d = $('#dmg'); if (!d) return;
  d.textContent = text; d.style.color = color || '';
  replay(d, 'show');
}
function onCorrect() {
  game.combo = (game.combo || 0) + 1;
  sound.hit();
  if (game.kind === 'ta') { popDmg(game.combo >= 3 ? `${game.combo}れんぞく!` : '⭕', '#2fae63'); return; }
  const mon = $('#mon');
  replay(mon, 'hit');
  popDmg(game.combo >= 3 ? `${game.combo}れんぞく!` : pick(['ドカン!', 'バシッ!', 'ズバッ!', 'ポカッ!']));
}
function onWrong(wrapSel) {
  game.combo = 0;
  sound.ng();
  if (game.kind !== 'ta') { replay($('#mon'), 'attack'); setTimeout(sound.roar, 120); }
  replay($(wrapSel), 'shake');
}
function showFb(sel, ok) {
  const el = $(sel);
  el.textContent = ok ? '⭕' : '❌';
  replay(el, 'show');
}
document.querySelectorAll('.feedback,.dmg').forEach(el => el.addEventListener('animationend', () => el.classList.remove('show')));
document.addEventListener('animationend', e => { if (e.target.classList && e.target.classList.contains('dmg')) e.target.classList.remove('show'); });

// 最後の1問を正解したら、かいじゅうを たおして けっかへ
function defeat() {
  locked = true;
  updateHP();
  setTimeout(() => {
    if (!game || (screen !== 'calc-play' && screen !== 'pref-play')) return;
    $('#mon').classList.remove('hit');
    replay($('#mon'), 'down'); sound.down();
    setTimeout(() => { if (screen === 'calc-play' || screen === 'pref-play') finish(); }, 950);
  }, 350);
}
function finish() {
  const n = game.results.filter(x => x).length;
  const time = Math.round((Date.now() - game.startAt) / 1000);
  const rec = DB.records[current] = DB.records[current] || {};
  const prev = rec[game.level.id];
  const isBest = !prev || n > prev.best || (n === prev.best && time < prev.time);
  if (isBest) rec[game.level.id] = { best: n, time };
  // ずかんに とうろく
  const z = zukanOf(current), m = game.mon, kira = n === SET_SIZE;
  const old = z[m.id];
  const isNew = !old, newKira = kira && !(old && old.kira);
  z[m.id] = { n: (old ? old.n : 0) + 1, kira: !!(old && old.kira) || kira, first: old ? old.first : today() };
  save();
  go('result');
  $('#r-mon').innerHTML = monsterSVG(m, { kira: z[m.id].kira && kira });
  replay($('#r-mon'), 'appear');
  $('#r-get').textContent = isNew ? `${m.name} が なかまに なった!` : `${m.name} を やっつけた!`;
  $('#r-badges').innerHTML = (isNew ? '<span class="badge">NEW! ずかん とうろく</span>' : '') +
    (newKira ? '<span class="badge kira">✨ キラキラ ゲット!</span>' : kira ? '<span class="badge kira">✨ ノーミス!</span>' : '');
  $('#r-stars').textContent = '⭐'.repeat(stars(n)) + '☆'.repeat(3 - stars(n));
  $('#r-score').textContent = `1かいで せいかい ${n} / ${SET_SIZE}`;
  $('#r-detail').textContent = `${game.level.name}・${time} びょう` + (n < SET_SIZE ? '・ノーミスで キラキラに なるよ' : '');
  $('#r-best').textContent = isBest && prev ? '🎉 じこベスト こうしん!' : prev ? `じこベスト ${prev.best}もん・${prev.time}びょう` : '';
  sound.fanfare();
}
$('#r-again').onclick = () => { sound.tap(); game.kind === 'calc' ? startCalc(game.level) : game.kind === 'ta' ? startTA(game.level) : startPref(game.level); };
$('#r-menu').onclick = () => { sound.tap(); go(game.kind === 'pref' ? 'pref-menu' : 'calc-menu'); };
$('#calc-quit').onclick = () => { sound.tap(); go('calc-menu'); };
$('#pref-quit').onclick = () => { sound.tap(); go('pref-menu'); };

/* ========== けいさん プレイ(バトル と タイムアタック) ========== */
let typed = '', locked = false;
function makeCalcItems(level, n) {
  const items = []; const seen = new Set();
  let guard = 0;
  while (items.length < n && guard++ < 500) {
    const [q, a] = level.gen();
    if (seen.has(q) && guard < 400) continue;
    seen.add(q); items.push({ q, a });
  }
  return items;
}
function startCalc(level) {
  game = { kind: 'calc', level, items: makeCalcItems(level, SET_SIZE), i: 0, results: [], startAt: Date.now(), combo: 0, mon: pickMonster(level.id) };
  $('#calc-title').textContent = level.name;
  go('calc-play');
  renderArena();
  showCalc();
}
function showCalc() {
  $('#calc-fb').classList.remove('show');
  typed = ''; locked = false; game.miss = 0;
  if (game.kind === 'ta' && game.i >= game.items.length) game.items.push(...makeCalcItems(game.level, 20));
  const it = game.items[game.i];
  $('#calc-q').textContent = it.q + ' =';
  $('#calc-a').textContent = '';
  $('#calc-correct').textContent = '';
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
    onCorrect();
    game.i++;
    if (game.kind === 'ta') {
      game.count++; $('#ta-n').textContent = game.count;
      setTimeout(() => { if (screen === 'calc-play' && game.kind === 'ta' && game.left > 0) showCalc(); }, 250);
      return;
    }
    if (game.i >= SET_SIZE) { defeat(); return; }
    updateHP();
    setTimeout(() => { if (screen === 'calc-play') showCalc(); }, 550);
    return;
  }
  // まちがい: すすまない。けして やりなおし
  game.results[game.i] = false;
  game.miss = (game.miss || 0) + 1;
  onWrong('#calc-wrap');
  if (game.miss >= 3) $('#calc-correct').textContent = `ヒント: こたえは ${it.a}`;
  setTimeout(() => {
    if (screen !== 'calc-play') return;
    typed = ''; locked = false;
    $('#calc-a').textContent = '';
  }, game.kind === 'ta' ? 400 : 700);
}

/* ---------- 60びょう アタック ---------- */
let taTimer = null;
function startTA(level) {
  game = { kind: 'ta', level, items: makeCalcItems(level, 30), i: 0, results: [], startAt: Date.now(), combo: 0, count: 0, left: TA_SEC };
  $('#calc-title').textContent = '⏱️ ' + level.name;
  go('calc-play');
  renderArena();
  showCalc();
  clearInterval(taTimer);
  let last = performance.now(), lastSec = TA_SEC;
  taTimer = setInterval(() => {
    const now = performance.now(), dt = (now - last) / 1000; last = now;
    if (screen !== 'calc-play' || game.kind !== 'ta') { clearInterval(taTimer); return; }
    if (document.visibilityState !== 'visible') return; // ほかの アプリに いる あいだは とまる
    game.left = Math.max(0, game.left - Math.min(dt, 0.5));
    const s = Math.ceil(game.left);
    const t = $('#ta-t'); if (t) { t.textContent = s; t.parentNode.classList.toggle('crit', s <= 10); }
    if (s !== lastSec && s <= 5 && s > 0) sound.beep();
    lastSec = s;
    if (game.left <= 0) { clearInterval(taTimer); finishTA(); }
  }, 100);
}
function finishTA() {
  locked = true;
  const n = game.count;
  const ta = DB.ta[current] = DB.ta[current] || {};
  const prev = ta[game.level.id] || 0;
  const isBest = n > prev;
  if (isBest) ta[game.level.id] = n;
  save();
  go('result');
  $('#r-mon').innerHTML = '<div style="font-size:140px;line-height:200px">⏱️</div>';
  $('#r-get').textContent = 'タイムアップ!';
  $('#r-badges').innerHTML = isBest && n > 0 ? '<span class="badge best">🏆 ベスト きろく!</span>' : '';
  $('#r-stars').textContent = '';
  $('#r-score').textContent = `${n} もん せいかい`;
  $('#r-detail').textContent = `${game.level.name}・60びょう`;
  $('#r-best').textContent = isBest && prev ? `まえの ベストは ${prev}もん` : prev ? `ベスト ${prev}もん` : '';
  sound.fanfare();
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
  game = { kind: 'pref', level, items, i: 0, results: [], startAt: Date.now(), yomi, combo: 0, mon: pickMonster(level.id) };
  $('#pref-title').textContent = level.name;
  go('pref-play');
  renderArena();
  showPref();
}
function makePrefQ(mode, pr, yomi) {
  const others = shuffle(PREFS.filter(x => x !== pr));
  if (mode === 'q1') {
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
}
function answerPref(btn) {
  if (locked || btn.disabled) return;
  const it = game.items[game.i];
  const ok = btn.dataset.key === it.ans;
  showFb('#pref-fb', ok);
  if (!ok) {
    // まちがい: その ボタンを つかえなくして もういちど えらぶ
    game.results[game.i] = false;
    btn.classList.add('wrong'); btn.disabled = true;
    onWrong('#pref-wrap');
    return;
  }
  locked = true;
  if (game.results[game.i] === undefined) game.results[game.i] = true;
  btn.classList.add('right');
  onCorrect();
  game.i++;
  if (game.i >= SET_SIZE) { defeat(); return; }
  updateHP();
  setTimeout(() => { if (screen === 'pref-play') showPref(); }, 700);
}

/* ========== ずかん ========== */
RENDER.zukan = () => {
  const z = zukanOf(current);
  const n = Object.keys(z).length, k = Object.values(z).filter(x => x.kira).length;
  $('#zk-count').textContent = `📖 ${n} / ${MONSTERS.length} たい   ✨ キラキラ ${k} たい`;
  const box = $('#zk-list'); box.innerHTML = '';
  ALL_LEVELS.forEach(l => {
    const ms = MONSTERS.filter(m => m.level === l.id);
    const g = document.createElement('div');
    g.className = 'zk-group';
    g.innerHTML = `<h3>${l.emoji} ${esc(l.name)}${PREF_LEVELS.includes(l) ? '(とどうふけん)' : ''}</h3><div class="zk-row"></div>`;
    const row = g.querySelector('.zk-row');
    ms.forEach(m => {
      const got = z[m.id];
      const c = document.createElement('button');
      c.className = 'zk-cell' + (got ? '' : ' none');
      c.innerHTML = monsterSVG(m, { silhouette: !got, kira: got && got.kira }) + (got ? esc(m.name) : (m.boss ? '??? (ボス)' : '???')) + (got && got.kira ? '<span class="k">✨</span>' : '');
      c.onclick = () => { if (got) { sound.tap(); openMon(m); } };
      row.appendChild(c);
    });
    box.appendChild(g);
  });
};
function openMon(m) {
  const got = zukanOf(current)[m.id];
  const lv = ALL_LEVELS.find(l => l.id === m.level);
  $('#zk-box').innerHTML = `${monsterSVG(m, { kira: got.kira })}<h3>${m.boss ? '👑 ' : ''}${esc(m.name)}</h3>
    <p>${esc(lv.name)} に でてくる</p><p>やっつけた かず: ${got.n} かい</p>
    <p>${got.kira ? '✨ キラキラ ゲットずみ!' : 'ノーミスで やっつけると キラキラに なるよ'}</p>
    <div class="btnrow" style="margin-top:12px"><button class="btn" id="zk-close">とじる</button></div>`;
  $('#zk-modal').classList.add('on');
  $('#zk-close').onclick = () => $('#zk-modal').classList.remove('on');
}
$('#zk-modal').onclick = e => { if (e.target.id === 'zk-modal') $('#zk-modal').classList.remove('on'); };

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
  applyTheme(null);
  const body = $('#parent-body');
  const limits = [5, 10, 15, 20, 25, 30, 40, 45, 50, 60, 75, 90, 120];
  body.innerHTML = DB.profiles.map(p => {
    const u = usageOf(p.id);
    const zn = Object.keys(zukanOf(p.id)).length;
    return `<div class="panel" data-pid="${p.id}" style="border-top:8px solid ${(THEMES[p.theme] || THEMES.ohisama).accent}">
      <div class="row"><span style="font-size:36px">${AVATARS[p.avatar % AVATARS.length]}</span>
        <input type="text" class="f-name" value="${esc(p.name)}" maxlength="10">
        <select class="f-grade">${[1, 2, 3, 4, 5, 6].map(g => `<option value="${g}" ${g === p.grade ? 'selected' : ''}>小${g}</option>`).join('')}</select>
        <button class="sbtn f-avatar">アイコン変更</button></div>
      <div class="row">テーマ
        <select class="f-theme">${Object.entries(THEMES).map(([k, t]) => `<option value="${k}" ${k === p.theme ? 'selected' : ''}>${t.name}</option>`).join('')}</select>
        タイトル <input type="text" class="f-title" value="${esc(p.title || '')}" maxlength="14" placeholder="まなびランド" style="width:11em"></div>
      <div class="row">1日の上限
        <select class="f-limit">${limits.map(m => `<option value="${m}" ${m === p.limitMin ? 'selected' : ''}>${m}分</option>`).join('')}</select></div>
      <div class="row">今日の使用: <b>${Math.floor(u.sec / 60)}分${Math.floor(u.sec % 60)}秒</b> / 上限 ${Math.round(limitSec(p) / 60)}分${u.bonusSec ? `(延長 +${u.bonusSec / 60}分含む)` : ''}</div>
      <div class="row" style="color:var(--sub);font-size:16px">ずかん ${zn} / ${MONSTERS.length} たい</div>
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
    el.querySelector('.f-theme').onchange = e => { p.theme = e.target.value; save(); RENDER.parent(); };
    el.querySelector('.f-title').onchange = e => { p.title = e.target.value.trim(); save(); };
    el.querySelector('.f-limit').onchange = e => { p.limitMin = Number(e.target.value); save(); RENDER.parent(); };
    el.querySelector('.f-avatar').onclick = () => { p.avatar = (p.avatar + 1) % AVATARS.length; save(); RENDER.parent(); };
    el.querySelector('.f-ext').onclick = () => { usageOf(p.id).bonusSec += 600; save(); RENDER.parent(); };
    el.querySelector('.f-reset').onclick = () => { if (confirm(`${p.name}の今日の使用時間を0に戻しますか?`)) { usageOf(p.id).sec = 0; save(); RENDER.parent(); } };
    const del = el.querySelector('.f-del');
    if (del) del.onclick = () => {
      if (!confirm(`${p.name}を削除しますか?記録とずかんも消えます。`)) return;
      DB.profiles = DB.profiles.filter(x => x !== p);
      ['usage', 'records', 'zukan', 'ta'].forEach(k => delete DB[k][p.id]);
      save(); RENDER.parent();
    };
  });
  $('#f-add').onclick = () => {
    const id = 'p' + Date.now().toString(36);
    DB.profiles.push({ id, name: 'あたらしい子', grade: 1, limitMin: 30, avatar: DB.profiles.length % AVATARS.length, theme: 'mori', title: '' });
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
