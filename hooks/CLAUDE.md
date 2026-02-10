# hooks/ — 커스텀 훅

## 작성 규칙

- 파일명: camelCase (`useAuth.ts`, `useTripQuery.ts`)
- 하나의 파일에 하나의 훅 (단일 책임)
- React Query 기반 훅은 `use[리소스]Query.ts` / `use[리소스]Mutation.ts` 패턴

## 파일 구성 예시

```
hooks/
  useAuth.ts               # 인증 상태, 로그인/로그아웃
  useTripQuery.ts          # 여행 목록/상세 조회
  useTripMutation.ts       # 여행 생성/수정/삭제
  useCameraPermission.ts   # 카메라 권한
  usePhotoLimit.ts         # 일일 촬영 제한 체크
  useNotifications.ts      # 푸시 알림 설정
```

## React Query 훅 패턴

```tsx
// useTripQuery.ts
import { useQuery } from "@tanstack/react-query";
import { tripService } from "@/services/trip";

export const useTripList = () => {
  return useQuery({
    queryKey: ["trips"],
    queryFn: tripService.getList,
  });
};
```

- queryKey는 배열 형태, 리소스명 + 파라미터로 구성
- queryFn은 services/에 정의된 API 함수 호출
- 에러/로딩 처리는 훅을 사용하는 화면에서 담당
