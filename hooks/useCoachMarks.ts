import type { TutorialStep } from "@/components/tutorial/TutorialOverlay";
import type { TutorialKey } from "@/utils/tutorialStorage";
import { isTutorialSeen, markTutorialSeen } from "@/utils/tutorialStorage";
import { useCallback, useEffect, useRef, useState } from "react";
import type { View } from "react-native";

export type CoachStepDef = {
  key: string;
  text: string;
};

type Rect = { x: number; y: number; width: number; height: number };

const measureNode = (node: View): Promise<Rect | null> =>
  new Promise((resolve) => {
    node.measureInWindow((x, y, width, height) => {
      if (width > 0 && height > 0) resolve({ x, y, width, height });
      else resolve(null);
    });
  });

// 화면별 코치마크 진행 훅
// - tutorialKey: 1회 노출 저장 키
// - stepDefs: 순서대로 보여줄 단계 (key로 targetRef와 매칭)
// - enabled: 대상 UI가 실제로 렌더된 뒤 true로 전달 (데이터 로딩 완료 시점 등)
export const useCoachMarks = (
  tutorialKey: TutorialKey,
  stepDefs: CoachStepDef[],
  enabled: boolean,
) => {
  const nodesRef = useRef<Map<string, View>>(new Map());
  const startedRef = useRef(false);
  const [steps, setSteps] = useState<TutorialStep[]>([]);
  const [visible, setVisible] = useState(false);

  // 각 대상 View에 ref로 붙이는 콜백
  const targetRef = useCallback(
    (key: string) => (node: View | null) => {
      if (node) nodesRef.current.set(key, node);
      else nodesRef.current.delete(key);
    },
    [],
  );

  useEffect(() => {
    if (!enabled || startedRef.current) return;

    let cancelled = false;

    const start = async () => {
      const seen = await isTutorialSeen(tutorialKey);
      if (seen || cancelled || startedRef.current) return;
      startedRef.current = true;

      // 레이아웃/애니메이션이 안정된 뒤 측정
      setTimeout(async () => {
        if (cancelled) return;
        const measured: TutorialStep[] = [];
        for (const def of stepDefs) {
          const node = nodesRef.current.get(def.key);
          if (!node) continue;
          const rect = await measureNode(node);
          if (rect) measured.push({ key: def.key, text: def.text, rect });
        }
        if (!cancelled && measured.length > 0) {
          setSteps(measured);
          setVisible(true);
        }
      }, 500);
    };

    void start();

    return () => {
      cancelled = true;
    };
    // stepDefs는 화면별 상수 배열 — 렌더마다 재생성돼도 재시작하지 않도록 제외
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, tutorialKey]);

  const finish = useCallback(() => {
    setVisible(false);
    void markTutorialSeen(tutorialKey);
  }, [tutorialKey]);

  return { targetRef, steps, visible, finish };
};
