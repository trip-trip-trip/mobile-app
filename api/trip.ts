import axiosInstance from "./axios";
import type { PlaceRes, TripCreateReq, TripRes } from "@/types/trip";

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

export { getPlaces, createTrip };
