import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, Platform, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { fetchAuthSession, getCurrentUser, fetchUserAttributes } from 'aws-amplify/auth';

export default function IndexScreen() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Log deep link URL for debugging OAuth redirects
    const getInitialUrl = async () => {
      const initialURL = await Linking.getInitialURL();
      console.log('🔗 Initial URL:', initialURL);
    };
    
    getInitialUrl();
    
    // Listen for deep linking events to debug OAuth redirects
    const subscription = Linking.addEventListener('url', (event: {url: string}) => {
      console.log('🔗 Got URL event:', event.url);
    });
    
    // Start authentication check
    checkAuthState();
    
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
