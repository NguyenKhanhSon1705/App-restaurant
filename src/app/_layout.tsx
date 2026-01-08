import AuthGuard from "@/common/guards/AuthGuard";
import env from "@/constant/envConstant";
import StoreProvider from "@/lib/Provider/StoreProvider";
import { SignalRProvider } from "@/lib/services/socket";
import { Stack } from "expo-router";
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from "react";
import { PaperProvider } from "react-native-paper";
import Toast from "react-native-toast-message";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  console.log("[RootLayout] Rendering...");

  useEffect(() => {
    // Hide splash screen after a short delay to ensure UI is ready
    const hideSplash = async () => {
      console.log("[RootLayout] Hiding Splash Screen");
      await SplashScreen.hideAsync();
    };
    hideSplash();
  }, []);

  return (
    <StoreProvider>
      <SignalRProvider url={env.SOCKET_URL}>
        <PaperProvider>
          <AuthGuard>
            <Stack >
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen name="(auth)/login" options={{ headerShown: false }} />
              <Stack.Screen name="restaurants/switchRestaurant" options={{ headerShown: false }} />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="tableDish/tableDish" options={{ headerShown: false }} />
            </Stack>
          </AuthGuard>
          <Toast />
        </PaperProvider>
      </SignalRProvider>
    </StoreProvider>
  )

}
