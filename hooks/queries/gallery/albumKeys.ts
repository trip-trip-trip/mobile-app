export const albumKeys = {
  all: ["album"] as const,
  days: (tripId: number) => [...albumKeys.all, "days", tripId] as const,
  detail: (tripId: number) => [...albumKeys.all, "detail", tripId] as const,
  members: (tripId: number) => [...albumKeys.all, "members", tripId] as const,
  memberDetail: (tripId: number, memberId: number) =>
    [...albumKeys.all, "member", tripId, memberId] as const,
};
