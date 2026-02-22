import DefaultProfile from "@/assets/icons/defaultprofile.svg";
import FullButton from "@/components/FullButton";
import { colors } from "@/constants/colors";
import { StyleSheet, Text, View } from "react-native";

type Props = {
  type: "sent" | "received";
};

const InviteCard = ({ type }: Props) => {
  return (
    <View style={styles.card}>
      <Text style={styles.badge}>지금 여행중</Text>

      <Text style={styles.title}>굉장히 신나는 여행</Text>

      <Text style={styles.date}>제주도 · FEB 05 - FEB 05, 2026</Text>

      <View style={styles.divider} />

      <View style={styles.friendRow}>
        {[1, 2, 3].map((item) => (
          <View key={item} style={styles.friendItem}>
            <DefaultProfile width={60} height={60} />
            <Text style={styles.friendName}>이름</Text>
          </View>
        ))}
      </View>

      {/* 버튼 분기 */}
      <View style={styles.buttonWrapper}>
        {type === "received" ? (
          <>
            <FullButton type="fill" label="여행 참여하기!" />
            <FullButton type="outlined" label="초대 거절하기" />
          </>
        ) : (
          <>
            <FullButton type="outlined" label="초대 링크 복사" />
            <FullButton type="fill" label="카카오톡 초대" />
          </>
        )}
      </View>
    </View>
  );
};

export default InviteCard;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.CREAM,
  },

  card: {
    width: 402,
    padding: 20,
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 10,
    alignSelf: "center",
    marginTop: 20,
  },

  badge: {
    fontFamily: "MonoplexKR-Regular",
    fontSize: 12,
    color: "#EA4335",
    borderWidth: 1,
    borderColor: "#EA4335",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },

  title: {
    fontFamily: "MonoplexKR-Medium",
    fontSize: 22,
    color: colors.NAVY,
  },

  date: {
    fontFamily: "MonoplexKR-Regular",
    fontSize: 14,
    color: colors.NAVY,
    opacity: 0.6,
  },

  divider: {
    width: "100%",
    borderBottomWidth: 1,
    borderStyle: "dashed",
    borderColor: "#335270",
    marginVertical: 10,
  },

  friendRow: {
    flexDirection: "row",
    gap: 20,
    marginTop: 10,
  },

  friendItem: {
    alignItems: "center",
    gap: 6,
  },

  friendName: {
    fontFamily: "MonoplexKR-Regular",
    fontSize: 12,
    color: colors.NAVY,
  },

  buttonWrapper: {
    marginTop: 30,
    width: "100%",
    gap: 14,
  },
});
