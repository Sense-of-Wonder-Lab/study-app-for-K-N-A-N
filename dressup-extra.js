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
];
DU_BONUS.forEach(([cat, shape, color]) => {
  const pal = cat === 'hair' ? DU_HAIR : DU_COLORS;
  if (!DU_SHAPES[cat][shape] || !pal[color]) throw new Error('Invalid bonus design: ' + cat + shape + color);
  DU_ITEMS.push({ id: 'x_' + cat + '_' + shape, level: 'bonus', bonus: true, cat, shape, color, name: `${pal[color][0]}の ${DU_SHAPES[cat][shape]}` });
});
// まだ もっていない ボーナスアイテムの さいしょの 1こ(ぜんぶ もっていたら null)
function nextBonusItem(closet) { return DU_ITEMS.find(x => x.bonus && !closet[x.id]) || null; }
