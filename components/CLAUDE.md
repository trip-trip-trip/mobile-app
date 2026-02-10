# components/ — 재사용 UI 컴포넌트

## 디렉토리 구조

```
components/
  ui/               # 범용 기본 컴포넌트 (Button, Input, Text 등)
  trip/             # 여행 관련 컴포넌트 (TripCard 등)
  camera/           # 카메라 관련 컴포넌트 (Shutter, ViewFinder 등)
  gallery/          # 갤러리 관련 컴포넌트 (MediaGrid 등)
```

## 작성 규칙

- 2개 이상의 화면에서 사용되는 컴포넌트만 이 디렉토리에 배치
- 단일 화면 전용 컴포넌트는 해당 화면 파일 내부 또는 같은 라우트 폴더에 배치
- 파일명: PascalCase (`TripCard.tsx`, `ShutterButton.tsx`)
- 파일 하나에 컴포넌트 하나 (단일 책임)
- Props 타입을 명시적으로 정의하고 export

## 컴포넌트 파일 템플릿

```tsx
import { StyleSheet } from "react-native";

type Props = {
  // ...
};

const ComponentName = ({ ... }: Props) => {
  return ( ... );
};

export default ComponentName;

const styles = StyleSheet.create({ ... });
```

## ui/ 기본 컴포넌트

프로젝트 전반에서 일관된 디자인을 위해 기본 요소를 래핑:
- `Text` — MonoplexKR 폰트 + 디자인 토큰 적용
- `Button` — 공통 버튼 스타일
- `Input` — 공통 입력 필드
- 이들은 react-native 기본 컴포넌트 대신 사용
