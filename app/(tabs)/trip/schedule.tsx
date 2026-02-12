import AirplaneSvg from "@/assets/icons/airplane.svg";
import FullButton from "@/components/FullButton";
import Header from "@/components/Header";
import GoBackIcon from "@/components/icons/GoBackIcon";
import { colors } from "@/constants";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";

export default function ScheduleScreen() {
  const params = useLocalSearchParams();
  const selectedCities = params.cities
    ? JSON.parse(params.cities as string)
    : [];

  const firstCity = selectedCities[0]?.title || "여행지";
  const remainingCount = selectedCities.length - 1;

  const [tripTitle, setTripTitle] = useState("");
  const [days, setDays] = useState(1);

  const handleDecrease = () => {
    if (days > 1) setDays(days - 1);
  };

  const handleIncrease = () => {
    setDays(days + 1);
  };

  const totalPhotos = days * 4;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20} // 헤더 높이 등에 따라 조절 가능
    >
      {/* 2. 키보드 외부 터치 시 키보드 닫기 (선택 사항) */}
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <Header
            labelColor={colors.CREAM}
            backgroundColor={colors.CREAM}
            leftIcon={<GoBackIcon />}
          />

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* 아이콘 */}
            <View style={styles.iconContainer}>
              <AirplaneSvg width={294} height={100} />
            </View>

            {/* 제목 텍스트 */}
            <Text style={styles.brandText}>tripshot과 함께</Text>
            <Text style={styles.destinationText}>
              {firstCity}
              {remainingCount > 0 && ` 외 ${remainingCount}곳으`}로 떠나요
            </Text>

            {/* 입력 영역 */}
            <View style={styles.formContainer}>
              {/* 여행 제목 입력 */}
              <View style={styles.section}>
                <Text style={styles.label}>여행제목</Text>
                <TextInput
                  style={styles.input}
                  placeholder="여행 제목을 입력하세요"
                  placeholderTextColor={colors.NAVY + "80"}
                  value={tripTitle}
                  onChangeText={setTripTitle}
                  returnKeyType="done" // '완료', 'Go', 'Search' 등으로 변경 가능
                  onSubmitEditing={() => Keyboard.dismiss()} // 엔터 누르면 키보드 닫기
                />
              </View>

              {/* 여행 일수 선택 - 제목 입력 후 표시 */}
              {tripTitle.trim() !== "" && (
                <>
                  <View style={styles.section}>
                    <Text style={styles.durationLabel}>여행 일수</Text>
                    <View style={styles.counterContainer}>
                      <Pressable
                        style={styles.counterButton}
                        onPress={handleDecrease}
                        disabled={days <= 1}
                      >
                        <Ionicons
                          name="remove"
                          size={24}
                          color={days <= 1 ? colors.NAVY + "40" : colors.NAVY}
                        />
                      </Pressable>

                      <Text style={styles.counterText}>{days}</Text>

                      <Pressable
                        style={styles.counterButton}
                        onPress={handleIncrease}
                      >
                        <Ionicons name="add" size={24} color={colors.NAVY} />
                      </Pressable>
                    </View>
                  </View>

                  {/* 사진 안내 */}
                  <Text style={styles.photoInfo}>
                    하루 4장씩 총 {totalPhotos}장의 사진을 찍어요
                  </Text>

                  {/* 시작하기 버튼 */}
                  <View style={styles.buttonContainer}>
                    <FullButton type="fill" label="시작하기!" />
                  </View>
                </>
              )}
            </View>
          </ScrollView>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.CLOUD,
    fontFamily: "MonoplexKR-Regular",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 100,
  },

  // 아이콘 영역
  iconContainer: {
    marginBottom: 40,
  },

  // 텍스트 영역
  brandText: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.NAVY,
    marginBottom: 20,
  },
  destinationText: {
    fontSize: 24,
    fontWeight: "600",
    color: colors.NAVY,
    textAlign: "center",
    marginBottom: 60,
  },

  // 폼 영역
  formContainer: {
    width: "100%",
    maxWidth: 402,
  },
  section: {
    marginBottom: 40,
  },
  label: {
    fontSize: 14,
    fontWeight: "400",
    color: colors.NAVY,
    opacity: 0.5,
    marginBottom: 10,
  },
  durationLabel: {
    fontSize: 14,
    fontWeight: "400",
    color: colors.NAVY,
    opacity: 0.5,
    marginBottom: 27,
  },

  // 입력 필드
  input: {
    width: "100%",
    paddingVertical: 20,
    paddingHorizontal: 0,
    borderBottomWidth: 1,
    borderBottomColor: colors.NAVY,
    fontSize: 14,
    color: colors.NAVY,
  },

  // 카운터
  counterContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 40,
  },
  counterButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.CREAM,
    borderRadius: 40,
    borderWidth: 1,
    borderColor: colors.NAVY,
  },
  counterText: {
    fontSize: 32,
    fontWeight: "700",
    color: colors.NAVY,
    minWidth: 60,
    textAlign: "center",
  },

  // 안내 텍스트
  photoInfo: {
    fontSize: 14,
    fontWeight: "400",
    color: colors.NAVY,
    textAlign: "center",
    marginBottom: 40,
  },

  // 버튼
  buttonContainer: {
    width: "100%",
  },
});
