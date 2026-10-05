import re
war=open('war/index.html').read(); jev=open('jev30/index.html').read()
M='// ================= SCENES ================='; HUD='// ---------- HUD ----------'
engine=war[:war.index(M)]
cam=engine[engine.index('// ---------- camera impacts'):engine.index('// ---------- drawing primitives')]
engine=engine.replace(cam,'')
engine=engine.replace('// "디시전 AI 전쟁" — 30s kinetic-typography motion graphic','// Decision AI — 3-minute combined cut (TypeSafe Jev explainer + Byline Network "Decision AI war")')
engine=engine.replace("const W = 1920, H = 1080, DUR = 30;","const W = 1920, H = 1080;\nlet LIVE = 0; // master clock for ambient motion (marquees keep moving during holds)")
assert 'let x = ((t * speed * dir) % w + w) % w - w;' in engine
engine=engine.replace('let x = ((t * speed * dir) % w + w) % w - w;','let x = ((LIVE * speed * dir) % w + w) % w - w;')
cam=cam.replace('const IMPACTS = [];','const IMPACTS = [];')  # each module gets its own copy
def block(src):
    i=src.index('// ================= SCENES'); i=src.index('\n',i)
    return src[i:src.index(HUD)]
wsc=block(war); jsc=block(jev)
reps=[("  { v: 0, fmt: () => '$0', label: '출력 토큰 비용', sub: '자연어를 쓰지 않으니 출력 토큰이 없다' },\n",""),
 ("if (t < 7.55 || t > 11.3) return;","const N5 = NUMS.length, END5 = 7.6 + N5 * .9;\n  if (t < 7.55 || t > END5 + .1) return;"),
 ("clamp(Math.floor((t - 7.6) / .9), 0, 3)","clamp(Math.floor((t - 7.6) / .9), 0, N5 - 1)"),
 ("const last = k === 3;","const last = k === N5 - 1;"),
 ("ein(P(t, 11.0, 11.25))","ein(P(t, END5 - .15, END5 + .05))"),
 ("`0${k + 1} / 04`","`0${k + 1} / 0${N5}`")]
for a,b in reps:
    assert a in wsc, a; wsc=wsc.replace(a,b)
newsc=open('full/new_scenes.js').read()
fix=lambda s: re.sub(r'ctx\.globalAlpha = (\w+);', r'ctx.globalAlpha *= \1;', s)
wsc,jsc,newsc=fix(wsc),fix(jsc),fix(newsc)
def module(name, body, draw, warm):
    return f"\n// ================= MODULE {name} =================\nconst MOD_{name} = (() => {{\n{cam}\n{body}\n  return {{\n    draw(t, scene) {{ const [cx, cy] = camera(t); ctx.save(); ctx.translate(cx, cy); {draw} ctx.restore(); flash(t); }},\n    warm: {warm}\n  }};\n}})();\n"
out=engine
out+=module('W', wsc, "s1(t); s2(t); s3a(t); s3b(t); s4(t); s5(t); s6(t); s7(t); s8(t);", "t => env(t, 6.0, 7.2, .3, .5) * .6")
out+=module('J', jsc, "s1(t); s2(t); s3(t); s4(t); s5(t); s6(t); s7(t); s8(t);", "t => env(t, 0, 4.8, .1, .5) + env(t, 21.0, 23.6, .2, .3) * .35")
ndraw = """const CH = { ch1: ['01', 'Jev는 무엇인가', '텍스트를 생성하지 않고, 결정하는 System One 모델'],
                ch2: ['02', 'LLM 대비 강점', '속도 · 비용 · 정확성 · 신뢰도'],
                ch3: ['03', '2주 만의 추격전', 'Jev가 연 시장에 쏟아진 경쟁 모델들'],
                ch4: ['04', '빅테크 참전, 격해지는 시장', 'OpenAI와 AWS가 직접 뛰어들었다'] };
      if (CH[scene]) chapter(t, ...CH[scene]); else if (scene === 'spot') spotlight(t); else if (scene === 'market') market(t);"""
newsc += "\nimpact(.3, 1.1); impact(2.5, .7);\n"
mod_n = module('N', newsc, ndraw, "(t, scene) => scene === 'market' ? env(t, 0, 4.2, .2, .4) * .8 : 0")
# market has its own impacts in local time; spot impacts above share the same local clock (ok: both scenes start at 0)
mod_n = mod_n.replace("impact(.3, 1.1); impact(2.5, .7);", "impact(.3, 1.1, C.llm); impact(2.45, .7); impact(.45, 1.4, C.llm);")
out+=mod_n
out+="\nconst MODS = { W: MOD_W, J: MOD_J, N: MOD_N };\nconst TL_TIMES = [...Array(9)].map((_, k) => 16.4 + k * .88);\n"
out+=open('full/master.js').read()+"\n</script>\n</body></html>\n"
open('full/index.html','w').write(out); print('ok', len(out))
