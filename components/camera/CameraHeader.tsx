import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const CameraHeader = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Ionicons
          name="images-outline"
          size={24}
          color="white"
          onPress={() => router.push("/(tabs)/gallery")}
        />
        <Text style={styles.title}>Camera</Text>
        <Ionicons
          name="settings-outline"
          size={24}
          color="white"
          onPress={() => router.push("/(tabs)/setting")}
        />
      </View>

      <View style={styles.dayWrapper}>
        <View style={styles.dayPill}>
          <Text style={styles.dayText}>Day 1 / 4</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default CameraHeader;

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: "#000",
  },
  container: {
    paddingTop: 16,
    paddingBottom: 12,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  title: {
    color: "white",
    fontFamily: "Monoplex KR",
    fontSize: 16,
    fontWeight: "600",
  },
  dayWrapper: {
    alignItems: "center",
    marginTop: 12,
  },

  dayPill: {
    paddingVertical: 6,
    paddingHorizontal: 32,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#EA4335",
    backgroundColor: "rgba(234,67,53,0.10)",
  },

  dayText: {
    color: "#EA4335",
    fontFamily: "MonoplexKR-Bold",
    fontSize: 12,
    letterSpacing: -1.2,
  },
});
