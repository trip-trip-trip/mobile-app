import { Ticket } from "@/components/gallery/ticket";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

export default function Gallery() {
  return (
    <SafeAreaView>
      <View style={styles.container}>
        {/* TODO: 임시 버튼 — 실제 메인화면 구현 시 제거 */}
        <Pressable
          style={styles.tempTripButton}
          onPress={() => router.push("/(tabs)/trip")}
        >
          <Text style={styles.tempTripButtonText}>+ 새 여행 만들기 (임시)</Text>
        </Pressable>
        {/* TODO END */}

        <View style={styles.titleCont}>
          <Text style={styles.title}>진행 중인 여행</Text>
        </View>
        <Ticket />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    fontFamily: "Monoplex KR",
  },
  title: {
    fontSize: 24,
    color: "#335270",
    fontFamily: "Monoplex KR",
    fontWeight: 400,
    margin: 12,
  },
  contentText: {
    fontSize: 16,
    color: "#F0F0F0",
    fontWeight: 400,
    fontFamily: "Monoplex KR",
  },
  titleCont: {
    backgroundColor: "",
    flex: 1,
    justifyContent: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#335270",
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
    backgroundColor: "#335270",
    borderLeftWidth: 4,
    borderLeftColor: "#335270",
    borderStyle: "dashed",
  },
  ticketRight: {
    width: "75%",
    justifyContent: "center",
    backgroundColor: "#F0F0F0",
  },
  // TODO: 임시 버튼 스타일 — 실제 메인화면 구현 시 제거
  tempTripButton: {
    alignSelf: "flex-start",
    marginBottom: 16,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: "#335270",
    borderRadius: 8,
  },
  tempTripButtonText: {
    color: "#F0F0F0",
    fontSize: 14,
    fontFamily: "MonoplexKR-Medium",
  },
  // TODO END
});
