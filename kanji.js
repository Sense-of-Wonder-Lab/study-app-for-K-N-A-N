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
let kSel = [];
let kHint = false;      // くみたて: ヒント(いま つくれる パーツだけ しろく)           // くみたて: えらんだ パーツ
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
const K_ALT_REC = { '比': [['匕', '匕']], '専': [['一', '由', '寸']], '士': [['十', '一']], '操': [['扌', '口', '口', '口', '木']], '自': [['白', '一']], '章': [['音', '十']], '森': [['木', '木', '木']], '大': [['一', '人']], '夫': [['二', '人']], '二': [['一', '一']], '交': [['六', '乂']] };
// 線を きりわけただけで、こどもに パーツと して わかりにくい ものは 1つの パーツ あつかい(七 = 一+乙 には しない)
const K_WHOLE = ['七', '九', '上', '下', '千', '中', '出', '午', '丁', '由', '申', '予', '必', '東', '束',
  '弟', '第', '高', '両', '向', '州', '表', '業', '令', '争', '卒', '帯', '然', '殺', '並', '承', '班',
  '引', '旧', '少', '失', '系', '永', '卵', '成', '尺', '重', '曲'];
// 名前のない かたまりは 1つの パーツに まとめる(チェック表で きめた)。[もとの かんじ, つかう 線, viewBox]
const K_CHUNK = {"朩": ["術", [3, 4, 5, 6], [7.3, 11.9, 82, 82]], "虍": ["劇", [0, 1, 2, 3, 4, 5], [-5.9, 7.7, 84, 84]], "島上": ["島", [0, 1, 2, 3, 4, 5, 6], [16.3, 6.7, 94.1, 94.1]], "書上": ["書", [0, 1, 2, 3, 4, 5], [5.9, -12.5, 98.4, 98.4]], "昼上": ["昼", [0, 1, 2, 3], [9, -3.7, 91.4, 91.4]], "告上": ["告", [0, 1, 2, 3], [6.9, -11.5, 92.5, 92.5]], "看上": ["看", [0, 1, 2, 3], [6.2, -5.2, 95.2, 95.2]], "𦍌": ["義", [0, 1, 2, 3, 4, 5], [18.8, -7.8, 73.2, 73.2]], "周外": ["周", [0, 1], [2.2, 7, 93.8, 93.8]], "乚": ["礼", [4], [39.5, 11.4, 83.1, 83.1]], "漢右": ["漢", [3, 4, 5, 6, 7, 8, 9, 10, 11, 12], [14.3, 3.8, 98.7, 98.7]], "着上": ["着", [0, 1, 2, 3, 4, 5, 6], [9.6, -0.4, 91.8, 91.8]], "服右": ["服", [4, 5, 6, 7], [25.5, 8.9, 91.9, 91.9]], "受上": ["愛", [0, 1, 2, 3, 4, 5], [9.3, -14.8, 90.6, 90.6]], "発下": ["発", [5, 6, 7, 8], [11.6, 31.8, 81.1, 81.1]], "様右": ["様", [4, 5, 6, 7, 8, 9, 10, 11, 12, 13], [21.6, 5.4, 97.0, 97.0]], "別左": ["別", [0, 1, 2, 3, 4], [-8.8, 11.1, 86.9, 86.9]], "栃右": ["栃", [4, 5, 6, 7, 8], [24.5, 8.5, 93.0, 93.0]], "制左": ["制", [0, 1, 2, 3, 4, 5], [-14.6, 5.1, 99.6, 99.6]], "備右": ["備", [2, 3, 4, 5, 6, 7, 8, 9, 10, 11], [15.9, 4.5, 97.7, 97.7]], "夢上": ["夢", [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], [11.4, -4.7, 88.7, 88.7]], "拝右": ["拝", [3, 4, 5, 6, 7], [23.8, 9.6, 93.4, 93.4]], "蔵下": ["蔵", [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14], [7.3, 15.1, 95.4, 95.4]], "図中": ["図", [2, 3, 4, 5], [21.5, 24.4, 62.4, 62.4]], "茶下": ["茶", [3, 4, 5, 6, 7, 8], [11.2, 21.8, 89.0, 89.0]], "満右": ["満", [3, 4, 5, 6, 7, 8, 9, 10, 11], [18.7, 7.6, 93.8, 93.8]], "疑右": ["疑", [7, 8, 9, 10, 11, 12, 13], [20.9, 8.8, 92.2, 92.2]], "産上": ["産", [0, 1, 2, 3, 4, 5], [0.9, 3.2, 101.5, 101.5]]};
// まとめた パーツの もとの ばらし方(ばらして ならべても できる)
const K_CHUNK_SPLIT = {"𠦝": ["十", "日", "十"], "𡗗": ["三", "人"], "漢右": ["艹", "口", "夫"], "服右": ["卩", "又"], "受上": ["⺤", "冖"], "発下": ["二", "儿"], "様右": ["羊", "氺"], "別左": ["口", "勹"], "栃右": ["厂", "万"], "制左": ["牛", "巾"], "備右": ["艹", "厂", "用"], "夢上": ["艹", "罒", "冖"], "拝右": ["一", "丰"], "蔵下": ["厂", "戈", "臣"], "図中": ["⺍", "乂"], "茶下": ["𠆢", "木"], "満右": ["艹", "両"], "疑右": ["マ", "疋"], "産上": ["立", "厂"]};
// 漢字の くみあわせで できている 部品は、その 漢字に ばらす(4つに おさまる ときだけ)。歹は 一+夕 でも OK
const K_PART_SPLIT = {"宁": ["宀", "丁"], "吾": ["五", "口"], "吉": ["士", "口"], "旦": ["日", "一"], "皆": ["比", "白"], "召": ["刀", "口"], "炎": ["火", "火"], "奇": ["大", "可"], "辛": ["立", "十"], "圭": ["土", "土"], "呈": ["口", "王"], "昆": ["日", "比"], "妾": ["立", "女"], "呆": ["口", "木"], "帛": ["白", "巾"], "洛": ["氵", "各"], "肋": ["月", "力"], "兌": ["八", "兄"], "哥": ["可", "可"], "巷": ["共", "己"], "佰": ["亻", "百"], "氐": ["氏", "一"], "胡": ["古", "月"]};
const K_PART_KEEP = {};
// まとまりの パーツを、いまある パーツに ばらす(KanjiVG の くみたてどおりで、みためが しぜんな ものだけ)。
// 5つまでに おさまるまで ばらして、もとの くみかたも のこす(もう もっている パーツが むだに ならないように)
const K_SPLIT2 = {"図中": ["丶", "丶", "乂"], "茶下": ["𠆢", "朩"], "隼": ["隹", "十"], "寅": ["宀", "一", "由", "八"], "兀": ["一", "儿"], "娄": ["米", "女"], "釆": ["丿", "米"], "冏": ["冂", "儿", "口"], "廷": ["壬", "廴"], "旨": ["匕", "日"], "敕": ["束", "攵"], "喬": ["夭", "口", "冋"], "㐬": ["亠", "厶", "川"], "肖": ["⺌", "月"], "昷": ["日", "皿"], "介": ["𠆢", "丿", "丨"], "丙": ["一", "内"], "枼": ["世", "木"], "斿": ["方", "𠂉", "子"], "畀": ["田", "廾"], "奴": ["女", "又"], "劦": ["力", "力", "力"], "隶": ["⺕", "氺"], "夭": ["丿", "大"], "巽": ["己", "己", "共"], "亭": ["亠", "口", "冖", "丁"], "矛": ["予", "丿"], "匀": ["勹", "冫"], "刑": ["开", "刂"], "𠦝": ["十", "早"], "㝵": ["旦", "寸"], "㳟": ["共", "氺"], "寉": ["冖", "隹"], "筑": ["竹", "工", "几", "丶"], "忩": ["公", "心"], "扁": ["戸", "冊"], "耒": ["丿", "未"], "亢": ["亠", "几"], "弗": ["弓", "丿", "丨"], "夋": ["厶", "儿", "夂"], "孚": ["⺤", "子"], "𬀷": ["𠂉", "昜"], "憂": ["百", "冖", "心", "夂"], "厄": ["厂", "卩"], "奞": ["大", "隹"], "乇": ["丿", "七"], "于": ["二", "亅"], "宓": ["宀", "必"], "酋": ["八", "酉"], "坐": ["从", "土"], "孰": ["亠", "口", "子", "丸"], "肙": ["口", "月"], "匈": ["勹", "凶"], "凶": ["乂", "凵"], "壮": ["⺦", "士"], "忍": ["刀", "丶", "心"], "帚": ["⺕", "冖", "巾"], "占": ["卜", "口"], "㕣": ["八", "口"], "甬": ["マ", "用"], "咅": ["立", "口"], "㓁": ["冖", "儿"], "彔": ["⺕", "氺"], "是": ["日", "疋"], "勺": ["勹", "丶"], "采": ["⺤", "木"], "侖": ["𠆢", "一", "冊"], "竟": ["音", "儿"], "壬": ["丿", "士"], "朮": ["朩", "丶"], "苟": ["艹", "句"], "畐": ["一", "口", "田"], "圣": ["又", "土"], "尚": ["⺌", "冂", "口"], "复": ["𠂉", "日", "夂"], "昜": ["旦", "勿"], "莫": ["艹", "日", "大"], "云": ["二", "厶"]};
const K_OLD_REC = {};
const K_REC_FIX = {"護": ["言", "艹", "隹", "又"], "劇": ["虍", "豕", "刂"], "激": ["氵", "白", "方", "攵"], "操": ["扌", "品", "木"], "勢": ["土", "儿", "土", "丸", "力"], "熱": ["土", "儿", "土", "丸", "灬"], "島": ["島上", "山"], "党": ["⺍", "冖", "兄"], "裁": ["十", "衣", "戈"], "章": ["立", "早"], "陸": ["⻖", "土", "儿", "土"], "定": ["宀", "一", "龰"], "漢": ["氵", "漢右"], "難": ["漢右", "隹"], "着": ["着上", "目"], "差": ["着上", "工"], "服": ["月", "服右"], "報": ["幸", "服右"], "愛": ["受上", "心", "夂"], "受": ["受上", "又"], "発": ["癶", "発下"], "様": ["木", "様右"], "別": ["別左", "刂"], "栃": ["木", "栃右"], "制": ["制左", "刂"], "備": ["亻", "備右"], "夢": ["夢上", "夕"], "拝": ["扌", "拝右"], "蔵": ["艹", "蔵下"], "図": ["囗", "図中"], "茶": ["艹", "茶下"], "満": ["氵", "満右"], "疑": ["匕", "矢", "疑右"], "産": ["産上", "生"], "顔": ["産上", "彡", "頁"], "能": ["厶", "月", "匕", "匕"], "曜": ["日", "⺕", "⺕", "隹"], "礼": ["礻", "乚"], "札": ["木", "乚"], "乱": ["舌", "乚"], "乳": ["孚", "乚"], "唱": ["口", "日", "日"], "朝": ["十", "日", "十", "月"], "未": ["木", "一"], "末": ["木", "一"], "主": ["丶", "王"], "常": ["尚", "巾"], "原": ["厂", "白", "小"], "文": ["亠", "乂"], "日": ["口", "一"], "王": ["土", "一"], "食": ["𠆢", "良"], "舎": ["𠆢", "土", "口"], "再": ["一", "冂", "土"], "周": ["周外", "士", "口"], "書": ["書上", "日"], "昼": ["昼上", "日", "一"], "告": ["告上", "口"], "看": ["看上", "目"], "義": ["𦍌", "我"], "養": ["𦍌", "食"], "土": ["十", "一"], "本": ["木", "一"], "田": ["口", "十"], "目": ["日", "一"], "六": ["亠", "八"], "四": ["口", "儿"], "右": ["𠂇", "口"], "左": ["𠂇", "工"], "父": ["八", "乂"]};
function kPrepare() {
  // こざと(⻖)と おおざと(⻏)は おなじ かたちなので、つく ばしょ(ひだり / みぎ)に よせて みわける
  ['⻖', '⻏'].forEach(p => { if (KD.PA[p]) KD.PA[p][1] = [-2, -2, 113, 113]; });
  K_WHOLE.forEach(k => { KD.REC[k] = null; });
  // ひとやねは「人」の 形では わかりにくいので、上に のる 形の パーツ(𠆢)を つかう(今の 1・2かくめ から つくる)
  const hy = KD.RG['ひとやね'];
  KD.PA['𠆢'] = [hy[1].map(i => KD.GL[hy[0]][i]), hy[2]];
  ['会', '合', '茶', '全', '命', '令', '幹', '舎'].forEach(k => { if (KD.REC[k]) KD.REC[k] = KD.REC[k].map(p => p === '人' ? '𠆢' : p); });
  Object.keys(K_CHUNK).forEach(c => { const [k, st, vb] = K_CHUNK[c]; KD.PA[c] = [st.map(i => KD.GL[k][i]), vb]; });
  Object.keys(K_REC_FIX).forEach(k => { KD.REC[k] = K_REC_FIX[k]; });
  Object.keys(KD.REC).forEach(k => {
    const r = KD.REC[k];
    if (!r || K_PART_KEEP[k]) return;
    const nr = r.flatMap(p => K_PART_SPLIT[p] || [p]);
    if (nr.length <= 4) KD.REC[k] = nr;
  });
  Object.assign(K_CHUNK_SPLIT, K_PART_SPLIT, { '歹': ['一', '夕'] });
  Object.assign(K_CHUNK_SPLIT, K_SPLIT2);
  Object.keys(KD.REC).forEach(k => {
    let r = KD.REC[k];
    if (!r || !KD.G[k] || !r.some(p => K_SPLIT2[p])) return;
    const orig = r.slice();
    for (let guard = 0; guard < 6; guard++) {
      const i = r.findIndex((p, j) => K_SPLIT2[p] && r.length - 1 + K_SPLIT2[p].length <= 5);
      if (i < 0) break;
      r = r.slice(0, i).concat(K_SPLIT2[r[i]], r.slice(i + 1));
    }
    if (r.join() !== orig.join()) { KD.REC[k] = r; K_OLD_REC[k] = [orig]; }
  });
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
      K_RECIPES[k] = [KD.REC[k]].concat(K_ALT_REC[k] || [], K_OLD_REC[k] || []);
      K_RECIPE_KEY[k] = K_RECIPES[k].map(r => r.slice().sort().join(''));
    }
  });
  // とちゅうの かんじを ばらした くみかたも OK(拾 = 扌+合 でも 扌+𠆢+一+口 でも)。スロットは 4つまで
  const expand = (r, depth) => {
    let outs = [r];
    if (depth > 3) return outs;
    r.forEach((p, i) => {
      (KD.G[p] && K_RECIPES[p] || (K_CHUNK_SPLIT[p] ? [K_CHUNK_SPLIT[p]] : [])).forEach(sub => {
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
document.head.insertAdjacentHTML('beforeend', '<style>.kb-sep{grid-column:1/-1;flex-basis:100%;width:100%;margin:10px 0 2px;font-size:14px;color:var(--sub);text-align:left}.kb-tray button.on{background:color-mix(in srgb,#3cb371 24%,var(--card));box-shadow:0 4px 0 color-mix(in srgb,#3cb371 55%,var(--card))}.kb-tray button.dim{opacity:.3;filter:grayscale(1)}#kb-hintbtn.on{background:#ffd54a;color:#3b2f2a}.kb-tray button.off{opacity:.3;filter:grayscale(1);box-shadow:0 2px 0 var(--line)}.kb-slots.five{gap:3px}.kb-slots.five span{width:min(100px,13vw);height:min(100px,13vw)}.kb-slots.five b{font-size:22px}.kb-hr{grid-column:1/-1;display:flex;align-items:center;gap:6px;margin:2px 0;font-size:14px;color:var(--sub)}.kb-hr::before{content:"";flex:1;border-top:2px solid var(--line)}.kb-stats{display:flex;align-items:baseline;justify-content:center;gap:8px;font-size:15px;color:var(--sub)}.kb-stats b{font-size:26px;color:var(--ink);margin-right:2px}.kb-stats i{font-style:normal;font-size:22px}.kb-stats .sm{font-size:12px;margin-left:4px}.kb-stats .sm b{font-size:15px}.kpick{background:var(--card)!important;color:inherit}.modal .box .kpick svg{width:100%;height:100%;animation:none}</style>');
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
// スロットは ふだん 4つ。5つ いる かんじ(器・勢・熱)の パーツが そろっていて まだ つくっていない ときだけ 5つに する
function kSlotMax() {
  const own = kOwned(current), got = kanjiOf(current);
  return Object.keys(K_RECIPES).some(k => !got[k] && K_RECIPES[k].some(r => r.length >= 5 && r.every(p => own[p]))) ? 5 : 4;
}
RENDER['kobo'] = () => {
  loadKanji(() => {
    const own = kOwned(current);
    const smax = kSlotMax();
    if (kSel.length > smax) kSel = kSel.slice(0, smax);
    const list = Object.keys(own);
    // かくすうの すくない じゅんに ならべる
    list.sort((a, b) => kStrokes(a) - kStrokes(b) || (KD.G[a] ? 1 : 0) - (KD.G[b] ? 1 : 0) || a.localeCompare(b));
    // まだ つくっていない かんじの どれにも つかわない パーツは グレーに する
    const got = kanjiOf(current), usable = new Set();
    Object.keys(K_RECIPES).forEach(k => { if (!got[k]) K_RECIPES[k].forEach(r => r.forEach(p => usable.add(p))); });
    // もう つかわない パーツは まとめて いちばん したへ
    // ヒント: いまの パーツだけで つくれる かんじに つかう パーツ
    const hintSet = new Set();
    Object.keys(K_RECIPES).forEach(k => { if (!got[k]) K_RECIPES[k].forEach(r => { if (r.length <= smax && r.every(p => own[p])) r.forEach(p => hintSet.add(p)); }); });
    const btn = p => `<button data-p="${esc(p)}" class="${kSel.includes(p) ? 'on' : ''}${usable.has(p) ? '' : ' off'}${kHint && usable.has(p) && !hintSet.has(p) ? ' dim' : ''}"${usable.has(p) ? '' : ' disabled'}>${partSVG(p)}</button>`;
    const useL = list.filter(p => usable.has(p)), offL = list.filter(p => !usable.has(p));
    // かくすうが かわる ところに 線を 1本 いれる
    // かくすうの かたまりごとに 線を 1本。線の みぎはしに その かくすう
    const grp = arr => arr.map((p, i) => (!i || kStrokes(p) !== kStrokes(arr[i - 1]) ? `<div class="kb-hr"><span>${kStrokes(p)}かく</span></div>` : '') + btn(p)).join('');
    $('#kb-tray').innerHTML = list.length ? grp(useL) + (offL.length ? `<p class="kb-sep">もう つかわない パーツ</p>` + grp(offL) : '')
      : '<p class="sub">まだ パーツが ないよ。かんじの もんだいを といて あつめよう!</p>';
    // いちばん うえ: つかえる / もってる / つくった
    const made = Object.keys(got).filter(k => !K_ATOMIC.has(k)).length;
    $('#kb-stats').innerHTML = `<span><b>${hintSet.size}</b>すぐ つかえる</span><i>/</i><span><b>${useL.length}</b>つかえる</span><span class="sm"><b>${list.length}</b>もってる</span><span class="sm"><b>${made}</b>つくった</span>`;
    // おなじ パーツを 2かい えらんでも よい(林 = 木 + 木)
    $$('#kb-tray button').forEach(b => b.onclick = () => {
      if (kSel.length >= smax) return;
      sound.tap(); kSel.push(b.dataset.p); RENDER.kobo();
    });
    $('#kb-slots').classList.toggle('five', smax === 5);
    $('#kb-slots').innerHTML = [...Array(smax).keys()].map(i => `<span data-i="${i}" class="${kSel[i] ? 'on' : ''}">${kSel[i] ? partSVG(kSel[i]) : ''}</span>`).join('<b>+</b>');
    $$('#kb-slots span.on').forEach(s => s.onclick = () => { sound.tap(); kSel.splice(Number(s.dataset.i), 1); RENDER.kobo(); });
    $('#kb-make').disabled = kSel.length < 2;
    const mk = kMakeable(current).length;
    $('#kb-hint').textContent = kHint ? (hintSet.size ? '💡 しろい パーツだけで つくれるよ' : '💡 いまの パーツでは つくれる かんじが ないよ')
      : mk ? `いま つくれる かんじが ${mk}こ あるよ` : `パーツを 2〜${smax}こ えらんで「くみたてる」`;
    $('#kb-hintbtn').classList.toggle('on', kHint);
    $('#kb-count').textContent = '';
  });
};
$('#kb-clear').onclick = () => { sound.tap(); kSel = []; RENDER.kobo(); };
$('#kb-hintbtn').onclick = () => { sound.tap(); kHint = !kHint; RENDER.kobo(); };
$('#kb-make').onclick = () => {
  const key = kSel.slice().sort().join('');
  const got = kanjiOf(current);
  const hits = Object.keys(K_RECIPE_KEY).filter(k => K_RECIPE_KEY[k].includes(key)).sort((a, b) => (got[a] ? 1 : 0) - (got[b] ? 1 : 0) || KD.G[a] - KD.G[b]);
  if (!hits.length) {
    sound.ng(); replay($('#kb-slots'), 'shake');
    $('#kb-hint').textContent = 'その くみあわせでは できなかった…';
    return;
  }
  // おなじ パーツで 2つ いじょう できる とき(田と 古、玉と 主 など)は いっしょに ぜんぶ できる
  kMakeDone(hits);
};
function kMakeDone(ks) {
  const got = kanjiOf(current), fresh = ks.filter(k => !got[k]);
  fresh.forEach(k => { got[k] = today(); });
  if (fresh.length) save();
  kSel = [];
  sound.fanfare();
  const k = fresh[0] || ks[0];
  openKanjiCard(k, fresh.length > 1 ? `✨ ${fresh.length}つの かんじが いっしょに できた!` : fresh.length ? '✨ あたらしい かんじが できた!' : 'もう ずかんに あるよ');
  if (fresh.length > 1) $('#zk-box .kc-glyph').insertAdjacentHTML('afterend', `<div class="btnrow" style="justify-content:center;gap:10px">${fresh.slice(1).map(x => `<button class="btn kpick" data-k="${x}" style="width:80px;height:80px;padding:6px">${kanjiSVG(x)}</button>`).join('')}</div>`),
    $$('#zk-box .kpick').forEach(b => b.onclick = () => openKanjiCard(b.dataset.k));
  RENDER.kobo();
}

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

/* ---------- 保護者画面: かんじずかんの まだの 字 ---------- */
(function () {
  const orig = RENDER.parent;
  RENDER.parent = () => {
    orig();
    loadKanji(() => {
      document.querySelectorAll('#parent-body .panel[data-pid]').forEach(el => {
        const got = kanjiOf(el.dataset.pid);
        const all = Object.keys(KD.G).sort((a, b) => KD.G[a] - KD.G[b] || KD.SC[a] - KD.SC[b]);
        const miss = all.filter(k => !got[k]);
        const how = k => K_ATOMIC.has(k) ? 'もんだいで もらえる' : (K_RECIPES[k] || [[]])[0].join('+');
        const row = document.createElement('div');
        row.className = 'row';
        row.style.cssText = 'color:var(--sub);font-size:16px;display:block';
        row.innerHTML = `かんじずかん ${all.length - miss.length} / ${all.length} 字` + (miss.length ? `
          <details style="margin-top:4px"><summary style="cursor:pointer">まだの 字(${miss.length})</summary>
          <div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:6px">${miss.slice(0, 200).map(k => `<span style="display:inline-flex;align-items:center;gap:4px;border:1px solid var(--line);border-radius:8px;padding:2px 6px;background:var(--card)"><span style="width:34px;height:34px;display:inline-block">${kanjiSVG(k)}</span><small>Lv${KD.G[k]}・${esc(how(k))}</small></span>`).join('')}${miss.length > 200 ? `<small>ほか ${miss.length - 200} 字</small>` : ''}</div></details>` : ' 🎉 ぜんぶ!');
        // いまの 手もちで つくれる 字(つかえる くみかたも)
        const own = kOwned(el.dataset.pid);
        const mk = kMakeable(el.dataset.pid).sort((a, b) => KD.G[a] - KD.G[b] || KD.SC[a] - KD.SC[b]);
        const use = k => K_RECIPES[k].find(r => r.every(p => own[p])).join('+');
        row.insertAdjacentHTML('beforeend', `<details style="margin-top:4px"${mk.length ? '' : ' hidden'}><summary style="cursor:pointer">いま つくれる 字(${mk.length})</summary>
          <div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:6px">${mk.map(k => `<span style="display:inline-flex;align-items:center;gap:4px;border:1px solid var(--line);border-radius:8px;padding:2px 6px;background:var(--card)"><span style="width:34px;height:34px;display:inline-block">${kanjiSVG(k)}</span><small>${esc(use(k))}</small></span>`).join('')}</div></details>`);
        el.insertBefore(row, el.querySelector('.row:last-child'));
      });
    });
  };
})();
