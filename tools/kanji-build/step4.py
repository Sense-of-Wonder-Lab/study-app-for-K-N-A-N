# 漢字の 問題データと パーツデータを つくる
import json, re, random, collections, os, unicodedata, xml.etree.ElementTree as ET
random.seed(20261101)
D = '/home/claude/kdata/build'
B = json.load(open(f'{D}/base.json'))
RAD = json.load(open(f'{D}/radicals.json'))
W = json.load(open(f'{D}/words.json'))
GOOD, ALL = W['good'], W['all']
EDU = set(B)
G = {k: d['g'] for k, d in B.items()}
exec(open(f'{D}/step2_tables.py').read())  # KX, VAR, kx()

SAMEISH = {130: 74, 73: 72, 35: 34, 31: 30, 33: 32}
# ---------- 部首 ----------
# 辞書によって 部首が ちがう・形が 見えにくい 字は 部首の 問題に ださない
DISPUTED = set('当歯申由全巣準才承着厳営単内巻争舎率')
RAD['川'] = {'form': '川', 'pos': 'whole', 'n': 47, 'split': False}
RAD['麦'] = {'form': '麦', 'pos': 'whole', 'n': 199, 'split': False}
fs = [n for n in B['夏']['tree']['kids'] if 'el' in n and n['el'] == '夂'][0]
RAD['夏'] = {'form': '夂', 'pos': 'bottom', 's0': fs['s0'], 's1': fs['s1'], 'n': 35, 'split': False}
for k in DISPUTED:
    if k in RAD: RAD[k]['disputed'] = True
def pclass(p):
    if p in ('left',): return 'hen'
    if p in ('right',): return 'tsukuri'
    if p in ('top',): return 'kanmuri'
    if p in ('bottom',): return 'ashi'
    if p in ('tare', 'tarec'): return 'tare'
    if p in ('nyo', 'nyoc'): return 'nyou'
    if p in ('kamae', 'kamaec'): return 'kamae'
    return 'base'
# 部首名: (番号, 位置クラス) → 名前。 位置で 名前が かわらない ものは (番号, None)
NM = {}
def nm(n, name, cls=None): NM[(n, cls)] = name
for n, name in [(1, 'いち'), (2, 'ぼう'), (3, 'てん'), (4, 'の'), (5, 'おつ'), (6, 'はねぼう'), (7, 'に'), (8, 'なべぶた'), (10, 'ひとあし'), (11, 'いる'),
                (12, 'はち'), (13, 'けいがまえ'), (14, 'わかんむり'), (15, 'にすい'), (16, 'つくえ'), (17, 'うけばこ'), (19, 'ちから'), (20, 'つつみがまえ'),
                (21, 'さじのひ'), (23, 'かくしがまえ'), (24, 'じゅう'), (26, 'ふしづくり'), (27, 'がんだれ'), (28, 'む'), (29, 'また'), (31, 'くにがまえ'),
                (33, 'さむらい'), (34, 'ふゆがしら'), (35, 'すいにょう'), (36, 'ゆうべ'), (37, 'だい'), (40, 'うかんむり'), (41, 'すん'), (42, 'しょう'),
                (43, 'だいのまげあし'), (44, 'しかばね'), (47, 'かわ'), (48, 'たくみ'), (49, 'おのれ'), (50, 'はば'), (51, 'かん'), (52, 'いとがしら'),
                (53, 'まだれ'), (54, 'えんにょう'), (55, 'にじゅうあし'), (56, 'しきがまえ'), (59, 'さんづくり'), (60, 'ぎょうにんべん'), (62, 'ほこづくり'),
                (63, 'と'), (65, 'し'), (66, 'のぶん'), (67, 'ぶん'), (68, 'とます'), (69, 'おのづくり'), (73, 'ひらび'), (76, 'あくび'), (77, 'とめる'),
                (78, 'がつへん'), (79, 'るまた'), (80, 'なかれ'), (81, 'くらべる'), (82, 'け'), (83, 'うじ'), (84, 'きがまえ'), (88, 'ちち'), (95, 'げん'),
                (100, 'うまれる'), (101, 'もちいる'), (103, 'ひき'), (104, 'やまいだれ'), (105, 'はつがしら'), (106, 'しろ'), (107, 'けがわ'), (108, 'さら'),
                (122, 'あみがしら'), (123, 'ひつじ'), (124, 'はね'), (125, 'おいかんむり'), (127, 'すきへん'), (131, 'しん'), (132, 'みずから'), (133, 'いたる'),
                (134, 'うす'), (135, 'した'), (138, 'こんづくり'), (139, 'いろ'), (140, 'くさかんむり'), (142, 'むし'), (143, 'ち'), (144, 'ぎょうがまえ'),
                (146, 'にし'), (147, 'みる'), (150, 'たに'), (151, 'まめ'), (152, 'ぶた'), (155, 'あか'), (158, 'み'), (160, 'からい'), (161, 'しんのたつ'),
                (162, 'しんにょう'), (163, 'おおざと'), (168, 'ながい'), (169, 'もんがまえ'), (171, 'れいづくり'), (172, 'ふるとり'), (174, 'あお'),
                (175, 'あらず'), (176, 'めん'), (177, 'かわ'), (180, 'おと'), (181, 'おおがい'), (182, 'かぜ'), (183, 'とぶ'), (185, 'くび'), (186, 'かおり'),
                (188, 'ほね'), (189, 'たかい'), (195, 'うお'), (196, 'とり'), (198, 'しか'), (199, 'むぎ'), (201, 'き'), (203, 'くろ'), (209, 'はな')]:
    nm(n, name)
# 位置で 名前が かわる もの: (番号, 位置クラス, 名前)
for n, cls, name in [(9, 'hen', 'にんべん'), (9, 'kanmuri', 'ひとやね'), (9, 'base', 'ひと'), (9, 'tsukuri', 'ひと'),
                     (12, 'kanmuri', 'はちがしら'), (18, 'tsukuri', 'りっとう'), (18, 'base', 'りっとう'), (18, 'ashi', 'かたな'),
                     (30, 'hen', 'くちへん'), (30, 'base', 'くち'), (30, 'ashi', 'くち'), (30, 'kanmuri', 'くち'), (30, 'kamae', 'くち'), (30, 'tare', 'くち'), (30, 'tsukuri', 'くち'),
                     (32, 'hen', 'つちへん'), (38, 'hen', 'おんなへん'), (39, 'hen', 'こへん'), (46, 'hen', 'やまへん'), (50, 'hen', 'きんべん'),
                     (57, 'hen', 'ゆみへん'), (61, 'hen', 'りっしんべん'), (64, 'hen', 'てへん'), (64, 'base', 'て'), (64, 'ashi', 'て'),
                     (70, 'hen', 'ほうへん'), (72, 'hen', 'にちへん'), (74, 'hen', 'つきへん'), (75, 'hen', 'きへん'), (85, 'hen', 'さんずい'), (85, 'base', 'みず'),
                     (85, 'ashi', 'みず'), (86, 'hen', 'ひへん'), (86, 'ashi', 'れっか'), (91, 'hen', 'かたへん'), (93, 'hen', 'うしへん'), (94, 'hen', 'けものへん'),
                     (94, 'tsukuri', 'いぬ'), (96, 'hen', 'おうへん'), (102, 'hen', 'たへん'), (106, 'hen', 'しろへん'), (109, 'hen', 'めへん'), (111, 'hen', 'やへん'),
                     (112, 'hen', 'いしへん'), (113, 'hen', 'しめすへん'), (115, 'hen', 'のぎへん'), (115, 'ashi', 'のぎ'), (116, 'kanmuri', 'あなかんむり'),
                     (117, 'kanmuri', 'たつ'), (118, 'kanmuri', 'たけかんむり'), (119, 'hen', 'こめへん'), (120, 'hen', 'いとへん'), (128, 'hen', 'みみへん'),
                     (130, 'hen', 'にくづき'), (130, 'ashi', 'にくづき'), (137, 'hen', 'ふねへん'), (145, 'hen', 'ころもへん'), (146, 'kanmuri', 'にし'),
                     (148, 'hen', 'つのへん'), (149, 'hen', 'ごんべん'), (154, 'hen', 'かいへん'), (156, 'nyou', 'そうにょう'), (157, 'hen', 'あしへん'),
                     (159, 'hen', 'くるまへん'), (164, 'hen', 'とりへん'), (164, 'tsukuri', 'ひよみのとり'), (164, 'base', 'ひよみのとり'), (166, 'hen', 'さとへん'), (167, 'hen', 'かねへん'),
                     (170, 'hen', 'こざとへん'), (173, 'kanmuri', 'あめかんむり'), (174, 'hen', 'あお'), (184, 'hen', 'しょくへん'), (187, 'hen', 'うまへん'),
                     (124, 'kanmuri', 'はね'), (131, 'hen', 'しん')]:
    NM[(n, cls)] = name
BASE = {9: 'ひと', 18: 'かたな', 30: 'くち', 32: 'つち', 38: 'おんな', 39: 'こ', 46: 'やま', 57: 'ゆみ', 61: 'こころ', 64: 'て', 70: 'ほう', 72: 'にち',
        74: 'つき', 75: 'き', 85: 'みず', 86: 'ひ', 91: 'かた', 93: 'うし', 94: 'いぬ', 96: 'おう', 102: 'た', 109: 'め', 111: 'や', 112: 'いし', 113: 'しめす',
        115: 'のぎ', 116: 'あな', 117: 'たつ', 118: 'たけ', 119: 'こめ', 120: 'いと', 128: 'みみ', 130: 'にく', 137: 'ふね', 145: 'ころも', 148: 'つの',
        149: 'げん', 154: 'かい', 156: 'はしる', 157: 'あし', 159: 'くるま', 164: 'とり', 166: 'さと', 167: 'かね', 170: 'おか', 173: 'あめ', 184: 'しょく',
        187: 'うま', 12: 'はち', 124: 'はね', 106: 'しろ', 131: 'しん', 146: 'にし'}
def top_level(k):
    r = RAD[k]
    if r['pos'] == 'whole': return True
    return any('s0' in c and c['s0'] == r['s0'] and c['s1'] == r['s1'] for c in B[k]['tree']['kids'])
def rname(k):
    r = RAD[k]; n = r['n']; cls = pclass(r['pos']) if r['pos'] != 'whole' and top_level(k) else 'base'
    if r['form'] in ('氵',): return 'さんずい'
    if r['form'] in ('忄',): return 'りっしんべん'
    if r['form'] in ('扌',): return 'てへん'
    if r['form'] in ('氺',): return 'したみず'
    if r['form'] in ('礻',): return 'しめすへん'
    if r['form'] in ('衤',): return 'ころもへん'
    if r['form'] in ('⺨', '犭'): return 'けものへん'
    if r['form'] in ('灬',): return 'れっか'
    if r['form'] in ('飠',): return 'しょくへん'
    if r['form'] in ('耂',): return 'おいかんむり'
    if r['form'] == '亻': return 'にんべん'
    if r['form'] == '刂': return 'りっとう'
    if n == 130 and r['pos'] != 'whole': return 'にくづき'
    if (n, cls) in NM: return NM[(n, cls)]
    if (n, None) in NM: return NM[(n, None)]
    if n in BASE: return BASE[n]
    return None
missing = collections.defaultdict(list)
for k in RAD:
    if rname(k) is None: missing[(RAD[k]['n'], RAD[k]['form'], RAD[k]['pos'])].append(k)
if missing:
    for m, ks in missing.items(): print('NAME MISSING', m, ''.join(ks))
    raise SystemExit
RNAME = {k: rname(k) for k in RAD}

# ---------- 字形(KanjiVG)・パーツ ----------
def rnd1(d): return re.sub(r'-?\d+\.\d+', lambda m: ('%.1f' % float(m.group())).rstrip('0').rstrip('.'), d)
def flat(n, out, bad):
    for c in n['kids']:
        if 'stroke' in c: bad.append(1); continue
        if c['el'] and len(c['el']) == 1: out.append(c)
        elif c['el']: bad.append(1)
        else: flat(c, out, bad)
def strokes_of(n):
    s = []
    def w(x):
        if 'stroke' in x: s.append(x['stroke'])
        else:
            for c in x['kids']: w(c)
    w(n); return s
REC = {}; PART_SRC = {}
for k in sorted(B, key=lambda x: (G[x], x)):
    d = B[k]; out = []; bad = []
    flat(d['tree'], out, bad)
    els = []; idx = {}
    for c in out:
        if c.get('part') and c['part'] != '1':  # わかれた パーツの のこり
            if c['el'] in idx: PART_SRC.setdefault(c['el'], None); continue
        els.append(c['el']); idx[c['el']] = c
        if c['el'] not in PART_SRC: PART_SRC[c['el']] = (k, strokes_of(c))
    REC[k] = els if (not bad and len(els) >= 2) else None
KVNS = '{http://www.w3.org/2000/svg}'
def kvg_paths(ch):
    p = f'/home/claude/kdata/kvg/kanji/{ord(ch):05x}.svg'
    if not os.path.exists(p): return None
    root = ET.parse(p).getroot()
    sp = [g for g in root.iter(KVNS + 'g') if g.get('id', '').startswith('kvg:StrokePaths')][0]
    return [rnd1(x.get('d')) for x in sp.iter(KVNS + 'path')]
GLYPH = {k: [rnd1(s) for s in B[k]['strokes']] for k in B}
PARTS = {}
for p in PART_SRC:
    if p in GLYPH: continue
    ps = kvg_paths(p)
    if ps: PARTS[p] = {'d': ps}
    else:
        k, ss = PART_SRC[p]; PARTS[p] = {'d': [GLYPH[k][i] for i in ss], 'crop': 1}
for k in B:
    if REC[k] is None: pass
# 部首の 見本(名前 → 字形)
RGLYPH = {}
for k in sorted(RAD, key=lambda x: (G[x], x)):
    nmk = RNAME[k]
    if nmk in RGLYPH or RAD[k].get('disputed'): continue
    r = RAD[k]
    if r['pos'] == 'whole': RGLYPH[nmk] = {'k': k}
    else: RGLYPH[nmk] = {'k': k, 's': list(range(r['s0'], r['s1']))}

# ---------- よみ ----------
def hira(s): return ''.join(chr(ord(ch) - 0x60) if 'ァ' <= ch <= 'ヶ' else ch for ch in s)
DAK = dict(zip('かきくけこさしすせそたちつてとはひふへほ', 'がぎぐげござじずぜぞだぢづでどばびぶべぼ'))
HAN = dict(zip('はひふへほ', 'ぱぴぷぺぽ'))
def kreads(k):
    on = {hira(x) for x in B[k]['on']}
    kun = set()
    for x in B[k]['kun']:
        x = x.strip('-')
        if not x: continue
        kun.add(x.split('.')[0]); kun.add(x.replace('.', ''))
    return on, kun
RD = {k: kreads(k) for k in B}
def variants(r, first=False):
    v = {r}
    if not first and r and r[0] in DAK: v.add(DAK[r[0]] + r[1:])
    if not first and r and r[0] in HAN: v.add(HAN[r[0]] + r[1:])
    if len(r) >= 2 and r[-1] in 'つくちき': v.add(r[:-1] + 'っ')
    return v
GEMOK = set('かきくけこさしすせそたちつてとぱぴぷぺぽ')
VAR_R = {k: {v: base for base in (RD[k][0] | RD[k][1]) for v in variants(base)} for k in B}
def segs(word, reading):
    # (ことばの 各文字の よみ, もとの よみ) の わけかた を ぜんぶ
    res = []
    def go(i, j, acc):
        if i == len(word):
            if j == len(reading): res.append(list(acc))
            return
        ch = word[i]
        if ch == '々':
            prev = acc[-1][0] if acc else ''
            for v in variants(prev):
                if reading.startswith(v, j): go(i + 1, j + len(v), acc + [(v, prev)])
            return
        if ch in VAR_R:
            for v, base in VAR_R[ch].items():
                if not v or not reading.startswith(v, j): continue
                if i == 0 and v != base and v[0] != base[0]: continue  # 1文字めは にごらない
                if v.endswith('っ') and not base.endswith('っ') and (j + len(v) >= len(reading) or reading[j + len(v)] not in GEMOK): continue
                go(i + 1, j + len(v), acc + [(v, base)])
        elif reading.startswith(ch, j): go(i + 1, j + 1, acc + [(ch, ch)])
        if len(res) > 3: return
    go(0, 0, [])
    return res
def uniq_seg(word, reading):
    s = segs(word, reading)
    if not s: return None
    if any(x != s[0] for x in s[1:]):
        # 文字ごとの よみが おなじなら OK
        if any([a for a, _ in x] != [a for a, _ in s[0]] for x in s[1:]): return None
    return s[0]

# ---------- ことば ----------
seen_r = collections.Counter()
for w in GOOD:
    if len(w['r']) != 1: continue
    sg = uniq_seg(w['w'], w['r'][0])
    if not sg: continue
    for ch, (v, base) in zip(w['w'], sg):
        if ch in EDU: seen_r[(ch, base)] += 1
def common_on(k): return {x for x in RD[k][0] if seen_r[(k, x)] >= 2}
def common_reads(k):
    stems = {x.split('.')[0].strip('-') for x in B[k]['kun']}
    stems = {x for x in stems if len(x) >= 2} | RD[k][0]
    return {x for x in stems if x and seen_r[(k, x)] >= 2}
def dvars(r, first):  # まちがい選択肢用: にごり だけ(っ は つかわない)
    return {v for v in variants(r, first) if not v.endswith('っ') or r.endswith('っ')}
by_k = collections.defaultdict(list)
for w in GOOD:
    for ch in set(w['w']):
        if ch in EDU: by_k[ch].append(w)
def words_for(k, g, f=None):
    return [w for w in by_k[k] if w['g'] <= g and (f is None or f(w))]
ISK = lambda ch: '一' <= ch <= '鿿'
def two(w): return len(w['w']) == 2 and all(ISK(c) for c in w['w']) and len(w['r']) == 1
def pool_upto(g): return [k for k in B if G[k] <= g]

QB = {g: {t: [] for t in range(1, 8)} for g in range(1, 7)}
drop = collections.Counter()

# 1 部首を こたえる
OK1 = {k for k in RAD if not RAD[k].get('disputed') and RAD[k]['pos'] != 'whole' and RNAME[k] in RGLYPH and RAD[k]['s1'] - RAD[k]['s0'] < B[k]['sc']}
TINY = {'いち', 'ぼう', 'てん', 'の', 'はねぼう', 'おつ', 'じゅう', 'に', 'はち', 'なべぶた'}
ALLNAMES = sorted(set(RNAME[k] for k in OK1))
def radnums_in(k):
    # その字の 中に ある 部首っぽい 形の 番号(月と肉、日と曰は おなじ あつかい)
    s = set()
    def w(n):
        if 'stroke' in n: return
        for ch in (n.get('el'), n.get('orig')):
            if ch and len(ch) == 1:
                x = kx(ch)
                if x: s.add(SAMEISH.get(x, x))
        for c in n['kids']: w(c)
    w(B[k]['tree'])
    x = kx(k) if len(k) == 1 else None
    if x: s.add(SAMEISH.get(x, x))
    return s
RN_IN = {k: radnums_in(k) for k in B}
LOOKS = {'た': set('由申甲'), 'にち': set('白'), 'くち': set('日'), 'つち': set('士'), 'さむらい': set('土')}
NAME2NUM = {}
for k in OK1: NAME2NUM.setdefault(RNAME[k], SAMEISH.get(RAD[k]['n'], RAD[k]['n']))
for k in sorted(OK1):
    g = G[k]; ans = RNAME[k]
    # まぎらわしい 選択肢: その字に ふくまれる ほかの 部首の 形
    tricky = []
    for c in B[k]['tree']['kids']:
        if 'stroke' in c or not c.get('el'): continue
        for k2 in OK1:
            if RAD[k2]['form'] == c['el'] and RNAME[k2] != ans and RNAME[k2] not in tricky: tricky.append(RNAME[k2]); break
    same_cls = [n for n in ALLNAMES if n != ans and n not in tricky and any(pclass(RAD[x]['pos']) == pclass(RAD[k]['pos']) and RNAME[x] == n for x in OK1)]
    others = [n for n in ALLNAMES if n != ans and n not in tricky]
    opts = tricky[:2]
    random.shuffle(same_cls)
    for n in same_cls + others:
        if len(opts) >= 3: break
        if n not in opts: opts.append(n)
    QB[g][1].append({'k': k, 'a': ans, 'o': opts[:3]})

# 2 共通の 部首
SEEN2 = set()
groups = collections.defaultdict(list)
for k in OK1: groups[RNAME[k]].append(k)
for g in range(1, 7):
    for name, ks in groups.items():
        if name in TINY: continue
        ks_g = [k for k in ks if G[k] <= g]
        if len(ks_g) < 3 or not any(G[k] == g for k in ks_g): continue
        num = NAME2NUM[name]
        for rep in range(min(4, len(ks_g) // 3 + 1)):
            new = [k for k in ks_g if G[k] == g]
            pick = [random.choice(new)] + random.sample([k for k in ks_g if k not in new or True], 0)
            rest = [k for k in ks_g if k != pick[0]]
            pick += random.sample(rest, 2)
            cand = [n for n in ALLNAMES if n != name and not all(NAME2NUM[n] in RN_IN[x] for x in pick)]
            # にた 位置の 部首を まぜる
            cls = pclass(RAD[pick[0]]['pos'])
            near = [n for n in cand if any(pclass(RAD[x]['pos']) == cls for x in groups[n])]
            random.shuffle(near); random.shuffle(cand)
            opts = []
            for n in near + cand:
                if n not in opts: opts.append(n)
                if len(opts) == 3: break
            key = (g, tuple(sorted(pick)))
            if key in SEEN2: continue
            SEEN2.add(key)
            QB[g][2].append({'ks': pick, 'a': name, 'o': opts})

# 3 その部首の 漢字さがし
for k in sorted(OK1):
    g = G[k]; name = RNAME[k]; num = NAME2NUM[name]
    if name in TINY: continue
    cand = [x for x in pool_upto(g) if num not in RN_IN[x] and x not in DISPUTED and x not in LOOKS.get(name, ())]
    cls = pclass(RAD[k]['pos'])
    near = [x for x in cand if x in OK1 and pclass(RAD[x]['pos']) == cls]
    random.shuffle(near); random.shuffle(cand)
    opts = []
    for x in near[:2] + cand:
        if x not in opts: opts.append(x)
        if len(opts) == 3: break
    QB[g][3].append({'n': name, 'a': k, 'o': opts})

# 4 よみ
def read_q(k, w):
    r = w['r'][0]
    s = uniq_seg(w['w'], r)
    if not s: return None
    pos = [i for i, ch in enumerate(w['w']) if ch == k]
    if len(pos) != 1: return None
    i = pos[0]
    allr = set(ALL.get(w['w'], [])) | set(w['r'])
    alts = set()
    for base in common_reads(k):
        for v in [base] + sorted(dvars(base, i == 0)):
            if v == s[i][0] or not v: continue
            cand = ''.join(v if j == i else s[j][0] for j in range(len(s)))
            if cand not in allr: alts.add(cand)
    alts = sorted(alts, key=lambda x: (abs(len(x) - len(r)), x))
    if len(alts) < 3:
        # ほかの 字の よみを かえる
        for j in range(len(s)):
            if j == i or w['w'][j] not in RD: continue
            for base in common_reads(w['w'][j]):
                if not base or base == s[j][1]: continue
                cand = ''.join(base if jj == j else s[jj][0] for jj in range(len(s)))
                if cand not in allr and cand not in alts: alts.append(cand)
    # へんな ながさの ものは 後ろに
    alts = [a for a in alts if 0 < len(a) <= len(r) + 3]
    if len(alts) < 3: return None
    # にた ものを 3つ(長さが ちかい 順の 上位から ランダム)
    top = alts[:6]; random.shuffle(top)
    return {'w': w['w'], 'h': i, 'a': r, 'o': top[:3]}
for k in B:
    g = G[k]
    ws = words_for(k, g, lambda w: len(w['r']) == 1 and len(w['w']) <= 4)
    ws.sort(key=lambda w: (w['rank'], abs(len(w['w']) - 2), -sum(1 for c in w['w'] if c in EDU)))
    n = 0
    for w in ws:
        q = read_q(k, w)
        if q: QB[g][4].append(q); n += 1
        if n >= 3: break
    if n == 0: drop['4:' + str(g)] += 1

# 5 共通の 漢字(□間・□工)
for k in B:
    g = G[k]
    ws = [w for w in words_for(k, g, two) if w['rank'] == 0]
    slots = []
    used = set()
    random.shuffle(ws)
    for w in ws:
        other = w['w'].replace(k, '', 1)
        if len(other) != 1 or other in used or other == k: continue
        used.add(other)
        slots.append(w['w'].replace(k, '□', 1))
        if len(slots) == 3: break
    if len(slots) < 2: drop['5:' + str(g)] += 1; continue
    def fits(y): return sum(1 for s in slots if s.replace('□', y) in ALL)
    cand = [y for y in pool_upto(g) if y != k]
    random.shuffle(cand)
    cand = [y for y in cand if fits(y) < len(slots)]
    cand.sort(key=lambda y: -fits(y))  # 1つだけ あてはまる ものを まぜて むずかしく
    opts = cand[:1] + random.sample(cand[1:40], 2) if len(cand) >= 3 else None
    if not opts: continue
    QB[g][5].append({'s': slots, 'a': k, 'o': opts})

# 6 おくりがな
OKU = re.compile(r'^(.)([ぁ-ゖ]+)$')
for k in B:
    g = G[k]
    for w in words_for(k, g):
        m = OKU.match(w['w'])
        if not m or m.group(1) != k or len(w['r']) != 1: continue
        if not any(p.startswith(('Godan verb', 'Ichidan verb', 'adjective (keiyoushi)')) for p in w['pos']): continue
        if any(p.startswith('expressions') for p in w['pos']): continue
        r = w['r'][0]; oku = m.group(2); L = len(r) - len(oku)
        if L < 1 or not r.endswith(oku): continue
        okforms = set(w['forms']) - set(w['badforms'])
        cands = []
        for j in range(1, len(r)):
            if j == L: continue
            f = k + r[j:]
            if f in okforms or (f in ALL and r in ALL[f]): continue
            cands.append((abs(j - L), f))
        cands.sort()
        opts = [f for _, f in cands[:3]]
        if len(opts) < 2: continue
        QB[g][6].append({'r': r, 'a': w['w'], 'o': opts})

# 7 同じ よみの 漢字
for k in B:
    g = G[k]
    ws = [w for w in words_for(k, g, two)]
    ws.sort(key=lambda w: w['rank'])
    n = 0
    for w in ws:
        r = w['r'][0]
        s = uniq_seg(w['w'], r)
        if not s: continue
        i = w['w'].index(k)
        base = s[i][1]
        if base not in common_on(k): continue  # よく つかう 音読みだけ
        cand = [y for y in pool_upto(g) if y != k and base in common_on(y)]
        cand = [y for y in cand if (w['w'][:i] + y + w['w'][i + 1:]) not in ALL]
        if len(cand) < 3: continue
        same = [y for y in cand if G[y] == g]; random.shuffle(same); random.shuffle(cand)
        opts = []
        for y in same[:2] + cand:
            if y not in opts: opts.append(y)
            if len(opts) == 3: break
        QB[g][7].append({'w': w['w'], 'h': i, 'r': r, 'a': k, 'o': opts})
        n += 1
        if n >= 2: break

EX = {}
for k in B:
    ws = [w for w in words_for(k, G[k], lambda w: len(w['r']) == 1 and len(w['w']) <= 4) if w['rank'] == 0]
    ws.sort(key=lambda w: (abs(len(w['w']) - 2), w['w']))
    EX[k] = [[w['w'], w['r'][0]] for w in ws[:3]]
for g in range(1, 7):
    print(g, {t: len(QB[g][t]) for t in QB[g]})
print('drop', dict(drop))
json.dump({'QB': QB, 'REC': REC, 'PARTS': PARTS, 'GLYPH': GLYPH, 'RGLYPH': RGLYPH, 'RNAME': {k: RNAME[k] for k in OK1},
           'G': G, 'EX': EX, 'RAD': RAD, 'SC': {k: B[k]['sc'] for k in B}}, open(f'{D}/kanji_out.json', 'w'), ensure_ascii=False)
