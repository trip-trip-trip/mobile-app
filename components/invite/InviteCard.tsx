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

// InviteCard.tsx 내부 수정 부분
const InviteCard = ({ type, onCopyLink, onKakaoShare, onAccept, data }: Props) => {
  // 서버 응답 구조(tripStatus 혹은 inviteInfo)에 맞춰 매핑
  const title = data?.title || "새로운 여행 초대";
  const dateText = data?.startDate ? `${data.startDate} - ${data.endDate}` : "날짜 정보 없음";
  
  // 상태 라벨 결정 (ACTIVE 여부 확인)
  const statusLabel = data?.status === "ACTIVE" || data?.isOngoing ? "지금 여행중" : "지난 여행";


  const friends = data?.inviteesNameList || data?.members || ["참여자"];

  return (
    <View style={styles.card}>
      <Text style={[
        styles.badge, 
        (data?.status === "COMPLETED" || data?.isOngoing === false) && { color: colors.NAVY, borderColor: colors.NAVY }
      ]}>
        {statusLabel}
      </Text>

      <Text style={styles.title}>{title}</Text>
      <Text style={styles.date}>{dateText}</Text>

      <View style={styles.divider} />

      <View style={styles.friendRow}>
        {friends.slice(0, 3).map((name: string, idx: number) => (
          <View key={idx} style={styles.friendItem}>
            {/* 프로필 이미지가 URL로 오면 Image로, 없으면 DefaultProfile */}
            {data?.inviteesProfileImgList?.[idx] ? (
              <View style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: '#ddd', overflow: 'hidden' }}>
                 {/* 이미지 컴포넌트 추가 가능 */}
              </View>
            ) : (
              <DefaultProfile width={60} height={60} />
            )}
            <Text style={styles.friendName}>{typeof name === 'string' ? name : "친구"}</Text>
          </View>
        ))}
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