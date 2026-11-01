import json, collections
O = json.load(open('kanji_out.json')); W = json.load(open('words.json'))
ALL = W['all']; G = O['G']; RN = O['RNAME']; RG = O['RGLYPH']; QB = O['QB']
err = collections.Counter(); ex = collections.defaultdict(list)
def bad(t, msg, q):
    err[t] += 1
    if len(ex[t]) < 3: ex[t].append((msg, q))
for g, d in QB.items():
    g = int(g)
    for t, qs in d.items():
        for q in qs:
            o = q['o']
            if q['a'] in o or len(set(o)) != len(o) or len(o) < 2: bad(t, 'opts', q)
            if t == '1':
                if RN.get(q['k']) != q['a'] or G[q['k']] != g: bad(t, 'ans', q)
                if any(x not in RG for x in o + [q['a']]): bad(t, 'glyph', q)
            if t == '2':
                if any(RN.get(k) != q['a'] or G[k] > g for k in q['ks']) or len(set(q['ks'])) != 3: bad(t, 'ans', q)
            if t == '3':
                if RN.get(q['a']) != q['n']: bad(t, 'ans', q)
                if any(RN.get(x) == q['n'] or G[x] > g for x in o): bad(t, 'opt', q)
            if t == '4':
                if q['a'] not in ALL.get(q['w'], []): bad(t, 'ans', q)
                if any(x in ALL.get(q['w'], []) for x in o): bad(t, 'opt-valid', q)
            if t == '5':
                if not all(s.replace('□', q['a']) in ALL for s in q['s']): bad(t, 'ans', q)
                if any(all(s.replace('□', y) in ALL for s in q['s']) for y in o): bad(t, 'opt-fits-all', q)
            if t == '6':
                if q['r'] not in ALL.get(q['a'], []): bad(t, 'ans', q)
                if any(q['r'] in ALL.get(x, []) for x in o): bad(t, 'opt-valid', q)
                if any(x[0] != q['a'][0] for x in o): bad(t, 'kanji', q)
            if t == '7':
                if q['r'] not in ALL.get(q['w'], []) or q['w'][q['h']] != q['a']: bad(t, 'ans', q)
                for y in o:
                    w2 = q['w'][:q['h']] + y + q['w'][q['h'] + 1:]
                    if w2 in ALL: bad(t, 'opt-word', q)
                    if G[y] > g: bad(t, 'grade', q)
            for ch in ''.join(q.get('w', '') + ''.join(q.get('s', [])) + q.get('a', '')):
                if ch in G and G[ch] > g: bad(t, 'grade>' , q); break
print('errors', dict(err))
for t, e in ex.items(): print(t, e)
