import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { fetchAuthSession, getCurrentUser } from 'aws-amplify/auth';

export default function IndexScreen() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    let didNavigate = false;
    try {
      // First, ensure we have a finalized session (handles post-redirect reliably)
      const session = await fetchAuthSession();
      if (session?.tokens?.idToken) {
        didNavigate = true;
        router.replace('/(app)/home');
        return;
      }
      // Small delay and retry once in case redirect just finalized
      await new Promise((r) => setTimeout(r, 200));
      const session2 = await fetchAuthSession();
      if (session2?.tokens?.idToken) {
        didNavigate = true;
        router.replace('/(app)/home');
        return;
      }
      // Fallback to getCurrentUser to double-check
      await getCurrentUser();
      didNavigate = true;
      router.replace('/(app)/home');
    } catch {
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
        <View style={styles.loadingContainer} />
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
});
