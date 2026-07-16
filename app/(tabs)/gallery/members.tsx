import DefaultProfile from "@/assets/icons/default_profile.svg";
import Header from "@/components/Header";
import GoBackIcon from "@/components/icons/GoBackIcon";
import { colors } from "@/constants/colors";
import { useTripMembersQuery } from "@/hooks/queries/gallery/useTripMembers";
import useAuth from "@/hooks/queries/useAuth";
import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useMemo } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import type { TripMember } from "@/types/gallery";

export default function TripMembers() {
  const params = useLocalSearchParams<{ tripId?: string; title?: string }>();
  const { user } = useAuth();

  const tripId = useMemo(() => {
    const parsed = Number(params.tripId);
    return Number.isNaN(parsed) ? 0 : parsed;
  }, [params.tripId]);

  const { data: members, isLoading } = useTripMembersQuery(tripId);

  const handlePressMember = (member: TripMember) => {
    if (member.id === user?.id) return; // 내 프로필은 이동 없음 (현재 앨범이 곧 내 앨범)

    router.push({
      pathname: "/(tabs)/gallery/member-album" as any,
      params: {
        tripId: String(tripId),
        memberId: String(member.id),
        memberUserId: member.userId,
        memberAvatarUrl: member.avatarUrl ?? "",
        title: params.title ?? "",
      },
    });
  };

  const renderMember = ({ item }: { item: TripMember }) => {
    const isMe = item.id === user?.id;
    const isOwner = item.role?.toLowerCase() === "owner";

    return (
      <Pressable
        style={({ pressed }) => [
          styles.memberRow,
          pressed && !isMe && { opacity: 0.6 },
        ]}
        onPress={() => handlePressMember(item)}
        disabled={isMe}
      >
        <View style={styles.avatarWrapper}>
          {item.avatarUrl ? (
            <Image source={{ uri: item.avatarUrl }} style={styles.avatar} />
          ) : (
            <DefaultProfile width={48} height={48} />
          )}
        </View>

        <View style={styles.memberInfo}>
          <Text style={styles.memberName}>@{item.userId}</Text>
          <Text style={styles.memberHint}>
            {isMe ? "내 앨범은 이전 화면에서 볼 수 있어요" : "네컷 · 영상 보러 가기"}
          </Text>
        </View>

        <View style={styles.badgeGroup}>
          {isOwner && (
            <View style={styles.ownerBadge}>
              <Text style={styles.ownerBadgeText}>OWNER</Text>
            </View>
          )}
          {isMe ? (
            <View style={styles.meBadge}>
              <Text style={styles.meBadgeText}>나</Text>
            </View>
          ) : (
            <Feather name="chevron-right" size={20} color={colors.NAVY} />
          )}
        </View>
      </Pressable>
    );
  };

  return (
    <View style={styles.safeArea}>
      <Header
        label="Members"
        backgroundColor={colors.CLOUD}
        labelColor={colors.NAVY}
        leftIcon={<GoBackIcon />}
      />

      <View style={styles.titleSection}>
        {!!params.title && <Text style={styles.tripTitle}>{params.title}</Text>}
        <Text style={styles.subTitle}>
          함께한 멤버{" "}
          <Text style={{ color: colors.RED }}>{members?.length ?? 0}명</Text>
        </Text>
      </View>

      {isLoading ? (
        <View style={styles.loadingWrapper}>
          <ActivityIndicator size="large" color={colors.NAVY} />
        </View>
      ) : (
        <FlatList
          data={members ?? []}
          renderItem={renderMember}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={
            <Text style={styles.emptyText}>멤버 정보를 불러오지 못했어요.</Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.CLOUD,
  },
  titleSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
    gap: 4,
  },
  tripTitle: {
    fontFamily: "MonoplexKR-Bold",
    fontSize: 20,
    color: colors.INK,
  },
  subTitle: {
    fontFamily: "MonoplexKR-Medium",
    fontSize: 13,
    color: colors.NAVY,
  },
  loadingWrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  memberRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    gap: 12,
  },
  avatarWrapper: {
    width: 48,
    height: 48,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: colors.NAVY,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.CREAM,
  },
  avatar: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  memberInfo: {
    flex: 1,
    gap: 2,
  },
  memberName: {
    fontFamily: "MonoplexKR-SemiBold",
    fontSize: 15,
    color: colors.INK,
  },
  memberHint: {
    fontFamily: "MonoplexKR-Regular",
    fontSize: 11,
    color: colors.NAVY,
    opacity: 0.7,
  },
  badgeGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  ownerBadge: {
    borderWidth: 1,
    borderColor: colors.RED,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  ownerBadgeText: {
    fontFamily: "MonoplexKR-Bold",
    fontSize: 10,
    color: colors.RED,
  },
  meBadge: {
    backgroundColor: colors.NAVY,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  meBadgeText: {
    fontFamily: "MonoplexKR-Bold",
    fontSize: 11,
    color: colors.CLOUD,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.NAVY,
    opacity: 0.3,
  },
  emptyText: {
    fontFamily: "MonoplexKR-Regular",
    fontSize: 13,
    color: colors.NAVY,
    textAlign: "center",
    marginTop: 40,
  },
});
