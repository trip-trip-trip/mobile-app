import { useQuery } from "@tanstack/react-query";

import { getActiveTripStatus } from "@/api/gallery";
import { tripKeys } from "@/hooks/queries/gallery/tripKeys";

export const useActiveTripStatusQuery = () => {
  return useQuery<boolean, Error>({
    queryKey: tripKeys.activeStatus(),
    queryFn: getActiveTripStatus,
    staleTime: 10_000,
    gcTime: 60_000,
  });
};
