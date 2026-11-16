"""Instagram 'Reviews' highlight: 1080x1920 story cards from the Judge.me reviews.
Photo reviews use pilo-reviews/photos/<file> when it exists, otherwise they are skipped."""
import pathlib, re, sys, json
D = pathlib.Path(__file__).resolve().parent
F = (D / 'fonts').as_uri()
PHOTOS = pathlib.Path(sys.argv[1]) if len(sys.argv) > 1 else D / 'photos'
FX = re.search(r'FX = r"""(.*?)"""', (D / 'make2.py').read_text(), re.S).group(1)

HEAD = f"""<!doctype html><html><head><meta charset="utf-8"><style>
@font-face {{ font-family: 'PF'; src: url('{F}/PlayfairDisplay[wght].ttf'); font-weight: 400 900; }}
@font-face {{ font-family: 'PF'; src: url('{F}/PlayfairDisplay-Italic[wght].ttf'); font-style: italic; font-weight: 400 900; }}
@font-face {{ font-family: 'AR'; src: url('{F}/Cairo[slnt,wght].ttf'); font-weight: 200 1000; }}
* {{ box-sizing: border-box; margin: 0; }}
html, body {{ width: 540px; height: 960px; overflow: hidden; }}
body {{ position: relative; font-family: Inter, sans-serif; color: #fbf7f0;
  background: radial-gradient(80% 55% at 60% 40%, #13294b 0%, #0b1a31 50%, #060e1a 100%); }}
canvas {{ position: absolute; inset: 0; width: 540px; height: 960px; }}
.serif {{ font-family: 'PF', Georgia, serif; font-weight: 400; }}
.ar {{ font-family: 'AR', sans-serif; direction: rtl; }}
.top {{ position: absolute; left: 0; right: 0; top: 132px; display: flex; flex-direction: column; align-items: center; gap: 10px; }}
.top img {{ width: 64px; }}
.eyebrow {{ font-size: 10px; font-weight: 600; letter-spacing: .28em; text-transform: uppercase; color: #8fc6ff; }}
.stars {{ color: #e9c79c; font-size: 26px; letter-spacing: 4px; }}
.card {{ position: absolute; left: 36px; right: 36px; }}
.quote {{ font-size: 42px; line-height: 1.18; letter-spacing: -0.01em; text-wrap: balance; }}
.quote.long {{ font-size: 29px; line-height: 1.32; }}
.mark {{ font-family: 'PF', serif; font-size: 90px; line-height: .6; color: #8fc6ff; opacity: .55; height: 34px; }}
.who {{ margin-top: 22px; font-size: 17px; font-weight: 600; color: #d3dbe6; letter-spacing: .02em; }}
.photo {{ border-radius: 22px; overflow: hidden; box-shadow: 0 24px 60px rgba(0,0,0,.5), 0 0 0 1px rgba(143,198,255,.25); }}
.photo img {{ display: block; width: 100%; height: 100%; object-fit: cover; }}
.foot {{ position: absolute; left: 0; right: 0; bottom: 228px; text-align: center; font-size: 11px; letter-spacing: .16em; text-transform: uppercase; color: #d3dbe6; }}
</style>{FX}</head><body><canvas id="back" width="1080" height="1920"></canvas>"""

def end(seed):
    cfg = {"from": [0.85, 1.0], "ctrl": [1.0, 0.6], "to": [0.75, 0.0], "spread": 0.07, "count": 900, "seed": seed, "mist": True, "wisps": 6, "alpha": 0.55}
    return f'<script>fx("back", {json.dumps(cfg)});</script></body></html>'

TOP = '<div class="top"><img src="logo-white.png"><div class="eyebrow">Reviews</div></div>'
FOOT = '<div class="foot">★ 5.0 · 9 reviews · piloshop.com</div>'

REVIEWS = [
  # (file stem, name, text, photo or None, arabic)
  ('r5-nour', 'Nour', 'Best sleep I had in years!', 'r5-nour.jpg', False),
  ('r1-rehab', 'رحاب', 'بتجنن والله المخدة كتير مريحة بنصح الكل يجربا', 'r1-rehab.jpg', True),
  ('r2-anon', 'Anonymous', 'It helps me sleep better and wake up feeling refreshed. The quality is great, and it’s definitely worth the purchase.', 'r2-anon.jpg', False),
  ('r3-anon', 'Anonymous', 'Super comfortable and soft. Highly recommend!', 'r3-anon.jpg', False),
  ('r4-anon', 'Anonymous', 'Super comfortable! Highly recommend!', 'r4-anon.jpg', False),
  ('t1-tatiana', 'Tatiana H.', 'I already struggle with neck pain, and I’ve noticed a significant decrease since using it. I wake up feeling much better.', None, False),
  ('t2-anon', 'Anonymous', 'Love it, it’s so comfortable! Never going back.', None, False),
  ('t3-anon', 'Anonymous', 'Honestly I haven’t slept better in ages.', None, False),
  ('t4-cyrine', 'Cyrine H.', 'LOVE IT! No other words.', None, False),
]

made = []
def write(name, html):
    (D / f'{name}.html').write_text(html); made.append(name)

# Highlight cover: Instagram crops it to the centre circle.
write('rv-00-cover', HEAD + '''
<div style="position:absolute;left:50%;top:50%;width:300px;height:300px;margin:-150px 0 0 -150px;border-radius:50%;
 background:radial-gradient(circle at 40% 35%, #1c3a66, #0b1a31 70%);box-shadow:0 0 0 2px rgba(143,198,255,.4),0 0 60px rgba(143,198,255,.25);
 display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;">
 <div style="color:#e9c79c;font-size:96px;line-height:1;">★</div>
 <div class="serif" style="font-size:30px;">Reviews</div></div>''' + end(3))

write('rv-01-intro', HEAD + TOP + '''
<div class="card" style="top:300px;text-align:center;">
 <div class="serif" style="font-size:120px;line-height:1;">5.0</div>
 <div class="stars" style="font-size:30px;margin-top:10px;">★★★★★</div>
 <div class="serif" style="font-size:34px;margin-top:26px;line-height:1.2;">What people say<br>after the <em style="color:#8fc6ff;">first night.</em></div>
 <div style="margin-top:22px;font-size:15px;color:#d3dbe6;">9 reviews · tap through →</div>
</div>''' + end(5))

for i, (stem, who, text, photo, ar) in enumerate(REVIEWS):
    qcls = 'quote' + (' long' if len(text) > 70 else '') + (' ar' if ar else ' serif')
    whoh = f'<div class="who{" ar" if ar else ""}">— {who}</div>'
    if photo:
        p = PHOTOS / photo
        if not p.exists():
            print('skip (no photo yet):', photo); continue
        body = (f'<div class="card photo" style="top:200px;height:390px;"><img src="{p.as_uri()}"></div>'
                f'<div class="card" style="top:612px;{"text-align:right;" if ar else ""}"><div class="stars">★★★★★</div>'
                f'<div class="{qcls}" style="margin-top:10px;font-size:{24 if len(text) > 70 else 28}px;">{text}</div>{whoh}</div>')
        write(f'rv-{i+2:02d}-{stem}', HEAD + '<div class="top" style="top:132px;"><div class="eyebrow">Reviews</div></div>' + body + FOOT + end(10 + i))
    else:
        body = (f'<div class="card" style="top:50%;transform:translateY(-55%);"><div class="stars">★★★★★</div><div class="mark" style="margin-top:20px;">“</div>'
                f'<div class="{qcls}">{text}</div>{whoh}</div>')
        write(f'rv-{i+2:02d}-{stem}', HEAD + TOP + body + FOOT + end(10 + i))

write('rv-99-end', HEAD + TOP + '''
<div class="card" style="top:330px;text-align:center;">
 <div class="serif" style="font-size:44px;line-height:1.12;">Your turn to sleep<br><em style="color:#8fc6ff;">better.</em></div>
 <div style="margin:28px auto 0;display:grid;gap:12px;width:300px;text-align:left;font-size:16px;">
  <div>✓ Free delivery across Lebanon</div><div>✓ Pay cash when it arrives</div><div>✓ At your door in 1–5 days</div></div>
 <div style="margin-top:34px;display:inline-block;padding:14px 26px;border-radius:999px;background:#f4ede3;color:#0b1422;font-weight:700;font-size:15px;">piloshop.com</div>
</div>''' + end(99))
print(' '.join(made))
