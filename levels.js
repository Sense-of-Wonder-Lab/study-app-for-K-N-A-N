'use strict';
/* ========== けいさん の もんだい ==========
 * gen() は次のどちらかを返す
 *   [しき, こたえ]                          … ふつうの けいさん(「しき = □」になる)
 *   { p: 'もんだい文', img: 'SVG', q: 'しき({0} {1} が こたえる らん)', a: ['こたえ0', 'こたえ1'] }
 * grade: その学年 / grades: ほかの学年にも出すとき / dec: 小数点ボタンを出す
 */
const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const pick = arr => arr[Math.floor(Math.random() * arr.length)];
const S = x => String(x);
// 小数(0.1 の いくつぶん で もつ)を 文字に: 25 → "2.5"、30 → "3"
const dec1 = n => (n % 10 === 0 ? S(n / 10) : (n / 10).toFixed(1));
// 分数の たてがき。n には {0} などの らんも 入れられる
const frac = (n, d) => `<span class="frac"><span>${n}</span><span>${d}</span></span>`;
const Q = (p, q, a, extra) => Object.assign({ p, q, a: a.map(S) }, extra || {});

function clockSVG(h, m) {
  let s = '<svg viewBox="0 0 200 200" class="clock"><circle cx="100" cy="100" r="94" fill="#fff" stroke="#3b2f2a" stroke-width="6"/>';
  for (let i = 0; i < 60; i++) {
    const a = i * Math.PI / 30, big = i % 5 === 0, r1 = big ? 78 : 84;
    s += `<line x1="${100 + r1 * Math.sin(a)}" y1="${100 - r1 * Math.cos(a)}" x2="${100 + 89 * Math.sin(a)}" y2="${100 - 89 * Math.cos(a)}" stroke="#3b2f2a" stroke-width="${big ? 3.5 : 1.5}"/>`;
  }
  for (let i = 1; i <= 12; i++) {
    const a = i * Math.PI / 6;
    s += `<text x="${100 + 63 * Math.sin(a)}" y="${100 - 63 * Math.cos(a) + 8}" text-anchor="middle" font-size="22" font-weight="800" fill="#3b2f2a" font-family="sans-serif">${i}</text>`;
  }
  const ha = ((h % 12) + m / 60) * Math.PI / 6, ma = m * Math.PI / 30;
  s += `<line x1="100" y1="100" x2="${100 + 44 * Math.sin(ha)}" y2="${100 - 44 * Math.cos(ha)}" stroke="#e8553d" stroke-width="9" stroke-linecap="round"/>`;
  s += `<line x1="100" y1="100" x2="${100 + 72 * Math.sin(ma)}" y2="${100 - 72 * Math.cos(ma)}" stroke="#2f6fd6" stroke-width="5" stroke-linecap="round"/>`;
  return s + '<circle cx="100" cy="100" r="7" fill="#3b2f2a"/></svg>';
}
const kuku = dans => () => { const a = pick(dans), b = rnd(1, 9); return [`${a} × ${b}`, a * b]; };

const CALC_LEVELS = [
  /* ---------- 1年 ---------- */
  { id: 'g1L1a', grade: 1, emoji: '🚀', name: 'レベル1 くりあがり', note: '9 + 5 など(こたえ 10〜18)', gen() {
      const a = rnd(1, 9), b = rnd(10 - a, 9); return [`${a} + ${b}`, a + b]; } },
  { id: 'g1L1b', grade: 1, emoji: '🌈', name: 'レベル1 くりさがり', note: '13 − 6 など(こたえ 2〜9)', gen() {
      const a = rnd(10, 18), b = rnd(Math.max(a % 10 + 1, a - 9), Math.min(9, a - 2)); return [`${a} − ${b}`, a - b]; } },
  { id: 'g1L2a', grade: 1, emoji: '🦖', name: 'レベル2 たしざん', note: '2けた 38 + 27 など', gen() {
      const carry = Math.random() < 0.7;
      for (;;) {
        const a = rnd(10, 98), b = Math.random() < 0.4 ? rnd(1, 9) : rnd(10, 89);
        if (a + b > 99 || a + b < 10) continue;
        if ((a % 10 + b % 10 >= 10) !== carry) continue;
        return Math.random() < 0.3 && b < 10 ? [`${b} + ${a}`, a + b] : [`${a} + ${b}`, a + b];
      } } },
  { id: 'g1L2b', grade: 1, emoji: '🐲', name: 'レベル2 ひきざん', note: '2けた 52 − 19 など', gen() {
      const borrow = Math.random() < 0.7;
      for (;;) {
        const a = rnd(11, 99), b = Math.random() < 0.4 ? rnd(1, 9) : rnd(10, 97);
        const d = a - b;
        if (d < 2 || d > 98) continue;
        if ((a % 10 < b % 10) !== borrow) continue;
        return [`${a} − ${b}`, d];
      } } },

  /* ---------- 2年 ---------- */
  { id: 'g2a', grade: 2, emoji: '💯', name: 'なんじゅう・なんびゃく', note: '70 + 50、800 − 300 など', gen() {
      const t = rnd(0, 3);
      if (t === 0) { const a = rnd(1, 9) * 10, b = rnd(1, 9) * 10; return [`${a} + ${b}`, a + b]; }
      if (t === 1) { const a = rnd(11, 18) * 10, b = rnd(a / 10 - 9, 9) * 10; return [`${a} − ${b}`, a - b]; }
      if (t === 2) { const a = rnd(1, 9), b = rnd(1, 10 - a); return [`${a * 100} + ${b * 100}`, (a + b) * 100]; }
      const a = rnd(2, 10), b = rnd(1, a - 1); return [`${a * 100} − ${b * 100}`, (a - b) * 100]; } },
  { id: 'g2b', grade: 2, emoji: '🔢', name: 'かずの しくみ', note: '100が3こ、10が4こ…', gen() {
      const t = rnd(0, 3);
      if (t <= 1) {
        const units = t === 0 ? [100, 10, 1] : [1000, 100, 10, 1];
        const d = units.map((u, k) => k === 0 ? rnd(1, 9) : (Math.random() < 0.2 ? 0 : rnd(1, 9)));
        const parts = units.map((u, k) => d[k] ? `${u}が ${d[k]}こ` : '').filter(Boolean);
        return Q(parts.join('、') + ' で いくつ?', '{0}', [units.reduce((s, u, k) => s + u * d[k], 0)]);
      }
      if (t === 2) { const n = rnd(11, 99); return Q(`10を ${n}こ あつめた かずは?`, '{0}', [n * 10]); }
      const n = rnd(2, 99); return Q(`100を ${n}こ あつめた かずは?`, '{0}', [n * 100]); } },
  { id: 'g2c', grade: 2, emoji: '🧮', name: '3けたの たしざん・ひきざん', note: '125 + 38、342 − 17 など', gen() {
      if (Math.random() < 0.5) { for (;;) { const a = rnd(100, 899), b = rnd(10, 99); if (a + b <= 999) return [`${a} + ${b}`, a + b]; } }
      for (;;) { const a = rnd(110, 999), b = rnd(10, 99); if (a - b >= 100) return [`${a} − ${b}`, a - b]; } } },
  { id: 'g2k1', grade: 2, grades: [1, 2], emoji: '🖐️', name: '九九 2・5のだん', note: '2のだん と 5のだん', gen: kuku([2, 5]) },
  { id: 'g2k2', grade: 2, grades: [1, 2], emoji: '🍀', name: '九九 3・4のだん', note: '3のだん と 4のだん', gen: kuku([3, 4]) },
  { id: 'g2k3', grade: 2, grades: [1, 2], emoji: '🌟', name: '九九 6・7のだん', note: '6のだん と 7のだん', gen: kuku([6, 7]) },
  { id: 'g2k4', grade: 2, grades: [1, 2], emoji: '🔥', name: '九九 8・9・1のだん', note: '8・9・1のだん', gen: kuku([8, 9, 1]) },
  { id: 'c5', grade: 2, grades: [1, 2, 3, 4], emoji: '⭐', name: '九九 ぜんぶ', note: '2〜9のだん', gen: kuku([2, 3, 4, 5, 6, 7, 8, 9]) },
  { id: 'g2e', grade: 2, emoji: '❓', name: '九九 あなあき', note: '□ × 6 = 42', gen() {
      const a = rnd(2, 9), b = rnd(1, 9);
      return Math.random() < 0.5 ? Q('', `${a} × {0} = ${a * b}`, [b]) : Q('', `{0} × ${b} = ${a * b}`, [a]); } },
  { id: 'g2f', grade: 2, emoji: '📏', name: 'ながさ・かさの たんい', note: 'cm・mm・m、L・dL・mL', gen() {
      const t = rnd(0, 8);
      if (t === 0) { const x = rnd(1, 15), y = rnd(1, 9); return Q('', `${x}cm${y}mm = {0} mm`, [x * 10 + y]); }
      if (t === 1) { const x = rnd(1, 9), y = rnd(1, 9); return Q('', `${x * 10 + y} mm = {0} cm {1} mm`, [x, y]); }
      if (t === 2) { const x = rnd(1, 5), y = rnd(1, 99); return Q('', `${x}m${y}cm = {0} cm`, [x * 100 + y]); }
      if (t === 3) { const x = rnd(1, 5), y = rnd(1, 99); return Q('', `${x * 100 + y} cm = {0} m {1} cm`, [x, y]); }
      if (t === 4) { const x = rnd(1, 5), y = rnd(1, 9); return Q('', `${x}L${y}dL = {0} dL`, [x * 10 + y]); }
      if (t === 5) { const x = rnd(1, 5), y = rnd(1, 9); return Q('', `${x * 10 + y} dL = {0} L {1} dL`, [x, y]); }
      if (t === 6) { const x = rnd(1, 9); return Q('', `${x} L = {0} dL`, [x * 10]); }
      if (t === 7) { const x = rnd(1, 5); return Q('', `${x} L = {0} mL`, [x * 1000]); }
      const x = rnd(1, 9); return Q('', `${x} dL = {0} mL`, [x * 100]); } },
  { id: 'g2g', grade: 2, emoji: '🍕', name: 'ぶんすうの はじめ', note: '12こ の ½ は?', gen() {
      const d = pick([2, 3, 4]), k = rnd(2, 6), n = d * k;
      return Math.random() < 0.7 ? Q(`${n}こ の ${frac(1, d)} は なんこ?`, '{0} こ', [k])
        : Q(`□こ の ${frac(1, d)} が ${k}こ。□ は?`, '{0} こ', [n]); } },
  { id: 'g2h', grade: 2, emoji: '🕐', name: 'とけいを よもう', note: 'なんじ なんぷん?', gen() {
      const h = rnd(1, 12), m = Math.random() < 0.6 ? rnd(0, 11) * 5 : rnd(0, 59);
      return Q('この とけいは なんじ なんぷん?', '{0} じ {1} ふん', [h, m], { img: clockSVG(h, m) }); } },
  { id: 'g2i', grade: 2, emoji: '⏰', name: 'じこくと じかん', note: '30ぷん あとは なんじ?', gen() {
      const fun = m => [1, 3, 4, 6, 8, 0].includes(m % 10) ? 'ぷん' : 'ふん';
      const f = x => `${Math.floor(x / 60)}じ` + (x % 60 ? `${x % 60}${fun(x % 60)}` : '');
      const t = rnd(0, 2);
      if (t === 2) { // なんぷん かん?
        const h = rnd(1, 11), m1 = rnd(0, 6) * 5, m2 = rnd(m1 / 5 + 1, 11) * 5;
        return Q(`${f(h * 60 + m1)} から ${f(h * 60 + m2)} まで は なんぷん?`, '{0} ふん', [m2 - m1]);
      }
      for (;;) {
        const start = rnd(1, 11) * 60 + rnd(0, 11) * 5, d = rnd(2, 10) * 5;
        const end = t === 0 ? start + d : start - d;
        if (end < 60 || end >= 13 * 60) continue;
        return Q(`${f(start)} の ${d}${fun(d)} ${t === 0 ? 'あと' : 'まえ'} は?`, '{0} じ {1} ふん', [Math.floor(end / 60), end % 60]);
      } } },

  /* ---------- 3年 ---------- */
  { id: 'c7', grade: 3, emoji: '🏗️', name: '3・4けたの たし算・ひき算', note: '2456 + 1378 など', gen() {
      const four = Math.random() < 0.5, lo = four ? 1000 : 100, hi = four ? 9999 : 999;
      if (Math.random() < 0.5) { const a = rnd(lo, hi - lo), b = rnd(lo, hi - a); return [`${a} + ${b}`, a + b]; }
      const a = rnd(lo * 2, hi), b = rnd(lo, a - 1); return [`${a} − ${b}`, a - b]; } },
  { id: 'c8', grade: 3, emoji: '🏔️', name: '2けた × 1けた', note: '47 × 6 など', gen() { const a = rnd(12, 99), b = rnd(2, 9); return [`${a} × ${b}`, a * b]; } },
  { id: 'g3b', grade: 3, emoji: '🗻', name: '3けた × 1けた', note: '258 × 3 など', gen() { const a = rnd(102, 999), b = rnd(2, 9); return [`${a} × ${b}`, a * b]; } },
  { id: 'g3c', grade: 3, emoji: '⚔️', name: '2けた × 2けた', note: '34 × 27 など', gen() { const a = rnd(12, 99), b = rnd(12, 99); return [`${a} × ${b}`, a * b]; } },
  { id: 'c6', grade: 3, emoji: '🍰', name: 'わりざん', note: '42 ÷ 6(九九を つかう)', gen() { const b = rnd(2, 9), q = rnd(1, 9); return [`${b * q} ÷ ${b}`, q]; } },
  { id: 'g3d', grade: 3, emoji: '🍪', name: 'あまりの ある わりざん', note: '23 ÷ 4 = 5 あまり 3', gen() {
      const b = rnd(2, 9), q = rnd(1, 9), r = rnd(1, b - 1);
      return Q('', `${b * q + r} ÷ ${b} = {0} あまり {1}`, [q, r]); } },
  { id: 'g3e', grade: 3, emoji: '💧', name: 'しょうすうの たし算・ひき算', note: '2.3 + 1.5 など', dec: true, gen() {
      for (;;) {
        const x = Math.random() < 0.2 ? rnd(1, 9) * 10 : rnd(1, 99), y = rnd(1, 99);
        if (x % 10 === 0 && y % 10 === 0) continue;
        if (Math.random() < 0.5) return [`${dec1(x)} + ${dec1(y)}`, dec1(x + y)];
        if (x > y) return [`${dec1(x)} − ${dec1(y)}`, dec1(x - y)];
      } } },
  { id: 'g3f', grade: 3, emoji: '🧁', name: 'ぶんすうの たし算・ひき算', note: '分母が おなじ', gen() {
      const d = rnd(3, 10), t = rnd(0, 2);
      if (t === 0) { const a = rnd(1, d - 2), b = rnd(1, d - 1 - a); return Q('', `${frac(a, d)} + ${frac(b, d)} = ${frac('{0}', d)}`, [a + b]); }
      if (t === 1) { const a = rnd(2, d - 1), b = rnd(1, a - 1); return Q('', `${frac(a, d)} − ${frac(b, d)} = ${frac('{0}', d)}`, [a - b]); }
      const a = rnd(1, d - 1); return Q('', `1 − ${frac(a, d)} = ${frac('{0}', d)}`, [d - a]); } },
  { id: 'g3g', grade: 3, emoji: '⚖️', name: 'たんい(km・kg・秒)', note: '2kg300g = □g など', gen() {
      const t = rnd(0, 6);
      if (t === 0) { const x = rnd(1, 9), y = rnd(1, 999); return Q('', `${x}km${y}m = {0} m`, [x * 1000 + y]); }
      if (t === 1) { const x = rnd(1, 9), y = rnd(1, 999); return Q('', `${x * 1000 + y} m = {0} km {1} m`, [x, y]); }
      if (t === 2) { const x = rnd(1, 9), y = rnd(1, 999); return Q('', `${x}kg${y}g = {0} g`, [x * 1000 + y]); }
      if (t === 3) { const x = rnd(1, 9), y = rnd(1, 999); return Q('', `${x * 1000 + y} g = {0} kg {1} g`, [x, y]); }
      if (t === 4) { const x = rnd(1, 9); return Q('', `${x} t = {0} kg`, [x * 1000]); }
      if (t === 5) { const x = rnd(1, 4), y = rnd(1, 59); return Q('', `${x}分${y}秒 = {0} 秒`, [x * 60 + y]); }
      const x = rnd(1, 4), y = rnd(1, 59); return Q('', `${x * 60 + y} 秒 = {0} 分 {1} 秒`, [x, y]); } },
  { id: 'g3h', grade: 3, emoji: '📦', name: '□を つかった しき', note: '□ + 25 = 60 など', gen() {
      const t = rnd(0, 5);
      if (t === 0) { const x = rnd(10, 79), b = rnd(10, 99 - x); return Q('', `{0} + ${b} = ${x + b}`, [x]); }
      if (t === 1) { const a = rnd(10, 79), x = rnd(10, 99 - a); return Q('', `${a} + {0} = ${a + x}`, [x]); }
      if (t === 2) { const x = rnd(30, 99), b = rnd(10, x - 5); return Q('', `{0} − ${b} = ${x - b}`, [x]); }
      if (t === 3) { const a = rnd(30, 99), x = rnd(5, a - 5); return Q('', `${a} − {0} = ${a - x}`, [x]); }
      if (t === 4) { const x = rnd(2, 9), b = rnd(2, 9); return Q('', `{0} × ${b} = ${x * b}`, [x]); }
      const x = rnd(2, 9), c = rnd(2, 9); return Q('', `{0} ÷ ${x} = ${c}`, [x * c]); } },
  { id: 'g3i', grade: 3, emoji: '🌌', name: '大きな かず', note: '1万が3こ と 千が5こ…', gen() {
      const t = rnd(0, 3);
      if (t === 0) { const a = rnd(1, 9), b = rnd(1, 9); return Q(`1万を ${a}こ と 千を ${b}こ あわせた かずは?`, '{0}', [a * 10000 + b * 1000]); }
      if (t === 1) { const n = rnd(11, 99); return Q(`1000を ${n}こ あつめた かずは?`, '{0}', [n * 1000]); }
      if (t === 2) { const n = rnd(12, 999); return Q(`${n} を 10ばい した かずは?`, '{0}', [n * 10]); }
      const n = rnd(12, 999) * 10; return Q(`${n} を 10で わった かずは?`, '{0}', [n / 10]); } },

  /* ---------- 4年 ---------- */
  { id: 'c9', grade: 4, emoji: '🐉', name: 'わり算 ÷1けた', note: '3けた ÷ 1けた(わりきれる)', gen() {
      const b = rnd(2, 9), q = rnd(Math.ceil(100 / b), Math.floor(999 / b)); return [`${b * q} ÷ ${b}`, q]; } },
  { id: 'g4a', grade: 4, emoji: '🦑', name: 'わり算 ÷2けた', note: '864 ÷ 24 など', gen() {
      for (;;) { const b = rnd(12, 49), q = rnd(2, 40); if (b * q <= 999) return [`${b * q} ÷ ${b}`, q]; } } },
  { id: 'g4b', grade: 4, emoji: '🎯', name: 'がい数(四捨五入)', note: '3478 → 百の位まで', gen() {
      const t = rnd(0, 2);
      if (t === 0) { const n = rnd(1001, 9999); return Q(`${n} を 四捨五入して 百の位までの がい数に`, '{0}', [Math.round(n / 100) * 100]); }
      if (t === 1) { const n = rnd(10001, 99999); return Q(`${n} を 四捨五入して 千の位までの がい数に`, '{0}', [Math.round(n / 1000) * 1000]); }
      const n = rnd(1001, 99999), p = 10 ** (S(n).length - 2);
      return Q(`${n} を 四捨五入して 上から2けたの がい数に`, '{0}', [Math.round(n / p) * p]); } },
  { id: 'g4c', grade: 4, emoji: '🧪', name: '小数 × 整数・÷ 整数', note: '2.4 × 3、7.2 ÷ 4', dec: true, gen() {
      for (;;) {
        const x = rnd(11, 99), b = rnd(2, 9);
        if (x % 10 === 0) continue;
        return Math.random() < 0.5 ? [`${dec1(x)} × ${b}`, dec1(x * b)] : [`${dec1(x * b)} ÷ ${b}`, dec1(x)];
      } } },
  { id: 'g4d', grade: 4, emoji: '🥧', name: '仮分数と帯分数', note: '11/4 = 2と3/4', gen() {
      const d = rnd(2, 9), w = rnd(1, 4), r = rnd(1, d - 1), n = w * d + r;
      return Math.random() < 0.5 ? Q('帯分数に なおそう', `${frac(n, d)} = {0}${frac('{1}', d)}`, [w, r])
        : Q('仮分数に なおそう', `${w}${frac(r, d)} = ${frac('{0}', d)}`, [n]); } },
  { id: 'g4e', grade: 4, emoji: '🟩', name: '面積', note: '長方形・正方形', gen() {
      const t = rnd(0, 2);
      if (t === 0) { const a = rnd(2, 15), b = rnd(2, 15); return Q(`たて ${a}cm、よこ ${b}cm の 長方形の 面積は?`, '{0} cm²', [a * b]); }
      if (t === 1) { const a = rnd(2, 15); return Q(`1辺が ${a}cm の 正方形の 面積は?`, '{0} cm²', [a * a]); }
      const a = rnd(2, 12), b = rnd(2, 12); return Q(`面積 ${a * b}cm²、たて ${a}cm の 長方形。よこは?`, '{0} cm', [b]); } },
  { id: 'c10', grade: 4, emoji: '👑', name: '4年 ミックス', note: '4年の けいさん ぜんぶ', dec: true, gen() {
      return pick(CALC_LEVELS.filter(l => l.grade === 4 && l.id !== 'c10' && l.id !== 'g4d')).gen(); } },
];

// gen() の かえりを ひとつの かたちに そろえる
function normItem(r) {
  if (Array.isArray(r)) return { p: '', q: `${r[0]} = {0}`, a: [S(r[1])] };
  return r;
}
