import FullButton from "@/components/FullButton";
import Header from "@/components/Header";
import GoBackIcon from "@/components/icons/GoBackIcon";
import ProfileEdit from "@/components/setting/ProfileEdit";
import SettingActivate from "@/components/setting/PushNotificationActivate";
import SettingTimeslot from "@/components/setting/PushNotificationTimeslot";
import { colors } from "@/constants/colors";
import { useAuthContext } from "@/contexts/AuthContext";
import { useGetNotificationSettings } from "@/hooks/queries/useSettingQuery";
import {
  useUpdateNotificationSetting,
  useUpdateNotificationSlots,
  useUpdateProfile,
} from "@/hooks/queries/useSettingMutation";
import { SLOT_LABEL_MAP, SLOT_CODE_TO_LABEL } from "@/types/setting";
import type { SlotCode } from "@/types/setting";
import { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const SettingScreen = () => {
  const { user } = useAuthContext();

  // 알림 설정 로드
  const { data: notifSettings } = useGetNotificationSettings();

  // Mutations
  const updateProfile = useUpdateProfile();
  const updateNotifSetting = useUpdateNotificationSetting();
  const updateSlots = useUpdateNotificationSlots();

  // 로컬 상태 (저장하기 전까지 편집 중)
  const [userId, setUserId] = useState(user?.userId ?? "");
  const [profileImgUri, setProfileImgUri] = useState<string | null>(
    user?.avatarUrl ?? null,
  );
  const [profileImgChanged, setProfileImgChanged] = useState(false);

  const [momentEnabled, setMomentEnabled] = useState(false);
  // 한국어 레이블 set으로 관리
  const [selectedSlots, setSelectedSlots] = useState<Set<string>>(new Set());

  // 서버 데이터 로드 후 초기값 세팅
  useEffect(() => {
    if (notifSettings) {
      setMomentEnabled(notifSettings.momentEnabled);
      setSelectedSlots(
        new Set(notifSettings.slots.map((code) => SLOT_CODE_TO_LABEL[code])),
      );
    }
  }, [notifSettings]);

  const handleProfileImgChange = (uri: string) => {
    setProfileImgUri(uri);
    setProfileImgChanged(true);
  };

  const handleToggleSlot = (label: string, _code: SlotCode) => {
    setSelectedSlots((prev) => {
      const next = new Set(prev);
      if (next.has(label)) {
        next.delete(label);
      } else {
        next.add(label);
      }
      return next;
    });
  };

  const handleSave = async () => {
    const promises: Promise<unknown>[] = [];

    // 프로필 변경사항이 있으면 저장
    const userIdChanged = userId !== (user?.userId ?? "");
    if (userIdChanged || profileImgChanged) {
      promises.push(
        updateProfile.mutateAsync({
          ...(userIdChanged ? { userId } : {}),
          ...(profileImgChanged && profileImgUri
            ? {
                imageFile: {
                  uri: profileImgUri,
                  name: "profile.jpg",
                  type: "image/jpeg",
                },
              }
            : {}),
        }),
      );
    }

    // 알림 ON/OFF 변경사항
    if (notifSettings && momentEnabled !== notifSettings.momentEnabled) {
      promises.push(
        updateNotifSetting.mutateAsync({ momentEnabled }),
      );
    }

    // 슬롯 변경사항 (알림이 ON일 때만)
    if (momentEnabled && notifSettings) {
      const currentLabels = new Set(
        notifSettings.slots.map((c) => SLOT_CODE_TO_LABEL[c]),
      );
      const slotsChanged =
        selectedSlots.size !== currentLabels.size ||
        [...selectedSlots].some((l) => !currentLabels.has(l));

      if (slotsChanged) {
        const slotCodes = [...selectedSlots]
          .map((label) => SLOT_LABEL_MAP[label])
          .filter(Boolean) as SlotCode[];
        promises.push(updateSlots.mutateAsync({ slots: slotCodes }));
      }
    }

    if (promises.length === 0) {
      Alert.alert("변경사항이 없습니다.");
      return;
    }

    try {
      await Promise.all(promises);
      setProfileImgChanged(false);
      Alert.alert("저장 완료", "설정이 저장되었습니다.");
    } catch {
      Alert.alert("오류", "저장 중 문제가 발생했습니다. 다시 시도해주세요.");
    }
  };

  const isSaving =
    updateProfile.isPending ||
    updateNotifSetting.isPending ||
    updateSlots.isPending;

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.CLOUD }}
      edges={["top"]}
    >
      <Header
        label="setting"
        backgroundColor={colors.CLOUD}
        labelColor={colors.NAVY}
        leftIcon={<GoBackIcon />}
      />
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <ProfileEdit
          userId={userId}
          profileImgUri={profileImgUri}
          onUserIdChange={setUserId}
          onProfileImgChange={handleProfileImgChange}
        />
        <SettingActivate
          isActive={momentEnabled}
          onToggle={() => setMomentEnabled((v) => !v)}
        />
        <SettingTimeslot
          isVisible={momentEnabled}
          selectedSlots={selectedSlots}
          onToggleSlot={handleToggleSlot}
        />
        <View style={styles.buttonWrapper}>
          <FullButton
            type="fill"
            label={isSaving ? "저장 중..." : "저장하기"}
            onPress={handleSave}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 32,
    paddingBottom: 40,
  },
  buttonWrapper: {
    marginTop: 8,
  },
});

export default SettingScreen;
