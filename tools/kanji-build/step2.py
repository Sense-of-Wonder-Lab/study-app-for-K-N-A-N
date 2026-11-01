# 部首の 形と 位置を きめる
import json, unicodedata
D = '/home/claude/kdata/build'
B = json.load(open(f'{D}/base.json'))
KX = '一丨丶丿乙亅二亠人儿入八冂冖冫几凵刀力勹匕匚匸十卜卩厂厶又口囗土士夂夊夕大女子宀寸小尢尸屮山巛工己巾干幺广廴廾弋弓彐彡彳心戈戶手支攴文斗斤方无日曰月木欠止歹殳毋比毛氏气水火爪父爻爿片牙牛犬玄玉瓜瓦甘生用田疋疒癶白皮皿目矛矢石示禸禾穴立竹米糸缶网羊羽老而耒耳聿肉臣自至臼舌舛舟艮色艸虍虫血行衣襾見角言谷豆豕豸貝赤走足身車辛辰辵邑酉釆里金長門阜隶隹雨靑非面革韋韭音頁風飛食首香馬骨高髟鬥鬯鬲鬼魚鳥鹵鹿麥麻黃黍黑黹黽鼎鼓鼠鼻齊齒龍龜龠'
assert len(KX) == 214
VAR = {'亻': 9, '𠆢': 9, '刂': 18, '⺈': 18, '氵': 85, '氺': 85, '扌': 64, '忄': 61, '⺗': 61, '艹': 140, '⺾': 140, '辶': 162, '⻌': 162, '⻍': 162,
       '灬': 86, '礻': 113, '衤': 145, '王': 96, '犭': 94, '罒': 122, '⺲': 122, '耂': 125, '攵': 66, '牜': 93, '冫': 15, '飠': 184, '𩙿': 184, '糹': 120,
       '釒': 167, '訁': 149, '青': 174, '黄': 201, '黒': 203, '歯': 211, '斉': 210, '戸': 63, '⺌': 42, '⺍': 42, '⺕': 58, '彑': 58, '爫': 87, '母': 80,
       '西': 146, '覀': 146, '⺪': 103, '亡': None, '户': 63, '𧾷': 157, '⻊': 157, '⺮': 118, '𥫗': 118, '⻗': 173, '⺶': 123, '⺷': 123, '𦍌': 123,
       '肀': 129, '⺻': 129, '⺺': 129, '㣺': 61, '⺖': 61, '⺡': 85, '⺘': 64, '⻖': 170, '⻏': 163, '⺝': 74, '⺼': 130, '巳': 49, '已': 49, '旡': 71,
       '乚': 5, '⺄': 5, '丷': 12, '⺧': 93, '⺹': 125, '冐': None, '⺆': 13, '⺊': 25, '⺋': 26, '卪': 26, '⺁': 27, '⻆': 148, '⻎': 162, '⺩': 96, '⺅': 9,
       '⺀': 15, '⺧': 93, '⺙': 66, '⺜': 72, '⺟': 80, '⻝': 184, '⻞': 184, '⻟': 184, '镸': 168, '⻑': 168, '𠂉': None}
def kx(ch, pos=None):
    if ch in VAR: return VAR[ch]
    n = unicodedata.normalize('NFKC', ch)
    if n in KX: return KX.index(n) + 1
    return None
res = {}; bad = []
for k, d in B.items():
    r = d['rad']
    found = []
    def walk(n, depth):
        if 'stroke' in n: return
        if n.get('rad') in ('general', 'tradit') and depth > 0:
            found.append(n)
        for c in n['kids']: walk(c, depth + 1)
    walk(d['tree'], 0)
    cand = []
    for n in found:
        for ch in (n['el'], n['orig']):
            if ch and kx(ch) == r: cand.append(n); break
    if cand:
        n = cand[0]
        # 位置: 自分か 祖先の position
        res[k] = {'form': n['el'], 'pos': n['pos'], 's0': n['s0'], 's1': n['s1'], 'n': r, 'split': bool(n['part']) or len(cand) > 1}
    elif kx(k) == r:
        res[k] = {'form': k, 'pos': 'whole', 'n': r, 'split': False}
    else:
        bad.append((k, r, KX[r - 1], [(n['el'], n['orig'], n['rad']) for n in found]))
json.dump(res, open(f'{D}/radicals.json', 'w'), ensure_ascii=False)
print('resolved', len(res), 'unresolved', len(bad))
for b in bad: print(b)
