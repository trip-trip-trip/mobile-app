# app/ — Routing & Navigation

Expo Router v6 파일 기반 라우팅. 파일 구조가 곧 라우트 구조.

## Layout 규칙

- `_layout.tsx`는 해당 디렉토리의 네비게이션 구조 정의만 담당
- 비즈니스 로직, 데이터 페칭을 layout에 넣지 않기 (폰트 로딩 등 앱 초기화는 루트 layout 예외)
- 각 layout에서 `screenOptions` 통해 헤더/탭바 스타일 일괄 적용

## Screen 파일 규칙

- `index.tsx`는 해당 라우트의 메인 화면
- 화면 컴포넌트는 단일 default export
- 화면 내 복잡한 섹션은 `components/`의 컴포넌트로 분리
- 화면 파일에 직접 API 호출하지 않기 — 커스텀 훅(`hooks/`)으로 분리

## Navigation Flow

```
app/_layout.tsx (Root Stack)
├── auth/ (인증 전)
│   ├── index.tsx (랜딩 + 소셜 로그인)
│   └── signup.tsx (프로필 설정)
├── (tabs)/_layout.tsx (인증 후 메인)
│   ├── trip/
│   ├── camera/
│   ├── gallery/
│   ├── invite/
│   └── setting/
└── modal.tsx (공용 모달)
```

## 인증 분기

- 인증 상태에 따라 Root Stack에서 `auth` 또는 `(tabs)` 그룹으로 분기
- 인증 상태는 Context로 관리, Root layout에서 조건부 렌더링
