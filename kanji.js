'use strict';
/* ========== かんじ ==========
 * データ(kanji-data.js)は 大きいので、かんじの 画面に はいったときに よみこむ
 */
const K_MODES = [
  { t: '1', icon: '🔍', name: 'ぶしゅを こたえる', note: 'この かんじの ぶしゅは?' },
  { t: '2', icon: '🤝', name: 'きょうつうの ぶしゅ', note: '3つに きょうつうする ぶしゅ' },
  { t: '3', icon: '🎯', name: 'ぶしゅで さがす', note: 'その ぶしゅの かんじは どれ?' },
  { t: '4', icon: '🗣️', name: 'よみかた', note: 'なんて よむ?' },
  { t: '5', icon: '🧩', name: 'きょうつうの かんじ', note: '□間・□工 → 人' },
  { t: '6', icon: '✏️', name: 'おくりがな', note: 'ただしい おくりがなは?' },
  { t: '7', icon: '👯', name: 'おなじ よみの かんじ', note: '□園(こうえん)' },
  { t: 'mix', icon: '🌈', name: 'ミックス', note: 'いろいろ まぜて' },
];
let kGrade = null;       // えらんでいる 学年
let kSel = [];           // くみたて: えらんだ パーツ
let kZukanGrade = null;

function kpartsOf(pid) { return DB.kparts[pid] = DB.kparts[pid] || {}; }
function kanjiOf(pid) { return DB.kanji[pid] = DB.kanji[pid] || {}; }

function loadKanji(cb) {
  if (typeof KD !== 'undefined') { cb(); return; }
  const s = document.createElement('script');
  s.src = 'kanji-data.js';
  s.onload = () => { kPrepare(); cb(); };
  s.onerror = () => flash('かんじの データが よみこめませんでした');
  document.body.appendChild(s);
}

/* ---------- じけい(字形)を かく ---------- */
// KanjiVG の 線で かくので、端末の フォントに よらず 教科書に ちかい 形に なる
function kSVG(paths, vb, cls) {
  return `<svg viewBox="${vb.join(' ')}" class="kg ${cls || ''}" xmlns="http://www.w3.org/2000/svg"><g fill="none" stroke="currentColor" stroke-width="4.6" stroke-linecap="round" stroke-linejoin="round">${paths.map(d => `<path d="${d}"/>`).join('')}</g></svg>`;
}
function kanjiSVG(k, cls) { return kSVG(KD.GL[k], [-2, -2, 113, 113], cls); }
function partSVG(p, cls) {
  if (KD.GL[p]) return kanjiSVG(p, cls);
  const v = KD.PA[p]; return kSVG(v[0], v[1], cls);
}
function radSVG(name, cls) {
  const v = KD.RG[name]; if (!v) return '';
  const d = v[1] ? v[1].map(i => KD.GL[v[0]][i]) : KD.GL[v[0]];
  return kSVG(d, v[1] ? v[2] : [-2, -2, 113, 113], cls);
}

/* ---------- パーツと くみたての じゅんび ---------- */
let K_LEAVES = {}, K_ATOMIC = new Set(), K_RECIPE_KEY = {}, K_RECIPES = {};
// べつの くみかたでも つくれる かんじ(森 = 木+林 でも 木+木+木 でも OK)
// もともと 1つの パーツ あつかいの かんじも、くみあわせで つくれるように(大 = 一+人 など)
const K_ALT_REC = { '森': [['木', '木', '木']], '大': [['一', '人']], '夫': [['二', '人']], '二': [['一', '一']] };
// 線を きりわけただけで、こどもに パーツと して わかりにくい ものは 1つの パーツ あつかい(七 = 一+乙 には しない)
const K_WHOLE = ['七', '九', '上', '下', '千', '六', '文', '中', '出', '四', '午', '丁', '由', '申', '予', '必', '東', '束'];
function kPrepare() {
  K_WHOLE.forEach(k => { KD.REC[k] = null; });
  // ひとやねは「人」の 形では わかりにくいので、上に のる 形の パーツ(𠆢)を つかう(今の 1・2かくめ から つくる)
  const hy = KD.RG['ひとやね'];
  KD.PA['𠆢'] = [hy[1].map(i => KD.GL[hy[0]][i]), hy[2]];
  ['会', '合', '茶', '全', '命', '令', '幹', '舎'].forEach(k => { if (KD.REC[k]) KD.REC[k] = KD.REC[k].map(p => p === '人' ? '𠆢' : p); });
  // それぞれの かんじに ひつような いちばん小さい パーツ(作った かんじも パーツに なる)
  const memo = {};
  const leaves = k => {
    if (memo[k]) return memo[k];
    const r = KD.REC[k];
    if (!r) return memo[k] = [k];
    let out = [];
    r.forEach(p => { out = out.concat(KD.REC[p] !== undefined && KD.G[p] && KD.REC[p] ? leaves(p) : [p]); });
    return memo[k] = out;
  };
  Object.keys(KD.G).forEach(k => {
    K_LEAVES[k] = [...new Set(leaves(k))];
    if (!KD.REC[k]) {
      K_ATOMIC.add(k);
      if (K_ALT_REC[k]) { K_RECIPES[k] = K_ALT_REC[k]; K_RECIPE_KEY[k] = K_ALT_REC[k].map(r => r.slice().sort().join('')); }
    } else {
      K_RECIPES[k] = [KD.REC[k]].concat(K_ALT_REC[k] || []);
      K_RECIPE_KEY[k] = K_RECIPES[k].map(r => r.slice().sort().join(''));
    }
  });
  // とちゅうの かんじを ばらした くみかたも OK(拾 = 扌+合 でも 扌+𠆢+一+口 でも)。スロットは 4つまで
  const expand = (r, depth) => {
    let outs = [r];
    if (depth > 3) return outs;
    r.forEach((p, i) => {
      (KD.G[p] && K_RECIPES[p] || []).forEach(sub => {
        const nr = r.slice(0, i).concat(sub, r.slice(i + 1));
        if (nr.length <= 4) outs = outs.concat(expand(nr, depth + 1));
      });
    });
    return outs;
  };
  Object.keys(K_RECIPES).forEach(k => {
    const seen = new Set(), all = [];
    K_RECIPES[k].forEach(r => expand(r, 0).forEach(x => { const key = x.slice().sort().join(''); if (!seen.has(key)) { seen.add(key); all.push(x); } }));
    K_RECIPES[k] = all;
    K_RECIPE_KEY[k] = all.map(x => x.slice().sort().join(''));
  });
}
/* ---------- おなじ ぶしゅの よびわけ(いと・いとへん など)は おなじ もの あつかい ---------- */
// かたちが おなじで、いちで よびかたが かわるだけの ものを まとめる
const K_RAD_SAME = [
  ['くち', 'くちへん'], ['つち', 'つちへん'], ['おんな', 'おんなへん'], ['こ', 'こへん'], ['やま', 'やまへん'],
  ['にち', 'にちへん'], ['つき', 'つきへん'], ['き', 'きへん'], ['ひ', 'ひへん'], ['おう', 'おうへん'],
  ['た', 'たへん'], ['しろ', 'しろへん'], ['め', 'めへん'], ['いし', 'いしへん'], ['たけ', 'たけかんむり'],
  ['いと', 'いとへん'], ['みみ', 'みみへん'], ['かい', 'かいへん'], ['あし', 'あしへん'], ['くるま', 'くるまへん'],
  ['かね', 'かねへん'], ['あめ', 'あめかんむり'], ['ゆみ', 'ゆみへん'], ['ほう', 'ほうへん'], ['うし', 'うしへん'],
  ['や', 'やへん'], ['こめ', 'こめへん'], ['つの', 'つのへん'], ['さと', 'さとへん'], ['うま', 'うまへん'],
  ['かた', 'かたへん'], ['のぎ', 'のぎへん'], ['あな', 'あなかんむり'], ['はち', 'はちがしら'],
];
const K_RAD_GRP = {};
K_RAD_SAME.forEach(g => g.forEach(n => K_RAD_GRP[n] = g[0]));
function rGrp(n) { return K_RAD_GRP[n] || n; }
// もんだいの せんたくしに おなじ ぶしゅが 2つ でないように する(でたら ほかの ものに いれかえ)
function kFixRadQ(q, g) {
  if (q.t === '1' || q.t === '2') {
    const used = new Set([rGrp(q.a)]), o = [];
    const pool = shuffle([...new Set((KD.QB[g][q.t] || []).flatMap(x => [x.a].concat(x.o)))]);
    q.o.forEach(n => { if (!used.has(rGrp(n))) { used.add(rGrp(n)); o.push(n); } });
    for (const n of pool) { if (o.length >= q.o.length) break; if (!used.has(rGrp(n)) && KD.RG[n]) { used.add(rGrp(n)); o.push(n); } }
    return Object.assign({}, q, { o });
  }
  if (q.t === '3') {
    const gr = rGrp(q.n), bad = k => rGrp(KD.RN[k]) === gr;
    const o = q.o.filter(k => !bad(k));
    const pool = shuffle([...new Set((KD.QB[g]['3'] || []).flatMap(x => [x.a].concat(x.o)))]);
    for (const k of pool) { if (o.length >= q.o.length) break; if (k !== q.a && !o.includes(k) && KD.RN[k] && !bad(k)) o.push(k); }
    return Object.assign({}, q, { o });
  }
  return q;
}
// こうぼうで つかわない パーツの みため(index.html を さわらずに すむよう ここで たす)
document.head.insertAdjacentHTML('beforeend', '<style>.kb-tray button.off{opacity:.3;filter:grayscale(1);box-shadow:0 2px 0 var(--line)}</style>');
// かくすう(KanjiVG は 1かく = 1本の 線)
function kStrokes(p) { return (KD.GL[p] || (KD.PA[p] || [[]])[0]).length; }

function kOwned(pid) {
  // つかえる パーツ: もらった パーツ + 作った かんじ
  return Object.assign({}, kpartsOf(pid), kanjiOf(pid));
}
function kMakeable(pid) {
  const own = kOwned(pid), got = kanjiOf(pid);
  return Object.keys(K_RECIPES).filter(k => !got[k] && K_RECIPES[k].some(r => r.every(p => own[p])));
}
// ごほうびの パーツを えらぶ: つぎに つくれそうな かんじの たりない パーツから
function kRewardParts(g, n, prefer) {
  const own = kOwned(current), got = kanjiOf(current), out = [];
  const take = p => { if (!own[p] && !out.includes(p)) { out.push(p); own[p] = 1; } };
  (prefer || []).forEach(p => { if (out.length < Math.ceil(n / 2) && Object.values(K_LEAVES).some(l => l.includes(p))) take(p); });
  const targets = k => Object.keys(KD.G).filter(x => KD.G[x] === k && !got[x]);
  let pool = targets(g);
  if (!pool.length) pool = Object.keys(KD.G).filter(x => !got[x]);
  let guard = 0;
  while (out.length < n && pool.length && guard++ < 50) {
    pool.sort((a, b) => K_LEAVES[a].filter(p => !own[p]).length - K_LEAVES[b].filter(p => !own[p]).length || Math.random() - .5);
    const k = pool.find(x => K_LEAVES[x].some(p => !own[p]));
    if (!k) break;
    K_LEAVES[k].filter(p => !own[p]).forEach(p => { if (out.length < n) take(p); });
  }
  return out;
}
function kGive(parts) {
  const kp = kpartsOf(current), kj = kanjiOf(current), newK = [];
  parts.forEach(p => {
    kp[p] = 1;
    // それだけで かんじに なる パーツ(木・山 など)は そのまま ずかんに
    if (K_ATOMIC.has(p) && !kj[p]) { kj[p] = today(); newK.push(p); }
  });
  save();
  return newK;
}

/* ---------- メニュー ---------- */
RENDER['kanji'] = () => {
  loadKanji(() => {
    const p = profile(current);
    if (!kGrade) kGrade = p.klv || 1;
    $('#k-grades').innerHTML = [1, 2, 3, 4, 5, 6].map(g => `<button data-g="${g}" class="${g === kGrade ? 'on' : ''}">レベル${g}</button>`).join('');
    $$('#k-grades button').forEach(b => b.onclick = () => { sound.tap(); kGrade = Number(b.dataset.g); p.klv = kGrade; save(); RENDER.kanji(); });
    const box = $('#k-modes'); box.innerHTML = '';
    const best = (DB.krec[current] || {});
    K_MODES.forEach(m => {
      const n = m.t === 'mix' ? kMixPool(kGrade).length : (KD.QB[kGrade][m.t] || []).length;
      if (n < SET_SIZE) return;  // もんだいが すくない ものは ださない(1ねんの 一部など)
      const b = document.createElement('button');
      b.className = 'big';
      const r = best[kGrade + '_' + m.t];
      b.innerHTML = `<span class="emoji">${m.icon}</span>${m.name}<span class="note">${m.note}</span><span class="best">${r ? '⭐'.repeat(stars(r)) + ' ' + r + '/' + SET_SIZE : ''}</span>`;
      b.onclick = () => { sound.tap(); startKanji(kGrade, m.t); };
      box.appendChild(b);
    });
    const got = kanjiOf(current), gn = Object.keys(KD.G).filter(k => KD.G[k] === kGrade).length;
    const gg = Object.keys(got).filter(k => KD.G[k] === kGrade).length;
    const mk = kMakeable(current).length;
    $('#k-kobo-note').textContent = mk ? `いま つくれる かんじが ${mk}こ あるよ!` : 'パーツを くみあわせて かんじを つくろう';
    $('#k-kobo-btn').classList.toggle('glow', mk > 0);
    $('#k-zukan-note').textContent = `レベル${kGrade} ${gg} / ${gn}・ぜんぶ ${Object.keys(got).length} / 1026`;
  });
};
function kMixPool(g) { return ['1', '2', '3', '4', '5', '6', '7'].flatMap(t => (KD.QB[g][t] || []).map(q => Object.assign({ t }, q))); }

/* ---------- プレイ ---------- */
function startKanji(g, t) {
  const pool = t === 'mix' ? kMixPool(g) : KD.QB[g][t].map(q => Object.assign({ t }, q));
  const items = shuffle(pool).slice(0, SET_SIZE).map(q => kFixRadQ(q, g));
  game = { kind: 'kanji', grade: g, mode: t, items, i: 0, results: [], startAt: Date.now(), combo: 0 };
  $('#kp-title').textContent = `レベル${g}・${K_MODES.find(m => m.t === t).name}`;
  go('kplay');
  showKanjiQ();
}
function kWord(w, h, cls) {
  return [...w].map((ch, i) => i === h ? `<b class="${cls || 'hl'}">${esc(ch)}</b>` : esc(ch)).join('');
}
function showKanjiQ() {
  $('#kp-fb').classList.remove('show');
  locked = false;
  const q = game.items[game.i];
  $('#kp-gauge i').style.width = (game.i / SET_SIZE * 100) + '%';
  $('#kp-count').textContent = `${game.i + 1} / ${SET_SIZE}`;
  let prompt = '', body = '', opts = shuffle([q.a].concat(q.o)), render, big = false;
  const radOpt = n => `<span class="ropt">${radSVG(n)}<small>${esc(n)}</small></span>`;
  const kanjiOpt = k => kanjiSVG(k, 'kopt');
  const txt = s => `<span class="topt">${esc(s)}</span>`;
  switch (q.t) {
    case '1': prompt = 'この かんじの ぶしゅは?'; body = kanjiSVG(q.k, 'kbig'); render = radOpt; break;
    case '2': prompt = '3つの かんじに きょうつうする ぶしゅは?'; body = `<div class="k3">${q.ks.map(k => kanjiSVG(k, 'kmid')).join('')}</div>`; render = radOpt; break;
    case '3': prompt = `ぶしゅが「${esc(q.n)}」の かんじは どれ?`; body = `<div class="krad">${radSVG(q.n, 'kmid')}</div>`; render = kanjiOpt; big = true; break;
    case '4': prompt = 'よみかたは?'; body = `<div class="kword">${kWord(q.w, q.h)}</div>`; render = txt; break;
    case '5': prompt = '□に きょうつうして はいる かんじは?'; body = `<div class="kslots">${q.s.map(s => `<span>${s.replace('□', '<i>□</i>')}</span>`).join('')}</div>`; render = txt; big = true; break;
    case '6': prompt = 'おくりがなが ただしいのは?'; body = `<div class="kword kana">${esc(q.r)}</div>`; render = txt; break;
    case '7': prompt = '□に はいる かんじは?'; body = `<div class="kword">${kWord(q.w.slice(0, q.h) + '□' + q.w.slice(q.h + 1), q.h, 'blank')}</div><div class="kreading">${esc(q.r)}</div>`; render = txt; big = true; break;
  }
  $('#kp-prompt').textContent = prompt;
  $('#kp-body').innerHTML = body;
  const box = $('#kp-choices');
  box.className = 'choices kchoices' + (big ? ' bigk' : '');
  box.innerHTML = '';
  opts.forEach(o => {
    const b = document.createElement('button');
    b.innerHTML = render(o);
    b.dataset.key = o;
    b.onclick = () => answerKanji(b);
    box.appendChild(b);
  });
}
function answerKanji(btn) {
  if (locked || btn.disabled) return;
  const q = game.items[game.i];
  const ok = btn.dataset.key === q.a;
  showFb('#kp-fb', ok);
  if (!ok) {
    game.results[game.i] = false; game.combo = 0;
    btn.classList.add('wrong'); btn.disabled = true;
    sound.ng(); replay($('#kp-wrap'), 'shake');
    return;
  }
  locked = true;
  if (game.results[game.i] === undefined) game.results[game.i] = true;
  game.combo++;
  btn.classList.add('right'); sound.ok();
  game.i++;
  $('#kp-gauge i').style.width = (game.i / SET_SIZE * 100) + '%';
  const g0 = game;
  if (game.i >= SET_SIZE) { setTimeout(() => { if (game === g0 && screen === 'kplay') finishKanji(); }, 650); return; }
  setTimeout(() => { if (game === g0 && screen === 'kplay') showKanjiQ(); }, 650);
}
function finishKanji() {
  const n = game.results.filter(x => x).length, kira = n === SET_SIZE;
  const rec = DB.krec[current] = DB.krec[current] || {};
  const key = game.grade + '_' + game.mode, prev = rec[key] || 0;
  if (n > prev) rec[key] = n;
  // ぶしゅの 問題なら、こたえた ぶしゅの パーツを ゆうせん
  const prefer = [];
  game.items.forEach(q => {
    const ks = q.t === '1' ? [q.k] : q.t === '2' ? q.ks : q.t === '3' ? [q.a] : [];
    ks.forEach(k => { const f = KD.RF[k]; if (f && !prefer.includes(f)) prefer.push(f); });
  });
  const parts = kRewardParts(game.grade, kira ? 4 : 3, prefer);
  const newK = kGive(parts);
  save();
  go('result');
  $('#r-wear').style.display = 'none';
  $('#r-mon').innerHTML = parts.length
    ? `<div class="r-parts">${parts.map((p, i) => `<span style="animation-delay:${i * .18}s">${partSVG(p)}</span>`).join('')}</div>`
    : '<div class="r-parts"><span>🏆</span></div>';
  $('#r-get').textContent = parts.length ? `パーツを ${parts.length}こ ゲット!` : 'パーツは ぜんぶ あつまっているよ!';
  const mk = kMakeable(current).length;
  $('#r-badges').innerHTML = (kira ? '<span class="badge kira">✨ ノーミス! +1こ</span>' : '') +
    (newK.length ? `<span class="badge">「${newK.join('」「')}」が ずかんに!</span>` : '') +
    (mk ? `<span class="badge best">🧩 つくれる かんじ ${mk}こ</span>` : '');
  $('#r-stars').textContent = '⭐'.repeat(stars(n)) + '☆'.repeat(3 - stars(n));
  $('#r-score').textContent = `1かいで せいかい ${n} / ${SET_SIZE}`;
  $('#r-detail').textContent = `レベル${game.grade}・${K_MODES.find(m => m.t === game.mode).name}` + (kira ? '' : '・ノーミスで パーツが 1こ ふえるよ');
  $('#r-best').textContent = n > prev && prev ? '🎉 じこベスト こうしん!' : prev ? `じこベスト ${prev}もん` : '';
  const w = $('#r-wear');
  if (mk) { w.style.display = ''; w.textContent = '🧩 くみたてる'; w.onclick = () => { sound.tap(); go('kobo'); }; }
  sound.fanfare();
}
$('#kp-quit').onclick = () => { sound.tap(); go('kanji'); };

/* ---------- くみたて こうぼう ---------- */
RENDER['kobo'] = () => {
  loadKanji(() => {
    const own = kOwned(current);
    const list = Object.keys(own);
    // かくすうの すくない じゅんに ならべる
    list.sort((a, b) => kStrokes(a) - kStrokes(b) || (KD.G[a] ? 1 : 0) - (KD.G[b] ? 1 : 0) || a.localeCompare(b));
    // まだ つくっていない かんじの どれにも つかわない パーツは グレーに する
    const got = kanjiOf(current), usable = new Set();
    Object.keys(K_RECIPES).forEach(k => { if (!got[k]) K_RECIPES[k].forEach(r => r.forEach(p => usable.add(p))); });
    $('#kb-tray').innerHTML = list.length ? list.map(p => `<button data-p="${esc(p)}" class="${kSel.includes(p) ? 'on' : ''}${KD.G[p] ? ' isk' : ''}${usable.has(p) ? '' : ' off'}"${usable.has(p) ? '' : ' disabled'}>${partSVG(p)}</button>`).join('')
      : '<p class="sub">まだ パーツが ないよ。かんじの もんだいを といて あつめよう!</p>';
    // おなじ パーツを 2かい えらんでも よい(林 = 木 + 木)
    $$('#kb-tray button').forEach(b => b.onclick = () => {
      if (kSel.length >= 4) return;
      sound.tap(); kSel.push(b.dataset.p); RENDER.kobo();
    });
    $('#kb-slots').innerHTML = [0, 1, 2, 3].map(i => `<span data-i="${i}" class="${kSel[i] ? 'on' : ''}">${kSel[i] ? partSVG(kSel[i]) : ''}</span>`).join('<b>+</b>');
    $$('#kb-slots span.on').forEach(s => s.onclick = () => { sound.tap(); kSel.splice(Number(s.dataset.i), 1); RENDER.kobo(); });
    $('#kb-make').disabled = kSel.length < 2;
    const mk = kMakeable(current).length;
    $('#kb-hint').textContent = mk ? `いま つくれる かんじが ${mk}こ あるよ` : 'パーツを 2〜4こ えらんで「くみたてる」';
    $('#kb-count').textContent = `パーツ ${Object.keys(kpartsOf(current)).length}こ`;
  });
};
$('#kb-clear').onclick = () => { sound.tap(); kSel = []; RENDER.kobo(); };
$('#kb-make').onclick = () => {
  const key = kSel.slice().sort().join('');
  const got = kanjiOf(current);
  const hits = Object.keys(K_RECIPE_KEY).filter(k => K_RECIPE_KEY[k].includes(key)).sort((a, b) => (got[a] ? 1 : 0) - (got[b] ? 1 : 0) || KD.G[a] - KD.G[b]);
  if (!hits.length) {
    sound.ng(); replay($('#kb-slots'), 'shake');
    $('#kb-hint').textContent = 'その くみあわせでは できなかった…';
    return;
  }
  const k = hits[0], isNew = !got[k];
  if (isNew) { got[k] = today(); save(); }
  kSel = [];
  sound.fanfare();
  openKanjiCard(k, isNew ? '✨ あたらしい かんじが できた!' : 'もう ずかんに あるよ');
  RENDER.kobo();
};

/* ---------- ずかん ---------- */
RENDER['kzukan'] = () => {
  loadKanji(() => {
    const p = profile(current);
    if (!kZukanGrade) kZukanGrade = kGrade || p.klv || 1;
    const got = kanjiOf(current);
    $('#kz-grades').innerHTML = [1, 2, 3, 4, 5, 6].map(g => {
      const all = Object.keys(KD.G).filter(k => KD.G[k] === g);
      return `<button data-g="${g}" class="${g === kZukanGrade ? 'on' : ''}">レベル${g}<small>${all.filter(k => got[k]).length}/${all.length}</small></button>`;
    }).join('');
    $$('#kz-grades button').forEach(b => b.onclick = () => { sound.tap(); kZukanGrade = Number(b.dataset.g); RENDER.kzukan(); });
    const ks = Object.keys(KD.G).filter(k => KD.G[k] === kZukanGrade).sort((a, b) => KD.SC[a] - KD.SC[b] || a.localeCompare(b));
    $('#kz-count').textContent = `📖 ぜんぶで ${Object.keys(got).length} / 1026`;
    $('#kz-grid').innerHTML = ks.map(k => got[k] ? `<button class="kz on" data-k="${k}">${kanjiSVG(k)}</button>` : '<span class="kz"></span>').join('');
    $$('#kz-grid button').forEach(b => b.onclick = () => { sound.tap(); openKanjiCard(b.dataset.k); });
  });
};
function openKanjiCard(k, title) {
  const rn = KD.RN[k];
  const ex = (KD.EX[k] || []).map(([w, r]) => `<li>${esc(w)}<small>${esc(r)}</small></li>`).join('');
  $('#zk-box').classList.remove('wide');
  $('#zk-box').innerHTML = `${title ? `<p class="kc-title">${title}</p>` : ''}<div class="kc-glyph">${kanjiSVG(k)}</div>
    <p>レベル${KD.G[k]}の かんじ・${KD.SC[k]}かく</p>
    ${rn ? `<p class="kc-rad">${radSVG(rn)}<span>ぶしゅ: ${esc(rn)}</span></p>` : ''}
    ${ex ? `<ul class="kc-ex">${ex}</ul>` : ''}
    <div class="btnrow" style="margin-top:12px"><button class="btn" id="zk-close">とじる</button></div>`;
  $('#zk-modal').classList.add('on');
  $('#zk-close').onclick = () => $('#zk-modal').classList.remove('on');
}
