# Tripshot

여행 중 필름 카메라 감성으로 사진/영상을 촬영하고, 여행 종료 후 현상하여 감상하는 모바일 앱.

## Tech Stack

| 영역         | 기술                            |
| ------------ | ------------------------------- |
| Framework    | React Native 0.81 + Expo SDK 54 |
| Routing      | Expo Router v6 (file-based)     |
| Language     | TypeScript (strict mode)        |
| Server State | TanStack React Query            |
| Animation    | react-native-reanimated         |
| Gesture      | react-native-gesture-handler    |

## Getting Started

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm start

# 플랫폼별 실행
npm run ios
npm run android

# 린트
npm run lint
```

## Project Structure

```
app/                  # Expo Router 파일 기반 라우팅
  _layout.tsx         # Root Stack (인증 분기)
  auth/               # 로그인 / 회원가입
  (tabs)/             # 메인 탭 네비게이션
    trip/             #   여행 생성
    camera/           #   촬영
    gallery/          #   보관함
    invite/           #   친구 초대
    setting/          #   설정
components/           # 재사용 UI 컴포넌트
  ui/                 #   기본 요소 (Text, Button, Input)
constants/            # 테마, 색상, 폰트 상수
hooks/                # 커스텀 훅
services/             # API 호출, 외부 서비스 연동
types/                # 공유 타입 정의
utils/                # 유틸리티 함수
```

---

## Conventions

### Git Workflow

#### Branch

- **main** 브랜치에 직접 작업하지 않는다.
- **develop** 브랜치에 merge한다.
- 이슈 기반 브랜치를 생성한다.

```
# 형식
{이슈번호}-{태그}-{설명}

# 예시
1-feat-setting
12-fix-camera-permission
```

- 하이픈(`-`) 사용, 언더스코어(`_`) 사용 금지
- 소문자만 사용, 띄어쓰기 금지

#### Commit

```
# 형식
#{이슈번호} {태그} : {메시지}

# 예시
#4 feat : 로그인 기능 구현
```

| 태그       | 설명                                         |
| ---------- | -------------------------------------------- |
| `feat`     | 새로운 기능 추가                             |
| `fix`      | 버그 수정 또는 typo                          |
| `refactor` | 리팩토링                                     |
| `comment`  | 주석 추가 및 변경                            |
| `style`    | 코드 포맷팅, 세미콜론 누락 (코드 변경 없음)  |
| `test`     | 테스트 코드 추가/수정/삭제                   |
| `chore`    | 빌드 스크립트, assets, 패키지 매니저 등 기타 |
| `rename`   | 파일/폴더명 수정 또는 이동                   |
| `remove`   | 파일 삭제만 수행                             |

#### Issue

GitHub Issue 템플릿 사용:

```markdown
## Description

어떤 작업에 관한 이슈인가요?

## Todo

- [ ] todo

## ETC

기타 사항
```

#### Pull Request

- **Merge 시 최소 1명의 review 필수**
- 혼자 PR 올리고 merge 금지
- `.env` 변경 사항이 있으면 반드시 팀원에게 공유

---

### Naming

| 대상              | 규칙                     | 예시                                |
| ----------------- | ------------------------ | ----------------------------------- |
| 컴포넌트 파일     | PascalCase               | `TripCard.tsx`, `ShutterButton.tsx` |
| 기타 파일         | camelCase                | `useCamera.ts`, `tripService.ts`    |
| 디렉토리          | camelCase / 라우트 규칙  | `hooks/`, `components/`             |
| 컴포넌트명        | PascalCase               | `TripCard`                          |
| 훅                | camelCase + `use` 접두어 | `useCamera`, `useTripList`          |
| 변수 / 함수       | camelCase                | `tripData`, `handleSubmit`          |
| 타입 / 인터페이스 | PascalCase               | `Trip`, `UserProfile`               |
| Enum 타입         | PascalCase               | `TripStatus`                        |
| 상수              | UPPER_SNAKE_CASE         | `MAX_PHOTOS_PER_DAY`                |

### Imports

```tsx
// 1. react / react-native
import { useState } from "react";
import { View, StyleSheet } from "react-native";

// 2. expo
import { Image } from "expo-image";

// 3. 외부 라이브러리
import { useQuery } from "@tanstack/react-query";

// 4. 내부 모듈 (@/ alias)
import { colors } from "@/constants";
import { useTripQuery } from "@/hooks/useTripQuery";

// 5. 상대 경로
import TripCard from "./TripCard";
```

- 타입 임포트는 `import type` 사용

### Components

- 화살표 함수 + `export default`
- Props 타입은 파일 상단에 `type Props = { ... }` 정의
- `StyleSheet.create()`로 스타일 분리, 인라인 스타일 지양
- 2개 이상 화면에서 쓰이는 컴포넌트만 `components/`에 배치
- 단일 화면 전용은 해당 라우트 폴더 내에 배치

```tsx
import { StyleSheet, View } from "react-native";

type Props = {
  title: string;
};

const TripCard = ({ title }: Props) => {
  return <View style={styles.container}>...</View>;
};

export default TripCard;

const styles = StyleSheet.create({
  container: { ... },
});
```

### State Management

| 종류                 | 도구                       |
| -------------------- | -------------------------- |
| 서버 상태            | TanStack React Query       |
| 로컬 UI 상태         | useState / useReducer      |
| 전역 클라이언트 상태 | React Context (최소한으로) |

---

## Design Tokens

### Font

**MonoplexKR** — Thin, ExtraLight, Light, Regular, Text, Medium, SemiBold, Bold (각 Italic 포함)

### Colors

| 이름    | HEX       |
| ------- | --------- |
| `ink`   | `#1a1a1a` |
| `navy`  | `#335270` |
| `cream` | `#e2dfda` |
| `cloud` | `#f0f0f0` |
| `red`   | `#ea4335` |

- 하드코딩 금지 — 반드시 `@/constants`에서 import하여 사용
- 컬러 weight 변형은 `constants/colors.ts`에서 관리
