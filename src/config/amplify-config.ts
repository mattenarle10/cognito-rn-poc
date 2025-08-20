// Amplify Configuration
// This will be updated with your actual Cognito User Pool details

export const amplifyConfig = {
  Auth: {
    // TODO: Replace with your actual Cognito User Pool ID
    userPoolId: 'us-east-1_XXXXXXXXX',
    // TODO: Replace with your actual Cognito User Pool Client ID  
    userPoolClientId: 'XXXXXXXXXXXXXXXXXXXXXXXXXX',
    // TODO: Replace with your AWS region
    region: 'us-east-1',
    // Optional: Configure OAuth if needed
    // oauth: {
    //   domain: 'your-domain.auth.us-east-1.amazoncognito.com',
    //   scope: ['email', 'openid'],
    //   redirectSignIn: 'exp://localhost:19000/',
    //   redirectSignOut: 'exp://localhost:19000/',
    //   responseType: 'code',
    // }
  }
};
