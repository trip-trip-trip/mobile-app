import { ResizeMode, Video } from "expo-av";

export function VideoThumbItem({ videoUrl }: { videoUrl: string }) {
  return (
    <Video
      source={{ uri: videoUrl }}
      style={{ width: "50%", height: "50%" }}
      resizeMode={ResizeMode.COVER}
      isMuted
      shouldPlay={false}
    />
  );
}
