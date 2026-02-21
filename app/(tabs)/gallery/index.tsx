import { Ticket } from "@/components/gallery/ticket";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Gallery() {
  return (
    <SafeAreaView>
      <View style={styles.container}>
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
});
