'use strict';
/* ========== けいさんの ごほうび表 ==========
 * レベルごとに「あそびかた(バトル・60びょう など)」と、その なかの 3だんかいの 目標と ごほうびキャラを きめる
 * 目標: バトルは かかった びょう数(いない)、60びょう アタックは とけた 問題数(いじょう)
 * 数字は「とりあえず」。あとで ここを かえれば 調整できる
 */
const KUKU_IDS = ['k1', 'k2', 'k3', 'k4', 'k5', 'k6', 'k7', 'k8', 'k9'];
// むずかしい 問題は 目標を ゆるく
const TIERS = {
  easy: { battle: [100, 30, 15], ta: [10, 30, 50] },
  mid:  { battle: [120, 45, 25], ta: [8, 20, 35] },
  hard: { battle: [180, 90, 50], ta: [4, 10, 18] },
};
const LEVEL_DIFF = {
  c8: 'mid', c6: 'mid', g3d: 'mid', g3e: 'mid', g3g: 'mid', g3h: 'mid',
  g3f: 'hard', g4d: 'hard', g4e: 'hard', g5a: 'hard', g3b: 'hard', g3c: 'hard', c7: 'hard', g4a: 'hard', g4b: 'hard', g4c: 'hard',
};
function rewardModes(levelId) {
  if (KUKU_IDS.includes(levelId)) return [
    { key: 'order', name: 'じゅんばん', icon: '➡️', n: 9, order: true, tiers: [30, 10], kind: 'time' },
    { key: 'random', name: 'ランダム', icon: '🔀', n: 10, tiers: [50, 20, 10], kind: 'time' },
    { key: 'ta', name: '60びょう アタック', icon: '⏱️', tiers: [10, 30, 50], kind: 'count' },
  ];
  const t = TIERS[LEVEL_DIFF[levelId] || 'easy'];
  return [
    { key: 'battle', name: 'バトル(10もん)', icon: '⚔️', n: 10, tiers: t.battle, kind: 'time' },
    { key: 'ta', name: '60びょう アタック', icon: '⏱️', tiers: t.ta, kind: 'count' },
  ];
}

/* ---------- ごほうびの わりあて ---------- */
// モンスター: いまの かいじゅう4たい + かっこいい系(heroes.js)
// きせかえ: いまの アイテム4こ + あたらしい アイテム
const REWARD = { monster: {}, dressup: {} };
(function assign() {
  const calcIds = CALC_LEVELS.map(l => l.id);
  const old = calcIds.filter(id => !KUKU_IDS.includes(id));
  const types = Object.keys(HERO_TYPES);
  const hero = (t, p) => 'hero_' + t + '_' + p;
  old.forEach((id, i) => {
    const t = types[Math.floor(i / 2) % 10], v = i % 2 ? [2, 3] : [0, 1];
    REWARD.monster[id] = { battle: [id + '_0', id + '_1', id + '_2'], ta: [hero(t, v[0]), hero(t, v[1]), id + '_3'] };
  });
  KUKU_IDS.forEach((id, i) => {
    const A = types[10 + i * 2], B = types[11 + i * 2];
    REWARD.monster[id] = { order: [hero(A, 0), hero(A, 1)], random: [hero(A, 2), hero(B, 0), hero(A, 3)], ta: [hero(B, 1), hero(B, 2), hero(B, 3)] };
  });
  // きせかえ: たりない ぶんは まだ つかっていない 色と 形で つくる
  const used = new Set(DU_ITEMS.map(x => x.cat + x.shape + x.color).concat(['hairlongbrown', 'topteewhite', 'bottomskirtsky', 'shoesstrappink']));
  const SPECIAL = [['dress', 'princess'], ['acc', 'crown'], ['acc', 'tiara'], ['bg', 'castle'], ['hand', 'wand'], ['dress', 'frill']];
  const CATS = ['top', 'bottom', 'hair', 'shoes', 'acc', 'hand', 'dress', 'bg'];
  let ci = 0, si = 0;
  const make = (level, idx, special) => {
    const id = level + '_d' + idx;
    let found = DU_ITEMS.find(x => x.id === id);
    if (found) return id;
    for (let tries = 0; tries < 400; tries++) {
      let cat, shape;
      if (special) [cat, shape] = SPECIAL[(si + tries) % SPECIAL.length];
      else { cat = CATS[(ci + tries) % CATS.length]; const sh = Object.keys(DU_SHAPES[cat]).filter(x => !SPECIAL.some(([c, s2]) => c === cat && s2 === x)); shape = sh[(tries * 3 + ci) % sh.length]; }
      const pal = Object.keys(cat === 'hair' ? DU_HAIR : DU_COLORS);
      const color = pal[(tries * 5 + ci * 7 + si) % pal.length];
      if (used.has(cat + shape + color)) continue;
      used.add(cat + shape + color);
      if (special) si++; else ci++;
      DU_ITEMS.push({ id, level, cat, shape, color, special: !!special, name: `${(cat === 'hair' ? DU_HAIR : DU_COLORS)[color][0]}の ${DU_SHAPES[cat][shape]}` });
      return id;
    }
    throw new Error('no dress design left');
  };
  old.forEach(id => {
    REWARD.dressup[id] = { battle: [id + '_d0', id + '_d1', id + '_d2'], ta: [make(id, 4), make(id, 5), id + '_d3'] };
  });
  KUKU_IDS.forEach(id => {
    REWARD.dressup[id] = { order: [make(id, 0), make(id, 1)], random: [make(id, 2), make(id, 3), make(id, 4, 1)], ta: [make(id, 5), make(id, 6), make(id, 7, 1)] };
  });
})();
function rewardSlots(style, levelId) { return REWARD[style === 'dressup' ? 'dressup' : 'monster'][levelId]; }

/* ---------- キャラの じょうほう(モンスター・ヒーロー きょうつう) ---------- */
function charInfo(id) {
  if (id.startsWith('hero_')) {
    const [, type, p] = id.split('_');
    return { id, name: heroName(type, +p), boss: +p === 3, hero: true, svg: o => heroSVG(type, { pal: +p, boss: +p === 3, kira: o && o.kira }) };
  }
  const m = MONSTERS.find(x => x.id === id) || ALL_MONSTERS.find(x => x.id === id);
  return { id, name: m.name, boss: m.boss, svg: o => monsterSVG(m, o || {}) };
}
// ずかんに のる キャラ ぜんぶ(けいさん + とどうふけん)
function allMonsterIds() {
  const ids = [];
  CALC_LEVELS.forEach(l => { const r = REWARD.monster[l.id]; if (r) Object.values(r).forEach(a => a.forEach(x => ids.includes(x) || ids.push(x))); });
  MONSTERS.filter(m => /^q\d/.test(m.level)).forEach(m => ids.push(m.id));
  return ids;
}
