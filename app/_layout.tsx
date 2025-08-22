import React from 'react';
import { Stack } from 'expo-router';
import { Amplify } from 'aws-amplify';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { amplifyConfig } from '../src/lib/amplify-config';

// Initialize Amplify
Amplify.configure(amplifyConfig);

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(app)" />
        <Stack.Screen name="(public)" />
      </Stack>
    </SafeAreaProvider>
  );
}
