import { colors } from "@/constants";
import { ResizeMode, Video } from "expo-av";
import { StyleSheet, View } from "react-native";

type Props = {
  videoUrl: string;
};

export function VideoThumbItem({ videoUrl }: Props) {
  return (
    <View style={styles.tile}>
      <Video
        source={{ uri: videoUrl }}
        style={StyleSheet.absoluteFill}
        resizeMode={ResizeMode.COVER}
        isMuted
        shouldPlay={false}
        useNativeControls={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    width: "100%",
    aspectRatio: 1,
    backgroundColor: colors.CREAM,
    overflow: "hidden",
  },
});
