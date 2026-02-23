import React from "react";
import { View, Alert, Share } from "react-native";
import Header from "@/components/Header";
import InviteCard from "@/components/invite/InviteCard";
import { colors } from "@/constants/colors";
import GoBackIcon from "@/components/icons/GoBackIcon";
import * as Clipboard from "expo-clipboard";
import { createInvite } from "@/api/invite";
import { getActiveTrips } from "@/api/trip";
import { useLocalSearchParams } from "expo-router";

export default function InviteIndexScreen() {
  const { tripId: paramTripId } = useLocalSearchParams<{ tripId: string }>();

  const getInviteLink = async () => {
    let targetTripId: number;

    try {
      // 1. 타겟 Trip ID 결정
      if (paramTripId) {
        targetTripId = parseInt(paramTripId);
      } else {
        const response = await getActiveTrips();
        const trips = response?.trip || [];
        
        if (trips.length === 0) {
          console.log("데이터가 없어서 임시 ID 1번으로 진행 시도");
          targetTripId = 1; 
        } else {
          const activeTrip = trips.find((t: any) => t.status === "ACTIVE") || trips[0];
          targetTripId = activeTrip.id;
        }
      }

      // 2. 서버에 초대 코드 요청
      const { inviteCode } = await createInvite(targetTripId);
      
      // [수정] 앱 실행을 보장하기 위해 Custom Scheme 주소 반환
      // 나중에 Universal Link가 완벽해지면 https://... 주소로 바꾸면 된다.
      return `tripshot://invite/InviteReceived?code=${inviteCode}`;

    } catch (err) {
      console.log("서버 통신 실패 또는 데이터 없음, 가짜 링크로 UI 테스트 진행");
      // catch 블록 안에서 inviteCode가 없으므로 고정된 더미 값을 보냄
      return `tripshot://invite/InviteReceived?code=DUMMY_CODE_123`;
    }
  };

  const handleCopyLink = async () => {
    const url = await getInviteLink();
    if (url) {
      await Clipboard.setStringAsync(url);
      Alert.alert("복사 완료", `초대 링크가 복사되었습니다.\n${url}`);
    }
  };

  const handleKakaoShare = async () => {
    const url = await getInviteLink();
    if (url) {
      // 카카오톡이나 다른 앱으로 공유 시에도 이 URL이 전달됨
      await Share.share({
        message: `[TripShot] 신나는 여행에 초대합니다!\n링크를 눌러 참여하세요:\n${url}`,
      });
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.CREAM }}>
      <Header 
        label="친구 초대" 
        leftIcon={<GoBackIcon />} 
        backgroundColor={colors.CREAM} 
        labelColor={colors.NAVY} 
      />
      <InviteCard 
        type="sent" 
        onCopyLink={handleCopyLink} 
        onKakaoShare={handleKakaoShare} 
      />
    </View>
  );
}