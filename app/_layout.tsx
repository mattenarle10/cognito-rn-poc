import React from 'react';
import '@aws-amplify/react-native';
import { Stack } from 'expo-router';
import { Amplify } from 'aws-amplify';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as WebBrowser from 'expo-web-browser';
import { amplifyConfig } from '../src/lib/amplify-config';

// Initialize Amplify
Amplify.configure(amplifyConfig as any);

// Call this early in the app to handle OAuth redirects
// This is critical for proper OAuth flow completion
const authSessionResult = WebBrowser.maybeCompleteAuthSession();
console.log('🔑 Auth session completion result:', authSessionResult);

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
