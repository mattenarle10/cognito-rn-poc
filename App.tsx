import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native';
import { Amplify } from 'aws-amplify';
import { amplifyConfig } from './src/config/amplify-config';
import { signUp } from 'aws-amplify/auth';
import { useState } from 'react';

// Initialize Amplify
Amplify.configure(amplifyConfig);

export default function App() {
  const [connectionStatus, setConnectionStatus] = useState<string>('Not tested');
  const [testing, setTesting] = useState(false);

  const testConnection = async () => {
    setTesting(true);
    setConnectionStatus('Testing...');
    
    try {
      // Try to create a test signup (this will fail but confirm connection)
      await signUp({
        username: 'test@example.com',
        password: 'TestPassword123',
        options: {
          userAttributes: {
            email: 'test@example.com',
          }
        }
      });
      setConnectionStatus('✅ Connected to Cognito!');
    } catch (error: any) {
      // We expect this to fail, but different errors tell us about connection
      if (error.name === 'UsernameExistsException' || 
          error.name === 'InvalidParameterException' ||
          error.message.includes('User')) {
        setConnectionStatus('✅ Connected to Cognito!');
      } else {
        setConnectionStatus(`❌ Connection Error: ${error.message}`);
      }
    } finally {
      setTesting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔐 Cognito Connection Test</Text>
      <Text style={styles.subtitle}>Phase 3.5: Testing Real AWS Cognito</Text>
      
      <View style={styles.configInfo}>
        <Text style={styles.configLabel}>Region:</Text>
        <Text style={styles.configValue}>{process.env.EXPO_PUBLIC_AWS_REGION}</Text>
        
        <Text style={styles.configLabel}>User Pool:</Text>
        <Text style={styles.configValue}>{process.env.EXPO_PUBLIC_USER_POOL_ID}</Text>
      </View>

      <TouchableOpacity 
        style={styles.testButton} 
        onPress={testConnection}
        disabled={testing}
      >
        <Text style={styles.testButtonText}>
          {testing ? 'Testing...' : 'Test Cognito Connection'}
        </Text>
      </TouchableOpacity>

      <Text style={[
        styles.status, 
        connectionStatus.includes('✅') ? styles.success : 
        connectionStatus.includes('❌') ? styles.error : 
        styles.neutral
      ]}>
        Status: {connectionStatus}
      </Text>

      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
  },
  configInfo: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 10,
    marginBottom: 30,
    width: '100%',
  },
  configLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 5,
  },
  configValue: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
    fontFamily: 'monospace',
  },
  testButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  testButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  status: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  success: {
    color: '#34C759',
  },
  error: {
    color: '#FF3B30',
  },
  neutral: {
    color: '#666',
  },
});
