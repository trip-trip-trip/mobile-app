export const albumKeys = {
  all: ["album"] as const,
  days: (tripId: number) => [...albumKeys.all, "days", tripId] as const,
  detail: (tripId: number) => [...albumKeys.all, "detail", tripId] as const,
};
