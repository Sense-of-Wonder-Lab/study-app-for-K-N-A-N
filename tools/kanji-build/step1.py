# 教育漢字1026字の 基本データを つくる(学年・画数・部首番号・読み・KanjiVG の くみたて)
import sqlite3, json, re, os, xml.etree.ElementTree as ET
D = '/home/claude/kdata'
c = sqlite3.connect(f'{D}/jamdict.db')
L456 = [l.strip() for l in open(f'{D}/grades_456.txt')]
grade = {}
for g in (1, 2, 3):
    for (k,) in c.execute('select literal from character where grade=?', (str(g),)): grade[k] = g
for i, g in enumerate((4, 5, 6)):
    for k in L456[i]: grade[k] = g
assert len(grade) == 1026
KV = '{http://kanjivg.tagaini.net}'
def kvg_file(ch):
    p = f'{D}/kvg/kanji/{ord(ch):05x}.svg'
    return p if os.path.exists(p) else None
def parse(ch):
    t = ET.parse(kvg_file(ch)); root = t.getroot()
    ns = '{http://www.w3.org/2000/svg}'
    sp = [g for g in root.iter(ns + 'g') if g.get('id', '').startswith('kvg:StrokePaths')][0]
    top = sp.find(ns + 'g')
    strokes = []
    def walk(g):
        node = {'el': g.get(KV + 'element'), 'orig': g.get(KV + 'original'), 'pos': g.get(KV + 'position'),
                'rad': g.get(KV + 'radical'), 'part': g.get(KV + 'part'), 'kids': [], 's0': len(strokes)}
        for ch_ in g:
            if ch_.tag == ns + 'g': node['kids'].append(walk(ch_))
            elif ch_.tag == ns + 'path':
                strokes.append(ch_.get('d')); node['kids'].append({'stroke': len(strokes) - 1})
        node['s1'] = len(strokes)
        return node
    tree = walk(top)
    return tree, strokes
out = {}
for k, g in grade.items():
    cid = c.execute('select ID, stroke_count from character where literal=?', (k,)).fetchone()
    rad = c.execute("select value from radical where cid=? and rad_type='classical'", (cid[0],)).fetchone()[0]
    gids = [r[0] for r in c.execute('select ID from rm_group where cid=?', (cid[0],))]
    rd = c.execute(f"select r_type, value from reading where gid in ({','.join(map(str, gids)) or '0'}) and r_type in ('ja_on','ja_kun')").fetchall() if gids else []
    tree, strokes = parse(k)
    out[k] = {'g': g, 'sc': cid[1], 'rad': int(rad), 'on': [v for t, v in rd if t == 'ja_on'], 'kun': [v for t, v in rd if t == 'ja_kun'],
              'tree': tree, 'strokes': strokes}
    if len(strokes) != cid[1]: print('stroke count differs', k, len(strokes), cid[1])
json.dump(out, open(f'{D}/build/base.json', 'w'), ensure_ascii=False)
print('ok', len(out))
