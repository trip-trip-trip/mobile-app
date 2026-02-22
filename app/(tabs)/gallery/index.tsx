import { AlbumCard } from "@/components/gallery/AlbumCard";
import { Ticket } from "@/components/gallery/Ticket";
import { Title } from "@/components/gallery/Title";
import { colors } from "@/constants/colors";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import Header from "@/components/Header";
import CameraIcon from "@/components/icons/CameraIcon";
import SettingIcon from "@/components/icons/SettingIcon";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";

/** ---------------------------
 * Types
 * --------------------------*/

type TripRaw = {
  id: number;
  placeName: string;
  title: string;
  startDate: string;
  endDate: string;
  places: string[];
  participantAvatarUrls: string[];
  photoCount: number;
  videoCount: number;
  myPhotoUrls: string[];
};

type TripItem = {
  trip: TripRaw;
  contents?: unknown; // 필요할 때 타입 구체화
};

type TripsResponse = {
  result?: TripItem[];
};

type ActiveTripResponse = {
  result: {
    isOngoing: boolean;
    // trip?: TripRaw; // 필요하면 여기서도 받을 수 있게 확장
  };
};

type TripInfo = {
  id: number;
  placeName: string;
  title: string;
  startDate: string;
  endDate: string;
  places: string[];
  members: string[];
  photoCount: number;
  videoCount: number;
  photos: string[];
  coverImage: string | null;
};

export default function Gallery() {
  const router = useRouter();
  // const [isLoading, setIsLoading] = useState(true);
  const todayDate = new Date().toISOString().split("T")[0];

  // 활성 여행 정보
  const [hasActive, setHasActive] = useState<boolean>(false);
  const [activeTripInfo, setActiveTripInfo] = useState<TripInfo | null>(null);
  const [completedTrips, setCompletedTrips] = useState<TripInfo[]>([]);
  // const [isLoading, setIsLoading] = useState<boolean>(false);

  const API_URL = process.env.EXPO_PUBLIC_API_URL;

  // 3. 활성 여행의 '정보' (제목, 날짜 등)를 담을 state
  // const [activeShotCount, setActiveShotCount] = useState(0);
  // const [tripData, setTripData] = useState({});

  // 활성 여행 정보(여부) 조회
  const fetchActive = async () => {
    try {
      const response = await fetch(`${API_URL}/trips/isActiveTrips`, {
        method: "GET",
        headers: {
          "Content-type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`활성 여행 정보 조회 실패: ${response.status}`);
      }

      const data = await response.json();
      // setActiveTripInfo(data.result.trip);
      setHasActive(data.result.isOngoing);
    } catch (error) {
      console.error("Error fetching active trip data:", error);
    }
  };

  // 전체 여행 정보(여부) 조회
  const fetchTrips = async () => {
    const response = await fetch(`${API_URL}/trips`, {
      method: "GET",
      headers: {
        "Content-type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`전체 여행 정보 조회 실패: ${response.status}`);
    }

    const data: TripsResponse = await response.json();
    const fetchedTrips = data.result ?? [];

    const completedList: TripInfo[] = [];
    const activeTrips: TripInfo[] = [];

    fetchedTrips.forEach((item) => {
      const trip = item.trip;

      const tripData: TripInfo = {
        id: trip.id,
        placeName: trip.places[0] || "",
        title: trip.title,
        startDate: trip.startDate,
        endDate: trip.endDate,
        places: trip.places,
        members: trip.participantAvatarUrls,
        photoCount: trip.photoCount,
        videoCount: trip.videoCount,
        photos: trip.myPhotoUrls,
        coverImage: trip.myPhotoUrls.length > 0 ? trip.myPhotoUrls[0] : null,
      };

      if (trip.endDate < todayDate) {
        completedList.push(tripData);
      } else {
        activeTrips.push(tripData);
      }
    });

    activeTrips.sort((a, b) => b.startDate.localeCompare(a.startDate));
    const newActiveTrip = activeTrips.length > 0 ? activeTrips[0] : null;

    // if (activeTrips.length > 0) {
    //   newActiveTrip = activeTrips[0];
    //   // 활성 여행 ID가 바뀌었으면 AuthContext의 activeTripId를 업데이트
    //   if (newActiveTrip.id !== activeTripId) {
    //     // setActiveTripId는 AuthContext에서 로컬스토리지까지 업데이트하는 함수입니다.
    //     setActiveTripId(newActiveTrip.id);
    //   }
    // } else {
    //   // 진행 중인 여행이 하나도 없다면 activeTripId를 초기화
    //   if (activeTripId) {
    //     setActiveTripId(null);
    //   }
    // }

    setActiveTripInfo(newActiveTrip);
    setCompletedTrips(completedList);
  };

  fetchActive();

  //테스트용 더미
  useEffect(() => {
    setHasActive(true);
    setActiveTripInfo(MOCK_ACTIVE_TRIPS[0]);
    setCompletedTrips(MOCK_COMPLETED_TRIPS);
    console.log(activeTripInfo);
  }, []);

  return (
    <View
      style={{ width: "100%", height: "100%", backgroundColor: colors.CLOUD }}
    >
      <Header
        label="Album"
        leftIcon={hasActive ? <CameraIcon /> : ""}
        rightIcon={<SettingIcon />}
        backgroundColor={colors.CLOUD}
        labelColor={colors.NAVY}
      />

      <ScrollView style={styles.container}>
        <Title>진행 중인 여행</Title>
        {hasActive ? (
          activeTripInfo ? (
            <Ticket data={activeTripInfo} />
          ) : null
        ) : (
          <View style={{ gap: 34 }}>
            <Text style={styles.explanation}>진행 중인 여행이 없어요</Text>
            <Pressable
              onPress={() => console.log("눌렷슨")}
              style={styles.button}
            >
              <Text style={styles.btnText}>새로운 여행 시작하기</Text>
            </Pressable>
          </View>
        )}

        <View style={{ marginBottom: 61 }} />

        <Title>지난 여행 기록</Title>

        {completedTrips.map((trip) => (
          <Pressable
            key={trip.id}
            onPress={() => router.push(`/gallery/${trip.id}`)}
          >
            <AlbumCard data={trip} />
          </Pressable>
        ))}
      </ScrollView>
    </View>
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
    color: colors.NAVY,
    fontFamily: "Monoplex KR",
    fontWeight: 400,
    margin: 12,
  },
  contentText: {
    fontSize: 16,
    color: colors.CLOUD,
    fontWeight: 400,
    fontFamily: "Monoplex KR",
  },
  titleCont: {
    backgroundColor: "",
    flex: 1,
    justifyContent: "center",
    borderBottomWidth: 1,
    borderBottomColor: colors.NAVY,
    borderStyle: "dashed",
    marginBottom: 21,
  },
  explanation: {
    color: "#000",
    opacity: 0.5,
    fontFamily: "Monoplex KR",
    textAlign: "center",
    fontSize: 16,
    fontWeight: 400,
  },
  button: {
    paddingVertical: 12,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.NAVY,
    borderRadius: 30,
  },
  btnText: {
    color: colors.CREAM,
    fontSize: 16,
    fontFamily: "Monoplex KR",
    fontWeight: 400,
  },
});

export const MOCK_ACTIVE_TRIPS: TripInfo[] = [
  {
    id: 101,
    placeName: "제주도",
    title: "2026 제주 봄 여행",
    startDate: "2026-02-20",
    endDate: "2026-02-28", // 오늘보다 미래
    places: [],
    members: [
      "https://i.pravatar.cc/100?img=1",
      "https://i.pravatar.cc/100?img=2",
      "https://i.pravatar.cc/100?img=3",
    ],
    photoCount: 19,
    videoCount: 6,
    photos: [
      "https://picsum.photos/400/300?random=11",
      "https://picsum.photos/400/300?random=12",
    ],
    coverImage: "https://picsum.photos/400/300?random=11",
  },
];

export const MOCK_COMPLETED_TRIPS: TripInfo[] = [
  {
    id: 201,
    placeName: "부산",
    title: "2025 여름 부산 여행",
    startDate: "2025-08-01",
    endDate: "2025-08-05",
    places: [],
    members: [
      "https://i.pravatar.cc/100?img=4",
      "https://i.pravatar.cc/100?img=5",
    ],
    photoCount: 58,
    videoCount: 12,
    photos: [
      "https://dimg04.tripcdn.com/images/1mj3n12000qgegys1A1AE_C_800_600_R5.png_.webp?proc=autoorient&proc=source%2Ftrip",
      "https://cdn.travie.com/news/photo/202404/52446_32970_4834.jpg",
      "https://db.kookje.co.kr/news2000/photo/2021/1215/L20211215.99099004567i1.jpg",
      "https://dimg04.tripcdn.com/images/1mj3n12000qgegys1A1AE_C_800_600_R5.png_.webp?proc=autoorient&proc=source%2Ftrip",
      "https://cdn.travie.com/news/photo/202404/52446_32970_4834.jpg",
      "https://db.kookje.co.kr/news2000/photo/2021/1215/L20211215.99099004567i1.jpg",
    ],
    coverImage:
      "https://dimg04.tripcdn.com/images/1mj3n12000qgegys1A1AE_C_800_600_R5.png_.webp?proc=autoorient&proc=source%2Ftrip",
  },
  {
    id: 202,
    placeName: "도쿄",
    title: "2026 도쿄",
    startDate: "2026-1-20",
    endDate: "2026-1-27",
    places: [],
    members: [
      "https://i.pravatar.cc/100?img=6",
      "https://i.pravatar.cc/100?img=7",
      "https://i.pravatar.cc/100?img=8",
    ],
    photoCount: 104,
    videoCount: 18,
    photos: [
      "https://i.namu.wiki/i/2oQQXF9un5Q7GAPYjVv2Qka-i96jrSw8CnJnzNG8D0xNjYn_UF4Xe_NHlGlKtz2tuTyrjtFa6MiM2WEHincmkw.webp",
      "https://img1.daumcdn.net/thumb/R1280x0.fjpg/?fname=http://t1.daumcdn.net/brunch/service/user/3yEW/image/uTwybT9pzj-tFieNR9bKZsSpw18.jpg",
      "https://dimg04.tripcdn.com/images/1mj2z12000f965feb068B_C_800_600_R5.png_.webp?proc=autoorient&proc=source%2Ftrip",
      "https://www.datocms-assets.com/101439/1741966285-tokyo.avif?auto=format&fit=crop&h=800&w=1200",
      "https://dimg04.tripcdn.com/images/1mj2z12000f965feb068B_C_800_600_R5.png_.webp?proc=autoorient&proc=source%2Ftrip",
    ],
    coverImage:
      "https://i.namu.wiki/i/2oQQXF9un5Q7GAPYjVv2Qka-i96jrSw8CnJnzNG8D0xNjYn_UF4Xe_NHlGlKtz2tuTyrjtFa6MiM2WEHincmkw.webp",
  },
];
