import { colors } from "@/constants/colors";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  visible: boolean;
  onLater: () => void; // 다음에 하기
  onGoDevelop: () => void; // 현상하러 가기
};

// Day가 넘어가 현상 가능한 롤이 생겼을 때 홈에서 띄우는 안내 모달
const DevelopPromptModal = ({ visible, onLater, onGoDevelop }: Props) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onLater}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>현상할 사진이 있습니다!</Text>
          <Text style={styles.subtitle}>하시겠습니까?</Text>
          <View style={styles.buttons}>
            <Pressable style={styles.laterBtn} onPress={onLater}>
              <Text style={styles.laterText}>다음에 하기</Text>
            </Pressable>
            <Pressable style={styles.goBtn} onPress={onGoDevelop}>
              <Text style={styles.goText}>현상하러 가기</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default DevelopPromptModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    width: "80%",
    backgroundColor: colors.CLOUD,
    borderRadius: 12,
    padding: 24,
    gap: 8,
  },
  title: {
    fontFamily: "MonoplexKR-Bold",
    fontSize: 16,
    color: colors.INK,
    textAlign: "center",
  },
  subtitle: {
    fontFamily: "MonoplexKR-Regular",
    fontSize: 14,
    color: colors.INK,
    textAlign: "center",
    marginBottom: 8,
  },
  buttons: {
    flexDirection: "row",
    gap: 10,
  },
  laterBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#c7c7c7",
    alignItems: "center",
  },
  laterText: {
    fontFamily: "MonoplexKR-Medium",
    fontSize: 14,
    color: colors.INK,
  },
  goBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: colors.NAVY,
    alignItems: "center",
  },
  goText: {
    fontFamily: "MonoplexKR-Medium",
    fontSize: 14,
    color: colors.CREAM,
  },
});
