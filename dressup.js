'use strict';
/* ========== きせかえ ==========
 * キャラクターは viewBox 0 0 300 420 の SVG を レイヤーで かさねて かく
 * はいけい → うしろがみ → からだ → ボトムス → トップス(または ワンピース) → くつ → かお → まえがみ → アクセ → ぼうし → もちもの → おとも
 * あとから ふえた かたち(ぼうし・おとも・あたらしい ヘアや いしょう)は dressup-extra.js で DU_SHAPES に たす
 */
const DU_LINE = '#6b4a3f';
const DU_SKIN = '#ffe3d1';
const DU_COLORS = {
  pink: ['ピンク', '#ff8fb8'], sakura: ['さくら', '#ffc8da'], lavender: ['ラベンダー', '#bba6ff'], mint: ['ミント', '#8fe0c4'],
  sky: ['みずいろ', '#93cbff'], lemon: ['レモン', '#ffe17d'], orange: ['オレンジ', '#ffb170'], red: ['あか', '#ff6f7d'],
  white: ['しろ', '#ffffff'], navy: ['ネイビー', '#5363a6'], gold: ['ゴールド', '#f6c445'], purple: ['むらさき', '#a77ad9'],
};
const DU_HAIR = {
  brown: ['ちゃいろ', '#8a5a3c'], black: ['くろ', '#3b3140'], blond: ['きんいろ', '#f1c86a'], pinkh: ['ピンク', '#ff9fc6'],
  silver: ['ぎんいろ', '#d8dbe8'], violet: ['むらさき', '#9b7fd6'], aqua: ['みずいろ', '#86cdf5'], red: ['あか', '#d9624e'],
};
const DU_CATS = [
  { k: 'hair', name: 'ヘア', icon: '💇' }, { k: 'top', name: 'トップス', icon: '👚' }, { k: 'bottom', name: 'ボトムス', icon: '👗' },
  { k: 'dress', name: 'ワンピース', icon: '👘' }, { k: 'shoes', name: 'くつ', icon: '👟' }, { k: 'acc', name: 'アクセ', icon: '🎀' },
  { k: 'hat', name: 'ぼうし', icon: '👒' }, { k: 'hand', name: 'もちもの', icon: '🪄' }, { k: 'pet', name: 'おとも', icon: '🐶' },
  { k: 'bg', name: 'はいけい', icon: '🌈' },
];
const DU_SHAPES = {
  hair: { long: 'ロングヘア', twin: 'ツインテール', pony: 'ポニーテール', bob: 'ボブ', bun: 'おだんごヘア', wave: 'ふわふわロング' },
  top: { tee: 'Tシャツ', puff: 'パフスリーブ', sailor: 'セーラー', knit: 'ニット', cami: 'キャミソール', hoodie: 'パーカー' },
  bottom: { skirt: 'スカート', pleats: 'プリーツスカート', frill: 'フリルスカート', shorts: 'ショートパンツ', pants: 'パンツ' },
  dress: { aline: 'ワンピース', frill: 'ティアードドレス', princess: 'プリンセスドレス', jumper: 'ジャンパースカート' },
  shoes: { strap: 'ストラップシューズ', sneaker: 'スニーカー', boots: 'ブーツ', ribbon: 'リボンパンプス' },
  acc: { ribbon: 'リボン', tiara: 'ティアラ', beret: 'ベレーぼう', flower: 'おはなピン', cat: 'ねこみみ', crown: 'おうかん', heart: 'ハートピン' },
  hand: { wand: 'まほうの ステッキ', bag: 'ポシェット', balloon: 'ふうせん', bouquet: 'ブーケ', parasol: 'パラソル' },
  bg: { sky: 'あおぞら', night: 'ほしぞら', hearts: 'ハート', dots: 'みずたま', castle: 'おしろ', flowers: 'おはなばたけ' },
};
// 問題ごとの報酬アイテム。各レベル3こ＋特別アイテム1こ。
// 未使用のデザインは DU_RESERVE_DESIGNS に残し、今後の問題追加で使う。
const DU_LEVEL_MAP = {
  g1L1a: [['hair','bob','pinkh'],['top','puff','sakura'],['shoes','sneaker','mint'],['acc','ribbon','gold']],
  g1L1b: [['hair','twin','blond'],['bottom','pleats','sky'],['top','sailor','navy'],['acc','flower','pink']],
  g1L2a: [['hair','pony','aqua'],['top','knit','lavender'],['bottom','shorts','lemon'],['hand','bag','purple']],
  g1L2b: [['hair','bun','silver'],['top','hoodie','mint'],['bottom','pants','red'],['bg','night','navy']],
  c6:    [['top','tee','red'],['bottom','skirt','pink'],['shoes','strap','lavender'],['acc','crown','gold']],
  g3d:   [['top','puff','orange'],['bottom','shorts','sky'],['hand','balloon','lemon'],['acc','cat','purple']],
  g3e:   [['hair','wave','silver'],['top','cami','lavender'],['shoes','ribbon','sakura'],['hand','parasol','pink']],
  g3f:   [['dress','aline','mint'],['top','sailor','red'],['bottom','pleats','sakura'],['dress','frill','purple']],
  g3g:   [['top','sailor','orange'],['bottom','pants','sky'],['shoes','sneaker','red'],['bg','sky','sky']],
  g3h:   [['hair','bun','brown'],['top','hoodie','orange'],['bottom','pants','purple'],['hand','wand','gold']],
  g4d:   [['dress','jumper','sakura'],['acc','tiara','lavender'],['shoes','boots','navy'],['dress','princess','pink']],
  g4e:   [['top','knit','mint'],['bottom','frill','pink'],['hand','bouquet','red'],['bg','flowers','sakura']],
  q1:    [['hair','bob','brown'],['top','puff','sky'],['shoes','boots','purple'],['acc','heart','gold']],
  q2:    [['hair','twin','red'],['top','tee','lemon'],['bottom','skirt','red'],['hand','bouquet','lemon']],
  q3:    [['hair','long','silver'],['top','cami','mint'],['shoes','sneaker','navy'],['acc','tiara','gold']],
  q4:    [['hair','wave','pinkh'],['top','knit','red'],['bottom','pleats','lemon'],['bg','hearts','sakura']],
};

const DU_ITEMS = [];
const DU_RESERVE_DESIGNS = [
  ['hair','long','violet'], ['hair','pony','red'], ['hair','twin','pinkh'],
  ['top','cami','orange'], ['top','knit','sky'], ['top','hoodie','lavender'],
  ['bottom','frill','navy'], ['bottom','pants','mint'], ['bottom','pleats','gold'],
  ['dress','jumper','lavender'], ['dress','aline','red'], ['dress','frill','sky'],
  ['shoes','boots','red'], ['shoes','sneaker','lemon'], ['acc','beret','orange'],
  ['acc','heart','sakura'], ['hand','bag','mint'], ['hand','parasol','lavender'],
  ['bg','dots','sky'], ['bg','castle','lavender'], ['bg','flowers','pink'],
];
const DU_STARTER = {
  hair: { id: 's_hair', cat: 'hair', shape: 'long', color: 'brown', name: 'ちゃいろの ロングヘア', starter: true },
  top: { id: 's_top', cat: 'top', shape: 'tee', color: 'white', name: 'しろの Tシャツ', starter: true },
  bottom: { id: 's_bottom', cat: 'bottom', shape: 'skirt', color: 'sky', name: 'みずいろの スカート', starter: true },
  shoes: { id: 's_shoes', cat: 'shoes', shape: 'strap', color: 'pink', name: 'ピンクの ストラップシューズ', starter: true },
};
// あとから ふえた レベルの ごほうび: 予備の デザインを 先に つかい、たりない ぶんは まだ つかっていない 色と 形の くみあわせから
(function addLevels(ids) {
  const used = new Set(Object.values(DU_LEVEL_MAP).flat().map(x => x.join()));
  ['hair,long,brown', 'top,tee,white', 'bottom,skirt,sky', 'shoes,strap,pink'].forEach(x => used.add(x));
  // 予備デザインを しゅるいが まざるように ならべかえ
  const byCat = {}; DU_RESERVE_DESIGNS.filter(x => !used.has(x.join())).forEach(x => (byCat[x[0]] = byCat[x[0]] || []).push(x));
  const reserve = [];
  for (let k = 0; Object.values(byCat).some(v => v.length); k++) Object.values(byCat).forEach(v => { if (v.length) reserve.push(v.shift()); });
  const SPECIAL = [['dress', 'princess'], ['acc', 'crown'], ['acc', 'tiara'], ['bg', 'castle'], ['hand', 'wand'], ['dress', 'frill']];
  const CATS = ['top', 'bottom', 'hair', 'shoes', 'acc', 'hand', 'dress', 'bg'];
  let ci = 0;
  const fresh = (cat, shape) => {
    const pal = Object.keys(cat === 'hair' ? DU_HAIR : DU_COLORS);
    const shapes = shape ? [shape] : Object.keys(DU_SHAPES[cat]).filter(sh => !SPECIAL.some(([c, s2]) => c === cat && s2 === sh));
    for (let k = 0; k < 200; k++) {
      const x = [cat, shapes[(k * 7 + ci) % shapes.length], pal[(k * 5 + ci * 3) % pal.length]];
      if (!used.has(x.join())) { used.add(x.join()); return x; }
    }
    throw new Error('no design left for ' + cat);
  };
  ids.forEach((id, li) => {
    if (DU_LEVEL_MAP[id]) return;
    const set = [];
    while (set.length < 3) {
      const r = reserve.shift();
      if (r) { used.add(r.join()); set.push(r); continue; }
      set.push(fresh(CATS[ci++ % CATS.length]));
    }
    const [sc, ss] = SPECIAL[li % SPECIAL.length];
    set.push(fresh(sc, ss));
    DU_LEVEL_MAP[id] = set;
  });
})(['g2k1', 'g2k2', 'g2k3', 'g2k4', 'c5', 'g2e', 'c8', 'g5a']);
const DU_LEVELS = Object.keys(DU_LEVEL_MAP);
(function makeItems() {
  const assigned = new Set(Object.values(DU_STARTER).map(s => s.cat + s.shape + s.color));
  Object.entries(DU_LEVEL_MAP).forEach(([level, designs]) => {
    designs.forEach(([cat, shape, color], i) => {
      const palette = cat === 'hair' ? DU_HAIR : DU_COLORS;
      const key = cat + shape + color;
      if (!DU_SHAPES[cat] || !DU_SHAPES[cat][shape] || !palette[color]) throw new Error('Invalid dress-up design: ' + key);
      if (assigned.has(key)) throw new Error('Duplicate dress-up design: ' + key);
      assigned.add(key);
      DU_ITEMS.push({
        id: level + '_d' + i, level, cat, shape, color,
        special: i === 3, name: `${palette[color][0]}の ${DU_SHAPES[cat][shape]}`,
      });
    });
  });
})();
function duItem(id) { return DU_ITEMS.find(x => x.id === id) || Object.values(DU_STARTER).find(x => x.id === id); }
function duCol(it) { return it.cat === 'hair' ? DU_HAIR[it.color][1] : DU_COLORS[it.color][1]; }
// こい色・うすい色を つくる
function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  const f = c => Math.max(0, Math.min(255, Math.round(c + (amt < 0 ? c * amt : (255 - c) * amt))));
  return '#' + [f(n >> 16), f(n >> 8 & 255), f(n & 255)].map(x => x.toString(16).padStart(2, '0')).join('');
}
const DL = (w = 3) => `stroke="${DU_LINE}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;

/* ---------- パーツ ---------- */
function duBg(it, uid) {
  const c = duCol(it), d = shade(c, -0.15), lt = shade(c, 0.6);
  const star = (x, y, s, f) => `<path d="M${x},${y - s} L${x + s * .3},${y - s * .3} L${x + s},${y} L${x + s * .3},${y + s * .3} L${x},${y + s} L${x - s * .3},${y + s * .3} L${x - s},${y} L${x - s * .3},${y - s * .3} Z" fill="${f}"/>`;
  const heart = (x, y, s, f) => `<path d="M${x},${y + s * .8} C${x - s * 1.4},${y - s * .2} ${x - s * .6},${y - s * 1.2} ${x},${y - s * .4} C${x + s * .6},${y - s * 1.2} ${x + s * 1.4},${y - s * .2} ${x},${y + s * .8} Z" fill="${f}"/>`;
  let s = `<defs><linearGradient id="bg${uid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${it.shape === 'night' ? '#2b2f6b' : lt}"/><stop offset="1" stop-color="${it.shape === 'night' ? shade(c, -0.5) : '#ffffff'}"/></linearGradient></defs>`;
  s += `<rect x="0" y="0" width="300" height="420" fill="url(#bg${uid})"/>`;
  const P = [[40, 60], [250, 40], [70, 230], [240, 200], [30, 360], [265, 330], [150, 30], [120, 400], [220, 120], [60, 140]];
  if (it.shape === 'sky') s += `<g fill="#fff" opacity=".95"><ellipse cx="60" cy="70" rx="38" ry="16"/><ellipse cx="82" cy="58" rx="24" ry="16"/><ellipse cx="240" cy="110" rx="34" ry="14"/><ellipse cx="258" cy="100" rx="20" ry="13"/></g><rect y="360" width="300" height="60" fill="${shade(c, 0.35)}"/>`;
  if (it.shape === 'night') s += P.map(([x, y], k) => star(x, y, 5 + (k % 3) * 3, k % 2 ? c : '#fff6c9')).join('') + `<circle cx="245" cy="70" r="26" fill="#fff6c9"/><circle cx="257" cy="62" r="22" fill="#2b2f6b"/>`;
  if (it.shape === 'hearts') s += P.map(([x, y], k) => heart(x, y, 10 + (k % 3) * 4, k % 2 ? c : d)).join('');
  if (it.shape === 'dots') for (let y = 20; y < 420; y += 50) for (let x = (y / 50 % 2) * 25 + 15; x < 300; x += 50) s += `<circle cx="${x}" cy="${y}" r="9" fill="${c}" opacity=".55"/>`;
  if (it.shape === 'flowers') {
    s += `<rect y="330" width="300" height="90" fill="#a6e3a1"/>`;
    [[30, 350], [80, 385], [130, 345], [200, 380], [250, 350], [280, 395], [20, 400]].forEach(([x, y], k) => {
      const f = k % 2 ? c : '#fff';
      for (let a = 0; a < 5; a++) s += `<circle cx="${x + 9 * Math.cos(a * 1.257)}" cy="${y + 9 * Math.sin(a * 1.257)}" r="7" fill="${f}"/>`;
      s += `<circle cx="${x}" cy="${y}" r="5" fill="#ffd34d"/>`;
    });
  }
  if (it.shape === 'castle') {
    const w = shade(c, 0.5);
    s += `<g opacity=".9"><rect x="40" y="170" width="220" height="190" fill="${w}"/><rect x="20" y="120" width="50" height="240" fill="${w}"/><rect x="230" y="120" width="50" height="240" fill="${w}"/>
      <path d="M15,125 L45,60 L75,125 Z M225,125 L255,60 L285,125 Z" fill="${c}"/><rect x="125" y="110" width="50" height="80" fill="${w}"/><path d="M118,115 L150,50 L182,115 Z" fill="${c}"/>
      <path d="M128,360 L128,300 Q150,275 172,300 L172,360 Z" fill="${d}"/></g>` + P.slice(0, 6).map(([x, y], k) => star(x, y * .6, 6, '#fff')).join('');
  }
  return s;
}
function duHairBack(it) {
  const c = duCol(it), d = shade(c, -0.25);
  const S = `fill="${c}" ${DL()}`;
  switch (it.shape) {
    case 'long': return `<path d="M88,120 Q84,60 150,52 Q216,60 212,120 L218,300 Q200,312 182,300 L180,240 L120,240 L118,300 Q100,312 82,300 Z" ${S}/>`;
    case 'wave': return `<path d="M88,120 Q80,60 150,50 Q220,60 212,120 Q228,170 214,210 Q230,250 214,290 Q206,318 184,306 L180,240 L120,240 L116,306 Q94,318 86,290 Q70,250 86,210 Q72,170 88,120 Z" ${S}/>`;
    case 'bob': return `<path d="M88,125 Q82,58 150,52 Q218,58 212,125 L216,180 Q190,192 180,176 L120,176 Q110,192 84,180 Z" ${S}/>`;
    case 'twin': return `<path d="M96,100 Q60,110 62,170 Q58,230 74,280 Q82,296 92,280 Q100,230 100,170 Z" ${S}/><path d="M204,100 Q240,110 238,170 Q242,230 226,280 Q218,296 208,280 Q200,230 200,170 Z" ${S}/>`;
    case 'pony': return `<path d="M196,72 Q252,70 250,140 Q256,200 236,250 Q228,262 222,246 Q234,190 220,140 Q214,110 190,96 Z" ${S}/>`;
    case 'bun': return `<path d="M90,125 Q84,60 150,52 Q216,60 210,125 L212,165 Q196,172 186,160 L114,160 Q104,172 88,165 Z" ${S}/>`;
  }
  return duHairBackX(it, c, d, S);
}
// あたらしい ヘアの うしろがみ
function duHairBackX(it, c, d, S) {
  const cap = `<path d="M88,125 Q82,58 150,52 Q218,58 212,125 L212,150 Q200,158 190,148 L110,148 Q100,158 88,150 Z" ${S}/>`;
  switch (it.shape) {
    case 'short': return cap;
    case 'braid': return cap;
    case 'outflip': return `<path d="M88,125 Q82,58 150,52 Q218,58 212,125 L214,168 Q228,170 236,160 Q234,184 210,184 L120,180 L90,184 Q66,184 64,160 Q72,170 86,168 Z" ${S}/>`;
    case 'side': return cap + `<path d="M98,98 Q58,104 56,160 Q50,214 68,262 Q76,276 86,262 Q78,214 90,164 Q98,128 108,112 Z" ${S}/>`;
    case 'drill': return `<path d="M88,125 Q82,58 150,52 Q218,58 212,125 L214,170 L86,170 Z" ${S}/>`;
    case 'superlong': return `<path d="M88,120 Q84,60 150,52 Q216,60 212,120 L226,300 L238,400 Q214,412 196,402 L182,240 L118,240 L104,402 Q86,412 62,400 L74,300 Z" ${S}/>`;
    case 'afro': {
      let r = '';
      for (let k = 0; k < 16; k++) { const a = k / 16 * Math.PI * 2; r += `<circle cx="${(150 + 84 * Math.cos(a)).toFixed(1)}" cy="${(104 + 74 * Math.sin(a)).toFixed(1)}" r="26" ${S}/>`; }
      return r + `<ellipse cx="150" cy="104" rx="86" ry="76" fill="${c}"/>`;
    }
    case 'explode': {
      const pts = []; for (let k = 0; k < 22; k++) { const a = k / 22 * Math.PI * 2 - Math.PI / 2, R = (k % 2 ? 72 : 104) * (Math.sin(a) > 0.3 ? 0.62 : 1); pts.push(`${(150 + R * Math.cos(a)).toFixed(1)},${(112 + R * .92 * Math.sin(a)).toFixed(1)}`); }
      return `<path d="M${pts.join(' L')} Z" ${S}/>`;
    }
    case 'chonmage': return `<ellipse cx="150" cy="116" rx="66" ry="64" ${S}/>`;
    case 'softcream': case 'horns': case 'bedhead': return `<path d="M88,125 Q82,58 150,52 Q218,58 212,125 L216,180 Q190,192 180,176 L120,176 Q110,192 84,180 Z" ${S}/>`;
    case 'mohawk': return '';
  }
  return '';
}
function duHairFront(it) {
  const c = duCol(it), hi = shade(c, 0.35);
  const S = `fill="${c}" ${DL()}`;
  let s = '';
  const X = duHairFrontX(it, c, hi, S);
  if (X !== null) return X;
  if (it.shape === 'bun') s += `<circle cx="106" cy="62" r="24" ${S}/><circle cx="194" cy="62" r="24" ${S}/>`;
  // まえがみ(ぎざぎざ)と よこの かみ
  s += `<path d="M88,128 Q84,56 150,54 Q216,56 212,128 Q206,108 198,96 L188,112 L176,92 L162,110 L150,90 L138,110 L124,92 L112,112 L102,96 Q94,108 88,128 Z" ${S}/>`;
  if (it.shape !== 'pony') s += `<path d="M90,110 Q84,140 92,172 Q100,160 102,120 Z" ${S}/><path d="M210,110 Q216,140 208,172 Q200,160 198,120 Z" ${S}/>`;
  s += `<path d="M112,72 Q130,62 150,62" fill="none" stroke="${hi}" stroke-width="5" stroke-linecap="round" opacity=".8"/>`;
  if (it.shape === 'twin') s += `<circle cx="98" cy="100" r="8" fill="#ff6f9a" ${DL(2)}/><circle cx="202" cy="100" r="8" fill="#ff6f9a" ${DL(2)}/>`;
  if (it.shape === 'pony') s += `<circle cx="198" cy="86" r="8" fill="#ff6f9a" ${DL(2)}/>`;
  return s;
}
const DU_BANGS = S => `<path d="M88,128 Q84,56 150,54 Q216,56 212,128 Q206,108 198,96 L188,112 L176,92 L162,110 L150,90 L138,110 L124,92 L112,112 L102,96 Q94,108 88,128 Z" ${S}/>`;
const DU_SIDES = (S, y = 172) => `<path d="M90,110 Q84,140 92,${y} Q100,${y - 12} 102,120 Z" ${S}/><path d="M210,110 Q216,140 208,${y} Q200,${y - 12} 198,120 Z" ${S}/>`;
// あたらしい ヘアの まえがみ(null なら いつもの かきかた)
function duHairFrontX(it, c, hi, S) {
  const shine = `<path d="M112,72 Q130,62 150,62" fill="none" stroke="${hi}" stroke-width="5" stroke-linecap="round" opacity=".8"/>`;
  const tie = (x, y) => `<circle cx="${x}" cy="${y}" r="7" fill="#ff6f9a" ${DL(2)}/>`;
  switch (it.shape) {
    case 'short': return DU_BANGS(S) + DU_SIDES(S, 148) + shine;
    case 'outflip': return DU_BANGS(S) + DU_SIDES(S, 160) + shine;
    case 'side': return DU_BANGS(S) + `<path d="M210,110 Q216,140 208,172 Q200,160 198,120 Z" ${S}/>` + shine + tie(100, 106);
    case 'braid': {
      let b = '';
      [100, 200].forEach(x => {
        for (let k = 0; k < 6; k++) { const y = 160 + k * 19, dx = (k % 2 ? 4 : -4) * (x < 150 ? 1 : -1); b += `<ellipse cx="${x + dx}" cy="${y}" rx="12" ry="12" ${S}/><path d="M${x + dx - 7},${y - 3} Q${x + dx},${y + 4} ${x + dx + 7},${y - 3}" fill="none" stroke="${shade(c, -0.25)}" stroke-width="2"/>`; }
        b += `<path d="M${x - 6},270 L${x - 10},292 L${x},284 L${x + 10},292 L${x + 6},270 Z" ${S}/>` + tie(x, 268);
      });
      return DU_BANGS(S) + DU_SIDES(S, 150) + b + shine;
    }
    case 'drill': {
      let r = '';
      [86, 214].forEach(x => {
        for (let k = 0; k < 5; k++) { const y = 150 + k * 30, w = 22 - k * 1.5; r += `<ellipse cx="${x}" cy="${y}" rx="${w}" ry="17" ${S}/><path d="M${x - w + 4},${y - 4} Q${x},${y + 12} ${x + w - 4},${y - 4}" fill="none" stroke="${shade(c, -0.25)}" stroke-width="2.5"/>`; }
      });
      return DU_BANGS(S) + r + shine;
    }
    case 'superlong': return DU_BANGS(S) + DU_SIDES(S) + shine;
    case 'afro': {
      let r = '';
      for (let k = 0; k < 9; k++) r += `<circle cx="${96 + k * 13.5}" cy="${72 + Math.abs(k - 4) * 4}" r="15" ${S}/>`;
      return r + `<path d="M84,80 Q150,40 216,80 L216,70 Q150,30 84,70 Z" fill="${c}"/>`;
    }
    case 'mohawk': {
      const sp = []; for (let k = 0; k <= 8; k++) sp.push(`${136 + k * 3.5 + (k % 2 ? 0 : 0)},${k % 2 ? 22 + Math.abs(k - 4) * 6 : 4 + Math.abs(k - 4) * 7}`);
      return `<path d="M94,104 Q96,62 150,58 Q204,62 206,104 Q180,80 150,78 Q120,80 94,104 Z" fill="${shade(c, 0.25)}" opacity=".7"/>` +
        `<path d="M134,84 L${sp.join(' L')} L166,84 Q150,76 134,84 Z" ${S}/>`;
    }
    case 'chonmage': return `<ellipse cx="150" cy="82" rx="38" ry="20" fill="#cfdcea" opacity=".7"/>` +
      `<path d="M88,130 Q82,88 104,66 Q108,100 102,128 Z" ${S}/><path d="M212,130 Q218,88 196,66 Q192,100 198,128 Z" ${S}/>` +
      `<path d="M140,66 Q136,40 150,20 Q164,40 160,66 Z" ${S}/><rect x="138" y="52" width="24" height="7" rx="3" fill="#fff" ${DL(2)}/>`;
    case 'softcream': return DU_BANGS(S) + DU_SIDES(S) +
      [[62, 76, 20], [42, 58, 17], [24, 42, 14], [9, 26, 11]].map(([y, rx, ry]) => `<ellipse cx="150" cy="${y}" rx="${rx}" ry="${ry}" ${S}/><path d="M${150 - rx + 8},${y + 4} Q150,${y + ry} ${150 + rx - 8},${y + 4}" fill="none" stroke="${hi}" stroke-width="3" opacity=".8"/>`).join('') +
      `<path d="M144,0 Q156,-6 158,6 Q150,4 144,0 Z" ${S}/>`;
    case 'horns': return `<path d="M108,76 Q90,40 98,4 Q114,30 132,62 Z" ${S}/><path d="M192,76 Q210,40 202,4 Q186,30 168,62 Z" ${S}/>` + DU_BANGS(S) + DU_SIDES(S) + shine;
    case 'explode': return `<path d="M88,128 Q84,56 150,54 Q216,56 212,128 L200,100 L196,118 L182,88 L172,110 L160,82 L150,104 L140,82 L128,110 L118,88 L104,118 L100,100 Z" ${S}/>` +
      [[96, 40, 12], [112, 26, 9], [206, 36, 11], [190, 22, 8]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#cfcfd8" opacity=".85"/>`).join('') +
      `<path d="M128,100 l6,4 M170,98 l-5,5" stroke="#555" stroke-width="3" stroke-linecap="round"/>`;
    case 'bedhead': {
      const tufts = [['M120,62', 'Q112,42 124,36'], ['M150,56', 'Q150,36 162,32'], ['M180,62', 'Q196,48 190,38'], ['M92,104', 'Q76,98 74,86'], ['M208,104', 'Q226,102 228,90'], ['M94,150', 'Q80,156 76,148']];
      return DU_BANGS(S) + DU_SIDES(S) + tufts.map(([a, b]) => `<path d="${a} ${b}" fill="none" stroke="${DU_LINE}" stroke-width="10" stroke-linecap="round"/><path d="${a} ${b}" fill="none" stroke="${c}" stroke-width="5.5" stroke-linecap="round"/>`).join('') + shine;
    }
  }
  return null;
}
function duBody(kind) {
  const sk = `fill="${DU_SKIN}" ${DL()}`;
  let s = '';
  // うで
  s += `<path d="M118,204 L98,274" ${DL(20)} fill="none"/><path d="M118,204 L98,274" stroke="${DU_SKIN}" stroke-width="14" stroke-linecap="round" fill="none"/>`;
  s += `<path d="M182,204 L202,274" ${DL(20)} fill="none"/><path d="M182,204 L202,274" stroke="${DU_SKIN}" stroke-width="14" stroke-linecap="round" fill="none"/>`;
  s += `<circle cx="97" cy="279" r="9" ${sk}/><circle cx="203" cy="279" r="9" ${sk}/>`;
  // あし
  s += `<path d="M130,280 L146,280 L145,384 L131,384 Z" ${sk}/><path d="M154,280 L170,280 L169,384 L155,384 Z" ${sk}/>`;
  // くび・どう
  s += `<rect x="141" y="168" width="18" height="30" ${sk}/><path d="M116,198 Q150,188 184,198 L182,288 L118,288 Z" ${sk}/>`;
  return s;
}
function duHead() {
  return `<circle cx="150" cy="120" r="60" fill="${DU_SKIN}" ${DL()}/><ellipse cx="90" cy="128" rx="8" ry="11" fill="${DU_SKIN}" ${DL()}/><ellipse cx="210" cy="128" rx="8" ry="11" fill="${DU_SKIN}" ${DL()}/>`;
}
function duFace() {
  const eye = x => `<ellipse cx="${x}" cy="132" rx="8.5" ry="11.5" fill="#4a3048"/><ellipse cx="${x}" cy="136" rx="6" ry="6" fill="#8a5cc0" opacity=".6"/><circle cx="${x + 3}" cy="127" r="3.6" fill="#fff"/><circle cx="${x - 3}" cy="138" r="1.6" fill="#fff"/>`;
  return eye(127) + eye(173) +
    `<path d="M115,118 Q121,113 129,116" fill="none" ${DL(2.5)}/><path d="M185,118 Q179,113 171,116" fill="none" ${DL(2.5)}/>` +
    `<ellipse cx="113" cy="152" rx="10" ry="6" fill="#ff9fb0" opacity=".55"/><ellipse cx="187" cy="152" rx="10" ry="6" fill="#ff9fb0" opacity=".55"/>` +
    `<path d="M143,154 Q150,161 157,154" fill="#ff8a8a" ${DL(2.5)}/>`;
}
function duBottom(it) {
  const c = duCol(it), d = shade(c, -0.18);
  const S = `fill="${c}" ${DL()}`;
  switch (it.shape) {
    case 'skirt': return `<path d="M118,272 L182,272 L204,332 Q150,344 96,332 Z" ${S}/><path d="M118,280 L182,280" stroke="${d}" stroke-width="4"/>`;
    case 'pleats': return `<path d="M118,272 L182,272 L204,332 Q150,344 96,332 Z" ${S}/>` + [-34, -17, 0, 17, 34].map(x => `<path d="M${150 + x * .55},278 L${150 + x * 1.05},338" stroke="${d}" stroke-width="2.5"/>`).join('');
    case 'frill': return `<path d="M118,272 L182,272 L200,318 L96,318 Z" ${S}/><path d="M92,316 ${[0, 1, 2, 3, 4, 5].map(k => `Q${101 + k * 19},${346} ${111 + k * 19},${318}`).join(' ')} L208,318 Z" fill="${shade(c, 0.35)}" ${DL()}/>`;
    case 'shorts': return `<path d="M118,272 L182,272 L186,316 L154,318 L150,296 L146,318 L114,316 Z" ${S}/>`;
    case 'maxi': return `<path d="M118,272 L182,272 L200,374 Q150,384 100,374 Z" ${S}/><path d="M118,280 L182,280" stroke="${d}" stroke-width="4"/><path d="M140,290 L130,370 M160,290 L170,370" stroke="${d}" stroke-width="2.5" opacity=".7"/>`;
    case 'pants': return `<path d="M118,272 L182,272 L176,376 L155,376 L150,300 L145,376 L124,376 Z" ${S}/><path d="M150,282 L150,300" stroke="${d}" stroke-width="2.5"/>`;
  }
  return '';
}
function duSleeves(c, kind) {
  const S = `fill="${c}" ${DL()}`;
  if (kind === 'short') return `<path d="M120,198 L100,236 L118,244 L128,216 Z" ${S}/><path d="M180,198 L200,236 L182,244 L172,216 Z" ${S}/>`;
  if (kind === 'puff') return `<ellipse cx="114" cy="214" rx="18" ry="20" ${S}/><ellipse cx="186" cy="214" rx="18" ry="20" ${S}/>`;
  if (kind === 'long') return `<path d="M120,200 L97,272" ${DL(26)} fill="none"/><path d="M120,200 L97,272" stroke="${c}" stroke-width="20" stroke-linecap="round" fill="none"/><path d="M180,200 L203,272" ${DL(26)} fill="none"/><path d="M180,200 L203,272" stroke="${c}" stroke-width="20" stroke-linecap="round" fill="none"/>`;
  return '';
}
function duTop(it) {
  const c = duCol(it), d = shade(c, -0.18);
  const S = `fill="${c}" ${DL()}`;
  const body = `<path d="M114,198 Q150,186 186,198 L186,292 Q150,298 114,292 Z" ${S}/>`;
  const neck = `<path d="M138,192 Q150,204 162,192" fill="none" ${DL(2.5)}/>`;
  switch (it.shape) {
    case 'tee': return duSleeves(c, 'short') + body + neck;
    case 'puff': return body + duSleeves(c, 'puff') + `<path d="M134,192 Q150,214 166,192 Q150,200 134,192 Z" fill="#fff" ${DL(2.5)}/>`;
    case 'sailor': return duSleeves(c, 'short') + body + `<path d="M118,196 L150,240 L182,196 Q170,212 150,214 Q130,212 118,196 Z" fill="${it.color === 'navy' ? '#fff' : '#5363a6'}" ${DL(2.5)}/><path d="M140,236 L150,244 L160,236 L156,256 L150,248 L144,256 Z" fill="#ff6f7d" ${DL(2)}/>`;
    case 'knit': return duSleeves(c, 'long') + body + `<path d="M116,282 L184,282" stroke="${d}" stroke-width="5"/><path d="M134,192 Q150,206 166,192" fill="none" stroke="${d}" stroke-width="6"/>`;
    case 'cami': return `<path d="M128,198 L132,216 M172,198 L168,216" ${DL(3)}/><path d="M116,216 Q150,208 184,216 L186,292 Q150,298 114,292 Z" ${S}/><path d="M118,226 Q150,220 182,226" stroke="#fff" stroke-width="3" fill="none" opacity=".8"/>`;
    case 'hoodie': return duSleeves(c, 'long') + body + `<path d="M126,196 Q150,226 174,196" fill="${d}" ${DL(2.5)}/><path d="M144,214 L142,236 M156,214 L158,236" ${DL(2)}/><rect x="128" y="252" width="44" height="22" rx="6" fill="${d}" ${DL(2)}/>`;
  }
  return '';
}
function duDress(it) {
  const c = duCol(it), d = shade(c, -0.18), lt = shade(c, 0.45);
  const S = `fill="${c}" ${DL()}`;
  const bodice = `<path d="M116,198 Q150,188 184,198 L180,268 L120,268 Z" ${S}/>`;
  switch (it.shape) {
    case 'aline': return duSleeves(c, 'short') + `<path d="M116,198 Q150,188 184,198 L182,262 L212,346 Q150,360 88,346 L118,262 Z" ${S}/><path d="M118,262 Q150,272 182,262" stroke="${d}" stroke-width="5" fill="none"/><path d="M134,192 Q150,206 166,192" fill="none" ${DL(2.5)}/>`;
    case 'jumper': return duSleeves('#ffffff', 'short') + `<path d="M114,198 Q150,186 186,198 L186,260 L114,260 Z" fill="#fff" ${DL()}/><path d="M126,204 L130,240 L170,240 L174,204" fill="none" stroke="${c}" stroke-width="7"/><path d="M128,236 L172,236 L178,262 L208,342 Q150,356 92,342 L122,262 Z" ${S}/><circle cx="134" cy="248" r="3" fill="${d}"/><circle cx="166" cy="248" r="3" fill="${d}"/>`;
    case 'frill': return duSleeves(c, 'puff') + bodice +
      `<path d="M120,264 L180,264 L194,300 L106,300 Z" ${S}/><path d="M104,296 L196,296 L210,330 L90,330 Z" fill="${lt}" ${DL()}/><path d="M88,326 L212,326 L224,362 Q150,374 76,362 Z" ${S}/>` +
      `<path d="M120,268 Q150,278 180,268" stroke="${d}" stroke-width="5" fill="none"/>`;
    case 'kimono': case 'sari': case 'china': case 'maid': case 'miko': case 'doctor': case 'police': return duCostume(it, c, d, lt, S);
    case 'princess': return duSleeves(c, 'puff') + bodice +
      `<path d="M120,262 Q150,272 180,262 Q236,300 248,392 Q150,410 52,392 Q64,300 120,262 Z" ${S}/>` +
      `<path d="M120,264 Q100,330 112,398 M150,272 L150,404 M180,264 Q200,330 188,398" stroke="${d}" stroke-width="3" fill="none" opacity=".6"/>` +
      `<path d="M52,392 ${[0, 1, 2, 3, 4, 5, 6, 7].map(k => `Q${64 + k * 24.5},${414} ${76.5 + k * 24.5},${394}`).join(' ')}" fill="${lt}" ${DL(2.5)}/>` +
      `<path d="M138,206 L150,216 L162,206 L158,224 L150,218 L142,224 Z" fill="${lt}" ${DL(2)}/>` +
      [[100, 330], [196, 320], [150, 360], [122, 376], [180, 372]].map(([x, y]) => `<path d="M${x},${y - 6} L${x + 2},${y - 2} L${x + 6},${y} L${x + 2},${y + 2} L${x},${y + 6} L${x - 2},${y + 2} L${x - 6},${y} L${x - 2},${y - 2} Z" fill="#fff"/>`).join('');
  }
  return '';
}
// せかいの いしょう・おしごと コスチューム
function duCostume(it, c, d, lt, S) {
  const L = DL(), w = '#ffffff';
  const longSleeve = col => duSleeves(col, 'long');
  switch (it.shape) {
    case 'kimono': {
      const obi = it.color === 'red' ? '#f6c445' : '#ff6f7d';
      return `<path d="M120,202 L84,214 L80,300 L106,304 L114,250 Z" ${S}/><path d="M180,202 L216,214 L220,300 L194,304 L186,250 Z" ${S}/>` +
        `<path d="M116,198 Q150,188 184,198 L188,376 Q150,384 112,376 Z" ${S}/>` +
        `<path d="M138,194 L150,236 L162,194" fill="none" stroke="#fff" stroke-width="7"/><path d="M138,194 L150,236 L162,194" fill="none" ${DL(2)}/>` +
        `<path d="M162,236 L150,236 L186,376" fill="none" ${DL(2)}/>` +
        `<rect x="114" y="238" width="72" height="26" fill="${obi}" ${DL(2.5)}/><path d="M114,252 L186,252" stroke="${shade(obi, -0.25)}" stroke-width="3"/>` +
        [[128, 300], [168, 330], [134, 352], [96, 270], [204, 270]].map(([x, y]) => [0, 1, 2, 3, 4].map(a => `<circle cx="${(x + 5 * Math.cos(a * 1.257)).toFixed(1)}" cy="${(y + 5 * Math.sin(a * 1.257)).toFixed(1)}" r="4" fill="${lt}"/>`).join('') + `<circle cx="${x}" cy="${y}" r="2.5" fill="#ffd34d"/>`).join('');
    }
    case 'sari': {
      const g = '#f6c445';
      return duSleeves(lt, 'short') + `<path d="M116,198 Q150,188 184,198 L182,252 L118,252 Z" fill="${lt}" ${L}/>` +
        `<path d="M118,248 L182,248 L198,378 Q150,388 102,378 Z" ${S}/><path d="M102,372 Q150,382 198,372" fill="none" stroke="${g}" stroke-width="6"/>` +
        `<path d="M114,198 Q134,190 146,194 L194,300 L186,340 Q170,280 116,232 Z" fill="${shade(c, 0.15)}" ${L}/>` +
        `<path d="M146,194 L194,300" stroke="${g}" stroke-width="5"/><path d="M186,340 L208,388 L196,392 L180,350" fill="${shade(c, 0.15)}" ${DL(2)}/>` +
        `<circle cx="150" cy="282" r="0"/>` + [[150, 300], [140, 330], [166, 352]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.5" fill="${g}"/>`).join('');
    }
    case 'china': {
      const g = '#f6c445';
      return duSleeves(c, 'short') + `<path d="M116,198 Q150,188 184,198 L180,268 L188,376 Q150,382 112,376 L120,268 Z" ${S}/>` +
        `<path d="M138,188 L162,188 L162,200 L138,200 Z" fill="${c}" ${DL(2)}/><path d="M138,200 L162,200" stroke="${g}" stroke-width="3"/>` +
        `<path d="M150,200 Q168,206 182,220" fill="none" stroke="${g}" stroke-width="4"/>` +
        [[160, 206], [172, 212], [180, 232]].map(([x, y]) => `<path d="M${x - 5},${y} L${x + 5},${y}" stroke="${g}" stroke-width="4" stroke-linecap="round"/>`).join('') +
        `<path d="M178,320 L186,376" stroke="${DU_LINE}" stroke-width="3"/><path d="M118,268 Q150,276 182,268" fill="none" stroke="${d}" stroke-width="3"/>` +
        `<g fill="none" stroke="${g}" stroke-width="2.5" opacity=".9"><circle cx="136" cy="310" r="9"/><circle cx="160" cy="344" r="7"/><circle cx="132" cy="352" r="5"/></g>`;
    }
    case 'maid': {
      return duSleeves(c, 'puff') + `<path d="M116,198 Q150,188 184,198 L180,268 L210,342 Q150,356 90,342 L120,268 Z" ${S}/>` +
        `<path d="M98,338 ${[0, 1, 2, 3, 4, 5].map(k => `Q${107 + k * 17},${354} ${115 + k * 17},${340}`).join(' ')}" fill="#fff" ${DL(2)}/>` +
        `<path d="M128,226 L172,226 L176,262 L194,334 Q150,344 106,334 L124,262 Z" fill="${w}" ${DL(2.5)}/>` +
        `<path d="M108,330 ${[0, 1, 2, 3, 4].map(k => `Q${117 + k * 17},${344} ${125 + k * 17},${332}`).join(' ')}" fill="${w}" ${DL(2)}/>` +
        `<path d="M134,194 L150,214 L166,194 Q150,202 134,194 Z" fill="#fff" ${DL(2)}/><path d="M143,212 L150,218 L157,212 L154,224 L150,220 L146,224 Z" fill="${it.color === 'red' ? '#5363a6' : '#ff6f7d'}" ${DL(1.5)}/>` +
        `<path d="M124,262 Q150,268 176,262" fill="none" stroke="${shade(w, -0.12)}" stroke-width="3"/>`;
    }
    case 'miko': {
      return `<path d="M120,202 L86,214 L82,296 L110,300 L116,250 Z" fill="#fff" ${L}/><path d="M180,202 L214,214 L218,296 L190,300 L184,250 Z" fill="#fff" ${L}/>` +
        `<path d="M114,198 Q150,188 186,198 L186,262 L114,262 Z" fill="#fff" ${L}/><path d="M138,194 L150,232 L162,194" fill="none" ${DL(2.5)}/>` +
        `<path d="M138,194 L150,232" stroke="${c}" stroke-width="3" opacity=".7"/>` +
        `<path d="M116,252 L184,252 L196,378 L154,378 L150,292 L146,378 L104,378 Z" ${S}/><path d="M116,252 L184,252 L184,262 L116,262 Z" fill="${d}" ${DL(2)}/>` +
        `<path d="M128,270 L124,370 M172,270 L176,370" stroke="${d}" stroke-width="2.5"/>`;
    }
    case 'doctor': {
      const coat = `<path d="M114,198 L136,192 L146,300 L122,350 L106,346 Z" fill="${w}" ${L}/><path d="M186,198 L164,192 L154,300 L178,350 L194,346 Z" fill="${w}" ${L}/>` +
        `<path d="M130,196 L140,232 L126,222 Z M170,196 L160,232 L174,222 Z" fill="#eef2f7" ${DL(2)}/>`;
      return longSleeve('#ffffff') + `<path d="M118,288 L118,376 L144,376 L146,300 L154,300 L156,376 L182,376 L182,288 Z" fill="#7d8fb3" ${L}/>` +
        `<path d="M114,198 Q150,186 186,198 L186,292 Q150,298 114,292 Z" fill="${c}" ${L}/><path d="M138,196 L150,214 L162,196" fill="${shade(c, 0.5)}" ${DL(2)}/>` + coat +
        `<rect x="164" y="262" width="18" height="16" fill="#eef2f7" ${DL(2)}/><path d="M168,256 L168,270" stroke="#5363a6" stroke-width="3" stroke-linecap="round"/>` +
        `<path d="M136,200 Q130,250 146,256 Q160,250 160,232" fill="none" stroke="#555a66" stroke-width="3"/><circle cx="160" cy="232" r="6" fill="#c8ccd6" ${DL(2)}/>`;
    }
    case 'police': {
      return longSleeve(c) + `<path d="M118,284 L182,284 L176,376 L155,376 L150,300 L145,376 L124,376 Z" ${S}/>` +
        `<path d="M114,198 Q150,186 186,198 L186,292 Q150,298 114,292 Z" ${S}/><path d="M138,194 L150,214 L162,194" fill="#d8e4f5" ${DL(2)}/>` +
        `<path d="M147,212 L153,212 L152,248 L148,248 Z" fill="${d}"/>` +
        `<rect x="114" y="276" width="72" height="12" fill="#3b3140" ${DL(2)}/><rect x="144" y="275" width="12" height="14" fill="#f6c445" ${DL(1.5)}/>` +
        `<path d="M126,224 L138,224 L138,236 Q132,242 126,236 Z" fill="#f6c445" ${DL(1.5)}/>` +
        `<path d="M168,226 l3,6 6,1 -4,4 1,6 -6,-3 -6,3 1,-6 -4,-4 6,-1 Z" fill="#f6c445" ${DL(1.2)}/>` +
        `<path d="M116,206 L130,206 M170,206 L184,206" stroke="${shade(c, 0.4)}" stroke-width="4"/>`;
    }
  }
  return '';
}
// ぼうし(アクセと いっしょに つけられる)
function duHat(it) {
  const c = duCol(it), d = shade(c, -0.2), lt = shade(c, 0.45);
  const S = `fill="${c}" ${DL()}`;
  switch (it.shape) {
    case 'straw': return `<ellipse cx="150" cy="74" rx="96" ry="18" fill="#f3d58a" ${DL()}/><path d="M106,74 Q104,30 150,28 Q196,30 194,74 Q150,82 106,74 Z" fill="#f3d58a" ${DL()}/>` +
      `<path d="M106,62 Q150,70 194,62 L194,72 Q150,80 106,72 Z" ${S}/><path d="M120,46 L180,46 M114,86 L186,86" stroke="#d9b45e" stroke-width="2"/>`;
    case 'knit': return `<path d="M86,96 Q82,34 150,30 Q218,34 214,96 Z" ${S}/><path d="M84,80 Q150,66 216,80 L218,100 Q150,88 82,100 Z" fill="${lt}" ${DL()}/>` +
      [100, 118, 136, 154, 172, 190].map(x => `<path d="M${x + 6},82 L${x + 4},96" stroke="${shade(lt, -0.15)}" stroke-width="3"/>`).join('') +
      `<path d="M120,42 L118,72 M150,34 L150,72 M180,42 L182,72" stroke="${d}" stroke-width="3" opacity=".6"/>` +
      [0, 1, 2, 3, 4, 5, 6, 7].map(a => `<circle cx="${(150 + 9 * Math.cos(a * .785)).toFixed(1)}" cy="${(26 + 9 * Math.sin(a * .785)).toFixed(1)}" r="8" fill="${lt}"/>`).join('') + `<circle cx="150" cy="26" r="12" fill="${lt}" ${DL(2)}/>`;
    case 'cap': return `<path d="M92,88 Q88,34 150,32 Q212,34 208,88 Q150,76 92,88 Z" ${S}/><path d="M150,32 L150,80" stroke="${d}" stroke-width="2.5"/><circle cx="150" cy="33" r="5" fill="${d}" ${DL(2)}/>` +
      `<path d="M96,86 Q150,74 204,86 Q206,100 196,104 Q150,92 104,104 Q94,100 96,86 Z" fill="${d}" ${DL()}/><path d="M120,52 L134,46 L138,62 L124,66 Z" fill="#fff" opacity=".9"/>`;
    case 'nurse': return `<path d="M112,74 L120,42 Q150,34 180,42 L188,74 Q150,64 112,74 Z" fill="#fff" ${DL()}/><path d="M112,74 Q150,64 188,74" fill="none" stroke="${c}" stroke-width="4"/>` +
      `<path d="M146,46 L154,46 L154,52 L160,52 L160,60 L154,60 L154,66 L146,66 L146,60 L140,60 L140,52 L146,52 Z" fill="${c === '#ffffff' ? '#ff6f7d' : c}" ${DL(1.2)}/>`;
    case 'police': return `<path d="M102,74 L106,56 L194,56 L198,74 Z" fill="${c}" ${DL()}/><ellipse cx="150" cy="48" rx="66" ry="20" fill="${c}" ${DL()}/>` +
      `<path d="M102,74 Q150,82 198,74 Q194,92 150,94 Q106,92 102,74 Z" fill="#2c2833" ${DL()}/><path d="M104,70 L196,70" stroke="#f6c445" stroke-width="3"/>` +
      `<path d="M150,46 l4,7 8,1 -6,5 2,8 -8,-4 -8,4 2,-8 -6,-5 8,-1 Z" fill="#f6c445" ${DL(1.5)}/>`;
    case 'chef': return [[112, 34, 24], [134, 20, 26], [166, 20, 26], [188, 34, 24], [150, 12, 22]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff" ${DL()}/>`).join('') +
      `<path d="M98,40 Q150,28 202,40 L198,84 Q150,76 102,84 Z" fill="#fff" ${DL()}/><path d="M102,72 Q150,64 198,72" fill="none" stroke="${c === '#ffffff' ? '#d8dbe8' : c}" stroke-width="5"/>` +
      `<path d="M126,44 L128,66 M150,40 L150,64 M174,44 L172,66" stroke="#e3e6ef" stroke-width="3"/>`;
    case 'ribbonhat': return `<ellipse cx="150" cy="76" rx="78" ry="14" ${S}/><path d="M112,76 Q110,38 150,36 Q190,38 188,76 Q150,84 112,76 Z" ${S}/>` +
      `<path d="M112,64 Q150,72 188,64 L188,74 Q150,82 112,74 Z" fill="#fff" ${DL(2)}/>` +
      `<path d="M172,68 L196,52 L198,82 Z M172,68 L200,74 L184,94 Z" fill="#ff6f9a" ${DL(2)}/><circle cx="172" cy="69" r="6" fill="#ff8fb8" ${DL(2)}/>`;
    case 'witch': return `<ellipse cx="150" cy="78" rx="94" ry="16" ${S}/><path d="M108,78 Q130,52 140,26 Q150,4 190,-2 Q170,14 168,40 Q170,62 192,78 Q150,88 108,78 Z" ${S}/>` +
      `<path d="M112,70 Q150,80 190,70 L190,78 Q150,88 112,78 Z" fill="#f6c445" ${DL(2)}/><rect x="140" y="68" width="16" height="14" rx="2" fill="none" stroke="${DU_LINE}" stroke-width="2.5"/>` +
      `<path d="M132,46 l2,5 5,1 -4,3 1,5 -4,-3 -4,3 1,-5 -4,-3 5,-1 Z" fill="#fff6c9"/>`;
  }
  return '';
}
// おとも(キャラの よこに いる どうぶつ)
function duPet(it) {
  const c = duCol(it), d = shade(c, -0.25), lt = shade(c, 0.5);
  const S = `fill="${c}" ${DL()}`;
  const eyes = (x1, x2, y) => `<circle cx="${x1}" cy="${y}" r="3.2" fill="#3b3140"/><circle cx="${x2}" cy="${y}" r="3.2" fill="#3b3140"/><circle cx="${x1 + 1}" cy="${y - 1}" r="1.1" fill="#fff"/><circle cx="${x2 + 1}" cy="${y - 1}" r="1.1" fill="#fff"/>`;
  const shadow = `<ellipse cx="56" cy="402" rx="44" ry="6" fill="#000" opacity=".1"/>`;
  switch (it.shape) {
    case 'dog': return shadow + `<path d="M84,372 Q102,350 96,336" fill="none" ${DL(8)}/><path d="M84,372 Q102,350 96,336" fill="none" stroke="${c}" stroke-width="4" stroke-linecap="round"/>` +
      `<ellipse cx="60" cy="378" rx="30" ry="22" ${S}/><rect x="38" y="384" width="10" height="16" rx="5" ${S}/><rect x="68" y="384" width="10" height="16" rx="5" ${S}/>` +
      `<circle cx="46" cy="340" r="24" ${S}/><path d="M26,330 Q16,350 26,364 Q34,352 32,334 Z M66,330 Q76,350 66,364 Q58,352 60,334 Z" fill="${d}" ${DL(2)}/>` +
      eyes(38, 54, 338) + `<ellipse cx="46" cy="350" rx="9" ry="6" fill="${lt}"/><ellipse cx="46" cy="347" rx="4" ry="3" fill="#3b3140"/><path d="M40,355 Q46,360 52,355" fill="none" ${DL(1.5)}/>`;
    case 'cat': return shadow + `<path d="M82,380 Q104,370 98,340 Q96,330 90,334" fill="none" ${DL(8)}/><path d="M82,380 Q104,370 98,340 Q96,330 90,334" fill="none" stroke="${c}" stroke-width="4" stroke-linecap="round"/>` +
      `<ellipse cx="58" cy="380" rx="26" ry="20" ${S}/><rect x="38" y="386" width="10" height="14" rx="5" ${S}/><rect x="64" y="386" width="10" height="14" rx="5" ${S}/>` +
      `<path d="M28,336 L30,310 L44,324 Z M68,336 L66,310 L52,324 Z" ${S}/><circle cx="48" cy="344" r="22" ${S}/>` + eyes(40, 56, 342) +
      `<path d="M46,350 L50,350 L48,353 Z" fill="#ff8fb8"/><path d="M48,353 Q44,358 41,355 M48,353 Q52,358 55,355" fill="none" ${DL(1.5)}/><path d="M22,348 L34,350 M22,354 L34,353 M74,348 L62,350 M74,354 L62,353" stroke="${DU_LINE}" stroke-width="1.5"/>`;
    case 'rabbit': return shadow + `<ellipse cx="56" cy="382" rx="26" ry="20" ${S}/><circle cx="82" cy="384" r="8" fill="#fff" ${DL(2)}/>` +
      `<ellipse cx="40" cy="296" rx="8" ry="26" ${S} transform="rotate(-10 40 296)"/><ellipse cx="58" cy="296" rx="8" ry="26" ${S} transform="rotate(10 58 296)"/>` +
      `<ellipse cx="40" cy="298" rx="3.5" ry="18" fill="#ffc8da" transform="rotate(-10 40 298)"/><ellipse cx="58" cy="298" rx="3.5" ry="18" fill="#ffc8da" transform="rotate(10 58 298)"/>` +
      `<circle cx="49" cy="342" r="22" ${S}/>` + eyes(41, 57, 340) + `<path d="M47,348 L51,348 L49,351 Z" fill="#ff8fb8"/><path d="M49,351 L49,355 M45,356 Q49,358 53,356" fill="none" ${DL(1.5)}/>` +
      `<ellipse cx="36" cy="350" rx="5" ry="3" fill="#ff9fb0" opacity=".6"/><ellipse cx="62" cy="350" rx="5" ry="3" fill="#ff9fb0" opacity=".6"/>`;
    case 'wani': return shadow + `<path d="M108,380 Q122,390 120,398 Q104,398 92,392 Z" ${S}/>` +
      `<path d="M10,372 Q14,356 40,356 L96,360 Q112,364 110,380 Q110,394 92,394 L28,394 Q8,392 10,372 Z" ${S}/>` +
      [44, 58, 72, 86].map(x => `<path d="M${x - 6},358 L${x},349 L${x + 6},358" fill="${d}" ${DL(2)}/>`).join('') +
      `<path d="M2,374 L40,372 L40,384 L4,386 Q-2,380 2,374 Z" ${S}/><path d="M6,374 L10,380 L14,374 L18,380 L22,374 L26,380 L30,374" fill="#fff" stroke="${DU_LINE}" stroke-width="1.2"/>` +
      `<circle cx="30" cy="356" r="8" ${S}/><circle cx="44" cy="356" r="8" ${S}/>` + eyes(30, 44, 355) +
      [[40, 394], [80, 394]].map(([x, y]) => `<rect x="${x}" y="${y - 6}" width="12" height="12" rx="4" ${S}/>`).join('');
    case 'penguin': return shadow + `<path d="M24,392 Q20,346 52,330 Q84,346 80,392 Q52,402 24,392 Z" fill="#3b3e5a" ${DL()}/><path d="M34,390 Q32,356 52,346 Q72,356 70,390 Q52,396 34,390 Z" fill="#fff"/>` +
      `<path d="M26,360 Q12,372 18,384 Q28,376 30,366 Z M78,360 Q92,372 86,384 Q76,376 74,366 Z" fill="#3b3e5a" ${DL(2)}/>` + eyes(44, 60, 346) +
      `<path d="M47,352 L57,352 L52,360 Z" fill="#ffb170" ${DL(1.5)}/><path d="M38,398 L48,398 L46,392 Z M56,398 L66,398 L58,392 Z" fill="#ffb170" ${DL(1.5)}/>` +
      `<path d="M30,364 Q52,372 74,364" fill="none" stroke="${c}" stroke-width="7" stroke-linecap="round"/><path d="M66,368 L72,384" stroke="${c}" stroke-width="7" stroke-linecap="round"/>`;
    case 'tako': {
      let legs = '';
      for (let k = 0; k < 6; k++) { const x = 28 + k * 10; legs += `<path d="M${x},372 Q${x - 8 + k * 2},392 ${x - 2 + (k % 2 ? 8 : -8)},398" fill="none" stroke="${DU_LINE}" stroke-width="11" stroke-linecap="round"/><path d="M${x},372 Q${x - 8 + k * 2},392 ${x - 2 + (k % 2 ? 8 : -8)},398" fill="none" stroke="${c}" stroke-width="7" stroke-linecap="round"/>`; }
      return shadow + legs + `<ellipse cx="54" cy="346" rx="30" ry="30" ${S}/><ellipse cx="44" cy="334" rx="8" ry="5" fill="${lt}" opacity=".8"/>` + eyes(44, 62, 356) +
        `<ellipse cx="53" cy="368" rx="5" ry="4" fill="${d}" ${DL(1.5)}/><path d="M30,320 Q40,306 54,316" fill="none" stroke="#fff" stroke-width="3" opacity=".5"/>` +
        `<path d="M54,318 Q58,300 70,306 Q60,310 58,322" fill="#ffd34d" ${DL(1.5)}/>`;
    }
  }
  return '';
}
function duShoes(it) {
  const c = duCol(it), d = shade(c, -0.2);
  const S = `fill="${c}" ${DL()}`;
  const foot = (x, m) => `<path d="M${x - 11},378 L${x + 11},378 Q${x + 11 + m * 8},392 ${x + 4 + m * 6},396 L${x - 10 - m * 0},396 Q${x - 14},390 ${x - 11},378 Z" ${S}/>`;
  switch (it.shape) {
    case 'strap': return foot(138, -1) + foot(162, 1) + `<path d="M128,382 L148,382 M152,382 L172,382" stroke="${d}" stroke-width="3"/>`;
    case 'sneaker': return foot(138, -1) + foot(162, 1) + `<path d="M126,393 L150,393 M150,393 L174,393" stroke="#fff" stroke-width="4"/><path d="M132,384 L142,382 M158,382 L168,384" ${DL(2)}/>`;
    case 'boots': return `<path d="M128,336 L148,336 L148,396 L124,396 Q122,388 128,380 Z" ${S}/><path d="M152,336 L172,336 L172,380 Q178,388 176,396 L152,396 Z" ${S}/><path d="M128,342 L148,342 M152,342 L172,342" stroke="${d}" stroke-width="4"/>`;
    case 'heel': return [[138, -1], [162, 1]].map(([x, m]) => `<rect x="${x + m * 9 - 2.5}" y="390" width="5" height="11" rx="1.5" fill="${d}" ${DL(2)}/>` +
      `<path d="M${x - 11},374 L${x + 11},374 L${x + 13},388 Q${x + 8},398 ${x},398 Q${x - 8},398 ${x - 13},388 Z" ${S}/>` +
      `<path d="M${x - 8},374 Q${x},384 ${x + 8},374 Z" fill="${DU_SKIN}" ${DL(2)}/><path d="M${x - 7 * m - 3},392 L${x - 7 * m + 3},389" stroke="#fff" stroke-width="2.5" stroke-linecap="round" opacity=".8"/>`).join('');
    case 'ribbon': return foot(138, -1) + foot(162, 1) + `<path d="M132,380 L138,384 L132,388 Z M144,380 L138,384 L144,388 Z M156,380 L162,384 L156,388 Z M168,380 L162,384 L168,388 Z" fill="#fff" ${DL(1.5)}/>`;
  }
  return '';
}
function duAcc(it) {
  const c = duCol(it), d = shade(c, -0.2);
  const S = `fill="${c}" ${DL()}`;
  const gem = (x, y, r) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#ff6fa0" ${DL(1.5)}/>`;
  switch (it.shape) {
    case 'ribbon': return `<path d="M112,70 L82,52 L86,92 Z" ${S}/><path d="M112,70 L142,52 L138,92 Z" ${S}/><circle cx="112" cy="71" r="8" fill="${d}" ${DL(2)}/>`;
    case 'heart': return `<path d="M196,92 C176,78 184,62 196,72 C208,62 216,78 196,92 Z" ${S}/>`;
    case 'tiara': return `<path d="M118,64 L126,40 L138,56 L150,32 L162,56 L174,40 L182,64 Q150,56 118,64 Z" fill="#f6c445" ${DL(2.5)}/>` + gem(150, 48, 5) + gem(128, 52, 3) + gem(172, 52, 3);
    case 'crown': return `<path d="M108,66 L104,22 L128,46 L150,14 L172,46 L196,22 L192,66 Q150,56 108,66 Z" fill="#f6c445" ${DL(2.5)}/><rect x="108" y="56" width="84" height="12" rx="4" fill="${c}" ${DL(2)}/>` + gem(150, 34, 6) + gem(116, 40, 4) + gem(184, 40, 4);
    case 'beret': return `<path d="M92,72 Q100,30 160,34 Q214,40 206,70 Q150,58 92,72 Z" ${S}/><path d="M156,34 L158,24" ${DL(4)}/>`;
    case 'flower': return [0, 1, 2, 3, 4].map(a => `<circle cx="${198 + 11 * Math.cos(a * 1.257 - 1.57)}" cy="${80 + 11 * Math.sin(a * 1.257 - 1.57)}" r="9" ${S}/>`).join('') + `<circle cx="198" cy="80" r="7" fill="#ffd34d" ${DL(2)}/>`;
    case 'brooch': return `<circle cx="168" cy="226" r="15" fill="#f6c445" ${DL(2.5)}/><circle cx="168" cy="226" r="11" ${S}/>` +
      `<circle cx="164" cy="224" r="1.8" fill="${DU_LINE}"/><circle cx="172" cy="224" r="1.8" fill="${DU_LINE}"/><path d="M164,230 Q168,233 172,230" fill="none" ${DL(1.5)}/>` +
      `<path d="M160,214 L157,206 L164,211 Z M176,214 L179,206 L172,211 Z" fill="${c}" ${DL(1.5)}/><circle cx="160" cy="229" r="2" fill="#ff9fb0"/><circle cx="176" cy="229" r="2" fill="#ff9fb0"/>`;
    case 'cat': return `<path d="M98,74 L94,26 L134,56 Z" ${S}/><path d="M202,74 L206,26 L166,56 Z" ${S}/><path d="M102,62 L101,40 L120,56 Z M198,62 L199,40 L180,56 Z" fill="#ffc8da"/>`;
  }
  return '';
}
function duHand(it) {
  const c = duCol(it), d = shade(c, -0.2);
  const S = `fill="${c}" ${DL()}`;
  switch (it.shape) {
    case 'wand': return `<path d="M203,280 L232,202" ${DL(7)}/><path d="M203,280 L232,202" stroke="#fff" stroke-width="3"/><path d="M234,176 L240,192 L257,193 L244,203 L248,220 L234,210 L220,220 L224,203 L211,193 L228,192 Z" fill="${c}" ${DL(2.5)}/><circle cx="234" cy="200" r="4" fill="#fff"/>`;
    case 'bag': return `<path d="M203,276 Q218,268 230,296" fill="none" ${DL(3)}/><rect x="212" y="292" width="36" height="30" rx="8" ${S}/><path d="M212,304 L248,304" stroke="${d}" stroke-width="3"/><circle cx="230" cy="306" r="3.5" fill="#f6c445"/>`;
    case 'balloon': return `<path d="M203,276 Q214,230 232,190" fill="none" stroke="${DU_LINE}" stroke-width="2"/><ellipse cx="236" cy="162" rx="24" ry="29" ${S}/><path d="M228,148 Q232,140 240,140" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M232,190 L240,190 L236,196 Z" fill="${c}" ${DL(1.5)}/>`;
    case 'bouquet': return `<path d="M196,286 L210,252 L226,262 Z" fill="#a6e3a1" ${DL(2)}/>` + [[206, 246], [222, 250], [214, 236], [228, 238], [200, 236]].map(([x, y], k) => `<circle cx="${x}" cy="${y}" r="8" fill="${k % 2 ? c : '#fff'}" ${DL(1.5)}/>`).join('') + `<path d="M204,270 L214,266" stroke="#ff6fa0" stroke-width="5"/>`;
    case 'parasol': return `<path d="M203,282 L222,170" ${DL(4)}/><path d="M164,186 Q222,112 280,190 Q266,180 251,188 Q237,176 222,184 Q207,176 193,188 Q179,178 164,186 Z" ${S}/><path d="M222,128 L222,184" stroke="${d}" stroke-width="2"/>`;
  }
  return '';
}
let _duUid = 0;
// outfit: { hair, top, bottom, dress, shoes, acc, hat, hand, pet, bg } (id) / opt.kira で キラキラ
function charSVG(outfit, opt = {}) {
  const uid = ++_duUid;
  const g = k => outfit[k] ? duItem(outfit[k]) : null;
  const hair = g('hair') || DU_STARTER.hair, top = g('top') || DU_STARTER.top, bottom = g('bottom') || DU_STARTER.bottom;
  const shoes = g('shoes') || DU_STARTER.shoes, dress = g('dress'), acc = g('acc'), hand = g('hand'), bg = g('bg'), hat = g('hat'), pet = g('pet');
  const vb = opt.viewBox || '0 0 300 420';
  let s = `<svg viewBox="${vb}" xmlns="http://www.w3.org/2000/svg" class="chara">`;
  if (bg && !opt.noBg) s += duBg(bg, uid);
  s += `<ellipse cx="150" cy="400" rx="70" ry="9" fill="#000" opacity=".1"/>`;
  s += duHairBack(hair) + duBody();
  if (dress) s += duDress(dress); else s += duBottom(bottom) + duTop(top);
  s += duShoes(shoes) + duHead() + duFace() + duHairFront(hair);
  if (acc) s += duAcc(acc);
  if (hat) s += duHat(hat);
  if (hand) s += duHand(hand);
  if (pet) s += duPet(pet);
  if (opt.kira) s += [[40, 120, 12], [260, 90, 9], [250, 300, 13], [44, 290, 9], [150, 20, 8]].map(([x, y, r]) => `<path d="M${x},${y - r} L${x + r * .3},${y - r * .3} L${x + r},${y} L${x + r * .3},${y + r * .3} L${x},${y + r} L${x - r * .3},${y + r * .3} L${x - r},${y} L${x - r * .3},${y - r * .3} Z" fill="#ffd23f" stroke="#fff" stroke-width="2"/>`).join('');
  return s + '</svg>';
}
// アイテム ひとつの アイコン(ボタンや 一覧用)
const DU_THUMB_VB = { hair: '70 20 160 170', top: '78 170 144 140', bottom: '84 250 132 140', dress: '40 170 220 245', shoes: '108 320 84 84', acc: '70 0 160 120', hat: '50 -10 200 120', pet: '-4 280 128 128', hand: '160 120 120 210', bg: '0 0 300 420' };
function itemSVG(it) {
  const uid = ++_duUid;
  const HAND_VB = { wand: '196 168 70 118', bag: '196 262 60 66', balloon: '188 128 76 170', bouquet: '188 222 50 70', parasol: '160 112 124 176' };
  const HAIR_VB = { afro: '50 15 200 200', explode: '40 0 220 220', mohawk: '60 -6 180 190', softcream: '60 -6 180 190', horns: '60 -6 180 190', bedhead: '56 6 188 190', braid: '60 40 180 260', drill: '56 40 188 240', superlong: '50 30 200 390', side: '44 30 190 240' };
  const vb = it.cat === 'hand' ? HAND_VB[it.shape] : it.cat === 'hair' && HAIR_VB[it.shape] ? HAIR_VB[it.shape] : it.cat === 'acc' && it.shape === 'brooch' ? '128 186 80 80' : DU_THUMB_VB[it.cat];
  let s = `<svg viewBox="${vb}" xmlns="http://www.w3.org/2000/svg">`;
  const ghost = `<g opacity=".25">${duBody()}${duHead()}</g>`;
  if (it.cat === 'bg') s += duBg(it, uid);
  else if (it.cat === 'hair') s += duHairBack(it) + duHead() + duFace() + duHairFront(it);
  else if (it.cat === 'acc') s += `<g opacity=".25">${it.shape === 'brooch' ? duBody() : duHead()}</g>` + duAcc(it);
  else if (it.cat === 'hat') s += `<g opacity=".25">${duHead()}</g>` + duHat(it);
  else if (it.cat === 'pet') s += duPet(it);
  else if (it.cat === 'hand') s += duHand(it);
  else if (it.cat === 'top') s += ghost + duTop(it);
  else if (it.cat === 'bottom') s += ghost + duBottom(it);
  else if (it.cat === 'dress') s += ghost + duDress(it);
  else if (it.cat === 'shoes') s += `<g opacity=".25">${duBody()}</g>` + duShoes(it);
  return s + '</svg>';
}
// プレゼントの はこ(バトルの かわり)
function giftSVG(color, open) {
  const c = color || '#ff8fb8', d = shade(c, -0.2);
  if (open) return `<svg viewBox="0 0 200 200"><path d="M40,90 L160,90 L152,182 L48,182 Z" fill="${c}" ${DL(4)}/><rect x="90" y="90" width="20" height="92" fill="#fff6c9"/><path d="M30,60 L170,60 L166,84 L34,84 Z" fill="${d}" ${DL(4)} transform="rotate(-25 40 80) translate(-10 -30)"/></svg>`;
  return `<svg viewBox="0 0 200 200"><ellipse cx="100" cy="188" rx="64" ry="8" fill="#000" opacity=".1"/><path d="M40,90 L160,90 L156,182 L44,182 Z" fill="${c}" ${DL(4)}/><rect x="32" y="66" width="136" height="30" rx="6" fill="${d}" ${DL(4)}/>
    <rect x="90" y="66" width="20" height="116" fill="#fff6c9" ${DL(3)}/><path d="M100,66 Q70,30 60,52 Q56,68 100,66 Z M100,66 Q130,30 140,52 Q144,68 100,66 Z" fill="#fff6c9" ${DL(3)}/>
    <text x="100" y="150" text-anchor="middle" font-size="48" font-weight="900" fill="#fff" font-family="sans-serif" stroke="${DU_LINE}" stroke-width="2">?</text></svg>`;
}
