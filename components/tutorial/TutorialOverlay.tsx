import { colors } from "@/constants/colors";
import { useEffect, useState } from "react";
import {
  Dimensions,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

export type TutorialStep = {
  key: string;
  text: string;
  // 화면(윈도우) 기준 좌표 — measureInWindow 결과
  rect: { x: number; y: number; width: number; height: number };
};

type Props = {
  visible: boolean;
  steps: TutorialStep[];
  onFinish: () => void;
};

const SPOTLIGHT_PADDING = 8;
const TOOLTIP_GAP = 14;

// 대상 버튼만 밝게 뚫린 스포트라이트 오버레이 — 단계별로 안내 문구를 보여준다
const TutorialOverlay = ({ visible, steps, onFinish }: Props) => {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    if (visible) setStepIndex(0);
  }, [visible]);

  if (!visible || steps.length === 0) return null;

  const step = steps[Math.min(stepIndex, steps.length - 1)];
  const isLast = stepIndex >= steps.length - 1;

  const { width: windowWidth, height: windowHeight } =
    Dimensions.get("window");

  const hole = {
    x: Math.max(step.rect.x - SPOTLIGHT_PADDING, 0),
    y: Math.max(step.rect.y - SPOTLIGHT_PADDING, 0),
    width: step.rect.width + SPOTLIGHT_PADDING * 2,
    height: step.rect.height + SPOTLIGHT_PADDING * 2,
  };

  // 말풍선은 대상 아래에, 공간이 없으면 위에 표시
  const spaceBelow = windowHeight - (hole.y + hole.height);
  const tooltipBelow = spaceBelow > 180;

  const handleNext = () => {
    if (isLast) {
      onFinish();
    } else {
      setStepIndex((prev) => prev + 1);
    }
  };

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onFinish}>
      <Pressable style={styles.root} onPress={handleNext}>
        {/* 구멍 뚫린 딤 배경 — 상/하/좌/우 4개 사각형 */}
        <View style={[styles.dim, { top: 0, left: 0, right: 0, height: hole.y }]} />
        <View
          style={[
            styles.dim,
            { top: hole.y + hole.height, left: 0, right: 0, bottom: 0 },
          ]}
        />
        <View
          style={[
            styles.dim,
            { top: hole.y, left: 0, width: hole.x, height: hole.height },
          ]}
        />
        <View
          style={[
            styles.dim,
            {
              top: hole.y,
              left: hole.x + hole.width,
              width: Math.max(windowWidth - (hole.x + hole.width), 0),
              height: hole.height,
            },
          ]}
        />

        {/* 스포트라이트 테두리 */}
        <View
          pointerEvents="none"
          style={[
            styles.spotlightBorder,
            {
              top: hole.y,
              left: hole.x,
              width: hole.width,
              height: hole.height,
            },
          ]}
        />

        {/* 안내 말풍선 */}
        <View
          style={[
            styles.tooltip,
            tooltipBelow
              ? { top: hole.y + hole.height + TOOLTIP_GAP }
              : { bottom: windowHeight - hole.y + TOOLTIP_GAP },
          ]}
        >
          <Text style={styles.tooltipText}>{step.text}</Text>
          <View style={styles.tooltipFooter}>
            {steps.length > 1 && (
              <View style={styles.dots}>
                {steps.map((s, i) => (
                  <View
                    key={s.key}
                    style={[styles.dot, i === stepIndex && styles.dotActive]}
                  />
                ))}
              </View>
            )}
            <View style={{ flex: 1 }} />
            <Pressable onPress={handleNext} hitSlop={8} style={styles.nextBtn}>
              <Text style={styles.nextBtnText}>
                {isLast ? "확인" : "다음"}
              </Text>
            </Pressable>
          </View>
        </View>
      </Pressable>
    </Modal>
  );
};

export default TutorialOverlay;

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  dim: {
    position: "absolute",
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  spotlightBorder: {
    position: "absolute",
    borderWidth: 2,
    borderColor: colors.CREAM,
    borderRadius: 10,
  },
  tooltip: {
    position: "absolute",
    left: 24,
    right: 24,
    backgroundColor: colors.CLOUD,
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  tooltipText: {
    fontFamily: "MonoplexKR-Medium",
    fontSize: 14,
    lineHeight: 21,
    color: colors.INK,
  },
  tooltipFooter: {
    flexDirection: "row",
    alignItems: "center",
  },
  dots: {
    flexDirection: "row",
    gap: 6,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.NAVY + "40",
  },
  dotActive: {
    backgroundColor: colors.NAVY,
  },
  nextBtn: {
    backgroundColor: colors.NAVY,
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 7,
  },
  nextBtnText: {
    fontFamily: "MonoplexKR-Medium",
    fontSize: 13,
    color: colors.CREAM,
  },
});
