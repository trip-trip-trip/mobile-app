import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs
      initialRouteName="gallery"
      screenOptions={({ route }) => ({
        headerShown: false,
        // 여행 만들기(지역/일정) 스택이 탭 이탈 후에도 남아, 카메라에서 시스템
        // 뒤로가기 시 그 화면으로 떨어지던 문제 방지 — 탭을 떠나면 스택 초기화
        // (unmountOnBlur는 React Navigation v7에서 제거되어 no-op이라 삭제.
        //  카메라 리소스 해제는 카메라 화면의 isFocused 게이트가 담당)
        popToTopOnBlur: route.name === "trip",
        tabBarStyle: { display: "none", pointerEvents: "none" },
      })}
      tabBar={() => null}
    />
  );
}
