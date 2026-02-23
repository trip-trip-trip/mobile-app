import DefaultProfile from "@/assets/icons/defaultprofile.svg";
import FullButton from "@/components/FullButton";
import { colors } from "@/constants/colors";
import { StyleSheet, Text, View } from "react-native";
import InviteLinkIcon from "@/assets/icons/invitelink.svg";
import KakaoIcon from "@/assets/icons/kakaoicon.svg";
import * as Linking from "expo-linking";
import { router } from "expo-router";
 // 테스트용 딥링크 열기
type Props = {
  type: "sent" | "received";
  onCopyLink?: () => void;
  onKakaoShare?: () => void; 
  onAccept?: () => void;
  data?: any; // 추가: 서버 데이터 수신용
};

const InviteCard = ({ type, onCopyLink, onKakaoShare, onAccept, data }: Props) => {
  // 데이터가 있으면 서버 정보를 쓰고, 없으면 기본 문구를 띄움
  const title = data?.title || "새로운 여행 초대";
  const dateText = data ? `${data.startDate} - ${data.endDate}` : "날짜 정보 없음";
  const statusLabel = data?.status === "ACTIVE" ? "지금 여행중" : "지난 여행";

  return (
    <View style={styles.card}>
      <Text style={[
        styles.badge, 
        data?.status === "COMPLETED" && { color: colors.NAVY, borderColor: colors.NAVY }
      ]}>
        {statusLabel}
      </Text>

      <Text style={styles.title}>{title}</Text>
      <Text style={styles.date}>{dateText}</Text>

      <View style={styles.divider} />

      <View style={styles.friendRow}>
        {/* 서버에서 온 친구 목록이 있으면 그걸 보여줌 */}
        {(data?.inviteesProfileImgList || [1, 2, 3]).slice(0, 3).map((item: any, idx: number) => (
          <View key={idx} style={styles.friendItem}>
            <DefaultProfile width={60} height={60} />
            <Text style={styles.friendName}>{data?.inviteesNameList?.[idx] || "친구"}</Text>
          </View>
        ))}
      </View>

      <View style={styles.buttonWrapper}>
        {type === "sent" ? (
          <>
            <FullButton icon={<InviteLinkIcon />} type="outlined" label="초대 링크 복사" onPress={onCopyLink} />
            <FullButton icon={<KakaoIcon />} type="kakao" label="카카오톡 초대" onPress={onKakaoShare} />
            <FullButton
    type="outlined"
    label="초대 링크 테스트 (Expo)"
    onPress={() => {
      router.push({
        pathname: "/(tabs)/invite/InviteReceived",
        params: { code: "TEST123" },
      });
    }}
  />
          </>
        ) : (
          <>
            <FullButton type="fill" label="여행 참여하기!" onPress={onAccept} />
            <FullButton type="outlined" label="초대 거절하기" />
             
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