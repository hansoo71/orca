// ================= MASTER TIMELINE (3:00) =================
// Each segment plays a range of a source module's timeline and freezes at "hold" points
// (source times where the scene is fully built) so every scene can be read before moving on.
const TOTAL = 180, END_HOLD_MIN = 3;
const PARTS = {
  0: 'DECISION AI · INTRO', 1: 'PART 01 · Jev는 무엇인가', 2: 'PART 02 · LLM 대비 강점',
  3: 'PART 03 · 2주 만의 추격전', 4: 'PART 04 · 빅테크 참전, 격해지는 시장', 5: 'OUTRO'
};
const tlHolds = TL_TIMES.map(s0 => [s0 + .68, 2.6]);
const SEGS = [
  // intro hook + headline (byline piece)
  { ns: 'W', a: 0, b: 6.05, part: 0, holds: [[1.35, 1.6], [1.55 + .29, .45], [1.85 + .29, .45], [2.15 + .29, .45], [2.45 + .29, .45], [3.0, 1.0], [5.4, 3.0]] },
  { ns: 'N', scene: 'ch1', a: 0, b: 2.6, part: 1, holds: [[1.3, 1.2]] },
  // Jev explainer: LLM problem → 결정 → title → mechanism
  { ns: 'J', a: 0, b: 15.55, part: 1, holds: [[3.95, 3.5], [7.1, 2.5], [9.5, 2.5], [11.5, 2.5], [13.2, 3.2], [15.0, 3.5]] },
  { ns: 'N', scene: 'ch2', a: 0, b: 2.6, part: 2, holds: [[1.3, 1.2]] },
  // byline numbers (193.6× / 444.6× / $7/h)
  { ns: 'W', a: 7.5, b: 10.45, part: 2, holds: [[8.2, 2.5], [9.1, 2.5], [10.0, 2.5]] },
  // Jev five differentiators + duel + use cases
  { ns: 'J', a: 15.45, b: 27.25, part: 2, holds: [[16.3, 2.6], [17.4, 2.6], [18.5, 2.6], [19.6, 2.6], [20.7, 2.6], [23.1, 3.5], [26.6, 3.5]] },
  // agent architecture split
  { ns: 'W', a: 11.15, b: 14.05, part: 2, holds: [[11.85, 1.5], [13.6, 3.5]] },
  { ns: 'N', scene: 'ch3', a: 0, b: 2.6, part: 3, holds: [[1.3, 1.2]] },
  // two paths + 2-week timeline
  { ns: 'W', a: 14.05, b: 24.45, part: 3, holds: [[16.0, 3.0], ...tlHolds] },
  { ns: 'N', scene: 'ch4', a: 0, b: 2.6, part: 4, holds: [[1.3, 1.2]] },
  { ns: 'N', scene: 'spot', a: 0, b: 5.8, part: 4, holds: [[2.25, 3.5], [4.15, 3.5], [4.9, 2.5]] },
  { ns: 'N', scene: 'market', a: 0, b: 9.6, part: 4, holds: [[1.3, 1.5], [3.6, 3.0], [5.25, 2.6], [6.25, 2.6], [7.25, 2.6], [8.4, 3.0]] },
  // name wall + verdict + end card
  { ns: 'W', a: 24.35, b: 27.45, part: 5, holds: [[26.6, 3.0]] },
  { ns: 'W', a: 27.35, b: 30.0, part: 5, holds: [[29.6, 2.5]], fadeOut: .35 },
  { ns: 'J', a: 27.1, b: 29.95, part: 5, holds: [[29.95, 0]], fadeIn: .3, end: true }
];
// fit holds so the whole piece lands exactly on TOTAL seconds (end card keeps the remainder)
(function fit() {
  let play = 0, hold = 0;
  for (const s of SEGS) { play += s.b - s.a; for (const h of s.holds) hold += h[1]; }
  const scale = Math.min(1.25, (TOTAL - play - END_HOLD_MIN) / hold);
  let used = 0;
  for (const s of SEGS) { s.holds = s.holds.map(([x, d]) => [x, d * scale]); }
  for (const s of SEGS) { s.dur = (s.b - s.a) + s.holds.reduce((v, h) => v + h[1], 0); used += s.dur; }
  const last = SEGS[SEGS.length - 1];
  last.holds[last.holds.length - 1][1] += TOTAL - used; last.dur += TOTAL - used;
  let m = 0; for (const s of SEGS) { s.m0 = m; m += s.dur; }
  window.TIMING = { play, hold, scale, endHold: last.holds[last.holds.length - 1][1] };
})();
function locate(T) {
  let seg = SEGS[SEGS.length - 1];
  for (const s of SEGS) if (T < s.m0 + s.dur) { seg = s; break; }
  let lt = T - seg.m0, src = seg.a, m = 0, held = 0, totalHold = 0;
  for (const h of seg.holds) totalHold += h[1];
  for (const [x, d] of seg.holds) {
    if (lt < m + (x - src)) return { seg, src: src + (lt - m), held, totalHold, lt };
    m += x - src; src = x;
    if (lt < m + d) return { seg, src: x, held: held + (lt - m), totalHold, lt };
    m += d; held += d;
  }
  return { seg, src: Math.min(seg.b, src + (lt - m)), held, totalHold, lt };
}

function masterBackground(t, warm) {
  ctx.fillStyle = C.bg; ctx.fillRect(-50, -50, W + 100, H + 100);
  ctx.save(); ctx.strokeStyle = 'rgba(120,150,200,0.06)'; ctx.lineWidth = 1;
  const s = 80, off = (t * 12) % s;
  for (let x = -s + off; x < W + s; x += s) { ctx.beginPath(); ctx.moveTo(x, -50); ctx.lineTo(x, H + 50); ctx.stroke(); }
  for (let y = -s + off * .5; y < H + s; y += s) { ctx.beginPath(); ctx.moveTo(-50, y); ctx.lineTo(W + 50, y); ctx.stroke(); }
  ctx.restore();
  const cx = W * .5 + Math.sin(t * .6) * 220, cy = H * .5 + Math.cos(t * .5) * 90;
  const g2 = ctx.createRadialGradient(cx, cy, 0, cx, cy, 1000);
  g2.addColorStop(0, hexA(C.jev, .085)); g2.addColorStop(.5, hexA(C.jev2, .04)); g2.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g2; ctx.fillRect(0, 0, W, H);
  if (warm > 0) {
    const g1 = ctx.createRadialGradient(W * .3, H * .45, 0, W * .3, H * .45, 950);
    g1.addColorStop(0, hexA(C.llm, .11 * warm)); g1.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g1; ctx.fillRect(0, 0, W, H);
  }
}
function masterHud(T, seg) {
  ctx.fillStyle = 'rgba(255,255,255,0.06)'; ctx.fillRect(0, H - 6, W, 6);
  ctx.fillStyle = grad(0, 0, W, 0); ctx.fillRect(0, H - 6, W * (T / TOTAL), 6);
  // chapter ticks on the progress bar
  for (const s of SEGS) if (s.ns === 'N' && s.scene.startsWith('ch')) { ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fillRect(W * s.m0 / TOTAL - 1, H - 10, 2, 10); }
  const a = seg.end ? 1 - P(T - seg.m0, 0, .4) : P(T, .4, .9);
  const mm = String(Math.floor(T / 60)).padStart(2, '0'), ss = String(Math.floor(T % 60)).padStart(2, '0');
  text(PARTS[seg.part], 60, 64, { size: 20, weight: 700, fam: seg.part ? KR : MONO, color: C.dim2, alpha: a });
  text(`${mm}:${ss} / 03:00`, W - 60, 64, { size: 20, weight: 700, fam: MONO, color: C.dim2, align: 'right', alpha: a });
}

window.render = function (T) {
  LIVE = T;
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1;
  const L = locate(T), seg = L.seg, mod = MODS[seg.ns];
  masterBackground(T, mod.warm ? mod.warm(L.src, seg.scene) : 0);
  ctx.save();
  // gentle push-in while a scene is held, so frozen moments still breathe
  const z = 1 + .018 * (L.totalHold ? L.held / L.totalHold : 0);
  ctx.translate(W / 2, H / 2); ctx.scale(z, z); ctx.translate(-W / 2, -H / 2);
  let fa = 1;
  if (seg.fadeIn) fa *= P(L.lt, 0, seg.fadeIn);
  if (seg.fadeOut) fa *= 1 - P(L.lt, seg.dur - seg.fadeOut, seg.dur);
  ctx.globalAlpha = fa;
  mod.draw(L.src, seg.scene);
  ctx.restore();
  vignette(); masterHud(T, seg);
};
window.ready = loadFonts().then(() => { window.render(0); return true; });
if (!location.search.includes('capture')) {
  window.ready.then(() => { const t0 = performance.now(); (function loop() { window.render(((performance.now() - t0) / 1000) % TOTAL); requestAnimationFrame(loop); })(); });
}
