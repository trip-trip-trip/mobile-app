import { colors } from "@/constants/colors";
import useToggle from "@/hooks/useToggle";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

type Props = {};

const TRACK_WIDTH = 48;
const TRACK_PADDING = 4;
const THUMB_SIZE = 20;
const TRAVEL = TRACK_WIDTH - TRACK_PADDING * 2 - THUMB_SIZE;

const SettingActivate = ({}: Props) => {
  const [isActive, toggle] = useToggle(false);
  const offset = useSharedValue(0);

  useEffect(() => {
    offset.value = withTiming(isActive ? TRAVEL : 0, { duration: 200 });
  }, [isActive]);

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: offset.value }],
  }));

  return (
    <View style={styles.container}>
      <View style={styles.descriptionContainer}>
        <View style={styles.iconContainer}>
          <Ionicons name="notifications" size={18} color={colors.NAVY} />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title}>순간 기록 알림</Text>
          <Text style={styles.subtitle}>
            여행 중 특별한 순간을 놓치지 않도록 기기 알림을 보내드려요.
          </Text>
        </View>
      </View>
      <Pressable
        onPress={toggle}
        style={[styles.track, isActive && styles.trackActive]}
      >
        <Animated.View
          style={[styles.thumb, isActive && styles.thumbActive, thumbStyle]}
        />
      </Pressable>
    </View>
  );
};

export default SettingActivate;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    alignSelf: "stretch",
  },
  descriptionContainer: {
    flexDirection: "row",
    paddingRight: 20,
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  iconContainer: {
    width: 34,
    padding: 8,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.CREAM,
    borderWidth: 1,
    borderColor: colors.NAVY,
    borderRadius: 17,
  },
  textContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "flex-start",
    gap: 8,
  },
  title: {
    fontFamily: "MonoplexKR-Regular",
    fontSize: 16,
    color: colors.NAVY,
  },
  subtitle: {
    fontFamily: "MonoplexKR-Regular",
    fontSize: 12,
    color: colors.NAVY,
    alignSelf: "stretch",
    lineHeight: 20,
  },
  track: {
    width: TRACK_WIDTH,
    height: THUMB_SIZE + TRACK_PADDING * 2,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.NAVY,
    backgroundColor: colors.CREAM,
    padding: TRACK_PADDING,
    justifyContent: "center",
  },
  trackActive: {
    backgroundColor: colors.NAVY,
  },
  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    backgroundColor: colors.NAVY,
  },
  thumbActive: {
    backgroundColor: colors.CREAM,
  },
});
