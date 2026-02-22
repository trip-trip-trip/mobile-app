import Setting from "@/assets/icons/setting.svg";
import { colors } from "@/constants/colors";
import { useRouter } from "expo-router";
import { Pressable } from "react-native";

type Props = {
  color?: string;
};

const SettingIcon = ({ color = colors.NAVY }: Props) => {
  const router = useRouter();

  return (
    <Pressable onPress={() => router.push("/(tabs)/setting")} hitSlop={8}>
      <Setting width={24} height={24} />
    </Pressable>
  );
};

export default SettingIcon;
