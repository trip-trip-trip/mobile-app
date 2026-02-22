import AirplaneSvg from "@/assets/icons/airplane.svg";
import FullButton from "@/components/FullButton";
import Header from "@/components/Header";
import GoBackIcon from "@/components/icons/GoBackIcon";
import { colors } from "@/constants";
import { useCreateTrip } from "@/hooks/queries/useTripMutation";
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

function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export default function ScheduleScreen() {
  const { placeIds: placeIdsParam, cityNames: cityNamesParam } =
    useLocalSearchParams<{ placeIds?: string; cityNames?: string }>();

  const placeIds: number[] = placeIdsParam ? JSON.parse(placeIdsParam) : [];
  const cityNames: string[] = cityNamesParam ? JSON.parse(cityNamesParam) : [];

  const firstCity = cityNames[0] ?? "여행지";
  const remainingCount = cityNames.length - 1;

  const [tripTitle, setTripTitle] = useState("");
  const [days, setDays] = useState(1);

  const { mutate: createTrip, isPending } = useCreateTrip();

  const handleDecrease = () => {
    if (days > 1) setDays(days - 1);
  };

  const handleIncrease = () => {
    setDays(days + 1);
  };

  const handleStart = () => {
    if (!tripTitle.trim() || isPending) return;

    const today = new Date();
    const endDate = new Date(today);
    endDate.setDate(endDate.getDate() + days - 1);

    createTrip({
      title: tripTitle.trim(),
      startDate: formatDate(today),
      endDate: formatDate(endDate),
      placeIds: placeIds.length > 0 ? placeIds : null,
    });
  };

  const totalPhotos = days * 4;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
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
            <View style={styles.iconContainer}>
              <AirplaneSvg width={294} height={100} />
            </View>

            <Text style={styles.brandText}>tripshot과 함께</Text>
            <Text style={styles.destinationText}>
              {firstCity}
              {remainingCount > 0 && ` 외 ${remainingCount}곳으`}로 떠나요
            </Text>

            <View style={styles.formContainer}>
              {/* 여행 제목 */}
              <View style={styles.section}>
                <Text style={styles.label}>여행제목</Text>
                <TextInput
                  style={styles.input}
                  placeholder="여행 제목을 입력하세요"
                  placeholderTextColor={colors.NAVY + "80"}
                  value={tripTitle}
                  onChangeText={setTripTitle}
                  returnKeyType="done"
                  onSubmitEditing={() => Keyboard.dismiss()}
                />
              </View>

              {/* 여행 일수 — 제목 입력 후 표시 */}
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

                  <Text style={styles.photoInfo}>
                    하루 4장씩 총 {totalPhotos}장의 사진을 찍어요
                  </Text>

                  <View style={styles.buttonContainer}>
                    <FullButton
                      type="fill"
                      label={isPending ? "처리 중..." : "시작하기!"}
                      onPress={isPending ? undefined : handleStart}
                    />
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
  },
  scrollView: { flex: 1 },
  scrollContent: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 100,
  },
  iconContainer: { marginBottom: 40 },
  brandText: {
    fontSize: 16,
    fontFamily: "MonoplexKR-Medium",
    color: colors.NAVY,
    marginBottom: 20,
  },
  destinationText: {
    fontSize: 24,
    fontFamily: "MonoplexKR-SemiBold",
    color: colors.NAVY,
    textAlign: "center",
    marginBottom: 60,
  },
  formContainer: { width: "100%", maxWidth: 402 },
  section: { marginBottom: 40 },
  label: {
    fontSize: 14,
    fontFamily: "MonoplexKR-Regular",
    color: colors.NAVY,
    opacity: 0.5,
    marginBottom: 10,
  },
  durationLabel: {
    fontSize: 14,
    fontFamily: "MonoplexKR-Regular",
    color: colors.NAVY,
    opacity: 0.5,
    marginBottom: 27,
  },
  input: {
    width: "100%",
    paddingVertical: 20,
    paddingHorizontal: 0,
    borderBottomWidth: 1,
    borderBottomColor: colors.NAVY,
    fontSize: 14,
    fontFamily: "MonoplexKR-Regular",
    color: colors.NAVY,
  },
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
    fontFamily: "MonoplexKR-Bold",
    color: colors.NAVY,
    minWidth: 60,
    textAlign: "center",
  },
  photoInfo: {
    fontSize: 14,
    fontFamily: "MonoplexKR-Regular",
    color: colors.NAVY,
    textAlign: "center",
    marginBottom: 40,
  },
  buttonContainer: { width: "100%" },
});
