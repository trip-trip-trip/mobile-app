import Header from "@/components/Header";
import GoBackIcon from "@/components/icons/GoBackIcon";
import { colors } from "@/constants";
import { useLocalSearchParams } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

export default function ScheduleScreen() {
  const params = useLocalSearchParams();
  const selectedCities = params.cities
    ? JSON.parse(params.cities as string)
    : [];

  return (
    <View style={styles.container}>
      <Header
        labelColor={colors.CREAM}
        backgroundColor={colors.CREAM}
        leftIcon={<GoBackIcon />}
      />

      <View style={styles.content}>
        <Text style={styles.title}>
          선택한 여행지: {selectedCities.length}개
        </Text>
        {selectedCities.map((city: any, index: number) => (
          <Text key={index} style={styles.cityText}>
            {city.title}
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.CLOUD },
  content: { padding: 20 },
  title: { fontSize: 18, fontWeight: "700", marginBottom: 20 },
  cityText: { fontSize: 16, marginBottom: 10 },
});
