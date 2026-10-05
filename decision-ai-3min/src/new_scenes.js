// ---- new scenes for the 3-minute cut (local time starts at 0 for each scene) ----
function dot(x, y, r, color, alpha = 1) {
  ctx.save(); ctx.globalAlpha *= alpha; ctx.fillStyle = color; ctx.shadowBlur = 18; ctx.shadowColor = color;
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); ctx.restore();
}

function chapter(t, num, title, sub) {
  const a = env(t, 0, 2.6, .1, .3);
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a;
  const out = { t0: 2.25, dur: .3, dx: -220, skew: .35, stagger: .004 };
  kin(num, W / 2 + 420 - LIVE * 6 % 40, 760, { t, t0: 0, size: 640, weight: 700, fam: MONO, stroke: 2, color: C.jev, alpha: .22, stagger: .08, dur: .6, from: { dx: 500 }, out });
  const lw = expo(P(t, .1, .5)) * (1 - ein(P(t, 2.25, 2.5)));
  ctx.save(); ctx.fillStyle = grad(W / 2 - 300, 0, W / 2 + 300, 0); ctx.shadowBlur = 20; ctx.shadowColor = C.jev;
  ctx.fillRect(W / 2 - 300 * lw, 470, 600 * lw, 3); ctx.restore();
  kin(`PART ${num}`, W / 2, 430, { t, t0: .1, size: 40, weight: 700, fam: MONO, color: C.jev, stagger: .03, dur: .25, scramble: .3, spacing: lerp(4, 16, eo(P(t, .1, 2))), out });
  kin(title, W / 2, 600, { t, t0: .25, size: 120, weight: 900, stagger: .04, dur: .3, from: { scale: 2.4 }, maxW: 1640, glow: 24, glowColor: hexA(C.jev, .35), out });
  kin(sub, W / 2, 700, { t, t0: .6, size: 42, weight: 700, color: C.dim, stagger: .014, dur: .25, from: { dy: 30 }, out });
  ctx.restore();
}

// Big-tech spotlight: OpenAI Decisions API vs AWS Strands Decider (local 0 – 5.8)
const SPOT = [
  { head: 'OPENAI · DEVDAY', name: 'Decisions API', tag: '2026.09.29 · 제한적 프리뷰', col: C.jev2, dir: -1,
    lines: ['경량 모델 GPT-6 Luna를 선택 문제에 집중', '문장 대신, 미리 정의한 선택지 중 하나', '분류 · 요청 라우팅 · 에이전트 다음 액션', '텍스트 + 이미지 컨텍스트로 확률 출력'],
    punch: '→ 자사 API 생태계로 판단 계층 흡수' },
  { head: 'AWS · AMAZON WEB SERVICES', name: 'Strands Decider 2B', tag: '2026.10.01 · Apache 2.0 전면 공개', col: C.jev, dir: 1,
    lines: ['1.9B · LM 헤드 제거, 1M 프런티어 헤드', 'RTX 3090 115ms · 같은 상태 다중 질문', '라우팅 · 도구 선정 · 가드레일 · 평가', '가중치 · 학습 데이터 · 스크립트 공개'],
    punch: '→ 에이전트 프레임워크에 그대로 탑재' }
];
function spotCard(t, x, y, w, h, t0, d) {
  const u = expo(P(t, t0, t0 + .45));
  if (u <= 0) return;
  ctx.save(); ctx.translate(d.dir * 240 * (1 - u), 0);
  card(x, y, w, h, { alpha: u, stroke: hexA(d.col, .65), glow: 40 * u, glowColor: hexA(d.col, .25) });
  kin(d.head, x + 44, y + 70, { t, t0: t0 + .1, size: 26, weight: 700, fam: MONO, color: d.col, align: 'left', stagger: .01, dur: .2, scramble: .25 });
  kin(d.name, x + 44, y + 172, { t, t0: t0 + .15, size: 80, weight: 900, align: 'left', stagger: .025, dur: .3, from: { dx: d.dir * 140, skew: -.4 * d.dir }, trail: 1, maxW: w - 88 });
  const pu = eback(P(t, t0 + .4, t0 + .65));
  if (pu > 0) { ctx.save(); ctx.globalAlpha *= clamp(pu); pill(d.tag, x + 44, y + 205, { size: 26, color: d.col }); ctx.restore(); }
  d.lines.forEach((l, i) => {
    const lu = P(t, t0 + .55 + i * .18, t0 + .75 + i * .18);
    if (lu > 0) dot(x + 54, y + 342 + i * 72, 5, d.col, lu);
    kin(l, x + 76, y + 352 + i * 72, { t, t0: t0 + .55 + i * .18, size: 32, weight: 700, align: 'left', stagger: .008, dur: .25, from: { dy: 24 }, maxW: w - 120 });
  });
  kin(d.punch, x + 44, y + 640, { t, t0: t0 + 1.4, size: 36, weight: 900, color: d.col, align: 'left', stagger: .015, dur: .3, from: { scale: 1.8 }, maxW: w - 88 });
  ctx.restore();
}
function spotlight(t) {
  const a = env(t, 0, 5.8, .15, .35);
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a;
  marquee('OPENAI  ×  AWS  ×  OPENAI  ×  AWS  ×  ', 1010, { t, size: 170, fam: MONO, weight: 700, speed: 150, alpha: .06, stroke: 2, color: C.jev });
  kin([['빅테크가 ', C.text], ['직접', C.llm], [' 뛰어들었다', C.text]], W / 2, 150, { t, t0: .1, size: 80, weight: 900, stagger: .035, dur: .3, from: { scale: 2.4 } });
  spotCard(t, 100, 220, 830, 690, .5, SPOT[0]);
  spotCard(t, 990, 220, 830, 690, 2.4, SPOT[1]);
  kin('VS', W / 2 + 0, 580, { t, t0: 2.35, size: 46, weight: 700, fam: MONO, color: C.dim, stagger: .05, dur: .25, from: { scale: 3, rot: .6 } });
  kin([['+ Cloudflare Clef', C.text], ['  Jev API 100% 호환', C.jev], ['    ·    + NVIDIA × Stanford CLM-8B', C.text]], W / 2, 985,
      { t, t0: 4.3, size: 32, weight: 700, stagger: .01, dur: .25, from: { dy: 30 } });
  ctx.restore();
}

// Market escalation (local 0 – 9.6)
const STATS = [
  { v: 2, fmt: v => Math.round(v) + '주', label: 'Jev 공개 후 경과', sub: '경쟁작이 쏟아지기까지' },
  { v: 15, fmt: v => Math.round(v) + '+', label: '경쟁 디시전 모델', sub: '오픈소스 · 상용 API · 연구 모델' },
  { v: 4, fmt: v => Math.round(v) + '곳', label: '빅테크 참전', sub: 'OpenAI · AWS · Cloudflare · NVIDIA' }
];
const FORCES = [
  { n: '01', title: '판단 계층이 플랫폼 기본 기능으로', desc: 'OpenAI는 API로, AWS는 Strands 에이전트 프레임워크로 직접 제공' },
  { n: '02', title: '오픈 웨이트 확산 → 가격 압박', desc: 'AWS · Cloudflare · Laya · GLiNER 모두 Apache 2.0 공개' },
  { n: '03', title: 'API 호환 경쟁 → 갈아타기 쉬워짐', desc: 'Clef는 엔드포인트와 모델명만 바꾸면 Jev 대체 가능' }
];
function market(t, IMP) {
  const a = env(t, 0, 9.6, .15, .35);
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a;
  // phase 1: headline + heat bar + stats
  const p1 = 1 - eio(P(t, 3.95, 4.25));
  if (p1 > 0) {
    ctx.save(); ctx.globalAlpha *= p1;
    marquee('ESCALATION  ·  격화  ·  ESCALATION  ·  격화  ·  ', 1010, { t, size: 160, fam: MONO, weight: 700, speed: -200, alpha: .06, stroke: 2, color: C.llm });
    kin('시장은', W / 2, 190, { t, t0: .05, size: 60, weight: 700, stagger: .04, dur: .3, from: { dy: 40 } });
    kin([['더 ', C.text], ['격해진다', C.llm]], W / 2, 380, { t, t0: .3, size: 190, weight: 900, stagger: .07, dur: .28, from: { scale: 3 }, glow: 50, glowColor: hexA(C.llm, .5) });
    const x0 = 360, x1 = 1560, by = 450, fu = expo(P(t, .7, 1.4));
    ctx.save(); ctx.fillStyle = 'rgba(255,255,255,0.08)'; rrect(x0, by, x1 - x0, 18, 9); ctx.fill();
    ctx.fillStyle = grad(x0, 0, x1, 0, C.warn, C.llm); ctx.shadowBlur = 30; ctx.shadowColor = C.llm;
    rrect(x0, by, Math.max(18, (x1 - x0) * fu), 18, 9); ctx.fill(); ctx.restore();
    text('Jev 공개', x0, by + 52, { size: 24, weight: 700, fam: MONO, color: C.dim, alpha: eo(P(t, .8, 1.1)) });
    text('2주 후 · 빅테크 참전', x1, by + 52, { size: 24, weight: 700, color: C.llm, align: 'right', alpha: eo(P(t, 1.2, 1.5)) });
    STATS.forEach((s, i) => {
      const cx = 480 + i * 480, t0 = 1.6 + i * .35, u = expo(P(t, t0, t0 + .3));
      if (u <= 0) return;
      ctx.save(); ctx.globalAlpha *= clamp(u * 2); ctx.translate(cx, 720); ctx.scale(lerp(2, 1, u), lerp(2, 1, u));
      setFont(150, 700, MONO); ctx.textAlign = 'center'; ctx.shadowBlur = 40; ctx.shadowColor = hexA(C.llm, .5);
      ctx.fillStyle = grad(-150, -100, 150, 0, C.warn, C.llm); ctx.fillText(s.fmt(s.v * eo(P(t, t0, t0 + .5))), 0, 0); ctx.restore();
      kin(s.label, cx, 800, { t, t0: t0 + .2, size: 40, weight: 900, stagger: .02, dur: .25, from: { dy: 30 } });
      kin(s.sub, cx, 850, { t, t0: t0 + .3, size: 24, weight: 500, color: C.dim, stagger: .006, dur: .2 });
    });
    ctx.restore();
  }
  // phase 2: three forces
  if (t > 4.25) {
    kin([['경쟁이 격해지는 ', C.text], ['3가지 이유', C.llm]], W / 2, 170, { t, t0: 4.3, size: 64, weight: 900, stagger: .03, dur: .3, from: { scale: 2.2 } });
    FORCES.forEach((f, i) => {
      const t0 = 4.45 + i, y = 250 + i * 205, u = expo(P(t, t0, t0 + .45));
      if (u <= 0) return;
      ctx.save(); ctx.translate(300 * (1 - u), 0);
      card(210, y, 1500, 180, { alpha: u, stroke: hexA(C.llm, .5), glow: 30 * u, glowColor: hexA(C.llm, .18) });
      ctx.restore();
      kin(f.n, 260, y + 122, { t, t0: t0 + .05, size: 96, weight: 700, fam: MONO, align: 'left', gradient: [C.warn, C.llm], stagger: .06, dur: .25, scramble: .2 });
      kin(f.title, 450, y + 82, { t, t0: t0 + .12, size: 54, weight: 900, align: 'left', stagger: .022, dur: .3, from: { dx: 160, skew: -.4 }, trail: 1, maxW: 1220 });
      kin(f.desc, 450, y + 140, { t, t0: t0 + .35, size: 30, weight: 500, color: C.dim, align: 'left', stagger: .006, dur: .2, from: { dy: 16 }, maxW: 1220 });
    });
    kin([['LLM이 독점하던 ', C.text], ["'판단'", C.jev], [', 이제 모두가 노린다', C.text]], W / 2, 975,
        { t, t0: 7.55, size: 54, weight: 900, stagger: .025, dur: .3, from: { scale: 2.2 }, glow: 20, glowColor: hexA(C.jev, .35) });
    text('※ 전망은 바이라인네트워크 보도 내용을 바탕으로 한 해석입니다', W - 120, 1040, { size: 20, weight: 400, color: C.dim, align: 'right', alpha: eo(P(t, 4.6, 5)) });
  }
  ctx.restore();
}
