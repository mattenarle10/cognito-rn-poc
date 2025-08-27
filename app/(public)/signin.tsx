import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { signIn, fetchAuthSession } from 'aws-amplify/auth';
import { amplifyConfig } from '../../src/lib/amplify-config';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';


export default function SignInScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email');
      return false;
    }
    if (!email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email');
      return false;
    }
    if (!password.trim()) {
      Alert.alert('Error', 'Please enter your password');
      return false;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return false;
    }
    return true;
  };

  const handleSignIn = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await signIn({
        username: email.trim(),
        password: password,
        options: { authFlowType: 'USER_PASSWORD_AUTH' }
      });

      // Success - navigate to app
      router.replace('/(app)/home');
    } catch (error: any) {
      // Handle specific error cases
      let errorMessage = 'An error occurred during sign in';
      if (error?.name === 'NotAuthorizedException') {
        errorMessage = 'Invalid email or password';
      } else if (error?.name === 'UserNotConfirmedException') {
        errorMessage = 'Please check your email and confirm your account';
      } else if (error?.name === 'UserNotFoundException') {
        errorMessage = 'No account found with this email. Please sign up first.';
      } else if (error?.message) {
        errorMessage = error.message as string;
      }
      
      const errorCode = error?.name ? ` (${error.name})` : '';
      Alert.alert('Sign In Failed', errorMessage + errorCode);
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToSignUp = () => {
    router.push('/(public)/signup');
  };

  const navigateToForgotPassword = () => {
    router.push('/(public)/forgot-password');
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      // First attempt to clear browser state to force account selection
      try {
        console.log('🧹 Attempting to clear WebBrowser state');
        await WebBrowser.warmUpAsync();
        await WebBrowser.coolDownAsync();
      } catch (clearError) {
        console.log('⚠️ Could not clear WebBrowser state', clearError);
      }

      // Extract configuration from amplifyConfig
      const cognitoConfig = amplifyConfig.Auth.Cognito;
      const domain = cognitoConfig.loginWith.oauth.domain;
      const clientId = cognitoConfig.userPoolClientId;
      
      // MUST exactly match one of the URIs registered in Cognito app client settings
      const redirectUri = 'cognito-rn-poc://';
      
      // Generate unique state to prevent CSRF attacks and help with cache busting
      const state = `${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
      
      // Enhanced parameters that will force Google account selection
      const params = new URLSearchParams();
      params.append('identity_provider', 'Google');
      params.append('redirect_uri', redirectUri);
      params.append('response_type', 'code');
      params.append('client_id', clientId || '');
      params.append('scope', 'email openid profile');
      params.append('state', state);
      
      // Critical parameters to force account selection
      params.append('prompt', 'select_account');
      params.append('max_age', '0'); // Force re-authentication
      
      // Add a timestamp to bypass caching
      params.append('cache_buster', Date.now().toString());
      
      // Create the final OAuth URL with all parameters
      const oauthUrl = `https://${domain}/oauth2/authorize?${params.toString()}`;
      
      console.log('🔍 Starting OAuth flow with direct URL');
      console.log('🔗 OAuth URL:', oauthUrl);
      
      // Set up a temporary deep link handler for the auth redirect
      console.log('🔄 Setting up deep link handler');
      const linkingSubscription = Linking.addEventListener('url', (event: {url: string}) => {
        const url = event.url;
        console.log('🔄 URL event received:', url);
        
        if (url && url.includes('code=')) {
          console.log('✓ Auth code found in redirect URL');
          // Extract auth code for debugging
          try {
            const code = new URL(url).searchParams.get('code');
            console.log('💼 Auth code length:', code ? code.length : 'no code found');
          } catch (e) {
            console.log('⚠️ Error parsing URL:', e);
          }
          
          // Force auth session refresh and navigate to home
          setTimeout(async () => {
            try {
              console.log('🔄 Forcing auth session refresh');
              await fetchAuthSession({ forceRefresh: true });
              console.log('🔄 Navigating to home');
              router.replace('/(app)/home');
            } catch (error) {
              console.log('⚠️ Error refreshing session:', error);
            }
          }, 800);
        }
      });
      
      try {
        // Clear any previous sessions first
        await WebBrowser.maybeCompleteAuthSession();
        
        console.log('🔍 Opening browser for auth');
        // Try to open auth URL with system browser for most reliable experience
        if (Platform.OS === 'android') {
          await Linking.openURL(oauthUrl);
        } else {
          // On iOS, try WebBrowser component first for better UX
          try {
            await WebBrowser.openAuthSessionAsync(oauthUrl, redirectUri);
          } catch (error) {
            console.log('⚠️ WebBrowser error, falling back to system browser:', error);
            await Linking.openURL(oauthUrl);
          }
        }
      } catch (error) {
        console.log('⛔ Error opening browser:', error);
        Alert.alert('Error', 'Could not open browser for authentication');
      } finally {
        // Always clean up the subscription to avoid memory leaks
        linkingSubscription.remove();
      }
      
      // Note: The app will be redirected back via deep link
      // The redirect handling is done in app/index.tsx
    } catch (error) {
      console.error('Google sign in error:', error);
      Alert.alert('Error', 'Failed to sign in with Google');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to your account</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
              />
            </View>

            <TouchableOpacity
              style={styles.forgotPasswordButton}
              onPress={navigateToForgotPassword}
              disabled={isLoading}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.signInButton, isLoading && styles.buttonDisabled]}
              onPress={handleSignIn}
              disabled={isLoading}
            >
              <Text style={styles.signInButtonText}>
                {isLoading ? 'Signing In...' : 'Sign In'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.googleButton, isLoading && styles.buttonDisabled]}
              onPress={handleGoogleSignIn}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#4285F4" size="small" style={styles.googleButtonIcon} />
              ) : (
                <View style={styles.googleIconContainer}>
                  <Text style={styles.googleIcon}>G</Text>
                </View>
              )}
              <Text style={styles.googleButtonText}>Continue with Google</Text>
            </TouchableOpacity>

            <View style={styles.signUpContainer}>
              <Text style={styles.signUpText}>Don't have an account? </Text>
              <TouchableOpacity onPress={navigateToSignUp} disabled={isLoading}>
                <Text style={styles.signUpLink}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  form: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e1e5e9',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginBottom: 30,
  },
  forgotPasswordText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '500',
  },
  signInButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#007AFF',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  signInButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  googleButton: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
  googleButtonText: {
    color: '#1a1a1a',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
  googleIconContainer: {
    width: 24,
    height: 24,
    backgroundColor: '#4285F4',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  googleIcon: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  googleButtonIcon: {
    marginRight: 12,
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  signUpText: {
    fontSize: 16,
    color: '#666',
  },
  signUpLink: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
});
