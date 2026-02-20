# auth/ — 로그인 / 회원가입

## 화면 구성

- `index.tsx` — 랜딩 스크린 + Google 소셜 로그인 버튼
- `signup.tsx` — 신규 회원 프로필 설정

## 기능 요구사항

### 로그인 (index)

- Google OAuth 소셜 로그인 단일 방식
- 기존 회원 → 로그인 후 `(tabs)`로 이동
- 신규 회원 → `signup`으로 이동

### 회원가입 (signup)

- 프로필 사진: 선택 사항, 기기 갤러리에서 선택
- 닉네임: 서버에서 자동 생성, 사용자 편집 가능
- ID (고유 식별자): 자동 생성, 사용자 편집 가능, 중복 검증 필요
- 완료 시 `(tabs)`로 이동

## 구현 참고

- expo-auth-session 또는 @react-native-google-signin 활용
- 토큰 저장: expo-secure-store
- 프로필 사진 선택: expo-image-picker

## 디자인

- index.tsx: tripshot/assets/splash-screen/ 경로 에셋의 photo_frame, airplane, ticekt svg 소스가 시간차를 두고 위에서 아래로 페이드 인 애니메이션으로 등장한 뒤(<SplashGraphics/>), 그 아래에 Tripshot /n 여행을 기록하는 새로운 방식 텍스트가 중앙 정렬로 등장, 최종적으로 그 아래에 구글 로그인 버튼 오퍼시티 트랜지션으로 등장
