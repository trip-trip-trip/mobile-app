import PhotoDetailView from "@/components/gallery/PhotoDetailUI";
import { DetailMediaItem } from "@/types/gallery";
import { Modal, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Props = {
  visible: boolean;
  onClose: () => void;

  items: DetailMediaItem[]; // 사진들
  initialIndex: number; // 선택한 사진 index

  onDownload?: (item: DetailMediaItem) => void;
};

const PhotoDetailModal = ({
  visible,
  onClose,
  items,
  initialIndex,
  onDownload,
}: Props) => {
  return (
    <Modal visible={visible} animationType="fade" transparent>
      <SafeAreaView style={styles.safe}>
        <View style={styles.container}>
          <PhotoDetailView
            items={items}
            initialIndex={initialIndex}
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
