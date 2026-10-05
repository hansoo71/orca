// Usage: node render.js [stills|video]
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const DIR = __dirname, FPS = 30, DUR = 30;
const mode = process.argv[2] || 'video';

const server = http.createServer((req, res) => {
  const f = path.join(DIR, decodeURIComponent(req.url.split('?')[0]));
  fs.readFile(f, (e, d) => { if (e) { res.writeHead(404); res.end(); } else res.end(d); });
}).listen(8765);

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  await page.goto('http://127.0.0.1:8765/index-30s.html?capture');
  await page.evaluate(() => window.ready);
  const grab = async t => {
    const url = await page.evaluate(t => { window.render(t); return document.getElementById('c').toDataURL('image/png'); }, t);
    return Buffer.from(url.split(',')[1], 'base64');
  };
  if (mode === 'stills') {
    fs.mkdirSync(path.join(DIR, 'stills'), { recursive: true });
    for (const t of (process.argv[3] ? process.argv[3].split(',').map(Number) : [2.6, 4.0, 6.6, 9.2, 13.4, 14.4, 16.4, 19.7, 23.3, 26.8, 29.6, 0.6]))
      fs.writeFileSync(path.join(DIR, 'stills', `t${t.toFixed(1)}.png`), await grab(t));
  } else {
    const out = path.join(DIR, 'typesafe-jev-30s.mp4');
    const ff = spawn('ffmpeg', ['-y', '-f', 'image2pipe', '-framerate', String(FPS), '-i', '-',
      '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-preset', 'medium', '-movflags', '+faststart', out],
      { stdio: ['pipe', 'ignore', 'inherit'] });
    for (let i = 0; i < FPS * DUR; i++) {
      const buf = await grab(i / FPS);
      if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    }
    ff.stdin.end();
    await new Promise(r => ff.on('close', r));
    console.log('wrote', out);
  }
  await browser.close(); server.close();
})();
