import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs
      initialRouteName="gallery"
      screenOptions={({ route }) => ({
        headerShown: false,
        unmountOnBlur: route.name === "camera",
        tabBarStyle: { display: "none", pointerEvents: "none" },
      })}
      tabBar={() => null}
    />
  );
}
