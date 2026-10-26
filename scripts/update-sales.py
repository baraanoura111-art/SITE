#!/usr/bin/env python3
"""Merge newly fetched Property Finder / DLD sales into the tracker data.

Usage: python3 scripts/update-sales.py NEW_ROWS.csv [--today YYYY-MM-DD]
NEW_ROWS.csv columns (header optional): date(YYYY-MM-DD),cluster,price,psf,beds,plot,bua
  cluster = label as shown on Property Finder (Mareva, Mareva 2, Palmiera, Palmiera 3, ...)

Updates data/sales-archive.json (everything, kept forever) and data/sales.json
(only the last 6 months, what the website reads). Prints a summary.
"""
import csv, json, sys, datetime, os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ARC, OUT = os.path.join(ROOT, 'data', 'sales-archive.json'), os.path.join(ROOT, 'data', 'sales.json')
LABEL = {'palmiera':'Palmiera 1','palmiera 1':'Palmiera 1','palmiera 2':'Palmiera 2','palmiera 3':'Palmiera 3',
 'palmiera collective':'Palmiera Collective','mirage':'Mirage','lavita':'Lavita','mareva':'Marèva','marèva':'Marèva',
 'mareva 2':'Marèva 2','marèva 2':'Marèva 2','address villas tierra':'Address Villas Tierra','palace villas ostra':'Palace Villas Ostra'}
def six_months_back(d):
    y, m = d.year, d.month - 6
    if m < 1: m += 12; y -= 1
    import calendar
    return datetime.date(y, m, min(d.day, calendar.monthrange(y, m)[1]))
PSF_KEY = {'Address Villas Tierra': 'Address Tierra', 'Palace Villas Ostra': 'Palace Ostra'}
def update_psf(names, disp):
    """Rewrite the psf block of assets/market.js from the 6-month window (total price / total BUA)
    and bump the ?v= cache-buster on every page that loads market.js."""
    import re, glob, hashlib
    tot = {}
    for x in disp:
        e = tot.setdefault(names[x[1]], [0, 0]); e[0] += x[2]; e[1] += x[4]
    new = {PSF_KEY.get(k, k): str(round(v[0] / v[1])) for k, v in tot.items()}
    mp = os.path.join(ROOT, 'assets', 'market.js')
    s = open(mp, encoding='utf-8').read()
    head, rest = s.split('build: {', 1)
    a, b = head.split('psf: {', 1)
    b = re.sub(r'"([^"]+)": "\d*"', lambda m: '"%s": "%s"' % (m.group(1), new.get(m.group(1), '')) if m.group(1) in new else m.group(0), b)
    s2 = a + 'psf: {' + b + 'build: {' + rest
    if s2 == s:
        print('market.js psf unchanged'); return
    open(mp, 'w', encoding='utf-8').write(s2)
    h = hashlib.md5(s2.encode('utf-8')).hexdigest()[:8]
    for f in glob.glob(os.path.join(ROOT, '**', '*.html'), recursive=True):
        c = open(f, encoding='utf-8').read(); c2 = re.sub(r'market\.js\?v=[0-9a-f]+', 'market.js?v=' + h, c)
        if c != c2: open(f, 'w', encoding='utf-8').write(c2)
    print('market.js psf updated, cache tag', h)
def main():
    a = sys.argv[1:]
    today = datetime.date.today()
    if '--today' in a:
        i = a.index('--today'); today = datetime.date.fromisoformat(a[i+1]); del a[i:i+2]
    arc = json.load(open(ARC)); names = arc['c']; idx = {n: i for i, n in enumerate(names)}
    new, bad = [], []
    for r in csv.reader(open(a[0], encoding='utf-8')):
        if not r or r[0].lower().startswith('date'): continue
        try:
            d, cl, price, psf, beds, plot, bua = [x.strip() for x in r[:7]]
            datetime.date.fromisoformat(d)
            c = idx[LABEL[cl.lower()]]; price, psf, beds, plot, bua = (int(x.replace(',', '')) for x in (price, psf, beds, plot, bua))
            assert abs(price / plot - psf) <= 3, 'price/plot does not match psf'
            assert 3 <= beds <= 8 and 3000 < bua < 40000 and price > 1e6, 'out of range'
            new.append([d, c, price, plot, bua, beds])
        except Exception as e:
            bad.append((r, str(e)))
    if bad:
        print('REJECTED ROWS (not added):'); [print(' ', b) for b in bad]
    if not new:
        print('NO VALID ROWS'); sys.exit(2)
    key = lambda x: tuple(x)
    from collections import Counter
    have = Counter(key(x) for x in arc['s'] if x[0] >= min(n[0] for n in new))
    got = Counter(key(x) for x in new)
    add = []
    for k, n in got.items():
        add += [list(k)] * max(0, n - have.get(k, 0))
    overlap = sum(min(n, have.get(k, 0)) for k, n in got.items())
    arc['s'] = sorted(arc['s'] + add, key=lambda x: (x[0], x[2]), reverse=True)
    json.dump(arc, open(ARC, 'w'), ensure_ascii=False, separators=(',', ':'))
    cut = six_months_back(today).isoformat()
    disp = [x for x in arc['s'] if x[0] >= cut]
    json.dump({'updated': today.isoformat(), 'last': arc['s'][0][0], 'source': arc['source'], 'c': names, 's': disp},
              open(OUT, 'w'), ensure_ascii=False, separators=(',', ':'))
    print(f'fetched {len(new)} rows, added {len(add)}, already known {overlap}, archive {len(arc["s"])}, shown {len(disp)} (since {cut})')
    update_psf(names, disp)
    if overlap == 0:
        print('GAP WARNING: none of the fetched rows were already known, so sales between the last update and the first fetched row may be missing.')
        sys.exit(3)
main()
