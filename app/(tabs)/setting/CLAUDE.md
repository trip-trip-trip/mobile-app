# setting/ — 설정

## 기능 요구사항

### 프로필 관리
- 프로필 사진 변경
- 닉네임 변경
- ID 변경 (중복 검증)

### 푸시 알림 설정
- 알림 시간대 설정 (촬영 리마인더)
- 알림 빈도 조절
- 여행 종료 알림 (현상 준비 완료)

### 기타
- 로그아웃
- 계정 탈퇴
- 앱 버전 정보

## 화면 구성

- `index.tsx` — 설정 목록
- 필요 시 세부 설정 화면 추가 (`profile.tsx`, `notification.tsx` 등)

## 구현 참고

- 프로필 수정: React Query useMutation + 낙관적 업데이트
- 푸시 알림: expo-notifications + FCM
- 이미지 변경: expo-image-picker
