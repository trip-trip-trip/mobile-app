import { useMemo } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { Image } from "expo-image";

import { colors } from "@/constants/colors";
import { formatEnglishDate } from "@/utils/date";
import { SafeAreaView } from "react-native-safe-area-context";

type Props = {
  title?: string; // "Album" 기본
  imageUrl: string;

  date: string; // "2026-02-05" or ISO
  dayLabel: string; // "D1-#01" 같은 표시

  lat?: number | null;
  lng?: number | null;

  comment?: string | null;

  onClose: () => void;
  onDownload?: () => void;

  containerStyle?: StyleProp<ViewStyle>;
};

const PhotoDetailView = ({
  imageUrl,
  date,
  dayLabel,
  lat = null,
  lng = null,
  comment = null,
  onClose,
  onDownload,
  containerStyle,
}: Props) => {
  const dateText = useMemo(() => formatEnglishDate(date), [date]);
  // const coordText = useMemo(
  //   () => formatCoordLabelDecimal(lat, lng),
  //   [lat, lng]
  // );

  return (
    <SafeAreaView style={[styles.root, containerStyle]}>
      {/* 하단 바  */}
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

      {/* 사진 */}
      <View style={styles.imageWrap}>
        <Image
          source={{ uri: imageUrl }}
          style={styles.image}
          contentFit="cover"
          transition={120}
        />

        {/* {coordText ? (
          <View style={styles.coordBadge}>
            <Text style={styles.coordText}>{coordText}</Text>
          </View>
        ) : null} */}

        {/* 하단 바 */}
        <View style={styles.bottomStrip}>
          <Text style={styles.dateText}>{dateText}</Text>
          <Text style={styles.dayText}>{dayLabel}</Text>
        </View>
      </View>

      {/* 코멘트 */}
      <View style={styles.commentSection}>
        <Text style={styles.commentTitle}>Comment</Text>
        <Text style={styles.commentBody}>
          {comment?.trim().length ? comment : "—"}
        </Text>
      </View>
    </SafeAreaView>
  );
};

export default PhotoDetailView;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "black",
  },
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
  iconText: {
    fontSize: 26,
    color: "white",
  },
  disabledIcon: {
    opacity: 0.35,
  },

  imageWrap: {
    flex: 1,
    backgroundColor: "black",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  coordBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "rgba(230,230,230,0.9)",
    borderRadius: 8,
  },
  coordText: {
    color: "#222",
    fontSize: 14,
    fontFamily: "Monoplex KR",
  },

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
  dayText: {
    color: colors.RED,
    fontSize: 18,
    fontFamily: "Monoplex KR",
  },

  commentSection: {
    paddingHorizontal: 18,
    paddingVertical: 18,
    backgroundColor: "black",
    gap: 12,
  },
  commentTitle: {
    color: "white",
    fontSize: 20,
    fontFamily: "Monoplex KR",
  },
  commentBody: {
    color: "white",
    fontSize: 16,
    lineHeight: 24,
    opacity: 0.9,
    fontFamily: "Monoplex KR",
  },
});
