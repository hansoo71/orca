// Smoke test: report the fitted timing and render every ~0.37s to catch runtime errors.
const { chromium } = require('playwright');
const http = require('http'), fs = require('fs'), path = require('path');
const s = http.createServer((q, r) => fs.readFile(path.join(__dirname, decodeURIComponent(q.url.split('?')[0])),
  (e, d) => { if (e) { r.writeHead(404); r.end(); } else r.end(d); })).listen(8766);
(async () => {
  const b = await chromium.launch(); const p = await b.newPage(); const errs = [];
  p.on('pageerror', e => errs.push(e.message));
  await p.goto('http://127.0.0.1:8766/index.html?capture');
  await p.evaluate(() => window.ready).catch(e => errs.push(String(e)));
  console.log(JSON.stringify(await p.evaluate(() => ({ T: window.TIMING, segs: SEGS.map(s => [s.ns, s.scene || '', +s.m0.toFixed(1), +s.dur.toFixed(1)]) }))));
  for (let T = 0; T < 180 && !errs.length; T += 0.37) await p.evaluate(T => window.render(T), T).catch(e => errs.push(T + ': ' + e.message));
  console.log('errors', errs.slice(0, 5));
  await b.close(); s.close();
})();
