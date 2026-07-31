import { colors } from "@/constants";
import { useVideoThumbnail } from "@/hooks/queries/gallery/useVideoThumb";
import { ActivityIndicator, Image, StyleSheet, Text, View } from "react-native";

type Props = {
  videoUrl: string | null;
  // 미현상 잠금용 비트맵 블러 (PhotoItem과 동일한 이유 — 안드로이드 BlurView 미동작)
  blurRadius?: number;
};

export function VideoThumbItem({ videoUrl, blurRadius }: Props) {
  const { thumbUri, status } = useVideoThumbnail(videoUrl, {
    timeoutMs: 12_000,
  });

  return (
    <View style={styles.tile}>
      {status === "ready" && thumbUri ? (
        <Image
          source={{ uri: thumbUri }}
          style={StyleSheet.absoluteFill}
          blurRadius={blurRadius}
        />
      ) : status === "loading" ? (
        <View style={styles.center}>
          <ActivityIndicator />
          <Text style={styles.helperText}>로딩 중..</Text>
        </View>
      ) : status === "error" ? (
        <View style={styles.center}>
          <Text style={styles.helperText}>썸네일 생성 실패</Text>
        </View>
      ) : (
        <View style={styles.center}>
          <Text style={styles.helperText}>로딩 중..</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    width: "100%",
    aspectRatio: 1,
    backgroundColor: colors.CREAM,
    overflow: "hidden",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  helperText: {
    marginTop: 6,
    color: colors.INK,
    fontSize: 12,
  },
});
