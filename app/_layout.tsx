import '@aws-amplify/react-native';

import { Stack } from 'expo-router';
import { Amplify } from 'aws-amplify';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as WebBrowser from 'expo-web-browser';
import { amplifyConfig } from '../src/lib/amplify-config';

// Initialize Amplify as early as possible
Amplify.configure(amplifyConfig as any);

// Complete any pending web browser auth sessions (critical for OAuth flows)
WebBrowser.maybeCompleteAuthSession();

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
