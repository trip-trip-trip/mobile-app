import CameraClock from "@/components/camera/CameraClock";
import CameraHeader from "@/components/camera/CameraHeader";
import PicProgress from "@/components/camera/PicProgress";
import ShotIndicator from "@/components/camera/ShotIndicator";
import SwitchCameraButton from "@/components/camera/SwitchCameraButton";
import FullButton from "@/components/FullButton";

import { BlurView } from "expo-blur";
import {
  CameraView,
  useCameraPermissions,
  useMicrophonePermissions,
} from "expo-camera";
import { LinearGradient } from "expo-linear-gradient";
import * as ImageManipulator from "expo-image-manipulator";
import * as Location from "expo-location";
import { Accelerometer, Gyroscope } from "expo-sensors";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  BackHandler,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import CamLines from "@/assets/icons/CamLines.svg";
import FilterIcon from "@/assets/icons/filterbutton.svg";
import PhotoButton from "@/assets/icons/photoButton.svg";
import RedBar from "@/assets/icons/RedBar.svg";
import VideoButton from "@/assets/icons/videoButton.svg";
import VideoLines from "@/assets/icons/VideoLines.svg";
import WhitePanel from "@/assets/icons/whitepanel.svg";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useIsFocused } from "@react-navigation/native";

// API 임포트
import { getTripAlbumDetail } from "@/api/album";
import { getActiveTripData } from "@/api/gallery";
import { uploadMedia } from "@/api/media";
import { albumKeys } from "@/hooks/queries/gallery/albumKeys";
import { useGalleryTripsQuery } from "@/hooks/queries/gallery/useAllTrips";
import { useDailyShotLimit } from "@/hooks/queries/useDailyShotLimit";
import { isAxiosError } from "axios";
import { useQuery } from "@tanstack/react-query";

const CameraScreen = () => {
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [micPermission, requestMicPermission] = useMicrophonePermissions();

  const [mode, setMode] = useState<"photo" | "video">("photo");
  const [isRecording, setIsRecording] = useState(false);
  const [facing, setFacing] = useState<"front" | "back">("back");
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [capturedUri, setCapturedUri] = useState<string | null>(null);
  // 위치는 미리보기 전환을 막지 않도록 백그라운드로 획득하고 저장 시점에 합류한다.
  // (기존에 촬영과 위치를 Promise.all로 묶어, 갤럭시 실내 GPS fix 시간(3~20초)만큼
  // 미리보기 전환이 지연되던 문제의 원인)
  const locationPromiseRef = useRef<Promise<{
    lat: number;
    lng: number;
  } | null> | null>(null);
  // 업로드 축소 판단용 원본 치수 (사진 모드에서만 기록)
  const capturedSizeRef = useRef<{ width: number; height: number } | null>(
    null
  );
  // 세션 중 마지막으로 성공한 좌표 — 신선한 fix가 늦을 때의 폴백
  const lastGoodCoordsRef = useRef<{ lat: number; lng: number } | null>(null);
  const isFocused = useIsFocused();
  const [isBlurDetected, setIsBlurDetected] = useState(false);

  const { tripId } = useLocalSearchParams<{ tripId?: string }>();
  const parsedTripId = Number(tripId);

  const { data: tripsData } = useGalleryTripsQuery();
  const activeTripId = tripsData?.activeTrip?.id;

  const targetTripId =
    Number.isFinite(parsedTripId) && parsedTripId > 0
      ? parsedTripId
      : activeTripId;

  // API 연동용 상태
  const [comment, setComment] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  // 1. 현재 여행 정보 실시간 데이터 가져오기 (Day 및 촬영 횟수 계산용)
  const { data: tripStatus, refetch: refetchTripStatus } = useQuery({
    queryKey: ["activeTripData"],
    queryFn: getActiveTripData,
  });

  const { data: tripDetail, refetch: refetchTripDetail } = useQuery({
    queryKey: albumKeys.detail(targetTripId as number),
    queryFn: () => getTripAlbumDetail(targetTripId as number),
    enabled: Number.isFinite(targetTripId) && Number(targetTripId) > 0,
  });

  // 롤 시스템: Day N/M과 촬영 컷 번호는 전부 서버 판정값 사용 — 날짜 계산 금지
  const currentDay = tripDetail?.result.currentRoll ?? 1;
  const totalDays = tripDetail?.result.totalDays ?? 1;

  // 현재 롤에 저장된 사진 수 → 다음 촬영이 몇 번째 컷인지
  const currentPicIndex = useMemo(() => {
    const result = tripDetail?.result;
    const roll = result?.rolls?.find((r) => r.index === result?.currentRoll);
    const savedCount = roll?.photos?.length ?? 0;
    return Math.min(savedCount + 1, 4);
  }, [tripDetail?.result]);

  const { isLimitReached, todayPhotoCount } = useDailyShotLimit(
    Number(targetTripId)
  );

  useFocusEffect(
    useCallback(() => {
      void refetchTripStatus();
      if (targetTripId) {
        void refetchTripDetail();
      }
      // GPS fix를 미리 시작 — 첫 촬영의 지오태그가 저장 시한(2.5초) 안에 잡히도록.
      // 단, 위치 권한이 이미 있을 때만 (워밍업이 권한 다이얼로그를 띄우면
      // 카메라 화면이 백그라운드로 마운트되는 경로에서 엉뚱한 시점에 팝업이 뜬다.
      // 권한 요청 자체는 셔터를 누르는 자연스러운 시점에 acquireCoords가 수행)
      void Location.getForegroundPermissionsAsync()
        .then(({ granted }) => {
          if (granted) void acquireCoords();
        })
        .catch(() => {});
      return () => setIsCameraReady(false); // 블러 후 재마운트 대비
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [refetchTripStatus, refetchTripDetail, targetTripId])
  );

  useEffect(() => {
    if (!permission) return;
    if (!permission.granted) requestPermission();
  }, [permission, requestPermission]);

  useEffect(() => {
    if (!micPermission) return;
    if (!micPermission.granted) requestMicPermission();
  }, [micPermission, requestMicPermission]);

  const measureShakeWindow = async (): Promise<number> => {
    return new Promise((resolve) => {
      const accelSamples: number[] = [];
      const gyroSamples: number[] = [];
      Accelerometer.setUpdateInterval(20);
      Gyroscope.setUpdateInterval(20);

      const accelSub = Accelerometer.addListener((data) => {
        const magnitude = Math.sqrt(data.x ** 2 + data.y ** 2 + data.z ** 2);
        accelSamples.push(Math.abs(magnitude - 1));
      });

      const gyroSub = Gyroscope.addListener((data) => {
        const magnitude = Math.sqrt(data.x ** 2 + data.y ** 2 + data.z ** 2);
        gyroSamples.push(magnitude);
      });

      setTimeout(() => {
        accelSub.remove();
        gyroSub.remove();
        const accelAvg =
          accelSamples.reduce((a, b) => a + b, 0) / (accelSamples.length || 1);
        const gyroAvg =
          gyroSamples.reduce((a, b) => a + b, 0) / (gyroSamples.length || 1);
        resolve(accelAvg * 1.3 + gyroAvg * 0.8);
      }, 350);
    });
  };

  const coordsOf = (position: Location.LocationObject) => {
    const { latitude, longitude } = position.coords;
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
    return { lat: latitude, lng: longitude };
  };

  // 신선한 위치 fix를 요청하고, 성공하면 세션 폴백(lastGoodCoordsRef)에도 반영.
  // OS 캐시는 최근 1분 내의 것만 폴백 시드로 사용 — 무제한 스테일 캐시를 쓰면
  // 도시를 이동한 뒤에도 이전 도시 좌표가 지오태그로 붙을 수 있다.
  const acquireCoords = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return null;

      if (!lastGoodCoordsRef.current) {
        try {
          const cached = await Location.getLastKnownPositionAsync({
            maxAge: 60_000,
          });
          if (cached) lastGoodCoordsRef.current = coordsOf(cached);
        } catch {}
      }

      const fresh = coordsOf(
        await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        })
      );
      if (fresh) lastGoodCoordsRef.current = fresh;
      return fresh;
    } catch (error) {
      console.error("Location capture error:", error);
      return null;
    }
  };

  const handleShutterPress = async () => {
    if (!cameraRef.current || !isCameraReady || isUploading) return;

    if (mode === "photo" && isLimitReached) {
      Alert.alert(
        "오늘 촬영 완료",
        "하루에 사진은 4장까지만 촬영할 수 있어요."
      );
      return;
    }

    if (mode === "photo") {
      try {
        locationPromiseRef.current = acquireCoords();
        const shakePromise = measureShakeWindow();
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8, // 갤럭시 원본(수 MB~십수 MB) 그대로 올리면 업로드가 수 배 느림
          shutterSound: false, // 시스템 셔터음이 과도하게 큼 (QA)
        });
        const shakeScore = await shakePromise;
        setIsBlurDetected(shakeScore > 0.25);
        capturedSizeRef.current = { width: photo.width, height: photo.height };
        setCapturedUri(photo.uri);
      } catch (error) {
        console.error("Photo capture error:", error);
      }
    } else if (mode === "video") {
      if (isRecording) return;
      try {
        setIsRecording(true);
        locationPromiseRef.current = acquireCoords();
        const video = await cameraRef.current.recordAsync({ maxDuration: 3 });
        if (video?.uri) setCapturedUri(video.uri);
      } catch (error) {
        console.error("Video recording error:", error);
      } finally {
        setIsRecording(false);
      }
    }
  };

  const handleSave = async () => {
    if (!capturedUri || isUploading) return;

    try {
      setIsUploading(true);
      if (!targetTripId) {
        Alert.alert("오류", "여행 정보를 찾을 수 없습니다.");
        return;
      }

      // 위치가 아직 안 잡혔으면 잠깐만 기다리고, 세션의 마지막 좌표로 폴백 — 저장을 막지 않는다
      const location =
        (await Promise.race([
          locationPromiseRef.current ?? Promise.resolve(null),
          new Promise<null>((resolve) => setTimeout(() => resolve(null), 2500)),
        ])) ?? lastGoodCoordsRef.current;

      // 업로드 전 긴 변 2048px로 축소 — 원본 해상도 그대로면 업로드·서버 처리가 수 배 느림
      let uploadUri = capturedUri;
      const size = capturedSizeRef.current;
      if (mode === "photo" && size && Math.max(size.width, size.height) > 2048) {
        try {
          const resized = await ImageManipulator.manipulateAsync(
            capturedUri,
            [
              {
                resize:
                  size.height > size.width
                    ? { height: 2048 }
                    : { width: 2048 },
              },
            ],
            { compress: 0.85, format: ImageManipulator.SaveFormat.JPEG }
          );
          uploadUri = resized.uri;
        } catch {
          // 축소 실패 시 원본 업로드
        }
      }

      await uploadMedia(
        mode,
        targetTripId,
        uploadUri,
        comment,
        location?.lat ?? null,
        location?.lng ?? null
      );

      // 저장 성공 시 알림
      Alert.alert("성공", "추억이 안전하게 저장되었습니다!", [
        {
          text: "확인",
          onPress: async () => {
            // 중요: 서버 데이터를 다시 불러와서(Refetch) 캐시를 갱신함
            // 그래야 다시 카메라에 들어왔을 때 currentPicIndex가 업데이트됨
            await Promise.all([refetchTripStatus(), refetchTripDetail()]);

            // 초기화 후 갤러리로 이동
            setCapturedUri(null);
            setComment("");
            locationPromiseRef.current = null;
            capturedSizeRef.current = null;
            setIsBlurDetected(false);
            router.push("/(tabs)/gallery");
          },
        },
      ]);
    } catch (error) {
      console.error("Upload error:", error);
      // 서버가 쿼터 초과("오늘의 필름을 다 썼습니다")·여행 종료 등을 판정하므로 메시지를 그대로 표시
      const serverMessage = isAxiosError(error)
        ? error.response?.data?.message
        : null;
      Alert.alert("실패", serverMessage || "서버 업로드 중 문제가 발생했습니다.");
    } finally {
      setIsUploading(false);
    }
  };

  // 다시 촬영하기 로직 (업로드 진행 중에는 무시 — 취소된 줄 알았는데 쿼터가 소모되는 것 방지)
  const handleRetake = () => {
    if (isUploading) return;
    setCapturedUri(null);
    setComment("");
    locationPromiseRef.current = null;
    capturedSizeRef.current = null;
    setIsBlurDetected(false);
  };

  // 안드로이드 시스템 뒤로가기: 미리보기 중이면 다시 찍기, 아니면 메인(갤러리)으로.
  // 기본 동작(히스토리 pop)은 여행 만들기 잔류 스택(지역/일정 화면)으로 떨어진다 (QA)
  useFocusEffect(
    useCallback(() => {
      const sub = BackHandler.addEventListener("hardwareBackPress", () => {
        if (isUploading) return true; // 저장 중에는 이탈 금지
        if (capturedUri) {
          handleRetake();
        } else {
          router.replace("/(tabs)/gallery");
        }
        return true;
      });
      return () => sub.remove();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [capturedUri, isUploading])
  );

  // 권한 게이트는 반드시 모든 훅·함수 정의 뒤에 있어야 한다.
  // 훅 등록 후 이 지점 위에서 early return하면, 위쪽 focus effect가
  // 아직 초기화되지 않은 아래쪽 함수(acquireCoords 등)를 호출해
  // "undefined is not a function"으로 앱이 죽는다 (2026-07-31 갤럭시 실사고).
  if (!permission?.granted) {
    return <View style={{ flex: 1, backgroundColor: "black" }} />;
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* 1. 하드코딩 제거된 헤더 연동 */}
      <CameraHeader currentDay={currentDay} totalDays={totalDays} />

      <View style={styles.cameraContainer}>
        {capturedUri ? (
          <View style={styles.resultWrapper}>
            <Image source={{ uri: capturedUri }} style={styles.resultImage} />
            <BlurView
              intensity={80}
              tint="dark"
              style={StyleSheet.absoluteFill}
            />

            {/* 사진이 흔들렸을 때 뜨는 경고창의 '다시 찍기' */}
            {isBlurDetected && (
              <View style={styles.blurWarning}>
                <Text style={styles.warningText}>사진이 약간 흔들렸어요</Text>
                <Pressable onPress={handleRetake}>
                  <Text style={styles.retryText}>다시 찍기</Text>
                </Pressable>
              </View>
            )}

            {/* 장식용 프레임 — 아래 깔린 '다시 찍기' 버튼이 눌리도록 터치 통과 */}
            <View style={styles.photoFrame} pointerEvents="none">
              <Image
                source={require("@/assets/camera/photoframe.png")}
                style={{ width: "100%", height: "100%" }}
                resizeMode="cover"
              />
            </View>
            <View style={styles.resultTextWrapper}>
              <Text style={styles.resultTitle}>촬영 완료!</Text>
              <Text style={styles.resultSub}>
                여행이 끝난 후에 확인해보세요!
              </Text>
            </View>
          </View>
        ) : (
          <>
            {isFocused && (
              <CameraView
                ref={cameraRef}
                style={styles.camera}
                facing={facing}
                mirror={facing === "front"}
                mode={mode === "photo" ? "picture" : "video"}
                onCameraReady={() => setIsCameraReady(true)}
              />
            )}
            {/* ShotIndicator에도 현재 번호 연동 가능 */}
            <ShotIndicator current={currentPicIndex} />
            {/* 필름 날짜 각인 스타일 실시간 시계 (로컬 + UTC) */}
            <CameraClock />
          </>
        )}
      </View>

      <View style={styles.bottomBar}>
        {capturedUri ? (
          <View style={styles.commentWrapper}>
            <Text style={styles.commentLabel}>COMMENT</Text>
            <TextInput
              style={styles.commentInput}
              placeholder="댓글을 입력하세요"
              placeholderTextColor="#888"
              value={comment}
              onChangeText={setComment}
              returnKeyType="done"
              onSubmitEditing={() => Keyboard.dismiss()}
            />
            <View style={{ gap: 10 }}>
              <Pressable disabled={isUploading}>
                <FullButton
                  type="fill"
                  label={isUploading ? "저장 중..." : "저장하기"}
                  onPress={handleSave}
                />
              </Pressable>
            </View>
          </View>
        ) : (
          <>
            <View style={styles.topRow}>
              <View style={styles.centerIndicators}>
                <RedBar width={69} height={6} />
                {mode === "photo" ? (
                  <CamLines width={96} height={16} />
                ) : (
                  <VideoLines width={110} height={25} />
                )}
              </View>
              <Pressable style={styles.filterButton}>
                <FilterIcon width={65} height={37} />
              </Pressable>
            </View>

            {/* 2. 하루 촬영 횟수 프로그레스 연동 */}
            {mode === "photo" && (
              <View style={styles.progressWrapper}>
                <PicProgress current={todayPhotoCount + 1} />
              </View>
            )}

            <View style={styles.whitePanelWrapper}>
              <WhitePanel width={350} height={193.5} />
            </View>
            <View style={styles.centerStack}>
              <View style={styles.modeCenter}>
                {(["photo", "video"] as const).map((item) => (
                  <Pressable
                    key={item}
                    onPress={() => {
                      setMode(item);
                    }}
                    style={styles.modeButtonWrapper}
                  >
                    <LinearGradient
                      colors={[
                        "rgba(190,190,190,0.9)",
                        "rgba(190,190,190,0.2)",
                      ]}
                      style={styles.gradientBorder}
                    >
                      <View
                        style={
                          mode === item
                            ? styles.activeButton
                            : styles.inactiveButton
                        }
                      >
                        <Text
                          style={
                            mode === item
                              ? styles.activeText
                              : styles.inactiveText
                          }
                        >
                          {item === "photo" ? "사진" : "동영상"}
                        </Text>
                      </View>
                    </LinearGradient>
                  </Pressable>
                ))}
              </View>
              <View style={styles.globalShutter}>
                <Pressable onPress={handleShutterPress} disabled={isRecording}>
                  {mode === "photo" && <PhotoButton width={78} height={78} />}
                  {mode === "video" &&
                    (isRecording ? (
                      <View style={styles.recordingSquare} />
                    ) : (
                      <VideoButton width={78} height={78} />
                    ))}
                </Pressable>
              </View>
            </View>
            <View style={styles.switchWrapper}>
              <SwitchCameraButton
                onPress={() => setFacing(facing === "back" ? "front" : "back")}
              />
            </View>
          </>
        )}
      </View>
    </KeyboardAvoidingView>
  );
};

export default CameraScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111111",
  },
  retakeButton: {
    alignItems: "center",
    paddingVertical: 10,
  },
  retakeText: {
    color: "#888",
    fontSize: 14,
    textDecorationLine: "underline",
  },

  cameraContainer: {
    flex: 1,
  },

  camera: {
    flex: 1,
  },

  resultWrapper: {
    flex: 1,
  },

  resultImage: {
    flex: 1,
  },

  photoFrame: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
  },

  resultTextWrapper: {
    position: "absolute",
    bottom: 80,
    alignSelf: "center",
    alignItems: "center",
  },

  resultTitle: {
    color: "#DFE2E4",
    fontSize: 12,
    fontWeight: "700",
  },

  resultSub: {
    color: "#DFE2E4",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 4,
  },

  blurWarning: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: "rgba(26,26,26,0.5)",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  warningText: {
    color: "#F0F0F0",
    fontSize: 14,
  },

  retryText: {
    color: "#F6F6F5",
    fontSize: 12,
    fontWeight: "700",
    textDecorationLine: "underline",
  },

  bottomBar: {
    height: 253,
    backgroundColor: "#111111",
  },

  commentWrapper: {
    width: 362,
    alignSelf: "center",
    flexDirection: "column",
    gap: 18,
    marginTop: 24,
  },

  commentLabel: {
    color: "#F0F0F0",
    fontSize: 14,
  },

  commentInput: {
    width: "100%",
    borderBottomWidth: 1,
    borderBottomColor: "#444",
    color: "#F0F0F0",
    paddingVertical: 8,
  },

  topRow: {
    position: "absolute",
    top: 10,
    left: 0,
    right: 0,
    alignItems: "center",
  },

  centerIndicators: {
    alignItems: "center",
    gap: 6,
  },

  filterButton: {
    position: "absolute",
    right: 20,
    top: 0,
  },

  progressWrapper: {
    position: "absolute",
    left: 20,
    bottom: 20,
  },

  whitePanelWrapper: {
    position: "absolute",
    right: 0,
    bottom: 0,
    width: 350,
    height: 193.5,
  },

  centerStack: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: "center",
  },

  modeCenter: {
    position: "absolute",
    bottom: 146,
    flexDirection: "row",
    gap: 12,
  },

  modeButtonWrapper: {
    borderRadius: 20,
  },

  gradientBorder: {
    padding: 2,
    borderRadius: 20,
    overflow: "hidden",
  },

  activeButton: {
    backgroundColor: "#EA4335",
    paddingVertical: 6,
    paddingHorizontal: 20,
    borderRadius: 18,
  },

  inactiveButton: {
    paddingVertical: 6,
    paddingHorizontal: 20,
    borderRadius: 18,
  },

  activeText: {
    color: "white",
    fontSize: 12,
  },

  inactiveText: {
    color: "#1A1A1A",
    opacity: 0.4,
    fontSize: 12,
  },

  globalShutter: {
    position: "absolute",
    bottom: 60,
  },

  recordingSquare: {
    width: 30,
    height: 30,
    backgroundColor: "#EA4335",
    borderRadius: 6,
  },

  switchWrapper: {
    position: "absolute",
    right: 20,
    bottom: 60,
  },
});
