import { colors } from "@/constants/colors";
import { TripInfo } from "@/types/gallery";
import { formatDateRangeToEnglish } from "@/utils/date";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import CameraSvg from "./../../assets/icons/camera.svg";
import { TicketLabel } from "./TicketLabel";

type TicketProps = {
  data: TripInfo;
};

export const Ticket = ({ data }: TicketProps) => {
  // 날짜수 계산
  const diffDaysInclusive = (startYmd: string, endYmd: string) => {
    const toUtcMs = (ymd: string) => {
      const [y, m, d] = ymd.split("-").map(Number);
      return Date.UTC(y, m - 1, d);
    };

    const ms = toUtcMs(endYmd) - toUtcMs(startYmd);
    const days = Math.floor(ms / (24 * 60 * 60 * 1000));
    return days + 1;
  };

  return (
    <View style={styles.ticket}>
      <View style={styles.ticketRight}>
        <Text
          style={{
            fontSize: 12,
            color: colors.NAVY,
            fontFamily: "Monoplex KR",
            fontWeight: "700",
            borderBottomWidth: 1,
            borderBottomColor: colors.NAVY,
            paddingVertical: 6,
            paddingHorizontal: 16,
          }}
        >
          {formatDateRangeToEnglish(data.startDate, data.endDate)}
        </Text>

        <View style={{ flexDirection: "row" }}>
          <TicketLabel title="LOCATION">{data.placeName}</TicketLabel>

          <View
            style={{ borderRightWidth: 1, borderRightColor: colors.NAVY }}
          />

          <TicketLabel title="TITLE">{data.title}</TicketLabel>
        </View>

        <View
          style={{
            flexDirection: "row",
            gap: 8,
            backgroundColor: colors.CREAM,
          }}
        >
          <TicketLabel title="PEOPLE">{data.members.length}명</TicketLabel>

          <TicketLabel title="PHOTO">
            {data.photoCount}
            <Text style={{ fontSize: 13 }}>
              {" "}
              / {4 * diffDaysInclusive(data.startDate, data.endDate)}
            </Text>
          </TicketLabel>

          <TicketLabel title="VIDEO">{data.videoCount}</TicketLabel>
        </View>
      </View>

      {/* 점선 */}
      <View
        style={{
          width: "1.5%",
          backgroundColor: colors.CLOUD,
          flexDirection: "column",
          gap: 9,
        }}
      >
        <View style={{ backgroundColor: colors.NAVY, height: 12.9 }}></View>
        <View style={{ backgroundColor: colors.NAVY, height: 12.9 }}></View>
        <View style={{ backgroundColor: colors.NAVY, height: 12.9 }}></View>
        <View style={{ backgroundColor: colors.NAVY, height: 12.9 }}></View>
        <View style={{ backgroundColor: colors.NAVY, height: 12.9 }}></View>
        <View style={{ backgroundColor: colors.NAVY, height: 12.9 }}></View>
        <View style={{ backgroundColor: colors.NAVY, height: 13 }}></View>
      </View>

      {/* 촬영하기 버튼 */}
      <Pressable
        onPress={() => router.push("/(tabs)/camera")}
        style={styles.ticketLeft}
      >
        <CameraSvg width={46} height={46} />
        <Text style={styles.contentText}>촬영하기</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  contentText: {
    fontSize: 16,
    color: colors.CLOUD,
    fontWeight: 400,
    fontFamily: "Monoplex KR",
  },
  ticket: {
    flexDirection: "row",
    width: "100%",
    shadowColor: "#203040",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 40,
    elevation: 8 /* Android용 */,
  },
  ticketLeft: {
    width: "27.5%",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "stretch",
    backgroundColor: colors.NAVY,
    gap: 7,
  },
  ticketRight: {
    width: "71%",
    justifyContent: "center",
    backgroundColor: colors.CLOUD,
  },
});
