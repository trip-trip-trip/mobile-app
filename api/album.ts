import axiosInstance from "@/api/axios";
import type { TripDay, TripDetailResponse } from "@/types/gallery";

// GET : 여행 상세정보 조회(미디어)
export const getTripAlbumDetail = async (
  tripId: number
): Promise<TripDetailResponse> => {
  const { data } = await axiosInstance.get<TripDetailResponse>(
    `/trips/${tripId}`
  );
  console.log("앨범 상세:", data.result.days[0]);
  return data;
};

export const getTripAlbumDays = async (tripId: number): Promise<TripDay[]> => {
  const result = await getTripAlbumDetail(tripId);
  return result.result.days;
};

// const assertOk = async <T>(res: Response): Promise<T> => {
//   const data = (await res.json().catch(() => null)) as T | null;
//   if (!res.ok || !data) throw new Error(`API Error: ${res.status}`);
//   return data;
// };

// POST: 릴스 생성
export async function postCreateReel(tripId: number) {
  const { data } = await axiosInstance.post(`/trips/${tripId}/reel`);
  console.log("[REEL POST RESULT]", data);
  return data.result;
}

// GET: 릴스 조회
export const getReel = async (tripId: number) => {
  const { data } = await axiosInstance.get(`/trips/${tripId}/reel`);
  if (!data.isSuccess) throw new Error(data.message);
  console.log("[REEL][GET] RAW", data);
  return data.result;
};
