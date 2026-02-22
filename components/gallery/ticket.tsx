import { colors } from "@/constants/colors";
import { TripInfo } from "@/types/GalleryType";
import { StyleSheet, Text, View } from "react-native";
import CameraSvg from "./../../assets/icons/camera.svg";
import { TicketLabel } from "./TicketLabel";

type TicketProps = {
  data: TripInfo;
};

const formatDateRange = (start: string, end: string) => {
  const baseOptions: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "2-digit",
  };

  const startStr = new Date(start).toLocaleDateString("en-US", baseOptions);
  const endStr = new Date(end).toLocaleDateString("en-US", {
    ...baseOptions,
    year: "numeric",
  });

  return `${startStr} - ${endStr}`.toUpperCase();
};

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export const Ticket = ({ data }: TicketProps) => {
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
          {formatDateRange(data.startDate, data.endDate)}
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

          <TicketLabel title="PHOTO">{data.photoCount}</TicketLabel>

          <TicketLabel title="VIDEO">{data.videoCount}</TicketLabel>
        </View>
      </View>

      <View
        style={{
          borderRightWidth: 4,
          borderRightColor: colors.NAVY,
          borderStyle: "dashed",
        }}
      />

      <View style={styles.ticketLeft}>
        <CameraSvg width={46} height={46} />
        <Text style={styles.contentText}>촬영하기</Text>
      </View>
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
  titleCont: {
    backgroundColor: "",
    flex: 1,
    justifyContent: "center",
    borderBottomWidth: 1,
    borderBottomColor: colors.NAVY,
    borderStyle: "dashed",
    marginBottom: 21,
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
    width: "25%",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "stretch",
    backgroundColor: colors.NAVY,
    borderLeftWidth: 4,
    borderLeftColor: colors.NAVY,
    borderStyle: "dashed",
  },
  ticketRight: {
    width: "75%",
    justifyContent: "center",
    backgroundColor: colors.CLOUD,
  },
});
