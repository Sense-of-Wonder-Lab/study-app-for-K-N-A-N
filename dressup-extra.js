'use strict';
/* ========== きせかえ: あとから ふえた アイテム ==========
 * rewards.js より あとに よみこむ(先に DU_SHAPES を ふやすと、いままでの ごほうびの 中みが かわってしまうため)
 * ここの アイテムは「ごほうびを ぜんぶ あつめた レベル」で もう一度 目標を クリアすると、上から じゅんに 1こずつ もらえる
 */
Object.assign(DU_SHAPES.hair, {
  short: 'ショートカット', braid: 'みつあみ', outflip: 'そとハネボブ', side: 'サイドテール', drill: 'たてロール',
  afro: 'アフロ', mohawk: 'モヒカン', chonmage: 'ちょんまげ', superlong: 'ちょうロングヘア', softcream: 'ソフトクリームヘア',
  horns: 'ツノヘア', explode: 'ばくはつヘア', bedhead: 'ねぐせヘア',
});
Object.assign(DU_SHAPES.dress, { kimono: 'きもの', sari: 'サリー', china: 'チャイナふく', maid: 'メイドふく', miko: 'みこさん', doctor: 'おいしゃさん', police: 'おまわりさん' });
Object.assign(DU_SHAPES.dress, {
  sarafan: 'サラファン(ロシア)', kilt: 'キルト(スコットランド)', dirndl: 'ディアンドル(ドイツ)', marine: 'マリンルック(フランス)', cowgirl: 'カウガール(アメリカ)',
  astronaut: 'うちゅうひこうし', fire: 'しょうぼうし', ninja: 'にんじゃ', pirate: 'かいぞく', idol: 'アイドル', patissier: 'パティシエ',
});
Object.assign(DU_SHAPES.hand, { mic: 'マイク' });
Object.assign(DU_SHAPES.bottom, { maxi: 'ロングスカート' });
Object.assign(DU_SHAPES.shoes, { heel: 'ハイヒール' });
Object.assign(DU_SHAPES.acc, { brooch: 'にこにこブローチ' });
DU_SHAPES.hat = { straw: 'むぎわらぼうし', knit: 'ニットぼう', cap: 'キャップ', nurse: 'ナースキャップ', police: 'けいさつの ぼうし', chef: 'コックぼう', ribbonhat: 'リボンの ぼうし', witch: 'まじょの ぼうし' };
Object.assign(DU_SHAPES.hat, { kokoshnik: 'ココシニク', cowboy: 'カウボーイハット', fire: 'しょうぼうの ヘルメット', pirate: 'かいぞくの ぼうし', ninja: 'にんじゃずきん', helmet: 'うちゅうの ヘルメット' });
DU_SHAPES.pet = { dog: 'いぬ', cat: 'ねこ', rabbit: 'うさぎ', wani: 'ワニ', penguin: 'ペンギン', tako: 'タコ' };
// 2026-11 ついか: ようせい(おとも)・にじの はいけい・きんメッシュ(くろかみに きんの すじ)
Object.assign(DU_SHAPES.pet, { fsun: 'たいようの ようせい', frain: 'あめの ようせい', fleaf: 'くさの ようせい' });
DU_SHAPES.bg.rainbow = 'にじ';
DU_HAIR.mesh = ['きんメッシュ', '#3b3140'];

// もらえる じゅんばん(しゅるいが まざるように)。id は かえない こと(ほぞんデータの キー)
const DU_BONUS = [
  ['hair', 'short', 'brown'], ['dress', 'kimono', 'pink'], ['hat', 'straw', 'red'], ['pet', 'dog', 'orange'],
  ['hair', 'braid', 'black'], ['dress', 'maid', 'navy'], ['shoes', 'heel', 'red'], ['hair', 'afro', 'brown'],
  ['hat', 'witch', 'purple'], ['dress', 'china', 'red'], ['pet', 'wani', 'mint'], ['hair', 'side', 'blond'],
  ['bottom', 'maxi', 'lavender'], ['hat', 'knit', 'sky'], ['dress', 'miko', 'red'], ['hair', 'chonmage', 'black'],
  ['acc', 'brooch', 'pink'], ['pet', 'cat', 'white'], ['hair', 'outflip', 'aqua'], ['dress', 'doctor', 'sky'],
  ['hat', 'cap', 'red'], ['hair', 'softcream', 'pinkh'], ['dress', 'sari', 'orange'], ['pet', 'rabbit', 'white'],
  ['hair', 'drill', 'blond'], ['hat', 'chef', 'white'], ['hair', 'mohawk', 'red'], ['dress', 'police', 'navy'],
  ['hat', 'police', 'navy'], ['pet', 'penguin', 'sky'], ['hair', 'superlong', 'violet'], ['hat', 'nurse', 'red'],
  ['hair', 'horns', 'red'], ['hat', 'ribbonhat', 'sakura'], ['hair', 'explode', 'black'], ['pet', 'tako', 'red'],
  ['hair', 'bedhead', 'brown'],
  // 2026-11 ついか: せかいの いしょう・コスプレ
  ['dress', 'sarafan', 'red'], ['hat', 'kokoshnik', 'red'], ['dress', 'ninja', 'navy'], ['hat', 'ninja', 'navy'],
  ['dress', 'kilt', 'red'], ['dress', 'idol', 'pink'], ['hand', 'mic', 'pink'], ['dress', 'dirndl', 'mint'],
  ['dress', 'astronaut', 'sky'], ['hat', 'helmet', 'sky'], ['dress', 'marine', 'navy'], ['dress', 'pirate', 'navy'],
  ['hat', 'pirate', 'navy'], ['dress', 'cowgirl', 'red'], ['hat', 'cowboy', 'orange'], ['dress', 'fire', 'navy'],
  ['hat', 'fire', 'red'], ['dress', 'patissier', 'pink'],
  // 2026-11 ついか: ようせい・にじ・メッシュ(4つめは なまえ)
  ['pet', 'fsun', 'orange', 'たいようの ようせい'], ['hair', 'short', 'mesh'], ['bg', 'rainbow', 'sky', 'にじ'],
  ['pet', 'frain', 'sky', 'あめの ようせい'], ['hair', 'pony', 'mesh'], ['pet', 'fleaf', 'mint', 'くさの ようせい'],
];
DU_BONUS.forEach(([cat, shape, color, name]) => {
  const pal = cat === 'hair' ? DU_HAIR : DU_COLORS;
  if (!DU_SHAPES[cat][shape] || !pal[color]) throw new Error('Invalid bonus design: ' + cat + shape + color);
  // id は 'x_しゅるい_かたち'。おなじ かたちが 2つめ以降なら 色も つける(いままでの id は かわらない)
  let id = 'x_' + cat + '_' + shape;
  if (DU_ITEMS.some(x => x.id === id)) id += '_' + color;
  DU_ITEMS.push({ id, level: 'bonus', bonus: true, cat, shape, color, name: name || `${pal[color][0]}の ${DU_SHAPES[cat][shape]}` });
});
// まだ もっていない ボーナスアイテムの さいしょの 1こ(ぜんぶ もっていたら null)
function nextBonusItem(closet) { return DU_ITEMS.find(x => x.bonus && !closet[x.id]) || null; }


/* ---------- 2026-11 ついか ぶんの え ---------- */
// きんメッシュ: くろかみの 一部の ふさだけ きんいろに する(かみの かたちで きりぬき、ねもとは ぼかす)
const DU_MESH = '#f1c86a';
let _duMeshN = 0;
const DU_MESH_PATH = {
  bangs: 'M88,128 Q84,56 150,54 Q216,56 212,128 Q206,108 198,96 L188,112 L176,92 L162,110 L150,90 L138,110 L124,92 L112,112 L102,96 Q94,108 88,128 Z',
  sideL: 'M90,110 Q84,140 92,148 Q100,136 102,120 Z',
  pony: 'M196,72 Q252,70 250,140 Q256,200 236,250 Q228,262 222,246 Q234,190 220,140 Q214,110 190,96 Z',
};
// shapes: きりぬく かみの かたち / strands: きんいろに する ふさ / y0〜y1: ねもとの ぼかし
function duMesh(shapes, strands, y0, y1) {
  const n = ++_duMeshN, ds = shapes.map(k => DU_MESH_PATH[k]);
  return `<defs><clipPath id="mc${n}">${ds.map(d => `<path d="${d}"/>`).join('')}</clipPath>` +
    `<linearGradient id="mg${n}" gradientUnits="userSpaceOnUse" x1="0" y1="${y0}" x2="0" y2="${y1}"><stop offset="0" stop-color="${DU_MESH}" stop-opacity="0"/><stop offset="1" stop-color="${DU_MESH}"/></linearGradient></defs>` +
    `<g clip-path="url(#mc${n})">${strands.map(d => `<path d="${d}" fill="url(#mg${n})"/>`).join('')}</g>` +
    ds.map(d => `<path d="${d}" fill="none" ${DL()}/>`).join('');
}
const _duHairBack0 = duHairBack, _duHairFront0 = duHairFront, _duBg0 = duBg, _duPet0 = duPet;
duHairBack = function (it) {
  let s = _duHairBack0(it);
  if (it.color === 'mesh' && it.shape === 'pony') s += duMesh(['pony'], ['M206,82 L222,76 Q250,150 240,256 L228,256 Q238,160 206,82 Z'], 80, 120);
  return s;
};
duHairFront = function (it) {
  let s = _duHairFront0(it);
  if (it.color === 'mesh') {
    const strands = ['M143,54 L149,54 L147,116 L127,116 Z', 'M167,56 L173,56 L198,118 L179,118 Z'];
    if (it.shape === 'short') strands.push('M84,104 L96,104 L100,152 L84,152 Z');
    s += duMesh(it.shape === 'short' ? ['bangs', 'sideL'] : ['bangs'], strands, 58, 84);
  }
  return s;
};

// にじの はいけい
duBg = function (it, uid) {
  if (it.shape !== 'rainbow') return _duBg0(it, uid);
  const c = duCol(it);
  let s = `<defs><linearGradient id="bg${uid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${shade(c, 0.45)}"/><stop offset="1" stop-color="#ffffff"/></linearGradient></defs>`;
  s += `<rect x="0" y="0" width="300" height="420" fill="url(#bg${uid})"/>`;
  ['#ff6f7d', '#ffb170', '#ffe17d', '#8fe0a0', '#93cbff', '#7f8cf0', '#bba6ff'].forEach((col, k) => {
    const r = 200 - k * 13;
    s += `<path d="M${150 - r},330 A${r},${r} 0 0 1 ${150 + r},330" fill="none" stroke="${col}" stroke-width="13" opacity=".9"/>`;
  });
  const cloud = (x, y) => `<g fill="#fff"><ellipse cx="${x}" cy="${y}" rx="40" ry="18"/><ellipse cx="${x - 18}" cy="${y - 10}" rx="20" ry="16"/><ellipse cx="${x + 16}" cy="${y - 12}" rx="24" ry="18"/></g>`;
  return s + cloud(-2, 330) + cloud(302, 330) + `<rect y="360" width="300" height="60" fill="#a6e3a1"/>`;
};

// ようせい(おとも)
duPet = function (it) {
  if (!/^f(sun|rain|leaf)$/.test(it.shape)) return _duPet0(it);
  const c = duCol(it), d = shade(c, -0.25), lt = shade(c, 0.55);
  const S = `fill="${c}" ${DL(2)}`, kind = it.shape;
  const cx = 56, hy = 314; // あたまの まんなか
  let s = `<ellipse cx="56" cy="404" rx="26" ry="4" fill="#000" opacity=".08"/>`;
  // はね
  if (kind === 'frain') {
    const wing = m => {
      const x = v => cx + m * v;
      let w = `<path d="M${x(4)},338 Q${x(30)},312 ${x(54)},322 Q${x(52)},346 ${x(6)},350 Z" fill="#ffffff" ${DL(2)} opacity=".95"/>`;
      [[18, 334], [30, 330], [42, 330]].forEach(([v, y]) => { w += `<path d="M${x(v - 6)},${y + 4} Q${x(v)},${y + 10} ${x(v + 6)},${y + 4}" fill="none" stroke="${DU_LINE}" stroke-width="1.3"/>`; });
      return w;
    };
    s += wing(-1) + wing(1);
  } else {
    const wf = `fill="${lt}" ${DL(2)} opacity=".9"`;
    s += `<ellipse cx="${cx - 24}" cy="334" rx="22" ry="12" ${wf} transform="rotate(-28 ${cx - 24} 334)"/><ellipse cx="${cx + 24}" cy="334" rx="22" ry="12" ${wf} transform="rotate(28 ${cx + 24} 334)"/>`;
    s += `<ellipse cx="${cx - 18}" cy="358" rx="15" ry="9" ${wf} transform="rotate(24 ${cx - 18} 358)"/><ellipse cx="${cx + 18}" cy="358" rx="15" ry="9" ${wf} transform="rotate(-24 ${cx + 18} 358)"/>`;
  }
  // うしろがみ
  const hairC = kind === 'frain' ? '#3b3140' : '#8a5a3c', H = `fill="${hairC}" ${DL(2)}`;
  if (kind === 'frain') s += `<path d="M${cx - 16},310 Q${cx - 18},292 ${cx},294 Q${cx + 18},292 ${cx + 16},310 L${cx + 18},360 L${cx - 18},360 Z" ${H}/>`;
  // あし
  const leg = (x1, y1, x2, y2) => `<path d="M${x1},${y1} L${x2},${y2}" stroke="${DU_LINE}" stroke-width="6" stroke-linecap="round"/><path d="M${x1},${y1} L${x2},${y2}" stroke="${DU_SKIN}" stroke-width="3" stroke-linecap="round"/>`;
  const foot = (x, y) => `<ellipse cx="${x}" cy="${y}" rx="4.5" ry="3.5" fill="#fff" ${DL(1.5)}/>`;
  if (kind === 'fleaf') s += leg(cx - 5, 368, cx - 6, 394) + foot(cx - 6, 396) + leg(cx + 5, 368, cx + 14, 382) + leg(cx + 14, 382, cx + 24, 376) + foot(cx + 26, 375);
  else s += leg(cx - 5, 370, cx - 5, 394) + leg(cx + 5, 370, cx + 5, 394) + foot(cx - 6, 396) + foot(cx + 6, 396);
  // うで
  const arm = (x2, y2) => leg(cx - 8, 340, cx - 8 - x2, y2) + leg(cx + 8, 340, cx + 8 + x2, y2);
  s += kind === 'fsun' ? arm(18, 326) : arm(12, 356);
  // ふく
  const flower = (x, y, f) => [0, 1, 2, 3, 4].map(a => `<circle cx="${(x + 3 * Math.cos(a * 1.257)).toFixed(1)}" cy="${(y + 3 * Math.sin(a * 1.257)).toFixed(1)}" r="2.2" fill="${f}"/>`).join('') + `<circle cx="${x}" cy="${y}" r="1.6" fill="#ffd34d"/>`;
  const drop = (x, y) => `<path d="M${x},${y - 4} Q${x + 3},${y + 1} ${x},${y + 3} Q${x - 3},${y + 1} ${x},${y - 4} Z" fill="#ffffff" stroke="${d}" stroke-width="1"/>`;
  if (kind === 'fleaf') {
    s += `<path d="M${cx - 9},330 L${cx + 9},330 L${cx + 11},356 L${cx + 16},370 L${cx - 16},370 L${cx - 11},356 Z" ${S}/>` + flower(cx, 340, '#fff') + flower(cx, 350, '#ffc8da') + flower(cx + 8, 364, '#fff');
  } else if (kind === 'frain') {
    s += `<path d="M${cx - 9},330 L${cx + 9},330 L${cx + 12},352 L${cx + 16},382 L${cx - 16},382 L${cx - 12},352 Z" ${S}/>` + drop(cx, 338) + drop(cx, 346) + drop(cx + 8, 374) + drop(cx + 2, 376);
    s += `<path d="M${cx - 18},312 L${cx - 19},352 L${cx - 14},352 L${cx - 14},314 Z M${cx + 18},312 L${cx + 19},352 L${cx + 14},352 L${cx + 14},314 Z" fill="${hairC}"/>`;
  } else {
    s += `<path d="M${cx - 9},330 L${cx + 9},330 L${cx + 10},360 L${cx - 10},360 Z" fill="#fff" ${DL(2)}/>`;
    s += `<path d="M${cx - 9},342 L${cx + 9},342 L${cx + 10},360 L${cx + 12},372 L${cx + 2},372 L${cx},366 L${cx - 2},372 L${cx - 12},372 L${cx - 10},360 Z" ${S}/><path d="M${cx - 7},342 L${cx - 7},332 M${cx + 7},342 L${cx + 7},332" stroke="${d}" stroke-width="2.5"/>`;
    s += `<circle cx="${cx}" cy="352" r="4" fill="#ffd34d" ${DL(1.2)}/>` + [0, 1, 2, 3, 4, 5, 6, 7].map(a => { const t = a * Math.PI / 4; return `<path d="M${(cx + 6 * Math.cos(t)).toFixed(1)},${(352 + 6 * Math.sin(t)).toFixed(1)} L${(cx + 8.5 * Math.cos(t)).toFixed(1)},${(352 + 8.5 * Math.sin(t)).toFixed(1)}" stroke="#f0a020" stroke-width="1.5"/>`; }).join('');
  }
  // かお
  s += `<circle cx="${cx}" cy="${hy}" r="15" fill="${DU_SKIN}" ${DL(2)}/>`;
  if (kind === 'fsun') s += `<path d="M${cx - 9},${hy - 1} Q${cx - 6},${hy - 5} ${cx - 3},${hy - 1} M${cx + 3},${hy - 1} Q${cx + 6},${hy - 5} ${cx + 9},${hy - 1}" fill="none" ${DL(1.6)}/><path d="M${cx - 6},${hy + 4} Q${cx},${hy + 12} ${cx + 6},${hy + 4} Z" fill="#ff8f8f" ${DL(1.5)}/>`;
  else s += [cx - 6, cx + 6].map(x => `<ellipse cx="${x}" cy="${hy}" rx="2.6" ry="3.2" fill="#3b3140"/><circle cx="${x + 0.8}" cy="${hy - 1.2}" r="1" fill="#fff"/>`).join('') + `<path d="M${cx - 3},${hy + 6} Q${cx},${hy + 9} ${cx + 3},${hy + 6}" fill="none" ${DL(1.5)}/>`;
  s += `<ellipse cx="${cx - 10}" cy="${hy + 5}" rx="3" ry="2" fill="#ff9fb0" opacity=".6"/><ellipse cx="${cx + 10}" cy="${hy + 5}" rx="3" ry="2" fill="#ff9fb0" opacity=".6"/>`;
  // まえがみ・かみがた
  if (kind === 'fleaf') {
    s += `<circle cx="${cx}" cy="${hy - 22}" r="9" ${H}/><path d="M${cx - 15},${hy - 2} Q${cx - 16},${hy - 17} ${cx},${hy - 16} Q${cx + 16},${hy - 17} ${cx + 15},${hy - 2} Q${cx + 8},${hy - 10} ${cx},${hy - 9} Q${cx - 8},${hy - 10} ${cx - 15},${hy - 2} Z" ${H}/>`;
    s += `<path d="M${cx},${hy - 15} L${cx - 10},${hy - 21} L${cx - 10},${hy - 9} Z M${cx},${hy - 15} L${cx + 10},${hy - 21} L${cx + 10},${hy - 9} Z" fill="#8fe0a0" ${DL(1.5)}/><circle cx="${cx}" cy="${hy - 15}" r="2.5" fill="#5cc27a" ${DL(1.2)}/>`;
  } else if (kind === 'frain') {
    s += `<path d="M${cx - 15},${hy + 2} Q${cx - 17},${hy - 17} ${cx},${hy - 16} Q${cx + 17},${hy - 17} ${cx + 15},${hy + 2} Q${cx + 12},${hy - 8} ${cx + 4},${hy - 8} L${cx},${hy - 5} L${cx - 4},${hy - 8} Q${cx - 12},${hy - 8} ${cx - 15},${hy + 2} Z" ${H}/>`;
  } else {
    s += `<path d="M${cx - 15},${hy - 1} Q${cx - 16},${hy - 17} ${cx},${hy - 16} Q${cx + 16},${hy - 17} ${cx + 15},${hy - 1} Q${cx + 9},${hy - 9} ${cx},${hy - 8} Q${cx - 9},${hy - 9} ${cx - 15},${hy - 1} Z" ${H}/>`;
    [-1, 1].forEach(m => { for (let k = 0; k < 4; k++) s += `<circle cx="${cx + m * (19 + (k % 2) * 2)}" cy="${hy - 2 + k * 7}" r="4.5" ${H}/>`; });
  }
  // キラキラ
  s += [[14, 300, 4], [100, 310, 3.5], [96, 372, 3]].map(([x, y, r]) => `<path d="M${x},${y - r} L${x + r * .3},${y - r * .3} L${x + r},${y} L${x + r * .3},${y + r * .3} L${x},${y + r} L${x - r * .3},${y + r * .3} L${x - r},${y} L${x - r * .3},${y - r * .3} Z" fill="#ffd23f"/>`).join('');
  return s;
};
