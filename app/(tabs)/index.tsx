import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function HomeScreen() {
  const router = useRouter(); // 1. 라우터 선언

  return (
    <View style={styles.container}>
      {/* 2. 이동 버튼 (피그마 디자인에 맞춰 스타일링 가능) */}
      <Pressable
        style={styles.button}
        onPress={() => router.push("/trip")} // 폴더명인 /trips로 이동
      >
        <Text style={styles.buttonText}>여행지 선택 화면으로 이동</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buttonText: {
    fontWeight: "600",
  },
});
