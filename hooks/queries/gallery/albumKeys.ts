export const albumKeys = {
  all: ["album"] as const,
  days: (tripId: number) => ["album", "days", tripId] as const,
};
