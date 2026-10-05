"""Make index_sfx.html: a copy of index.html that records every kinetic-type start and
exposes each module's camera impacts, so extract_sfx.js can build the SFX timeline.
The visuals are unchanged."""
s = open('index.html').read()
a = "function kin(segs, x, y, o) {\n  const {"
assert a in s
s = s.replace(a, "function kin(segs, x, y, o) {\n  if (window.SFX && o.t < 99) window.SFX.reg(o, segs);\n  const {", 1)
assert s.count("    warm: ") == 3
s = s.replace("    warm: ", "    impacts: IMPACTS,\n    warm: ")
c = "mod.draw(L.src, seg.scene);"
assert c in s
s = s.replace(c, "window.CUR = seg.ns + ':' + (seg.scene || ''); mod.draw(L.src, seg.scene);")
open('index_sfx.html', 'w').write(s)
