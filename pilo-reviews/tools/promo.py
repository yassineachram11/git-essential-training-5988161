"""$55 offer: three 1080x1920 Instagram stories + an animated version of the first."""
import pathlib, re, json
D = pathlib.Path(__file__).resolve().parent
F = (D / 'fonts').as_uri()
FX = re.search(r'FX = r"""(.*?)"""', (D / 'make2.py').read_text(), re.S).group(1)

HEAD = f"""<!doctype html><html><head><meta charset="utf-8"><style>
@font-face {{ font-family: 'PF'; src: url('{F}/PlayfairDisplay[wght].ttf'); font-weight: 400 900; }}
@font-face {{ font-family: 'PF'; src: url('{F}/PlayfairDisplay-Italic[wght].ttf'); font-style: italic; font-weight: 400 900; }}
* {{ box-sizing: border-box; margin: 0; }}
html, body {{ width: 540px; height: 960px; overflow: hidden; }}
body {{ position: relative; font-family: Inter, sans-serif; color: #fbf7f0; text-align: center;
  background: radial-gradient(80% 55% at 55% 45%, #13294b 0%, #0b1a31 50%, #060e1a 100%); }}
canvas {{ position: absolute; inset: 0; width: 540px; height: 960px; }}
.serif {{ font-family: 'PF', Georgia, serif; font-weight: 400; letter-spacing: -0.01em; }}
em {{ font-style: italic; color: #e9c79c; }}
.abs {{ position: absolute; left: 0; right: 0; }}
.eyebrow {{ font-size: 11px; font-weight: 700; letter-spacing: .3em; text-transform: uppercase; color: #8fc6ff; }}
.pill {{ display: inline-block; padding: 8px 16px; border-radius: 999px; background: #e9c79c; color: #0b1422; font-weight: 800; font-size: 13px; letter-spacing: .12em; text-transform: uppercase; }}
.old {{ position: relative; display: inline-block; font-size: 54px; color: #9fb0c6; }}
.old::after {{ content: ''; position: absolute; left: -6px; right: -6px; top: 52%; height: 4px; border-radius: 4px; background: #e58a76; transform-origin: left; transform: rotate(-8deg) scaleX(var(--strike, 1)); }}
.new {{ font-size: 132px; line-height: .95; }}
.pillow {{ position: absolute; filter: drop-shadow(0 0 2px rgba(170,215,255,.9)) drop-shadow(0 30px 40px rgba(0,0,0,.6)); }}
.glow {{ position: absolute; border-radius: 50%; background: radial-gradient(circle, rgba(233,199,156,.32) 0%, rgba(143,198,255,.08) 45%, transparent 68%); }}
.list {{ display: grid; gap: 12px; width: 330px; margin: 0 auto; text-align: left; font-size: 17px; }}
.list div::before {{ content: '✓'; color: #e9c79c; font-weight: 800; margin-right: 10px; }}
</style>{FX}</head><body><canvas id="back" width="1080" height="1920"></canvas>"""

def end(seed):
    cfg = {"from": [0.85, 1.0], "ctrl": [1.0, 0.6], "to": [0.75, 0.0], "spread": 0.07, "count": 800, "seed": seed, "mist": True, "wisps": 5, "alpha": 0.5}
    return f'<script>fx("back", {json.dumps(cfg)});</script></body></html>'

LOGO = '<img src="logo-white.png" style="position:absolute;left:50%;top:132px;width:64px;margin-left:-32px;">'

# 1 — the price drop
S1 = HEAD + LOGO + '''
<div class="abs" style="top:205px;"><span class="pill">Pre-Black Friday</span></div>
<div class="abs serif" style="top:262px;">
  <div class="old" data-old>$80</div>
  <div class="new" data-new>$55</div>
  <div style="font-size:22px;margin-top:6px;color:#d3dbe6;">for Pilo, the neck-support pillow</div>
</div>
<div class="glow" data-glow style="left:50%;top:650px;width:520px;height:520px;margin:-260px 0 0 -260px;"></div>
<img class="pillow" src="angle-n.png" data-pil style="left:110px;top:505px;width:320px;">
<div class="abs" data-ends style="top:722px;font-size:15px;font-weight:700;letter-spacing:.08em;">ENDS FRIDAY, NOV 27</div>
''' + end(7)

# 2 — what you get
S2 = HEAD + LOGO + '''
<div class="abs" style="top:210px;"><div class="eyebrow">Until Friday, Nov 27</div></div>
<div class="abs serif" style="top:245px;font-size:46px;line-height:1.1;">Wake up without<br><em>neck pain.</em></div>
<img class="pillow" src="angle-n.png" style="left:95px;top:385px;width:350px;">
<div class="abs" style="top:600px;">
  <div class="list">
    <div>1 pillow · <b>$55</b> <span style="color:#9fb0c6;text-decoration:line-through;">$80</span></div>
    <div>2 pillows · <b>$100</b> <span style="color:#d3dbe6;">($50 each)</span></div>
    <div>Free delivery across Lebanon</div>
    <div>Pay cash when it arrives</div>
  </div>
</div>
''' + end(9)

# 3 — the deadline + room for the link sticker
S3 = HEAD + LOGO + '''
<div class="abs serif" style="top:220px;font-size:50px;line-height:1.08;">$55 ends<br><em>Friday night.</em></div>
<div class="abs" style="top:355px;font-size:17px;color:#d3dbe6;line-height:1.5;">After Nov 27 at 11 PM,<br>Pilo goes back up.</div>
<div class="abs" style="top:445px;">
  <div style="display:inline-flex;gap:10px;">''' + ''.join(
    f'<div style="width:62px;padding:10px 0;border-radius:14px;background:rgba(255,255,255,.07);border:1px solid rgba(143,198,255,.25);"><div class="serif" style="font-size:30px;">{d}</div><div style="font-size:9px;letter-spacing:.18em;color:#8fc6ff;">{l}</div></div>'
    for d, l in [('N', 'NOV'), ('2', ''), ('7', '')][:0]) + '''
  <div style="padding:14px 22px;border-radius:18px;background:rgba(255,255,255,.07);border:1px solid rgba(143,198,255,.3);">
    <div class="serif" style="font-size:40px;line-height:1;">Fri 27</div><div style="font-size:10px;letter-spacing:.24em;color:#8fc6ff;margin-top:6px;">NOVEMBER · 11 PM</div></div>
  </div>
</div>
<div class="abs" style="top:575px;font-size:14px;letter-spacing:.14em;color:#e9c79c;font-weight:700;">TAP THE LINK ↓</div>
<div style="position:absolute;left:120px;right:120px;top:610px;height:70px;border:1.5px dashed rgba(244,237,227,.25);border-radius:16px;display:grid;place-items:center;font-size:11px;color:rgba(244,237,227,.35);" data-guide>place link sticker here</div>
<div class="abs" style="top:705px;font-size:13px;color:#d3dbe6;">Free delivery · Cash on delivery · piloshop.com</div>
''' + end(11)

for name, html in [('promo-1-price', S1), ('promo-2-offer', S2), ('promo-3-deadline', S3)]:
    (D / f'{name}.html').write_text(html)
# Clean version of story 3 without the sticker guide, for posting.
(D / 'promo-3-deadline-clean.html').write_text(S3.replace('1.5px dashed rgba(244,237,227,.25)', '0').replace('place link sticker here', ''))

# Animated story 1: strike the $80, pop the $55, raise the pillow. Driven by renderAt(t).
ANIM = '''<script>
function clamp(v){return v<0?0:v>1?1:v} function ease(t){return 1-Math.pow(1-t,3)}
function back(t){var c=1.7;return 1+(c+1)*Math.pow(t-1,3)+c*Math.pow(t-1,2)}
window.renderAt=function(t){
 var q=function(s){return document.querySelector(s)};
 var o=q('[data-old]'),n=q('[data-new]'),p=q('[data-pil]'),g=q('[data-glow]'),e=q('[data-ends]');
 o.style.opacity=clamp(t/0.3); o.style.setProperty('--strike',ease(clamp((t-0.6)/0.35)));
 var a=clamp((t-1.05)/0.45); n.style.opacity=a; n.style.transform='scale('+(0.6+0.4*back(a))+')';
 var b=clamp((t-1.6)/0.7); p.style.opacity=b; p.style.transform='translateY('+((1-ease(b))*120+Math.sin(t*2.4)*5)+'px) rotate(-3deg)'; g.style.opacity=b;
 var c=clamp((t-2.3)/0.3); e.style.opacity=c; e.style.transform='translateY('+(1-c)*10+'px)';
 var out=clamp((t-5.6)/0.4); document.body.style.opacity=1-out*0.999;
};
renderAt(0);
</script>'''
(D / 'promo-1-anim.html').write_text(S1.replace('</body>', ANIM + '</body>'))
print('promo-1-price promo-2-offer promo-3-deadline promo-3-deadline-clean')
