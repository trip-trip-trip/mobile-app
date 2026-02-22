import { Redirect } from "expo-router";
import { useAuthContext } from "@/contexts/AuthContext";

export default function Index() {
  const { isLoading, isAuthenticated } = useAuthContext();

  if (isLoading) return null;
  if (isAuthenticated) return <Redirect href="/(tabs)/gallery" />;
  return <Redirect href="/auth" />;
}
