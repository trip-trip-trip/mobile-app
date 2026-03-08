import { colors } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable } from "react-native";

type Props = {
  color?: string;
  onPress?: () => void;
};

const GoBackIcon = ({ color = colors.NAVY, onPress }: Props) => {
  const router = useRouter();
  const handlePress = onPress ?? (() => { if (router.canGoBack()) router.back(); });

  return (
    <Pressable onPress={handlePress} hitSlop={8}>
      <Ionicons name="chevron-back" size={24} color={color} />
    </Pressable>
  );
};

export default GoBackIcon;
