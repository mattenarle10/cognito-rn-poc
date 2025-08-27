module.exports = {
  expo: {
    name: 'cognito-rn-poc',
    slug: 'cognito-rn-poc',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff'
    },
    assetBundlePatterns: [
      '**/*'
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.anonymous.cognito-rn-poc'
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#ffffff'
      },
      package: 'com.anonymous.cognito_rn_poc'
    },
    web: {
      favicon: './assets/favicon.png'
    },
    plugins: [
      [
        'expo-build-properties',
        {
          android: {
            extraMavenRepos: [
              '../../node_modules/@aws-amplify/rtn-web-browser/android/build/outputs/repo'
            ],
          }
        }
      ]
    ],
    scheme: 'cognito-rn-poc',
    // Define the extra fields from app.json
    extra: {
      eas: {
        projectId: 'your-project-id'
      }
    }
  }
};
