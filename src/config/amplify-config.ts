// Amplify Configuration (v6 format)
// Automatically configured from environment variables

export const amplifyConfig = {
  Auth: {
    Cognito: {
      userPoolId: process.env.EXPO_PUBLIC_USER_POOL_ID || 'us-east-1_XXXXXXXXX',
      userPoolClientId: process.env.EXPO_PUBLIC_USER_POOL_CLIENT_ID || 'XXXXXXXXXXXXXXXXXXXXXXXXXX',
      region: process.env.EXPO_PUBLIC_AWS_REGION || 'us-east-1',
      // Optional: Configure OAuth if needed
      // loginWith: {
      //   oauth: {
      //     domain: 'your-domain.auth.us-east-1.amazoncognito.com',
      //     scopes: ['email', 'openid'],
      //     redirectSignIn: ['exp://localhost:19000/'],
      //     redirectSignOut: ['exp://localhost:19000/'],
      //     responseType: 'code',
      //   }
      // }
    }
  }
};
