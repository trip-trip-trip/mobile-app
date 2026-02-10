# Tripshot

여행 중 필름 카메라 감성으로 사진/영상을 촬영하고, 여행 종료 후 현상하여 감상하는 모바일 앱.

## Tech Stack

- React Native 0.81 + Expo SDK 54 + Expo Router v6 (file-based routing)
- TypeScript (strict mode)
- TanStack React Query (서버 상태 관리)
- react-native-reanimated (애니메이션)
- react-native-gesture-handler (제스처)

## Project Structure

```
app/              # Expo Router 파일 기반 라우팅
  auth/           # 로그인/회원가입 (스택)
  (tabs)/         # 메인 탭 네비게이션
    trip/         # 여행 생성
    camera/       # 촬영
    gallery/      # 보관함
    invite/       # 친구 초대
    setting/      # 설정
components/       # 재사용 UI 컴포넌트
constants/        # 테마, 색상, 폰트 상수
hooks/            # 커스텀 훅
services/         # API 호출, 외부 서비스 연동
types/            # 공유 타입 정의
utils/            # 유틸리티 함수
```

## Global Conventions

### Naming

- **컴포넌트 파일**: PascalCase (`TripCard.tsx`, `ShutterButton.tsx`)
- **기타 파일**: camelCase (`useCamera.ts`, `tripService.ts`, `colors.ts`)
- **디렉토리**: camelCase 또는 라우트 규칙 따름 (`hooks/`, `components/`)
- **컴포넌트명**: PascalCase (`TripCard`, `ShutterButton`)
- **훅**: camelCase + `use` 접두어 (`useCamera`, `useTripList`)
- **변수 / 함수**: camelCase (`tripData`, `handleSubmit`)
- **타입 / 인터페이스**: PascalCase (`Trip`, `UserProfile`)
- **상수**: UPPER_SNAKE_CASE (`MAX_PHOTOS_PER_DAY`)

### Imports

- path alias `@/*` 사용 (tsconfig paths 설정됨)
- 순서: react/react-native → expo → 외부 라이브러리 → `@/` 내부 모듈 → 상대 경로
- 타입 임포트는 `import type` 사용

### Components

- 화살표 함수 컴포넌트 + `export default`
- Props 타입은 컴포넌트 파일 상단에 `type Props = { ... }` 정의
- `StyleSheet.create()`로 스타일 분리, 인라인 스타일 지양

### State Management

- 서버 상태: TanStack React Query
- 로컬 UI 상태: useState / useReducer
- 전역 클라이언트 상태: React Context (최소한으로)

## Design Tokens

- **Font**: MonoplexKR (Thin ~ Bold, 8 weights + Italic)
- **Colors**:
  - `ink` #1a1a1a — 주요 텍스트, 다크 배경
  - `navy` #335270 — 포인트, 액센트
  - `cream` #e2dfda — 배경, 서브
  - `cloud` #f0f0f0 — 밝은 배경, 구분선
  - `red` #ea4335 — 경고, 강조
- 컬러 weight 변형은 `constants/`에서 관리

## Commands

```bash
npm start          # Expo 개발 서버
npm run ios        # iOS 시뮬레이터
npm run android    # Android 에뮬레이터
npm run lint       # ESLint
```
