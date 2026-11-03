'use strict';
/* ========== かっこいい キャラクター(ヒーロー) ==========
 * まだ どの レベルにも つないでいない。heroSVG(種類, { pal: 色の番号, boss: true }) で かく
 * viewBox 0 0 200 200(かいじゅうと おなじ)
 */
const HERO_LINE = '#2b2230';
const HL = (w = 4) => `stroke="${HERO_LINE}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;
function hshade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  const f = c => Math.max(0, Math.min(255, Math.round(c + (amt < 0 ? c * amt : (255 - c) * amt))));
  return '#' + [f(n >> 16), f(n >> 8 & 255), f(n & 255)].map(x => x.toString(16).padStart(2, '0')).join('');
}
// 種類ごとの 色(4しゅるい。いちばん後ろは ボス用の こい色)
const HERO_TYPES = {
  dragon:   { name: 'ドラゴン',      weapon: 'sword',   pals: ['#e8473d', '#3d8be8', '#2fb36b', '#3a3550'] },
  eagle:    { name: 'イーグル',      weapon: 'spear',   pals: ['#9a6a3e', '#4a6fb5', '#c9a03a', '#3b3b46'] },
  shark:    { name: 'シャーク',      weapon: 'trident', pals: ['#5b8fb8', '#4a5d7a', '#3fa7a0', '#2c3a5a'] },
  tiger:    { name: 'タイガー',      weapon: 'katana',  pals: ['#f29a2e', '#e9e3d8', '#d9b23a', '#5a4a6a'] },
  lion:     { name: 'ライオン',      weapon: 'bigsword', pals: ['#e9b44c', '#d98a3a', '#e3d6b8', '#6a3b2a'] },
  trex:     { name: 'ティラノ',      weapon: 'axe',     pals: ['#5aa851', '#8a6ad0', '#d0743a', '#384a32'] },
  robot:    { name: 'ロボ',          weapon: 'laser',   pals: ['#8fa3b8', '#e0503f', '#3f7fe0', '#3b3f4a'] },
  wolf:     { name: 'ウルフ忍者',    weapon: 'kunai',   pals: ['#8e96a6', '#5a5f70', '#c4a27a', '#2e3040'] },
  beetle:   { name: 'カブト',        weapon: 'lance',   pals: ['#7a4a2a', '#2f5f8f', '#2f8f4f', '#1f1f2a'] },
  trike:    { name: 'トリケラ',      weapon: 'hammer',  pals: ['#c9813a', '#4f8fa8', '#8fae4a', '#4a3a5a'] },
  stego:    { name: 'ステゴ',        weapon: 'mace',    pals: ['#6aa86a', '#c98a4a', '#5a8ac0', '#3a4a3a'] },
  ptera:    { name: 'プテラ',        weapon: 'bow',     pals: ['#c07a4a', '#7a8ac8', '#5aa88a', '#4a3040'] },
  spino:    { name: 'スピノ',        weapon: 'spear',   pals: ['#4a9a8a', '#c0504a', '#8a7ac0', '#2a3a3a'] },
  stag:     { name: 'クワガタ',      weapon: 'katana',  pals: ['#4a3a30', '#3a5a8a', '#8a3a2a', '#1a1a22'] },
  mantis:   { name: 'カマキリ',      weapon: 'scythe',  pals: ['#6abf4a', '#c0a83a', '#4aa8a0', '#3a5a2a'] },
  scorpion: { name: 'サソリ',        weapon: 'spear',   pals: ['#c0603a', '#5a4a8a', '#c0a050', '#2a1a2a'] },
  samurai:  { name: 'サムライ',      weapon: 'katana',  pals: ['#c0403a', '#3a5aa0', '#3a8a5a', '#2a2a3a'], human: 1 },
  ninja:    { name: 'ニンジャ',      weapon: 'kunai',   pals: ['#3a3550', '#3a5a8a', '#8a3a3a', '#1a1a22'], human: 1 },
  oni:      { name: 'オニ',          weapon: 'kanabo',  pals: ['#e0503a', '#4a7ac0', '#e0b030', '#5a2a5a'] },
  tengu:    { name: 'テング',        weapon: 'fan',     pals: ['#d84a3a', '#5a7a5a', '#8a5ac0', '#3a2a2a'] },
  trainbot: { name: 'トレインロボ',  weapon: 'hammer',  pals: ['#3fa860', '#e0503f', '#3f7fe0', '#2a3a4a'], robo: 1 },
  policebot:{ name: 'ポリスロボ',    weapon: 'laser',   pals: ['#f2f2f2', '#3f7fe0', '#e0a03f', '#2a2a30'], robo: 1 },
  tankbot:  { name: 'タンクロボ',    weapon: 'cannon',  pals: ['#6a7a4a', '#a08a5a', '#5a6a8a', '#33382a'], robo: 1 },
  phoenix:  { name: 'フェニックス',  weapon: 'firesword', pals: ['#f0702a', '#3a9af0', '#f0c030', '#7a2a8a'] },
  cerberus: { name: 'ケルベロス',    weapon: 'axe',     pals: ['#5a5068', '#a05a3a', '#4a6a8a', '#2a1a2a'] },
  kraken:   { name: 'クラーケン',    weapon: 'trident', pals: ['#c05a8a', '#5a6ac0', '#3a9a7a', '#3a2a4a'] },
  alien:    { name: 'エイリアン',    weapon: 'raygun',  pals: ['#7ad06a', '#a08ae0', '#5ac0d0', '#3a4a3a'] },
  astro:    { name: 'スペースナイト', weapon: 'laser',  pals: ['#e8ecf2', '#f0a03a', '#5a9af0', '#3a3a4a'], human: 1 },
};
// それぞれの キャラの なまえ(色ちがいも べつの なまえ。4ばんめは ボス)
const HERO_NAMES = {
  dragon: ['バーンドラ', 'アクアドラ', 'ガイアドラ', 'ダークドラグーン'],
  eagle: ['ホークマル', 'スカイホーク', 'ゴルドホーク', 'ブラックファルコン'],
  shark: ['ジョーズン', 'ディープシャーク', 'エメラシャーク', 'キングメガロ'],
  tiger: ['トラマル', 'ビャッコマル', 'キンガトラ', 'カゲトラオウ'],
  lion: ['レオンマル', 'ガオレオン', 'ホワイトレオ', 'レオカイザー'],
  trex: ['ティラボ', 'バイオティラ', 'マグマティラ', 'ジュラシックオウ'],
  robot: ['メカボ', 'レッドメカ', 'ブルーメカ', 'メカジェネラル'],
  wolf: ['カゲロウ', 'ヤミウルフ', 'スナウルフ', 'ロウガ'],
  beetle: ['ツノマル', 'アオヅノ', 'ミドリヅノ', 'ヘラクレオン'],
  trike: ['トリケラン', 'アクアトリケ', 'リーフトリケ', 'トリケラジャイアント'],
  stego: ['ステゴン', 'サンドステゴ', 'アイスステゴ', 'ステゴフォートレス'],
  ptera: ['プテラン', 'ソニックプテラ', 'ウィンドプテラ', 'ストームプテラ'],
  spino: ['スピノン', 'クリムゾンスピノ', 'ミストスピノ', 'スピノエンペラー'],
  stag: ['クワガン', 'ブルークワガ', 'レッドクワガ', 'オオクワカイザー'],
  mantis: ['カマキラー', 'ゴールドカマキ', 'アクアカマキ', 'シノビカマキリ'],
  scorpion: ['サソリン', 'ナイトサソリ', 'サバクサソリ', 'デススコーピオ'],
  samurai: ['ムサシ', 'アオザムライ', 'ミドリマル', 'ショウグン'],
  ninja: ['ハヤテ', 'アオカゼ', 'ホムラ', 'カゲノオウ'],
  oni: ['アカオニン', 'アオオニン', 'キオニン', 'オニガシラ'],
  tengu: ['テングマル', 'コノハテング', 'カラステング', 'ダイテング'],
  trainbot: ['シンカンオー', 'ファイアライナー', 'ブルーエクスプレス', 'ナイトライナー'],
  policebot: ['パトロイド', 'ブルーパトロ', 'ハイウェイロボ', 'ブラックポリス'],
  tankbot: ['タンクロン', 'デザートタンク', 'アイアンタンク', 'ギガタンク'],
  phoenix: ['フレアバード', 'アクアバード', 'サンバード', 'ノヴァフェニックス'],
  cerberus: ['ケルベロン', 'マグマケルベ', 'ブルーケルベ', 'ヘルケルベロス'],
  kraken: ['タコリアン', 'ディープイカ', 'リーフクラーケン', 'クラーケンロード'],
  alien: ['ピピリン', 'ポポリン', 'ププリン', 'ギャラクシーオウ'],
  astro: ['コスモナイト', 'サンナイト', 'スターナイト', 'ギャラクシーナイト'],
};

/* ---------- ぶき(右手に もつ。手の 位置は 152,138) ---------- */
function heroWeapon(kind, c) {
  const S = HL(3.5);
  const steel = '#dfe6ee', steel2 = '#a9b6c4', gold = '#f2c230', wood = '#9a6438';
  switch (kind) {
    case 'sword': return `<path d="M150,140 L176,36 L184,40 L160,142 Z" fill="${steel}" ${S}/><path d="M176,40 L171,60" stroke="${steel2}" stroke-width="3"/>
      <path d="M140,138 L170,146" ${HL(9)}/><path d="M140,138 L170,146" stroke="${gold}" stroke-width="5" stroke-linecap="round"/>
      <path d="M152,146 L147,166" ${HL(8)}/><path d="M152,146 L147,166" stroke="#7a3b2a" stroke-width="4" stroke-linecap="round"/><circle cx="146" cy="169" r="5" fill="${gold}" ${HL(2.5)}/>`;
    case 'bigsword': return `<path d="M148,142 L172,22 L188,22 L162,146 Z" fill="${steel}" ${S}/><path d="M178,30 L162,120" stroke="${steel2}" stroke-width="3"/>
      <path d="M134,136 L176,148" ${HL(11)}/><path d="M134,136 L176,148" stroke="${gold}" stroke-width="7" stroke-linecap="round"/><circle cx="155" cy="142" r="5" fill="#e8473d" ${HL(2)}/>
      <path d="M154,150 L148,174" ${HL(9)}/><path d="M154,150 L148,174" stroke="#7a3b2a" stroke-width="5" stroke-linecap="round"/>`;
    case 'katana': return `<path d="M152,142 Q166,90 192,34" fill="none" ${HL(10)}/><path d="M152,142 Q166,90 192,34" fill="none" stroke="${steel}" stroke-width="6" stroke-linecap="round"/>
      <ellipse cx="152" cy="144" rx="11" ry="5" transform="rotate(-20 152 144)" fill="${gold}" ${HL(2.5)}/>
      <path d="M150,148 L143,172" ${HL(9)}/><path d="M150,148 L143,172" stroke="#2b2230" stroke-width="5" stroke-linecap="round"/><path d="M148,154 L145,166" stroke="#fff" stroke-width="2" stroke-dasharray="3 3"/>`;
    case 'spear': case 'lance': {
      const tip = kind === 'lance' ? `<path d="M178,10 L190,56 L166,56 Z" fill="${steel}" ${S}/>` : `<path d="M178,14 L190,46 L178,56 L166,46 Z" fill="${steel}" ${S}/><path d="M170,58 L186,58" ${HL(6)}/><path d="M170,58 L186,58" stroke="#e8473d" stroke-width="3"/>`;
      return `<path d="M178,56 L146,190" ${HL(9)}/><path d="M178,56 L146,190" stroke="${kind === 'lance' ? gold : wood}" stroke-width="5" stroke-linecap="round"/>${tip}`;
    }
    case 'trident': return `<path d="M176,50 L146,190" ${HL(9)}/><path d="M176,50 L146,190" stroke="${gold}" stroke-width="5" stroke-linecap="round"/>
      <path d="M160,52 Q176,66 192,58 M176,58 L182,18 M160,52 L162,22 M192,58 L200,30" fill="none" ${HL(9)}/><path d="M160,52 Q176,66 192,58 M176,58 L182,18 M160,52 L162,22 M192,58 L200,30" fill="none" stroke="${steel}" stroke-width="5" stroke-linecap="round"/>
      <path d="M182,12 L186,24 L178,24 Z M162,16 L166,28 L158,27 Z M201,24 L203,36 L196,34 Z" fill="${steel}" ${HL(2.5)}/>`;
    case 'axe': return `<path d="M170,40 L148,180" ${HL(10)}/><path d="M170,40 L148,180" stroke="${wood}" stroke-width="6" stroke-linecap="round"/>
      <path d="M166,42 Q196,30 200,70 Q182,64 162,74 Z" fill="${steel}" ${S}/><path d="M166,42 Q140,40 134,64 Q148,62 162,70 Z" fill="${steel2}" ${S}/>`;
    case 'hammer': return `<path d="M168,52 L148,182" ${HL(10)}/><path d="M168,52 L148,182" stroke="${wood}" stroke-width="6" stroke-linecap="round"/>
      <rect x="140" y="26" width="58" height="34" rx="8" transform="rotate(10 169 43)" fill="${steel2}" ${S}/><rect x="146" y="30" width="12" height="26" rx="3" transform="rotate(10 169 43)" fill="${gold}" ${HL(2)}/>`;
    case 'laser': return `<path d="M156,128 L190,24" stroke="#59f0ff" stroke-width="18" stroke-linecap="round" opacity=".35"/><path d="M156,128 L190,24" stroke="#fff" stroke-width="7" stroke-linecap="round"/>
      <path d="M150,148 L158,124" ${HL(11)}/><path d="M150,148 L158,124" stroke="#5b6270" stroke-width="7" stroke-linecap="round"/><circle cx="154" cy="136" r="3" fill="#59f0ff"/>`;
    case 'mace': return `<path d="M168,60 L148,176" ${HL(10)}/><path d="M168,60 L148,176" stroke="${wood}" stroke-width="6" stroke-linecap="round"/>
      <circle cx="170" cy="48" r="17" fill="${steel2}" ${S}/>${[0, 1, 2, 3, 4, 5, 6, 7].map(k => { const a = k * Math.PI / 4; return `<path d="M${170 + 15 * Math.cos(a - .25)},${48 + 15 * Math.sin(a - .25)} L${170 + 27 * Math.cos(a)},${48 + 27 * Math.sin(a)} L${170 + 15 * Math.cos(a + .25)},${48 + 15 * Math.sin(a + .25)}" fill="${steel}" ${HL(2.5)}/>`; }).join('')}`;
    case 'kanabo': return `<path d="M152,150 L178,30" ${HL(26)}/><path d="M152,150 L178,30" stroke="#5a5060" stroke-width="20" stroke-linecap="round"/>
      ${[0, 1, 2, 3, 4, 5].map(k => { const t = k / 5, x = 172 - t * 18, y = 40 + t * 80; return `<circle cx="${x - 7}" cy="${y}" r="3.2" fill="${steel}" ${HL(1.5)}/><circle cx="${x + 7}" cy="${y + 6}" r="3.2" fill="${steel}" ${HL(1.5)}/>`; }).join('')}`;
    case 'bow': return `<path d="M168,40 Q204,110 160,180" fill="none" ${HL(9)}/><path d="M168,40 Q204,110 160,180" fill="none" stroke="${wood}" stroke-width="5" stroke-linecap="round"/>
      <path d="M168,40 L160,180" stroke="#fff" stroke-width="2"/><path d="M200,100 L130,124" ${HL(4)}/><path d="M130,124 l10,-8 l-2,12 Z" fill="${steel}" ${HL(2)}/><path d="M200,100 l-8,-6 m8,6 l-4,8" ${HL(3)}/>`;
    case 'scythe': return `<path d="M170,30 L146,186" ${HL(9)}/><path d="M170,30 L146,186" stroke="${wood}" stroke-width="5" stroke-linecap="round"/>
      <path d="M170,32 Q130,8 96,34 Q132,30 166,48 Z" fill="${steel}" ${S}/>`;
    case 'fan': return `<path d="M152,146 L166,90" ${HL(8)}/><path d="M152,146 L166,90" stroke="${wood}" stroke-width="4" stroke-linecap="round"/>
      ${[0, 1, 2, 3, 4, 5, 6, 7, 8].map(k => { const a = -2.4 + k * 0.22; return `<path d="M166,90 L${166 + 46 * Math.cos(a)},${90 + 46 * Math.sin(a)} L${166 + 46 * Math.cos(a + .22)},${90 + 46 * Math.sin(a + .22)} Z" fill="${k % 2 ? '#3a8a4a' : '#5ab05a'}" ${HL(2)}/>`; }).join('')}`;
    case 'cannon': return `<rect x="138" y="122" width="56" height="26" rx="8" transform="rotate(-25 150 135)" fill="#5a6050" ${S}/><rect x="182" y="102" width="12" height="30" rx="3" transform="rotate(-25 150 135)" fill="#3a4030" ${HL(3)}/><circle cx="150" cy="136" r="5" fill="#f2c230"/>`;
    case 'raygun': return `<path d="M144,146 L156,130 L188,116 Q196,114 194,124 L162,140 Z" fill="${steel2}" ${S}/><circle cx="194" cy="119" r="6" fill="#59f0ff" ${HL(2)}/><path d="M146,148 L140,164" ${HL(9)}/><path d="M146,148 L140,164" stroke="#5a6070" stroke-width="5" stroke-linecap="round"/>
      <circle cx="198" cy="110" r="4" fill="#59f0ff" opacity=".7"/><circle cx="196" cy="100" r="2.5" fill="#59f0ff" opacity=".5"/>`;
    case 'firesword': return `<path d="M150,140 L176,36 L184,40 L160,142 Z" fill="#ffd23f" ${S}/><path d="M172,30 Q186,10 178,0 Q196,14 190,40 Q200,30 196,20 Q206,44 186,58 Z" fill="#ff7a2a" ${HL(2.5)}/><path d="M178,40 Q186,28 184,18 Q192,32 186,46 Z" fill="#ffe58a"/>
      <path d="M140,138 L170,146" ${HL(9)}/><path d="M140,138 L170,146" stroke="#e8473d" stroke-width="5" stroke-linecap="round"/><path d="M152,146 L147,166" ${HL(8)}/><path d="M152,146 L147,166" stroke="#7a3b2a" stroke-width="4" stroke-linecap="round"/>`;
    case 'kunai': return `<path d="M150,142 L178,92 L186,98 L156,144 Z" fill="${steel}" ${S}/><path d="M150,146 L142,160" ${HL(8)}/><path d="M150,146 L142,160" stroke="#3b3550" stroke-width="4" stroke-linecap="round"/><circle cx="140" cy="164" r="5" fill="none" ${HL(3)}/>
      <g transform="translate(176 52) rotate(20)"><path d="M0,-16 L4,-4 L16,0 L4,4 L0,16 L-4,4 L-16,0 L-4,-4 Z" fill="${steel}" ${HL(3)}/><circle r="3.5" fill="${HERO_LINE}"/></g>`;
  }
  return '';
}
// たて(左手)
function heroShield(c) {
  return `<path d="M30,118 L66,112 Q70,150 48,170 Q24,152 30,118 Z" fill="${c}" ${HL()}/><path d="M48,124 L52,160" stroke="#f2c230" stroke-width="4" stroke-linecap="round"/><path d="M36,138 L62,134" stroke="#f2c230" stroke-width="4" stroke-linecap="round"/>`;
}

/* ---------- からだ(みんな きょうつう) ---------- */
function heroBody(c, belly, opt) {
  const d = hshade(c, -0.25);
  let s = '';
  // あし
  s += `<path d="M76,160 L76,182 Q76,188 84,188 L96,188 Q100,188 98,180 L96,160 Z" fill="${d}" ${HL()}/>`;
  s += `<path d="M104,160 L102,180 Q100,188 104,188 L116,188 Q124,188 124,182 L124,160 Z" fill="${d}" ${HL()}/>`;
  // どう
  s += `<path d="M66,128 Q66,108 100,106 Q134,108 134,128 L132,160 Q100,172 68,160 Z" fill="${c}" ${HL()}/>`;
  if (belly) s += `<path d="M84,122 Q100,116 116,122 L114,156 Q100,162 86,156 Z" fill="${belly}"/>`;
  if (opt.armor) {
    s += `<path d="M72,118 Q100,104 128,118 L126,140 Q100,150 74,140 Z" fill="${opt.armor}" ${HL(3.5)}/><path d="M100,112 L100,146" stroke="${hshade(opt.armor, -0.25)}" stroke-width="3"/>`;
    s += `<ellipse cx="66" cy="118" rx="15" ry="11" fill="${opt.armor}" ${HL(3.5)}/><ellipse cx="134" cy="118" rx="15" ry="11" fill="${opt.armor}" ${HL(3.5)}/>`;
  }
  s += `<path d="M70,150 Q100,160 130,150" fill="none" stroke="${opt.belt || '#5a3b2a'}" stroke-width="7" stroke-linecap="round"/><rect x="93" y="148" width="14" height="11" rx="2" fill="#f2c230" ${HL(2.5)}/>`;
  return s;
}
function heroArms(c) {
  // 左うで(たてを もつ がわ)と 右うで(ぶきを もつ がわ)
  return `<path d="M70,122 Q52,130 50,148" fill="none" ${HL(18)}/><path d="M70,122 Q52,130 50,148" fill="none" stroke="${c}" stroke-width="12" stroke-linecap="round"/><circle cx="50" cy="150" r="9" fill="${c}" ${HL(3.5)}/>
    <path d="M130,122 Q148,124 152,138" fill="none" ${HL(18)}/><path d="M130,122 Q148,124 152,138" fill="none" stroke="${c}" stroke-width="12" stroke-linecap="round"/><circle cx="152" cy="140" r="9.5" fill="${c}" ${HL(3.5)}/>`;
}
// きりっとした め(まゆつき)
function heroEyes(x1, x2, y, opt = {}) {
  const iris = opt.iris || '#2b2230', glow = opt.glow;
  const eye = x => `<path d="M${x - 10},${y} Q${x},${y - 11} ${x + 10},${y - 2} Q${x + 8},${y + 9} ${x},${y + 9} Q${x - 9},${y + 8} ${x - 10},${y} Z" fill="${glow || '#fff'}" ${HL(3)}/>` +
    (glow ? '' : `<circle cx="${x + 1}" cy="${y + 2}" r="5" fill="${iris}"/><circle cx="${x + 3}" cy="${y}" r="1.8" fill="#fff"/>`);
  const brow = (x, s) => `<path d="M${x - 12 * s},${y - 16} L${x + 10 * s},${y - 9}" ${HL(5)}/>`;
  return eye(x1) + eye(x2) + (opt.nobrow ? '' : brow(x1, 1) + brow(x2, -1));
}
function fangMouth(x, y, w = 14) {
  return `<path d="M${x - w},${y} Q${x},${y + 8} ${x + w},${y - 3}" fill="none" ${HL(3.5)}/><path d="M${x + w - 6},${y - 1} L${x + w - 3},${y + 6} L${x + w},${y - 2} Z" fill="#fff" ${HL(2)}/>`;
}

/* ---------- あたま(しゅるいごと) ---------- */
const HERO_HEADS = {
  dragon(c) {
    const d = hshade(c, -0.25), l = hshade(c, 0.55);
    return {
      back: `<path d="M68,112 Q20,70 14,100 Q30,104 26,120 Q40,112 46,130 Q54,116 70,126 Z" fill="${d}" ${HL()}/><path d="M132,112 Q180,70 186,100 Q170,104 174,120 Q160,112 154,130 Q146,116 130,126 Z" fill="${d}" ${HL()}/>
        <path d="M128,160 Q160,170 176,150 Q178,164 168,174 Q150,186 124,172" fill="${c}" ${HL()}/><path d="M172,150 L184,140 L180,160 Z" fill="${l}" ${HL(3)}/>`,
      head: `<path d="M70,40 L60,10 L84,32 Z" fill="${l}" ${HL()}/><path d="M130,40 L140,10 L116,32 Z" fill="${l}" ${HL()}/>
        <path d="M58,76 Q54,34 100,30 Q146,34 142,76 Q146,96 132,104 L68,104 Q54,96 58,76 Z" fill="${c}" ${HL()}/>
        <path d="M100,30 L94,18 L104,22 L108,10 L112,26" fill="${d}" ${HL(3)}/>
        <path d="M66,82 Q100,74 134,82 Q138,106 100,110 Q62,106 66,82 Z" fill="${l}" ${HL(3.5)}/><circle cx="88" cy="88" r="2.5" fill="${HERO_LINE}"/><circle cx="112" cy="88" r="2.5" fill="${HERO_LINE}"/>
        ${heroEyes(80, 120, 64, { iris: '#f2c230' })}${fangMouth(100, 98, 16)}`,
    };
  },
  eagle(c) {
    const w = '#f6f3ea', d = hshade(c, -0.3);
    return {
      back: `<path d="M68,116 Q14,96 10,130 Q26,128 24,146 Q38,136 44,152 Q54,134 70,138 Z" fill="${c}" ${HL()}/><path d="M132,116 Q186,96 190,130 Q174,128 176,146 Q162,136 156,152 Q146,134 130,138 Z" fill="${c}" ${HL()}/>`,
      head: `<path d="M84,34 L80,12 L96,28 L100,8 L106,28 L120,14 L116,36 Z" fill="${d}" ${HL(3)}/>
        <path d="M60,74 Q58,32 100,30 Q142,32 140,74 Q142,102 100,106 Q58,102 60,74 Z" fill="${w}" ${HL()}/>
        <path d="M60,74 Q62,50 76,42 Q72,62 86,70 Q70,76 60,74 Z M140,74 Q138,50 124,42 Q128,62 114,70 Q130,76 140,74 Z" fill="${hshade(c, 0.2)}"/>
        ${heroEyes(80, 120, 62, { iris: '#c97a10' })}
        <path d="M86,76 Q100,68 114,76 Q114,94 100,104 Q104,90 92,88 Q84,84 86,76 Z" fill="#f2b632" ${HL(3.5)}/><path d="M92,88 Q100,90 104,98" fill="none" ${HL(2.5)}/>`,
    };
  },
  shark(c) {
    const w = '#f2f5f8', d = hshade(c, -0.25);
    return {
      back: `<path d="M126,164 Q156,170 170,150 Q182,140 186,122 Q192,150 178,170 Q160,190 124,176" fill="${c}" ${HL()}/>`,
      head: `<path d="M86,38 Q98,0 126,8 Q112,22 112,40 Z" fill="${d}" ${HL()}/>
        <path d="M56,80 Q52,34 100,32 Q148,34 144,80 Q146,104 100,108 Q54,104 56,80 Z" fill="${c}" ${HL()}/>
        <path d="M62,86 Q100,74 138,86 Q136,106 100,110 Q64,106 62,86 Z" fill="${w}" ${HL(3.5)}/>
        <path d="M68,88 ${[0, 1, 2, 3, 4, 5, 6].map(k => `L${74 + k * 9},${k % 2 ? 88 : 96}`).join(' ')} L132,88" fill="#fff" ${HL(2.5)}/>
        <path d="M60,60 L66,66 M62,52 L68,58 M138,60 L132,66 M136,52 L130,58" ${HL(3)}/>
        ${heroEyes(82, 118, 60, { iris: '#2b2230' })}`,
    };
  },
  tiger(c) {
    const w = '#fff8ee', st = HERO_LINE;
    return {
      back: `<path d="M126,166 Q166,174 172,140 Q174,128 186,128" fill="none" ${HL(14)}/><path d="M126,166 Q166,174 172,140 Q174,128 186,128" fill="none" stroke="${c}" stroke-width="8" stroke-linecap="round"/>`,
      head: `<path d="M62,46 L58,18 L86,36 Z M138,46 L142,18 L114,36 Z" fill="${c}" ${HL()}/><path d="M64,40 L64,26 L78,36 Z M136,40 L136,26 L122,36 Z" fill="#ffc8a8"/>
        <ellipse cx="100" cy="72" rx="46" ry="40" fill="${c}" ${HL()}/>
        <path d="M100,34 L96,46 L104,46 Z M88,36 L90,50 M112,36 L110,50" fill="${st}" ${HL(3)}/>
        <path d="M56,66 L70,70 M56,78 L68,80 M144,66 L130,70 M144,78 L132,80" ${HL(4)}/>
        <path d="M74,84 Q100,70 126,84 Q128,108 100,110 Q72,108 74,84 Z" fill="${w}" ${HL(3)}/>
        <path d="M94,84 L106,84 L100,91 Z" fill="${st}"/>${fangMouth(100, 96, 12)}
        ${heroEyes(80, 120, 64, { iris: '#3a9a4a' })}`,
    };
  },
  lion(c) {
    const m = hshade(c, -0.35), w = '#fff4dc';
    const mane = Array.from({ length: 16 }, (_, k) => { const a = k / 16 * Math.PI * 2, r1 = 50, r2 = 62; return `${100 + r2 * Math.cos(a)},${72 + r2 * Math.sin(a) * .92} ${100 + r1 * Math.cos(a + .2)},${72 + r1 * Math.sin(a + .2) * .92}`; }).join(' ');
    return {
      back: `<path d="M128,166 Q168,170 170,140" fill="none" ${HL(12)}/><path d="M128,166 Q168,170 170,140" fill="none" stroke="${c}" stroke-width="6"/><circle cx="170" cy="134" r="9" fill="${m}" ${HL(3)}/>`,
      head: `<polygon points="${mane}" fill="${m}" ${HL()}/>
        <circle cx="70" cy="40" r="10" fill="${c}" ${HL(3.5)}/><circle cx="130" cy="40" r="10" fill="${c}" ${HL(3.5)}/>
        <ellipse cx="100" cy="74" rx="38" ry="36" fill="${c}" ${HL()}/>
        <path d="M78,86 Q100,74 122,86 Q124,106 100,108 Q76,106 78,86 Z" fill="${w}" ${HL(3)}/>
        <path d="M93,84 L107,84 L100,92 Z" fill="${HERO_LINE}"/>${fangMouth(100, 96, 11)}
        ${heroEyes(82, 118, 66, { iris: '#c97a10' })}`,
    };
  },
  trex(c) {
    const l = hshade(c, 0.5), d = hshade(c, -0.25);
    return {
      back: `<path d="M126,160 Q170,160 192,176 Q170,184 124,176" fill="${c}" ${HL()}/>${[0, 1, 2].map(k => `<path d="M${140 + k * 16},${160 + k * 3} l6,-10 l6,11" fill="${d}" ${HL(2.5)}/>`).join('')}`,
      head: `<path d="M78,32 l6,-12 l6,12 M96,28 l6,-12 l6,12 M114,32 l6,-12 l6,12" fill="${d}" ${HL(3)}/>
        <path d="M54,72 Q50,32 100,30 Q156,30 158,62 Q162,84 150,88 L58,92 Q52,86 54,72 Z" fill="${c}" ${HL()}/>
        <path d="M60,90 L150,86 Q152,106 104,110 Q62,110 60,90 Z" fill="${l}" ${HL()}/>
        <path d="M66,90 ${[0, 1, 2, 3, 4, 5, 6, 7].map(k => `L${72 + k * 10},${k % 2 ? 90 : 99} `).join('')} L146,87" fill="#fff" ${HL(2.5)}/>
        <circle cx="140" cy="54" r="3" fill="${HERO_LINE}"/><circle cx="148" cy="56" r="3" fill="${HERO_LINE}"/>
        ${heroEyes(82, 116, 58, { iris: '#e8473d' })}`,
    };
  },
  robot(c) {
    const d = hshade(c, -0.3), l = hshade(c, 0.4), glow = '#59f0ff';
    return {
      back: `<path d="M84,108 L74,98 M116,108 L126,98" ${HL(5)}/>`,
      head: `<path d="M100,30 L100,12" ${HL(4)}/><circle cx="100" cy="10" r="6" fill="#e8473d" ${HL(3)}/>
        <rect x="56" y="30" width="88" height="76" rx="18" fill="${c}" ${HL()}/>
        <rect x="46" y="54" width="12" height="28" rx="5" fill="${d}" ${HL(3.5)}/><rect x="142" y="54" width="12" height="28" rx="5" fill="${d}" ${HL(3.5)}/>
        <rect x="66" y="48" width="68" height="30" rx="12" fill="#1d2433" ${HL(3.5)}/>
        <path d="M74,60 L92,56 L92,68 L76,68 Z M126,60 L108,56 L108,68 L124,68 Z" fill="${glow}"/>
        <path d="M74,92 L126,92" ${HL(4)}/>${[0, 1, 2, 3].map(k => `<path d="M${84 + k * 11},88 L${84 + k * 11},96" stroke="${HERO_LINE}" stroke-width="2.5"/>`).join('')}
        <circle cx="64" cy="38" r="3" fill="${l}"/><circle cx="136" cy="38" r="3" fill="${l}"/>`,
      body: true,
    };
  },
  wolf(c) {
    const w = '#f3f1ee', band = '#e0423a';
    return {
      back: `<path d="M126,164 Q170,166 180,132 Q188,152 176,170 Q156,184 124,176" fill="${c}" ${HL()}/>
        <path d="M70,52 Q40,48 28,30 M70,58 Q42,66 26,56" fill="none" stroke="${band}" stroke-width="7" stroke-linecap="round"/>`,
      head: `<path d="M62,52 L56,10 L88,38 Z M138,52 L144,10 L112,38 Z" fill="${c}" ${HL()}/><path d="M64,42 L62,22 L80,38 Z M136,42 L138,22 L120,38 Z" fill="#3a3550"/>
        <path d="M58,76 Q56,34 100,32 Q144,34 142,76 Q140,100 100,108 Q60,100 58,76 Z" fill="${c}" ${HL()}/>
        <path d="M58,52 Q100,40 142,52 L142,62 Q100,50 58,62 Z" fill="${band}" ${HL(3)}/><circle cx="100" cy="51" r="5" fill="#dfe6ee" ${HL(2)}/>
        <path d="M72,82 Q100,76 128,82 Q124,104 100,108 Q76,104 72,82 Z" fill="#3a3550" ${HL(3)}/>
        <path d="M80,72 Q100,66 120,72 L100,86 Z" fill="${w}"/>
        ${heroEyes(80, 120, 70, { iris: '#f2c230' })}`,
    };
  },
  beetle(c) {
    const l = hshade(c, 0.35);
    return {
      back: `<path d="M66,118 Q30,110 34,150 Q52,148 68,136 Z M134,118 Q170,110 166,150 Q148,148 132,136 Z" fill="${c}" ${HL()}/>`,
      head: `<path d="M100,40 Q96,10 108,4 Q120,0 124,10 Q112,8 112,20 L118,18 Q112,30 110,40 Z" fill="${hshade(c, -0.3)}" ${HL()}/>
        <path d="M58,78 Q56,36 100,34 Q144,36 142,78 Q142,104 100,108 Q58,104 58,78 Z" fill="${c}" ${HL()}/>
        <path d="M70,46 Q86,38 96,40" fill="none" stroke="${l}" stroke-width="5" stroke-linecap="round"/>
        <path d="M66,58 Q100,48 134,58 L134,82 Q100,74 66,82 Z" fill="#1d1a24" ${HL(3)}/>
        ${heroEyes(84, 116, 66, { glow: '#ffd23f', nobrow: true })}
        <path d="M78,94 Q100,102 122,94" fill="none" ${HL(3.5)}/>`,
    };
  },
  trike(c) {
    const l = hshade(c, 0.5), d = hshade(c, -0.25);
    return {
      back: `<path d="M126,162 Q164,166 182,184 Q160,186 124,176" fill="${c}" ${HL()}/>`,
      head: `<path d="M42,78 Q40,20 100,16 Q160,20 158,78 Q130,60 100,60 Q70,60 42,78 Z" fill="${d}" ${HL()}/>
        ${[0, 1, 2, 3, 4, 5, 6].map(k => { const a = Math.PI * (1.05 + k * .15), x = 100 + 60 * Math.cos(a), y = 70 + 56 * Math.sin(a); return `<circle cx="${x}" cy="${y}" r="5" fill="${l}" ${HL(2.5)}/>`; }).join('')}
        <path d="M76,46 L66,14 L88,42 Z M124,46 L134,14 L112,42 Z" fill="#fff6dc" ${HL(3.5)}/>
        <path d="M60,82 Q58,44 100,42 Q142,44 140,82 Q140,104 100,108 Q60,104 60,82 Z" fill="${c}" ${HL()}/>
        <path d="M100,76 L94,58 L106,76 Z" fill="#fff6dc" ${HL(3)}/>
        <path d="M78,88 Q100,80 122,88 Q118,106 100,108 Q82,106 78,88 Z" fill="${l}" ${HL(3)}/>${fangMouth(100, 96, 10)}
        ${heroEyes(80, 120, 70, { iris: '#2b2230' })}`,
    };
  },
};
const SKIN = '#ffd9b8';
Object.assign(HERO_HEADS, {
  stego(c) {
    const p = hshade(c, -0.15), l = hshade(c, 0.5);
    return {
      back: [[46, 84, 14], [56, 50, 16], [80, 26, 17], [120, 26, 17], [144, 50, 16], [154, 84, 14]].map(([x, y, r]) => `<path d="M${x - r * .8},${y + r} Q${x - r},${y - r * .2} ${x},${y - r * 1.3} Q${x + r},${y - r * .2} ${x + r * .8},${y + r} Z" fill="#e8a83a" ${HL(3)}/>`).join('') +
        `<path d="M126,162 Q160,166 176,150" fill="none" ${HL(12)}/><path d="M126,162 Q160,166 176,150" fill="none" stroke="${c}" stroke-width="6"/><path d="M172,150 l10,-14 M176,152 l14,-6" ${HL(4)}/>`,
      head: `<path d="M58,78 Q56,40 100,38 Q144,40 142,78 Q142,104 100,108 Q58,104 58,78 Z" fill="${c}" ${HL()}/>
        <path d="M70,86 Q100,78 130,86 Q128,106 100,108 Q72,106 70,86 Z" fill="${l}" ${HL(3)}/>${fangMouth(100, 96, 12)}
        <circle cx="74" cy="58" r="4" fill="${p}"/><circle cx="128" cy="54" r="5" fill="${p}"/>${heroEyes(82, 118, 68, { iris: '#c97a10' })}`,
    };
  },
  ptera(c) {
    const d = hshade(c, -0.25), l = hshade(c, 0.45);
    return {
      back: `<path d="M68,116 L8,80 L20,118 L4,128 L30,140 L28,154 L70,138 Z" fill="${d}" ${HL()}/><path d="M132,116 L192,80 L180,118 L196,128 L170,140 L172,154 L130,138 Z" fill="${d}" ${HL()}/>`,
      head: `<path d="M70,50 Q40,10 20,14 Q50,30 72,64 Z" fill="${d}" ${HL()}/>
        <path d="M62,76 Q60,40 100,38 Q140,40 138,76 Q138,98 100,102 Q62,98 62,76 Z" fill="${c}" ${HL()}/>
        <path d="M96,78 L180,92 L100,98 Z" fill="${l}" ${HL(3.5)}/><path d="M104,90 L176,92" stroke="${HERO_LINE}" stroke-width="2.5"/>${heroEyes(80, 112, 62, { iris: '#e8473d' })}`,
    };
  },
  spino(c) {
    const s2 = hshade(c, -0.2), l = hshade(c, 0.5);
    return {
      back: `<path d="M72,110 Q66,40 100,30 Q138,40 130,110 Z" fill="#e05a5a" ${HL()}/>${[0, 1, 2, 3].map(k => `<path d="M${84 + k * 12},40 L${86 + k * 10},106" stroke="${HERO_LINE}" stroke-width="2"/>`).join('')}
        <path d="M126,160 Q170,160 192,176 Q170,184 124,176" fill="${c}" ${HL()}/>`,
      head: `<path d="M58,76 Q56,44 96,42 Q120,42 128,56 L170,70 Q176,84 160,88 L66,96 Q56,90 58,76 Z" fill="${c}" ${HL()}/>
        <path d="M70,92 L160,86 Q156,100 110,106 Q72,108 70,92 Z" fill="${l}" ${HL(3)}/>
        <path d="M76,92 ${[0, 1, 2, 3, 4, 5, 6, 7].map(k => `L${82 + k * 10},${k % 2 ? 92 : 99}`).join(' ')} L156,88" fill="#fff" ${HL(2)}/>
        <circle cx="162" cy="74" r="2.5" fill="${HERO_LINE}"/>${heroEyes(84, 112, 62, { iris: '#f2c230' })}`,
    };
  },
  stag(c) {
    const l = hshade(c, 0.4);
    return {
      back: `<path d="M66,118 Q30,110 34,150 Q52,148 68,136 Z M134,118 Q170,110 166,150 Q148,148 132,136 Z" fill="${c}" ${HL()}/>`,
      head: `<path d="M80,44 Q50,30 60,4 Q66,22 84,22 L80,14 Q92,24 92,40 Z M120,44 Q150,30 140,4 Q134,22 116,22 L120,14 Q108,24 108,40 Z" fill="${hshade(c, -0.2)}" ${HL()}/>
        <path d="M58,78 Q56,38 100,36 Q144,38 142,78 Q142,104 100,108 Q58,104 58,78 Z" fill="${c}" ${HL()}/><path d="M70,48 Q86,40 96,42" fill="none" stroke="${l}" stroke-width="5" stroke-linecap="round"/>
        <path d="M66,60 Q100,50 134,60 L134,82 Q100,74 66,82 Z" fill="#1d1a24" ${HL(3)}/>${heroEyes(84, 116, 68, { glow: '#ff5a3d', nobrow: true })}
        <path d="M80,94 L120,94" ${HL(3.5)}/>`,
    };
  },
  mantis(c) {
    const l = hshade(c, 0.45);
    return {
      back: `<path d="M70,118 Q40,90 30,60 Q48,80 64,86 Z" fill="${l}" ${HL(3)}/><path d="M130,118 Q160,90 170,60 Q152,80 136,86 Z" fill="${l}" ${HL(3)}/>`,
      head: `<path d="M82,40 Q70,10 56,6 M118,40 Q130,10 144,6" fill="none" ${HL(3.5)}/>
        <path d="M50,52 Q100,30 150,52 L112,108 Q100,114 88,108 Z" fill="${c}" ${HL()}/>
        <ellipse cx="66" cy="62" rx="16" ry="20" fill="#3a5a2a" ${HL(3)}/><ellipse cx="134" cy="62" rx="16" ry="20" fill="#3a5a2a" ${HL(3)}/>
        <circle cx="70" cy="56" r="5" fill="#fff"/><circle cx="130" cy="56" r="5" fill="#fff"/>
        <path d="M70,40 L90,52 M130,40 L110,52" ${HL(5)}/><path d="M92,96 L108,96" ${HL(3)}/>`,
    };
  },
  scorpion(c) {
    const d = hshade(c, -0.25);
    const seg = [[60, 150], [40, 128], [30, 100], [34, 74], [50, 56]];  // しっぽは ぶきと はんたいの 左がわ
    return {
      back: seg.map(([x, y], k) => `<ellipse cx="${x}" cy="${y}" rx="${14 - k}" ry="${11 - k}" fill="${k % 2 ? d : c}" ${HL(3)}/>`).join('') + `<path d="M50,46 Q60,30 72,38 Q60,40 56,52 Z" fill="#f2c230" ${HL(3)}/>`,
      head: `<path d="M60,78 Q58,40 100,38 Q142,40 140,78 Q140,102 100,106 Q60,102 60,78 Z" fill="${c}" ${HL()}/>
        <path d="M60,62 Q100,50 140,62" fill="none" stroke="${d}" stroke-width="6"/>
        ${heroEyes(82, 118, 72, { iris: '#2b2230' })}<path d="M86,94 l-6,10 M114,94 l6,10" ${HL(3.5)}/><path d="M88,92 Q100,98 112,92" fill="none" ${HL(3)}/>`,
    };
  },
  samurai(c) {
    const g = '#f2c230';
    return {
      head: `<path d="M100,30 Q70,0 60,10 Q78,14 92,34 Z M100,30 Q130,0 140,10 Q122,14 108,34 Z" fill="${g}" ${HL(3)}/>
        <path d="M58,70 Q56,30 100,28 Q144,30 142,70 Z" fill="${hshade(c, -0.3)}" ${HL()}/>
        <path d="M48,70 L152,70 L144,88 L56,88 Z" fill="${hshade(c, -0.3)}" ${HL()}/>
        <path d="M66,66 Q100,58 134,66 Q138,106 100,108 Q62,106 66,66 Z" fill="${SKIN}" ${HL()}/>
        ${heroEyes(84, 116, 80, { iris: '#2b2230' })}<path d="M92,98 Q100,94 108,98" fill="none" ${HL(3)}/>
        <circle cx="100" cy="46" r="7" fill="${g}" ${HL(2.5)}/>`,
    };
  },
  ninja(c) {
    return {
      back: `<path d="M64,52 Q38,44 26,30 M64,58 Q40,64 24,54" fill="none" stroke="${hshade(c, 0.3)}" stroke-width="7" stroke-linecap="round"/>`,
      head: `<path d="M56,76 Q54,32 100,30 Q146,32 144,76 Q144,104 100,108 Q56,104 56,76 Z" fill="${c}" ${HL()}/>
        <path d="M64,62 Q100,52 136,62 L134,82 Q100,76 66,82 Z" fill="${SKIN}" ${HL(3)}/>
        <path d="M58,50 Q100,38 142,50" fill="none" stroke="${hshade(c, 0.3)}" stroke-width="8"/><rect x="92" y="40" width="16" height="12" rx="2" fill="#dfe6ee" ${HL(2)}/>
        ${heroEyes(84, 116, 70, { iris: '#2b2230' })}`,
    };
  },
  oni(c) {
    const l = hshade(c, 0.4);
    return {
      head: `<path d="M74,38 L66,8 L88,32 Z M126,38 L134,8 L112,32 Z" fill="#fff6dc" ${HL()}/>
        ${[0, 1, 2, 3, 4, 5, 6].map(k => `<circle cx="${64 + k * 12}" cy="${40 + (k % 2) * 4}" r="10" fill="#2b2230"/>`).join('')}
        <path d="M58,80 Q56,42 100,40 Q144,42 142,80 Q142,106 100,108 Q58,106 58,80 Z" fill="${c}" ${HL()}/>
        <path d="M80,94 Q100,104 120,94 L118,100 Q100,110 82,100 Z" fill="#fff" ${HL(3)}/><path d="M84,96 L86,86 L90,96 M116,96 L114,86 L110,96" fill="#fff" ${HL(2.5)}/>
        <ellipse cx="100" cy="82" rx="7" ry="5" fill="${l}"/>${heroEyes(82, 118, 68, { iris: '#f2c230' })}`,
      tigerShorts: 1,
    };
  },
  tengu(c) {
    return {
      back: `<path d="M68,116 Q14,96 10,130 Q26,128 24,146 Q38,136 44,152 Q54,134 70,138 Z" fill="#2b2230" ${HL()}/><path d="M132,116 Q186,96 190,130 Q174,128 176,146 Q162,136 156,152 Q146,134 130,138 Z" fill="#2b2230" ${HL()}/>`,
      head: `<path d="M100,40 L88,28 L100,14 L112,28 Z" fill="#2b2230" ${HL(3)}/>
        ${[0, 1, 2, 3, 4].map(k => `<path d="M${64 + k * 18},44 q9,-14 18,0" fill="#f6f3ea" ${HL(2.5)}/>`).join('')}
        <path d="M58,80 Q56,44 100,42 Q144,44 142,80 Q142,106 100,108 Q58,106 58,80 Z" fill="${c}" ${HL()}/>
        <path d="M60,86 Q60,110 76,112 Q100,118 124,112 Q140,110 140,86 Q100,104 60,86 Z" fill="#f6f3ea" ${HL(3)}/>
        <path d="M94,74 Q100,70 106,74 L150,82 Q156,88 148,90 L100,90 Q92,84 94,74 Z" fill="${hshade(c, -0.1)}" ${HL()}/>
        ${heroEyes(80, 114, 66, { iris: '#2b2230' })}`,
    };
  },
  trainbot(c) {
    return {
      head: `<path d="M58,104 L58,52 Q58,28 100,26 Q142,28 142,52 L142,104 Z" fill="${c}" ${HL()}/>
        <path d="M66,40 Q100,30 134,40 L132,70 L68,70 Z" fill="#1d2433" ${HL(3)}/><path d="M76,56 L92,50 L92,64 Z M124,56 L108,50 L108,64 Z" fill="#59f0ff"/>
        <path d="M58,80 L142,80" stroke="#f2f2f2" stroke-width="6"/><circle cx="72" cy="94" r="7" fill="#fff6b0" ${HL(3)}/><circle cx="128" cy="94" r="7" fill="#fff6b0" ${HL(3)}/>
        <rect x="88" y="88" width="24" height="12" rx="3" fill="#5a6070" ${HL(2.5)}/>`,
    };
  },
  policebot(c) {
    const d = c === '#f2f2f2' ? '#2a2a30' : hshade(c, -0.4);
    return {
      head: `<rect x="80" y="14" width="18" height="14" rx="4" fill="#e8473d" ${HL(3)}/><rect x="102" y="14" width="18" height="14" rx="4" fill="#3f7fe0" ${HL(3)}/>
        <rect x="56" y="28" width="88" height="78" rx="16" fill="${c}" ${HL()}/><path d="M56,58 L144,58 L144,76 L56,76 Z" fill="${d}"/>
        <rect x="66" y="52" width="68" height="28" rx="10" fill="#1d2433" ${HL(3)}/><path d="M74,62 L92,58 L92,72 L76,72 Z M126,62 L108,58 L108,72 L124,72 Z" fill="#59f0ff"/>
        <path d="M86,34 L100,42 L114,34 L110,48 L90,48 Z" fill="#f2c230" ${HL(2.5)}/><path d="M76,94 L124,94" ${HL(4)}/>`,
    };
  },
  tankbot(c) {
    return {
      back: `<rect x="96" y="6" width="74" height="14" rx="4" transform="rotate(-12 100 24)" fill="#4a5038" ${HL(3.5)}/>`,
      head: `<path d="M60,104 L54,56 Q60,34 100,32 Q140,34 146,56 L140,104 Z" fill="${c}" ${HL()}/>
        <ellipse cx="100" cy="36" rx="30" ry="12" fill="${hshade(c, -0.2)}" ${HL(3.5)}/>
        <rect x="66" y="56" width="68" height="26" rx="8" fill="#1d2433" ${HL(3)}/><path d="M74,66 L92,62 L92,74 L76,74 Z M126,66 L108,62 L108,74 L124,74 Z" fill="#ff5a3d"/>
        <circle cx="74" cy="94" r="4" fill="${hshade(c, -0.3)}"/><circle cx="100" cy="96" r="4" fill="${hshade(c, -0.3)}"/><circle cx="126" cy="94" r="4" fill="${hshade(c, -0.3)}"/>`,
      treads: 1,
    };
  },
  phoenix(c) {
    const y = '#ffd23f', l = hshade(c, 0.4);
    const flame = (x, y0, s) => `<path d="M${x},${y0} Q${x - 10 * s},${y0 - 20} ${x},${y0 - 40} Q${x + 4 * s},${y0 - 24} ${x + 14 * s},${y0 - 30} Q${x + 8 * s},${y0 - 12} ${x + 4 * s},${y0}" fill="${y}" ${HL(2.5)}/>`;
    return {
      back: `<path d="M68,116 Q10,80 6,40 Q30,70 40,60 Q36,90 60,90 Q46,104 70,110 Z" fill="${c}" ${HL()}/><path d="M132,116 Q190,80 194,40 Q170,70 160,60 Q164,90 140,90 Q154,104 130,110 Z" fill="${c}" ${HL()}/>
        <path d="M30,52 Q40,72 50,66 M170,52 Q160,72 150,66" fill="none" stroke="${y}" stroke-width="5" stroke-linecap="round"/>`,
      head: flame(92, 42, -1) + flame(108, 42, 1) + flame(100, 40, 1) +
        `<path d="M60,76 Q58,38 100,36 Q142,38 140,76 Q142,102 100,106 Q58,102 60,76 Z" fill="${c}" ${HL()}/><path d="M70,80 Q100,64 130,80 Q124,104 100,106 Q76,104 70,80 Z" fill="${l}"/>
        ${heroEyes(80, 120, 64, { iris: '#c9101a' })}<path d="M88,76 Q100,68 112,76 Q112,92 100,100 Q104,86 92,86 Z" fill="${y}" ${HL(3.5)}/>`,
    };
  },
  cerberus(c) {
    const l = hshade(c, 0.35), red = '#e0423a';
    const dog = (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-30,-14 L-36,-44 L-12,-30 Z M30,-14 L36,-44 L12,-30 Z" fill="${c}" ${HL(4 / s)}/>
      <path d="M-34,4 Q-36,-34 0,-36 Q36,-34 34,4 Q34,30 0,34 Q-34,30 -34,4 Z" fill="${c}" ${HL(4 / s)}/>
      <path d="M-16,10 Q0,4 16,10 Q16,28 0,30 Q-16,28 -16,10 Z" fill="${l}" ${HL(3 / s)}/><ellipse cx="0" cy="12" rx="6" ry="4" fill="${HERO_LINE}"/>
      <path d="M-20,-14 L-6,-6 M20,-14 L6,-6" ${HL(4 / s)}/><circle cx="-12" cy="-4" r="4" fill="${red}"/><circle cx="12" cy="-4" r="4" fill="${red}"/></g>`;
    return {
      back: `<path d="M126,164 Q166,172 176,140 Q180,128 190,126" fill="none" ${HL(12)}/><path d="M126,164 Q166,172 176,140 Q180,128 190,126" fill="none" stroke="${c}" stroke-width="6"/>`,
      head: dog(56, 84, .62) + dog(144, 84, .62) + dog(100, 72, .95) + `<path d="M62,110 L138,110" stroke="${red}" stroke-width="8" stroke-linecap="round"/>${[0, 1, 2, 3, 4].map(k => `<path d="M${70 + k * 15},106 l4,-10 l4,10" fill="#dfe6ee" ${HL(2)}/>`).join('')}`,
    };
  },
  kraken(c) {
    const l = hshade(c, 0.4), d = hshade(c, -0.2);
    const ten = (x0, y0, x1, y1, x2, y2) => `<path d="M${x0},${y0} Q${x1},${y1} ${x2},${y2}" fill="none" ${HL(16)}/><path d="M${x0},${y0} Q${x1},${y1} ${x2},${y2}" fill="none" stroke="${c}" stroke-width="10" stroke-linecap="round"/>`;
    return {
      back: ten(70, 150, 30, 150, 20, 120) + ten(130, 150, 172, 156, 184, 124) + ten(80, 160, 54, 186, 34, 178) + ten(120, 160, 150, 188, 172, 182),
      head: `<path d="M56,84 Q50,10 100,8 Q150,10 144,84 Q142,104 100,108 Q58,104 56,84 Z" fill="${c}" ${HL()}/>
        ${[[76, 30, 7], [124, 26, 6], [100, 18, 5], [86, 48, 4], [118, 46, 5]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${l}"/>`).join('')}
        ${heroEyes(82, 118, 72, { iris: '#f2c230' })}<path d="M90,94 Q100,100 110,94" fill="none" ${HL(3.5)}/>`,
    };
  },
  alien(c) {
    const l = hshade(c, 0.4);
    return {
      head: `<path d="M80,30 L68,6 M120,30 L132,6" ${HL(3.5)}/><circle cx="68" cy="6" r="6" fill="#ff5ad0" ${HL(2.5)}/><circle cx="132" cy="6" r="6" fill="#ff5ad0" ${HL(2.5)}/>
        <path d="M50,64 Q48,22 100,20 Q152,22 150,64 Q150,96 100,110 Q50,96 50,64 Z" fill="${c}" ${HL()}/>
        <path d="M64,60 Q82,48 94,64 Q90,82 74,80 Q62,76 64,60 Z M136,60 Q118,48 106,64 Q110,82 126,80 Q138,76 136,60 Z" fill="#14121c" ${HL(3)}/>
        <circle cx="78" cy="60" r="4" fill="#fff"/><circle cx="122" cy="60" r="4" fill="#fff"/><path d="M92,96 Q100,100 108,96" fill="none" ${HL(3)}/>
        <ellipse cx="72" cy="38" rx="6" ry="3" fill="${l}"/>`,
      suit: '#c9cfe0',
    };
  },
  astro(c) {
    return {
      back: `<rect x="66" y="108" width="68" height="50" rx="10" fill="#9aa4b8" ${HL()}/>`,
      head: `<circle cx="100" cy="68" r="46" fill="${c}" ${HL()}/><path d="M66,62 Q100,44 134,62 Q136,96 100,100 Q64,96 66,62 Z" fill="#1d2b4a" ${HL(3.5)}/>
        <path d="M76,58 Q90,50 104,52" fill="none" stroke="#9ad6ff" stroke-width="5" stroke-linecap="round"/>
        ${heroEyes(86, 114, 74, { glow: '#59f0ff', nobrow: true })}<circle cx="100" cy="24" r="6" fill="#e8473d" ${HL(2.5)}/>`,
    };
  },
});
const HERO_BELLY = { stego: 1, ptera: 1, spino: 1, oni: '#f2c230', phoenix: '#ffd23f', cerberus: 1, kraken: 1, alien: 1, scorpion: 1, dragon: 1, shark: '#f2f5f8', tiger: '#fff8ee', lion: '#fff4dc', trex: 1, wolf: '#f3f1ee', trike: 1, eagle: '#f6f3ea' };

// キャラの なまえ(pal: 0〜3、3は ボス)
function heroName(type, pal) { return (HERO_NAMES[type] || [])[pal || 0] || HERO_TYPES[type].name; }
// ぜんぶの キャラ(しゅるい × 4色)
function heroList() { return Object.keys(HERO_TYPES).flatMap(t => [0, 1, 2, 3].map(p => ({ id: 'hero_' + t + '_' + p, type: t, pal: p, boss: p === 3, name: heroName(t, p) }))); }
let _heroUid = 0;
function heroSVG(type, opt = {}) {
  const T = HERO_TYPES[type];
  const c = T.pals[opt.pal != null ? opt.pal : 0];
  const h = HERO_HEADS[type](c);
  const belly = HERO_BELLY[type] === 1 ? hshade(c, 0.55) : HERO_BELLY[type];
  const boss = !!opt.boss, uid = 'h' + (++_heroUid);
  let s = `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${heroName(type, opt.pal || 0)}">`;
  if (boss) s += `<defs><radialGradient id="${uid}"><stop offset="0" stop-color="#ffd23f" stop-opacity=".7"/><stop offset="1" stop-color="#ff5a3d" stop-opacity="0"/></radialGradient></defs><circle cx="100" cy="100" r="98" fill="url(#${uid})"/>`;
  s += `<ellipse cx="100" cy="190" rx="62" ry="7" fill="#000" opacity=".12"/>`;
  s += h.back || '';
  if (type === 'robot' || T.robo) {
    const d = hshade(c, -0.3);
    s += `<rect x="78" y="160" width="18" height="26" rx="4" fill="${d}" ${HL()}/><rect x="104" y="160" width="18" height="26" rx="4" fill="${d}" ${HL()}/>
      <rect x="64" y="106" width="72" height="58" rx="12" fill="${c}" ${HL()}/><rect x="84" y="118" width="32" height="22" rx="5" fill="#1d2433" ${HL(3)}/><circle cx="100" cy="129" r="6" fill="#59f0ff"/>
      <rect x="56" y="110" width="18" height="18" rx="6" fill="${d}" ${HL(3.5)}/><rect x="126" y="110" width="18" height="18" rx="6" fill="${d}" ${HL(3.5)}/>`;
    if (h.treads) s += `<rect x="62" y="168" width="76" height="22" rx="11" fill="#3a3f30" ${HL()}/>${[0, 1, 2, 3, 4].map(k => `<circle cx="${74 + k * 13}" cy="179" r="5" fill="#6a705a" ${HL(2)}/>`).join('')}`;
    if (boss) s += `<path d="M66,114 Q100,100 134,114 L132,130 Q100,140 68,130 Z" fill="#c9cfd8" ${HL(3.5)}/>`;
  } else {
    const bodyC = T.human ? c : (h.suit || c);
    s += heroBody(bodyC, T.human ? null : belly, { armor: boss ? '#c9cfd8' : opt.armor, belt: type === 'wolf' || type === 'ninja' ? '#e0423a' : type === 'samurai' ? '#f2c230' : null });
    if (h.tigerShorts) s += `<path d="M70,146 Q100,158 130,146 L128,164 L72,164 Z" fill="#f2c230" ${HL(3)}/>${[0, 1, 2, 3].map(k => `<path d="M${80 + k * 13},150 l4,12" ${HL(3)}/>`).join('')}`;
  }
  if (!opt.noShield && (boss || opt.shield)) s += heroShield(hshade(c, -0.15));
  const armC = type === 'robot' || T.robo ? hshade(c, -0.3) : T.human ? c : (h.suit || c);
  s += heroArms(armC);
  s += heroWeapon(opt.weapon || T.weapon, c);
  // 右手の こぶしを ぶきの うえに かさねる
  const fist = T.human ? (type === 'astro' ? '#dfe6ee' : SKIN) : armC;
  s += `<circle cx="152" cy="140" r="9.5" fill="${fist}" ${HL(3.5)}/>`;
  if (T.human) s += `<circle cx="50" cy="150" r="9" fill="${fist}" ${HL(3.5)}/>`;
  s += h.head;
  if (boss) s += `<path d="M76,26 L72,4 L88,16 L100,-2 L112,16 L128,4 L124,26 Q100,20 76,26 Z" fill="#ffd23f" stroke="#a67c00" stroke-width="3" stroke-linejoin="round" transform="translate(0 4)"/>`;
  return s + '</svg>';
}
