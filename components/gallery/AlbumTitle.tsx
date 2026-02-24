import { colors } from "@/constants/colors";
import { formatDateRangeToEnglish } from "@/utils/date";
import { router } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SharedProfiles } from "./SharedProfiles";
import { Title } from "./Title";

type AlbumData = {
  title: string;
  place: string;
  startDate: string;
  endDate: string;
  memberProfileUrls: string[];
  shots: number;
  video: number;
};

type AlbumDataProps = {
  data: AlbumData;
  isTraveling: boolean;
};

export const AlbumTitle = ({ data, isTraveling }: AlbumDataProps) => {
  return (
    <View style={styles.topSection}>
      {isTraveling && (
        <View style={styles.tag}>
          <Text style={styles.tagText}>지금 여행중</Text>
        </View>
      )}
      <Title>{data.title}</Title>
      <View style={styles.infoRow}>
        <SharedProfiles data={data.memberProfileUrls} size={25} />
        {isTraveling && (
          <TouchableOpacity>
            <Text
              style={styles.inviteText}
              onPress={() => router.push("/(tabs)/invite")}
            >
              친구 초대하기
            </Text>
          </TouchableOpacity>
        )}
      </View>
      <Text style={styles.locationDateText}>
        {formatDateRangeToEnglish(data.startDate, data.endDate)}
      </Text>
      <Text style={styles.countText}>
        <Text style={{ color: "#FF5252" }}>{data.shots} SHOTS</Text> •{" "}
        {data.video} VIDEOS
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  topSection: {
    padding: 20,
    paddingBottom: 10,
  },
  tag: {
    borderWidth: 1,
    borderColor: "#FF5252",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 2,
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  tagText: { color: "#FF5252", fontSize: 12, fontFamily: "Monoplex KR" },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },

  inviteText: {
    fontSize: 12,
    color: colors.NAVY,
    textDecorationLine: "underline",
    fontFamily: "Monoplex KR",
  },
  locationDateText: {
    fontSize: 14,
    color: colors.NAVY,
    fontFamily: "Monoplex KR",
    marginBottom: 5,
  },
  countText: {
    fontSize: 12,
    color: colors.NAVY,
    fontFamily: "Monoplex KR",
    fontWeight: "bold",
  },
});
