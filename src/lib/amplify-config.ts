import * as Linking from 'expo-linking';
import { Platform } from 'react-native';

// Amplify Configuration (v6 format)
// Enhanced for OAuth providers (Google) with Cognito

// Get all possible redirect URLs for the app based on environment
const getRedirectUrls = () => {
  // IMPORTANT: These EXACT URLs must be registered in your Cognito app client settings
  // Base scheme URL without path (most common configuration)
  const baseSchemeUrl = 'cognito-rn-poc://';
  
  // If you're having redirect issues, try all possible variations that might be registered
  // in your Cognito app client settings
  const variations = [
    baseSchemeUrl,                   // cognito-rn-poc://
    `${baseSchemeUrl}callback/`,     // cognito-rn-poc://callback/
    `${baseSchemeUrl}signin/`,       // cognito-rn-poc://signin/
    Linking.createURL('/')           // For Expo dev URLs
  ];
  
  return variations.filter(Boolean) as string[];
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
