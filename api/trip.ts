import axiosInstance from "./axios";
import type {
  ActiveTripCheckRes,
  PlaceRes,
  TripCreateReq,
  TripRes,
  TripUpdateReq,
} from "@/types/trip";
import { getSecureStore } from "@/utils/secureStore";

// GET /trips/places — 인증 불필요
async function getPlaces(): Promise<PlaceRes[]> {
  const { data } = await axiosInstance.get("/trips/places");
  return data.result as PlaceRes[];
}

// POST /trips — access 토큰 필요
async function createTrip(req: TripCreateReq): Promise<TripRes> {
  const { data } = await axiosInstance.post("/trips", req);
  return data.result as TripRes;
}

// GET /trips/isActiveTrips — access 토큰 필요
async function getActiveTrips(): Promise<ActiveTripCheckRes> {
  const accessToken = await getSecureStore("accessToken");

  if (!accessToken) {
    throw new Error("로그인이 필요합니다.");
  }

  const { data } = await axiosInstance.get("/trips/isActiveTrips", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return data.result as ActiveTripCheckRes;
}

// PATCH /trips/{id} — 여행 수정 (title, startDate, endDate, placeIds)
async function updateTrip(id: number, req: TripUpdateReq): Promise<TripRes> {
  const { data } = await axiosInstance.patch(`/trips/${id}`, req);
  return data.result as TripRes;
}

// DELETE /trips/{id} — 여행 삭제 (OWNER만 가능)
async function deleteTrip(id: number): Promise<void> {
  await axiosInstance.delete(`/trips/${id}`);
}

// POST /trips/{id}/end — 여행 수동 종료
async function endTrip(id: number): Promise<TripRes> {
  const { data } = await axiosInstance.post(`/trips/${id}/end`);
  return data.result as TripRes;
}

export { getPlaces, createTrip, getActiveTrips, updateTrip, deleteTrip, endTrip };
