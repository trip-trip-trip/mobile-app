import { colors } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import InputField from "../InputField";

type Props = {
  userId: string;
  profileImgUri: string | null;
  onUserIdChange: (value: string) => void;
  onProfileImgChange: (uri: string) => void;
};

const ProfileEdit = ({
  userId,
  profileImgUri,
  onUserIdChange,
  onProfileImgChange,
}: Props) => {
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      onProfileImgChange(result.assets[0].uri);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>프로필 수정</Text>
      <Pressable onPress={pickImage} style={styles.profileImgContainer}>
        {profileImgUri ? (
          <Image source={{ uri: profileImgUri }} style={styles.profileImg} />
        ) : (
          <View style={styles.profileImgPlaceholder}>
            <Ionicons name="camera-outline" size={32} color={colors.NAVY} />
          </View>
        )}
      </Pressable>
      <InputField
        label="아이디"
        value={userId}
        onChangeText={onUserIdChange}
        placeholder="아이디를 입력하세요"
      />
    </View>
  );
};

export default ProfileEdit;

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "flex-start",
    gap: 18,
    alignSelf: "stretch",
  },
  title: {
    fontFamily: "MonoplexKR-Regular",
    fontSize: 16,
    color: colors.NAVY,
  },
  profileImgContainer: {
    alignItems: "center",
    alignSelf: "stretch",
  },
  profileImg: {
    width: 150,
    height: 150,
    borderRadius: 75,
  },
  profileImgPlaceholder: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 1,
    borderColor: colors.NAVY,
    backgroundColor: colors.CREAM,
    justifyContent: "center",
    alignItems: "center",
  },
});
