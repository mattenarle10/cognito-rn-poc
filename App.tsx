import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { Amplify } from 'aws-amplify';
import { amplifyConfig } from './src/config/amplify-config';

// Initialize Amplify
Amplify.configure(amplifyConfig);

export default function App() {
  return (
    <View style={styles.container}>
      <Text>Cognito Auth Setup Complete!</Text>
      <Text style={styles.subtitle}>Phase 3: Amplify Configured</Text>
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
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
  },
});
