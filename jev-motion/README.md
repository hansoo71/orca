# TypeSafe Jev — 15초 모션그래픽

`typesafe-jev-15s.mp4` (1920×1080, 30fps, 15초, 무음)

| 구간 | 장면 | 메시지 |
|---|---|---|
| 0–3.4s | 기존 LLM | 토큰을 하나씩 생성 → 애매한 답, 파싱 필요, 느림 |
| 3.4–5.7s | 타이틀 | Jev = System One Model, "생성하지 않고 결정한다" |
| 5.7–10s | 동작 원리 | 비정형 상태 + 타입 스키마 → 1-pass 병렬 → 타입 값 + 보정된 확률 3개 동시 출력 |
| 10–13s | 차별점 | 출력 방식 / 속도 / 출력 비용 / 환각·타입 오류 / 신뢰도 비교 |
| 13–15s | 용도 + 엔드카드 | 라우팅, 분류·스코어링, 가드레일, 실시간 분기, 대규모 처리 |

수치는 TypeSafe AI 공개 자료(2026.09 Early Access) 기준 벤더 발표값입니다.

## 다시 렌더링

외부 라이브러리 없이 Canvas 2D로 그리고, Playwright로 프레임을 캡처해 ffmpeg로 인코딩합니다.

```bash
mkdir fonts   # Noto Sans KR 400/700/900 → kr400/kr700/kr900.ttf, JetBrains Mono 500/700 → mono500/mono700.ttf (Google Fonts)
NODE_PATH=$(npm root -g) node render.js stills   # 확인용 스틸 컷
NODE_PATH=$(npm root -g) node render.js video    # typesafe-jev-15s.mp4
```

`index.html`을 로컬 서버로 열면 실시간으로 반복 재생됩니다.

---

# 30초 확장판 (키네틱 타이포그래피)

`typesafe-jev-30s.mp4` (1920×1080, 30fps, 30초, 무음) — 15초판 내용을 30초로 늘리고 글자 단위 키네틱 효과를 더했습니다. 소스: `index-30s.html`, `render-30s.js`.

| 구간 | 장면 | 타이포 효과 |
|---|---|---|
| 0–4.5s | "LLM은 말합니다." 토큰 스트리밍 + 경고 4개 | 스케일 슬램, 토큰 팝, 경고 칩 임팩트, 글리치 아웃 |
| 4.5–7.5s | "자동화에 필요한 건 긴 문장이 아니라 → **결정**" | 스큐 인 + 트레일, 취소선 와이프, 대형 슬램 + 에코, 줌 스루 아웃 |
| 7.5–10s | 타이틀 Jev · SYSTEM ONE MODEL | 스크램블 디코드, 슬램, 트래킹 확장 |
| 10–15.5s | 동작 원리: 상태 + 스키마 → 1-pass → 3개 결정 동시 출력 + 타입 보장 배지 | 코드 스크램블 타이핑, 노드 펄스, 파티클, 카드 하이라이트 스윕 |
| 15.5–21s | 차별점 5개: 1 PASS / 70–500ms / $0 / 0% / p=0.96 | 대형 모노 슬램 + 모션 에코, 배경 마키, 라벨 스큐 인 |
| 21–23.6s | LLM vs Jev 대결 4줄 | 좌우 충돌 슬라이드, 취소선, VS 회전 슬램 |
| 23.6–27.2s | 어디에 쓰나 + "채팅·코드 생성은 여전히 LLM의 몫" | 칩이 사방에서 회전하며 착지 |
| 27.2–30s | 엔드카드 "TypeSafe Jev" | 라인 와이프, 스크램블, 그라디언트 슬램 |

```bash
NODE_PATH=$(npm root -g) node render-30s.js video   # typesafe-jev-30s.mp4
```
