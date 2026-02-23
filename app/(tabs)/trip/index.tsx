import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  SectionList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Pressable as GHPressable } from "react-native-gesture-handler";
import { router } from "expo-router";

import CityItem from "@/components/CityItem";
import FilterTab from "@/components/FilterTab";
import Header from "@/components/Header";
import GoBackIcon from "@/components/icons/GoBackIcon";
import { colors } from "@/constants";
import { useGetPlaces } from "@/hooks/queries/useTripQuery";
import type { PlaceRes } from "@/types/trip";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type CityDisplayItem = PlaceRes & { description: string };
type Section = { title: string; data: CityDisplayItem[] };

// CITY 레벨 하위 항목 재귀 탐색
// CITY의 자식(SPOT 레벨) 이름을 쉼표 구분 description으로 사용
function getCityDescendants(
  parentId: number,
  childrenOf: Map<number | null, PlaceRes[]>,
): CityDisplayItem[] {
  const children = childrenOf.get(parentId) ?? [];
  const result: CityDisplayItem[] = [];

  for (const child of children) {
    if (child.type === "CITY") {
      const spots = childrenOf.get(child.id) ?? [];
      const description = spots.map((s) => s.name).join(", ");
      result.push({ ...child, description });
    } else {
      result.push(...getCityDescendants(child.id, childrenOf));
    }
  }
  return result;
}

export default function TripsIndex() {
  const [mainTab, setMainTab] = useState<"국내" | "해외">("해외");
  const [subFilter, setSubFilter] = useState("전체");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const insets = useSafeAreaInsets();

  const { data: places, isLoading, isError, refetch } = useGetPlaces();

  // 플랫 리스트 → 트리 구조 변환
  const {
    placesById,
    childrenOf,
    domesticFilterTabs,
    internationalFilterTabs,
  } = useMemo(() => {
    if (!places?.length) {
      return {
        placesById: new Map<number, PlaceRes>(),
        childrenOf: new Map<number | null, PlaceRes[]>(),
        domesticFilterTabs: [] as PlaceRes[],
        internationalFilterTabs: [] as PlaceRes[],
      };
    }

    const placesById = new Map(places.map((p) => [p.id, p]));
    const childrenOf = new Map<number | null, PlaceRes[]>();

    for (const p of places) {
      const key: number | null = p.parentId ?? null;
      if (!childrenOf.has(key)) childrenOf.set(key, []);
      childrenOf.get(key)!.push(p);
    }

    // 국내: type=COUNTRY, name="대한민국" 인 place의 자식이 필터 탭
    const koreaId =
      places.find((p) => p.type === "COUNTRY" && p.name === "대한민국")?.id ??
      null;
    const domesticFilterTabs =
      koreaId != null ? (childrenOf.get(koreaId) ?? []) : [];

    // 해외: 최상위(parentId=null) place 중 대한민국 제외한 나머지
    const internationalFilterTabs = (childrenOf.get(null) ?? []).filter(
      (p) => !(p.type === "COUNTRY" && p.name === "대한민국"),
    );

    return {
      placesById,
      childrenOf,
      domesticFilterTabs,
      internationalFilterTabs,
    };
  }, [places]);

  // 현재 탭 + 필터 기준 SectionList 데이터
  const sections: Section[] = useMemo(() => {
    const topLevelFilters =
      mainTab === "국내" ? domesticFilterTabs : internationalFilterTabs;
    const filtered =
      subFilter === "전체"
        ? topLevelFilters
        : topLevelFilters.filter((t) => t.name === subFilter);

    return filtered
      .map((filterItem) => ({
        title: filterItem.name,
        data: getCityDescendants(filterItem.id, childrenOf),
      }))
      .filter((s) => s.data.length > 0);
  }, [
    mainTab,
    subFilter,
    domesticFilterTabs,
    internationalFilterTabs,
    childrenOf,
  ]);

  const currentFilterTabs =
    mainTab === "국내" ? domesticFilterTabs : internationalFilterTabs;

  const handleMainTabChange = (tab: "국내" | "해외") => {
    setMainTab(tab);
    setSubFilter("전체");
    setSelectedIds([]);
  };

  const handleCityPress = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const handleComplete = () => {
    const selectedCityNames = selectedIds.map(
      (id) => placesById.get(id)?.name ?? "",
    );
    router.push({
      pathname: "/(tabs)/trip/schedule",
      params: {
        placeIds: JSON.stringify(selectedIds),
        cityNames: JSON.stringify(selectedCityNames),
      },
    });
  };

  if (isLoading) {
    return (
      <View style={[styles.safeArea, styles.centered]}>
        <ActivityIndicator size="large" color={colors.NAVY} />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={[styles.safeArea, styles.centered]}>
        <Text style={styles.errorText}>장소 목록을 불러오지 못했습니다.</Text>
        <Pressable onPress={() => refetch()} style={styles.retryButton}>
          <Text style={styles.retryText}>다시 시도</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.safeArea}>
      <Header
        labelColor={colors.CREAM}
        backgroundColor={colors.CREAM}
        leftIcon={<GoBackIcon />}
      />
      <View style={styles.headerTitleContainer}>
        <Text style={styles.titleText}>여행, 어디로 떠나시나요?</Text>
        <Text style={styles.subText}>여행 장소를 모두 선택해주세요.</Text>
      </View>

      {/* 국내 / 해외 메인 탭 */}
      <View style={styles.mainTabContainer}>
        {(["국내", "해외"] as const).map((tab) => (
          <Pressable
            key={tab}
            style={[styles.mainTab, mainTab === tab && styles.activeMainTab]}
            onPress={() => handleMainTabChange(tab)}
          >
            <Text
              style={[
                styles.mainTabText,
                mainTab === tab && styles.activeMainTabText,
              ]}
            >
              {tab}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* 하위 필터 탭 (가로 스크롤) */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterContainer}
      >
        <FilterTab
          label="전체"
          isSelected={subFilter === "전체"}
          onPress={() => setSubFilter("전체")}
        />
        {currentFilterTabs.map((tab) => (
          <FilterTab
            key={tab.id}
            label={tab.name}
            isSelected={subFilter === tab.name}
            onPress={() => setSubFilter(tab.name)}
          />
        ))}
      </ScrollView>

      {/* 장소 목록 */}
      <SectionList
        style={styles.list}
        sections={sections}
        keyExtractor={(item) => item.id.toString()}
        stickySectionHeadersEnabled={false}
        renderSectionHeader={({ section: { title } }) => (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionHeaderText}>{title}</Text>
          </View>
        )}
        renderItem={({ item }) => (
          <CityItem
            title={item.name}
            description={item.description}
            isSelected={selectedIds.includes(item.id)}
            onPress={() => handleCityPress(item.id)}
          />
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text style={styles.emptyText}>등록된 장소가 없습니다.</Text>
          </View>
        }
      />

      {/* GHPressable: gesture handler가 UIScrollView 터치 체인을 우회하여 iOS 26에서도 동작 */}
      {selectedIds.length > 0 && (
        <GHPressable
          style={({ pressed }) => [
            styles.buttonContainer,
            { paddingBottom: insets.bottom },
            pressed && styles.buttonPressed,
          ]}
          onPress={handleComplete}
        >
          <Text
            style={styles.buttonText}
          >{`여행지 ${selectedIds.length}개 선택`}</Text>
        </GHPressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.CLOUD },
  // flexGrow:1 + flexShrink:1 → 버튼 자연 높이 먼저 확보 후 나머지 공간 차지
  list: { flexGrow: 1, flexShrink: 1 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  headerTitleContainer: {
    paddingHorizontal: 22,
    paddingVertical: 20,
    marginTop: 20,
    marginBottom: 16,
  },
  titleText: {
    fontSize: 22,
    fontFamily: "MonoplexKR-Bold",
    color: colors.INK,
    marginBottom: 20,
  },
  subText: {
    fontSize: 14,
    color: colors.INK,
    fontFamily: "MonoplexKR-Regular",
  },
  mainTabContainer: { flexDirection: "row", width: "100%" },
  mainTab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
  },
  activeMainTab: { borderBottomWidth: 2, borderBottomColor: colors.INK },
  mainTabText: {
    fontSize: 16,
    color: colors.INK,
    fontFamily: "MonoplexKR-Medium",
  },
  activeMainTabText: { fontFamily: "MonoplexKR-Bold" },
  filterContainer: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 0 },
  listContent: { paddingBottom: 20 },
  sectionHeader: {
    backgroundColor: colors.CLOUD,
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  sectionHeaderText: {
    fontSize: 16,
    fontFamily: "MonoplexKR-Bold",
    color: colors.INK,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    backgroundColor: colors.NAVY,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonText: {
    color: colors.CREAM,
    fontSize: 16,
    textAlign: "center",
    fontFamily: "MonoplexKR-Regular",
  },
  errorText: {
    color: colors.NAVY,
    fontFamily: "MonoplexKR-Regular",
    fontSize: 14,
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.NAVY,
  },
  retryText: {
    color: colors.NAVY,
    fontFamily: "MonoplexKR-Medium",
    fontSize: 14,
  },
  emptyText: {
    color: colors.NAVY,
    fontFamily: "MonoplexKR-Regular",
    fontSize: 14,
  },
});
