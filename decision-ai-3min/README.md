# 디시전 AI — 3분 통합 모션그래픽

`decision-ai-3min.mp4` (1920×1080, 30fps, 3:00, 스테레오 AAC 192kbps · -17 LUFS)

두 영상을 하나로 합쳤습니다.
- `jev-motion/` — TypeSafe Jev의 용도와 LLM 대비 차별점 (30초판)
- `decision-ai-war/` — 바이라인네트워크 「오픈AI・AWS도 참전, Jev가 터뜨린 '디시전 AI' 전쟁」(2026.10.02) 기반

기존 장면은 그대로 두고, 각 장면이 다 그려진 시점에서 화면을 멈춰(홀드) 읽을 시간을 줍니다. 멈춘 동안에도 배경 그리드, 마키 텍스트, 미세한 줌인은 계속 움직입니다.

## 구성

| 구간 | 파트 | 장면 |
|---|---|---|
| 0:00–0:12 | 인트로 | "2주." → OpenAI · AWS · Cloudflare · NVIDIA → "참전." → 헤드라인 |
| 0:12–0:45 | PART 01 · Jev는 무엇인가 | LLM은 말한다 → 필요한 건 결정 → Jev 타이틀 → 동작 원리 (상태+스키마 → 1-pass → 타입 보장 결정 3개) |
| 0:45–1:31 | PART 02 · LLM 대비 강점 | 193.6× / 444.6× / $7/h → 1 PASS · 70–500ms · $0 · 0% · p=0.96 → LLM vs Jev → 용도 → 에이전트 아키텍처 분화 |
| 1:31–2:06 | PART 03 · 2주 만의 추격전 | 경쟁은 두 갈래 → 타임라인 9개 (Laya → CLM-8B) |
| 2:06–2:44 | PART 04 · 빅테크 참전, 격해지는 시장 | **OpenAI Decisions API vs AWS Strands Decider 집중 조명** → **"시장은 더 격해진다"** (2주 · 15+ 모델 · 빅테크 4곳, 격화 요인 3가지) |
| 2:44–3:00 | 아웃트로 | 경쟁 모델 이름 벽 → "판단은 디시전 모델, 추론은 LLM." → TypeSafe Jev 엔드카드 |

수치는 각 사 발표 기준이고, PART 04의 격화 요인 3가지는 기사 내용을 바탕으로 한 해석입니다(영상에도 표기).

## 구조

- `index.html` — 빌드 결과물 (브라우저로 열면 3분 루프 재생)
- `src/build.py` — 두 영상의 장면 코드를 각각 독립 모듈(W, J)로 감싸고, 새 장면(N)과 마스터 타임라인을 붙여 `index.html` 생성
  - 입력: `../decision-ai-war/index.html`, `../jev-motion/index-30s.html` (스크립트 안의 경로를 맞춰 사용)
- `src/new_scenes.js` — 챕터 카드 4장, 빅테크 집중 조명, 시장 격화 장면
- `src/master.js` — 세그먼트 · 홀드 타임라인. 홀드 길이는 전체가 정확히 180초가 되도록 자동 조정
- `probe.js` — 0.37초 간격으로 전 구간을 렌더링해 런타임 오류 확인

```bash
NODE_PATH=$(npm root -g) node probe.js                          # 타이밍 출력 + 오류 검사
NODE_PATH=$(npm root -g) node render.js stills 20,76,133,152    # 원하는 시점 스틸
NODE_PATH=$(npm root -g) node render.js video                   # decision-ai-3min.mp4 (약 12분)
```

폰트(`fonts/`)는 `jev-motion/README.md`와 같습니다.

## 사운드

배경음과 효과음은 외부 음원 없이 `audio/audio.py`(numpy)로 직접 합성했습니다.

- **효과음 타이밍**: 렌더 엔진을 계측해 화면 속 동작 시점을 그대로 뽑았습니다(`audio/instrument.py` → `audio/extract_sfx.js` → `sfx_events.json`). 멈춤(홀드) 구간을 반영한 마스터 시간 기준입니다.
  - 카메라 임팩트 61개 → 저역 붐 + 노이즈 버스트 (LLM 장면은 거친 디스토션)
  - 글자 슬램 31개 → 킥 + 스냅 + 금속성 링
  - 스큐 인 · 트레일 36개 → 방향에 맞춰 좌우로 흐르는 휘시
  - 스크램블 디코드 50개 → 디지털 블립
  - 작은 텍스트 등장 61개 → 틱, LLM 토큰 스트리밍 → 타자 틱
  - 챕터 카드 4장 앞 → 라이저, 엔드카드 앞 → 스웰
- **배경음**: 96 BPM, A단조(Am–F–C–G). 파트마다 강도가 바뀝니다. PART 01은 패드와 베이스 중심, PART 03~04로 갈수록 킥 · 하이햇 · 클랩 · 아르페지오가 쌓여 시장 격화 구간에서 가장 강해지고, 아웃트로에서 풀리며 페이드아웃합니다. 타격 순간에는 음악 볼륨이 잠깐 내려가 효과음이 묻히지 않게 했습니다.

```bash
python3 audio/instrument.py                         # index_sfx.html 생성 (index.html 위치에서)
NODE_PATH=$(npm root -g) node audio/extract_sfx.js  # sfx_events.json
python3 audio/audio.py                              # soundtrack.wav (pip install numpy)
ffmpeg -i soundtrack.wav -af "lowpass=f=16000,loudnorm=I=-16.5:TP=-3:LRA=11,aresample=48000,alimiter=limit=0.66:level=disabled" master.wav
ffmpeg -i decision-ai-3min-silent.mp4 -i master.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -shortest decision-ai-3min.mp4
```
