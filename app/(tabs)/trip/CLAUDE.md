# trip/ — 여행 생성

## 기능 요구사항

- 여행 제목 입력 (필수)
- 장소 1개 이상 지정 (필수)
- 여행 일수 설정 (시작일은 현재 날짜로 자동 지정)
- 생성 완료 시 서버에 저장 후 camera 탭 또는 gallery로 이동

## 화면 구성

- `index.tsx` — 여행 생성 폼

## 구현 참고

- 장소 검색/선택: 지도 API 또는 검색 자동완성 활용
- 폼 상태: 로컬 state로 관리 (react-hook-form 도입 검토 가능)
- 생성 API 호출: React Query의 useMutation 사용
