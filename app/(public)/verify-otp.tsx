import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView, TextInput, Pressable, NativeSyntheticEvent, TextInputKeyPressEventData } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { router, useLocalSearchParams } from 'expo-router';
import { confirmSignUp } from 'aws-amplify/auth';

// Centralized OTP verification page for both signup and forgot-password
// Expects params: mode = 'signup' | 'reset', email: string

export default function VerifyOTPScreen() {
  const params = useLocalSearchParams<{ mode?: string; email?: string }>();
  const mode = params.mode === 'reset' ? 'reset' : 'signup';
  const email = (params.email || '').toString();
  const [code, setCode] = useState('');
  const inputRef = useRef<TextInput>(null);
  const CODE_LENGTH = 6;

  function focusInput() {
    inputRef.current?.focus();
  }

  function onChangeCodeText(text: string) {
    const sanitized = text.replace(/\D/g, '').slice(0, CODE_LENGTH);
    setCode(sanitized);
  }

  function onKeyPress(e: NativeSyntheticEvent<TextInputKeyPressEventData>) {
    if (e.nativeEvent.key === 'Backspace' && code.length > 0) {
      setCode(code.slice(0, code.length - 1));
    }
  }
  const [isLoading, setIsLoading] = useState(false);

  const handleVerify = async () => {
    if (!email || !code.trim()) {
      Alert.alert('Error', 'Please enter the code');
      return;
    }
    setIsLoading(true);
    try {
      if (mode === 'signup') {
        await confirmSignUp({ username: email.trim(), confirmationCode: code.trim() });
        Alert.alert('Success', 'Your account has been verified', [
          { text: 'OK', onPress: () => router.replace('/(public)/signin') },
        ]);
      } else {
        // For reset flow, after verifying code we navigate to reset-password screen
        // We'll pass the email and code forward
        router.replace({ pathname: '/(public)/reset-password', params: { email, code: code.trim() } });
      }
    } catch (error: any) {
      let msg = 'Invalid or expired code';
      if (error?.name === 'CodeMismatchException') msg = 'Invalid verification code';
      if (error?.name === 'ExpiredCodeException') msg = 'Verification code has expired';
      if (error?.message) msg = error.message;
      Alert.alert('Verification Failed', msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView style={styles.keyboardView} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Text style={styles.title}>{mode === 'signup' ? 'Verify Email' : 'Enter Reset Code'}</Text>
            <Text style={styles.subtitle}>We sent a code to {email}</Text>
          </View>

          <View style={styles.otpWrapper}>
            <Pressable onPress={focusInput} accessibilityRole="button" accessibilityLabel="Enter verification code">
              <View style={styles.otpBoxes}>
                {Array.from({ length: CODE_LENGTH }).map((_, i) => (
                  <View key={i} style={[styles.otpBox, i === Math.min(code.length, CODE_LENGTH - 1) ? styles.otpActive : undefined]}>
                    <Text style={styles.otpChar}>{code[i] ?? ''}</Text>
                  </View>
                ))}
              </View>
            </Pressable>
            <TextInput
              ref={inputRef}
              style={styles.hiddenInput}
              value={code}
              onChangeText={onChangeCodeText}
              onKeyPress={onKeyPress}
              keyboardType="number-pad"
              textContentType="oneTimeCode"
              autoFocus
              maxLength={CODE_LENGTH}
              accessible={false}
              importantForAccessibility="no"
            />
          </View>

          <TouchableOpacity style={[styles.verifyButton, isLoading && styles.buttonDisabled]} onPress={handleVerify} disabled={isLoading}>
            <Text style={styles.verifyButtonText}>{isLoading ? 'Verifying...' : 'Verify'}</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  keyboardView: { flex: 1 },
  scrollContent: { flexGrow: 1, padding: 20 },
  header: { alignItems: 'center', marginTop: 40, marginBottom: 40 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#666', textAlign: 'center' },
  otpWrapper: { alignItems: 'center', marginVertical: 20 },
  otpBoxes: { flexDirection: 'row', gap: 10 },
  otpBox: { width: 44, height: 52, borderRadius: 10, borderWidth: 1, borderColor: '#E5E7EB', backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  otpActive: { borderColor: '#111827' },
  otpChar: { fontSize: 18, fontWeight: '600', color: '#111827' },
  verifyButton: { backgroundColor: '#111827', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 20 },
  verifyButtonText: { color: 'white', fontSize: 16, fontWeight: '600' },
  buttonDisabled: { opacity: 0.6 },
  hiddenInput: { position: 'absolute', opacity: 0, width: 1, height: 1 },
});


