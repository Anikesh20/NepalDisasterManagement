import { Stack } from "expo-router";
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            title: 'Home',
          }}
        />
        <Stack.Screen
          name="(auth)/LoginScreen"
          options={{
            title: 'Login',
          }}
        />
        <Stack.Screen
          name="(auth)/SignupScreen"
          options={{
            title: 'Sign Up',
          }}
        />
      </Stack>
    </SafeAreaProvider>
  );
}
