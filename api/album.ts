import axiosInstance from "@/api/axios";
import type { TripDay, TripDetailResponse, TripMember } from "@/types/gallery";
import { getDeviceTimeZone } from "@/utils/date";

// GET : 여행 상세정보 조회(미디어)
// tz(디바이스 타임존)를 넘겨 서버가 사용자 로컬 날짜 기준으로 day를 그룹핑하게 함
export const getTripAlbumDetail = async (
  tripId: number
): Promise<TripDetailResponse> => {
  const { data } = await axiosInstance.get<TripDetailResponse>(
    `/trips/${tripId}`,
    { params: { tz: getDeviceTimeZone() } }
  );
  if (__DEV__) console.log("앨범 상세:", data.result.days[0]);
  return data;
};

export const getTripAlbumDays = async (tripId: number): Promise<TripDay[]> => {
  const result = await getTripAlbumDetail(tripId);
  return result.result.days;
};

// GET : 여행 참여자 목록 조회
export const getTripMembers = async (
  tripId: number
): Promise<TripMember[]> => {
  const { data } = await axiosInstance.get(`/trips/${tripId}/members`);
  return data.result as TripMember[];
};

// GET : 같은 여행 참여자(친구)의 앨범 조회 — 서버에서 참여자 여부 검증
export const getMemberTripAlbumDetail = async (
  tripId: number,
  memberId: number
): Promise<TripDetailResponse> => {
  const { data } = await axiosInstance.get<TripDetailResponse>(
    `/trips/${tripId}/members/${memberId}/media`,
    { params: { tz: getDeviceTimeZone() } }
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
