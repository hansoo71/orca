// Run the master timeline once, record every kinetic-type start and camera impact, map them to master time.
const { chromium } = require('playwright');
const http = require('http'), fs = require('fs'), path = require('path');
const srv = http.createServer((q, r) => fs.readFile(path.join(__dirname, decodeURIComponent(q.url.split('?')[0])),
  (e, d) => { if (e) { r.writeHead(404); r.end(); } else r.end(d); })).listen(8767);
(async () => {
  const b = await chromium.launch(); const p = await b.newPage();
  p.on('pageerror', e => console.log('ERR', e.message));
  await p.goto('http://127.0.0.1:8767/index_sfx.html?capture');
  await p.evaluate(() => window.ready);
  const out = await p.evaluate(() => {
    const REG = new Map();
    window.SFX = { reg(o, segs) {
      if (o.stroke || o.t0 === undefined) return;
      const str = typeof segs === 'string' ? segs : segs.map(s => s[0]).join('');
      const key = window.CUR + '|' + o.t0 + '|' + str.slice(0, 16);
      if (REG.has(key)) return;
      const f = o.from || {};
      REG.set(key, { mod: window.CUR, t0: o.t0, text: str, n: [...str].length, size: o.size || 80,
        scale: f.scale || 1, dx: f.dx || 0, dy: f.dy || 0, skew: f.skew || 0, trail: !!o.trail,
        scramble: o.scramble || 0, stagger: o.stagger ?? .03, dur: o.dur ?? .5, fam: o.fam || 'KR' });
    } };
    const FPS = 30, N = 180 * FPS;
    for (let k = 0; k < N; k++) window.render(k / FPS);   // pass 1: register everything that is ever drawn
    window.SFX = null;
    const regs = [...REG.values()];
    const events = [];
    let prevSeg = null, prevSrc = 0;
    for (let k = 0; k < N; k++) {                           // pass 2: map source times to master times
      const T = k / FPS, L = locate(T), seg = L.seg, cur = seg.ns + ':' + (seg.scene || '');
      const from = seg === prevSeg ? prevSrc : seg.a - 1e-6;
      if (L.src > from) {
        for (const r of regs) if (r.mod === cur && r.t0 > from && r.t0 <= L.src) events.push({ T: T - (L.src - r.t0), type: 'kin', ...r });
        for (const im of MODS[seg.ns].impacts) if (im.t > from && im.t <= L.src) events.push({ T: T - (L.src - im.t), type: 'impact', s: im.s, color: im.color, mod: cur });
      }
      prevSeg = seg; prevSrc = L.src;
    }
    return { events, segs: SEGS.map(s => ({ ns: s.ns, scene: s.scene || '', part: s.part, m0: s.m0, dur: s.dur })) };
  });
  fs.writeFileSync(path.join(__dirname, 'sfx_events.json'), JSON.stringify(out));
  const c = {}; out.events.forEach(e => c[e.type] = (c[e.type] || 0) + 1);
  console.log('events', out.events.length, JSON.stringify(c));
  await b.close(); srv.close();
})();
