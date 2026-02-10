# constants/ — 디자인 토큰 & 상수

## 파일 구성

```
constants/
  index.ts          # 배럴 export
  colors.ts         # 색상 팔레트 + weight 변형
  fonts.ts          # 폰트 패밀리, 크기, 줄 높이
  spacing.ts        # 간격 체계 (4px 단위 등)
  media.ts          # 촬영 관련 상수 (MAX_PHOTOS_PER_DAY 등)
```

## 색상 정의 규칙

- 시맨틱 네이밍 사용: `ink`, `navy`, `cream`, `cloud`, `red`
- 각 색상의 weight 변형은 opacity 또는 tint/shade로 생성
- 예: `ink.100`, `ink.200`, ..., `ink.900` 또는 `navy.light`, `navy.dark`

## 사용 규칙

- 컴포넌트에서 하드코딩된 색상값 사용 금지 → 반드시 constants에서 import
- 폰트 이름 직접 문자열 사용 금지 → `fonts.ts`에서 정의된 상수 사용
- 매직 넘버 지양 → spacing, sizing 등도 상수로 정의
