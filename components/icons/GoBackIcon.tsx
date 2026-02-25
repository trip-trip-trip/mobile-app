import { colors } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable } from "react-native";

type Props = {
  color?: string;
};

const GoBackIcon = ({ color = colors.NAVY }: Props) => {
  const router = useRouter();

  return (
    <Pressable onPress={() => { if (router.canGoBack()) router.back(); }} hitSlop={8}>
      <Ionicons name="chevron-back" size={24} color={color} />
    </Pressable>
  );
};

export default GoBackIcon;
