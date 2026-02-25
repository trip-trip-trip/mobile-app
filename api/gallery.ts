// import axiosInstance from "@/api/axios";
// import type {
//   ActiveTripResponse,
//   TripItem,
//   TripsResponse,
// } from "@/types/gallery";

// export type GetTripsParams = Record<string, never>;

// export const getTrips = async (
//   _params?: GetTripsParams
// ): Promise<TripItem[]> => {
//   const { data } = await axiosInstance.get<TripsResponse>("/trips");
//   return (data.result ?? []) as TripItem[];
// };

// export const getActiveTripStatus = async (): Promise<boolean> => {
//   const { data } = await axiosInstance.get<ActiveTripResponse>(
//     "/trips/isActiveTrips"
//   );
//   return Boolean(data.result?.isOngoing);
// };

// api/gallery.ts
import axiosInstance from "@/api/axios";
import type {
  ActiveTripResponse, // { isSuccess, code, message, result: { isOngoing, trip } }
  TripItem,
  TripsResponse,
} from "@/types/gallery";
import { ActiveTripCheckRes } from "@/types/trip"; // trip.ts에서 정의한 타입 재사용

export type GetTripsParams = Record<string, never>;

// GET : 전체 여행 조회
export const getTrips = async (
  _params?: GetTripsParams
): Promise<TripItem[]> => {
  const { data } = await axiosInstance.get<TripsResponse>("/trips");
  // result가 null일 경우를 대비해 빈 배열 반환
  return (data.result ?? []) as TripItem[];
};

/** * 2. 현재 진행 중인 여행 상태 및 데이터 가져오기
 * boolean만 주는 게 아니라 전체 데이터를 주도록 변경
 */
export const getActiveTripData = async (): Promise<ActiveTripCheckRes> => {
  const { data } = await axiosInstance.get<ActiveTripResponse>(
    "/trips/isActiveTrips"
  );

  // 명세서 구조에 따라 data.result 반환 { isOngoing: boolean, trip: Trip[] | null }
  return data.result as ActiveTripCheckRes;
};
