"""Review carousel (Tatiana H.): three 1080x1350 slides in the night style."""
import pathlib, re, json
D = pathlib.Path(__file__).resolve().parent
F = (D / 'fonts').as_uri()
FX = re.search(r'FX = r"""(.*?)"""', (D / 'make2.py').read_text(), re.S).group(1)

HEAD = f"""<!doctype html><html><head><meta charset="utf-8"><style>
@font-face {{ font-family: 'PF'; src: url('{F}/PlayfairDisplay[wght].ttf'); font-weight: 400 900; }}
@font-face {{ font-family: 'PF'; src: url('{F}/PlayfairDisplay-Italic[wght].ttf'); font-style: italic; font-weight: 400 900; }}
* {{ box-sizing: border-box; margin: 0; }}
html, body {{ width: 540px; height: 675px; overflow: hidden; }}
body {{ position: relative; font-family: Inter, sans-serif; color: #fbf7f0;
  background: radial-gradient(80% 60% at 55% 42%, #13294b 0%, #0b1a31 52%, #060e1a 100%); }}
canvas {{ position: absolute; inset: 0; width: 540px; height: 675px; }}
.serif {{ font-family: 'PF', Georgia, serif; font-weight: 400; letter-spacing: -0.01em; }}
em {{ font-style: italic; color: #e9c79c; }}
.stars {{ color: #e9c79c; font-size: 22px; letter-spacing: 4px; }}
.eyebrow {{ font-size: 11px; font-weight: 700; letter-spacing: .28em; text-transform: uppercase; color: #8fc6ff; }}
.logo {{ position: absolute; left: 36px; bottom: 30px; width: 58px; opacity: .9; }}
.page {{ position: absolute; right: 36px; bottom: 34px; font-size: 12px; letter-spacing: .14em; color: #d3dbe6; }}
.pillow {{ position: absolute; filter: drop-shadow(0 0 2px rgba(170,215,255,.9)) drop-shadow(0 26px 34px rgba(0,0,0,.6)); }}
</style>{FX}</head><body><canvas id="back" width="1080" height="1350"></canvas>"""

def end(seed, page):
    cfg = {"from": [0.9, 1.0], "ctrl": [1.0, 0.55], "to": [0.78, 0.0], "spread": 0.07, "count": 700, "seed": seed, "mist": True, "wisps": 5, "alpha": 0.5}
    return f'<img class="logo" src="logo-white.png"><div class="page">{page}</div><script>fx("back", {json.dumps(cfg)});</script></body></html>'

# 1 — the hook: her own words, cut at the moment that makes you want the rest
S1 = HEAD + '''
<div style="position:absolute;left:40px;right:40px;top:96px;">
  <div class="eyebrow">She already had neck pain</div>
  <div class="serif" style="font-size:54px;line-height:1.08;margin-top:22px;">“I’ve noticed a <em>significant decrease</em> since using it.”</div>
  <div style="margin-top:26px;font-size:17px;color:#d3dbe6;line-height:1.5;">She changed one thing at night.<br>Can you guess what?</div>
  <div style="margin-top:34px;display:inline-flex;align-items:center;gap:10px;padding:12px 20px;border-radius:999px;background:#f4ede3;color:#0b1422;font-weight:700;font-size:15px;">Swipe to see →</div>
</div>
''' + end(5, '1 / 3')

# 2 — the full review
S2 = HEAD + '''
<div style="position:absolute;left:40px;right:40px;top:92px;">
  <div class="stars">★★★★★</div>
  <div class="serif" style="font-family:'PF';font-size:84px;line-height:.6;color:#8fc6ff;opacity:.55;margin-top:24px;height:36px;">“</div>
  <div class="serif" style="font-size:27px;line-height:1.34;">Honestly, my sleep has improved so much since I started using Pilo! I already struggle with neck pain, and I’ve noticed a <em>significant decrease</em> since using it. It’s incredibly comfortable throughout the night, and I wake up feeling much better.</div>
  <div style="margin-top:22px;font-size:16px;font-weight:600;color:#d3dbe6;">— Tatiana H. · review on piloshop.com</div>
</div>
''' + end(9, '2 / 3')

# 3 — the product and the offer
S3 = HEAD + '''
<div style="position:absolute;left:0;right:0;top:78px;text-align:center;">
  <div class="eyebrow">The one thing she changed</div>
  <div class="serif" style="font-size:50px;line-height:1.08;margin-top:16px;">Her pillow.</div>
</div>
<div style="position:absolute;left:50%;top:330px;width:460px;height:460px;margin:-230px 0 0 -230px;border-radius:50%;background:radial-gradient(circle, rgba(233,199,156,.3) 0%, rgba(143,198,255,.08) 45%, transparent 68%);"></div>
<img class="pillow" src="angle-n.png" style="left:95px;top:205px;width:350px;">
<div style="position:absolute;left:0;right:0;top:430px;text-align:center;">
  <div style="font-size:15px;color:#d3dbe6;">Pilo · contour memory foam · back & side sleepers</div>
  <div style="margin-top:14px;font-size:17px;"><b>$55</b> <span style="color:#9fb0c6;text-decoration:line-through;">$80</span> until Nov 27</div>
  <div style="margin-top:8px;font-size:14px;color:#d3dbe6;">Free delivery across Lebanon · Pay cash on delivery</div>
  <div style="margin-top:20px;display:inline-block;padding:12px 22px;border-radius:999px;background:#f4ede3;color:#0b1422;font-weight:700;font-size:15px;">Link in bio · piloshop.com</div>
</div>
''' + end(13, '3 / 3')

for n, h in [('post-tatiana-1', S1), ('post-tatiana-2', S2), ('post-tatiana-3', S3)]:
    (D / f'{n}.html').write_text(h)
print('post-tatiana-1 post-tatiana-2 post-tatiana-3')
