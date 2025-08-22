// React Native polyfills for Amplify v6 - MUST be first
import '@aws-amplify/react-native';

import React from 'react';
import { Stack } from 'expo-router';
import { Amplify } from 'aws-amplify';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { amplifyConfig } from '../src/lib/amplify-config';

// Initialize Amplify
console.log('Initializing Amplify with config:', amplifyConfig);
Amplify.configure(amplifyConfig);

// Verify Amplify is configured
console.log('Amplify configured, Auth config:', Amplify.getConfig().Auth);

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
