export const tripKeys = {
  all: ["trips"] as const,
  list: () => ["trips", "list"] as const,
  activeStatus: () => ["trips", "activeStatus"] as const,
};
