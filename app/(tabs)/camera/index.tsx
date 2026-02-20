import CameraHeader from "@/components/camera/CameraHeader";
import PicProgress from "@/components/camera/PicProgress";
import ShotIndicator from "@/components/camera/ShotIndicator";
import SwitchCameraButton from "@/components/camera/SwitchCameraButton";

import { BlurView } from "expo-blur";
import { CameraView, useCameraPermissions } from "expo-camera";
import { LinearGradient } from "expo-linear-gradient";
import { Accelerometer, Gyroscope } from "expo-sensors";

import React, { useEffect, useRef, useState } from "react";
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import CamLines from "@/assets/icons/CamLines.svg";
import RedBar from "@/assets/icons/RedBar.svg";
import VideoLines from "@/assets/icons/VideoLines.svg";
import FilterIcon from "@/assets/icons/filterbutton.svg";
import PhotoButton from "@/assets/icons/photoButton.svg";
import VideoButton from "@/assets/icons/videoButton.svg";
import WhitePanel from "@/assets/icons/whitepanel.svg";

const CameraScreen = () => {
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();

  const [mode, setMode] = useState<"photo" | "video">("photo");
  const [isRecording, setIsRecording] = useState(false);
  const [facing, setFacing] = useState<"front" | "back">("back");

  const [isCameraReady, setIsCameraReady] = useState(false);

  const [capturedUri, setCapturedUri] = useState<string | null>(null);
  const [isBlurDetected, setIsBlurDetected] = useState(false);

  const current = 1;

  useEffect(() => {
    if (!permission) return;
    if (!permission.granted) requestPermission();
  }, [permission]);

  if (!permission?.granted) {
    return <View style={{ flex: 1, backgroundColor: "black" }} />;
  }

  const measureShakeWindow = async (): Promise<number> => {
    return new Promise((resolve) => {
      const accelSamples: number[] = [];
      const gyroSamples: number[] = [];

      Accelerometer.setUpdateInterval(20);
      Gyroscope.setUpdateInterval(20);

      const accelSub = Accelerometer.addListener((data) => {
        const magnitude = Math.sqrt(
          data.x * data.x + data.y * data.y + data.z * data.z,
        );
        accelSamples.push(Math.abs(magnitude - 1)); // 중력 제거
      });

      const gyroSub = Gyroscope.addListener((data) => {
        const magnitude = Math.sqrt(
          data.x * data.x + data.y * data.y + data.z * data.z,
        );
        gyroSamples.push(magnitude);
      });

      setTimeout(() => {
        accelSub.remove();
        gyroSub.remove();

        const accelAvg =
          accelSamples.reduce((a, b) => a + b, 0) / (accelSamples.length || 1);

        const gyroAvg =
          gyroSamples.reduce((a, b) => a + b, 0) / (gyroSamples.length || 1);

        const shakeScore = accelAvg * 1.3 + gyroAvg * 0.8;

        resolve(shakeScore);
      }, 350);
    });
  };

  const handleShutterPress = async () => {
    console.log("Shutter Pressed. Ready:", isCameraReady, "Mode:", mode);
    // 1. 기본적인 체크
    if (!cameraRef.current || !isCameraReady) {
      console.log("Camera not ready yet");
      return;
    }

    if (mode === "photo") {
      try {
        // 사진 촬영
        const shakePromise = measureShakeWindow();
        const photo = await cameraRef.current.takePictureAsync();
        const shakeScore = await shakePromise;
        setIsBlurDetected(shakeScore > 0.25);
        setCapturedUri(photo.uri);
      } catch (error) {
        console.error("Photo capture error:", error);
      }
    } else if (mode === "video") {
      if (isRecording || !isCameraReady) return;

      try {
        setIsRecording(true);

        const video = await cameraRef.current.recordAsync({
          maxDuration: 3,
        });

        if (video?.uri) {
          setCapturedUri(video.uri);
        }
      } catch (error) {
        console.error("Video recording error:", error);
      } finally {
        setIsRecording(false);
      }
    }
  };

  return (
    <View style={styles.container}>
      <CameraHeader />

      {/* CAMERA AREA */}
      <View style={styles.cameraContainer}>
        {capturedUri ? (
          <View style={styles.resultWrapper}>
            <Image source={{ uri: capturedUri }} style={styles.resultImage} />

            <BlurView
              intensity={80}
              tint="dark"
              style={StyleSheet.absoluteFill}
            />

            {isBlurDetected && (
              <View style={styles.blurWarning}>
                <Text style={styles.warningText}>사진이 약간 흔들렸어요</Text>
                <Pressable onPress={() => setCapturedUri(null)}>
                  <Text style={styles.retryText}>다시 찍기</Text>
                </Pressable>
              </View>
            )}

            <Image
              source={require("@/assets/camera/photoframe.png")}
              style={styles.photoFrame}
              resizeMode="contain"
            />

            <View style={styles.resultTextWrapper}>
              <Text style={styles.resultTitle}>촬영 완료!</Text>
              <Text style={styles.resultSub}>
                여행이 끝난 후에 확인해보세요!
              </Text>
            </View>
          </View>
        ) : (
          <>
            <CameraView
              ref={cameraRef}
              style={styles.camera}
              facing={facing}
              mode={mode as any}
              onCameraReady={() => {
                console.log("CAMERA READY");
                setIsCameraReady(true);
              }}
            />

            <ShotIndicator current={current} />
          </>
        )}
      </View>

      {/* BOTTOM BAR */}
      <View style={styles.bottomBar}>
        {capturedUri ? (
          <View style={styles.commentWrapper}>
            <Text style={styles.commentLabel}>COMMENT</Text>
            <TextInput
              style={styles.commentInput}
              placeholder="댓글을 입력하세요"
              placeholderTextColor="#888"
            />
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

            {mode === "photo" && (
              <View style={styles.progressWrapper}>
                <PicProgress current={current} />
              </View>
            )}

            <View style={styles.whitePanelWrapper}>
              <WhitePanel width={350} height={193.5} />
            </View>

            <View style={styles.centerStack}>
              <View style={styles.modeCenter}>
                {(["photo", "video"] as const).map((item) => {
                  const isActive = mode === item;
                  return (
                    <Pressable
                      key={item}
                      onPress={() => setMode(item)}
                      style={styles.modeButtonWrapper}
                    >
                      <LinearGradient
                        colors={[
                          "rgba(190,190,190,0.9)",
                          "rgba(190,190,190,0.2)",
                        ]}
                        start={{ x: 0.5, y: 0 }}
                        end={{ x: 0.5, y: 1 }}
                        style={styles.gradientBorder}
                      >
                        {isActive ? (
                          <View style={styles.activeButton}>
                            <Text style={styles.activeText}>
                              {item === "photo" ? "사진" : "동영상"}
                            </Text>
                          </View>
                        ) : (
                          <View style={styles.inactiveButton}>
                            <Text style={styles.inactiveText}>
                              {item === "photo" ? "사진" : "동영상"}
                            </Text>
                          </View>
                        )}
                      </LinearGradient>
                    </Pressable>
                  );
                })}
              </View>

              <View style={styles.globalShutter}>
                <Pressable onPress={handleShutterPress}>
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
    </View>
  );
};

export default CameraScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111111",
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
    position: "absolute",
    width: 390,
    height: 225,
    alignSelf: "center",
    top: "50%",
    transform: [{ translateY: -112.5 }],
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
