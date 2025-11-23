import AuthGuard from "@/common/guards/AuthGuard";
import StoreProvider from "@/lib/Provider/StoreProvider";
import { Stack } from "expo-router";
import { PaperProvider } from "react-native-paper";
import Toast from "react-native-toast-message";

export default function RootLayout() {
  return (
    <StoreProvider>
      <PaperProvider>
        <AuthGuard>
          {/* <GuestGuard> */}
            {/* <GuestGuard> */}
            <Stack >
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen name="(auth)/login" options={{ headerShown: false }} />
              <Stack.Screen name="restaurants/switchRestaurant" options={{ headerShown: false }} />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="tableDish/tableDish" options={{ headerShown: false }} />
            </Stack>
            {/* </GuestGuard> */}
          {/* </GuestGuard> */}
        </AuthGuard>
        <Toast />
      </PaperProvider>

    </StoreProvider>
  )

}
