import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { signOut, getCurrentUser } from 'aws-amplify/auth';
import type { UserInfo } from '../../src/types';

export default function DashboardScreen() {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserInfo();
  }, []);

  const fetchUserInfo = async () => {
    try {
      const user = await getCurrentUser();
      setUserInfo({
        userId: user.userId,
        username: user.username,
      });
    } catch (error) {
      console.error('Error fetching user info:', error);
      // If we can't get user info, redirect to auth
      router.replace('/(public)/signin');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
              router.replace('/(public)/signin');
            } catch (error: any) {
              console.error('Sign out error:', error);
              Alert.alert('Error', 'Failed to sign out');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
        <StatusBar style="dark" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.header}>
          <Text style={styles.welcomeEmoji}>🎉</Text>
          <Text style={styles.title}>Welcome!</Text>
          <Text style={styles.subtitle}>You're successfully authenticated</Text>
        </View>

        <View style={styles.userInfoCard}>
          <Text style={styles.cardTitle}>User Information</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>User ID:</Text>
            <Text style={styles.infoValue} numberOfLines={2}>
              {userInfo?.userId}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email:</Text>
            <Text style={styles.infoValue}>{userInfo?.username}</Text>
          </View>
        </View>

        <View style={styles.phaseCard}>
          <Text style={styles.phaseTitle}>🚀 Phase 1 Complete!</Text>
          <View style={styles.featureList}>
            <Text style={styles.featureItem}>✅ AWS Cognito authentication</Text>
            <Text style={styles.featureItem}>✅ Email verification flow</Text>
            <Text style={styles.featureItem}>✅ Secure login/logout</Text>
            <Text style={styles.featureItem}>✅ Expo Router navigation</Text>
            <Text style={styles.featureItem}>✅ Safe Area handling</Text>
          </View>
          <View style={styles.nextPhase}>
            <Text style={styles.nextPhaseTitle}>🔄 Next: Phase 2</Text>
            <Text style={styles.nextPhaseText}>DynamoDB integration with user profiles</Text>
          </View>
        </View>

      </ScrollView>
      
      <View style={styles.footer}>
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Text style={styles.signOutButtonText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#666',
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    paddingTop: 20,
  },
  welcomeEmoji: {
    fontSize: 50,
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
  },
  userInfoCard: {
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 16,
    textAlign: 'center',
  },
  infoRow: {
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: '#1a1a1a',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    backgroundColor: '#f8f9fa',
    padding: 8,
    borderRadius: 6,
    overflow: 'hidden',
  },
  phaseCard: {
    backgroundColor: '#e8f5e8',
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#c3e6c3',
  },
  phaseTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2d5a2d',
    marginBottom: 16,
    textAlign: 'center',
  },
  featureList: {
    marginBottom: 20,
  },
  featureItem: {
    fontSize: 16,
    color: '#2d5a2d',
    marginBottom: 8,
    lineHeight: 22,
  },
  nextPhase: {
    borderTopWidth: 1,
    borderTopColor: '#c3e6c3',
    paddingTop: 16,
  },
  nextPhaseTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2d5a2d',
    marginBottom: 4,
  },
  nextPhaseText: {
    fontSize: 14,
    color: '#2d5a2d',
  },
  footer: {
    padding: 20,
    paddingBottom: 10,
  },
  signOutButton: {
    backgroundColor: '#FF3B30',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#FF3B30',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  signOutButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
});
