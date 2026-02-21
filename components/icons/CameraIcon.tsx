import Camera from "@/assets/icons/camera_icon.svg";
import { colors } from "@/constants/colors";
import { useRouter } from "expo-router";
import { Pressable } from "react-native";

type Props = {
  color?: string;
};

const CameraIcon = ({ color = colors.NAVY }: Props) => {
  const router = useRouter();

  return (
    <Pressable onPress={() => router.back()} hitSlop={8}>
      <Camera width={20} height={18} />
    </Pressable>
  );
};

export default CameraIcon;
