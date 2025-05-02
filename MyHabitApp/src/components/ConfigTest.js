import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { validateConfigurationSetup } from '../utils/configTester';
import { getEnvironment } from '../utils/environment';
import { getConfig } from '../constants/config';

export const ConfigTest = () => {
  useEffect(() => {
    validateConfigurationSetup();
  }, []);

  const env = getEnvironment();
  const config = getConfig();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Configuration Test</Text>
      <Text style={styles.text}>Environment: {env}</Text>
      <Text style={styles.text}>API URL: {config.apiUrl}</Text>
      <Text style={styles.text}>Analytics: {config.enableAnalytics ? 'Enabled' : 'Disabled'}</Text>
      <Text style={styles.text}>Push Notifications: {config.enablePushNotifications ? 'Enabled' : 'Disabled'}</Text>
      <Text style={styles.text}>Log Level: {config.logLevel || 'info'}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    margin: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  text: {
    fontSize: 14,
    marginBottom: 5,
  },
}); 