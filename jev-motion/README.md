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
