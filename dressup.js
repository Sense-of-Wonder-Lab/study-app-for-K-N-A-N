'use strict';
/* ========== きせかえ ==========
 * キャラクターは viewBox 0 0 300 420 の SVG を レイヤーで かさねて かく
 * はいけい → うしろがみ → からだ → ボトムス → トップス(または ワンピース) → くつ → かお → まえがみ → アクセ → もちもの
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
  { k: 'hand', name: 'もちもの', icon: '🪄' }, { k: 'bg', name: 'はいけい', icon: '🌈' },
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
// アイテムを つくる: レベルごとに 4こ(4こめは とくべつ)
const DU_LEVELS = (typeof CALC_LEVELS !== 'undefined' ? CALC_LEVELS.map(l => l.id) : []).concat(['q1', 'q2', 'q3', 'q4']);
const DU_NORMAL_CATS = ['top', 'bottom', 'acc', 'hair', 'shoes', 'hand', 'bg', 'top', 'dress', 'acc', 'bottom', 'hand'];
const DU_SPECIAL = [['dress', 'princess'], ['acc', 'tiara'], ['hand', 'wand'], ['bg', 'castle'], ['acc', 'crown'], ['dress', 'frill']];
const DU_ITEMS = [];
const DU_STARTER = {
  hair: { id: 's_hair', cat: 'hair', shape: 'long', color: 'brown', name: 'ちゃいろの ロングヘア', starter: true },
  top: { id: 's_top', cat: 'top', shape: 'tee', color: 'white', name: 'しろの Tシャツ', starter: true },
  bottom: { id: 's_bottom', cat: 'bottom', shape: 'skirt', color: 'sky', name: 'みずいろの スカート', starter: true },
  shoes: { id: 's_shoes', cat: 'shoes', shape: 'strap', color: 'pink', name: 'ピンクの ストラップシューズ', starter: true },
};
(function makeItems() {
  const r = seeded(hashStr('kisekae-v1'));
  const used = new Set(Object.values(DU_STARTER).map(s => s.cat + s.shape + s.color));
  let n = 0;
  DU_LEVELS.forEach((lv, li) => {
    for (let i = 0; i < 4; i++) {
      let cat, shape, color;
      if (i === 3) {
        [cat, shape] = DU_SPECIAL[li % DU_SPECIAL.length];
        const cs = Object.keys(cat === 'hair' ? DU_HAIR : DU_COLORS);
        do { color = cs[Math.floor(r() * cs.length)]; } while (used.has(cat + shape + color));
      } else {
        cat = DU_NORMAL_CATS[n++ % DU_NORMAL_CATS.length];
        const shapes = Object.keys(DU_SHAPES[cat]).filter(s => !(cat === 'acc' && s === 'crown') && !(cat === 'dress' && s === 'princess') && !(cat === 'bg' && s === 'castle'));
        const cs = Object.keys(cat === 'hair' ? DU_HAIR : DU_COLORS);
        do { shape = shapes[Math.floor(r() * shapes.length)]; color = cs[Math.floor(r() * cs.length)]; } while (used.has(cat + shape + color));
      }
      used.add(cat + shape + color);
      const cname = (cat === 'hair' ? DU_HAIR : DU_COLORS)[color][0];
      DU_ITEMS.push({ id: lv + '_d' + i, level: lv, cat, shape, color, special: i === 3, name: `${cname}の ${DU_SHAPES[cat][shape]}` });
    }
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
  return '';
}
function duHairFront(it) {
  const c = duCol(it), hi = shade(c, 0.35);
  const S = `fill="${c}" ${DL()}`;
  let s = '';
  if (it.shape === 'bun') s += `<circle cx="106" cy="62" r="24" ${S}/><circle cx="194" cy="62" r="24" ${S}/>`;
  // まえがみ(ぎざぎざ)と よこの かみ
  s += `<path d="M88,128 Q84,56 150,54 Q216,56 212,128 Q206,108 198,96 L188,112 L176,92 L162,110 L150,90 L138,110 L124,92 L112,112 L102,96 Q94,108 88,128 Z" ${S}/>`;
  if (it.shape !== 'pony') s += `<path d="M90,110 Q84,140 92,172 Q100,160 102,120 Z" ${S}/><path d="M210,110 Q216,140 208,172 Q200,160 198,120 Z" ${S}/>`;
  s += `<path d="M112,72 Q130,62 150,62" fill="none" stroke="${hi}" stroke-width="5" stroke-linecap="round" opacity=".8"/>`;
  if (it.shape === 'twin') s += `<circle cx="98" cy="100" r="8" fill="#ff6f9a" ${DL(2)}/><circle cx="202" cy="100" r="8" fill="#ff6f9a" ${DL(2)}/>`;
  if (it.shape === 'pony') s += `<circle cx="198" cy="86" r="8" fill="#ff6f9a" ${DL(2)}/>`;
  return s;
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
    case 'princess': return duSleeves(c, 'puff') + bodice +
      `<path d="M120,262 Q150,272 180,262 Q236,300 248,392 Q150,410 52,392 Q64,300 120,262 Z" ${S}/>` +
      `<path d="M120,264 Q100,330 112,398 M150,272 L150,404 M180,264 Q200,330 188,398" stroke="${d}" stroke-width="3" fill="none" opacity=".6"/>` +
      `<path d="M52,392 ${[0, 1, 2, 3, 4, 5, 6, 7].map(k => `Q${64 + k * 24.5},${414} ${76.5 + k * 24.5},${394}`).join(' ')}" fill="${lt}" ${DL(2.5)}/>` +
      `<path d="M138,206 L150,216 L162,206 L158,224 L150,218 L142,224 Z" fill="${lt}" ${DL(2)}/>` +
      [[100, 330], [196, 320], [150, 360], [122, 376], [180, 372]].map(([x, y]) => `<path d="M${x},${y - 6} L${x + 2},${y - 2} L${x + 6},${y} L${x + 2},${y + 2} L${x},${y + 6} L${x - 2},${y + 2} L${x - 6},${y} L${x - 2},${y - 2} Z" fill="#fff"/>`).join('');
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
// outfit: { hair, top, bottom, dress, shoes, acc, hand, bg } (id) / opt.kira で キラキラ
function charSVG(outfit, opt = {}) {
  const uid = ++_duUid;
  const g = k => outfit[k] ? duItem(outfit[k]) : null;
  const hair = g('hair') || DU_STARTER.hair, top = g('top') || DU_STARTER.top, bottom = g('bottom') || DU_STARTER.bottom;
  const shoes = g('shoes') || DU_STARTER.shoes, dress = g('dress'), acc = g('acc'), hand = g('hand'), bg = g('bg');
  const vb = opt.viewBox || '0 0 300 420';
  let s = `<svg viewBox="${vb}" xmlns="http://www.w3.org/2000/svg" class="chara">`;
  if (bg && !opt.noBg) s += duBg(bg, uid);
  s += `<ellipse cx="150" cy="400" rx="70" ry="9" fill="#000" opacity=".1"/>`;
  s += duHairBack(hair) + duBody();
  if (dress) s += duDress(dress); else s += duBottom(bottom) + duTop(top);
  s += duShoes(shoes) + duHead() + duFace() + duHairFront(hair);
  if (acc) s += duAcc(acc);
  if (hand) s += duHand(hand);
  if (opt.kira) s += [[40, 120, 12], [260, 90, 9], [250, 300, 13], [44, 290, 9], [150, 20, 8]].map(([x, y, r]) => `<path d="M${x},${y - r} L${x + r * .3},${y - r * .3} L${x + r},${y} L${x + r * .3},${y + r * .3} L${x},${y + r} L${x - r * .3},${y + r * .3} L${x - r},${y} L${x - r * .3},${y - r * .3} Z" fill="#ffd23f" stroke="#fff" stroke-width="2"/>`).join('');
  return s + '</svg>';
}
// アイテム ひとつの アイコン(ボタンや 一覧用)
const DU_THUMB_VB = { hair: '70 20 160 170', top: '78 170 144 140', bottom: '84 250 132 140', dress: '40 170 220 245', shoes: '108 320 84 84', acc: '70 0 160 120', hand: '160 120 120 210', bg: '0 0 300 420' };
function itemSVG(it) {
  const uid = ++_duUid;
  const HAND_VB = { wand: '196 168 70 118', bag: '196 262 60 66', balloon: '188 128 76 170', bouquet: '188 222 50 70', parasol: '160 112 124 176' };
  const vb = it.cat === 'hand' ? HAND_VB[it.shape] : DU_THUMB_VB[it.cat];
  let s = `<svg viewBox="${vb}" xmlns="http://www.w3.org/2000/svg">`;
  const ghost = `<g opacity=".25">${duBody()}${duHead()}</g>`;
  if (it.cat === 'bg') s += duBg(it, uid);
  else if (it.cat === 'hair') s += duHairBack(it) + duHead() + duFace() + duHairFront(it);
  else if (it.cat === 'acc') s += `<g opacity=".25">${duHead()}</g>` + duAcc(it);
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
