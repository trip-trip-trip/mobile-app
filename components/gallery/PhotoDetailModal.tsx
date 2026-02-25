import PhotoDetailView from "@/components/gallery/PhotoDetailUI";
import { Modal, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Props = {
  visible: boolean;
  onClose: () => void;
  mediaKind: string;
  mediaUrl: string;
  date: string;
  dayLabel: string;
  lat?: number | null;
  lng?: number | null;
  comment?: string | null;

  onDownload?: () => void;
};

const PhotoDetailModal = ({
  visible,
  onClose,
  mediaKind,
  mediaUrl,
  date,
  dayLabel,
  lat,
  lng,
  comment,
  onDownload,
}: Props) => {
  return (
    <Modal visible={visible} animationType="fade" transparent>
      <SafeAreaView style={styles.safe}>
        <View style={styles.container}>
          <PhotoDetailView
            mediaKind={mediaKind}
            mediaUrl={mediaUrl}
            date={date}
            dayLabel={dayLabel}
            lat={lat}
            lng={lng}
            comment={comment}
            onClose={onClose}
            onDownload={onDownload}
          />
        </View>
      </SafeAreaView>
    </Modal>
  );
};

export default PhotoDetailModal;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "black",
  },
  container: {
    flex: 1,
  },
});
