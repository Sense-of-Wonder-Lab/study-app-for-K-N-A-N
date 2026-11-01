# アプリ用の データファイル(kanji-data.js)を かく
import json, re
O = json.load(open('kanji_out.json'))
TOK = re.compile(r'[MmCcSsLlHhVvZz]|-?\d*\.?\d+(?:e-?\d+)?')
def bbox(paths):
    xs, ys = [], []
    for d in paths:
        t = TOK.findall(d); i = 0; x = y = 0; cmd = None
        while i < len(t):
            if t[i].isalpha(): cmd = t[i]; i += 1; continue
            n = {'M': 2, 'm': 2, 'L': 2, 'l': 2, 'C': 6, 'c': 6, 'S': 4, 's': 4, 'H': 1, 'h': 1, 'V': 1, 'v': 1}[cmd]
            a = list(map(float, t[i:i + n])); i += n
            rel = cmd.islower()
            if cmd in 'Hh': x = a[0] + (x if rel else 0); pts = [(x, y)]
            elif cmd in 'Vv': y = a[0] + (y if rel else 0); pts = [(x, y)]
            else:
                pts = [(a[j] + (x if rel else 0), a[j + 1] + (y if rel else 0)) for j in range(0, n, 2)]
                x, y = pts[-1]
            if cmd == 'm': cmd = 'l'
            if cmd == 'M': cmd = 'L'
            for px, py in pts: xs.append(px); ys.append(py)
    x0, x1, y0, y1 = min(xs), max(xs), min(ys), max(ys)
    w, h = x1 - x0, y1 - y0; s = max(w, h, 30) + 14
    cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
    return [round(cx - s / 2, 1), round(cy - s / 2, 1), round(s, 1), round(s, 1)]
G = O['GLYPH']
parts = {}
for p, v in O['PARTS'].items():
    parts[p] = [v['d'], bbox(v['d'])]   # 単体ファイルの パーツも 中央に よせる
rg = {}
for name, v in O['RGLYPH'].items():
    d = G[v['k']] if 's' not in v else [G[v['k']][i] for i in v['s']]
    rg[name] = [v['k'], v.get('s'), bbox(d)]
KD = {'G': O['G'], 'GL': G, 'PA': parts, 'RG': rg, 'RN': O['RNAME'], 'REC': O['REC'], 'SC': O['SC'], 'EX': O['EX'], 'RF': {k: r['form'] for k, r in O['RAD'].items() if k in O['RNAME'] and O['REC'].get(k) and r['form'] in O['REC'][k]},
      'QB': {g: {t: qs for t, qs in d.items()} for g, d in O['QB'].items()}}
src = ('/* 漢字データ: KanjiVG (C) Ulrich Apel, CC BY-SA 3.0 / KANJIDIC2・JMdict (C) EDRDG, CC BY-SA 4.0 をもとに作成。\n'
       '   このファイルは CC BY-SA 4.0 で配布します。 */\nvar KD=' + json.dumps(KD, ensure_ascii=False, separators=(',', ':')) + ';\n')
open('/home/claude/study-app-for-k-n-a-n/kanji-data.js', 'w').write(src)
print(len(src.encode()) // 1024, 'KB')
