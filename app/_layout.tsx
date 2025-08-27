import React from 'react';
import '@aws-amplify/react-native';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Amplify } from 'aws-amplify';
import { amplifyConfig } from '../src/lib/amplify-config';
import * as WebBrowser from 'expo-web-browser';

// Initialize Amplify
Amplify.configure(amplifyConfig as any);

// Configure WebBrowser for optimal OAuth flow
WebBrowser.maybeCompleteAuthSession({
  skipRedirectCheck: false, // Ensure all redirects are checked
});

console.log('🔑 WebBrowser auth session handling initialized');

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
