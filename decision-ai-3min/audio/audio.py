"""Synthesize the soundtrack for decision-ai-3min.mp4: a music bed whose energy follows the
chapters, plus sound effects placed on every kinetic-type action and camera impact.
Everything is generated from scratch with numpy (no samples, no external assets)."""
import json, wave
import numpy as np

SR = 48000
TOTAL = 180.0
N = int(SR * TOTAL)
rng = np.random.default_rng(7)
ev = json.load(open('sfx_events.json'))
SEGS = ev['segs']

# ---------------------------------------------------------------- helpers
def t_axis(dur): return np.arange(int(dur * SR)) / SR
def env_ad(n, a, d):  # attack/decay envelope in seconds
    t = np.arange(n) / SR
    return np.minimum(1, t / max(a, 1e-4)) * np.exp(-t / max(d, 1e-4))
def lowpass(x, width):  # box filter via cumulative sum (fast)
    w = max(1, int(width))
    c = np.cumsum(np.concatenate([np.zeros(w), x]))
    return (c[w:] - c[:-w]) / w
def highpass(x, width): return x - lowpass(x, width)
def noise(n): return rng.standard_normal(n)
def add(buf, start, sig, pan=0.0, gain=1.0):
    i = int(start * SR)
    if i >= N or i + len(sig) <= 0: return
    if i < 0: sig = sig[-i:]; i = 0
    sig = sig[:N - i] * gain
    l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    buf[0, i:i + len(sig)] += sig * l * 1.414
    buf[1, i:i + len(sig)] += sig * r * 1.414
def sweep_sine(f0, f1, dur, curve=3.0):
    t = t_axis(dur); k = (t / dur) ** (1 / curve)
    f = f0 + (f1 - f0) * k
    return np.sin(2 * np.pi * np.cumsum(f) / SR)

# ---------------------------------------------------------------- sound effects
def sfx_impact(s, harsh):
    dur = .9
    n = int(dur * SR)
    body = sweep_sine(110, 38, dur, 2.2) * env_ad(n, .002, .28)
    sub = np.sin(2 * np.pi * 42 * t_axis(dur)) * env_ad(n, .01, .4) * .32
    nz = lowpass(noise(n), 6 if harsh else 14) * env_ad(n, .001, .06) * (1.6 if harsh else 1.0)
    click = highpass(noise(n), 3) * env_ad(n, .0005, .006) * .5
    x = body + sub + nz + click
    if harsh: x = np.tanh(x * 2.2) * .7
    return x * (.35 + .55 * min(1.4, s))
def sfx_slam(size):
    dur = .5; n = int(dur * SR)
    k = sweep_sine(160, 48, dur, 2.5) * env_ad(n, .001, .12)
    snap = highpass(noise(n), 2) * env_ad(n, .0005, .025) * .8
    # short metallic ring (inharmonic partials) gives the "type stamp" character
    t = t_axis(dur)
    ring = sum(np.sin(2 * np.pi * f * t) * a for f, a in [(523, .5), (1187, .3), (1903, .2)]) * env_ad(n, .001, .09) * .25
    return (k + snap + ring) * min(1.0, .35 + size / 380)
def sfx_whoosh(dur=.38, up=True, strength=1.0):
    n = int(dur * SR); x = noise(n); out = np.zeros(n)
    chunks = 24
    for c in range(chunks):  # sweeping band-pass built from two box filters per chunk
        a, b = c * n // chunks, (c + 1) * n // chunks
        p = c / (chunks - 1); p = p if up else 1 - p
        w_hi = int(lerp(40, 3, p)); w_lo = w_hi * 4
        seg = x[max(0, a - 400):b]
        bp = lowpass(seg, w_hi) - lowpass(seg, w_lo)
        out[a:b] = bp[-(b - a):]
    shape = np.sin(np.pi * np.linspace(0, 1, n)) ** 1.6
    return out * shape * 1.6 * strength
def lerp(a, b, u): return a + (b - a) * u
def sfx_glitch(dur, vol):
    dur = min(.5, max(.12, dur)); n = int(dur * SR); out = np.zeros(n)
    step = int(.028 * SR); bl = int(.014 * SR)
    t = np.arange(bl) / SR
    for i in range(0, n - bl, step):
        f = rng.choice([880, 1320, 1760, 2349, 2637, 3520])
        sq = np.sign(np.sin(2 * np.pi * f * t)) * np.exp(-t / .006)
        out[i:i + bl] += sq * rng.uniform(.5, 1)
    return lowpass(out, 2) * vol
def sfx_tick(vol=.25, f=2600):
    n = int(.03 * SR); t = np.arange(n) / SR
    return np.sin(2 * np.pi * f * t) * np.exp(-t / .006) * vol
def sfx_riser(dur=1.3):
    n = int(dur * SR); t = t_axis(dur); p = t / dur
    nz = highpass(noise(n), 6) * p ** 2.2 * .5
    tone = sweep_sine(180, 1400, dur, .6) * p ** 2 * .25
    return (nz + tone) * (1 - np.exp(-(dur - t) / .02))

sfx = np.zeros((2, N))
kin_hits = []  # times used to duck the music
def dedupe(items, gap):
    items.sort(key=lambda e: e['T']); out = []
    for e in items:
        if out and e['T'] - out[-1]['T'] < gap:
            if e.get('w', 0) > out[-1].get('w', 0): out[-1] = e
            continue
        out.append(e)
    return out

events = ev['events']
impacts = dedupe([dict(e, w=e['s']) for e in events if e['type'] == 'impact'], .12)
for e in impacts:
    add(sfx, e['T'], sfx_impact(e['s'], e['color'].lower() == '#ff6b5a'), pan=0, gain=.9)
    kin_hits.append((e['T'], min(1, e['s'])))

slams, whooshes, glitches, ticks = [], [], [], []
for e in events:
    if e['type'] != 'kin': continue
    if e['scale'] >= 1.8 and e['size'] >= 46: slams.append(dict(e, w=e['size']))
    if abs(e['dx']) >= 100 or abs(e['skew']) >= .3 or e['trail']: whooshes.append(dict(e, w=e['size']))
    if e['scramble'] > 0: glitches.append(dict(e, w=e['size']))
    if e['scale'] < 1.8 and abs(e['dx']) < 100 and not e['scramble'] and not e['trail']: ticks.append(dict(e, w=e['size']))

for e in dedupe(slams, .09):
    add(sfx, e['T'] + .02, sfx_slam(e['size']), gain=.75)
    kin_hits.append((e['T'], .5))
for e in dedupe(whooshes, .12):
    span = e['stagger'] * e['n'] + e['dur']
    add(sfx, e['T'] - .05, sfx_whoosh(min(.6, .22 + span * .6), up=e['dx'] >= 0, strength=min(1, .4 + e['size'] / 200)),
        pan=-.5 if e['dx'] > 0 else (.5 if e['dx'] < 0 else 0), gain=.55)
for e in dedupe(glitches, .1):
    add(sfx, e['T'], sfx_glitch(e['scramble'] + e['stagger'] * min(e['n'], 12), .10 + min(.12, e['size'] / 900)),
        pan=rng.uniform(-.4, .4), gain=1)
for e in dedupe(ticks, .07):
    add(sfx, e['T'], sfx_tick(.08 + min(.14, e['size'] / 700), 2200 if e['size'] > 60 else 3000), pan=rng.uniform(-.3, .3))

# LLM token stream (scene J s1 draws tokens without kin): soft typewriter ticks
j_first = next(s for s in SEGS if s['ns'] == 'J')
for i in range(19):
    add(sfx, j_first['m0'] + .8 + i * .12, sfx_tick(.12, 1800 + (i % 3) * 300), pan=-.2 + .02 * i)

# risers into each chapter card, swell into the end card
for s in SEGS:
    if s['ns'] == 'N' and s['scene'].startswith('ch'):
        add(sfx, s['m0'] + .25 - 1.3, sfx_riser(1.3), gain=.6)
end_seg = SEGS[-1]
add(sfx, end_seg['m0'] - .9, sfx_riser(1.1), gain=.45)

# ---------------------------------------------------------------- music bed
BPM = 96; BEAT = 60 / BPM; BAR = BEAT * 4
A = 220.0
def note(semi): return A * 2 ** (semi / 12)
# A minor: Am – F – C – G (two bars each)
CHORDS = [[0, 3, 7], [-4, 0, 3], [3, 7, 10], [-2, 2, 5]]
def chord_at(t): return CHORDS[int(t // (BAR * 2)) % 4]

# energy curve per part (0 intro, 1..4 parts, 5 outro)
PART_E = {0: .85, 1: .45, 2: .65, 3: .82, 4: 1.0, 5: .55}
tt = np.arange(N) / SR
energy = np.zeros(N)
for s in SEGS:
    a, b = int(s['m0'] * SR), int((s['m0'] + s['dur']) * SR)
    energy[a:b] = PART_E[s['part']]
energy = lowpass(energy, int(1.2 * SR))  # smooth transitions
fade = np.clip((TOTAL - tt) / 5, 0, 1) * np.clip(tt / 1.0, 0, 1)

music = np.zeros((2, N))
def saw_pad(f, dur, harm=10):
    t = t_axis(dur); x = np.zeros(len(t))
    for det, pan in [(-.08, -.6), (0, 0), (.08, .6)]:
        ff = f * 2 ** (det / 12)
        for h in range(1, harm + 1):
            x += np.sin(2 * np.pi * ff * h * t + rng.uniform(0, 6.28)) / h ** 1.6
    return x / 3
# pads: one chord every 2 bars, long attack/release
t0 = 0.0
while t0 < TOTAL:
    dur = BAR * 2 + 1.5
    ch = chord_at(t0 + .01)
    n = int(dur * SR); envp = np.minimum(1, np.arange(n) / (.8 * SR)) * np.minimum(1, (n - np.arange(n)) / (1.2 * SR))
    sig = sum(saw_pad(note(s), dur) for s in ch) * envp * .055
    add(music, t0, sig, pan=0)
    t0 += BAR * 2
# bass: 8th-note pulse on the root, sub octave
step = BEAT / 2
for k in range(int(TOTAL / step)):
    t = k * step; e = energy[min(N - 1, int(t * SR))]
    if e < .4: continue
    root = note(chord_at(t)[0] - 24)
    n = int(step * .95 * SR); tb = np.arange(n) / SR
    sig = (np.sin(2 * np.pi * root * tb) + .35 * np.sin(2 * np.pi * root * 2 * tb)) * np.exp(-tb / .16)
    accent = 1.0 if k % 2 == 0 else .7
    add(music, t, sig * .10 * accent * min(1, (e - .35) * 2.5))
# kick (four on the floor above .6 energy, half-time otherwise), hats, arp
for k in range(int(TOTAL / BEAT)):
    t = k * BEAT; e = energy[min(N - 1, int(t * SR))]
    if e >= .6 or (e >= .42 and k % 2 == 0):
        n = int(.35 * SR)
        kick = sweep_sine(120, 45, .35, 2.5) * env_ad(n, .001, .09)
        add(music, t, kick * .22 * min(1, e + .1))
    if e >= .6:
        for sub in ([0, .5] if e < .8 else [0, .25, .5, .75]):
            n = int(.05 * SR)
            hat = highpass(noise(n), 2) * env_ad(n, .0005, .012 if sub % .5 else .02)
            add(music, t + sub * BEAT, hat * .05 * (1.3 if sub == .5 else .8), pan=.3)
    if e >= .78 and k % 4 == 2:  # clap on 3 at high energy
        n = int(.18 * SR)
        clap = lowpass(highpass(noise(n), 4), 2) * env_ad(n, .002, .05)
        add(music, t, clap * .09, pan=-.1)
arp_step = BEAT / 4
for k in range(int(TOTAL / arp_step)):
    t = k * arp_step; e = energy[min(N - 1, int(t * SR))]
    if e < .62: continue
    ch = chord_at(t); semi = ch[k % 3] + 12 * (1 + (k // 3) % 2)
    n = int(arp_step * .9 * SR); ta = np.arange(n) / SR
    f = note(semi)
    sig = (np.sin(2 * np.pi * f * ta) + .25 * np.sin(2 * np.pi * f * 3 * ta)) * np.exp(-ta / .07)
    add(music, t, sig * .045 * (e - .55) * 2.2, pan=np.sin(k * .7) * .5)

# simple reverb: FFT convolution with a decaying-noise impulse response
def reverb(x, secs=2.2, wet=.25):
    m = int(secs * SR)
    ir = noise(m) * np.exp(-np.arange(m) / (secs * SR / 6.5))
    ir = lowpass(ir, 6); ir /= np.sqrt(np.sum(ir ** 2))
    L = 1 << int(np.ceil(np.log2(len(x) + m)))
    y = np.fft.irfft(np.fft.rfft(x, L) * np.fft.rfft(ir, L), L)[:len(x)]
    return x + y * wet
music = np.stack([reverb(music[0], 2.4, .35), reverb(music[1], 2.4, .35)])
sfx = np.stack([reverb(sfx[0], 1.2, .18), reverb(sfx[1], 1.2, .18)])

# duck the music under hits so typography punches through
duck = np.ones(N)
for t, s in kin_hits:
    a = int(t * SR); n = int(.45 * SR)
    if a >= N: continue
    shape = 1 - .45 * s * np.exp(-np.arange(min(n, N - a)) / (.12 * SR))
    duck[a:a + len(shape)] = np.minimum(duck[a:a + len(shape)], shape)
duck = lowpass(duck, int(.01 * SR))
mix = music * (duck * fade) * 1.0 + sfx * .85
mix = mix - lowpass(mix[0] * 0 + mix.mean(0), int(SR / 35))[None, :] * .5  # tame sub build-up
mix = np.tanh(mix * 1.1) / np.tanh(1.1)  # gentle soft-clip glue
mix /= np.max(np.abs(mix)) / .89

pcm = (np.clip(mix.T, -1, 1) * 32767).astype('<i2')
with wave.open('soundtrack.wav', 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print('impacts', len(impacts), 'slams', len(dedupe(slams, .09)), 'whooshes', len(dedupe(whooshes, .12)),
      'glitches', len(dedupe(glitches, .1)), 'ticks', len(dedupe(ticks, .07)))
