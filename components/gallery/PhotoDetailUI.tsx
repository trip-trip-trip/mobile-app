import DownWhiteIcon from "@/assets/icons/down_white.svg";
import { colors } from "@/constants/colors";
import { DetailMediaItem } from "@/types/gallery";
import { formatEnglishDate } from "@/utils/date";
import { Ionicons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import { useVideoPlayer, VideoView } from "expo-video";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Dimensions,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

type Props = {
  items: DetailMediaItem[];
  initialIndex: number;
  onClose: () => void;
  onDownload?: (item: DetailMediaItem) => void;
};

const { width: W } = Dimensions.get("window");
const CLOSE_UP_THRESHOLD = -90;
const CLOSE_DOWN_THRESHOLD = 90;

const AFlatList = Animated.createAnimatedComponent(
  // @ts-expect-error
  require("react-native").FlatList
);

function fmt(sec: number) {
  const s = Math.max(0, Math.floor(sec || 0));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, "0")}`;
}

function VideoSlide({
  uri,
  isActive,
  uiVisible,
}: {
  uri: string;
  isActive: boolean;
  uiVisible: Animated.SharedValue<number>;
}) {
  const player = useVideoPlayer(uri, (p) => {
    p.loop = false;
    p.muted = false;
  });

  const [duration, setDuration] = useState(0);
  const [pos, setPos] = useState(0);
  const [isSliding, setIsSliding] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  // ✅ 활성 슬라이드만 재생(기본: 활성되면 자동재생)
  useEffect(() => {
    if (!player) return;
    try {
      if (isActive) {
        player.play();
        setIsPlaying(true);
      } else {
        player.pause();
        setIsPlaying(false);
      }
    } catch {}
  }, [isActive, player]);

  // ✅ currentTime/duration 폴링 (버전차이 대응용)
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      try {
        const d = (player as any)?.duration ?? 0;
        const t =
          (player as any)?.currentTime ?? (player as any)?.position ?? 0;

        if (!isSliding) setPos(Number(t) || 0);
        if (d) setDuration(Number(d) || 0);
      } catch {}
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [player, isSliding]);

  const controlsStyle = useAnimatedStyle(() => ({
    opacity: withTiming(uiVisible.value, { duration: 160 }),
  }));

  const seekTo = (t: number) => {
    try {
      if ((player as any)?.seekTo) (player as any).seekTo(t);
      else if ("currentTime" in (player as any))
        (player as any).currentTime = t;
      else if ("position" in (player as any)) (player as any).position = t;
    } catch {}
  };

  const togglePlay = () => {
    try {
      if (isPlaying) {
        player.pause();
        setIsPlaying(false);
      } else {
        player.play();
        setIsPlaying(true);
      }
    } catch {}
  };

  return (
    <View style={{ flex: 1 }}>
      <VideoView player={player} style={styles.media} nativeControls={false} />

      {/* 영상 컨트롤바 */}
      <Animated.View
        style={[styles.videoControls, controlsStyle]}
        pointerEvents="auto"
        onStartShouldSetResponder={() => true}
        onMoveShouldSetResponder={() => true}
      >
        <View style={styles.videoControlsRow} pointerEvents="auto">
          {/* 재생/멈춤 버튼 */}
          <Pressable onPress={togglePlay} hitSlop={12} style={styles.playBtn}>
            <Pressable onPress={togglePlay} hitSlop={12} style={styles.playBtn}>
              <Ionicons
                name={isPlaying ? "pause" : "play"}
                size={23}
                color="white"
              />
            </Pressable>
          </Pressable>

          <Text style={styles.timeText}>{fmt(pos)}</Text>

          <Slider
            style={{ flex: 1, marginHorizontal: 10 }}
            minimumValue={0}
            maximumValue={Math.max(0.01, duration || 0.01)}
            value={Math.min(pos, duration || pos)}
            onSlidingStart={() => {
              setIsSliding(true);
              // 드래그 중엔 일시정지
              try {
                player.pause();
              } catch {}
            }}
            onValueChange={(v) => {
              setPos(v);
            }}
            onSlidingComplete={(v) => {
              seekTo(v);
              setIsSliding(false);
              // 드래그 끝나면 다시 재생
              try {
                player.play();
                setIsPlaying(true);
              } catch {}
            }}
            minimumTrackTintColor="white"
            maximumTrackTintColor="rgba(255,255,255,0.35)"
            thumbTintColor="white"
          />

          <Text style={styles.timeText}>{fmt(duration)}</Text>
        </View>
      </Animated.View>
    </View>
  );
}

const PhotoDetailUI = ({ items, initialIndex, onClose, onDownload }: Props) => {
  const listRef = useRef<any>(null);
  const [index, setIndex] = useState(Math.max(0, initialIndex));
  const current = items[index];

  // UI 토글 (1=보임, 0=숨김)
  const ui = useSharedValue(1);

  // 위/아래로 스와이프해서 닫기
  const translateY = useSharedValue(0);

  const uiStyle = useAnimatedStyle(() => ({
    opacity: withTiming(ui.value, { duration: 160 }),
  }));

  const bottomUiStyle = useAnimatedStyle(() => ({
    opacity: withTiming(ui.value, { duration: 160 }),
  }));

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const toggleUI = useCallback(() => {
    ui.value = ui.value ? 0 : 1;
  }, [ui]);

  const tapGesture = useMemo(
    () =>
      Gesture.Tap()
        .maxDuration(250)
        .onEnd(() => {
          runOnJS(toggleUI)();
        }),
    [toggleUI]
  );

  const panGesture = useMemo(
    () =>
      Gesture.Pan()
        .activeOffsetY([-12, 12])
        .failOffsetX([-12, 12])
        .onUpdate((e) => {
          translateY.value = e.translationY;
        })
        .onEnd(() => {
          const shouldClose =
            translateY.value < CLOSE_UP_THRESHOLD ||
            translateY.value > CLOSE_DOWN_THRESHOLD;

          if (shouldClose) {
            runOnJS(onClose)();
            translateY.value = 0;
            return;
          }

          translateY.value = withTiming(0, {
            duration: 220,
            easing: Easing.out(Easing.cubic),
          });
        }),
    [onClose, translateY]
  );

  const composed = useMemo(
    () => Gesture.Simultaneous(panGesture, tapGesture),
    [panGesture, tapGesture]
  );

  const getItemLayout = useCallback(
    (_: any, i: number) => ({ length: W, offset: W * i, index: i }),
    []
  );

  const onMomentumEnd = useCallback(
    (e: any) => {
      const x = e.nativeEvent.contentOffset.x;
      const next = Math.round(x / W);
      setIndex(Math.max(0, Math.min(items.length - 1, next)));
    },
    [items.length]
  );

  const dateText = useMemo(
    () => formatEnglishDate(current?.date ?? ""),
    [current?.date]
  );

  return (
    <Animated.View style={[styles.root, sheetStyle]}>
      {/* 상단바 */}
      <Animated.View style={[styles.blackBar, uiStyle]}>
        <Pressable onPress={onClose} hitSlop={12} style={styles.iconBtn}>
          <Text style={styles.iconText}>✕</Text>
        </Pressable>

        <View style={{ flex: 1 }} />

        <Pressable
          onPress={() => current && onDownload?.(current)}
          hitSlop={12}
          style={styles.iconBtn}
          disabled={!onDownload || !current}
        >
          <DownWhiteIcon width={24} />
        </Pressable>
      </Animated.View>

      {/* 제스처는 미디어 영역에서만 */}
      <GestureDetector gesture={composed}>
        <View style={styles.mediaWrap}>
          <AFlatList
            ref={listRef}
            data={items}
            keyExtractor={(it: DetailMediaItem) => String(it.id)}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            initialScrollIndex={Math.max(0, initialIndex)}
            getItemLayout={getItemLayout}
            onMomentumScrollEnd={onMomentumEnd}
            renderItem={({
              item,
              index: i,
            }: {
              item: DetailMediaItem;
              index: number;
            }) => (
              <View style={{ width: W, height: "100%" }}>
                {item.mediaKind === "PHOTO" ? (
                  <Image
                    source={{ uri: item.url }}
                    style={styles.media}
                    contentFit="cover"
                    transition={120}
                  />
                ) : (
                  <VideoSlide
                    uri={item.url}
                    isActive={i === index}
                    uiVisible={ui}
                  />
                )}
              </View>
            )}
          />
        </View>
      </GestureDetector>

      {/* 하단 strip */}
      <Animated.View style={[styles.bottomStrip, bottomUiStyle]}>
        <Text style={styles.dateText}>{dateText}</Text>
        <Text style={styles.dayText}>{current?.dayLabel ?? ""}</Text>
      </Animated.View>

      {/* 코멘트 */}
      <Animated.View style={[styles.commentSection, bottomUiStyle]}>
        <Text style={styles.commentTitle}>Comment</Text>
        <Text style={styles.commentBody}>
          {current?.comment?.trim().length ? current.comment : "—"}
        </Text>
      </Animated.View>
    </Animated.View>
  );
};

export default PhotoDetailUI;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "black" },

  blackBar: {
    height: 110,
    backgroundColor: "rgba(0,0,0,0.35)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
    paddingTop: 50,
    paddingBottom: 15,
  },
  iconBtn: { justifyContent: "center", alignItems: "center" },
  iconText: { fontSize: 26, color: colors.CLOUD },

  mediaWrap: { flex: 1, backgroundColor: "black" },
  media: { width: "100%", height: "100%" },

  videoControls: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: "rgba(0,0,0,0.35)",
    borderRadius: 14,
  },
  videoControlsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  timeText: {
    color: colors.CLOUD,
    fontSize: 14,
    width: 44,
    textAlign: "center",
    fontFamily: "Monoplex KR",
  },
  playBtn: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 5,
  },
  playIcon: {
    color: colors.CLOUD,
    fontSize: 14,
    marginLeft: 2,
  },
  bottomStrip: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "rgba(0,0,0,0.75)",
    flexDirection: "row",
    alignItems: "center",
  },
  dateText: {
    flex: 1,
    color: colors.CLOUD,
    fontSize: 18,
    fontFamily: "Monoplex KR",
  },
  dayText: { color: colors.RED, fontSize: 18, fontFamily: "Monoplex KR" },

  commentSection: {
    paddingHorizontal: 18,
    paddingVertical: 18,
    color: colors.INK,
    gap: 12,
  },
  commentTitle: {
    color: colors.CLOUD,
    fontSize: 20,
    fontFamily: "Monoplex KR",
  },
  commentBody: {
    color: colors.CLOUD,
    fontSize: 16,
    lineHeight: 24,
    opacity: 0.9,
    fontFamily: "Monoplex KR",
  },
});
