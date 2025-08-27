import * as Linking from 'expo-linking';

// Amplify Configuration (v6 format)
// Enhanced for OAuth providers (Google) with Cognito

// Get all possible redirect URLs for the app based on environment
const getRedirectUrls = () => {
  // Main redirect URL from .env
  const mainRedirectUrl = process.env.EXPO_PUBLIC_SIGNIN_REDIRECT_URL;
  
  // Expo development URL
  const expoDevUrl = Linking.createURL('/');

  // Collect all valid URLs, filter out any undefined/empty ones
  return [mainRedirectUrl, expoDevUrl].filter(Boolean) as string[];
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
            // 'prompt' parameter forces Google to show account selection
            // 'login_hint' can be set if you want to pre-fill a specific account
            cognitoHostedUIOptions: {
              oAuthQueryParameters: {
                prompt: 'select_account',
              },
            },
          },
        },
      },
    }
  }
};
