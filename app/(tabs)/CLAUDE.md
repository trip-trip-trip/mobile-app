# (tabs)/ — 메인 탭 네비게이션

인증 완료 후 사용자가 상호작용하는 메인 영역.

## 탭 구성

| 탭 | 라우트 | 설명 |
|---|---|---|
| 여행 | `trip/` | 여행 생성 |
| 촬영 | `camera/` | 필름 카메라 촬영 |
| 보관함 | `gallery/` | 여행 폴더 목록 및 미디어 열람 |
| 설정 | `setting/` | 알림, 프로필 설정 |

> `invite/`는 독립 탭이 아닌 gallery 내 진행중 여행에서 진입하는 스택 화면.

## _layout.tsx 규칙

- Bottom Tab Navigator 사용
- 탭바 스타일은 디자인 토큰(ink, cream 등) 활용하여 일관 적용
- `invite`는 탭바에 표시하지 않음 (`href: null` 또는 별도 스택으로 분리)

## 공통 패턴

- 각 탭 폴더 내 `_layout.tsx`는 해당 탭의 스택 네비게이션 정의
- 데이터 페칭은 화면이 아닌 `hooks/`의 React Query 훅으로 분리
- 탭 간 공유 상태가 필요하면 상위 Context 또는 React Query 캐시 활용
