import DownloadIcon from "@/assets/icons/download.svg";
import ShareIcon from "@/assets/icons/share.svg";
import { colors } from "@/constants/colors";
import { Dimensions, StyleSheet, Text, View } from "react-native";
const { width: SCREEN_WIDTH } = Dimensions.get("window");

type DayLabelProps = {
  dayNum?: number;
  date?: string;
  onDownload?: () => void;
  onShare?: () => void;
};

export const DayLabel = ({
  dayNum,
  date,
  onDownload,
  onShare,
}: DayLabelProps) => {
  return (
    <View style={styles.dayHeader}>
      <View style={styles.dayBadge}>
        <Text style={styles.dayBadgeText}>DAY {dayNum}</Text>
      </View>
      <Text style={styles.dayDateText}>{date}</Text>
      <View style={styles.iconGroup}>
        <DownloadIcon width={19} onPress={onDownload} />
        <ShareIcon width={20} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  dayPage: {
    width: SCREEN_WIDTH, // 한 페이지가 화면 전체 너비
    flex: 1,
  },
  dayHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    marginVertical: 15,
  },
  dayBadge: {
    backgroundColor: colors.RED,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 10,
  },
  dayBadgeText: {
    fontFamily: "Monoplex KR",
    color: "#133352",
    fontWeight: 700,
    fontSize: 14,
  },
  dayDateText: {
    fontFamily: "Monoplex KR",
    fontWeight: 400,
    fontSize: 14,
    color: colors.NAVY,
    flex: 1,
  },
  iconGroup: {
    flexDirection: "row",
    gap: 16,
    alignItems: "center",
  },
});
