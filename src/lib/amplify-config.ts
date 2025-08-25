// Amplify Configuration (v6 format)
// Minimal config for Cognito User Pool (email/password only)

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
          // Amplify expects arrays for RN/Expo so it can pick the matching redirect
          redirectSignIn: [process.env.EXPO_PUBLIC_SIGNIN_REDIRECT_URL].filter(Boolean) as string[],
          redirectSignOut: [process.env.EXPO_PUBLIC_SIGNOUT_REDIRECT_URL].filter(Boolean) as string[],
          responseType: 'code',
        },
      },
    }
  }
};
