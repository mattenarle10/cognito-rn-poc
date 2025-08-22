// Amplify Configuration (v6 format)
// Automatically configured from environment variables

// Environment is provided by Expo via EXPO_PUBLIC_* variables

export const amplifyConfig = {
  Auth: {
    Cognito: {
      userPoolId: process.env.EXPO_PUBLIC_USER_POOL_ID || 'us-east-1_XXXXXXXXX',
      userPoolClientId: process.env.EXPO_PUBLIC_USER_POOL_CLIENT_ID || 'XXXXXXXXXXXXXXXXXXXXXXXXXX',
      region: process.env.EXPO_PUBLIC_AWS_REGION || 'us-east-1',
      // For username_attributes = ["email"], don't need extra config
    }
  }
};
