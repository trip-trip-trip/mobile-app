import { colors } from "@/constants/colors";
import { useReels } from "@/hooks/queries/gallery/useReels";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { getTodayYmd } from "@/utils/date";

export default function DevelopingScreen() {
  const params = useLocalSearchParams<{ tripId?: string }>();
  const tripId = useMemo(() => {
    const parsed = Number(params.tripId);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
  }, [params.tripId]);

  const today = getTodayYmd();

  const { checkedExisting } = useReels({
    tripId,
    endDate: today,
    enabled: tripId > 0,
  });

  // 기존 릴스 확인 완료 후 앨범으로 이동
  // 릴스 생성/폴링은 앨범 페이지의 useReels가 이어서 처리
  useEffect(() => {
    if (!checkedExisting) return;
    router.replace(`/(tabs)/gallery/${tripId}` as any);
  }, [checkedExisting, tripId]);

  // 필름 스트립 애니메이션
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    translateX.value = withRepeat(
      withTiming(-40, { duration: 800, easing: Easing.linear }),
      -1,
      false
    );
    opacity.value = withRepeat(
      withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const stripStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const STRIP_COUNT = 20;

  return (
    <View style={styles.container}>
      {/* 필름 스트립 */}
      <View style={styles.filmStrip}>
        <Animated.View style={[styles.filmTrack, stripStyle]}>
          {Array.from({ length: STRIP_COUNT }).map((_, i) => (
            <View key={i} style={styles.filmFrame}>
              <View style={styles.filmHole} />
              <View style={styles.filmCell} />
              <View style={styles.filmHole} />
            </View>
          ))}
        </Animated.View>
      </View>

      {/* 메인 텍스트 */}
      <Animated.Text style={[styles.title, textStyle]}>
        현상 중...
      </Animated.Text>
      <Text style={styles.subtitle}>
        여행의 순간을 필름에 담고 있어요
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.INK,
    alignItems: "center",
    justifyContent: "center",
    gap: 32,
  },
  filmStrip: {
    width: "100%",
    height: 80,
    overflow: "hidden",
    backgroundColor: colors.INK,
  },
  filmTrack: {
    flexDirection: "row",
    height: 80,
  },
  filmFrame: {
    width: 40,
    height: 80,
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderRightWidth: 1,
    borderRightColor: "rgba(255,255,255,0.1)",
  },
  filmHole: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  filmCell: {
    width: 28,
    height: 36,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 2,
  },
  title: {
    fontFamily: "Orbit",
    fontSize: 28,
    color: colors.CREAM,
    letterSpacing: 4,
  },
  subtitle: {
    fontFamily: "MonoplexKR-Regular",
    fontSize: 14,
    color: "rgba(255,255,255,0.5)",
    textAlign: "center",
  },
});
