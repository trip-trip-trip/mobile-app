import { useMutation } from "@tanstack/react-query";

import { developRoll } from "@/api/album";
import queryClient from "@/api/queryClient";
import { albumKeys } from "@/hooks/queries/gallery/albumKeys";

// 롤 현상 — 성공 시 앨범을 다시 불러와 블러가 해제된 사진을 표시
export const useDevelopRoll = (tripId: number) => {
  return useMutation({
    mutationFn: (rollIndex: number) => developRoll(tripId, rollIndex),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: albumKeys.detail(tripId) });
    },
  });
};
