import axiosInstance from "@/api/axios";
import type { TripDetailResponse, TripMember } from "@/types/gallery";

// GET : 여행 롤별 미디어 조회 (tz는 axios 인터셉터의 X-Timezone 헤더로 전송됨)
export const getTripAlbumDetail = async (
  tripId: number
): Promise<TripDetailResponse> => {
  const { data } = await axiosInstance.get<TripDetailResponse>(
    `/trips/${tripId}`
  );
  if (__DEV__) console.log("앨범 상세:", data.result.rolls?.[0]);
  return data;
};

// POST : 롤 현상 — 봉인된 롤의 내 사진들을 공개 처리
export const developRoll = async (
  tripId: number,
  rollIndex: number
): Promise<void> => {
  await axiosInstance.post(`/trips/${tripId}/rolls/${rollIndex}/develop`);
};

// GET : 여행 참여자 목록 조회
export const getTripMembers = async (
  tripId: number
): Promise<TripMember[]> => {
  const { data } = await axiosInstance.get(`/trips/${tripId}/members`);
  return data.result as TripMember[];
};

// GET : 같은 여행 참여자(친구)의 앨범 조회 — 서버가 참여자 검증, 현상된 미디어만 반환
export const getMemberTripAlbumDetail = async (
  tripId: number,
  memberId: number
): Promise<TripDetailResponse> => {
  const { data } = await axiosInstance.get<TripDetailResponse>(
    `/trips/${tripId}/members/${memberId}/media`
  );
  return data;
};

// const assertOk = async <T>(res: Response): Promise<T> => {
//   const data = (await res.json().catch(() => null)) as T | null;
//   if (!res.ok || !data) throw new Error(`API Error: ${res.status}`);
//   return data;
// };

// POST: 릴스 생성
export async function postCreateReel(tripId: number) {
  const { data } = await axiosInstance.post(`/trips/${tripId}/reel`);
  if (__DEV__) console.log("[REEL POST RESULT]", data);
  return data.result;
}

// GET: 릴스 조회
export const getReel = async (tripId: number) => {
  const { data } = await axiosInstance.get(`/trips/${tripId}/reel`);
  if (!data.isSuccess) throw new Error(data.message);
  if (__DEV__) console.log("[REEL][GET] RAW", data);
  return data.result;
};
