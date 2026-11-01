# ことばの リスト(JMdict)を つくる
import sqlite3, json, re, collections
D = '/home/claude/kdata/build'
B = json.load(open(f'{D}/base.json'))
EDU = set(B)
c = sqlite3.connect('/home/claude/kdata/jamdict.db')
GOOD = {'ichi1', 'news1', 'spec1', 'spec2'} | {f'nf{i:02d}' for i in range(1, 25)}
BADK = {'ateji (phonetic) reading', 'irregular okurigana usage', 'word containing irregular kana usage', 'word containing irregular kanji usage', 'word containing out-dated kanji'}
KANA = re.compile(r'^[ぁ-ゖー]+$')
def iskanji(ch): return '一' <= ch <= '鿿' or ch == '々'
kanji = collections.defaultdict(list)
for kid, idseq, text in c.execute('select ID, idseq, text from Kanji'):
    kanji[idseq].append((kid, text))
kji = collections.defaultdict(set)
for kid, t in c.execute('select kid, text from KJI'): kji[kid].add(t)
kjp = collections.defaultdict(set)
for kid, t in c.execute('select kid, text from KJP'): kjp[kid].add(t)
kana = collections.defaultdict(list)
for kid, idseq, text, nok in c.execute('select ID, idseq, text, nokanji from Kana'):
    kana[idseq].append((kid, text, nok))
knr = collections.defaultdict(set)
for kid, t in c.execute('select kid, text from KNR'): knr[kid].add(t)
kni = collections.defaultdict(set)
for kid, t in c.execute('select kid, text from KNI'): kni[kid].add(t)
pos = collections.defaultdict(set); misc = collections.defaultdict(set)
for sid, idseq in c.execute('select ID, idseq from Sense'):
    pass
for idseq, t in c.execute('select s.idseq, p.text from pos p join Sense s on p.sid=s.ID'): pos[idseq].add(t)
for idseq, t in c.execute('select s.idseq, m.text from misc m join Sense s on m.sid=s.ID'): misc[idseq].add(t)
allw = collections.defaultdict(set)   # 表記 → よみ(ぜんぶ、べつかいチェック用)
good = []                              # 問題に つかえる ことば
BADMISC = re.compile(r'vulgar|derogatory|sensitive|archaism|obsolete|rare|obscure|slang|X rated|abbreviation|sexual')
for idseq, ks in kanji.items():
    for kid, text in ks:
        if not all(iskanji(ch) or KANA.match(ch) for ch in text): continue
        rds = [t for (nid, t, nok) in kana[idseq] if not nok and (not knr[nid] or text in knr[nid]) and not (kni[nid] & {'word containing irregular kana usage', 'out-dated or obsolete kana usage'})]
        for r in rds: allw[text].add(r)
        if not rds or kji[kid] & BADK: continue
        ks_ = [ch for ch in text if iskanji(ch)]
        if not ks_ or not all(ch in EDU for ch in ks_): continue
        if not (kjp[kid] & GOOD): continue
        if misc[idseq] and any(BADMISC.search(m) for m in misc[idseq]): continue
        if re.search('[死殺]', text) or text in ('遺体', '自害', '犯人', '強盗'): continue
        rank = 0 if 'ichi1' in kjp[kid] or 'spec1' in kjp[kid] else 1
        good.append({'w': text, 'r': rds, 'pos': sorted(pos[idseq]), 'id': idseq, 'rank': rank,
                     'forms': [t for (_, t) in ks], 'badforms': [t for (k2, t) in ks if kji[k2] & BADK],
                     'g': max(B[ch]['g'] for ch in ks_)})
json.dump({'good': good, 'all': {k: sorted(v) for k, v in allw.items()}}, open(f'{D}/words.json', 'w'), ensure_ascii=False)
print('good words', len(good), 'all forms', len(allw))
print(collections.Counter(w['g'] for w in good))
