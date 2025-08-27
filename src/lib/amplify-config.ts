import * as Linking from 'expo-linking';
import { Platform } from 'react-native';

// Amplify Configuration (v6 format)
// Enhanced for OAuth providers (Google) with Cognito

// Get all possible redirect URLs for the app based on environment
const getRedirectUrls = () => {
  // Main app scheme URL - this must match the scheme in app.json and Cognito
  // Format: scheme:// (for deep linking back to the app)
  const schemeUrl = 'cognito-rn-poc://';
  
  // Get the dynamic Expo URL for development
  const expoDevUrl = Linking.createURL('/');
  
  // Include explicit app scheme URL for iOS/Android native handling
  return [schemeUrl, expoDevUrl].filter(Boolean) as string[];
};

export const amplifyConfig = {
  Auth: {
    Cognito: {
      userPoolId: process.env.EXPO_PUBLIC_USER_POOL_ID,
      userPoolClientId: process.env.EXPO_PUBLIC_USER_POOL_CLIENT_ID,
      region: process.env.EXPO_PUBLIC_AWS_REGION,
      // OAuth configuration for Cognito Hosted UI (Google)
      loginWith: {
        oauth: {
          // Domain should be host only (no protocol)
          domain: process.env.EXPO_PUBLIC_COGNITO_DOMAIN_HOST,
          scopes: ['openid', 'email', 'profile'],
          // Use our getRedirectUrls helper for consistent redirect URL handling
          redirectSignIn: getRedirectUrls(),
          redirectSignOut: getRedirectUrls(),
          // Use 'code' grant for secure authorization code flow
          responseType: 'code',
          // Force account selection on every login
          options: {
            // These settings help ensure the Google account chooser appears
            cognitoHostedUIOptions: {
              // Always show account selection screen
              oAuthQueryParameters: {
                prompt: 'select_account',
              },
            },
            // Disable custom tabs in Android for consistent behavior
            customTabs: false,
            // Ensure redirect works by explicitly defining browser package
            browserPackage: Platform.select({
              android: 'com.android.chrome',
              ios: undefined
            }),
          },
        },
      },
    }
  }
};
