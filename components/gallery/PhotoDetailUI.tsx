import { useMemo } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { colors } from "@/constants/colors";
import { formatEnglishDate } from "@/utils/date";
import { ResizeMode, Video } from "expo-av";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";

type Props = {
  mediaKind: string;
  mediaUrl: string;

  date: string;
  dayLabel: string;

  lat?: number | null;
  lng?: number | null;

  comment?: string | null;

  onClose: () => void;
  onDownload?: () => void;

  containerStyle?: StyleProp<ViewStyle>;
};

const PhotoVideoDetailView = ({
  mediaKind,
  mediaUrl,
  date,
  dayLabel,
  comment = null,
  onClose,
  onDownload,
  containerStyle,
}: Props) => {
  const dateText = useMemo(() => formatEnglishDate(date), [date]);

  return (
    <SafeAreaView style={[styles.root, containerStyle]}>
      <View style={styles.blackBar}>
        <Pressable onPress={onClose} hitSlop={12} style={styles.iconBtn}>
          <Text style={styles.iconText}>✕</Text>
        </Pressable>

        <View style={{ flex: 1 }} />

        <Pressable
          onPress={onDownload}
          hitSlop={12}
          style={styles.iconBtn}
          disabled={!onDownload}
        >
          <Text style={[styles.iconText, !onDownload && styles.disabledIcon]}>
            ⬇
          </Text>
        </Pressable>
      </View>

      {/* 미디어 */}
      <View style={styles.mediaWrap}>
        {mediaKind === "photo" ? (
          <Image
            source={{ uri: mediaUrl }}
            style={styles.media}
            contentFit="cover"
            transition={120}
          />
        ) : (
          <Video
            source={{ uri: mediaUrl }}
            style={styles.media}
            resizeMode={ResizeMode.CONTAIN}
            useNativeControls
            shouldPlay
            isMuted={false}
          />
        )}

        <View style={styles.bottomStrip}>
          <Text style={styles.dateText}>{dateText}</Text>
          <Text style={styles.dayText}>{dayLabel}</Text>
        </View>
      </View>

      <View style={styles.commentSection}>
        <Text style={styles.commentTitle}>Comment</Text>
        <Text style={styles.commentBody}>
          {comment?.trim().length ? comment : "—"}
        </Text>
      </View>
    </SafeAreaView>
  );
};

export default PhotoVideoDetailView;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "black" },
  blackBar: {
    height: 110,
    backgroundColor: "black",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingTop: 50,
    paddingBottom: 20,
  },
  iconBtn: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  iconText: { fontSize: 26, color: "white" },
  disabledIcon: { opacity: 0.35 },

  mediaWrap: { flex: 1, backgroundColor: "black" },
  media: { width: "100%", height: "100%" },

  bottomStrip: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "rgba(0,0,0,0.75)",
    flexDirection: "row",
    alignItems: "center",
  },
  dateText: {
    flex: 1,
    color: "white",
    fontSize: 18,
    fontFamily: "Monoplex KR",
  },
  dayText: { color: colors.RED, fontSize: 18, fontFamily: "Monoplex KR" },

  commentSection: {
    paddingHorizontal: 18,
    paddingVertical: 18,
    backgroundColor: "black",
    gap: 12,
  },
  commentTitle: { color: "white", fontSize: 20, fontFamily: "Monoplex KR" },
  commentBody: {
    color: "white",
    fontSize: 16,
    lineHeight: 24,
    opacity: 0.9,
    fontFamily: "Monoplex KR",
  },
});
