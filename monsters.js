'use strict';
// 怪獣データ: レベルごとに4体(4体目はボス)。見た目はコードで描く(画像ファイル不要・オフラインOK)
const MONSTER_SETS = {
  g1L1a: { hue: 200, names: ['ポップン', 'ハネッチ', 'ソラビー', 'ロケドン'] },
  g1L1b: { hue: 180, names: ['シズクン', 'モグリン', 'トロッピ', 'アクアザウル'] },
  g1L2a: { hue: 110, names: ['ガブリン', 'ドシドン', 'ツノッチ', 'ティラノキング'] },
  g1L2b: { hue: 10, names: ['ヒノコ', 'メラッチ', 'ボウボウ', 'ドラグフレア'] },
  c5: { hue: 48, names: ['キラポン', 'ホシマル', 'ピカリス', 'スターロード'] },
  c6: { hue: 330, names: ['ケーキン', 'プリンタ', 'モチモチ', 'スイーツクイーン'] },
  c7: { hue: 30, names: ['ゴロイワ', 'カチコチ', 'ロックン', 'ゴーレムキング'] },
  c8: { hue: 195, names: ['ユキダマ', 'コオリン', 'フブキチ', 'マンモスオー'] },
  c9: { hue: 58, names: ['カミナリン', 'ビリット', 'ゴロゴロ', 'ライジンオー'] },
  c10: { hue: 270, names: ['カゲボウ', 'ヤミネコ', 'ナゾリン', 'ダークマスター'] },
  // 2年
  g2a: { hue: 35, names: ['マルマル', 'トントン', 'ヒャクドン', 'センノスケ'] },
  g2b: { hue: 75, names: ['カズノコ', 'ケタケタ', 'ジュッピー', 'マンネンオー'] },
  g2c: { hue: 140, names: ['ヒッサン', 'タスリン', 'ヒクラ', 'ケイサンキング'] },
  g2k1: { hue: 5, names: ['ニコニコ', 'ゴロン', 'ピョンタ', 'ククナイト'] },
  g2k2: { hue: 120, names: ['サンタロ', 'ヨンヨン', 'ミミック', 'ククガイア'] },
  g2k3: { hue: 290, names: ['ロクマル', 'ナナホシ', 'ラッキー', 'ククドラゴン'] },
  g2k4: { hue: 15, names: ['ハッチ', 'キュウリン', 'イチゴン', 'ククマスター'] },
  g2e: { hue: 250, names: ['アナボコ', 'ナゾナゾ', 'ハテナン', 'アナアキオー'] },
  g2f: { hue: 185, names: ['ミリミリ', 'センチー', 'リットン', 'メジャーキング'] },
  g2g: { hue: 40, names: ['ハンブン', 'ワケワケ', 'ピザリン', 'ブンスウオー'] },
  g2h: { hue: 210, names: ['チクタク', 'トケイン', 'ハリハリ', 'クロノス'] },
  g2i: { hue: 230, names: ['アトデン', 'マエマエ', 'ジカンダ', 'トキノオウ'] },
  // 3年
  g3b: { hue: 20, names: ['カケッチ', 'バイバイ', 'サンケタ', 'カケザンオー'] },
  g3c: { hue: 0, names: ['ニケタン', 'ダブルン', 'クロスケ', 'ギガカケル'] },
  g3d: { hue: 30, names: ['アマリン', 'ノコリモ', 'ハンパー', 'アマリデビル'] },
  g3e: { hue: 190, names: ['テンテン', 'ショウスー', 'コンマル', 'デシマオー'] },
  g3f: { hue: 340, names: ['ブンボー', 'ブンシー', 'カケラン', 'フラクション'] },
  g3g: { hue: 100, names: ['キログラ', 'トンコツ', 'ビョウビョウ', 'メートルオー'] },
  g3h: { hue: 260, names: ['シカクン', 'ハコイリ', 'カクレンボ', 'ミステリオン'] },
  g3i: { hue: 280, names: ['マンマン', 'オクター', 'ジュウバイ', 'ビッグバン'] },
  // 4年
  g4a: { hue: 200, names: ['ワリワリ', 'ニケタワリ', 'ヒッサンボ', 'ワリザンキング'] },
  g4b: { hue: 60, names: ['ガイガイ', 'ゴニュウ', 'ザックリン', 'オオヨソオー'] },
  g4c: { hue: 170, names: ['テンバイ', 'コテンコ', 'ショウカケ', 'デシマルドラゴン'] },
  g4d: { hue: 320, names: ['カブンスー', 'タイブン', 'マゼマゼ', 'ブンスウマジン'] },
  g4e: { hue: 130, names: ['シカクイ', 'ヒロビロ', 'メンセキー', 'テリトリオン'] },
  q1: { hue: 95, names: ['クサモチ', 'ハッパン', 'ツボミン', 'モリノヌシ'] },
  q2: { hue: 160, names: ['カゼノコ', 'クルリン', 'ヒュルル', 'タイフーン'] },
  q3: { hue: 25, names: ['シロボン', 'カブトン', 'ノボリン', 'オシロダイショウ'] },
  q4: { hue: 220, names: ['ウミボウ', 'タコリン', 'カイダン', 'クジラオウ'] },
};
const MONSTERS = [];
Object.entries(MONSTER_SETS).forEach(([level, set]) => {
  set.names.forEach((name, i) => MONSTERS.push({ id: level + '_' + i, level, name, hue: set.hue, boss: i === 3 }));
});

function hashStr(s) { let h = 2166136261; for (const c of s) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }
function seeded(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

let _svgUid = 0;
function monsterSVG(m, opt = {}) {
  const r = seeded(hashStr(m.id + m.name));
  const ri = n => Math.floor(r() * n);
  const uid = 'm' + (++_svgUid);
  const sil = !!opt.silhouette;
  const hue = (m.hue + ri(40) - 20 + 360) % 360;
  const sat = 65 + ri(20);
  const C = sil ? { body: '#cdbfb2', dark: '#b3a497', belly: '#cdbfb2', line: '#b3a497', accent: '#b3a497' } : {
    body: `hsl(${hue},${sat}%,62%)`, dark: `hsl(${hue},${sat - 10}%,38%)`, belly: `hsl(${hue},85%,86%)`,
    line: `hsl(${hue},45%,25%)`, accent: `hsl(${(hue + 150 + ri(60)) % 360},80%,62%)`,
  };
  const stroke = `stroke="${C.line}" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"`;
  const type = ri(4);              // 0まる 1たまご 2しかく 3スライム
  const eyes = 1 + ri(3);
  const horn = ri(5);              // 0なし 1つの2本 2つの1本 3アンテナ 4みみ
  const mouth = ri(4);
  const hasWings = r() < 0.3, hasTail = r() < 0.4 && type !== 3, hasArms = r() < 0.6 && type !== 3;
  const hasSpots = r() < 0.4, hasCheek = r() < 0.6;
  const top = [57, 40, 55, 52][type];
  let back = '', body = '', front = '';

  if (hasWings) {
    back += `<path d="M58,${top + 45} Q10,${top + 10} 18,${top + 75} Q35,${top + 60} 50,${top + 85} Z" fill="${C.accent}" ${stroke}/>`;
    back += `<path d="M142,${top + 45} Q190,${top + 10} 182,${top + 75} Q165,${top + 60} 150,${top + 85} Z" fill="${C.accent}" ${stroke}/>`;
  }
  if (hasTail) back += `<path d="M150,150 Q185,150 180,118 Q178,105 190,100" fill="none" stroke="${C.line}" stroke-width="16" stroke-linecap="round"/><path d="M150,150 Q185,150 180,118 Q178,105 190,100" fill="none" stroke="${C.body}" stroke-width="9" stroke-linecap="round"/>`;
  // つの・みみ(体のうしろ)
  if (horn === 1) back += `<path d="M70,${top + 12} L60,${top - 22} L88,${top + 4} Z" fill="${C.accent}" ${stroke}/><path d="M130,${top + 12} L140,${top - 22} L112,${top + 4} Z" fill="${C.accent}" ${stroke}/>`;
  if (horn === 2) back += `<path d="M88,${top + 6} L100,${top - 32} L112,${top + 6} Z" fill="${C.accent}" ${stroke}/>`;
  if (horn === 3) back += `<path d="M85,${top + 6} Q78,${top - 15} 70,${top - 22}" fill="none" ${stroke}/><path d="M115,${top + 6} Q122,${top - 15} 130,${top - 22}" fill="none" ${stroke}/><circle cx="70" cy="${top - 24}" r="8" fill="${C.accent}" ${stroke}/><circle cx="130" cy="${top - 24}" r="8" fill="${C.accent}" ${stroke}/>`;
  if (horn === 4) back += `<path d="M58,${top + 30} L56,${top - 14} L92,${top + 6} Z" fill="${C.body}" ${stroke}/><path d="M142,${top + 30} L144,${top - 14} L108,${top + 6} Z" fill="${C.body}" ${stroke}/>`;
  if (type !== 3) back += `<ellipse cx="72" cy="172" rx="17" ry="11" fill="${C.dark}" ${stroke}/><ellipse cx="128" cy="172" rx="17" ry="11" fill="${C.dark}" ${stroke}/>`;
  if (hasArms) back += `<ellipse cx="42" cy="128" rx="11" ry="18" transform="rotate(25 42 128)" fill="${C.body}" ${stroke}/><ellipse cx="158" cy="128" rx="11" ry="18" transform="rotate(-25 158 128)" fill="${C.body}" ${stroke}/>`;

  const bodyPath = [
    `<ellipse cx="100" cy="115" rx="62" ry="58"/>`,
    `<ellipse cx="100" cy="108" rx="52" ry="68"/>`,
    `<rect x="40" y="55" width="120" height="115" rx="40"/>`,
    `<path d="M38,168 Q26,100 70,68 Q100,40 130,68 Q174,100 162,168 Q147,156 131,168 Q115,156 100,168 Q85,156 69,168 Q53,156 38,168 Z"/>`,
  ][type];
  body += `<g fill="${C.body}" ${stroke}>${bodyPath}</g>`;
  if (!sil) {
    body += `<ellipse cx="100" cy="${type === 1 ? 140 : 138}" rx="${type === 1 ? 32 : 38}" ry="26" fill="${C.belly}"/>`;
    if (hasSpots) body += `<circle cx="62" cy="${top + 38}" r="7" fill="${C.dark}" opacity=".45"/><circle cx="140" cy="${top + 48}" r="9" fill="${C.dark}" opacity=".45"/><circle cx="148" cy="${top + 28}" r="5" fill="${C.dark}" opacity=".45"/>`;
    // め
    const ey = top + 40;
    const E = eyes === 1 ? [[100, 19]] : eyes === 2 ? [[80, 14], [120, 14]] : [[74, 11], [100, 12], [126, 11]];
    E.forEach(([x, rr], k) => {
      const yy = eyes === 3 && k === 1 ? ey - 6 : ey;
      front += `<circle cx="${x}" cy="${yy}" r="${rr}" fill="#fff" ${stroke}/><circle cx="${x + rr * 0.15}" cy="${yy + rr * 0.1}" r="${rr * 0.55}" fill="#2a1f1a"/><circle cx="${x + rr * 0.35}" cy="${yy - rr * 0.25}" r="${rr * 0.22}" fill="#fff"/>`;
    });
    if (hasCheek) front += `<ellipse cx="66" cy="${ey + 20}" rx="9" ry="5" fill="#ff8fa8" opacity=".7"/><ellipse cx="134" cy="${ey + 20}" rx="9" ry="5" fill="#ff8fa8" opacity=".7"/>`;
    // くち
    const my = ey + 26;
    if (mouth === 0) front += `<path d="M86,${my} Q100,${my + 14} 114,${my}" fill="none" ${stroke}/>`;
    if (mouth === 1) front += `<path d="M84,${my - 2} Q100,${my + 24} 116,${my - 2} Z" fill="#c0392b" ${stroke}/><path d="M90,${my - 1} L94,${my + 7} L98,${my}" fill="#fff"/><path d="M102,${my} L106,${my + 7} L110,${my - 1}" fill="#fff"/>`;
    if (mouth === 2) front += `<path d="M86,${my} Q93,${my + 9} 100,${my} Q107,${my + 9} 114,${my}" fill="none" ${stroke}/>`;
    if (mouth === 3) front += `<path d="M78,${my - 2} Q100,${my + 20} 122,${my - 2} Z" fill="#fff" ${stroke}/><path d="M89,${my} L89,${my + 8} M100,${my + 2} L100,${my + 9} M111,${my} L111,${my + 8}" stroke="${C.line}" stroke-width="2"/>`;
  } else {
    front += `<text x="100" y="${top + 70}" text-anchor="middle" font-size="64" font-weight="800" fill="#fff" font-family="sans-serif">?</text>`;
  }
  if (m.boss && !sil) {
    // ボスは まゆげで つよそうに
    const by = top + 40 - (eyes === 1 ? 26 : 20);
    front += `<path d="M${eyes === 1 ? 78 : 64},${by - 6} L${eyes === 1 ? 96 : 92},${by + 2}" ${stroke} stroke-width="6"/><path d="M${eyes === 1 ? 122 : 136},${by - 6} L${eyes === 1 ? 104 : 108},${by + 2}" ${stroke} stroke-width="6"/>`;
    const cy = Math.min(top, horn ? top - 6 : top) - 4;
    front += `<path d="M76,${cy} L72,${cy - 26} L88,${cy - 12} L100,${cy - 32} L112,${cy - 12} L128,${cy - 26} L124,${cy} Z" fill="#ffd23f" stroke="#a67c00" stroke-width="3" stroke-linejoin="round"/><circle cx="100" cy="${cy - 10}" r="4" fill="#ff4f6d"/>`;
  }
  let defs = '', glow = '', sparks = '';
  if (opt.kira && !sil) {
    defs = `<defs><linearGradient id="${uid}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff5e8a"/><stop offset=".33" stop-color="#ffd23f"/><stop offset=".66" stop-color="#45d483"/><stop offset="1" stop-color="#4aa8ff"/></linearGradient></defs>`;
    glow = `<g fill="none" stroke="url(#${uid})" stroke-width="14" opacity=".9">${bodyPath}</g>`;
    const star = (x, y, s) => `<path d="M${x},${y - s} L${x + s * .3},${y - s * .3} L${x + s},${y} L${x + s * .3},${y + s * .3} L${x},${y + s} L${x - s * .3},${y + s * .3} L${x - s},${y} L${x - s * .3},${y - s * .3} Z" fill="#ffd23f" stroke="#fff" stroke-width="2"/>`;
    sparks = star(28, 40, 13) + star(176, 60, 10) + star(170, 168, 12) + star(22, 150, 8);
  }
  const shadow = `<ellipse cx="100" cy="186" rx="60" ry="8" fill="#000" opacity=".1"/>`;
  return `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${sil ? '???' : m.name}">${defs}${shadow}${glow}${back}${body}${front}${sparks}</svg>`;
}
