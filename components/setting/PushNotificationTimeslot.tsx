import { colors } from "@/constants/colors";
import { SLOT_DISPLAY_ORDER, SLOT_LABEL_MAP } from "@/types/setting";
import type { SlotCode } from "@/types/setting";
import { useEffect } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

type Props = {
  isVisible: boolean;
  selectedSlots: Set<string>;
  onToggleSlot: (label: string, code: SlotCode) => void;
};

// 슬롯 섹션 최대 높이 (실제 콘텐츠보다 충분히 크게)
const MAX_HEIGHT = 300;

const SettingTimeslot = ({ isVisible, selectedSlots, onToggleSlot }: Props) => {
  const animatedMaxHeight = useSharedValue(0);
  const animatedOpacity = useSharedValue(0);

  useEffect(() => {
    if (isVisible) {
      animatedMaxHeight.value = withTiming(MAX_HEIGHT, { duration: 250 });
      animatedOpacity.value = withTiming(1, { duration: 250 });
    } else {
      animatedMaxHeight.value = withTiming(0, { duration: 250 });
      animatedOpacity.value = withTiming(0, { duration: 200 });
    }
  }, [isVisible]);

  const containerStyle = useAnimatedStyle(() => ({
    maxHeight: animatedMaxHeight.value,
    opacity: animatedOpacity.value,
    overflow: "hidden",
  }));

  return (
    <Animated.View style={containerStyle}>
      <View style={styles.inner}>
        <View style={styles.textContainer}>
          <Text style={styles.title}>알림 시간대 설정</Text>
          <Text style={styles.subtitle}>선호하는 시간대를 선택해주세요</Text>
        </View>
        <View style={styles.optionBlock}>
          {SLOT_DISPLAY_ORDER.map((label) => {
            const code = SLOT_LABEL_MAP[label];
            const isSelected = selectedSlots.has(label);
            return (
              <Pressable
                key={label}
                onPress={() => onToggleSlot(label, code)}
                style={[
                  styles.slot,
                  { backgroundColor: isSelected ? colors.NAVY : colors.CREAM },
                ]}
              >
                <Text
                  style={[
                    styles.slotText,
                    { color: isSelected ? colors.CREAM : colors.NAVY },
                  ]}
                >
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </Animated.View>
  );
};

export default SettingTimeslot;

const styles = StyleSheet.create({
  inner: {
    gap: 20,
  },
  textContainer: {
    gap: 8,
    marginBottom: 16,
  },
  title: {
    fontFamily: "MonoplexKR-Regular",
    fontSize: 16,
    color: colors.NAVY,
    letterSpacing: -1.6,
  },
  subtitle: {
    fontFamily: "MonoplexKR-Regular",
    fontSize: 12,
    color: colors.NAVY,
  },
  optionBlock: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  slot: {
    width: "31%",
    paddingVertical: 12,
    paddingHorizontal: 12,
    alignItems: "center",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.NAVY,
    backgroundColor: colors.CREAM,
  },
  slotText: {
    fontFamily: "MonoplexKR-Regular",
    fontSize: 14,
    color: colors.NAVY,
  },
});
