import DefaultProfile from "@/assets/icons/defaultprofile.svg";
import FullButton from "@/components/FullButton";
import { colors } from "@/constants/colors";
import { StyleSheet, Text, View } from "react-native";
import InviteLinkIcon from "@/assets/icons/invitelink.svg";
import KakaoIcon from "@/assets/icons/kakaoicon.svg";
import type { InviteInfo } from "@/types/invite";

type Props = {
  type: "sent" | "received";
  onCopyLink?: () => void;
  onKakaoShare?: () => void;
  onAccept?: () => void;
  onDecline?: () => void;
  data?: InviteInfo;
};

const InviteCard = ({ type, onCopyLink, onKakaoShare, onAccept, onDecline, data }: Props) => {
  const title = data?.title || "새로운 여행 초대";
  const placesText = data?.places?.join(" · ") || "장소 정보 없음";

  return (
    <View style={styles.card}>
      <Text style={styles.badge}>여행 초대</Text>

      <Text style={styles.title}>{title}</Text>
      <Text style={styles.date}>{placesText}</Text>

      <View style={styles.divider} />

      <View style={styles.friendRow}>
        <View style={styles.friendItem}>
          <DefaultProfile width={60} height={60} />
          <Text style={styles.friendName}>{data?.inviterName || "초대자"}</Text>
        </View>
        {data?.participantCount != null && data.participantCount > 1 && (
          <View style={styles.friendItem}>
            <DefaultProfile width={60} height={60} />
            <Text style={styles.friendName}>+{data.participantCount - 1}명</Text>
          </View>
        )}
      </View>

      <View style={styles.buttonWrapper}>
        {type === "sent" ? (
          <>
            <FullButton icon={<InviteLinkIcon />} type="outlined" label="초대 링크 복사" onPress={onCopyLink} />
            <FullButton icon={<KakaoIcon />} type="kakao" label="카카오톡 초대" onPress={onKakaoShare} />
          </>
        ) : (
          <>
            <FullButton type="fill" label="여행 참여하기!" onPress={onAccept} />
            <FullButton type="outlined" label="초대 거절하기" onPress={onDecline} />
          </>
        )}
      </View>
    </View>
  );
};

export default InviteCard;

const styles = StyleSheet.create({
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
