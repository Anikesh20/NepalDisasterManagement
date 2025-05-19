import { Stack } from "expo-router";
import React from 'react';
import { View } from 'react-native';

export default function RootLayout() {
  return (
    <View style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)/LoginScreen" />
        <Stack.Screen name="(auth)/SignupScreen" />
        <Stack.Screen name="(dashboard)" />
        <Stack.Screen name="(admin)" />
      </Stack>
    </View>
  );
}
