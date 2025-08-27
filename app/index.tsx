import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, Platform, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { fetchAuthSession, getCurrentUser, fetchUserAttributes } from 'aws-amplify/auth';

export default function IndexScreen() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Improved handling of initial deep link URL
    const getInitialUrl = async () => {
      try {
        const initialURL = await Linking.getInitialURL();
        console.log('🔗 Initial URL:', initialURL);
        
        if (initialURL) {
          console.log('🔍 Inspecting initial URL...');
          
          // Check for OAuth code in any part of the URL or if it's from development client
          if (initialURL.includes('code=')) {
            console.log('🔓 OAuth code detected in initial URL!');
            await processOAuthCallback(initialURL);
            return true;
          } else if (initialURL.includes('expo-development-client')) {
            console.log('💻 Development client URL detected - watching for OAuth redirect...');
            // In development mode, we may get expo-development-client URLs first
            // We'll need to rely on the URL event listener for the actual OAuth code
          } else {
            console.log('⚠️ No OAuth code in initial URL');
          }
        }
        return false;
      } catch (error) {
        console.log('🚨 Error getting initial URL:', error);
        return false;
      }
    };
    
    // Enhanced function to extract and process OAuth code from URL
    const processOAuthCallback = async (url: string) => {
      try {
        console.log('🔑 Processing OAuth callback URL:', url);
        
        // Try to extract code from URL query parameters
        let code: string | null = null;
        try {
          // First try standard URL parsing
          const urlObj = new URL(url);
          code = urlObj.searchParams.get('code');
          
          // If code not found in search params, try parsing it from the fragment
          if (!code && urlObj.hash) {
            const hashParams = new URLSearchParams(urlObj.hash.substring(1));
            code = hashParams.get('code');
          }
          
          // If still no code, try manual extraction (some URLs might not parse correctly)
          if (!code) {
            const codeMatch = url.match(/code=([^&]+)/);
            if (codeMatch && codeMatch[1]) {
              code = codeMatch[1];
            }
          }
        } catch (parseError) {
          // If URL parsing fails, try manual extraction
          console.log('⚠️ Error parsing URL, trying manual extraction:', parseError);
          const codeMatch = url.match(/code=([^&]+)/);
          if (codeMatch && codeMatch[1]) {
            code = codeMatch[1];
          }
        }
        
        if (code) {
          console.log('🔐 Auth code extracted successfully, length:', code.length);
          
          // Wait briefly to ensure AWS SDK is ready to process the auth code
          console.log('⌛ Adding brief delay before auth refresh...');
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Force refresh auth session multiple times if needed
          for (let i = 0; i < 2; i++) {
            console.log(`🔄 Forcing auth session refresh (attempt ${i+1})`);
            try {
              const session = await fetchAuthSession({ forceRefresh: true });
              if (session?.tokens?.idToken) {
                console.log('✅ Valid session found! Navigating to home');
                router.replace('/(app)/home');
                return true;
              } else {
                console.log('⚠️ No tokens in session, retrying...');
                await new Promise(resolve => setTimeout(resolve, 500)); // Wait before retry
              }
            } catch (refreshError) {
              console.log('🚨 Error refreshing session:', refreshError);
              await new Promise(resolve => setTimeout(resolve, 500)); // Wait before retry
            }
          }
          
          console.log('⛔ Could not obtain valid session after multiple attempts');
          return false;
        } else {
          console.log('⚠️ No auth code found in URL');
          return false;
        }
      } catch (error) {
        console.log('🚨 Error processing OAuth callback:', error);
        return false;
      }
    };
    
    // Set up listener for incoming deep links
    const subscription = Linking.addEventListener('url', (event: {url: string}) => {
      console.log('🔗 Deep link event received:', event.url);
      
      if (event.url && event.url.includes('code=')) {
        console.log('🔓 OAuth code detected in deep link!');
        processOAuthCallback(event.url);
      } else {
        console.log('❓ Deep link without OAuth code:', event.url);
      }
    });
    
    // Call getInitialUrl to check for initial OAuth code in URL
    getInitialUrl().then(hasAuthCode => {
      if (!hasAuthCode) {
        // Only run regular auth check if we didn't process an OAuth code
        checkAuthState();
      }
    });
    
    // Clean up subscription on unmount
    return () => {
      subscription.remove();
    };
  }, []);

  const checkAuthState = async () => {
    let didNavigate = false;
    try {
      console.log('🔍 Checking auth state...');
      
      // On iOS, we may get a successful auth session but need to ensure navigation
      if (Platform.OS === 'ios') {
        console.log('📱 iOS: Additional checks for OAuth completion');
        // On iOS, delay slightly to ensure auth state is fully updated after redirect
        await new Promise(resolve => setTimeout(resolve, 300));
      }

      // Manually handle the OAuth redirect result
      // This is needed especially for Android where WebView has issues

      // First, ensure we have a finalized session (handles post-redirect reliably)
      console.log('🔒 Fetching auth session...');
      const session = await fetchAuthSession();
      if (session?.tokens?.idToken) {
        console.log('🎫 Valid token found, navigating to home');
        
        // Let's verify we have user data by fetching attributes
        try {
          const userAttributes = await fetchUserAttributes();
          console.log('👤 User attributes fetched', userAttributes.email || 'unknown email');
        } catch (error) {
          console.log('⚠️ Could not fetch user attributes, but proceeding', error);
        }
        
        didNavigate = true;
        router.replace('/(app)/home');
        return;
      }
      
      // Small delay and retry once in case redirect just finalized
      console.log('⏱️ Waiting briefly and retrying session check...');
      await new Promise((r) => setTimeout(r, 500));
      const session2 = await fetchAuthSession();
      if (session2?.tokens?.idToken) {
        console.log('🎫 Valid token found on retry, navigating to home');
        didNavigate = true;
        router.replace('/(app)/home');
        return;
      }
      
      // Fallback to getCurrentUser to double-check
      console.log('👤 Fetching current user as final check...');
      try {
        await getCurrentUser();
        console.log('👤 User found, navigating to home');
        didNavigate = true;
        router.replace('/(app)/home');
        return;
      } catch (userError) {
        console.log('❌ No authenticated user found', userError);
        throw userError; // Re-throw to go to the catch block
      }
    } catch (error) {
      didNavigate = true;
      router.replace('/(public)/signin');
    } finally {
      // As a safety net, ensure we don't stay on a blank screen
      if (!didNavigate) {
        router.replace('/(public)/signin');
      }
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Authenticating...</Text>
        </View>
        <StatusBar style="auto" />
      </SafeAreaView>
    );
  }

  // Minimal fallback in case navigation didn't happen yet
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.loadingContainer} />
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
});
