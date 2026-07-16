import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import {
  formatClockStamp,
  getUtcOffsetLabel,
} from "@/utils/date";

// 뷰파인더 우하단에 표시되는 실시간 시계.
// 필름 카메라의 날짜 각인(date stamp)처럼 보이도록 디자인.
// 윗줄(빨강): 사진이 저장되는 기준인 디바이스 로컬 시간 / 아랫줄: UTC 참고 표시
const CameraClock = () => {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <View style={styles.container} pointerEvents="none">
      <Text style={styles.localStamp}>
        {`${formatClockStamp(now)} ${getUtcOffsetLabel(now)}`}
      </Text>
      <Text style={styles.utcStamp}>{`UTC ${formatClockStamp(now, true)}`}</Text>
    </View>
  );
};

export default CameraClock;

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    right: 14,
    bottom: 12,
    alignItems: "flex-end",
    gap: 2,
  },
  localStamp: {
    color: "#EA4335",
    fontFamily: "MonoplexKR-SemiBold",
    fontSize: 13,
    letterSpacing: -0.5,
    textShadowColor: "rgba(234, 67, 53, 0.6)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  utcStamp: {
    color: "rgba(240, 240, 240, 0.55)",
    fontFamily: "MonoplexKR-Regular",
    fontSize: 10,
    letterSpacing: -0.3,
  },
});
